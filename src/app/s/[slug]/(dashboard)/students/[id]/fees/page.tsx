"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams } from "next/navigation";
import {
    Briefcase,
    Calendar,
    Plus,
    X,
    Loader2
} from "lucide-react";
import { cn, getCurrencySymbol } from "@/lib/utils";
import { getStudentFeesAction, deleteFeeAction, syncStudentFeesAction } from "@/app/actions/fee-actions";
import { getStudentAction } from "@/app/actions/student-actions";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { toast } from "sonner";
import { useConfirm } from "@/contexts/ConfirmContext";
import dynamic from "next/dynamic";

const PayFeeDialog = dynamic(() => import("@/components/dashboard/students/PayFeeDialog").then(m => m.PayFeeDialog), { ssr: false });

export default function FeesTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;
    const { confirm: confirmDialog } = useConfirm();

    const [isLoading, setIsLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [fees, setFees] = useState<any[]>([]);
    const [isPayFeeOpen, setIsPayFeeOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        setIsLoading(true);
        // Fetch student for currency info and fees
        const [studentRes, feesRes] = await Promise.all([
            getStudentAction(slug, id),
            getStudentFeesAction(slug, id)
        ]);

        if (studentRes.success) setStudent(studentRes.student);
        if (feesRes.success) setFees(feesRes.data || []);

        setIsLoading(false);
    }

    const handleSync = async () => {
        toast.promise(syncStudentFeesAction(slug, id), {
            loading: 'Syncing fees...',
            success: () => {
                loadData();
                return 'Fees synced successfully!';
            },
            error: 'Failed to sync fees.'
        });
    };

    if (isLoading || !student) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    const stats = {
        total: fees.reduce((acc, fee) => acc + fee.amount, 0),
        collected: fees.reduce((acc, fee) => acc + (fee.payments?.reduce((pAcc: number, p: any) => pAcc + p.amount, 0) || 0), 0),
        pending: 0,
        overdue: 0
    };
    stats.pending = stats.total - stats.collected;

    fees.forEach(fee => {
        const paid = fee.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
        if (paid < fee.amount && new Date(fee.dueDate) < new Date()) {
            stats.overdue += (fee.amount - paid);
        }
    });

    const groupedFees: Record<string, any[]> = {};
    fees.forEach(fee => {
        const yearName = fee.academicYear?.name || "Other";
        if (!groupedFees[yearName]) groupedFees[yearName] = [];
        groupedFees[yearName].push(fee);
    });

    const sortedYears = Object.keys(groupedFees).sort((a, b) => b.localeCompare(a));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-zinc-900">Fee History</h2>
                <StandardActionButton
                    onClick={handleSync}
                    variant="secondary"
                    icon={Plus}
                    label="Sync Fees"
                    className="h-10"
                />
            </div>

            {/* Fee Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Invoiced" value={stats.total} currency={student.school?.currency} />
                <StatCard label="Collected" value={stats.collected} currency={student.school?.currency} color="text-emerald-600" />
                <StatCard label="Pending" value={stats.pending} currency={student.school?.currency} />
                <StatCard label="Overdue" value={stats.overdue} currency={student.school?.currency} color="text-red-600" />
            </div>

            {/* Invoices Grouped by Year */}
            {fees.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl py-20 text-center">
                    <Briefcase className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-400 font-bold">No invoices generated yet.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {sortedYears.map(year => (
                        <div key={year} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <Calendar className="h-5 w-5 text-brand" />
                                <h3 className="text-lg font-black text-zinc-900">Academic Year {year}</h3>
                            </div>

                            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice Details</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Paid</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Balance</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {groupedFees[year].map((fee) => {
                                            const totalPaid = fee.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
                                            const balance = fee.amount - totalPaid;
                                            const isOverdue = balance > 0 && new Date(fee.dueDate) < new Date();

                                            return (
                                                <tr key={fee.id} className="hover:bg-zinc-50/50 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <div className="font-bold text-zinc-900 text-base">{fee.title}</div>
                                                        <div className="text-[10px] text-zinc-400 font-bold mt-1">Due {new Date(fee.dueDate).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                            fee.status === 'PAID' ? "bg-emerald-100 text-emerald-700" :
                                                                fee.status === 'PARTIAL' ? "bg-blue-100 text-blue-700" :
                                                                    isOverdue ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-500"
                                                        )}>
                                                            {isOverdue && fee.status !== 'PAID' ? 'OVERDUE' : fee.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-zinc-900">
                                                        {getCurrencySymbol(student.school?.currency)}{fee.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-emerald-600">
                                                        {getCurrencySymbol(student.school?.currency)}{totalPaid.toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-zinc-500">
                                                        {getCurrencySymbol(student.school?.currency)}{balance.toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {fee.status !== 'PAID' && (
                                                                <StandardActionButton
                                                                    onClick={() => {
                                                                        setSelectedFee(fee);
                                                                        setIsPayFeeOpen(true);
                                                                    }}
                                                                    variant="view"
                                                                    label="Pay"
                                                                    className="h-9 px-4 rounded-xl text-[10px]"
                                                                />
                                                            )}
                                                            <StandardActionButton
                                                                onClick={async () => {
                                                                    const confirmed = await confirmDialog({
                                                                        title: "Delete Invoice",
                                                                        message: "Are you sure you want to delete this invoice?",
                                                                        variant: "danger",
                                                                        confirmText: "Delete",
                                                                        cancelText: "Cancel"
                                                                    });

                                                                    if (!confirmed) return;

                                                                    const res = await deleteFeeAction(slug, fee.id);
                                                                    if (res.success) {
                                                                        toast.success("Invoice deleted");
                                                                        loadData();
                                                                    } else {
                                                                        toast.error(res.error || "Failed to delete");
                                                                    }
                                                                }}
                                                                variant="delete"
                                                                icon={X}
                                                                iconOnly
                                                                tooltip="Delete Invoice"
                                                                className="h-9 w-9 rounded-xl"
                                                                permission={{ module: 'fees', action: 'delete' }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isPayFeeOpen && (
                <PayFeeDialog
                    isOpen={isPayFeeOpen}
                    onClose={() => setIsPayFeeOpen(false)}
                    onSuccess={() => {
                        setIsPayFeeOpen(false);
                        loadData();
                    }}
                    fee={selectedFee}
                    slug={slug}
                    currency={student.school?.currency}
                />
            )}
        </div>
    );
}

function StatCard({ label, value, currency, color = "text-zinc-900" }: any) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{label}</p>
            <p className={cn("text-2xl font-black", color)}>{getCurrencySymbol(currency)}{value.toLocaleString()}</p>
        </div>
    );
}
