"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction } from "./session-actions";
import { basename } from "path";

function maskStaffPII(staff: any, isAuthorized: boolean) {
    if (!staff) return staff;
    if (isAuthorized) return staff;

    // Mask sensitive fields
    const masked = { ...staff };
    delete masked.bankName;
    delete masked.bankAccountNo;
    delete masked.bankIfsc;
    delete masked.address;
    delete masked.addressCity;
    delete masked.addressState;
    delete masked.addressZip;
    delete masked.addressCountry;
    delete masked.documents;
    return masked;
}

export async function getStaffAction(schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const viewingUser = auth.user;
        const viewingUserId = viewingUser?.id;
        let whereClause: any = {
            school: { slug: schoolSlug },
            role: { in: ["STAFF", "ADMIN"] }
        };

        if (viewingUser && viewingUser.role !== "ADMIN" && viewingUser.role !== "SUPER_ADMIN") {
            let perms: any[] = [];
            try {
                perms = typeof (viewingUser as any).customRole?.permissions === 'string'
                    ? JSON.parse((viewingUser as any).customRole.permissions)
                    : (viewingUser as any).customRole?.permissions;
            } catch (e) { }

            const attendPerm = perms?.find(p => p.module === "staff.attendance");

            if (attendPerm && viewingUserId) {
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

        const staffList = await prisma.user.findMany({
            where: whereClause,
            orderBy: {
                firstName: "asc"
            }
        });

        // PII Masking: Only ADMIN or users with specific payroll access see bank/address details in lists.
        const isAuthorized = viewingUser?.role === 'ADMIN' || viewingUser?.role === 'SUPER_ADMIN';
        const maskedStaff = staffList.map(s => maskStaffPII(s, isAuthorized));

        return { success: true, data: maskedStaff };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}



export async function createStaffAction(schoolSlug: string, formData: FormData) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

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
            const { validatePhoneUniqueness, validateEmailUniqueness } = await import("./identity-validation");
            const phoneCheck = await validatePhoneUniqueness(mobile);
            if (!phoneCheck.isValid) {
                return { success: false, error: phoneCheck.error };
            }

            // Global Email Uniqueness Check
            if (email) {
                const emailCheck = await validateEmailUniqueness(email);
                if (!emailCheck.isValid) {
                    return { success: false, error: emailCheck.error };
                }
            }
        } else if (email) {
            const { validateEmailUniqueness } = await import("./identity-validation");
            const emailCheck = await validateEmailUniqueness(email);
            if (!emailCheck.isValid) {
                return { success: false, error: emailCheck.error };
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
                // Sanitize filename to prevent path traversal
                const safeName = `${Date.now()}-${basename(file.name).replace(/[^a-zA-Z0-9.-]/g, "_")}`;
                const path = join(process.cwd(), "public/uploads/staff", safeName);
                await writeFile(path, buffer);
                return `/uploads/staff/${safeName}`;
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
            const safeName = `avatar-${Date.now()}-${basename(avatarFile.name).replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const path = join(process.cwd(), "public/uploads/staff", safeName);
            await writeFile(path, buffer);
            avatarPath = `/uploads/staff/${safeName}`;
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

export async function getStaffMemberAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const staff = await prisma.user.findUnique({
            where: { id },
            include: {
                salaryRevisions: {
                    orderBy: { effectiveDate: "desc" }
                }
            }
        });

        // PII Masking for individual member
        // Staff can see their own full details. ADMINs can see everything.
        const isAuthorized = auth.user && (auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN' || auth.user.id === id);
        const maskedStaff = maskStaffPII(staff, !!isAuthorized);

        return { success: true, data: maskedStaff };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateStaffAction(schoolSlug: string, id: string, formData: FormData) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const mobile = formData.get("mobile") as string;
        const designation = formData.get("designation") as string;
        const department = formData.get("department") as string;
        const joiningDate = formData.get("joiningDate") as string;

        // Global Phone Uniqueness Check (exclude current user)
        if (mobile) {
            const { validatePhoneUniqueness, validateEmailUniqueness } = await import("./identity-validation");
            const phoneCheck = await validatePhoneUniqueness(mobile, id);
            if (!phoneCheck.isValid) {
                return { success: false, error: phoneCheck.error };
            }

            // Global Email Uniqueness Check
            if (email) {
                const emailCheck = await validateEmailUniqueness(email, id);
                if (!emailCheck.isValid) {
                    return { success: false, error: emailCheck.error };
                }
            }
        } else if (email) {
            const { validateEmailUniqueness } = await import("./identity-validation");
            const emailCheck = await validateEmailUniqueness(email, id);
            if (!emailCheck.isValid) {
                return { success: false, error: emailCheck.error };
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
            const safeName = `avatar-${Date.now()}-${basename(avatarFile.name).replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const path = join(process.cwd(), "public/uploads/staff", safeName);
            await writeFile(path, buffer);
            data.avatar = `/uploads/staff/${safeName}`;
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
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

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
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        await prisma.user.delete({
            where: { id }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function addSalaryRevisionAction(schoolSlug: string, userId: string, data: {
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
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        // Ensure only ADMIN or payroll managers can edit salary
        if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Only admins can manage salary revisions" };
        }

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

export async function deleteSalaryRevisionAction(schoolSlug: string, id: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        if (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN') {
            return { success: false, error: "Only admins can delete salary revisions" };
        }

        await prisma.salaryRevision.delete({
            where: { id }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStaffClassAccessAction(schoolSlug: string, userId: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const access = await prisma.classAccess.findMany({
            where: { userId },
            select: { classroomId: true, canRead: true }
        });
        return { success: true, access };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateStaffClassAccessBulkAction(schoolSlug: string, userId: string, accessMap: Record<string, boolean>) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

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
