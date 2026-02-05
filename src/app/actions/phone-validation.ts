"use server";

import { prisma } from "@/lib/prisma";

/**
 * Check if a phone number exists anywhere in the system.
 * Phone numbers must be globally unique across all entities.
 * 
 * @param phone - The phone number to check
 * @param excludeUserId - Optional user ID to exclude from check (for updates)
 * @param excludeSchoolId - Optional school ID to exclude from check (for updates)
 * @returns Object with exists boolean and location where it was found
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
        return { exists: true, location: `User: ${userExists.firstName || ''} ${userExists.lastName || ''}`.trim() || 'Staff/Admin' };
    }

    // Check in School table
    const schoolExists = await prisma.school.findFirst({
        where: {
            phone: normalizedPhone,
            ...(excludeSchoolId ? { NOT: { id: excludeSchoolId } } : {})
        }
    });
    if (schoolExists) {
        return { exists: true, location: `School: ${schoolExists.name}` };
    }

    // Check in Admission table (parent phones)
    const admissionExists = await prisma.admission.findFirst({
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
        return { exists: true, location: `Admission: ${admissionExists.studentName}` };
    }

    // Check in Student table (emergency contact)
    const studentExists = await prisma.student.findFirst({
        where: { emergencyContactPhone: normalizedPhone }
    });
    if (studentExists) {
        return { exists: true, location: `Student Emergency Contact: ${studentExists.firstName}` };
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
 * Validate phone uniqueness and return error message if exists
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
