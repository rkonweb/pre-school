"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getAttendanceScope } from "./attendance-actions"; // Need to export this or move to shared
// Actually, circular dependency risk. I will duplicate the scope logic for safety or make a shared permission helper.
// Since I can't easily create new files without friction, I will inline the logic or assume I can export it.
// Let's try to export it from attendance-actions.ts inside the previous tool call? I did not check export.
// I will implement the logic inline here to be safe.

import { getCurrentUserAction } from "./session-actions";

export async function getStaffAction(schoolSlug: string) {
    try {
        let whereClause: any = {
            school: { slug: schoolSlug },
            role: { in: ["STAFF", "ADMIN"] }
        };

        const currentUserRes = await getCurrentUserAction();
        const viewingUserId = currentUserRes.success ? currentUserRes.data?.id : null;

        if (viewingUserId) {
            const user = await prisma.user.findUnique({
                where: { id: viewingUserId },
                include: { customRole: true } as any
            });

            if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
                let perms: any[] = [];
                try {
                    perms = typeof (user as any).customRole?.permissions === 'string'
                        ? JSON.parse((user as any).customRole.permissions)
                        : (user as any).customRole?.permissions;
                } catch (e) { }

                const attendPerm = perms?.find(p => p.module === "staff.attendance");

                if (attendPerm) {
                    // Logic hierarchy: Manage > Manage Selected > Manage Own > View
                    if (!attendPerm.actions.includes("manage") && !attendPerm.actions.includes("view")) {
                        if (attendPerm.actions.includes("manage_selected")) {
                            const access = await (prisma as any).staffAccess.findMany({
                                where: { managerId: viewingUserId },
                                select: { staffId: true }
                            });
                            const ids = access.map((a: any) => a.staffId);
                            if (!ids.includes(viewingUserId)) ids.push(viewingUserId);
                            whereClause.id = { in: ids };
                        } else if (attendPerm.actions.includes("manage_own")) {
                            whereClause.id = viewingUserId;
                        }
                    }
                }
            }
        }

        const staff = await prisma.user.findMany({
            where: whereClause,
            orderBy: {
                firstName: "asc"
            }
        });
        return { success: true, data: staff };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}



