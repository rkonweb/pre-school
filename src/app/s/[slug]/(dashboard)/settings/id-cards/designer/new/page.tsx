import { prisma } from "@/lib/prisma";
import { DesignerPageClient } from "../DesignerPageClient";
import { redirect } from "next/navigation";

export default async function NewIDCardTemplatePage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const school = await prisma.school.findUnique({
        where: { slug: slug },
        select: { id: true }
    });

    if (!school) redirect("/404");

    return <DesignerPageClient slug={slug} schoolId={school.id} />;
}
