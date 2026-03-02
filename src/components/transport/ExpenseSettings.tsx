'use client';

import { useState } from "react";
import { Settings, ArrowRightLeft, CheckCircle2, Loader2, Info, X } from "lucide-react";
import { updateTransportAccountsSyncAction } from "@/app/actions/expense-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExpenseSettingsProps {
    slug: string;
    syncEnabled: boolean;
}

export default function ExpenseSettings({ slug, syncEnabled }: ExpenseSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [enabled, setEnabled] = useState(syncEnabled);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const newValue = !enabled;
        try {
            const res = await updateTransportAccountsSyncAction(slug, newValue);
            if (res.success) {
                setEnabled(newValue);
                toast.success(newValue
                    ? "Auto-sync to Accounts is now ON — future approved expenses will post automatically."
                    : "Auto-sync to Accounts is now OFF — expenses stay independent."
                );
            } else {
                toast.error(res.error || "Failed to update setting");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-semibold text-sm shadow-sm hover:border-zinc-400 transition-all"
                title="Transport Sync Settings"
            >
                <Settings className="h-4 w-4" />
                Settings
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-100 rounded-xl">
                                    <ArrowRightLeft className="h-5 w-5 text-zinc-700" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-zinc-900">Accounts Sync Settings</h2>
                                    <p className="text-xs text-zinc-500 font-medium">Transport → Accounts integration</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-zinc-200 rounded-xl transition-colors"
                                title="Close"
                            >
                                <X className="h-5 w-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Toggle Row */}
                            <div className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                enabled
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-zinc-50 border-zinc-200"
                            )}>
                                <div className="pr-4">
                                    <p className="font-bold text-zinc-900 text-sm">Auto-Sync to Accounts</p>
                                    <p className={cn(
                                        "text-xs mt-0.5 font-medium",
                                        enabled ? "text-emerald-700" : "text-zinc-500"
                                    )}>
                                        {enabled
                                            ? "✅ Every approved expense auto-posts to Accounts → Transactions"
                                            : "⚪ Transport expenses are kept independent from Accounts"
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={handleToggle}
                                    disabled={loading}
                                    className={cn(
                                        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-200 focus:outline-none shadow-inner",
                                        enabled ? "bg-emerald-500" : "bg-zinc-300"
                                    )}
                                    title={enabled ? "Turn OFF auto-sync" : "Turn ON auto-sync"}
                                >
                                    <span className={cn(
                                        "inline-block h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200",
                                        enabled ? "translate-x-6" : "translate-x-1"
                                    )}>
                                        {loading && <Loader2 className="h-3 w-3 m-1 animate-spin text-zinc-400" />}
                                    </span>
                                </button>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                                <p className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-1">
                                    <Info className="h-3.5 w-3.5" /> How sync works
                                </p>
                                <ul className="space-y-2 text-sm text-zinc-700">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span><strong>Auto-sync ON</strong> — When an expense is approved, it's instantly posted as a <strong>DEBIT</strong> transaction in Accounts.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span><strong>Per-row button</strong> — Use the <strong>📤 Post</strong> button on any expense row to manually push it to Accounts, regardless of this toggle.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span><strong>No duplicates</strong> — Each expense can only be posted to Accounts once.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span><strong>Not retroactive</strong> — Turning sync ON will NOT back-fill old expenses.</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
