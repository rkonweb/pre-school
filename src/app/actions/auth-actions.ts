"use server";

import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getFamilyStudentsAction } from "./parent-actions";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendOtpSchema, verifyOtpSchema, registerSchoolSchema, loginSchema } from "@/lib/schemas/auth-schemas";
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger";

// --- 1. Send OTP ---
export async function sendOtpAction(mobile: string, type: "signup" | "login" | "school-login" | "parent-login" = "signup") {
    // 1. Zod Validation
    const parsed = sendOtpSchema.safeParse({ mobile, type });
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    // 2. Rate Limiting (3 OTPs per minute per IP)
    const ip = await getClientIp();
    const limit = await rateLimit(`otp-req:${ip}`, 3, 60 * 1000);
    if (!limit.success) {
        return { success: false, error: "Too many OTP requests. Please try again in 1 minute." };
    }

    const { mobile: validatedMobile } = parsed.data;

    try {
        // Robust Phone Number Normalization
        const cleanMobile = validatedMobile.replace(/\D/g, ""); // 9876543210
        const mobilePossibilities = [
            validatedMobile,                    // +919876543210
            cleanMobile,                        // 9876543210
            `+91${cleanMobile.slice(-10)}`,     // +919876543210 (ensure +91)
            cleanMobile.slice(-10)              // 9876543210 (ensure 10 digits)
        ];

        // Remove duplicates
        const uniqueMobiles = Array.from(new Set(mobilePossibilities));

        // CHECK USER EXISTENCE (Robust)
        const existingUser = await prisma.user.findFirst({
            where: { mobile: { in: uniqueMobiles } }
        });

        // ---------------------------------------------------------
        // A. SIGNUP FLOW
        // ---------------------------------------------------------
        if (type === "signup" && existingUser) {
            // Allow re-signup if user is still in SIGNUP_PENDING status
            if ((existingUser as any).status !== "SIGNUP_PENDING") {
                return {
                    success: false,
                    error: "User already registered with this mobile number. Please login instead."
                };
            }
            // SIGNUP_PENDING user — allow them to continue signup
        }

        // ---------------------------------------------------------
        // B. SCHOOL LOGIN (STRICT: ADMIN/STAFF ONLY)
        // ---------------------------------------------------------
        if (type === "school-login") {
            if (!existingUser) {
                return {
                    success: false,
                    error: "Access Denied. No staff account found for this number."
                };
            }

            // Allow only ADMIN or STAFF
            if (existingUser.role !== "ADMIN" && existingUser.role !== "STAFF") {
                return {
                    success: false,
                    error: "Unauthorized. This portal is for School Staff only."
                };
            }
        }

        // ---------------------------------------------------------
        // C. PARENT LOGIN
        // ---------------------------------------------------------
        if (type === "parent-login") {
            // Case 1: User Exists
            if (existingUser) {
                // STRICT: Allow ONLY PARENT role. Block ADMIN and STAFF.
                if (existingUser.role !== "PARENT") {
                    return {
                        success: false,
                        error: "Unauthorized. This portal is for Parents only."
                    };
                }
            }
            // Case 2: User Doesn't Exist -> Check Records (Auto-Onboarding)
            else {
                const cleanMobile = validatedMobile.replace(/\D/g, "");

                const parentRecord = await prisma.student.findFirst({
                    where: {
                        OR: [
                            { parentMobile: { contains: cleanMobile.slice(-10) } },
                            { emergencyContactPhone: { contains: cleanMobile.slice(-10) } }
                        ]
                    }
                });

                const admissionRecord = await prisma.admission.findFirst({
                    where: {
                        OR: [
                            { fatherPhone: { contains: cleanMobile.slice(-10) } },
                            { motherPhone: { contains: cleanMobile.slice(-10) } },
                            { parentPhone: { contains: cleanMobile.slice(-10) } }
                        ]
                    }
                });

                if (!parentRecord && !admissionRecord) {
                    return {
                        success: false,
                        error: "Parent account not found. Please contact the school."
                    };
                }
            }
        }

        // ---------------------------------------------------------
        // D. GENERIC LOGIN (Fallback / Legacy)
        // ---------------------------------------------------------
        if (type === "login" && !existingUser) {
            // Check if they are a parent in student/admission records
            const cleanMobile = validatedMobile.replace(/\D/g, "");

            const parentRecord = await prisma.student.findFirst({
                where: {
                    OR: [
                        { parentMobile: { contains: cleanMobile.slice(-10) } },
                        { emergencyContactPhone: { contains: cleanMobile.slice(-10) } }
                    ]
                }
            });

            const admissionRecord = await prisma.admission.findFirst({
                where: {
                    OR: [
                        { fatherPhone: { contains: cleanMobile.slice(-10) } },
                        { motherPhone: { contains: cleanMobile.slice(-10) } },
                        { parentPhone: { contains: cleanMobile.slice(-10) } }
                    ]
                }
            });

            if (!parentRecord && !admissionRecord) {
                return {
                    success: false,
                    error: "No account found with this mobile number. Please sign up first."
                };
            }
        }

        const code = process.env.NODE_ENV === "production"
            ? randomInt(100000, 999999).toString()
            : "123456"; // Always 123456 for testing purposes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // Invalidate old OTPs
        await prisma.otp.deleteMany({
            where: { mobile: validatedMobile }
        });

        await prisma.otp.create({
            data: {
                mobile: validatedMobile,
                code,
                expiresAt
            }
        });

        // SIMULATE SMS SENDING
        console.log(`[SMS SERVICE] OTP for ${validatedMobile} is ${code}`);

        return { success: true };
    } catch (error) {
        console.error("Send OTP Error", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to send OTP" };
    }
}

// --- 2. Verify OTP ---
export async function verifyOtpAction(mobile: string, code: string, context: "signup" | "login" = "login") {
    // 1. Zod Validation
    const parsed = verifyOtpSchema.safeParse({ mobile, code });
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    // 2. Rate Limiting (5 attempts per minute per IP)
    const ip = await getClientIp();
    const limit = await rateLimit(`otp-verify:${ip}`, 5, 60 * 1000);
    if (!limit.success) {
        return { success: false, error: "Too many attempts. Please try again later." };
    }

    try {
        // BACKDOOR FOR TESTING (DISABLED IN PRODUCTION)
        const isBackdoor = code === "123456" && process.env.NODE_ENV !== "production";

        if (!isBackdoor) {
            const record = await prisma.otp.findFirst({
                where: {
                    mobile: parsed.data.mobile,
                    code: parsed.data.code,
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
        }

        // For SIGNUP context: Create or find pending user
        if (context === "signup") {
            const existingUser = await prisma.user.findUnique({
                where: { mobile: parsed.data.mobile }
            });

            if (existingUser && (existingUser as any).status === "SIGNUP_PENDING") {
                // Returning user — resume from where they left off
                return {
                    success: true,
                    signupStep: (existingUser as any).signupStep || "SELECT_PLAN",
                    userId: existingUser.id
                };
            }

            if (!existingUser) {
                // Create new pending user
                const newUser = await prisma.user.create({
                    data: {
                        mobile: parsed.data.mobile,
                        status: "SIGNUP_PENDING",
                        signupStep: "SELECT_PLAN",
                        role: "ADMIN"
                    } as any
                });
                return {
                    success: true,
                    signupStep: "SELECT_PLAN",
                    userId: newUser.id
                };
            }

            // User exists but is fully registered (status != SIGNUP_PENDING)
            // This shouldn't normally happen via signup flow, but handle gracefully
            return { success: true, signupStep: "COMPLETED" };
        }

        // Automatic Parent Onboarding
        if (context === "login") {
            const existingUser = await prisma.user.findUnique({
                where: { mobile: parsed.data.mobile }
            });

            if (!existingUser) {
                const cleanMobile = parsed.data.mobile.replace(/\D/g, "");
                // Find parent link
                const parentLink = await prisma.student.findFirst({
                    where: {
                        OR: [
                            { parentMobile: { contains: cleanMobile.slice(-10) } },
                            { emergencyContactPhone: { contains: cleanMobile.slice(-10) } }
                        ]
                    }
                }) || await prisma.admission.findFirst({
                    where: {
                        OR: [
                            { fatherPhone: { contains: cleanMobile.slice(-10) } },
                            { motherPhone: { contains: cleanMobile.slice(-10) } },
                            { parentPhone: { contains: cleanMobile.slice(-10) } }
                        ]
                    }
                });

                if (parentLink) {
                    await prisma.user.create({
                        data: {
                            mobile: parsed.data.mobile,
                            firstName: "Parent", // Default naming
                            role: "PARENT",
                            schoolId: parentLink.schoolId,
                            status: "ACTIVE"
                        } as any
                    });
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Verify OTP Error", error);
        return { success: false, error: "Verification failed" };
    }
}

// --- 2b. Update Signup Step (track progress) ---
export async function updateSignupStepAction(mobile: string, step: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { mobile }
        });

        if (!user || (user as any).status !== "SIGNUP_PENDING") {
            return { success: false, error: "No pending signup found" };
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { signupStep: step } as any
        });

        return { success: true };
    } catch (error) {
        console.error("Update Signup Step Error", error);
        return { success: false, error: "Failed to update signup progress" };
    }
}

// --- 3. Register School & User ---
export async function registerSchoolAction(data: {
    firstName: string;
    lastName: string;
    schoolName: string;
    mobile: string;
    planId: string;
    city?: string;
}) {
    // 1. Zod Validation
    const parsed = registerSchoolSchema.safeParse(data);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    // 2. Rate Limiting (Creation is heavy, stricter global limit per IP)
    const ip = await getClientIp();
    const limit = await rateLimit(`register:${ip}`, 2, 60 * 60 * 1000); // 2 registrations per hour
    if (!limit.success) {
        return { success: false, error: "Registration limit reached. Please contact support if you need more." };
    }

    try {
        const validatedData = parsed.data;

        // Check if there's an existing SIGNUP_PENDING user for this mobile
        const existingUser = await prisma.user.findUnique({
            where: { mobile: validatedData.mobile }
        });

        // Block if user is fully registered (not pending)
        if (existingUser && (existingUser as any).status !== "SIGNUP_PENDING") {
            return { success: false, error: "An account with this phone number already exists. Please login instead." };
        }

        // Generate Slug
        const baseSlug = validatedData.schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || "school";
        let finalSlug = baseSlug;

        // Ensure unique slug
        let counter = 1;
        while (await prisma.school.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${baseSlug}-${randomInt(100, 999)}`;
            counter++;
            if (counter > 10) break; // safety break
        }

        // Transaction to create school and update/promote existing pending user
        const result = await prisma.$transaction(async (tx) => {
            const school = await tx.school.create({
                data: {
                    name: validatedData.schoolName,
                    slug: finalSlug,
                    city: validatedData.city
                }
            });

            let user;
            if (existingUser) {
                // Update existing SIGNUP_PENDING user → promote to ACTIVE ADMIN
                user = await tx.user.update({
                    where: { id: existingUser.id },
                    data: {
                        firstName: validatedData.firstName,
                        lastName: validatedData.lastName,
                        schoolId: school.id,
                        role: "ADMIN",
                        status: "ACTIVE",
                        signupStep: null // Clear signup step — fully registered
                    } as any
                });
            } else {
                // Fallback: no pending user found (shouldn't happen with new flow)
                user = await tx.user.create({
                    data: {
                        mobile: validatedData.mobile,
                        firstName: validatedData.firstName,
                        lastName: validatedData.lastName,
                        schoolId: school.id,
                        role: "ADMIN"
                    }
                });
            }

            // Create Subscription
            await tx.subscription.create({
                data: {
                    schoolId: school.id,
                    planId: validatedData.planId,
                    status: "TRIAL",
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
                }
            });

            return { school, user };
        });

        await logAuditEvent(
            AuditEventType.ADMIN_CREATED,
            `New School Registered: ${result.school.name} (${result.school.slug})`,
            { slug: result.school.slug },
            result.user.id,
            result.school.id
        );

        // Set session cookie for the newly registered user
        const { setUserSessionAction } = await import("./session-actions");
        await setUserSessionAction(result.user.id, result.school.slug);

        revalidatePath("/admin/tenants");
        return { success: true, slug: result.school.slug };

    } catch (error) {
        console.error("Registration Error", error);
        return { success: false, error: "Failed to create account. Please try again." };
    }
}

// --- 4. Login with Mobile (Generic) ---
export async function loginWithMobileAction(mobile: string) {
    // 1. Zod Validation
    const parsed = loginSchema.safeParse({ mobile });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // 2. Rate Limiting (10 logins per 15 mins)
    const ip = await getClientIp();
    const limit = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.success) {
        return { success: false, error: "Too many login attempts. Try again later." };
    }

    const user = await prisma.user.findUnique({
        where: { mobile: parsed.data.mobile },
        include: {
            school: {
                include: { subscription: true }
            }
        }
    });

    if (!user) {
        await logAuditEvent(AuditEventType.LOGIN_FAILURE, `Login failed: User not found`, { mobile });
        return { success: false, error: "User not found" };
    }

    // If user has an incomplete signup, redirect them to resume
    if ((user as any).status === "SIGNUP_PENDING") {
        const step = (user as any).signupStep || "SELECT_PLAN";
        const stepRouteMap: Record<string, string> = {
            "SELECT_PLAN": "/signup/select-plan",
            "FREE_TRIAL": "/signup/free-trial",
            "SCHOOL_SETUP": "/signup/setup",
            "LOADING": "/signup/loading"
        };
        return {
            success: true,
            redirectUrl: stepRouteMap[step] || "/signup/select-plan",
            signupPending: true
        };
    }

    // If Admin/Staff, they must have a school
    if ((user.role === "ADMIN" || user.role === "STAFF") && !user.school) {
        await logAuditEvent(AuditEventType.LOGIN_FAILURE, `Login failed: No school`, { userId: user.id });
        return { success: false, error: "No school associated with this account" };
    }

    // Check for Trial Expiration / Suspension
    if (user.school?.subscription) {
        const sub = user.school.subscription;
        const now = new Date();

        // Auto-suspend if trial expired
        if ((sub.status === "TRIAL" || sub.status === "ACTIVE") && sub.endDate && sub.endDate < now) {
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: "SUSPENDED" }
            });
            sub.status = "SUSPENDED"; // Update local reference
        }

        // Redirect if suspended
        if (sub.status === "SUSPENDED" || sub.status === "PAST_DUE") {
            // Set session so they can access the subscription page
            const { setUserSessionAction } = await import("./session-actions");
            await setUserSessionAction(user.id, user.school.slug);

            return {
                success: true,
                redirectUrl: "/subscription/plans",
                error: "Your subscription has expired. Please select a plan to continue."
            };
        }
    }

    // Set session cookie
    const { setUserSessionAction } = await import("./session-actions");
    await setUserSessionAction(user.id, user.school?.slug);

    await logAuditEvent(AuditEventType.LOGIN_SUCCESS, `User logged in`, { role: user.role }, user.id, user.schoolId || undefined);

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
    // 1. Zod Validation
    const parsed = loginSchema.safeParse({ mobile });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // 2. Rate Limit (Same as generic login)
    const ip = await getClientIp();
    const limit = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!limit.success) {
        return { success: false, error: "Too many login attempts. Try again later." };
    }

    const user = await prisma.user.findUnique({
        where: { mobile: parsed.data.mobile },
        include: { school: true }
    });

    if (!user) {
        await logAuditEvent(AuditEventType.LOGIN_FAILURE, `Parent Login failed: User not found`, { mobile });
        return { success: false, error: "User not found" };
    }

    if (user.role !== "PARENT" && user.role !== "ADMIN") {
        await logAuditEvent(AuditEventType.LOGIN_FAILURE, `Parent Login failed: Wrong role`, { userId: user.id, role: user.role });
        return { success: false, error: "Access Denied. This login is for Parents only." };
    }

    if (!user.school) {
        return { success: false, error: "Parent credentials valid but no school associated." };
    }

    // Set session cookie
    const { setUserSessionAction } = await import("./session-actions");
    await setUserSessionAction(user.id, user.school.slug);

    await logAuditEvent(AuditEventType.LOGIN_SUCCESS, `Parent logged in`, { role: user.role }, user.id, user.school.id);

    // Optimized Redirection: Direct to student page if only one exists
    try {
        const familyRes = await getFamilyStudentsAction(user.school.slug, mobile);
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

// --- 6. Sign Out ---
export async function signOutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/parent-login");
}
