import { redirect } from "next/navigation";

export default async function SettingsHubPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Redirect to the first submodule as the hub page is no longer required
    redirect(`/s/${slug}/settings/identity`);
}
