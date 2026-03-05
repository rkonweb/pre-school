import { NextResponse } from "next/server";
import { getMobileAuth } from "@/lib/auth-mobile";
import { getParentLibraryAction } from "@/app/actions/parent-library-actions";

export async function GET(req: Request) {
    try {
        // Authenticate the request via Mobile JWT
        const auth = await getMobileAuth(req);
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const phone = (auth as any).phone;
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");

        if (!studentId) {
            console.error("[Library API] Missing studentId in search params.");
            return NextResponse.json({ success: false, error: "Student ID missing" }, { status: 400 });
        }

        console.log(`[Library API] Fetching for Student=${studentId}, Phone=${phone}`);
        const result = await getParentLibraryAction(studentId, phone);

        if (!result.success) {
            console.error("[Library API] Action Failed: ", result.error);
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Mobile Parent Library API Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
