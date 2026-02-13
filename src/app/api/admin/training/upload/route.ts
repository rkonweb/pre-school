
import { NextRequest, NextResponse } from "next/server";
import { trainingPrisma as prisma } from "@/lib/training-prisma";
import { uploadToGoogleDriveNested } from "@/lib/google-drive-upload";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const pageId = formData.get("pageId") as string;

        if (!file || !pageId) {
            return NextResponse.json({ success: false, error: "Missing file or pageId" }, { status: 400 });
        }

        // 1. Get Hierarchy for Folder Structure
        const page = await (prisma as any).trainingPage.findUnique({
            where: { id: pageId },
            include: {
                topic: {
                    include: {
                        module: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });

        if (!page) {
            return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
        }

        const categoryName = page.topic.module.category?.name || "Uncategorized";
        const moduleTitle = page.topic.module.title;
        const topicTitle = page.topic.title;

        // Folder Path: Category -> Module -> Topic
        const folderPath = [categoryName, moduleTitle, topicTitle];

        // 2. Process File
        const buffer = Buffer.from(await file.arrayBuffer());

        // 3. Upload to Google Drive
        console.log(`[API] Uploading '${file.name}' to Google Drive path: ${folderPath.join('/')}`);

        const uploadRes = await uploadToGoogleDriveNested(
            buffer,
            file.name,
            file.type,
            folderPath
        );

        let finalUrl = "";
        if (uploadRes.success && uploadRes.url) {
            finalUrl = uploadRes.url;
        } else {
            console.error("[API] Google Drive Upload Failed:", uploadRes.error);
            // If fallback occurred inside uploadToGoogleDriveNested, it returns success=true usually. 
            // If success=false, we might want to error out or check if local upload worked?
            // current uploadToGoogleDriveNested implementation returns success=true even on fallback to local.
            // If it returns false, it really failed.
            return NextResponse.json({ success: false, error: uploadRes.error || "Upload failed" }, { status: 500 });
        }

        // 4. Save to Database
        const attachment = await (prisma as any).trainingAttachment.create({
            data: {
                pageId,
                name: file.name,
                url: finalUrl,
                size: file.size,
                type: file.type
            }
        });

        return NextResponse.json({ success: true, data: attachment });

    } catch (error: any) {
        console.error("[API] Upload Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