export async function createStaffAction(schoolSlug: string, formData: FormData) {
    try {
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug }
        });

        if (!school) return { success: false, error: "School not found" };

        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const mobile = formData.get("mobile") as string;
        const designation = formData.get("designation") as string;
        const department = formData.get("department") as string;
        const joiningDate = formData.get("joiningDate") as string;
        const avatarStr = formData.get("avatar") as string; // Placeholder

        // Global Phone Uniqueness Check
        if (mobile) {
            const { validatePhoneUniqueness } = await import("./phone-validation");
            const phoneCheck = await validatePhoneUniqueness(mobile);
            if (!phoneCheck.isValid) {
                return { success: false, error: phoneCheck.error };
            }
        }
        const gender = formData.get("gender") as string;
        const dateOfBirth = formData.get("dateOfBirth") as string;
        const bloodGroup = formData.get("bloodGroup") as string;
        const employmentType = formData.get("employmentType") as string;
        const qualifications = formData.get("qualifications") as string;
        const experience = formData.get("experience") as string;

        const address = formData.get("address") as string;
        const addressCity = formData.get("addressCity") as string;
        const addressState = formData.get("addressState") as string;
        const addressZip = formData.get("addressZip") as string;
        const addressCountry = formData.get("addressCountry") as string;

        const emergencyContactName = formData.get("emergencyContactName") as string;
        const emergencyContactRelation = formData.get("emergencyContactRelation") as string;
        const emergencyContactPhone = formData.get("emergencyContactPhone") as string;

        const bankName = formData.get("bankName") as string;
        const bankAccountNo = formData.get("bankAccountNo") as string;
        const bankIfsc = formData.get("bankIfsc") as string;

        const linkedin = formData.get("linkedin") as string;
        const avatarAdjustment = formData.get("avatarAdjustment") as string;
        let customRoleId = formData.get("customRoleId") as string | null;
        if (customRoleId === "") customRoleId = null;

        // Handle File Uploads
        const documents: Record<string, string> = {};

        const { writeFile } = await import("fs/promises");
        const { join } = await import("path");

        const processFile = async (key: string) => {
            const file = formData.get(key) as File;
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
                const path = join(process.cwd(), "public/uploads/staff", filename);
                await writeFile(path, buffer);
                return `/uploads/staff/${filename}`;
            }
            return null;
        };

        const cvPath = await processFile("cv");
        const idProofPath = await processFile("idProof");
        const certificatePath = await processFile("certificate");

        if (cvPath) documents.cv = cvPath;
        if (idProofPath) documents.idProof = idProofPath;
        if (certificatePath) documents.certificates = [certificatePath] as any;

        // Handle Avatar Upload if it's a file
        let avatarPath = avatarStr;
        const avatarFile = formData.get("avatarFile") as File;
        if (avatarFile && avatarFile.size > 0) {
            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            const filename = `avatar-${Date.now()}-${avatarFile.name.replace(/\s/g, "_")}`;
            const path = join(process.cwd(), "public/uploads/staff", filename);
            await writeFile(path, buffer);
            avatarPath = `/uploads/staff/${filename}`;
        }

        // Creating User
        const staff = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                mobile,
                role: "STAFF",

                // Professional
                designation,
                department,
                joiningDate: joiningDate ? new Date(joiningDate) : undefined,
                employmentType,
                qualifications,
                experience,
                status: "ACTIVE",

                // Personal
                gender,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                bloodGroup,
                avatar: avatarPath,

                // Address
                address,
                addressCity,
                addressState,
                addressZip,
                addressCountry,

                // Emergency
                emergencyContactName,
                emergencyContactRelation,
                emergencyContactPhone,

                // Bank
                bankName,
                bankAccountNo,
                bankIfsc,

                // Social
                linkedin,

                // Adjustment
                avatarAdjustment,

                // Role
                customRoleId,

                // Documents
                documents: JSON.stringify(documents),

                schoolId: school.id,
            } as any
        });
        return { success: true, data: staff };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffMemberAction(id: string) {
    try {
        const staff = await prisma.user.findUnique({
            where: { id },
            include: {
                salaryRevisions: {
                    orderBy: { effectiveDate: "desc" }
                }
            }
        });
        return { success: true, data: staff };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateStaffAction(id: string, formData: FormData) {
    try {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const mobile = formData.get("mobile") as string;
        const designation = formData.get("designation") as string;
        const department = formData.get("department") as string;
        const joiningDate = formData.get("joiningDate") as string;

        // Global Phone Uniqueness Check (exclude current user)
        if (mobile) {
            const { validatePhoneUniqueness } = await import("./phone-validation");
            const phoneCheck = await validatePhoneUniqueness(mobile, id);
            if (!phoneCheck.isValid) {
                return { success: false, error: phoneCheck.error };
            }
        }

        // Additional Fields
        const gender = formData.get("gender") as string;
        const dateOfBirth = formData.get("dateOfBirth") as string;
        const bloodGroup = formData.get("bloodGroup") as string;
        const employmentType = formData.get("employmentType") as string;
        const qualifications = formData.get("qualifications") as string;
        const experience = formData.get("experience") as string;

        const address = formData.get("address") as string;
        const addressCity = formData.get("addressCity") as string;
        const addressState = formData.get("addressState") as string;
        const addressZip = formData.get("addressZip") as string;
        const addressCountry = formData.get("addressCountry") as string;

        const emergencyContactName = formData.get("emergencyContactName") as string;
        const emergencyContactRelation = formData.get("emergencyContactRelation") as string;
        const emergencyContactPhone = formData.get("emergencyContactPhone") as string;

        const bankName = formData.get("bankName") as string;
        const bankAccountNo = formData.get("bankAccountNo") as string;
        const bankIfsc = formData.get("bankIfsc") as string;

        const linkedin = formData.get("linkedin") as string;
        const subjects = formData.get("subjects") as string; // New field
        const avatarAdjustment = formData.get("avatarAdjustment") as string;
        let customRoleId = formData.get("customRoleId") as string | null;
        if (customRoleId === "") customRoleId = null;

        const data: any = {
            firstName,
            lastName,
            email,
            mobile,
            designation,
            department,
            joiningDate: joiningDate ? new Date(joiningDate) : undefined,
            gender,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            bloodGroup,
            employmentType,
            subjects, // Add to data object
            qualifications,
            experience,
            address,
            addressCity,
            addressState,
            addressZip,
            addressCountry,
            emergencyContactName,
            emergencyContactRelation,
            emergencyContactPhone,
            bankName,
            bankAccountNo,
            bankIfsc,
            linkedin,
            avatarAdjustment,
            customRoleId
        };

        // Handle Avatar Upload if it's a file
        const avatarFile = formData.get("avatarFile") as File;
        if (avatarFile && avatarFile.size > 0) {
            const { writeFile } = await import("fs/promises");
            const { join } = await import("path");

            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            const filename = `avatar-${Date.now()}-${avatarFile.name.replace(/\s/g, "_")}`;
            const path = join(process.cwd(), "public/uploads/staff", filename);
            await writeFile(path, buffer);
            data.avatar = `/uploads/staff/${filename}`;
        }

        const staff = await prisma.user.update({
            where: { id },
            data: data as any, // Type assertion needed until Prisma Client is regenerated
            include: {
                school: {
                    select: { slug: true }
                }
            }
        });

        // Revalidate both the staff list and the edit page
        if (staff.school?.slug) {
            revalidatePath(`/s/${staff.school.slug}/staff`);
            revalidatePath(`/s/${staff.school.slug}/staff/${id}/edit`);
        }

        return { success: true, data: staff };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateStaffBasicInfoAction(schoolSlug: string, id: string, data: any) {
    try {
        const updated = await prisma.user.update({
            where: { id },
            data
        });
        revalidatePath(`/s/${schoolSlug}/staff`);
        revalidatePath(`/s/${schoolSlug}/staff/${id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Update Staff Field Error:", error);
        return { success: false, error: error.message || "Failed to update staff" };
    }
}

export async function deleteStaffAction(schoolSlug: string, id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function addSalaryRevisionAction(userId: string, data: {
    amount: number,
    effectiveDate: string,
    reason?: string,
    type?: string,
    currency?: string,
    basic?: number,
    hra?: number,
    allowance?: number,
    tax?: number,
    pf?: number,
    insurance?: number,
    customAdditions?: string,
    customDeductions?: string,
    netSalary?: number
}) {
    try {
        const revision = await prisma.salaryRevision.create({
            data: {
                userId,
                amount: Number(data.amount),
                effectiveDate: new Date(data.effectiveDate),
                revisionDate: new Date(),
                reason: data.reason,
                type: data.type || "INCREMENT",
                currency: data.currency || "INR",
                basic: Number(data.basic || 0),
                hra: Number(data.hra || 0),
                allowance: Number(data.allowance || 0),
                tax: Number(data.tax || 0),
                pf: Number(data.pf || 0),
                insurance: Number(data.insurance || 0),
                customAdditions: data.customAdditions,
                customDeductions: data.customDeductions,
                netSalary: Number(data.netSalary || 0)
            }
        });

        return { success: true, data: revision };
    } catch (error: any) {
        console.error("Add Salary Revision Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteSalaryRevisionAction(id: string) {
    try {
        await prisma.salaryRevision.delete({
            where: { id }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffClassAccessAction(userId: string) {
    try {
        const access = await prisma.classAccess.findMany({
            where: { userId },
            select: { classroomId: true, canRead: true }
        });
        return { success: true, access };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateStaffClassAccessBulkAction(userId: string, accessMap: Record<string, boolean>) {
    try {
        const activeClassIds = Object.entries(accessMap)
            .filter(([_, isActive]) => isActive)
            .map(([id]) => id);

        await prisma.$transaction(async (tx) => {
            // 1. Remove access for classes NOT in the active list
            await tx.classAccess.deleteMany({
                where: {
                    userId,
                    classroomId: { notIn: activeClassIds }
                }
            });

            // 2. Ensure active list exists
            for (const classId of activeClassIds) {
                const existing = await tx.classAccess.findUnique({
                    where: { userId_classroomId: { userId, classroomId: classId } }
                });

                if (!existing) {
                    await tx.classAccess.create({
                        data: {
                            userId,
                            classroomId: classId,
                            canRead: true,
                            canWrite: true,
                            canEdit: true,
                            canDelete: true
                        }
                    });
                }
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Bulk Update Access Error", error);
        return { success: false, error: error.message };
    }
}
