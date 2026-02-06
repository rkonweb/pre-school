"use server";

import { google } from 'googleapis';
import { GOOGLE_DRIVE_CONFIG, isGoogleDriveConfigured } from './google-drive-config';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';

/**
 * Upload to local storage (fallback when Google Drive is not configured)
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

        console.log(`✅ File uploaded to local storage: ${publicUrl}`);

        return {
            success: true,
            url: publicUrl,
        };
    } catch (error: any) {
        console.error('❌ Local Upload Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload file',
        };
    }
}

/**
 * Upload file to Google Drive
 */
export async function uploadToGoogleDrive(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: 'homework' | 'worksheets' | 'videos' | 'voice-notes' | 'admissions' = 'worksheets'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Check if Google Drive is configured
        if (!isGoogleDriveConfigured()) {
            console.log('⚠️ Google Drive not configured, using local storage fallback');
            return await uploadToLocal(file, fileName, folder);
        }

        // Initialize Google Drive API
        const auth = new google.auth.JWT({
            email: GOOGLE_DRIVE_CONFIG.clientEmail,
            key: GOOGLE_DRIVE_CONFIG.privateKey,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${folder}_${timestamp}_${sanitizedName}`;

        // Convert Buffer to Stream
        const bufferStream = new Readable();
        bufferStream.push(file);
        bufferStream.push(null);

        // Upload file to Google Drive
        const fileMetadata: any = {
            name: uniqueFilename,
            mimeType: mimeType,
        };

        // If folder ID is specified, upload to that folder
        if (GOOGLE_DRIVE_CONFIG.folderId) {
            fileMetadata.parents = [GOOGLE_DRIVE_CONFIG.folderId];
        }

        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = response.data.id;

        if (!fileId) {
            throw new Error('Failed to get file ID from Google Drive');
        }

        // Make file publicly accessible
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Get direct download link
        const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

        console.log(`✅ File uploaded to Google Drive: ${publicUrl}`);

        return {
            success: true,
            url: publicUrl,
        };
    } catch (error: any) {
        console.error('❌ Google Drive Upload Error:', error);

        // Fallback to local storage on error
        console.log('⚠️ Falling back to local storage due to Google Drive error');
        return await uploadToLocal(file, fileName, folder);
    }
}

/**
 * Delete file from Google Drive or local storage
 */
export async function deleteFile(fileUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if it's a local file
        if (fileUrl.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', fileUrl);
            await fs.unlink(filePath);
            console.log(`✅ Deleted local file: ${fileUrl}`);
            return { success: true };
        }

        // Check if it's a Google Drive file
        if (fileUrl.includes('drive.google.com')) {
            if (!isGoogleDriveConfigured()) {
                return { success: false, error: 'Google Drive not configured' };
            }

            // Extract file ID from URL
            const fileIdMatch = fileUrl.match(/id=([^&]+)/);
            if (!fileIdMatch) {
                return { success: false, error: 'Invalid Google Drive URL' };
            }

            const fileId = fileIdMatch[1];

            // Initialize Google Drive API
            const auth = new google.auth.JWT({
                email: GOOGLE_DRIVE_CONFIG.clientEmail,
                key: GOOGLE_DRIVE_CONFIG.privateKey,
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });

            const drive = google.drive({ version: 'v3', auth });

            // Delete file
            await drive.files.delete({ fileId });

            console.log(`✅ Deleted Google Drive file: ${fileId}`);
            return { success: true };
        }

        return { success: false, error: 'Unknown file type' };
    } catch (error: any) {
        console.error('❌ Delete Error:', error);
        return { success: false, error: error.message };
    }
}
