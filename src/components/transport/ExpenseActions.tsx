'use client';

import { useState } from "react";
import {
    MoreHorizontal,
    Edit2,
    Trash2,
    CheckCircle2,
    Loader2,
    AlertCircle,
    XCircle,
    Check
} from "lucide-react";
import {
    deleteTransportExpenseAction,
    resolveExpenseAnomalyAction,
    approveTransportExpenseAction,
    rejectTransportExpenseAction
} from "@/app/actions/expense-actions";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ExpenseForm from "./ExpenseForm";
import { toast } from "sonner";

interface ExpenseActionsProps {
    slug: string;
    expense: any;
    vehicles: any[];
}

export default function ExpenseActions({ slug, expense, vehicles }: ExpenseActionsProps) {
    const [loading, setLoading] = useState(false);

    const { can } = useRolePermissions();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this expense record? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const res = await deleteTransportExpenseAction(slug, expense.id);
            if (res.success) {
                toast.success("Expense deleted successfully");
            } else {
                toast.error(res.error || "Failed to delete expense");
            }
        } catch (err) {
            toast.error("An error occurred during deletion");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        setLoading(true);
        try {
            const res = await resolveExpenseAnomalyAction(slug, expense.id);
            if (res.success) {
                toast.success("Anomaly resolved and verified");
            } else {
                toast.error(res.error || "Failed to resolve anomaly");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        try {
            const res = await approveTransportExpenseAction(slug, expense.id);
            if (res.success) {
                toast.success("Expense approved");
            } else {
                toast.error(res.error || "Failed to approve");
            }
        } catch (err) {
            toast.error("Error approving expense");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt("Please enter the reason for rejection:");
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
            toast.error("Rejection reason is required");
            return;
        }

        setLoading(true);
        try {
            const res = await rejectTransportExpenseAction(slug, expense.id, reason);
            if (res.success) {
                toast.success("Expense rejected");
            } else {
                toast.error(res.error || "Failed to reject");
            }
        } catch (err) {
            toast.error("Error rejecting expense");
        } finally {
            setLoading(false);
        }
    };

    const canApprove = can("transport.expenses", "approve");
    const isPending = expense.status === "PENDING";

    return (
        <div className="flex items-center gap-1">
            {isPending && canApprove && (
                <>
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                        title="Approve Claim"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="p-2 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors"
                        title="Reject Claim"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    </button>
                </>
            )}

            {expense.isSuspicious && (
                <button
                    onClick={handleResolve}
                    disabled={loading}
                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                    title="Resolve & Verify"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                </button>
            )}

            <ExpenseForm
                slug={slug}
                vehicles={vehicles}
                initialData={expense}
                trigger={
                    <button
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-zinc-900"
                        title="Edit Record"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                }
            />

            <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-zinc-400 hover:text-red-600"
                title="Delete Expense"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
        </div>
    );
}
