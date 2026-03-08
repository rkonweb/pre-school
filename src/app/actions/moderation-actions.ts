"use server";

import { prisma } from "@/lib/prisma";
import { validateUserSchoolAction } from "./session-actions";
import { revalidatePath } from "next/cache";

export async function getFlaggedMessagesAction(schoolSlug: string) {
    const auth = await validateUserSchoolAction(schoolSlug);
    if (!auth.success || !auth.user || !auth.user.schoolId) {
        throw new Error("Unauthorized");
    }

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { status: "FLAGGED" },
                    { isFlagged: true }
                ],
                conversation: {
                    student: {
                        schoolId: auth.user.schoolId
                    }
                }
            },
            include: {
                conversation: {
                    include: {
                        student: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, messages: JSON.parse(JSON.stringify(messages)) };
    } catch (error) {
        console.error("Get Flagged Messages Error:", error);
        return { success: false, error: "Failed to fetch flagged messages" };
    }
}

export async function updateMessageModerationStatusAction(schoolSlug: string, messageId: string, status: "SENT" | "REJECTED") {
    const auth = await validateUserSchoolAction(schoolSlug);
    if (!auth.success || !auth.user || !auth.user.schoolId) {
        throw new Error("Unauthorized");
    }

    try {
        const message = await prisma.message.update({
            where: { id: messageId },
            data: {
                status: status,
                isFlagged: false, // Clear flag after manual action
                updatedAt: new Date()
            },
            include: {
                conversation: {
                    include: {
                        student: {
                            include: {
                                school: true
                            }
                        }
                    }
                }
            }
        });

        const slug = (message as any).conversation?.student?.school?.slug;
        if (slug) {
            revalidatePath(`/s/${slug}/communication`);
        }

        return { success: true, message: JSON.parse(JSON.stringify(message)) };
    } catch (error) {
        console.error("Update Moderation Status Error:", error);
        return { success: false, error: "Failed to update message status" };
    }
}
