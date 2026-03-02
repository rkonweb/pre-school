import { getIdentifierConfigsAction } from "@/app/actions/identifier-actions";
import { IdentifierConfigForm } from "@/components/dashboard/settings/IdentifierConfigForm";
import { AlertCircle } from "lucide-react";

export default async function IdentifiersSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const res = await getIdentifierConfigsAction(slug);

    if (!res.success) {
        return (
            <div className="p-8 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl flex items-center gap-4 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{res.error || "Failed to load identifier configurations."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Auto-Identifier Formats
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1">
                    Define custom prefixes, suffixes, and numbering sequences for various documents and records across the school system.
                </p>
            </div>

            <IdentifierConfigForm slug={slug} initialConfigs={res.data} />
        </div>
    );
}
