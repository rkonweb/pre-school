import { prisma } from "@/lib/prisma";
import { DesignerPageClient } from "../DesignerPageClient";
import { redirect } from "next/navigation";

export default async function EditIDCardTemplatePage({ params }: { params: { slug: string, id: string } }) {
    const school = await prisma.school.findUnique({
        where: { slug: params.slug },
        select: { id: true }
    });

    const template = await prisma.iDCardTemplate.findUnique({
        where: { id: params.id }
    });

    if (!school || !template) redirect("/404");

    return <DesignerPageClient slug={params.slug} schoolId={school.id} initialTemplate={template} />;
}
