import { prisma } from "@/lib/prisma";

export type AccessScope = {
    restriction: boolean; // If true, access is restricted to specific IDs
    allowedIds: string[]; // List of allowed Classroom IDs
};

/**
 * Determines the simplified access scope for a user based on their role and ClassAccess.
 * @param userId - The ID of the user.
 * @param role - The user's role (e.g., 'STAFF', 'ADMIN', 'SUPER_ADMIN').
 * @returns Object containing restriction status and allowed classroom IDs.
 */
export async function getEnforcedScope(userId: string, role: string): Promise<AccessScope> {
    // 1. ADMINs / SUPER_ADMINs have full access (No restriction)
    if (role === "ADMIN" || role === "SUPER_ADMIN" || role === "OWNER") {
        return { restriction: false, allowedIds: [] };
    }

    // 2. STAFF are restricted by ClassAccess
    if (role === "STAFF") {
        const accessItems = await prisma.classAccess.findMany({
            where: { userId, canRead: true },
            select: { classroomId: true }
        });

        const allowedIds = accessItems.map((i: any) => i.classroomId);

        // Even if list is empty, restriction is TRUE (they are restricted to "nothing")
        return { restriction: true, allowedIds };
    }

    // Default: Restrict everything if role is unknown or generic user
    return { restriction: true, allowedIds: [] };
}

/**
 * Verifies if a user has access to a specific classroom.
 */
export async function verifyClassAccess(userId: string, role: string, classroomId: string): Promise<boolean> {
    const scope = await getEnforcedScope(userId, role);

    if (!scope.restriction) return true; // No restriction
    return scope.allowedIds.includes(classroomId);
}

/**
 * Returns a SQL WHERE condition or a list of IDs for Curriculums based on fuzzy name matching.
 * This abstracts the logic we built for the Curriculum module.
 */
export async function getCurriculumScope(userId: string, role: string): Promise<string[]> {
    const scope = await getEnforcedScope(userId, role);

    if (!scope.restriction) {
        return []; // Empty implies "All" in the context of our helper usage, or we handle it explicitly.
    }

    if (scope.allowedIds.length === 0) {
        return []; // Allowed nothing.
    }

    // Fetch allowed classroom names
    const classrooms = await prisma.classroom.findMany({
        where: { id: { in: scope.allowedIds } },
        select: { name: true }
    });

    const allowedClassNames = classrooms.map(c => c.name.toLowerCase());

    // Fetch all curriculums to do fuzzy matching
    // (Optimization: In a huge system we wouldn't do this, but for < 20 grades it's fine)
    const allCurriculums = await prisma.curriculum.findMany({});

    const matchedCurriculums = allCurriculums.filter(c => {
        const cName = c.name.toLowerCase();
        return allowedClassNames.some(clsName => clsName.includes(cName) || cName.includes(clsName));
    });

    return matchedCurriculums.map(c => c.id);
}

/**
 * Verifies if a parent (identified by phone) has access to a specific student.
 * Handles fuzzy matching for phone numbers and checks both Student and Admission records.
 */
export async function verifyParentAccess(parentPhone: string, studentId: string): Promise<boolean> {
    if (!parentPhone || !studentId) return false;

    const cleanPhone = String(parentPhone).replace(/\D/g, "");
    if (cleanPhone.length < 4) return false; // Too short to be safe

    // Helper for fuzzy match
    const isMatch = (dbPhone: string | null) => {
        if (!dbPhone) return false;
        const dbDigits = String(dbPhone).replace(/\D/g, "");
        return dbDigits.includes(cleanPhone) || cleanPhone.includes(dbDigits);
    };

    // 1. Direct Student Check
    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });

    if (student) {
        if (isMatch(student.parentMobile) || isMatch(student.emergencyContactPhone)) {
            return true;
        }

        // 2. Admission Check (Fallback if Student has no phone but linked Admission does)
        const linkedAdmission = await prisma.admission.findFirst({
            where: {
                schoolId: student.schoolId,
                studentName: { startsWith: student.firstName },
                OR: [
                    { fatherPhone: { contains: cleanPhone.slice(-5) } },
                    { motherPhone: { contains: cleanPhone.slice(-5) } },
                    { parentPhone: { contains: cleanPhone.slice(-5) } }
                ]
            }
        });

        if (linkedAdmission) return true;
    }

    // 3. Check if studentId IS an Admission ID
    const admission = await prisma.admission.findUnique({
        where: { id: studentId }
    });

    if (admission) {
        if (isMatch(admission.parentPhone) || isMatch(admission.fatherPhone) || isMatch(admission.motherPhone)) {
            return true;
        }
    }

    return false;
}
