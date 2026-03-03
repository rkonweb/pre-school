import * as admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

export async function sendNotificationToUser(userId: string, title: string, body: string, data?: any) {
    try {
        // 1. Find all active device tokens for this user
        const tokens = await prisma.deviceToken.findMany({
            where: { userId },
            select: { token: true }
        });

        if (tokens.length === 0) return { success: false, error: "No device tokens found" };

        const registrationTokens = tokens.map((t: { token: string }) => t.token);

        // 2. Prepare the message
        const message: admin.messaging.MulticastMessage = {
            tokens: registrationTokens,
            notification: { title, body },
            data: data || {},
            android: { priority: "high" },
            apns: { payload: { aps: { sound: "default" } } }
        };

        // 3. Send via Firebase
        const response = await admin.messaging().sendEachForMulticast(message);

        // 4. Clean up invalid tokens
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error?.code === "messaging/registration-token-not-registered" ||
                        error?.code === "messaging/invalid-registration-token") {
                        failedTokens.push(registrationTokens[idx]);
                    }
                }
            });

            if (failedTokens.length > 0) {
                await prisma.deviceToken.deleteMany({
                    where: { token: { in: failedTokens } }
                });
            }
        }

        return { success: true, sentCount: response.successCount };
    } catch (error: any) {
        console.error("FCM Send Error:", error);
        return { success: false, error: error.message };
    }
}
