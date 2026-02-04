"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { RegionalConfig } from "@/components/dashboard/settings/RegionalConfig";
import { Loader2 } from "lucide-react";

export default function ConfigSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [schoolData, setSchoolData] = useState<any>(null);

    useEffect(() => {
        async function load() {
            const res = await getSchoolSettingsAction(slug);
            console.log("DEBUG: ConfigSettingsPage load success:", res.success);
            if (res.success) setSchoolData(res.data);
            setIsLoading(false);
        }
        load();
    }, [slug]);

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
    );

    return <RegionalConfig slug={slug} initialData={schoolData} />;
}
