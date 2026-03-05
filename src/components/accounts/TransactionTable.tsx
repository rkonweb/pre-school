'use client';

import React, { useState } from "react";
import {
    ArrowUpRight, ArrowDownRight, Trash2, ChevronDown, ChevronUp,
    CheckCircle2, Clock, XCircle, Loader2, Bus, CreditCard, User, Zap, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteTransactionAction } from "@/app/actions/account-actions";
import { toast } from "sonner";
import { tableStyles } from "@/components/ui/erp-ui";

type Source = 'TRANSPORT' | 'FEE' | 'PAYROLL' | 'MANUAL';

const SOURCE_CONFIG: Record<Source, { label: string; icon: any; bg: string; text: string }> = {
    TRANSPORT: { label: 'Transport', icon: Bus, bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
    FEE: { label: 'Fee', icon: CreditCard, bg: 'bg-violet-50 border-violet-100', text: 'text-violet-600' },
    PAYROLL: { label: 'Payroll', icon: User, bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600' },
    MANUAL: { label: 'Manual', icon: Zap, bg: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-600' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; cls: string }> = {
    COMPLETED: { label: 'Done', icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
    PENDING: { label: 'Pending', icon: Clock, cls: 'text-amber-600 bg-amber-50' },
    CANCELLED: { label: 'Cancelled', icon: XCircle, cls: 'text-zinc-400 bg-zinc-100' },
    REFUNDED: { label: 'Refunded', icon: XCircle, cls: 'text-red-500 bg-red-50' },
};

interface TransactionTableProps {
    transactions: any[];
    currency: string;
    slug: string;
}

export default function TransactionTable({ transactions, currency, slug }: TransactionTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [localList, setLocalList] = useState(transactions);

    const handleDelete = async (txnId: string) => {
        if (!confirm("Delete this transaction? This cannot be undone.")) return;
        setDeletingId(txnId);
        try {
            const res = await deleteTransactionAction(slug, txnId);
            if (res.success) {
                setLocalList(prev => prev.filter(t => t.id !== txnId));
                toast.success("Transaction deleted");
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch {
            toast.error("Error deleting transaction");
        } finally {
            setDeletingId(null);
        }
    };

    // Compute running balance (newest first = descending)
    let runningBalance = 0;
    const withBalance = [...localList].reverse().map(txn => {
        runningBalance += txn.type === 'CREDIT' ? txn.amount : -txn.amount;
        return { ...txn, runningBalance };
    }).reverse();

    if (localList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                    <Tag className="h-8 w-8 text-zinc-300" />
                </div>
                <p className="text-zinc-500 font-semibold">No transactions found</p>
                <p className="text-zinc-400 text-sm mt-1">Try adjusting your filters or record a new entry.</p>
            </div>
        );
    }

    return (
        <div style={tableStyles.container}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={tableStyles.thead}>
                    <tr>
                        <th style={{ ...tableStyles.thNoSort, width: "7rem" }}>Date</th>
                        <th style={tableStyles.thNoSort}>Description</th>
                        <th style={{ ...tableStyles.thNoSort, width: "8rem" }}>Source</th>
                        <th style={{ ...tableStyles.thNoSort, width: "8rem" }}>Category</th>
                        <th style={{ ...tableStyles.thNoSort, width: "7rem" }}>Status</th>
                        <th style={{ ...tableStyles.thNoSort, width: "9rem", textAlign: "right" }}>Amount</th>
                        <th style={{ ...tableStyles.thNoSort, width: "9rem", textAlign: "right" }}>Balance</th>
                        <th style={{ ...tableStyles.thNoSort, width: "4rem", textAlign: "center" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {withBalance.map((txn, i) => {
                        const isCredit = txn.type === 'CREDIT';
                        const source: Source = txn.source as Source || 'MANUAL';
                        const srcConf = SOURCE_CONFIG[source];
                        const statusConf = STATUS_CONFIG[txn.status] || STATUS_CONFIG['COMPLETED'];
                        const isExpanded = expandedId === txn.id;
                        const isDeleting = deletingId === txn.id;

                        return (
                            <React.Fragment key={txn.id}>
                                <tr
                                    className="group cursor-pointer"
                                    style={i % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                    onMouseEnter={e => {
                                        (e.currentTarget).style.background = "#FFFBEB";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget).style.background = i % 2 === 0 ? "white" : "#F9FAFB";
                                    }}
                                    onClick={() => setExpandedId(isExpanded ? null : txn.id)}
                                >
                                    {/* Date */}
                                    <td style={tableStyles.td}>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-700">
                                                {new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                                {new Date(txn.date).getFullYear()}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Description */}
                                    <td style={tableStyles.td}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                                                isCredit ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-500"
                                            )}>
                                                {isCredit
                                                    ? <ArrowUpRight className="h-4 w-4" />
                                                    : <ArrowDownRight className="h-4 w-4" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1 max-w-[200px]">
                                                    {txn.description || '—'}
                                                </p>
                                                <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase tracking-wider">
                                                    {txn.transactionNo}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Source badge */}
                                    <td style={tableStyles.td}>
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider whitespace-nowrap",
                                            srcConf.bg, srcConf.text
                                        )}>
                                            <srcConf.icon className="h-3 w-3" />
                                            {srcConf.label}
                                        </span>
                                    </td>

                                    {/* Category */}
                                    <td style={tableStyles.td}>
                                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100/50 text-zinc-600 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                            {txn.category?.name || '—'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td style={tableStyles.td}>
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap",
                                            statusConf.cls
                                        )}>
                                            <statusConf.icon className="h-3 w-3" />
                                            {statusConf.label}
                                        </span>
                                    </td>

                                    {/* Amount */}
                                    <td style={{ ...tableStyles.td, textAlign: "right" }}>
                                        <p className={cn(
                                            "text-base font-black tabular-nums",
                                            isCredit ? "text-emerald-600" : "text-zinc-900"
                                        )}>
                                            {isCredit ? '+' : '-'}{currency}{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>

                                    {/* Running Balance */}
                                    <td style={{ ...tableStyles.td, textAlign: "right" }}>
                                        <p className={cn(
                                            "text-sm font-bold tabular-nums",
                                            txn.runningBalance >= 0 ? "text-zinc-500" : "text-red-500"
                                        )}>
                                            {txn.runningBalance >= 0 ? '' : '-'}{currency}{Math.abs(txn.runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>

                                    {/* Actions */}
                                    <td style={{ ...tableStyles.td, textAlign: "center" }} onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(txn.id)}
                                                disabled={isDeleting}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                                title="Delete transaction"
                                            >
                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : txn.id)}
                                                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                                                title={isExpanded ? "Collapse" : "Expand details"}
                                            >
                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Expanded row */}
                                {isExpanded && (
                                    <tr key={`${txn.id}-expanded`} className="bg-zinc-50/50">
                                        <td colSpan={8} className="px-5 py-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                                {txn.vendor && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vendor</p>
                                                        <p className="font-semibold text-zinc-700">{txn.vendor.name}</p>
                                                    </div>
                                                )}
                                                {txn.reference && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Reference</p>
                                                        <p className="font-mono font-semibold text-zinc-700">{txn.reference}</p>
                                                    </div>
                                                )}
                                                {txn.notes && (
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Notes</p>
                                                        <p className="font-semibold text-zinc-600">{txn.notes}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Financial Year</p>
                                                    <p className="font-semibold text-zinc-700">{txn.financialYear?.name || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
