'use client';

import { useState, useEffect } from "react";
import { AuraAI } from "./AuraAI";

export function GlobalAuraWrapper({ slug, staffId }: { slug: string, staffId?: string }) {
    // In the future, we can fetch global insights here if needed.
    // For now, we pass an empty array to let Aura be in "Query Mode" globally.
    // This keeps page transitions fast.
    const [insights, setInsights] = useState<any[]>([]);

    useEffect(() => {
        // Optional: Fetch lightweight global stats here
        // const loadGlobalContext = async () => { ... }
        // loadGlobalContext();
    }, []);

    return <AuraAI insights={insights} slug={slug} staffId={staffId} />;
}
