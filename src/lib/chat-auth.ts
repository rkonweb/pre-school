import { getMobileAuth } from "./auth-mobile";
import { getSession } from "./session";

export type ChatUser = {
    id: string;
    mobile: string;
    role: "ADMIN" | "TEACHER" | "PARENT";
    schoolId?: string;
    firstName?: string;
    lastName?: string;
};

export async function getChatUser(req: Request): Promise<ChatUser | null> {
    // 1. Try Mobile Auth (Staff App or Parent App via verify-otp)
    const mobileUser = await getMobileAuth(req);
    if (mobileUser) {
        if (mobileUser.role === "PARENT") {
            return {
                id: (mobileUser.parentId as string) || (mobileUser.userId as string),
                mobile: (mobileUser.phone as string) || (mobileUser.mobile as string),
                role: "PARENT",
                schoolId: mobileUser.schoolId as string, // Parent may not have direct schoolId in token
            };
        }
        return {
            id: mobileUser.userId as string,
            mobile: mobileUser.mobile as string,
            role: (mobileUser.role as any) || "TEACHER",
            schoolId: mobileUser.schoolId as string,
            firstName: (mobileUser.firstName as string) || "",
            lastName: (mobileUser.lastName as string) || "",
        };
    }

    // 2. Try Session Auth (Parent Portal / Admin Portal)
    const session = await getSession();
    if (session) {
        return {
            id: session.userId as string,
            mobile: session.mobile as string,
            role: (session.role as any) || "ADMIN",
            schoolId: session.schoolId as string,
            firstName: (session.firstName as string) || "",
            lastName: (session.lastName as string) || "",
        };
    }

    return null;
}
