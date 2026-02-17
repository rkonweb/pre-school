import { prisma } from "@/lib/prisma";

export async function validateBranchAccess(endpointUser: any, targetBranchId: string | null) {
    // 1. Super Admin or School Admin has access to all branches
    if (endpointUser.role === "SUPER_ADMIN" || endpointUser.role === "ADMIN") {
        return true;
    }

    // 2. If target has no branch, assume global/main and allow based on other perms
    if (!targetBranchId) return true;

    // 3. User must have a defined currentBranchId to be restricted
    // If user has no branch assigned, they might be in limbo, better to deny or check logic
    // Assuming 'endpointUser' comes from validateUserSchoolAction which typically includes currentBranchId

    // Check if user is restricted to a branch
    if (endpointUser.currentBranchId) {
        return endpointUser.currentBranchId === targetBranchId;
    }

    // If user has no branch context, default allow? Or deny?
    // Safer to deny cross-branch access if they are STAFF
    return false;
}
