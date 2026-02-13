import { prisma } from "@/lib/prisma";

// Static config from environment variables (fallback)
export const GOOGLE_DRIVE_CONFIG = {
    clientEmail: process.env.GOOGLE_DRIVE_CLIENT_EMAIL || '',
    privateKey: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || null,
};

export const UPLOAD_LIMITS = {
    maxPdfSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    allowedPdfTypes: ['application/pdf'],
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
};

// Check if static config is available
export function isGoogleDriveConfigured(): boolean {
    return !!(GOOGLE_DRIVE_CONFIG.clientEmail && GOOGLE_DRIVE_CONFIG.privateKey);
}

// Get Google Drive config for a specific school (from database)
export async function getGoogleDriveConfigForSchool(slug: string): Promise<{
    enabled: boolean;
    clientEmail: string;
    privateKey: string;
    folderId: string | null;
}> {
    try {
        const school = await prisma.school.findUnique({
            where: { slug },
            select: { integrationsConfig: true }
        });

        if (!school?.integrationsConfig) {
            // Fall back to env variables
            return {
                enabled: isGoogleDriveConfigured(),
                clientEmail: GOOGLE_DRIVE_CONFIG.clientEmail,
                privateKey: GOOGLE_DRIVE_CONFIG.privateKey,
                folderId: GOOGLE_DRIVE_CONFIG.folderId,
            };
        }

        const config = JSON.parse(school.integrationsConfig);
        const googleDrive = config.googleDrive;

        if (googleDrive?.isActive && googleDrive?.serviceAccountEmail && googleDrive?.privateKey) {
            // Handle various newline formats from user input
            let privateKey = googleDrive.privateKey;
            // Replace literal \\n with actual newlines
            privateKey = privateKey.replace(/\\n/g, '\n');

            return {
                enabled: true,
                clientEmail: googleDrive.serviceAccountEmail,
                privateKey: privateKey,
                folderId: googleDrive.folderId || null,
            };
        }

        // Fall back to env variables
        return {
            enabled: isGoogleDriveConfigured(),
            clientEmail: GOOGLE_DRIVE_CONFIG.clientEmail,
            privateKey: GOOGLE_DRIVE_CONFIG.privateKey,
            folderId: GOOGLE_DRIVE_CONFIG.folderId,
        };
    } catch (error) {
        console.error("Error getting Google Drive config:", error);
        // Fall back to env variables
        return {
            enabled: isGoogleDriveConfigured(),
            clientEmail: GOOGLE_DRIVE_CONFIG.clientEmail,
            privateKey: GOOGLE_DRIVE_CONFIG.privateKey,
            folderId: GOOGLE_DRIVE_CONFIG.folderId,
        };
    }
}

// Get Global Google Drive config (System Settings)
export async function getGlobalGoogleDriveConfig(): Promise<{
    enabled: boolean;
    clientEmail: string;
    privateKey: string;
    folderId: string | null;
}> {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: 'global' },
            select: { integrationsConfig: true }
        });

        if (!settings?.integrationsConfig) {
            return {
                enabled: isGoogleDriveConfigured(),
                clientEmail: GOOGLE_DRIVE_CONFIG.clientEmail,
                privateKey: GOOGLE_DRIVE_CONFIG.privateKey,
                folderId: GOOGLE_DRIVE_CONFIG.folderId,
            };
        }

        const config = JSON.parse(settings.integrationsConfig);
        const googleDrive = config.googleDrive;

        // Check for new schema (serviceAccountEmail, isActive)
        if (googleDrive?.isActive && googleDrive?.serviceAccountEmail && googleDrive?.privateKey) {
            let privateKey = googleDrive.privateKey;
            privateKey = privateKey.replace(/\\n/g, '\n');

            return {
                enabled: true,
                clientEmail: googleDrive.serviceAccountEmail,
                privateKey: privateKey,
                folderId: googleDrive.folderId || null,
            };
        }

        return {
            enabled: isGoogleDriveConfigured(),
            clientEmail: GOOGLE_DRIVE_CONFIG.clientEmail,
            privateKey: GOOGLE_DRIVE_CONFIG.privateKey,
            folderId: GOOGLE_DRIVE_CONFIG.folderId,
        };

    } catch (error) {
        console.error("Error getting Global Google Drive config:", error);
        return {
            enabled: isGoogleDriveConfigured(),
            clientEmail: GOOGLE_DRIVE_CONFIG.clientEmail,
            privateKey: GOOGLE_DRIVE_CONFIG.privateKey,
            folderId: GOOGLE_DRIVE_CONFIG.folderId,
        };
    }
}
