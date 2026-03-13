"use server";

import { prisma } from "@/lib/prisma";
import { mobileVariants, normalizeEmail } from "@/lib/mobile-utils";


// ─── Phone Check ──────────────────────────────────────────────────────────────

/**
 * Check if a phone number exists anywhere in the system.
 * Phone numbers must be globally unique across all entities.
 */
export async function checkPhoneExistsAction(
    phone: string,
    excludeUserId?: string,
    excludeSchoolId?: string
): Promise<{ exists: boolean; location?: string; type?: 'user' | 'school' | 'admission' | 'student' | 'driver' | 'job_application'; entityId?: string }> {
    if (!phone || phone.trim() === '') {
        return { exists: false };
    }

    const variants = mobileVariants(phone);

    // Check in User table (mobile field) — search all format variants
    const userExists = await prisma.user.findFirst({
        where: {
            mobile: { in: variants },
            ...(excludeUserId ? { NOT: { id: excludeUserId } } : {})
        }
    });
    if (userExists) {
        return {
            exists: true,
            location: `Staff/Admin: ${userExists.firstName || ''} ${userExists.lastName || ''}`.trim() || 'Unknown user',
            type: 'user',
            entityId: userExists.id
        };
    }

    // Check in School table
    const schoolExists = await prisma.school.findFirst({
        where: {
            phone: { in: variants },
            ...(excludeSchoolId ? { NOT: { id: excludeSchoolId } } : {})
        }
    });
    if (schoolExists) {
        return { exists: true, location: `School: ${schoolExists.name}`, type: 'school', entityId: schoolExists.id };
    }

    // Check in Admission table (parent phones)
    const admissionExists = await prisma.admission.findFirst({
        where: {
            OR: [
                { parentPhone: { in: variants } },
                { secondaryPhone: { in: variants } },
                { fatherPhone: { in: variants } },
                { motherPhone: { in: variants } },
            ]
        }
    });
    if (admissionExists) {
        return {
            exists: true,
            location: `Admission Inquiry: ${admissionExists.studentName}`,
            type: 'admission',
            entityId: admissionExists.id
        };
    }

    // Check in Student table (parent mobile)
    const studentExists = await prisma.student.findFirst({
        where: {
            OR: [
                { parentMobile: { in: variants } },
                { emergencyContactPhone: { in: variants } },
            ]
        }
    });
    if (studentExists) {
        return { exists: true, location: `Student Contact: ${studentExists.firstName} ${studentExists.lastName}`, type: 'student', entityId: studentExists.id };
    }

    // Check in TransportDriver table
    const driverExists = await prisma.transportDriver.findFirst({
        where: { phone: { in: variants } }
    });
    if (driverExists) {
        return { exists: true, location: `Transport Driver: ${driverExists.name}`, type: 'driver', entityId: driverExists.id };
    }

    // Check in JobApplication table
    const jobAppExists = await prisma.jobApplication.findFirst({
        where: { phone: { in: variants } }
    });
    if (jobAppExists) {
        return { exists: true, location: `Job Application: ${jobAppExists.firstName}`, type: 'job_application', entityId: jobAppExists.id };
    }

    return { exists: false };
}

// ─── Email Check ──────────────────────────────────────────────────────────────

/**
 * Check if an email address exists anywhere in the system.
 */
export async function checkEmailExistsAction(
    email: string,
    excludeUserId?: string,
    excludeSchoolId?: string
): Promise<{ exists: boolean; location?: string }> {
    if (!email || email.trim() === '') {
        return { exists: false };
    }

    const normalizedEmail = normalizeEmail(email);

    // Check in User table
    const userExists = await prisma.user.findFirst({
        where: {
            email: normalizedEmail,
            ...(excludeUserId ? { NOT: { id: excludeUserId } } : {})
        }
    });
    if (userExists) {
        return { exists: true, location: `Staff/Admin: ${userExists.firstName || ''} ${userExists.lastName || ''}`.trim() || 'Unknown user' };
    }

    // Check in School table
    const schoolExists = await prisma.school.findFirst({
        where: {
            email: normalizedEmail,
            ...(excludeSchoolId ? { NOT: { id: excludeSchoolId } } : {})
        }
    });
    if (schoolExists) {
        return { exists: true, location: `School: ${schoolExists.name}` };
    }

    // Check in Admission table
    const admissionExists = await (prisma as any).admission.findFirst({
        where: {
            OR: [
                { parentEmail: normalizedEmail },
                { fatherEmail: normalizedEmail },
                { motherEmail: normalizedEmail }
            ]
        }
    });
    if (admissionExists) {
        return { exists: true, location: `Admission Inquiry: ${admissionExists.studentName}` };
    }

    // Check in Student table
    const studentExists = await prisma.student.findFirst({
        where: { parentEmail: normalizedEmail }
    });
    if (studentExists) {
        return { exists: true, location: `Student Parent: ${studentExists.firstName} ${studentExists.lastName}` };
    }

    // Check in JobApplication table
    const jobAppExists = await prisma.jobApplication.findFirst({
        where: { email: normalizedEmail }
    });
    if (jobAppExists) {
        return { exists: true, location: `Job Application: ${jobAppExists.firstName}` };
    }

    return { exists: false };
}

// ─── Convenience Validators ───────────────────────────────────────────────────

/**
 * Validate phone uniqueness — returns { isValid, error }
 */
export async function validatePhoneUniqueness(
    phone: string,
    excludeUserId?: string,
    excludeSchoolId?: string
): Promise<{ isValid: boolean; error?: string; type?: string; entityId?: string; location?: string }> {
    const result = await checkPhoneExistsAction(phone, excludeUserId, excludeSchoolId);
    if (result.exists) {
        return {
            isValid: false,
            error: `Mobile number is already registered: ${result.location}`,
            type: result.type,
            entityId: result.entityId,
            location: result.location
        };
    }
    return { isValid: true };
}

/**
 * Validate email uniqueness — returns { isValid, error }
 */
export async function validateEmailUniqueness(
    email: string,
    excludeUserId?: string,
    excludeSchoolId?: string
): Promise<{ isValid: boolean; error?: string }> {
    const result = await checkEmailExistsAction(email, excludeUserId, excludeSchoolId);
    if (result.exists) {
        return {
            isValid: false,
            error: `Email address is already registered: ${result.location}`
        };
    }
    return { isValid: true };
}
