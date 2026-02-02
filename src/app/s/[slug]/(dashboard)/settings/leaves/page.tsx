"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getLeavePoliciesAction } from "@/app/actions/leave-policy-actions";
import { LeavePolicyManager } from "@/components/dashboard/settings/LeavePolicyManager";
import { Loader2 } from "lucide-react";

export default function LeavesSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [policies, setPolicies] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const res = await getLeavePoliciesAction(slug);
            if (res.success) setPolicies(res.data || []);
            setIsLoading(false);
        }
        load();
    }, [slug]);

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
    );

    return (
        <div className="max-w-6xl animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100">
                <LeavePolicyManager schoolSlug={slug} initialPolicies={policies} />
            </div>
        </div>
    );
}
