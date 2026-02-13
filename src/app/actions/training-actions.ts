"use server";

import { trainingPrisma as prisma } from "@/lib/training-prisma";
import { revalidatePath } from "next/cache";
import { uploadToGoogleDriveNested, deleteFile } from "@/lib/google-drive-upload";

// ============================================================================
// TRAINING MODULE ACTIONS
// ============================================================================

// ============================================================================
// TRAINING CATEGORY ACTIONS
// ============================================================================

// Categories actions moved to @/app/actions/category-actions.ts

// ============================================================================
// TRAINING MODULE ACTIONS
// ============================================================================

export async function getTrainingModulesAction(categoryId?: string, role?: string) {
    try {
        const whereClause: any = {};
        if (categoryId) {
            whereClause.categoryId = categoryId;
        } else if (role) {
            whereClause.role = role;
        }

        const modules = await (prisma as any).trainingModule.findMany({
            where: whereClause,
            orderBy: { order: 'asc' },
            include: {
                topics: {
                    orderBy: { order: 'asc' },
                    include: {
                        pages: {
                            orderBy: { order: 'asc' },
                            select: { id: true, title: true, order: true, isPublished: true }
                        }
                    }
                }
            }
        });
        return { success: true, data: modules };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createTrainingModuleAction(title: string, description: string, role: string = "TEACHER", categoryId?: string) {
    try {
        console.log("[createTrainingModuleAction] Starting", { title, description, role, categoryId });
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        let count = 0;
        if (categoryId) {
            count = await (prisma as any).trainingModule.count({ where: { categoryId } });
        } else {
            count = await (prisma as any).trainingModule.count({ where: { role } });
        }

        const module = await (prisma as any).trainingModule.create({
            data: {
                title,
                description,
                role,
                categoryId,
                slug: `${slug}-${Date.now()}`, // Ensure uniqueness
                order: count
            }
        });

        console.log("[createTrainingModuleAction] Success", module);
        revalidatePath('/admin/training');
        return { success: true, data: module };
    } catch (error: any) {
        console.error("[createTrainingModuleAction] Error", error);
        return { success: false, error: error.message };
    }
}

export async function deleteTrainingModuleAction(id: string) {
    try {
        await (prisma as any).trainingModule.delete({ where: { id } });
        revalidatePath('/admin/training');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================================================================
// TOPIC ACTIONS
// ============================================================================

export async function createTrainingTopicAction(moduleId: string, title: string) {
    try {
        const count = await (prisma as any).trainingTopic.count({ where: { moduleId } });

        const topic = await (prisma as any).trainingTopic.create({
            data: {
                moduleId,
                title,
                order: count
            }
        });

        revalidatePath('/admin/training');
        return { success: true, data: topic };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTrainingTopicAction(id: string) {
    try {
        await (prisma as any).trainingTopic.delete({ where: { id } });
        revalidatePath('/admin/training');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================================================================
// PAGE ACTIONS
// ============================================================================

export async function createTrainingPageAction(topicId: string, title: string) {
    try {
        const count = await (prisma as any).trainingPage.count({ where: { topicId } });

        const page = await (prisma as any).trainingPage.create({
            data: {
                topicId,
                title,
                content: '',
                order: count
            }
        });

        revalidatePath('/admin/training');
        return { success: true, data: page };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTrainingPageAction(id: string) {
    try {
        const page = await (prisma as any).trainingPage.findUnique({
            where: { id },
            include: {
                topic: {
                    include: {
                        module: true
                    }
                },
                attachments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        return { success: true, data: page };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function addTrainingAttachmentAction(pageId: string, name: string, url: string, size: number, type: string) {
    try {
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

        if (!page) throw new Error("Page not found");

        const categoryName = page.topic.module.category?.name || "Uncategorized";
        const moduleTitle = page.topic.module.title;
        const topicTitle = page.topic.title;

        // Folder Path: Category -> Module -> Topic
        const folderPath = [categoryName, moduleTitle, topicTitle];

        // 2. Process File (Base64 to Buffer)
        // url is like "data:application/pdf;base64,JVBERi0..."
        const base64Data = url.split(';base64,').pop();
        if (!base64Data) throw new Error("Invalid file data");
        const fileBuffer = Buffer.from(base64Data, 'base64');

        // 3. Upload to Google Drive (Recursive Folder Creation)
        console.log(`[DMS] Uploading '${name}' to Google Drive path: ${folderPath.join('/')}`);

        const uploadRes = await uploadToGoogleDriveNested(
            fileBuffer,
            name,
            type,
            folderPath
        );

        let finalUrl = url; // Fallback to base64 if upload fails (though uploadToDriveNested falls back to local)
        if (uploadRes.success && uploadRes.url) {
            finalUrl = uploadRes.url;
        } else if (uploadRes.error) {
            console.error("[DMS] Google Drive Upload Failed:", uploadRes.error);
            // If fallback to local storage happened inside uploadToGoogleDriveNested, it returns success=true with local URL
            // If it returns success=false, something went wrong fundamentally.
        }

        // 4. Save to Database
        const attachment = await (prisma as any).trainingAttachment.create({
            data: {
                pageId,
                name,
                url: finalUrl,
                size,
                type
            }
        });
        revalidatePath('/admin/training');
        return { success: true, data: attachment };
    } catch (error: any) {
        console.error("[DMS] Add Attachment Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteTrainingAttachmentAction(id: string) {
    try {
        // 1. Find attachment to get URL
        const attachment = await (prisma as any).trainingAttachment.findUnique({
            where: { id }
        });

        if (attachment && attachment.url) {
            // 2. Delete from Storage (Drive or Local)
            console.log(`[DMS] Deleting file: ${attachment.url}`);
            await deleteFile(attachment.url);
        }

        // 3. Delete from DB
        await (prisma as any).trainingAttachment.delete({ where: { id } });
        revalidatePath('/admin/training');
        return { success: true };
    } catch (error: any) {
        console.error("[DMS] Delete Attachment Error:", error);
        return { success: false, error: error.message };
    }
}

export async function saveTrainingPageAction(id: string, content: string, title?: string) {
    try {
        const page = await (prisma as any).trainingPage.update({
            where: { id },
            data: {
                content,
                title: title || undefined,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/training');
        return { success: true, data: page };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTrainingPageAction(id: string) {
    try {
        await (prisma as any).trainingPage.delete({ where: { id } });
        revalidatePath('/admin/training');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function renameTrainingPageAction(id: string, title: string) {
    try {
        const page = await (prisma as any).trainingPage.update({
            where: { id },
            data: { title }
        });
        revalidatePath('/admin/training');
        return { success: true, data: page };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function renameTrainingTopicAction(id: string, title: string) {
    try {
        const topic = await (prisma as any).trainingTopic.update({
            where: { id },
            data: { title }
        });
        revalidatePath('/admin/training');
        return { success: true, data: topic };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function renameTrainingModuleAction(id: string, title: string) {
    try {
        const module = await (prisma as any).trainingModule.update({
            where: { id },
            data: { title }
        });
        revalidatePath('/admin/training');
        return { success: true, data: module };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
