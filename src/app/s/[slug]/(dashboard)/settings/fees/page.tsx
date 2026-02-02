"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getFeeStructuresAction } from "@/app/actions/fee-settings-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { FeeStructureManager } from "@/components/dashboard/settings/FeeStructureManager";
import { Loader2 } from "lucide-react";

export default function FeeSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [structures, setStructures] = useState<any[]>([]);
    const [school, setSchool] = useState<any>(null);

    useEffect(() => {
        load();
    }, [slug]);

    async function load() {
        setIsLoading(true);
        const [structuresRes, schoolRes] = await Promise.all([
            getFeeStructuresAction(slug),
            getSchoolSettingsAction(slug)
        ]);

        if (structuresRes.success) {
            setStructures(structuresRes.data || []);
        }
        if (schoolRes.success) {
            setSchool(schoolRes.data);
        }

        setIsLoading(false);
    }

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
    );

    return <FeeStructureManager slug={slug} initialData={structures} onRefresh={load} currency={school?.currency} />;
}
