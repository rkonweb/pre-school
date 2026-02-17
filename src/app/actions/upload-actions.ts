"use server";

import { uploadToGoogleDrive, uploadToGoogleDriveForSchool } from "@/lib/google-drive-upload";
import { getCurrentUserAction, validateUserSchoolAction } from "./session-actions";

export async function uploadFileAction(formData: FormData) {
    try {
        const schoolSlug = formData.get("schoolSlug") as string;

        if (schoolSlug) {
            const auth = await validateUserSchoolAction(schoolSlug);
            if (!auth.success) return { success: false, error: auth.error };
        } else {
            const user = await getCurrentUserAction();
            if (!user.success) return { success: false, error: "Unauthorized" };
        }

        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const folder = (formData.get("folder") as any) || "worksheets";

        // Use school-specific config if slug is provided
        if (schoolSlug) {
            const res = await uploadToGoogleDriveForSchool(
                buffer,
                file.name,
                file.type,
                schoolSlug,
                folder
            );
            return res;
        }

        // Fallback to env-based config
        const res = await uploadToGoogleDrive(
            buffer,
            file.name,
            file.type,
            folder
        );

        return res;
    } catch (error: any) {
        console.error("Upload Error:", error);
        return { success: false, error: error.message };
    }
}

// New function specifically for school uploads
export async function uploadFileForSchoolAction(formData: FormData, schoolSlug: string) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const folder = (formData.get("folder") as any) || "worksheets";

        const res = await uploadToGoogleDriveForSchool(
            buffer,
            file.name,
            file.type,
            schoolSlug,
            folder
        );

        return res;
    } catch (error: any) {
        console.error("Upload Error:", error);
        return { success: false, error: error.message };
    }
}

// Delete file from Google Drive or local storage
export async function deleteFileAction(fileUrl: string, schoolSlug?: string) {
    console.log("🗑️ deleteFileAction called:");
    console.log("   File URL:", fileUrl);
    console.log("   School Slug:", schoolSlug);

    try {
        if (schoolSlug) {
            const auth = await validateUserSchoolAction(schoolSlug);
            if (!auth.success) return { success: false, error: auth.error };
        } else {
            const user = await getCurrentUserAction();
            if (!user.success) return { success: false, error: "Unauthorized" };
        }

        const { deleteFileForSchool } = await import("@/lib/google-drive-upload");

        if (schoolSlug) {
            console.log("   Using school-specific delete...");
            const result = await deleteFileForSchool(fileUrl, schoolSlug);
            console.log("   Result:", result);
            return result;
        }

        // Fallback for env-based config
        const { deleteFile } = await import("@/lib/google-drive-upload");
        const result = await deleteFile(fileUrl);
        console.log("   Result:", result);
        return result;
    } catch (error: any) {
        console.error("Delete Error:", error);
        return { success: false, error: error.message };
    }
}

export async function uploadToSubfolderAction(
    formData: FormData,
    schoolSlug: string,
    mainFolder: string,
    subFolder: string
) {
    try {
        const auth = await validateUserSchoolAction(schoolSlug);
        if (!auth.success) return { success: false, error: auth.error };

        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const { uploadToGoogleDriveWithSubfolder } = await import("@/lib/google-drive-upload");

        const res = await uploadToGoogleDriveWithSubfolder(
            buffer,
            file.name,
            file.type,
            schoolSlug,
            mainFolder,
            subFolder
        );

        return res;
    } catch (error: any) {
        console.error("Subfolder Upload Error:", error);
        return { success: false, error: error.message };
    }
}

// Keeping this for backward compatibility if needed, but pointing to the general one
export async function uploadVehicleDocumentAction(
    formData: FormData,
    schoolSlug: string,
    registrationNumber: string
) {
    return uploadToSubfolderAction(formData, schoolSlug, "Vehicles", registrationNumber);
}
