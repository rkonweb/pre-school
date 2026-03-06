'use client';

import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle2, Zap } from "lucide-react";
import { syncDailyLogsAction } from "@/app/actions/report-actions";
import { cn } from "@/lib/utils";
import { Btn } from "@/components/ui/erp-ui";
import { toast } from "sonner";

export default function SyncLogsButton({ slug, currentDate }: { slug: string, currentDate: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await syncDailyLogsAction(slug, currentDate);
            if (res.success) {
                setSuccess(true);
                toast.success("Telemetry matrix synchronized successfully.");
                setTimeout(() => {
                    setSuccess(false);
                    window.location.reload();
                }, 1500);
            } else {
                toast.error(res.error || "Tactical sync failure detected.");
            }
        } catch (e) {
            toast.error("Internal telemetry handshake error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Btn
            onClick={handleSync}
            disabled={loading || success}
            className={cn(
                "!rounded-[20px] transition-all duration-500",
                success ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" : ""
            )}
            icon={loading ? Loader2 : success ? CheckCircle2 : Zap}
        >
            {loading ? "CALIBRATING TELEMETRY..." : success ? "SYNC COMPLETE" : "STRIKE SYNC"}
        </Btn>
    );
}
