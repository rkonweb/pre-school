
import { prisma } from "@/lib/prisma";
import { AdminDesignerPageClient } from "../../AdminDesignerPageClient";
import { notFound } from "next/navigation";

export default async function EditAdminTemplatePage({ params }: { params: { id: string } }) {
    const template = await prisma.iDCardTemplate.findUnique({
        where: { id: params.id }
    });

    if (!template) notFound();

    return <AdminDesignerPageClient initialTemplate={template} />;
}
