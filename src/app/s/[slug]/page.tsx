import { redirect } from "next/navigation";

export default async function SchoolRootPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    redirect(`/s/${slug}/dashboard`);
}
