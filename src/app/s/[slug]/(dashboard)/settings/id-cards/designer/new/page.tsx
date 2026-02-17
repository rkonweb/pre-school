import { prisma } from "@/lib/prisma";
import { DesignerPageClient } from "../DesignerPageClient";
import { redirect } from "next/navigation";

export default async function NewIDCardTemplatePage({ params }: { params: { slug: string } }) {
    const school = await prisma.school.findUnique({
        where: { slug: params.slug },
        select: { id: true }
    });

    if (!school) redirect("/404");

    return <DesignerPageClient slug={params.slug} schoolId={school.id} />;
}
