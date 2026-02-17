import { prisma } from "@/lib/prisma";

export enum AuditEventType {
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILURE = "LOGIN_FAILURE",
    ADMIN_CREATED = "ADMIN_CREATED",
    ADMIN_DELETED = "ADMIN_DELETED",
    SETTINGS_CHANGED = "SETTINGS_CHANGED",
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
    FILE_UPLOAD = "FILE_UPLOAD",
    FILE_DELETE = "FILE_DELETE",
    DATA_EXPORT = "DATA_EXPORT"
}

export async function logAuditEvent(
    type: AuditEventType,
    description: string,
    metadata?: Record<string, any>,
    userId?: string,
    schoolId?: string
) {
    try {
        // Log to console for now (stdout is captured by cloud providers)
        console.log(`[AUDIT] [${type}] ${description}`, {
            userId,
            schoolId,
            ...metadata,
            timestamp: new Date().toISOString()
        });

        // If we had an AuditLog table in Prisma, we would write here.
        // For now, we will simulate or assume the table might not exist yet 
        // and stick to console + potential future DB write.

        /*
        await prisma.auditLog.create({
            data: {
                type,
                description,
                userId,
                schoolId,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
        */

    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Fail open - don't block action if logging fails
    }
}
