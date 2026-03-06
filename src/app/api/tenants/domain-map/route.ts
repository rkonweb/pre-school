import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch all schools that have a custom domain configured
        const schools = await prisma.school.findMany({
            where: {
                customDomain: {
                    not: null,
                }
            },
            select: {
                customDomain: true,
                slug: true
            }
        });

        // Initialize map
        const domainMap: Record<string, string> = {
            "portal.bright-central.com": "bright-central", // fallback/mock
            "erp.littlechanakyas.in": "littlechanakyas"     // fallback/mock
        };

        // Populate with real data
        schools.forEach(school => {
            if (school.customDomain) {
                domainMap[school.customDomain] = school.slug;
            }
        });

        return NextResponse.json(domainMap, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
            }
        });
    } catch (error) {
        console.error("Failed to fetch custom domain map", error);
        return NextResponse.json({}, { status: 500 });
    }
}
