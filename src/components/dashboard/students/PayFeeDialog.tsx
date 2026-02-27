import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { recordPaymentAction } from "@/app/actions/fee-actions";
import { getCurrencySymbol } from "@/lib/utils";

interface PayFeeDialogProps {
    fee: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currency?: string;
    slug: string;
}

export function PayFeeDialog({ fee, isOpen, onClose, onSuccess, currency, slug }: PayFeeDialogProps) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("CASH");
    const [reference, setReference] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && fee) {
            const paid = fee.payments?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
            const remaining = fee.amount - paid;
            setAmount(remaining.toString());
            setPaymentDate(new Date().toISOString().split('T')[0]); // Reset date on open
            setReference(""); // Reset reference
            setMethod("CASH"); // Reset method
        }
    }, [isOpen, fee]);

    if (!isOpen || !fee) return null;

    const totalPaid = fee.payments?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
    const remainingBalance = fee.amount - totalPaid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payAmount = parseFloat(amount);
        if (isNaN(payAmount) || payAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (payAmount > remainingBalance + 1) { // small buffer for float errors
            toast.error("Amount cannot exceed remaining balance");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await recordPaymentAction(slug, fee.id, payAmount, method, reference, new Date(paymentDate));
            if (res.success) {
                toast.success("Payment recorded");
                onSuccess();
            } else {
                toast.error(res.error || "Failed to record payment");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-zinc-900">Record Payment</h3>
                        <p className="text-xs text-zinc-500 font-bold mt-1">For: {fee.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Remaining Balance</p>
                        <p className="text-lg font-black text-zinc-900">{getCurrencySymbol(currency)}{remainingBalance.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Fee</p>
                        <p className="text-sm font-bold text-zinc-500">{getCurrencySymbol(currency)}{fee.amount.toLocaleString()}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Payment Amount</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 pl-12 pr-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand"
                                placeholder="0.00"
                                max={remainingBalance}
                                step="0.01"
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                                {getCurrencySymbol(currency)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Method</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand appearance-none"
                            >
                                <option value="CASH">Cash</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="CHEQUE">Cheque</option>
                                <option value="CARD">Card</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Date</label>
                            <input
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Transaction No. / Reference</label>
                        <input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand"
                            placeholder="e.g. UPI Ref, Cheque No."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-brand text-white hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Record Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
