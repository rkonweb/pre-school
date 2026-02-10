"use server";

import { google } from 'googleapis';
import { getGoogleDriveConfigForSchool, GOOGLE_DRIVE_CONFIG, isGoogleDriveConfigured } from './google-drive-config';
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
 * Upload file to Google Drive (with school-specific config from database)
 */
export async function uploadToGoogleDriveForSchool(
    file: Buffer,
    fileName: string,
    mimeType: string,
    schoolSlug: string,
    folder: 'homework' | 'worksheets' | 'videos' | 'voice-notes' | 'admissions' = 'worksheets'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Get school-specific config from database
        const config = await getGoogleDriveConfigForSchool(schoolSlug);

        if (!config.enabled || !config.clientEmail || !config.privateKey) {
            console.log('⚠️ Google Drive not configured for school, using local storage fallback');
            return await uploadToLocal(file, fileName, folder);
        }

        console.log(`📤 Uploading to Google Drive for school: ${schoolSlug}`);

        // Initialize Google Drive API
        const auth = new google.auth.JWT({
            email: config.clientEmail,
            key: config.privateKey,
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
        if (config.folderId) {
            fileMetadata.parents = [config.folderId];
        }

        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true, // Required for Shared Drives
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
            supportsAllDrives: true, // Required for Shared Drives
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
 * Upload file to Google Drive (using env variables - legacy)
 */
export async function uploadToGoogleDrive(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: 'homework' | 'worksheets' | 'videos' | 'voice-notes' | 'admissions' = 'worksheets'
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Check if Google Drive is configured via env
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

            // Extract file ID from URL - handles multiple formats
            let fileId: string | null = null;

            const idParamMatch = fileUrl.match(/[?&]id=([^&]+)/);
            if (idParamMatch) {
                fileId = idParamMatch[1];
            }

            if (!fileId) {
                const fileDMatch = fileUrl.match(/\/file\/d\/([^/]+)/);
                if (fileDMatch) {
                    fileId = fileDMatch[1];
                }
            }

            if (!fileId) {
                console.error('Could not extract file ID from URL:', fileUrl);
                return { success: false, error: 'Invalid Google Drive URL format' };
            }

            console.log('🗑️ Deleting file ID:', fileId);

            // Initialize Google Drive API
            const auth = new google.auth.JWT({
                email: GOOGLE_DRIVE_CONFIG.clientEmail,
                key: GOOGLE_DRIVE_CONFIG.privateKey,
                scopes: ['https://www.googleapis.com/auth/drive'],
            });

            const drive = google.drive({ version: 'v3', auth });

            // Delete file with Shared Drive support
            await drive.files.delete({
                fileId,
                supportsAllDrives: true,
            });

            console.log(`✅ Deleted Google Drive file: ${fileId}`);
            return { success: true };
        }

        return { success: false, error: 'Unknown file type' };
    } catch (error: any) {
        console.error('❌ Delete Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete file from Google Drive or local storage (with school-specific config)
 */
export async function deleteFileForSchool(fileUrl: string, schoolSlug: string): Promise<{ success: boolean; error?: string }> {
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
            // Get school-specific config
            const config = await getGoogleDriveConfigForSchool(schoolSlug);

            if (!config.enabled || !config.clientEmail || !config.privateKey) {
                return { success: false, error: 'Google Drive not configured for school' };
            }

            // Extract file ID from URL - handles multiple formats:
            // https://drive.google.com/uc?export=view&id=XXX
            // https://drive.google.com/file/d/XXX/view
            // https://drive.google.com/open?id=XXX
            let fileId: string | null = null;

            // Try ?id= or &id= format
            const idParamMatch = fileUrl.match(/[?&]id=([^&]+)/);
            if (idParamMatch) {
                fileId = idParamMatch[1];
            }

            // Try /file/d/XXX/ format
            if (!fileId) {
                const fileDMatch = fileUrl.match(/\/file\/d\/([^/]+)/);
                if (fileDMatch) {
                    fileId = fileDMatch[1];
                }
            }

            if (!fileId) {
                console.error('Could not extract file ID from URL:', fileUrl);
                return { success: false, error: 'Invalid Google Drive URL format' };
            }

            console.log('🗑️ Deleting file ID:', fileId);

            // Initialize Google Drive API
            const auth = new google.auth.JWT({
                email: config.clientEmail,
                key: config.privateKey,
                scopes: ['https://www.googleapis.com/auth/drive'],
            });

            const drive = google.drive({ version: 'v3', auth });

            // Delete file with Shared Drive support
            await drive.files.delete({
                fileId,
                supportsAllDrives: true,
            });

            console.log(`✅ Deleted Google Drive file: ${fileId}`);
            return { success: true };
        }

        return { success: false, error: 'Unknown file type' };
    } catch (error: any) {
        console.error('❌ Delete Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get or create a folder in Google Drive
 */
async function getOrCreateFolder(
    drive: any,
    folderName: string,
    parentId?: string
): Promise<string> {
    try {
        let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const response: any = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        const files = response.data.files;
        if (files && files.length > 0) {
            return files[0].id;
        }

        // Create the folder
        const fileMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        if (parentId) {
            fileMetadata.parents = [parentId];
        }

        const folder: any = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
            supportsAllDrives: true,
        });

        return folder.data.id;
    } catch (error) {
        console.error('❌ Google Drive Folder Error:', error);
        throw error;
    }
}

/**
 * Upload file to Google Drive with automatic subfolder creation
 */
export async function uploadToGoogleDriveWithSubfolder(
    file: Buffer,
    fileName: string,
    mimeType: string,
    schoolSlug: string,
    mainFolder: string,
    subFolderName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const config = await getGoogleDriveConfigForSchool(schoolSlug);

        if (!config.enabled || !config.clientEmail || !config.privateKey) {
            return await uploadToLocal(file, fileName, `${mainFolder}/${subFolderName}`);
        }

        const auth = new google.auth.JWT({
            email: config.clientEmail,
            key: config.privateKey,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // 1. Get/Create Main Folder (e.g., 'Transport' or 'Vehicles')
        const mainFolderId = await getOrCreateFolder(drive, mainFolder, config.folderId || undefined);

        // 2. Get/Create Subfolder (e.g., Registration Number)
        const subFolderId = await getOrCreateFolder(drive, subFolderName, mainFolderId);

        // 3. Upload File
        const bufferStream = new Readable();
        bufferStream.push(file);
        bufferStream.push(null);

        const fileMetadata: any = {
            name: fileName,
            mimeType: mimeType,
            parents: [subFolderId],
        };

        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        });

        const fileId = response.data.id;
        if (!fileId) throw new Error('Failed to get file ID');

        await drive.permissions.create({
            fileId: fileId,
            requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true,
        });

        return {
            success: true,
            url: `https://drive.google.com/uc?export=view&id=${fileId}`,
        };
    } catch (error: any) {
        console.error('❌ Subfolder Upload Error:', error);
        return await uploadToLocal(file, fileName, `${mainFolder}/${subFolderName}`);
    }
}
/**
 * Upload file to Google Drive with deep nested folder creation (env config version)
 */
export async function uploadToGoogleDriveNested(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folderPath: string[]
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        if (!isGoogleDriveConfigured()) {
            return await uploadToLocal(file, fileName, folderPath.join('/'));
        }

        const auth = new google.auth.JWT({
            email: GOOGLE_DRIVE_CONFIG.clientEmail,
            key: GOOGLE_DRIVE_CONFIG.privateKey,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // 1. Traverse/Create folder hierarchy
        let currentParentId = GOOGLE_DRIVE_CONFIG.folderId || undefined;
        for (const folderName of folderPath) {
            currentParentId = await getOrCreateFolder(drive, folderName, currentParentId);
        }

        // 2. Upload file
        const bufferStream = new Readable();
        bufferStream.push(file);
        bufferStream.push(null);

        const fileMetadata: any = {
            name: fileName,
            mimeType: mimeType,
            parents: currentParentId ? [currentParentId] : undefined,
        };

        const media = {
            mimeType: mimeType,
            body: bufferStream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
            supportsAllDrives: true,
        });

        const fileId = response.data.id;
        if (!fileId) throw new Error('Failed to get file ID');

        await drive.permissions.create({
            fileId: fileId,
            requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true,
        });

        return {
            success: true,
            url: `https://drive.google.com/uc?export=view&id=${fileId}`,
        };
    } catch (error: any) {
        console.error('❌ Nested Upload Error:', error);
        return await uploadToLocal(file, fileName, folderPath.join('/'));
    }
}
