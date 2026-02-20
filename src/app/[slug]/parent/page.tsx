import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { getFamilyStudentsAction } from "@/app/actions/parent-actions";

export default async function ParentRootPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const userRes = await getCurrentUserAction();
    if (userRes.success && userRes.data) {
        const user = userRes.data;
        const phone = user.mobile;

        // Check for student count to decide redirection
        const familyRes = await getFamilyStudentsAction(slug, phone);
        if (familyRes.success && familyRes.students) {
            const students = familyRes.students;
            // Auto-redirect ONLY if there is exactly one record AND it is a confirmed student (not admission)
            if (students.length === 1 && students[0].type === "STUDENT") {
                redirect(`/${slug}/parent/${user.id}/${students[0].id}?phone=${phone}`);
            }
        }

        // Default: Redirect to dashboard
        redirect(`/${slug}/parent/${user.id}?phone=${phone}`);
    }
    // Fallback if something weird happens (though layout protects this)
    redirect("/parent-login");
}
