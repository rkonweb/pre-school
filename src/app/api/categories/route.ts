import { NextResponse } from "next/server";
// @ts-ignore
import { PrismaClient } from "../../../generated/training-client";

export async function GET() {
    console.log("API: /api/categories HIT (GENERATED CLIENT)");
    const prisma = new PrismaClient();

    try {
        const categories = await prisma.trainingCategory.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true
            }
        });

        await prisma.$disconnect();
        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        console.error("API: Local Prisma Error", error);
        await prisma.$disconnect();
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
