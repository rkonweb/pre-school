
import { prisma } from "@/lib/prisma";
import AdminIDCardTemplatesClient from "./AdminIDCardTemplatesClient";

export default async function AdminIDCardTemplatesPage() {
    const templates = await prisma.iDCardTemplate.findMany({
        where: { isSystem: true, schoolId: null },
        orderBy: { createdAt: 'desc' }
    });

    return <AdminIDCardTemplatesClient initialTemplates={templates} />;
}
