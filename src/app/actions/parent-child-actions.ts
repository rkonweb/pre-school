"use server";

import { prisma } from "@/lib/prisma";

async function getFamilyStudentIds(phone: string) {
    const students = await prisma.student.findMany({
        where: {
            status: "ACTIVE",
            OR: [
                { parentMobile: phone },
                { fatherPhone: phone },
                { motherPhone: phone },
            ],
        },
        select: { id: true, schoolId: true },
    });
    return students;
}

export async function getChildProfileAction(studentId: string, phone: string) {
    try {
        // Verify parent has access to this student
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                OR: [
                    { parentMobile: phone },
                    { fatherPhone: phone },
                    { motherPhone: phone },
                ],
            },
            include: {
                classroom: {
                    select: {
                        id: true,
                        name: true,
                        teacher: {
                            select: { firstName: true, lastName: true, avatar: true }
                        }
                    }
                },
                school: {
                    select: { name: true, logo: true, brandColor: true, phone: true, email: true }
                }
            }
        });

        if (!student) {
            return { success: false, error: "Unauthorized or student not found" };
        }

        const profile = {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            avatar: student.avatar,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            grade: student.grade,
            admissionNumber: student.admissionNumber,
            enrollmentNumber: student.enrollmentNumber,
            joiningDate: student.joiningDate,
            bloodGroup: student.bloodGroup,
            allergies: student.allergies,
            medicalConditions: student.medicalConditions,
            address: student.address,
            // Family Info
            parentName: student.parentName,
            parentEmail: student.parentEmail,
            fatherName: student.fatherName,
            fatherPhone: student.fatherPhone,
            fatherOccupation: student.fatherOccupation,
            motherName: student.motherName,
            motherPhone: student.motherPhone,
            motherOccupation: student.motherOccupation,
            // Emergency
            emergencyContactName: student.emergencyContactName,
            emergencyContactPhone: student.emergencyContactPhone,
            // Class
            classroom: student.classroom ? {
                id: student.classroom.id,
                name: student.classroom.name,
                teacher: student.classroom.teacher ? {
                    name: `${student.classroom.teacher.firstName || ''} ${student.classroom.teacher.lastName || ''}`.trim(),
                    avatar: student.classroom.teacher.avatar
                } : null
            } : null,
            // School
            school: {
                name: student.school?.name,
                logo: student.school?.logo,
                brandColor: student.school?.brandColor,
                phone: student.school?.phone,
                email: student.school?.email,
            }
        };

        return { success: true, data: JSON.parse(JSON.stringify(profile)) };
    } catch (error: any) {
        console.error("getChildProfileAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}

export async function getAllChildrenProfilesAction(phone: string) {
    try {
        const families = await getFamilyStudentIds(phone);
        if (!families.length) {
            return { success: false, error: "No students found for this phone number" };
        }

        const results = await Promise.all(
            families.map(f => getChildProfileAction(f.id, phone))
        );

        const children = results
            .filter(r => r.success)
            .map(r => r.data);

        return { success: true, data: JSON.parse(JSON.stringify(children)) };
    } catch (error: any) {
        console.error("getAllChildrenProfilesAction Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
