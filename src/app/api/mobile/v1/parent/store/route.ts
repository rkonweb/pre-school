import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import {
    getStoreItemsAction,
    placeStoreOrderAction,
    getMyStoreOrdersAction,
} from "@/app/actions/parent-phase3-actions";

export async function GET(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const phone = (auth as any).phone;

        const url = new URL(req.url);
        const view = url.searchParams.get("view"); // "orders" or default catalog

        if (view === "orders") {
            const result = await getMyStoreOrdersAction(phone);
            return NextResponse.json(result);
        }

        const result = await getStoreItemsAction(phone);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await getMobileAuth(req);
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        const phone = (auth as any).phone;
        const body = await req.json();
        const { studentId, items } = body;

        if (!studentId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: "studentId and items[] are required" }, { status: 400 });
        }

        const result = await placeStoreOrderAction(phone, studentId, items);
        return NextResponse.json(result, { status: result.success ? 201 : 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
