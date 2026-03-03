"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getFlaggedMessagesAction() {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
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
                        schoolId: session.schoolId
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

        return { success: true, messages };
    } catch (error) {
        console.error("Get Flagged Messages Error:", error);
        return { success: false, error: "Failed to fetch flagged messages" };
    }
}

export async function updateMessageModerationStatusAction(messageId: string, status: "SENT" | "REJECTED") {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
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

        return { success: true, message };
    } catch (error) {
        console.error("Update Moderation Status Error:", error);
        return { success: false, error: "Failed to update message status" };
    }
}
