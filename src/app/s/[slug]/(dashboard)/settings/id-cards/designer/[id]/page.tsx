import { prisma } from "@/lib/prisma";
import { DesignerPageClient } from "../DesignerPageClient";
import { redirect } from "next/navigation";

export default async function EditIDCardTemplatePage(props: { params: Promise<{ slug: string, id: string }> }) {
    const params = await props.params;
    const { slug, id } = params;
    const school = await prisma.school.findUnique({
        where: { slug: slug },
        select: { id: true }
    });

    const template = await prisma.iDCardTemplate.findUnique({
        where: { id: id }
    });

    if (!school || !template) redirect("/404");

    return <DesignerPageClient slug={slug} schoolId={school.id} initialTemplate={template} />;
}
