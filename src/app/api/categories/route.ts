import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.trainingCategory.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true
            }
        });

        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        console.error("API: Local Prisma Error", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
