import { redirect } from "next/navigation";

export default function SchoolRootPage({ params: { slug } }: { params: { slug: string } }) {
    // Simply redirect to the dashboard for this school
    redirect(`/s/${slug}/dashboard`);
}
