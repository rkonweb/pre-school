'use client';

import { useState, useEffect } from "react";
import {
    Plus,
    X,
    Bus,
    DollarSign,
    Calendar,
    FileText,
    Loader2,
    CheckCircle2,
    Edit2
} from "lucide-react";
import { addTransportExpenseAction, updateTransportExpenseAction } from "@/app/actions/expense-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/upload/FileUpload";

interface ExpenseFormProps {
    slug: string;
    vehicles: any[];
    initialData?: any;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export default function ExpenseForm({ slug, vehicles, initialData, trigger, onSuccess }: ExpenseFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        vehicleId: "",
        category: "FUEL",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        receiptUrl: ""
    });

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                vehicleId: initialData.vehicleId || "",
                category: initialData.category || "FUEL",
                amount: initialData.amount?.toString() || "",
                date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                description: initialData.description || "",
                receiptUrl: initialData.receiptUrl || ""
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = initialData
                ? await updateTransportExpenseAction(slug, initialData.id, formData)
                : await addTransportExpenseAction(slug, formData);

            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                    if (!initialData) {
                        setFormData({
                            vehicleId: "",
                            category: "FUEL",
                            amount: "",
                            date: new Date().toISOString().split('T')[0],
                            description: "",
                            receiptUrl: ""
                        });
                    }
                    onSuccess?.();
                }, 1500);
            } else {
                alert(res.error || `Failed to ${initialData ? 'update' : 'add'} expense`);
            }
        } catch (err) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                {trigger || (
                    <button
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all active:scale-95 group"
                    >
                        <Plus className="h-5 w-5" />
                        ADD EXPENSE
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 tracking-tight">
                                    {initialData ? 'Update Expense' : 'Post New Expense'}
                                </h2>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                    {initialData ? 'Modify Ledger Entry' : 'Financial Transaction Entry'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-zinc-200 rounded-xl transition-colors"
                            >
                                <X className="h-5 w-5 text-zinc-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {success ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 bg-green-100 rounded-full text-green-600 animate-bounce">
                                        <CheckCircle2 className="h-12 w-12" />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900">
                                        {initialData ? 'Record Updated!' : 'Expense Recorded!'}
                                    </h3>
                                    <p className="text-zinc-500 font-medium">The ledger has been updated and AI checks are running.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Vehicle</label>
                                            <div className="relative">
                                                <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <select
                                                    required
                                                    value={formData.vehicleId}
                                                    onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand transition-all appearance-none"
                                                >
                                                    <option value="">Select Vehicle</option>
                                                    {vehicles.map(v => (
                                                        <option key={v.id} value={v.id}>{v.registrationNumber} ({v.model})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Category</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <select
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand transition-all appearance-none"
                                                >
                                                    <option value="FUEL">Fuel Fill</option>
                                                    <option value="MAINTENANCE">General Maintenance</option>
                                                    <option value="REPAIR">Major Repair</option>
                                                    <option value="INSURANCE">Insurance Renewal</option>
                                                    <option value="PERMIT">Permit Fees</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Bill Amount (INR)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400 text-sm">₹</div>
                                            <input
                                                type="number"
                                                required
                                                placeholder="0.00"
                                                value={formData.amount}
                                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full pl-10 pr-4 py-4 bg-zinc-900 border-none text-white rounded-2xl text-xl font-black placeholder:text-zinc-700 outline-none focus:ring-4 focus:ring-zinc-800 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Transaction Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Notes / Description</label>
                                        <textarea
                                            placeholder="Specify details (e.g., Oil change, Brake issues, 40L Petrol)"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand transition-all h-20 resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">Bill / Receipt (JPG, PDF)</label>
                                        <FileUpload
                                            value={formData.receiptUrl}
                                            onUpload={(url) => setFormData({ ...formData, receiptUrl: url })}
                                            schoolSlug={slug}
                                            mainFolder="transport"
                                            subFolder={formData.vehicleId || "receipts"}
                                            label="Receipt"
                                            allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                                        />
                                    </div>

                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                PROCESSING...
                                            </>
                                        ) : (
                                            initialData ? "UPDATE TRANSACTION" : "RECORD TRANSACTION"
                                        )}
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
