// Google Drive API Configuration
// Add these to your .env file:
// GOOGLE_DRIVE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
// GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
// GOOGLE_DRIVE_FOLDER_ID=optional-folder-id (if you want files in a specific folder)

export const GOOGLE_DRIVE_CONFIG = {
    clientEmail: process.env.GOOGLE_DRIVE_CLIENT_EMAIL || '',
    privateKey: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || null, // null = root folder
};

export const UPLOAD_LIMITS = {
    maxPdfSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    allowedPdfTypes: ['application/pdf'],
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
};

// Check if Google Drive is configured
export function isGoogleDriveConfigured(): boolean {
    return !!(GOOGLE_DRIVE_CONFIG.clientEmail && GOOGLE_DRIVE_CONFIG.privateKey);
}
