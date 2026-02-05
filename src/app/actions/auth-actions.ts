"use server";

import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { getFamilyStudentsAction } from "./parent-actions";

// --- 1. Send OTP ---
export async function sendOtpAction(mobile: string, type: "signup" | "login" = "signup") {
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
        return { success: false, error: "Please enter a valid 10-digit mobile number" };
    }

    try {
        // CHECK USER EXISTENCE
        const existingUser = await prisma.user.findUnique({
            where: { mobile }
        });

        if (type === "signup" && existingUser) {
            return {
                success: false,
                error: "User already registered with this mobile number. Please login instead."
            };
        }

        if (type === "login" && !existingUser) {
            return {
                success: false,
                error: "No account found with this mobile number. Please sign up first."
            };
        }

        const code = String(randomInt(1000, 9999));
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // Invalidate old OTPs
        await prisma.otp.deleteMany({
            where: { mobile }
        });

        await prisma.otp.create({
            data: {
                mobile,
                code,
                expiresAt
            }
        });

        // SIMULATE SMS SENDING
        console.log(`[SMS SERVICE] OTP for ${mobile} is ${code}`);

        return { success: true };
    } catch (error) {
        console.error("Send OTP Error", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to send OTP" };
    }
}

// --- 2. Verify OTP ---
export async function verifyOtpAction(mobile: string, code: string) {
    try {
        // Backdoor for testing
        if (code === "1234") return { success: true };

        const record = await prisma.otp.findFirst({
            where: {
                mobile,
                code,
                verified: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) return { success: false, error: "Invalid or expired OTP" };

        // Mark verified
        await prisma.otp.update({
            where: { id: record.id },
            data: { verified: true }
        });

        return { success: true };
    } catch (error) {
        console.error("Verify OTP Error", error);
        return { success: false, error: "Verification failed" };
    }
}

// --- 3. Register School & User ---
export async function registerSchoolAction(data: {
    firstName: string;
    lastName: string;
    schoolName: string;
    mobile: string;
    planId: string;
}) {
    try {
        // Validation
        if (!data.mobile) return { success: false, error: "Mobile number is required" };

        // Global Phone Uniqueness Check
        const { validatePhoneUniqueness } = await import("./phone-validation");
        const phoneCheck = await validatePhoneUniqueness(data.mobile);
        if (!phoneCheck.isValid) {
            return { success: false, error: phoneCheck.error };
        }

        // Generate Slug
        const baseSlug = data.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || "school";
        let finalSlug = baseSlug;

        // Ensure unique slug
        let counter = 1;
        while (await prisma.school.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${baseSlug}-${randomInt(100, 999)}`;
            counter++;
            if (counter > 10) break; // safety break
        }

        // Transaction to create everything
        const result = await prisma.$transaction(async (tx) => {
            const school = await tx.school.create({
                data: {
                    name: data.schoolName,
                    slug: finalSlug
                }
            });

            const user = await tx.user.create({
                data: {
                    mobile: data.mobile,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    schoolId: school.id,
                    role: "ADMIN"
                }
            });

            // Create Subscription
            await tx.subscription.create({
                data: {
                    schoolId: school.id,
                    planId: data.planId,
                    status: "TRIAL",
                    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial default
                }
            });

            return { school, user };
        });

        // Set session cookie for the newly registered user
        const { setUserSessionAction } = await import("./session-actions");
        await setUserSessionAction(result.user.id);

        revalidatePath("/admin/tenants");
        return { success: true, slug: result.school.slug };

    } catch (error) {
        console.error("Registration Error", error);
        return { success: false, error: "Failed to create account. Please try again." };
    }
}

// --- 4. Login with Mobile (Generic) ---
export async function loginWithMobileAction(mobile: string) {
    const user = await prisma.user.findUnique({
        where: { mobile },
        include: { school: true }
    });

    if (!user) return { success: false, error: "User not found" };

    // If Admin/Staff, they must have a school
    if ((user.role === "ADMIN" || user.role === "STAFF") && !user.school) {
        return { success: false, error: "No school associated with this account" };
    }

    // Set session cookie
    const { setUserSessionAction } = await import("./session-actions");
    await setUserSessionAction(user.id);

    // Redirect based on role
    if (user.role === "PARENT") {
        if (!user.school) {
            return { success: false, error: "Parent credentials valid but no school associated." };
        }
        return { success: true, redirectUrl: `/${user.school.slug}/parent` };
    }

    // Default for Admin/Staff
    let dashboardUrl = `/s/${user.school?.slug}/dashboard`;

    if (user.role === "STAFF") {
        dashboardUrl = `/s/${user.school?.slug}/teacher/${user.id}/dashboard`;
    }

    return { success: true, redirectUrl: dashboardUrl };
}

// --- 5. Login Parent Global (Strict) ---
export async function loginParentGlobalAction(mobile: string) {
    const user = await prisma.user.findUnique({
        where: { mobile },
        include: { school: true }
    });

    if (!user) return { success: false, error: "User not found" };

    if (user.role !== "PARENT" && user.role !== "ADMIN") {
        return { success: false, error: "Access Denied. This login is for Parents only." };
    }

    if (!user.school) {
        return { success: false, error: "Parent credentials valid but no school associated." };
    }

    // Set session cookie
    const { setUserSessionAction } = await import("./session-actions");
    await setUserSessionAction(user.id);

    // Optimized Redirection: Direct to student page if only one exists
    try {
        const familyRes = await getFamilyStudentsAction(mobile);
        if (familyRes.success && familyRes.students) {
            const students = familyRes.students;
            if (students.length === 1 && students[0].type === "STUDENT") {
                return {
                    success: true,
                    redirectUrl: `/${user.school.slug}/parent/${user.id}/${students[0].id}?phone=${mobile}`
                };
            }
        }
    } catch (e) {
        console.error("Login redirect optimization failed", e);
    }

    return { success: true, redirectUrl: `/${user.school.slug}/parent` };
}
