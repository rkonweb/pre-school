'use client';

import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { syncDailyLogsAction } from "@/app/actions/report-actions";
import { cn } from "@/lib/utils";

export default function SyncLogsButton({ slug, currentDate }: { slug: string, currentDate: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await syncDailyLogsAction(slug, currentDate);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    // Refresh current page data
                    window.location.reload();
                }, 2000);
            } else {
                alert(res.error || "Failed to sync logs");
            }
        } catch (e) {
            alert("An error occurred during sync");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50",
                success
                    ? "bg-green-600 text-white shadow-green-200"
                    : "bg-zinc-900 text-white shadow-zinc-200 hover:bg-zinc-800"
            )}
        >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    SYNCING DATA...
                </>
            ) : success ? (
                <>
                    <CheckCircle2 className="h-5 w-5" />
                    SYNC SUCCESS
                </>
            ) : (
                <>
                    <RefreshCw className="h-5 w-5" />
                    SYNC TELEMETRY
                </>
            )}
        </button>
    );
}
