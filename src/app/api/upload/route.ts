import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { uploadToGCS } from '@/lib/gcs-upload';
import { GCS_CONFIG } from '@/lib/gcs-config';
import { decrypt } from "@/lib/auth-jose";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        // Authenticate Request - Next.js 15 Async Cookies
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin_session")?.value;
        const userSession = cookieStore.get("userId")?.value;
        const teacherSession = cookieStore.get("teacher_session")?.value;
        const dashboardSession = cookieStore.get("session")?.value;

        let isAuthenticated = false;

        // 1. Check Admin
        if (adminSession) {
            const payload = await decrypt(adminSession);
            if (payload?.role === "SUPER_ADMIN") isAuthenticated = true;
        }

        // 2. Check Dashboard Session (School Admin/Staff)
        if (!isAuthenticated && dashboardSession) {
            const payload = await decrypt(dashboardSession);
            if (payload && payload.userId) isAuthenticated = true;
        }

        // 3. Fallback: User or Teacher session
        if (!isAuthenticated && (userSession || teacherSession)) {
            isAuthenticated = true;
        }

        if (!isAuthenticated) {
            console.warn("Upload Unauth - Check Cookies names or session expiry.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
            // FALLBACK: Return Base64 string directly
            // On Vercel (serverless), local file writes are ephemeral and won't work.
            // By returning the base64 string, we allow the CMS to save the image data 
            // directly into the database 'content' JSON column.

            return NextResponse.json({
                success: true,
                url: file, // Return the full data:image/... string
                isLocal: false,
                isBase64: true
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
