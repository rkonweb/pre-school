"use server";

import { prisma } from "@/lib/prisma";

/**
 * Check if a phone number exists anywhere in the system.
 * Phone numbers must be globally unique across all entities.
 */
export async function checkPhoneExistsAction(
    phone: string,
    excludeUserId?: string,
    excludeSchoolId?: string
): Promise<{ exists: boolean; location?: string }> {
    if (!phone || phone.trim() === '') {
        return { exists: false };
    }

    const normalizedPhone = phone.replace(/\D/g, ''); // Remove non-digits

    // Check in User table (mobile field)
    const userExists = await prisma.user.findFirst({
        where: {
            mobile: normalizedPhone,
            ...(excludeUserId ? { NOT: { id: excludeUserId } } : {})
        }
    });
    if (userExists) {
        return { exists: true, location: `Staff/Admin: ${userExists.firstName || ''} ${userExists.lastName || ''}`.trim() };
    }

    // Check in School table
    const schoolExists = await prisma.school.findFirst({
        where: {
            phone: normalizedPhone,
            ...(excludeSchoolId ? { NOT: { id: excludeSchoolId } } : {})
        }
    });
    if (schoolExists) {
        return { exists: true, location: `School Contact: ${schoolExists.name}` };
    }

    // Check in Admission table (parent phones)
    const admissionExists = await (prisma as any).admission.findFirst({
        where: {
            OR: [
                { parentPhone: normalizedPhone },
                { secondaryPhone: normalizedPhone },
                { fatherPhone: normalizedPhone },
                { motherPhone: normalizedPhone }
            ]
        }
    });
    if (admissionExists) {
        return { exists: true, location: `Admission Inquiry: ${admissionExists.studentName}` };
    }

    // Check in Student table (parent mobile)
    const studentExists = await prisma.student.findFirst({
        where: {
            OR: [
                { parentMobile: normalizedPhone },
                { emergencyContactPhone: normalizedPhone }
            ]
        }
    });
    if (studentExists) {
        return { exists: true, location: `Student Contact: ${studentExists.firstName} ${studentExists.lastName}` };
    }

    // Check in TransportDriver table
    const driverExists = await prisma.transportDriver.findFirst({
        where: { phone: normalizedPhone }
    });
    if (driverExists) {
        return { exists: true, location: `Transport Driver: ${driverExists.name}` };
    }

    // Check in JobApplication table
    const jobAppExists = await prisma.jobApplication.findFirst({
        where: { phone: normalizedPhone }
    });
    if (jobAppExists) {
        return { exists: true, location: `Job Application: ${jobAppExists.firstName}` };
    }

    return { exists: false };
}

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check in User table
    const userExists = await prisma.user.findFirst({
        where: {
            email: normalizedEmail,
            ...(excludeUserId ? { NOT: { id: excludeUserId } } : {})
        }
    });
    if (userExists) {
        return { exists: true, location: `Staff/Admin: ${userExists.firstName || ''} ${userExists.lastName || ''}`.trim() };
    }

    // Check in School table
    const schoolExists = await prisma.school.findFirst({
        where: {
            email: normalizedEmail,
            ...(excludeSchoolId ? { NOT: { id: excludeSchoolId } } : {})
        }
    });
    if (schoolExists) {
        return { exists: true, location: `School Contact: ${schoolExists.name}` };
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

/**
 * Validate phone uniqueness
 */
export async function validatePhoneUniqueness(
    phone: string,
    excludeUserId?: string,
    excludeSchoolId?: string
): Promise<{ isValid: boolean; error?: string }> {
    const result = await checkPhoneExistsAction(phone, excludeUserId, excludeSchoolId);
    if (result.exists) {
        return {
            isValid: false,
            error: `Phone number ${phone} is already in use by: ${result.location}`
        };
    }
    return { isValid: true };
}

/**
 * Validate email uniqueness
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
            error: `Email address ${email} is already in use by: ${result.location}`
        };
    }
    return { isValid: true };
}
