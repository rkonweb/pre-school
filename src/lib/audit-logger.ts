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
    DATA_EXPORT = "DATA_EXPORT",
    // New Staff HR tracking events
    STAFF_CREATED = "STAFF_CREATED",
    STAFF_UPDATED = "STAFF_UPDATED",
    STAFF_DELETED = "STAFF_DELETED"
}

export async function logAuditEvent(
    type: AuditEventType,
    description: string,
    metadata?: Record<string, any>,
    userId?: string,
    schoolId?: string,
    entityType?: string,
    entityId?: string
) {
    try {
        // Log to console for observability
        console.log(`[AUDIT] [${type}] ${description}`, {
            userId,
            schoolId,
            ...metadata,
            timestamp: new Date().toISOString()
        });

        // If we don't have enough data to identify the school/user, fallback to system defaults or skip
        if (schoolId && userId) {
            await prisma.auditLog.create({
                data: {
                    schoolId,
                    userId,
                    action: type,
                    entityType,
                    entityId,
                    details: metadata ? JSON.parse(JSON.stringify({ description, ...metadata })) : { description },
                    isSuspicious: false,
                    riskScore: 0
                }
            });
        }
    } catch (error) {
        console.error("Failed to write audit log to database:", error);
    }
}
