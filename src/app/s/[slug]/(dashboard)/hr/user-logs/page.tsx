"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, ShieldAlert, Check, Search, AlertOctagon, Info } from "lucide-react";
import { SectionHeader, tableStyles, Btn } from "@/components/ui/erp-ui";
import { getAuditLogsAction, getSuspiciousLogsAction, dismissSuspiciousLogAction } from "@/app/actions/audit-log-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { toast } from "sonner";
import { useConfirm } from "@/contexts/ConfirmContext";
import { format } from "date-fns";
import { AvatarWithAdjustment } from "@/components/dashboard/staff/AvatarWithAdjustment";
import { SearchInput } from "@/components/ui/SearchInput";

export default function UserLogsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();

    const [logs, setLogs] = useState<any[]>([]);
    const [suspiciousLogs, setSuspiciousLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, [slug]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    async function loadData() {
        setIsLoading(true);
        const [auditRes, suspiciousRes] = await Promise.all([
            getAuditLogsAction(slug, searchTerm),
            getSuspiciousLogsAction(slug)
        ]);

        if (auditRes.success) setLogs(auditRes.data || []);
        if (suspiciousRes.success) setSuspiciousLogs(suspiciousRes.data || []);
        setIsLoading(false);
    }

    async function handleDismiss(id: string) {
        const confirmed = await confirmDialog({
            title: "Dismiss Alert",
            message: "Are you sure you want to dismiss this AI alert? This indicates you have reviewed the activity.",
            confirmText: "Dismiss",
        });

        if (!confirmed) return;

        const res = await dismissSuspiciousLogAction(slug, id);
        if (res.success) {
            toast.success("Alert dismissed");
            loadData();
        } else {
            toast.error(res.error || "Failed to dismiss alert");
        }
    }

    function getRiskColor(score: number | null) {
        if (score === null) return "bg-zinc-100 text-zinc-500 border-zinc-200";
        if (score > 80) return "bg-red-50 text-red-700 border-red-200";
        if (score > 60) return "bg-orange-50 text-orange-700 border-orange-200";
        if (score > 30) return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-green-50 text-green-700 border-green-200";
    }

    return (
        <div className="flex flex-col gap-6 p-8 min-w-0">
            <SectionHeader
                title="User Activity & Audit Logs"
                subtitle="Continuously monitored by Bodhi Board AI for suspicious behaviour."
                icon={Activity}
            />

            {/* Suspicious Alerts Section */}
            {suspiciousLogs.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        High-Risk Activities Detected
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suspiciousLogs.map(log => (
                            <div key={log.id} className="relative bg-white rounded-3xl border border-red-200 overflow-hidden shadow-sm flex flex-col group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
                                <div className="p-5 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 ring-4 ring-white shadow-sm shrink-0">
                                                <AlertOctagon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-zinc-900 text-sm">{log.action}</h4>
                                                <p className="text-xs font-semibold text-zinc-500">
                                                    {format(new Date(log.createdAt), "MMM d, h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-red-600 leading-none">{log.riskScore}</span>
                                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Risk Score</span>
                                        </div>
                                    </div>
                                    <div className="mb-4 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AvatarWithAdjustment 
                                                src={log.user?.avatar} 
                                                className="w-6 h-6 rounded-full" 
                                            />
                                            <span className="text-xs font-bold text-zinc-800">
                                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : "Unknown"}
                                            </span>
                                            <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-bold uppercase">{log.user?.role}</span>
                                        </div>
                                        <p className="text-xs text-zinc-600 font-medium line-clamp-2">
                                            {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 p-3 bg-red-50/50 rounded-xl border border-red-100 mb-2">
                                        <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-semibold text-red-900 leading-snug">
                                            {log.aiAnalysis || "Flagged due to anomalous pattern."}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-5 pb-5 pt-2">
                                    <button 
                                        onClick={() => handleDismiss(log.id)}
                                        className="w-full py-2.5 bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Check className="w-4 h-4" />
                                        Acknowledge & Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Standard Logs Table */}
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-zinc-900">All Activity Logs</h3>
                    <div className="w-[300px]">
                        <SearchInput 
                            onSearch={(term) => setSearchTerm(term)}
                            placeholder="Search actions, users, details..."
                        />
                    </div>
                </div>

                <div style={tableStyles.container}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={tableStyles.thead}>
                            <tr>
                                <th style={tableStyles.thNoSort}>Timestamp</th>
                                <th style={tableStyles.thNoSort}>User</th>
                                <th style={tableStyles.thNoSort}>Action</th>
                                <th style={tableStyles.thNoSort}>Entity</th>
                                <th style={tableStyles.thNoSort}>Details</th>
                                <th style={tableStyles.thNoSort}>Risk Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-0">
                                        <DashboardLoader message="Fetching audit logs..." />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={tableStyles.td} className="text-center py-10 text-zinc-500 font-medium">
                                        No activity logs found.
                                    </td>
                                </tr>
                            ) : logs.map((log, i) => (
                                <tr
                                    key={log.id}
                                    style={i % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                    onMouseEnter={e => {
                                        (e.currentTarget).style.background = "#F9FAFB";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget).style.background = i % 2 === 0 ? "white" : "#F9FAFB";
                                    }}
                                >
                                    <td style={tableStyles.td}>
                                        <span className="text-xs font-bold text-zinc-600 whitespace-nowrap">
                                            {format(new Date(log.createdAt), "MMM d, yyyy")}
                                        </span>
                                        <br />
                                        <span className="text-[11px] font-semibold text-zinc-400">
                                            {format(new Date(log.createdAt), "h:mm:ss a")}
                                        </span>
                                    </td>
                                    <td style={tableStyles.td}>
                                        <div className="flex items-center gap-3">
                                            <AvatarWithAdjustment 
                                                src={log.user?.avatar} 
                                                className="w-8 h-8 rounded-full shrink-0" 
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900 whitespace-nowrap">
                                                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}
                                                </p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                                    {log.user?.role || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tableStyles.td}>
                                        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700 whitespace-nowrap">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={tableStyles.td}>
                                        <span className="text-xs font-semibold text-zinc-500">
                                            {log.entityType || "-"}
                                        </span>
                                        {log.entityId && (
                                            <span className="ml-2 text-[10px] font-mono text-zinc-400">
                                                ID: {log.entityId.slice(-6)}
                                            </span>
                                        )}
                                    </td>
                                    <td style={tableStyles.td}>
                                        <p className="text-xs font-medium text-zinc-600 max-w-sm line-clamp-2" title={typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}>
                                            {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                                        </p>
                                        {log.aiAnalysis && !log.isSuspicious && (
                                            <p className="mt-1 text-[10px] font-semibold text-blue-600 flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                AI: {log.aiAnalysis}
                                            </p>
                                        )}
                                    </td>
                                    <td style={tableStyles.td}>
                                        <div className="flex flex-col items-start gap-1">
                                            {log.riskScore !== null ? (
                                                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-black ${getRiskColor(log.riskScore)}`}>
                                                    {log.riskScore}/100
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-bold text-zinc-400">
                                                    Pending Analysis
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
