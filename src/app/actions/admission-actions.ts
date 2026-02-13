"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { randomBytes } from "crypto";
import { calculateLeadScore } from "./lead-scoring";

export async function getAdmissionsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await (prisma as any).school.findUnique({
            where: { slug },
            include: {
                admissions: {
                    orderBy: { dateReceived: 'desc' }
                }
            }
        });

        if (!school) return { success: false, error: "School not found" };

        return { success: true, admissions: school.admissions };
    } catch (error: any) {
        console.error("Fetch Admissions Error:", error);
        return { success: false, error: error.message || "Failed to fetch admissions" };
    }
}

export async function createInquiryAction(slug: string, data: any) {
    try {
        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school) return { success: false, error: "School not found" };

        // Global Uniqueness Check
        const { checkPhoneExistsAction, checkEmailExistsAction } = await import("./identity-validation");

        // 1. Phone check (hard block if school/staff, skip if sibling)
        if (data.parentPhone) {
            const phoneResult = await checkPhoneExistsAction(data.parentPhone);
            if (phoneResult.exists && (phoneResult.location?.startsWith("School") || phoneResult.location?.startsWith("Staff/Admin"))) {
                return { success: false, error: `Phone number (${data.parentPhone}) belongs to a ${phoneResult.location}.` };
            }
        }

        // 2. Email check
        if (data.parentEmail) {
            const emailResult = await checkEmailExistsAction(data.parentEmail);
            if (emailResult.exists && (emailResult.location?.startsWith("School") || emailResult.location?.startsWith("Staff/Admin"))) {
                return { success: false, error: `Email (${data.parentEmail}) belongs to a ${emailResult.location}.` };
            }
        }

        const admission = await (prisma as any).admission.create({
            data: {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                schoolId: school.id,
                stage: "INQUIRY"
            }
        });

        // Log initial interaction for Dashboard Feed
        await prisma.leadInteraction.create({
            data: {
                admissionId: admission.id,
                type: "AUTOMATION",
                content: `Inquiry captured via ${data.source || 'Direct Source'}.`,
            }
        });

        revalidatePath(`/s/${slug}/admissions`);
        return { success: true, data: admission };
    } catch (error: any) {
        console.error("Create Inquiry Error:", error);
        return { success: false, error: error.message || "Failed to create inquiry" };
    }
}

export async function updateAdmissionStageAction(slug: string, admissionId: string, newStage: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const updated = await (prisma as any).admission.update({
            where: { id: admissionId },
            data: { stage: newStage }
        });

        revalidatePath(`/s/${slug}/admissions`);
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Update Stage Error:", error);
        return { success: false, error: error.message || "Failed to update stage" };
    }
}

