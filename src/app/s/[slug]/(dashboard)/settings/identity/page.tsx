"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { IdentityForm } from "@/components/dashboard/settings/IdentityForm";
import { Loader2 } from "lucide-react";

export default function IdentitySettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [schoolData, setSchoolData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getSchoolSettingsAction(slug);
            if (res.success) {
                setSchoolData(res.data);
            } else {
                setError(res.error || "Failed to load institutional identity.");
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [slug]);

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
    );

    if (error || !schoolData) return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="bg-rose-50 text-rose-600 p-8 rounded-[32px] border border-rose-100 text-center max-w-md">
                <p className="font-black uppercase tracking-widest text-xs mb-2">Institutional Sync Error</p>
                <p className="text-sm font-medium">{error || "School profile could not be localized."}</p>
            </div>
            <button onClick={load} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest">Retry Connection</button>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Institutional Identity
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Branding, mission statement, school seal and theme configurations.
                    </p>
                </div>
            </div>

            <IdentityForm slug={slug} initialData={schoolData} />
        </div>
    );
}
