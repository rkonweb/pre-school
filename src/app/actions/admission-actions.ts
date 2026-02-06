"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdmissionsAction(slug: string) {
    try {
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

        const admission = await (prisma as any).admission.create({
            data: {
                ...data,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                schoolId: school.id,
                stage: "INQUIRY"
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

export async function getAdmissionAction(id: string) {
    try {
        const admission = await (prisma as any).admission.findUnique({
            where: { id }
        });
        if (!admission) return { success: false, error: "Admission not found" };
        return { success: true, admission };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAdmissionAction(slug: string, id: string, data: any) {
    try {
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
        const phonesToCheck = [
            { label: "Father's Phone", value: updateData.fatherPhone },
            { label: "Mother's Phone", value: updateData.motherPhone },
            { label: "Parent Phone", value: updateData.parentPhone }
        ].filter(p => p.value && String(p.value).trim() !== "");

        for (const phone of phonesToCheck) {
            const phoneValue = String(phone.value).trim();
            const studentFirstName = updateData.studentName ? updateData.studentName.trim().split(' ')[0] : '';

            // Check other Admissions (exclude current record)
            // Block if another admission exists with SAME phone AND SAME student name (Duplicate Application)
            const duplicateAdmission = await (prisma as any).admission.findFirst({
                where: {
                    id: { not: id },
                    OR: [
                        { fatherPhone: phoneValue },
                        { motherPhone: phoneValue },
                        { parentPhone: phoneValue }
                    ],
                    // Only block if it looks like the SAME child
                    studentName: { startsWith: studentFirstName }
                }
            });

            if (duplicateAdmission) {
                return {
                    success: false,
                    error: `A duplicate admission exists for ${duplicateAdmission.studentName} with ${phone.label} (${phoneValue}).`
                };
            }

            // Removed check against existing Student table to allow updates to Admission records
            // even if the student is already enrolled. Validation should happen at Approval stage.
        }

        // 2. Email Uniqueness Check
        const emailsToCheck = [
            { label: "Father's Email", value: updateData.fatherEmail },
            { label: "Mother's Email", value: updateData.motherEmail },
            { label: "Parent Email", value: updateData.parentEmail }
        ].filter(e => e.value && String(e.value).trim() !== "");

        for (const email of emailsToCheck) {
            const emailValue = String(email.value).trim();
            const studentFirstName = updateData.studentName ? updateData.studentName.trim().split(' ')[0] : '';

            // Check other Admissions
            const duplicateAdmission = await (prisma as any).admission.findFirst({
                where: {
                    id: { not: id },
                    OR: [
                        { fatherEmail: emailValue },
                        { motherEmail: emailValue },
                        { parentEmail: emailValue }
                    ],
                    studentName: { startsWith: studentFirstName }
                }
            });

            if (duplicateAdmission) {
                return {
                    success: false,
                    error: `A duplicate admission exists for ${duplicateAdmission.studentName} with ${email.label} (${emailValue}).`
                };
            }

            // Removed check against existing Student table to allow updates to Admission records
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
        // 1. Generate a secure token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

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
        const admission = await (prisma as any).admission.findUnique({
            where: { id },
        });

        if (!admission) return { success: false, error: "Admission not found" };

        // 1. Update Admission Stage & Persist Enrollment Choice
        // We update enrolledGrade so page reload keeps the state.
        await (prisma as any).admission.update({
            where: { id },
            data: {
                stage: "ENROLLED",
                enrolledGrade: grade
            }
        });

        // 2. Extract first/last name (naive split)
        const nameParts = admission.studentName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

        // 3. Create Student record
        try {
            await (prisma as any).student.create({
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
        } catch (dbError: any) {
            console.error("[APPROVE] Student Creation Failed:", dbError);
            // If student creation fails, revert admission stage? Or just warn?
            // Reverting for consistency
            await (prisma as any).admission.update({
                where: { id },
                data: { stage: "INTERVIEW" } // Revert to previous stage
            });

            // Check for unique constraint violation
            if (dbError.code === 'P2002') {
                return { success: false, error: "A student with this parent mobile/email already exists." };
            }
            return { success: false, error: "Failed to create Student record. Database error." };
        }

        revalidatePath(`/s/${slug}/admissions`);
        revalidatePath(`/s/${slug}/admissions/${id}`);
        revalidatePath(`/s/${slug}/students`);

        return { success: true };
    } catch (error: any) {
        console.error("Approve Admission Error:", error);
        return { success: false, error: error.message || "Failed to approve admission" };
    }
}

export async function uploadDocumentAction(slug: string, id: string, docKey: string, fileUrl: string) {
    try {
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
