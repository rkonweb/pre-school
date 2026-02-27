"use server";

import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";

/**
 * Sends OTP to a mobile number for Application tracking/submission.
 * Unlike the standard Parent login, this ALLOWS new numbers not in the DB.
 */
export async function sendApplicationOTPAction(slug: string, phone: string) {
    try {
        const cleanPhone = String(phone).replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            return { success: false, error: "Invalid phone number." };
        }

        // Verify school logic if needed
        const school = await prisma.school.findUnique({ where: { slug }, select: { id: true } });
        if (!school) return { success: false, error: "Invalid school URL." };

        // 1. RATE LIMITING (Max 3 OTPs in 10 minutes)
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentAttempts = await (prisma as any).otp.count({
            where: {
                mobile: phone,
                createdAt: { gt: tenMinsAgo }
            }
        });

        if (recentAttempts >= 3) {
            return { success: false, error: "Too many attempts. Please wait 10 minutes." };
        }

        // 2. Generate Secure 4-digit OTP (Defaulting to 1234 for testing)
        const otpCode = process.env.NODE_ENV === 'production' ? randomInt(1000, 10000).toString() : "1234";
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 3. Store OTP
        await (prisma as any).otp.create({
            data: {
                mobile: phone,
                code: otpCode,
                expiresAt,
                verified: false
            }
        });

        console.log(`[PUBLIC_AUTH] OTP sent to ${phone.slice(0, 4)}...`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV ONLY] OTP: ${otpCode}`);
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Verifies OTP for the application portal.
 * DOES NOT create a persistent Parent session cookie by default to avoid mixing concerns,
 * but instead returns a temporary token/verification status.
 */
export async function verifyApplicationOTPAction(slug: string, phone: string, otp: string) {
    try {
        const record = await (prisma as any).otp.findFirst({
            where: {
                mobile: phone,
                code: otp,
                verified: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            return { success: false, error: "Invalid or expired OTP" };
        }

        // Mark OTP as verified
        await (prisma as any).otp.update({
            where: { id: record.id },
            data: { verified: true }
        });

        // Check if there are ALREADY applications for this number
        const cleanPhone = String(phone).replace(/\D/g, "");
        const existingAdmissions = await (prisma as any).admission.findMany({
            where: {
                school: { slug },
                OR: [
                    { parentPhone: { contains: cleanPhone.slice(-5) } },
                    { fatherPhone: { contains: cleanPhone.slice(-5) } },
                    { motherPhone: { contains: cleanPhone.slice(-5) } }
                ]
            }
        });

        // We use a simple token for now, in a real app this would be a JWT or signed cookie
        // For this demo, we'll just trust the subsequent calls if they pass the phone number 
        // that was just verified in the client state. 
        // In highly secure apps, we'd sign this phone number into an HttpOnly cookie.

        return {
            success: true,
            phone,
            hasExistingApplications: existingAdmissions.length > 0,
            admissions: existingAdmissions
        };
    } catch (error: any) {
        return { success: false, error: "Verification failed" };
    }
}

export async function submitPublicApplicationAction(slug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school) return { success: false, error: "School not found" };

        if (!data.firstName || !data.lastName || !data.primaryParentName || !data.primaryParentPhone) {
            return { success: false, error: "Missing required fields." };
        }

        // 2. Insert Admission
        const result = await prisma.$transaction(async (tx) => {
            const admission = await (tx as any).admission.create({
                data: {
                    schoolId: school.id,
                    studentName: (`${data.firstName} ${data.lastName}`).trim(),
                    studentAge: typeof data.age === 'number' ? data.age : null,
                    enrolledGrade: data.program || "DAYCARE",
                    parentName: data.primaryParentName,
                    parentPhone: data.primaryParentPhone,
                    parentEmail: data.primaryParentEmail || null,
                    relationship: "Parent", // Defaulting, can be expanded
                    stage: "INQUIRY",
                    source: "WEBSITE", // Explicitly tag as public submission
                    dateReceived: new Date(),
                    city: data.city || null,
                    address: data.address || null,
                    zip: data.zipCode || null,
                }
            });

            // 3. Log System Interaction
            await tx.leadInteraction.create({
                data: {
                    admissionId: admission.id,
                    type: "AUTOMATION",
                    content: "Application submitted via Public Portal."
                }
            });

            // Calculate Initial Propensity Score (Assuming calculateLeadScore logic handles new leads)
            // We import dynamically to avoid circular dependencies if any
            const { calculateLeadScore } = await import("./lead-scoring");
            const initialScore = await calculateLeadScore(admission.id);

            await (tx as any).admission.update({
                where: { id: admission.id },
                data: { score: initialScore }
            });

            return admission;
        });

        return { success: true, admissionId: result.id };
    } catch (error: any) {
        console.error("Public Form Submission Error:", error);
        return { success: false, error: error.message || "Submission failed" };
    }
}

export async function getPublicApplicationStatusAction(slug: string, phone: string) {
    try {
        const cleanPhone = String(phone).replace(/\D/g, "");
        const existingAdmissions = await (prisma as any).admission.findMany({
            where: {
                school: { slug },
                OR: [
                    { parentPhone: { contains: cleanPhone.slice(-5) } },
                    { fatherPhone: { contains: cleanPhone.slice(-5) } },
                    { motherPhone: { contains: cleanPhone.slice(-5) } }
                ]
            },
            orderBy: { dateReceived: 'desc' },
            select: {
                id: true,
                studentName: true,
                enrolledGrade: true,
                stage: true,
            }
        });

        return { success: true, admissions: existingAdmissions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
