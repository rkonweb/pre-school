// Google Cloud Storage Configuration
// Add these to your .env file:
// GOOGLE_CLOUD_PROJECT_ID=your-project-id
// GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
// GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}

export const GCS_CONFIG = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    bucketName: process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'preschool-homework',
    credentials: process.env.GOOGLE_CLOUD_CREDENTIALS
        ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
        : null,
};

export const UPLOAD_LIMITS = {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 15 * 1024 * 1024, // 15MB
    maxVideoDuration: 15, // seconds
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
};

export const COMPRESSION_SETTINGS = {
    image: {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
    },
    video: {
        bitrate: '500k', // Lower bitrate for mobile performance
        maxWidth: 1280,
        maxHeight: 720,
    },
};
