"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";

// Helper: Calculate BMI
function calculateBMI(weightKg: number, heightCm: number): number {
    if (!weightKg || !heightCm || heightCm === 0) return 0;
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

// Helper: Get BMI Status
function getBMIStatus(bmi: number, ageYears?: number): string {
    if (bmi === 0) return "Unknown";
    // Simplified classification (should be age/gender specific in production)
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

export async function createHealthRecordAction(
    slug: string,
    studentId: string,
    data: {
        height: number;
        heightUnit: string;
        weight: number;
        weightUnit: string;
        bloodGroup?: string;
        vision?: string;
        visionLeft?: string;
        visionRight?: string;
        dental?: string;
        dentalNotes?: string;
        hearing?: string;
        bloodPressure?: string;
        temperature?: number;
        pulseRate?: number;
        allergies?: string;
        medications?: string;
        chronicConditions?: string;
        observations?: string;
        doctorName?: string;
        nextCheckupDate?: Date;
        recordedAt: Date;
    }
) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school) return { success: false, error: "School not found" };

        // Verify student belongs to this school
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { schoolId: true }
        });

        if (!student || student.schoolId !== school.id) {
            return { success: false, error: "Student not found in this school" };
        }

        // Convert to metric if needed
        let heightCm = data.height;
        let weightKg = data.weight;

        if (data.heightUnit === "ft") {
            heightCm = data.height * 30.48; // feet to cm
        }
        if (data.weightUnit === "lbs") {
            weightKg = data.weight * 0.453592; // pounds to kg
        }

        // Calculate BMI
        const bmi = calculateBMI(weightKg, heightCm);

        // Pack extra data into generalHealth JSON
        const extraData = {
            heightUnit: data.heightUnit,
            weightUnit: data.weightUnit,
            bloodGroup: data.bloodGroup,
            vision: data.vision,
            dentalNotes: data.dentalNotes,
            hearing: data.hearing,
            temperature: data.temperature,
            allergies: data.allergies,
            medications: data.medications,
            chronicConditions: data.chronicConditions,
            observations: data.observations,
            doctorName: data.doctorName,
            nextCheckupDate: data.nextCheckupDate,
        };

        const record = await prisma.studentHealthRecord.create({
            data: {
                studentId,
                height: heightCm,
                weight: weightKg,
                bmi,
                // Map known schema fields
                visionLeft: data.visionLeft,
                visionRight: data.visionRight,
                dentalStatus: data.dental,
                bloodPressure: data.bloodPressure,
                pulseRate: data.pulseRate,
                // Store everything else in generalHealth
                generalHealth: JSON.stringify(extraData),
                recordedAt: data.recordedAt,
                recordedById: auth.user.id
            }
        });

        revalidatePath(`/s/${slug}/students/${studentId}`);
        revalidatePath(`/s/${slug}/students/reports/student/${studentId}`);

        return { success: true, data: record };
    } catch (error: any) {
        console.error("Create Health Record Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getHealthRecordsAction(slug: string, studentId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school) return { success: false, error: "School not found" };

        // Verify student belongs to this school
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { schoolId: true, dateOfBirth: true }
        });

        if (!student || student.schoolId !== school.id) {
            return { success: false, error: "Student not found in this school" };
        }

        const records = await prisma.studentHealthRecord.findMany({
            where: { studentId },
            orderBy: { recordedAt: 'desc' },
            include: {
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Calculate age for BMI context
        let ageYears = 0;
        if (student.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(student.dateOfBirth);
            ageYears = today.getFullYear() - birthDate.getFullYear();
        }

        // Enhance records with BMI status and unpacked JSON data
        const enhancedRecords = records.map(record => {
            let extraData: any = {};
            try {
                if (record.generalHealth && record.generalHealth.trim().startsWith('{')) {
                    extraData = JSON.parse(record.generalHealth);
                    // Restore Date objects if needed
                    if (extraData.nextCheckupDate) {
                        extraData.nextCheckupDate = new Date(extraData.nextCheckupDate);
                    }
                } else if (record.generalHealth) {
                    // Fallback for legacy text
                    extraData = { observations: record.generalHealth };
                }
            } catch (e) {
                // Ignore parse errors
            }

            return {
                ...record,
                bmiStatus: getBMIStatus(record.bmi || 0, ageYears),
                // Map backend fields to frontend expected fields
                dental: record.dentalStatus,
                recordedByUser: record.recordedBy,
                // Spread unpacked extra data
                ...extraData
            };
        });

        return { success: true, data: enhancedRecords };
    } catch (error: any) {
        console.error("Get Health Records Error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateHealthRecordAction(
    slug: string,
    recordId: string,
    data: {
        height?: number;
        heightUnit?: string;
        weight?: number;
        weightUnit?: string;
        bloodGroup?: string;
        vision?: string;
        visionLeft?: string;
        visionRight?: string;
        dental?: string;
        dentalNotes?: string;
        hearing?: string;
        bloodPressure?: string;
        temperature?: number;
        pulseRate?: number;
        allergies?: string;
        medications?: string;
        chronicConditions?: string;
        observations?: string;
        doctorName?: string;
        nextCheckupDate?: Date;
        recordedAt?: Date;
    }
) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        const existingRecord = await prisma.studentHealthRecord.findUnique({
            where: { id: recordId },
            include: {
                student: {
                    select: { schoolId: true }
                }
            }
        });

        if (!existingRecord) {
            return { success: false, error: "Health record not found" };
        }

        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school || existingRecord.student.schoolId !== school.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Recalculate BMI if height or weight changed
        let heightCm = data.height || existingRecord.height || 0;
        let weightKg = data.weight || existingRecord.weight || 0;
        let bmi = existingRecord.bmi;

        // Unpack existing extra data to merge
        let existingExtra: any = {};
        try {
            if (existingRecord.generalHealth && existingRecord.generalHealth.trim().startsWith('{')) {
                existingExtra = JSON.parse(existingRecord.generalHealth);
            }
        } catch (e) { }

        // Handle unit conversions if provided
        if (data.heightUnit === "ft" && data.height) {
            heightCm = data.height * 30.48;
        }
        if (data.weightUnit === "lbs" && data.weight) {
            weightKg = data.weight * 0.453592;
        }

        // Recalculate BMI if needed
        if (data.height || data.weight) {
            bmi = calculateBMI(weightKg, heightCm);
        }

        // Merge extra data
        const newExtraData = {
            ...existingExtra,
            ...(data.heightUnit && { heightUnit: data.heightUnit }),
            ...(data.weightUnit && { weightUnit: data.weightUnit }),
            ...(data.bloodGroup && { bloodGroup: data.bloodGroup }),
            ...(data.vision && { vision: data.vision }),
            ...(data.dentalNotes && { dentalNotes: data.dentalNotes }),
            ...(data.hearing && { hearing: data.hearing }),
            ...(data.temperature && { temperature: data.temperature }),
            ...(data.allergies && { allergies: data.allergies }),
            ...(data.medications && { medications: data.medications }),
            ...(data.chronicConditions && { chronicConditions: data.chronicConditions }),
            ...(data.observations && { observations: data.observations }),
            ...(data.doctorName && { doctorName: data.doctorName }),
            ...(data.nextCheckupDate && { nextCheckupDate: data.nextCheckupDate }),
        };

        const record = await prisma.studentHealthRecord.update({
            where: { id: recordId },
            data: {
                height: heightCm,
                weight: weightKg,
                bmi,
                ...(data.visionLeft && { visionLeft: data.visionLeft }),
                ...(data.visionRight && { visionRight: data.visionRight }),
                ...(data.dental && { dentalStatus: data.dental }),
                ...(data.bloodPressure && { bloodPressure: data.bloodPressure }),
                ...(data.pulseRate && { pulseRate: data.pulseRate }),
                ...(data.recordedAt && { recordedAt: data.recordedAt }),
                generalHealth: JSON.stringify(newExtraData)
            }
        });

        revalidatePath(`/s/${slug}/students/${existingRecord.studentId}`);
        revalidatePath(`/s/${slug}/students/reports/student/${existingRecord.studentId}`);

        return { success: true, data: record };
    } catch (error: any) {
        console.error("Update Health Record Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteHealthRecordAction(slug: string, recordId: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const existingRecord = await prisma.studentHealthRecord.findUnique({
            where: { id: recordId },
            include: {
                student: {
                    select: { schoolId: true, id: true }
                }
            }
        });

        if (!existingRecord) {
            return { success: false, error: "Health record not found" };
        }

        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school || existingRecord.student.schoolId !== school.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.studentHealthRecord.delete({
            where: { id: recordId }
        });

        revalidatePath(`/s/${slug}/students/${existingRecord.student.id}`);
        revalidatePath(`/s/${slug}/students/reports/student/${existingRecord.student.id}`);

        return { success: true };
    } catch (error: any) {
        console.error("Delete Health Record Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getAllStudentHealthRecordsAction(slug: string) {
    try {
        const auth = await validateUserSchoolAction(slug);
        if (!auth.success) return { success: false, error: auth.error };

        const school = await prisma.school.findUnique({ where: { slug } });
        if (!school) return { success: false, error: "School not found" };

        const students = await prisma.student.findMany({
            where: {
                schoolId: school.id,
                status: "ACTIVE" // Only active students? Usually yes.
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                gender: true,
                dateOfBirth: true,
                bloodGroup: true,
                allergies: true,
                medicalConditions: true,
                classroom: {
                    select: { name: true }
                },
                healthRecords: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });

        // Enhance with latest health record data
        const enhancedStudents = students.map(student => {
            const latestRecord = student.healthRecords[0];
            let healthData: any = {};
            let bmiStatus = "Unknown";

            if (latestRecord) {
                // Parse JSON
                try {
                    if (latestRecord.generalHealth && latestRecord.generalHealth.trim().startsWith('{')) {
                        const parsed = JSON.parse(latestRecord.generalHealth);
                        healthData = { ...parsed };
                        // Restore Date objects if needed
                        if (healthData.nextCheckupDate) {
                            healthData.nextCheckupDate = new Date(healthData.nextCheckupDate);
                        }
                    } else if (latestRecord.generalHealth) {
                        healthData = { observations: latestRecord.generalHealth };
                    }
                } catch (e) { }

                // Calculate age for BMI
                let ageYears = 0;
                if (student.dateOfBirth) {
                    const today = new Date();
                    const birthDate = new Date(student.dateOfBirth);
                    ageYears = today.getFullYear() - birthDate.getFullYear();
                }

                bmiStatus = getBMIStatus(latestRecord.bmi || 0, ageYears);
            }

            return {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                admissionNumber: student.admissionNumber,
                className: student.classroom?.name || "N/A",
                sectionName: "", // No explicit section field in schema, assumed part of classroom name
                gender: student.gender,
                hasRecord: !!latestRecord,
                lastCheckup: latestRecord?.recordedAt || null,
                height: latestRecord?.height || null,
                weight: latestRecord?.weight || null,
                bmi: latestRecord?.bmi || null,
                bmiStatus,
                bloodGroup: healthData.bloodGroup || student.bloodGroup || null, // Fallback to student profile blood group if available
                allergies: healthData.allergies || student.allergies || null,
                chronicConditions: healthData.chronicConditions || student.medicalConditions || null,
                vision: healthData.vision || null,
                dental: latestRecord?.dentalStatus || null
            };
        });

        return { success: true, data: enhancedStudents };
    } catch (error: any) {
        console.error("Get All Students Health Error:", error);
        return { success: false, error: error.message };
    }
}
