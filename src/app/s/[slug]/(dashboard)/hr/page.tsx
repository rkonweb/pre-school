import { redirect } from "next/navigation";

export default function HRModulePage({ params }: { params: { slug: string } }) {
    // Redirect to the default HR view (Directory)
    // Later this can be a comprehensive HR dashboard
    redirect(`/s/${params.slug}/hr/directory`);
}
