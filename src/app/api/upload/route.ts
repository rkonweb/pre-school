import { NextRequest, NextResponse } from 'next/server';
import { uploadToGCS } from '@/lib/gcs-upload';
import { GCS_CONFIG } from '@/lib/gcs-config';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { file, fileName, contentType, folder } = body;

        if (!file || !fileName || !contentType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Convert base64 to buffer
        const base64Data = file.replace(/^data:.*?;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Check for GCS Credentials
        if (!GCS_CONFIG.credentials) {
            // FALLBACK: Local Upload
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadsDir, { recursive: true });

            const timestamp = Date.now();
            const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const localFilename = `${timestamp}_${sanitizedName}`;
            const filePath = path.join(uploadsDir, localFilename);

            await writeFile(filePath, buffer);

            return NextResponse.json({
                success: true,
                url: `/uploads/${localFilename}`,
                isLocal: true
            });
        }

        // Upload to GCS
        const result = await uploadToGCS(
            buffer,
            fileName,
            contentType,
            folder || 'homework'
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Upload failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: result.url,
        });

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: Handle direct uploads with signed URLs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('fileName');
        const contentType = searchParams.get('contentType');
        const folder = searchParams.get('folder') || 'homework';

        if (!fileName || !contentType) {
            return NextResponse.json(
                { error: 'Missing fileName or contentType' },
                { status: 400 }
            );
        }

        const { getSignedUploadUrl } = await import('@/lib/gcs-upload');
        const result = await getSignedUploadUrl(
            fileName,
            contentType,
            folder as any
        );

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to generate upload URL' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            uploadUrl: result.uploadUrl,
            publicUrl: result.publicUrl,
        });

    } catch (error: any) {
        console.error('Signed URL API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
