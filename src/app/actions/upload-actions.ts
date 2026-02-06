"use server";

import { uploadToGoogleDrive } from "@/lib/google-drive-upload";

export async function uploadFileAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) return { success: false, error: "No file provided" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const folder = (formData.get("folder") as any) || "worksheets";

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
