"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateUserSchoolAction, hasPermissionAction } from "./session-actions";
import { uploadToGoogleDriveNested } from "@/lib/google-drive-upload";

/**
 * Issue a Transfer Certificate to a student.
 * 
 * 1. Uploads the file to Google Drive (Category/Class/TCs).
 * 2. Creates a TransferCertificate record.
 * 3. Updates the Student status to ALUMNI.
 */
export async function issueTCAction(schoolSlug: string, formData: FormData) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success || !auth.user) return { success: false, error: auth.error };

        // Validate permissions
        if (!(await hasPermissionAction(auth.user, "students", "edit"))) {
            return { success: false, error: "Unauthorized to issue TC" };
        }

        const studentId = formData.get("studentId") as string;
        const tcNumber = formData.get("tcNumber") as string;
        const issueDate = formData.get("issueDate") as string;
        const reason = formData.get("reason") as string;
        const file = formData.get("file") as File;

        if (!studentId || !tcNumber || !issueDate) {
            return { success: false, error: "Missing required fields" };
        }

        // 1. Check if student exists
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { classroom: true, transferCertificate: true }
        });

        if (!student) return { success: false, error: "Student not found" };

        if (student.transferCertificate) {
            return { success: false, error: "TC already issued for this student" };
        }

        let documentUrl = "";

        // 2. Upload File (if provided)
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const className = student.classroom?.name || "Unassigned";

            // Folder Path: Transfer Certificates -> [Class Name]
            const folderPath = ["Transfer Certificates", className];

            const uploadRes = await uploadToGoogleDriveNested(
                buffer,
                `TC_${student.firstName}_${student.lastName}_${tcNumber}.pdf`,
                file.type,
                folderPath
            );

            if (uploadRes.success && uploadRes.url) {
                documentUrl = uploadRes.url;
            } else {
                console.error("TC Upload Failed:", uploadRes.error);
                // We proceed even if upload fails? Or fail strictly? 
                // Let's fail strictly for now as the requirement says "softcopy... can be uploaded" implying it's important.
                // But maybe allow it to be optional if file is missing. 
                // If file WAS provided but failed, we should error.
                return { success: false, error: "Failed to upload TC document: " + uploadRes.error };
            }
        }

        // 3. Create TC Record & Update Student Status
        await prisma.$transaction([
            (prisma as any).transferCertificate.create({
                data: {
                    studentId,
                    tcNumber,
                    issueDate: new Date(issueDate),
                    reason,
                    documentUrl,
                    status: "ISSUED"
                }
            }),
            prisma.student.update({
                where: { id: studentId },
                data: {
                    status: "ALUMNI",
                    leavingDate: new Date(issueDate),
                    classroom: { disconnect: true }, // Optional: remove from active class?
                    // Typically Alumni shouldn't be in a 'classroom' for attendance purposes, 
                    // but keeping history might be useful.
                    // Let's keep classroom linkage for record but status ALUMNI handles the logic.
                    // Actually, usually Alumni are removed from class lists.
                    // Let's NOT disconnect for now to keep the "Last Class" info easily accessible 
                    // unless there's a specific "Past Classes" table.
                }
            })
        ]);

        revalidatePath(`/s/${schoolSlug}/students/${studentId}`);
        revalidatePath(`/s/${schoolSlug}/students`);

        return { success: true };

    } catch (error: any) {
        console.error("Issue TC Error:", error);
        return { success: false, error: error.message };
    }
}
