import { NextRequest, NextResponse } from 'next/server';
import { uploadToGCS } from '@/lib/gcs-upload';

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