export async function getAdmissionAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const admission = await (prisma as any).admission.findUnique({
            where: { id }
        });
        if (!admission) return { success: false, error: "Admission not found" };
        if (admission.schoolId !== (auth.user as any).schoolId) return { success: false, error: "Tenant mismatch" };

        return { success: true, admission };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAdmissionAction(slug: string, id: string, data: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };
        // Strip out fields that shouldn't be updated directly or might cause Prisma errors
        // Also remove DateTime fields that might come as strings and we don't intend to update here
        const {
            id: _id,
            schoolId: _schoolId,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            school: _school,
            dateReceived: _dateReceived, // Exclude dateReceived from update
            ...updateData
        } = data;

        // 0. Internal Consistency Check (Father vs Mother)
        if (updateData.fatherPhone && updateData.motherPhone &&
            String(updateData.fatherPhone).trim() === String(updateData.motherPhone).trim()) {
            return { success: false, error: "Father's Phone and Mother's Phone cannot be the same. Each parent must have a unique identity." };
        }
        if (updateData.fatherEmail && updateData.motherEmail &&
            String(updateData.fatherEmail).trim() === String(updateData.motherEmail).trim()) {
            return { success: false, error: "Father's Email and Mother's Email cannot be the same. Each parent must have a unique identity." };
        }

        // 1. Phone Number Uniqueness Check
        // Global Uniqueness Check
        const { checkPhoneExistsAction, checkEmailExistsAction } = await import("./identity-validation");

        // 1. Phone Uniqueness Check
        const phonesToCheck = [
            { label: "Father's Phone", value: updateData.fatherPhone },
            { label: "Mother's Phone", value: updateData.motherPhone },
            { label: "Parent Phone", value: updateData.parentPhone }
        ].filter(p => p.value && String(p.value).trim() !== "");

        for (const phone of phonesToCheck) {
            const phoneValue = String(phone.value).trim();
            const phoneResult = await checkPhoneExistsAction(phoneValue, id);

            if (phoneResult.exists) {
                // If it's a hard block (School or Staff/Admin)
                if (phoneResult.location?.startsWith("School") || phoneResult.location?.startsWith("Staff/Admin")) {
                    return { success: false, error: `${phone.label} (${phoneValue}) is already registered as a ${phoneResult.location}.` };
                }

                // If it's another Admission or Student, check for duplicate child name
                const studentLow = String(updateData.studentName || "").toLowerCase().trim();
                const studentFirstName = studentLow.split(' ')[0];

                const duplicateAdmission = await (prisma as any).admission.findFirst({
                    where: {
                        AND: [
                            { id: { not: id } },
                            {
                                OR: [
                                    { fatherPhone: phoneValue },
                                    { motherPhone: phoneValue },
                                    { parentPhone: phoneValue }
                                ]
                            },
                            {
                                OR: [
                                    { studentName: { contains: studentFirstName } },
                                    { studentName: { equals: studentLow } }
                                ]
                            }
                        ]
                    }
                });

                if (duplicateAdmission) {
                    return {
                        success: false,
                        error: `A duplicate admission exists for ${duplicateAdmission.studentName} with ${phone.label} (${phoneValue}).`
                    };
                }
            }
        }

        // 2. Email Uniqueness Check
        const emailsToCheck = [
            { label: "Father's Email", value: updateData.fatherEmail },
            { label: "Mother's Email", value: updateData.motherEmail },
            { label: "Parent Email", value: updateData.parentEmail }
        ].filter(e => e.value && String(e.value).trim() !== "");

        for (const email of emailsToCheck) {
            const emailValue = String(email.value).trim();
            const emailResult = await checkEmailExistsAction(emailValue, id);

            if (emailResult.exists) {
                if (emailResult.location?.startsWith("School") || emailResult.location?.startsWith("Staff/Admin")) {
                    return { success: false, error: `${email.label} (${emailValue}) is already registered as a ${emailResult.location}.` };
                }

                const studentLow = String(updateData.studentName || "").toLowerCase().trim();
                const studentFirstName = studentLow.split(' ')[0];

                const duplicateAdmission = await (prisma as any).admission.findFirst({
                    where: {
                        AND: [
                            { id: { not: id } },
                            {
                                OR: [
                                    { fatherEmail: emailValue },
                                    { motherEmail: emailValue },
                                    { parentEmail: emailValue }
                                ]
                            },
                            {
                                OR: [
                                    { studentName: { contains: studentFirstName } },
                                    { studentName: { equals: studentLow } }
                                ]
                            }
                        ]
                    }
                });

                if (duplicateAdmission) {
                    return {
                        success: false,
                        error: `A duplicate admission exists for ${duplicateAdmission.studentName} with ${email.label} (${emailValue}).`
                    };
                }
            }
        }

        const updated = await (prisma as any).admission.update({
            where: { id },
            data: {
                ...updateData,
                dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
                studentAge: updateData.studentAge ? parseInt(updateData.studentAge.toString()) : null,
            }
        });

        revalidatePath(`/s/${slug}/admissions`);
        revalidatePath(`/s/${slug}/admissions/${id}`); // Ensure this specific page is revalidated
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Update Admission Error:", error);
        return { success: false, error: error.message || "Failed to update admission" };
    }
}

