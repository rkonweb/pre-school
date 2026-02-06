"use server";

import { Storage } from '@google-cloud/storage';
import { GCS_CONFIG } from './gcs-config';
import { promises as fs } from 'fs';
import path from 'path';

let storage: Storage | null = null;

function getStorageClient() {
    if (!storage) {
        if (!GCS_CONFIG.credentials) {
            throw new Error('Google Cloud credentials not configured');
        }

        storage = new Storage({
            projectId: GCS_CONFIG.projectId,
            credentials: GCS_CONFIG.credentials,
        });
    }
    return storage;
}

/**
 * Upload to local storage (fallback when GCS is not configured)
 */
async function uploadToLocal(
    file: Buffer,
    fileName: string,
    folder: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${timestamp}_${sanitizedName}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Write file
        await fs.writeFile(filePath, file);

        // Return public URL
        const publicUrl = `/uploads/${folder}/${uniqueFilename}`;

        return {
            success: true,
            url: publicUrl,
        };
    } catch (error: any) {
        console.error('Local Upload Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload file',
        };
    }
}

export async function uploadToGCS(
    file: Buffer,
    fileName: string,
    contentType: string,
    folder: 'homework' | 'worksheets' | 'videos' | 'voice-notes' | 'admissions' = 'homework'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Check if GCS is configured
        const hasGCSConfig = GCS_CONFIG.projectId && GCS_CONFIG.credentials;

        if (!hasGCSConfig) {
            // Fallback to local storage
            console.log('GCS not configured, using local storage fallback');
            return await uploadToLocal(file, fileName, folder);
        }

        const client = getStorageClient();
        const bucket = client.bucket(GCS_CONFIG.bucketName);

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${folder}/${timestamp}_${sanitizedName}`;

        const fileObj = bucket.file(path);

        // Upload with metadata
        await fileObj.save(file, {
            contentType,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        // Make file publicly accessible
        await fileObj.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${path}`;

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error('GCS Upload Error:', error);
        // Fallback to local storage on GCS error
        console.log('GCS upload failed, falling back to local storage');
        return await uploadToLocal(file, fileName, folder);
    }
}

export async function deleteFromGCS(fileUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        // If it's a local file, delete from local storage
        if (fileUrl.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', fileUrl);
            await fs.unlink(filePath);
            return { success: true };
        }

        const client = getStorageClient();
        const bucket = client.bucket(GCS_CONFIG.bucketName);

        // Extract file path from URL
        const urlParts = fileUrl.split(`${GCS_CONFIG.bucketName}/`);
        if (urlParts.length < 2) {
            throw new Error('Invalid file URL');
        }

        const filePath = urlParts[1];
        await bucket.file(filePath).delete();

        return { success: true };
    } catch (error: any) {
        console.error('Delete Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getSignedUploadUrl(
    fileName: string,
    contentType: string,
    folder: 'homework' | 'worksheets' | 'videos' | 'voice-notes' | 'admissions' = 'homework'
): Promise<{ success: boolean; uploadUrl?: string; publicUrl?: string; error?: string }> {
    try {
        const client = getStorageClient();
        const bucket = client.bucket(GCS_CONFIG.bucketName);

        const timestamp = Date.now();
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${folder}/${timestamp}_${sanitizedName}`;

        const file = bucket.file(path);

        // Generate signed URL for upload (valid for 15 minutes)
        const [uploadUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType,
        });

        const publicUrl = `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${path}`;

        return { success: true, uploadUrl, publicUrl };
    } catch (error: any) {
        console.error('GCS Signed URL Error:', error);
        return { success: false, error: error.message };
    }
}
