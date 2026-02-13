"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";
import { validateUserSchoolAction } from "./session-actions";

interface StudentQueryOptions {
    page?: number;
    limit?: number;
    search?: string;
    filters?: {
        status?: string;
        class?: string;
        academicYearId?: string;
    };
    sort?: {
        field: string;
        direction: "asc" | "desc";
    };
}

export async function getStudentsAction(schoolSlug: string, options: StudentQueryOptions = {}) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error, students: [] };

        const { page = 1, limit = 10, search = "", filters = {}, sort } = options;
        const skip = (page - 1) * limit;

        const whereClause: any = {
            school: { slug: schoolSlug }
        };

        // ---------------------------------------------------------
        // ACCESS CONTROL ENFORCEMENT (Refined)
        // ---------------------------------------------------------
        const currentUser = auth.user;

        // If user is STAFF (and not generic ADMIN), enforce class scoping
        if (currentUser && currentUser.role === "STAFF") {
            const items = await prisma.classAccess.findMany({
                where: { userId: currentUser.id, canRead: true },
                select: { classroomId: true }
            });

            const allowedClassIds = items.map((i: any) => i.classroomId);

            if (allowedClassIds.length > 0) {
                whereClause.classroomId = { in: allowedClassIds };
            } else {
                return {
                    success: true,
                    students: [],
                    pagination: { total: 0, page, limit, totalPages: 0 }
                };
            }
        }
        // ---------------------------------------------------------

        if (search) {
            whereClause.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { admissionNumber: { contains: search } },
                { parentName: { contains: search } }
            ];
        }

        if (filters.status && filters.status !== "all") {
            whereClause.status = filters.status;
        }

        if (filters.class && filters.class !== "all") {
            whereClause.classroom = { name: filters.class };
        }

        // Academic Year Filter
        if (filters.academicYearId) {
            const academicYear = await prisma.academicYear.findUnique({
                where: { id: filters.academicYearId }
            });

            if (academicYear) {
                // Logic: Student must have joined ON or BEFORE the end of the academic year
                // AND (Leaving Date is NULL OR Leaving Date >= Start of Academic Year)
                // This captures students present during the academic year.

                // We use explicit AND to combine with existing filters
                if (!whereClause.AND) whereClause.AND = [];

                // 1. Joined before/during the year
                whereClause.AND.push({
                    OR: [
                        { joiningDate: { lte: academicYear.endDate } },
                        { joiningDate: null } // Handle missing joining date (assume joined long ago)
                    ]
                });

                // 2. Left after start of year or active
                whereClause.AND.push({
                    OR: [
                        { leavingDate: null },
                        { leavingDate: { gte: academicYear.startDate } }
                    ]
                });
            }
        }

        let orderBy: any = { createdAt: "desc" };
        if (sort && sort.field) {
            if (sort.field === 'name') {
                orderBy = { firstName: sort.direction };
            } else if (sort.field === 'class') {
                orderBy = { classroom: { name: sort.direction } };
            } else if (sort.field === 'parent') {
                orderBy = { parentName: sort.direction };
            } else {
                orderBy = { [sort.field]: sort.direction };
            }
        }

        const [students, totalCount] = await prisma.$transaction([
            prisma.student.findMany({
                where: whereClause,
                include: {
                    classroom: true
                },
                orderBy: orderBy,
                take: limit,
                skip: skip
            }),
            prisma.student.count({ where: whereClause })
        ]);

        return {
            success: true,
            students: students.map(s => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                class: s.classroom?.name || "Unassigned",
                age: s.age || 0,
                parent: s.parentName || "Unknown",
                status: s.status,
                avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}`,
                createdAt: s.createdAt, // Needed for date sort
            })),
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    } catch (e: any) {
        console.error("Get Students Error:", e);
        return { success: false, error: e.message, students: [] };
    }
}

export async function getStudentAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                classroom: true,
                promotedToClassroom: true,
                school: true
            }
        });
        return { success: true, student };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createStudentAction(schoolSlug: string, data: {
    firstName: string;
    lastName: string;
    age?: number;
    gender?: string;
    classroomId?: string;
    parentName?: string;
    parentMobile?: string;
    parentEmail?: string;
    avatar?: string;
}) {
    const auth = await validateUserSchoolAction(schoolSlug);
    if (!auth.success) throw new Error(auth.error);

    // Find school id
    const school = await prisma.school.findUnique({
        where: { slug: schoolSlug }
    });

    if (!school) throw new Error("School not found");

    const student = await prisma.student.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            age: data.age,
            gender: data.gender,
            classroomId: data.classroomId,
            parentName: data.parentName,
            parentMobile: data.parentMobile,
            parentEmail: data.parentEmail,
            avatar: data.avatar,
            schoolId: school.id
        }
    });

    revalidatePath(`/s/${schoolSlug}/students`);
    return student;
}

export async function updateStudentAction(schoolSlug: string, id: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        // Remove nested objects and auto-fields for update
        // Added 'school' and 'conversations' to exclude list to prevent Prisma relation errors
        const {
            classroom,
            school,
            conversations,
            fees,
            createdAt,
            updatedAt,
            attendance,
            reports,
            id: _id,
            schoolId,
            dateOfBirth,
            joiningDate,
            ...updateData
        } = data;

        // Sanitize classroomId
        if (updateData.classroomId === "" || updateData.classroomId === "unassigned") {
            updateData.classroomId = null;
        }

        const student = await (prisma as any).student.update({
            where: { id },
            data: {
                ...updateData,
                dateOfBirth: (dateOfBirth && !isNaN(new Date(dateOfBirth).getTime()))
                    ? new Date(dateOfBirth)
                    : undefined,
                joiningDate: (joiningDate && !isNaN(new Date(joiningDate).getTime()))
                    ? new Date(joiningDate)
                    : undefined,
            }
        });

        revalidatePath(`/s/${schoolSlug}/students`);
        revalidatePath(`/s/${schoolSlug}/students/${id}`);
        return { success: true, student };
    } catch (error: any) {
        console.error("Update Student Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteStudentAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        await prisma.student.delete({
            where: { id }
        });
        revalidatePath(`/s/${schoolSlug}/students`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateStudentAvatarAction(schoolSlug: string, studentId: string, formData: FormData) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const file = formData.get("file") as File;
        if (!file || file.size === 0) {
            return { success: false, error: "No file provided" };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // STRICT SANITIZATION to prevent path traversal
        const safeName = studentId + "-" + Date.now() + "-" + basename(file.name).replace(/[^a-zA-Z0-9.-]/g, "_");
        const uploadDir = join(process.cwd(), "public/uploads/students");

        await mkdir(uploadDir, { recursive: true });

        const path = join(uploadDir, safeName);
        await writeFile(path, buffer);

        const avatarPath = `/uploads/students/${safeName}`;

        await prisma.student.update({
            where: { id: studentId },
            data: { avatar: avatarPath }
        });

        revalidatePath(`/s/${schoolSlug}/students/${studentId}`);
        return { success: true, avatar: avatarPath };
    } catch (error: any) {
        console.error("Upload Error:", error);
        return { success: false, error: error.message };
    }
}

export async function searchStudentsAction(schoolSlug: string, query: string, excludeId?: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const students = await prisma.student.findMany({
            where: {
                school: { slug: schoolSlug },
                id: { not: excludeId },
                OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } },
                    { admissionNumber: { contains: query } }
                ]
            },
            take: 5,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                parentName: true,
                avatar: true
            }
        });
        return { success: true, students };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function connectSiblingAction(schoolSlug: string, primaryStudentId: string, siblingStudentId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const primary = await prisma.student.findUnique({
            where: { id: primaryStudentId }
        });
        if (!primary) return { success: false, error: "Primary student not found" };

        if (!primary.parentMobile) return { success: false, error: "Primary student has no parent mobile linked" };

        // Update sibling to match primary
        await prisma.student.update({
            where: { id: siblingStudentId },
            data: {
                parentMobile: primary.parentMobile,
                parentName: primary.parentName,
                parentEmail: primary.parentEmail,
                emergencyContactName: primary.emergencyContactName,
                emergencyContactPhone: primary.emergencyContactPhone
            }
        });

        revalidatePath(`/s/${schoolSlug}/students/${primaryStudentId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function disconnectSiblingAction(schoolSlug: string, studentId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        await prisma.student.update({
            where: { id: studentId },
            data: {
                parentMobile: null
            }
        });
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