export async function getAdmissionStatsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await (prisma as any).school.findUnique({
            where: { slug },
            include: {
                admissions: true
            }
        });

        if (!school) return { success: false, error: "School not found" };

        const stats = {
            newInquiries: school.admissions.filter((a: any) => a.stage === "INQUIRY").length,
            applications: school.admissions.filter((a: any) => a.stage === "APPLICATION").length,
            interviews: school.admissions.filter((a: any) => a.stage === "INTERVIEW").length,
            enrolled: school.admissions.filter((a: any) => a.stage === "ENROLLED").length,
        };

        return { success: true, stats };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAdmissionAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        await (prisma as any).admission.delete({
            where: { id }
        });
        revalidatePath(`/s/${slug}/admissions`);
        return { success: true };
    } catch (error: any) {
        console.error("Delete Admission Error:", error);
        return { success: false, error: error.message || "Failed to delete admission" };
    }
}

export async function initiateAdmissionAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        // 1. Generate a secure token
        const token = randomBytes(32).toString('hex');

        // 2. Update the record
        const updated = await (prisma as any).admission.update({
            where: { id },
            data: {
                stage: "APPLICATION",
                accessToken: token,
                officialStatus: "INTERESTED"
            }
        });

        // 3. Simulate sending email
        console.log("------------------------------------------");
        console.log(`SIMULATING EMAIL TO: ${updated.parentEmail}`);
        console.log(`SUBJECT: Complete Admission for ${updated.studentName}`);
        console.log(`LINK: http://localhost:3000/admission-portal/${token}`);
        console.log("------------------------------------------");

        revalidatePath(`/s/${slug}/admissions`);
        revalidatePath(`/s/${slug}/admissions/${id}`);

        return { success: true, token };
    } catch (error: any) {
        console.error("Initiate Admission Error:", error);
        return { success: false, error: error.message || "Failed to initiate admission" };
    }
}

