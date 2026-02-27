import { prisma } from "@/lib/prisma";
import { IDCardGeneratorClient } from "./IDCardGeneratorClient";
import { redirect } from "next/navigation";

export default async function IDCardGenerationPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    const school = await prisma.school.findUnique({
        where: { slug: slug },
        include: {
            idCardTemplates: true,
        }
    });

    // Fetch school templates + system templates
    // For system templates, include child templates filtered by schoolId to identify overrides
    const templates = await prisma.iDCardTemplate.findMany({
        where: {
            OR: [
                { schoolId: school?.id },
                { isSystem: true, schoolId: null }
            ]
        },
        include: {
            childTemplates: {
                where: { schoolId: school?.id }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const students = await prisma.student.findMany({
        where: { school: { slug: slug }, status: 'ACTIVE' },
        include: {
            classroom: true
        }
    });

    const schoolData = {
        name: school?.name || "",
        logo: school?.logo || null
    };

    return (
        <div className="p-8">
            <IDCardGeneratorClient
                slug={slug}
                templates={templates}
                students={students}
                school={schoolData}
            />
        </div>
    );
}
