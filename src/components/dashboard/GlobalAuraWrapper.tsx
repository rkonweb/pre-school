'use client';

import { useState, useEffect } from "react";
import { AuraAI } from "./AuraAI";
import { useAura } from "@/context/AuraContext";
import { getDashboardInsightsAction } from "@/app/actions/ai-dashboard-actions";

interface AIInsight {
    id: string;
    type: "transport" | "staff" | "academic" | "attendance" | "system";
    severity: "low" | "medium" | "high";
    message: string;
}

export function GlobalAuraWrapper({ slug, staffId }: { slug: string, staffId?: string }) {
    const { isAuraOpen, toggleAura } = useAura();
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [hasFetched, setHasFetched] = useState(false);

    // Fetch real-time insights on mount and periodically
    useEffect(() => {
        const loadInsights = async () => {
            try {
                const res = await getDashboardInsightsAction(slug, staffId);
                if (res.success && res.insights) {
                    setInsights(res.insights);
                }
            } catch (err) {
                console.error("[Aura] Failed to load insights:", err);
            } finally {
                setHasFetched(true);
            }
        };

        loadInsights();

        // Refresh insights every 5 minutes
        const interval = setInterval(loadInsights, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [slug, staffId]);

    return (
        <AuraAI
            insights={insights}
            slug={slug}
            staffId={staffId}
            isExternalOpen={isAuraOpen}
            onExternalToggle={toggleAura}
        />
    );
}