export async function getAdmissionByTokenAction(token: string) {
    try {
        const admission = await (prisma as any).admission.findUnique({
            where: { accessToken: token },
            include: { school: true }
        });

        if (!admission) return { success: false, error: "Link expired or invalid" };

        return { success: true, admission };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateComprehensiveAdmissionAction(token: string, data: any) {
    try {
        const admission = await (prisma as any).admission.update({
            where: { accessToken: token },
            data: {
                ...data,
                admissionFormStep: 1, // Mark as completed
                stage: "INTERVIEW" // Progress to next stage after form completion
            }
        });

        return { success: true, data: admission };
    } catch (error: any) {
        console.error("Update Comprehensive Error:", error);
        return { success: false, error: error.message || "Failed to update" };
    }
}

export async function approveAdmissionAction(slug: string, id: string, classroomId: string, grade: string) {
    console.log(`[APPROVE] Action triggered for Admission: ${id}, Grade: ${grade}, Classroom: ${classroomId}`);
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const admission = await (prisma as any).admission.findUnique({
            where: { id },
        });

        if (!admission) return { success: false, error: "Admission not found" };

        return await prisma.$transaction(async (tx) => {
            // 1. Update Admission Stage & Persist Enrollment Choice
            await (tx as any).admission.update({
                where: { id },
                data: {
                    stage: "ENROLLED",
                    enrolledGrade: grade
                }
            });

            // 2. Extract first/last name
            const nameParts = admission.studentName.trim().split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

            // 3. Create Student record
            const student = await (tx as any).student.create({
                data: {
                    firstName,
                    lastName,
                    age: admission.studentAge,
                    gender: admission.studentGender,
                    dateOfBirth: admission.dateOfBirth,
                    grade: grade,
                    classroomId: classroomId,
                    parentName: admission.parentName || (admission.fatherName ? admission.fatherName : admission.motherName),
                    parentMobile: admission.parentPhone || admission.fatherPhone || admission.motherPhone,
                    parentEmail: admission.parentEmail || admission.fatherEmail || admission.motherEmail,
                    bloodGroup: admission.bloodGroup,
                    medicalConditions: admission.medicalConditions,
                    allergies: admission.allergies,
                    emergencyContactName: admission.emergencyContactName,
                    emergencyContactPhone: admission.emergencyContactPhone,
                    schoolId: admission.schoolId,
                    status: "ACTIVE"
                }
            });

            revalidatePath(`/s/${slug}/admissions`);
            revalidatePath(`/s/${slug}/admissions/${id}`);
            revalidatePath(`/s/${slug}/students`);

            return { success: true, studentId: student.id };
        });
    } catch (error: any) {
        console.error("Approve Admission Error:", error);
        return { success: false, error: error.message || "Failed to approve admission" };
    }
}

export async function uploadDocumentAction(slug: string, id: string, docKey: string, fileUrl: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const admission = await (prisma as any).admission.findUnique({
            where: { id },
            select: { documents: true }
        });

        if (!admission) return { success: false, error: "Admission not found" };

        let docs = {};
        if (admission.documents) {
            try {
                docs = JSON.parse(admission.documents);
            } catch (e) {
                docs = {};
            }
        }

        const updatedDocs = { ...docs, [docKey]: fileUrl };

        await (prisma as any).admission.update({
            where: { id },
            data: { documents: JSON.stringify(updatedDocs) }
        });

        revalidatePath(`/s/${slug}/admissions/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeDocumentAction(slug: string, id: string, docKey: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const admission = await (prisma as any).admission.findUnique({
            where: { id },
            select: { documents: true }
        });

        if (!admission) return { success: false, error: "Admission not found" };

        if (admission.documents) {
            let docs = {};
            try {
                docs = JSON.parse(admission.documents);
            } catch (e) {
                docs = {};
            }
            delete (docs as any)[docKey];

            await (prisma as any).admission.update({
                where: { id },
                data: { documents: JSON.stringify(docs) }
            });
        }

        revalidatePath(`/s/${slug}/admissions/${id}`);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function checkParentByPhoneAction(slug: string, phone: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        if (!phone) return { success: false };

        const cleanDigits = String(phone).replace(/\D/g, "");
        if (cleanDigits.length < 5) return { success: false };

        const searchFragment = cleanDigits.slice(-5);

        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!school) return { success: false };

        // Helper to check match
        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            return dbDigits.includes(cleanDigits) || cleanDigits.includes(dbDigits);
        };

        // 1. Check Active Students
        const students = await (prisma as any).student.findMany({
            where: {
                schoolId: school.id,
                OR: [
                    { parentMobile: { contains: searchFragment } },
                    { emergencyContactPhone: { contains: searchFragment } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                parentName: true,
                parentEmail: true,
                parentMobile: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
                firstName: true,
                lastName: true
            }
        });

        const matchedStudent = students.find((s: any) => isMatch(s.parentMobile) || isMatch(s.emergencyContactPhone));
        // if (matchedStudent) { return ... } -> Removed to prioritize Rich Search below

        // 2. Check Pipeline (Admissions)
        // Note: For Admission, we must ensure we don't match the CURRENT admission being created?
        // But this is "New Inquiry", so ID doesn't exist yet.
        const admissions = await (prisma as any).admission.findMany({
            where: {
                schoolId: school.id,
                OR: [
                    { parentPhone: { contains: searchFragment } },
                    { fatherPhone: { contains: searchFragment } },
                    { motherPhone: { contains: searchFragment } }
                ]
            },
            orderBy: { dateReceived: 'desc' },
            take: 10
        });

        const matchedAdmission = admissions.find((a: any) =>
            isMatch(a.parentPhone) || isMatch(a.fatherPhone) || isMatch(a.motherPhone)
        );

        // 4. Return the result (Prioritize Admission data for rich details if available)
        // Even if found in Student, try to find an Admission record with same phone for full details
        let richData: any = null;

        const richAdmission = await prisma.admission.findFirst({
            where: {
                schoolId: school.id,
                OR: [
                    { parentPhone: { contains: cleanDigits } },
                    { fatherPhone: { contains: cleanDigits } },
                    { motherPhone: { contains: cleanDigits } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        if (richAdmission) {
            richData = {
                id: richAdmission.id,
                source: "ADMISSION",
                childName: richAdmission.studentName,

                // Father (Default to parentName if fatherName missing)
                fatherName: richAdmission.fatherName || richAdmission.parentName,
                fatherPhone: richAdmission.fatherPhone || richAdmission.parentPhone,
                fatherEmail: richAdmission.fatherEmail || richAdmission.parentEmail,
                fatherOccupation: richAdmission.fatherOccupation,

                // Mother
                motherName: richAdmission.motherName,
                motherPhone: richAdmission.motherPhone,
                motherEmail: richAdmission.motherEmail,
                motherOccupation: richAdmission.motherOccupation,

                // Address
                address: richAdmission.address,
                city: richAdmission.city,
                state: richAdmission.state,
                country: richAdmission.country,
                zip: richAdmission.zip,

                // Display
                parentName: richAdmission.fatherName || richAdmission.parentName,
                parentMobile: richAdmission.fatherPhone || richAdmission.parentPhone,
                parentEmail: richAdmission.fatherEmail || richAdmission.parentEmail
            };
        } else if (matchedStudent) {
            // Fallback to Student (Basic Data)
            const s = matchedStudent;
            richData = {
                id: s.id,
                source: "STUDENT",
                childName: `${s.firstName} ${s.lastName}`,
                parentName: s.parentName,
                parentMobile: s.parentMobile,
                parentEmail: s.parentEmail,

                // Map Basic to Father
                fatherName: s.parentName,
                fatherPhone: s.parentMobile,
                fatherEmail: s.parentEmail,

                // Address (Null for Student)
                address: "",
                city: "",
                state: "",
                country: "",
                zip: ""
            };
        }

        if (richData) {
            return {
                success: true,
                found: true,
                parent: richData
            };
        }

        return { success: true, found: false };

    } catch (error: any) {
        console.error("Sibling Check Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getSiblingsAction(slug: string, phone: string, currentAdmissionId?: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        if (!phone || phone.length < 5) return { success: true, siblings: [] };

        const cleanDigits = String(phone).replace(/\D/g, "");
        const searchFragment = cleanDigits.slice(-5);

        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const isMatch = (dbPhone: string | null) => {
            if (!dbPhone) return false;
            const dbDigits = String(dbPhone).replace(/\D/g, "");
            return dbDigits.includes(cleanDigits) || cleanDigits.includes(dbDigits);
        };

        // 1. Find Active Students
        const students = await (prisma as any).student.findMany({
            where: {
                schoolId: school.id,
                OR: [
                    { parentMobile: { contains: searchFragment } },
                    { emergencyContactPhone: { contains: searchFragment } }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                grade: true,
                status: true,
                parentMobile: true,
                emergencyContactPhone: true
            }
        });

        const siblingStudents = students.filter((s: any) => isMatch(s.parentMobile) || isMatch(s.emergencyContactPhone));

        // 2. Find Pipeline Admissions
        const admissions = await (prisma as any).admission.findMany({
            where: {
                schoolId: school.id,
                id: { not: currentAdmissionId }, // Exclude current
                OR: [
                    { parentPhone: { contains: searchFragment } },
                    { fatherPhone: { contains: searchFragment } },
                    { motherPhone: { contains: searchFragment } }
                ]
            },
            select: {
                id: true,
                studentName: true,
                enrolledGrade: true,
                stage: true,
                parentPhone: true,
                fatherPhone: true,
                motherPhone: true
            }
        });

        const siblingAdmissions = admissions.filter((a: any) =>
            isMatch(a.parentPhone) || isMatch(a.fatherPhone) || isMatch(a.motherPhone)
        );

        const synonyms = [
            ...siblingStudents.map((s: any) => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                grade: s.grade,
                status: s.status, // ACTIVE, etc.
                type: "STUDENT"
            })),
            ...siblingAdmissions.map((a: any) => ({
                id: a.id,
                name: a.studentName,
                grade: a.enrolledGrade,
                status: a.stage, // INQUIRY, etc.
                type: "ADMISSION"
            }))
        ];

        return { success: true, siblings: synonyms };

    } catch (error: any) {
        console.error("Get Siblings Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getAIDashboardDataAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug },
            include: {
                admissions: {
                    include: {
                        followUps: {
                            where: { status: 'PENDING' }
                        }
                    }
                }
            }
        });

        if (!school) return { success: false, error: "School not found" };

        const admissions = school.admissions;
        const now = new Date();
        const nowForYesterday = new Date(now);
        const yesterday = new Date(nowForYesterday.getTime() - 24 * 60 * 60 * 1000);

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        // 1. KPI Tiles Data
        const hotLeads = admissions.filter((a: any) => (a.score || 0) >= 80);
        const hotLeadsToday = hotLeads.filter((a: any) => a.createdAt >= startOfToday).length;

        const idleHotLeads = hotLeads.filter((a: any) => {
            const lastAction = a.lastMeaningfulActionAt || a.createdAt;
            return lastAction < yesterday;
        }).length;

        const scheduledToursToday = admissions.filter((a: any) => {
            if (a.tourStatus !== "SCHEDULED") return false;
            return a.followUps?.some((f: any) =>
                f.type === "VISIT" &&
                f.scheduledAt >= startOfToday &&
                f.scheduledAt <= endOfToday
            );
        }).length;

        const predictedAdmits = admissions.filter((a: any) => (a.score || 0) > 85).length;

        // 2. Prioritized Worklist (Top 10)
        const worklist = admissions
            .filter((a: any) => a.stage !== "ENROLLED" && a.stage !== "LOST")
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 10)
            .map((a: any) => ({
                id: a.id,
                name: a.parentName,
                child: a.studentName,
                score: a.score || 0,
                lastAction: a.lastMeaningfulActionAt || a.createdAt
            }));

        return {
            success: true,
            data: {
                kpis: {
                    hotLeads: { value: hotLeads.length.toString(), subtext: `${hotLeadsToday} new today` },
                    idleHot: { value: idleHotLeads.toString(), subtext: "Needs attention" },
                    toursToday: { value: scheduledToursToday.toString(), subtext: "Scheduled for today" },
                    predictedAdmits: { value: predictedAdmits.toString(), subtext: "High probability" }
                },
                worklist,
                forecast: {
                    conversionRate: "+12%",
                    pipelineHealth: "Robust"
                }
            }
        };
    } catch (error: any) {
        console.error("AI Dashboard Data Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getLeadIntelligenceAction(slug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const admission = await (prisma as any).admission.findUnique({
            where: { id },
            include: {
                interactions: { orderBy: { createdAt: 'desc' } },
                followUps: true
            }
        });

        if (!admission) return { success: false, error: "Admission not found" };

        // 1. Calculate Propensity (Simple heuristic for demo)
        let propensity = admission.score || 50;
        if (admission.tourStatus === "COMPLETED") propensity += 20;
        if (admission.followUps.some((f: any) => f.status === "OVERDUE")) propensity -= 15;
        propensity = Math.min(100, Math.max(0, propensity));

        // 2. Real Sentiment Heuristic
        const interactionsCount = admission.interactions.length;
        const connectedCalls = admission.interactions.filter((i: any) => i.type === "CALL_LOG" && i.content.toLowerCase().includes("connected")).length;

        let sentiment = "NEUTRAL";
        let sentimentScore = 50;

        if (connectedCalls > 2) {
            sentiment = "POSITIVE";
            sentimentScore = 85;
        } else if (admission.interactions.some((i: any) => i.type === "CALL_LOG" && i.content.toLowerCase().includes("not interested"))) {
            sentiment = "NEGATIVE";
            sentimentScore = 15;
        }

        // 3. Dynamic NBA (Next Best Action)
        let nba: any = { type: 'CALL', label: 'Call Parent (Evening)', reason: 'Strong interest detected' };
        if (admission.tourStatus === "NONE") {
            nba = { type: 'TOUR', label: 'Invite for Tour', reason: 'High interest signal detected' };
        } else if (admission.tourStatus === "COMPLETED") {
            nba = { type: 'FEE', label: 'Send Fee Structure', reason: 'Mentioned budget concern' };
        }

        return {
            success: true,
            intelligence: {
                propensity,
                sentiment,
                sentimentScore,
                nba,
                risks: propensity < 40 ? [{ label: "Low Engagement Risk", severity: "HIGH" }] : []
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAIDraftResponseAction(slug: string, leadId: string, templateCategory: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const admission = await (prisma as any).admission.findUnique({ where: { id: leadId } });
        if (!admission) return { success: false, error: "Lead not found" };

        const childName = admission.studentName;
        const parentName = admission.parentName || (admission.fatherName ? admission.fatherName : admission.motherName);

        let draft = "";
        if (templateCategory === "TOUR") {
            draft = `Hi ${parentName}, it was a pleasure speaking with you regarding ${childName}'s admission. We'd love to invite you for a school tour this week. Would Wednesday at 10 AM work for you?`;
        } else if (templateCategory === "FEE") {
            draft = `Hello ${parentName}, as requested, I've attached the fee structure for the upcoming session for ${childName}. Please let me know if you have any questions regarding the scholarship options.`;
        } else {
            draft = `Hi ${parentName}, checking in to see if you had any more questions about our curriculum for ${childName}. We are currently filling up seats for the next term!`;
        }

        // simulate AI processing time
        await new Promise(r => setTimeout(r, 600));

        return { success: true, draft };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleLeadAutomationAction(slug: string, leadId: string, isActive: boolean) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        await (prisma as any).admission.update({
            where: { id: leadId },
            data: { automationPaused: !isActive }
        });

        // Log the change
        await prisma.leadInteraction.create({
            data: {
                admissionId: leadId,
                type: "AUTOMATION",
                content: `AI Autopilot ${isActive ? "Resumed" : "Paused"} by staff.`,
            }
        });

        revalidatePath(`/s/${slug}/admissions`);
        revalidatePath(`/s/${slug}/admissions/${leadId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAISettingsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        let settings = await (prisma as any).aISettings.findUnique({
            where: { schoolId: school.id }
        });

        if (!settings) {
            // Create default settings if not exists
            settings = await (prisma as any).aISettings.create({
                data: {
                    schoolId: school.id,
                    weights: JSON.stringify({
                        responsiveness: 30,
                        programInterest: 25,
                        location: 15,
                        budget: 20,
                        engagement: 10
                    }),
                    automationRules: JSON.stringify({
                        autoPauseDays: 7,
                        highIntentThreshold: 80
                    })
                }
            });
        }

        return {
            success: true,
            settings: {
                ...settings,
                weights: JSON.parse(settings.weights || "{}"),
                automationRules: JSON.parse(settings.automationRules || "{}"),
                quietHours: JSON.parse(settings.quietHours || "{\"start\":\"20:00\",\"end\":\"09:00\"}")
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function updateAISettingsAction(slug: string, data: { weights?: any, automationRules?: any, globalAutomationEnabled?: boolean, quietHours?: any }) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!school) return { success: false, error: "School not found" };

        const updateData: any = {};
        if (data.weights) updateData.weights = JSON.stringify(data.weights);
        if (data.automationRules) updateData.automationRules = JSON.stringify(data.automationRules);
        if (data.globalAutomationEnabled !== undefined) updateData.globalAutomationEnabled = data.globalAutomationEnabled;
        if (data.quietHours) updateData.quietHours = JSON.stringify(data.quietHours);

        await (prisma as any).aISettings.upsert({
            where: { schoolId: school.id },
            update: updateData,
            create: {
                schoolId: school.id,
                weights: JSON.stringify(data.weights || {}),
                automationRules: JSON.stringify(data.automationRules || {}),
                globalAutomationEnabled: data.globalAutomationEnabled ?? true,
                quietHours: JSON.stringify(data.quietHours || { start: "20:00", end: "09:00" })
            }
        });

        revalidatePath(`/s/${slug}/admissions/settings/ai`);
        revalidatePath(`/s/${slug}/admissions/inquiry/automation`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAIDistributionPreviewAction(slug: string, weights: any) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({
            where: { slug },
            select: { id: true, admissions: { select: { id: true } } }
        });

        if (!school) return { success: false, error: "School not found" };

        const simulatedScores = await Promise.all(
            school.admissions.map(adm => calculateLeadScore(adm.id, weights))
        );

        const distribution = [
            { label: "Hot (80+)", count: simulatedScores.filter(s => s >= 80).length, color: "bg-red-500" },
            { label: "Warm (60-79)", count: simulatedScores.filter(s => s >= 60 && s < 80).length, color: "bg-orange-500" },
            { label: "Cool (40-59)", count: simulatedScores.filter(s => s >= 40 && s < 60).length, color: "bg-blue-500" },
            { label: "Cold (<40)", count: simulatedScores.filter(s => s < 40).length, color: "bg-zinc-400" },
        ];

        return { success: true, distribution };
    } catch (error: any) {
        console.error("Distribution Simulation Error:", error);
        return { success: false, error: error.message };
    }
}
