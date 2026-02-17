
import { elastic } from './elasticsearch';
import { prisma } from './prisma';

// Use elastic as a conditional since it might be undefined in dev if not set up
function getClient() {
    if (!elastic) {
        console.warn("Elasticsearch client not initialized. Skipping sync.");
        return null;
    }
    return elastic;
}

export async function syncStudent(studentId: string) {
    const client = getClient();
    if (!client) return;

    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                status: true,
                gender: true,
                avatar: true,
                school: { select: { slug: true } },
                classroom: { select: { name: true } },
                parentName: true,
                parentMobile: true,
            }
        });

        if (!student) {
            // If not found, it might be deleted
            await client.delete({ index: 'students', id: studentId }).catch(() => { });
            return;
        }

        await client.index({
            index: 'students',
            id: student.id,
            document: {
                ...student,
                fullName: `${student.firstName} ${student.lastName}`,
                className: student.classroom?.name || 'Unassigned',
                schoolSlug: student.school.slug
            }
        });
    } catch (error) {
        console.error(`Failed to sync student ${studentId}:`, error);
    }
}

export async function removeStudentFromIndex(studentId: string) {
    const client = getClient();
    if (!client) return;
    try {
        await client.delete({ index: 'students', id: studentId });
    } catch (e) {
        // Ignore not found
    }
}


export async function syncLead(leadId: string) {
    const client = getClient();
    if (!client) return;

    try {
        // Check Admission (Primary)
        const admission = await prisma.admission.findUnique({
            where: { id: leadId },
            include: { school: true }
        });

        if (admission) {
            await client.index({
                index: 'leads',
                id: admission.id,
                document: {
                    id: admission.id,
                    childName: admission.studentName,
                    parentName: admission.parentName,
                    mobile: admission.parentPhone || admission.fatherPhone || admission.motherPhone || "",
                    status: admission.marketingStatus,
                    source: admission.source,
                    schoolSlug: admission.school.slug
                }
            });
            return;
        }

        // Check Lead (Legacy)
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { school: true }
        });

        if (lead) {
            await client.index({
                index: 'leads',
                id: lead.id,
                document: {
                    id: lead.id,
                    childName: lead.childName || "",
                    parentName: lead.parentName || "",
                    mobile: lead.mobile || "",
                    status: lead.status,
                    source: lead.source,
                    schoolSlug: lead.school.slug
                }
            });
        } else {
            // If neither, remove
            await client.delete({ index: 'leads', id: leadId }).catch(() => { });
        }

    } catch (error) {
        console.error(`Failed to sync lead ${leadId}:`, error);
    }
}

export async function removeLeadFromIndex(leadId: string) {
    const client = getClient();
    if (!client) return;
    try {
        await client.delete({ index: 'leads', id: leadId });
    } catch (e) {
        // Ignore
    }
}

export async function syncStaff(userId: string) {
    const client = getClient();
    if (!client) return;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                designation: true,
                department: true,
                status: true,
                avatar: true,
                school: { select: { slug: true } }
            }
        });

        if (!user) {
            await client.delete({ index: 'staff', id: userId }).catch(() => { });
            return;
        }

        await client.index({
            index: 'staff',
            id: user.id,
            document: {
                ...user,
                fullName: `${user.firstName} ${user.lastName}`,
                schoolSlug: user.school?.slug
            }
        });
    } catch (error) {
        console.error(`Failed to sync staff ${userId}:`, error);
    }
}

export async function removeStaffFromIndex(userId: string) {
    const client = getClient();
    if (!client) return;
    try {
        await client.delete({ index: 'staff', id: userId });
    } catch (e) {
        // Ignore
    }
}
