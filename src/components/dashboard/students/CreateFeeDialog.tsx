import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { createFeeAction, getFeeStructuresAction } from "@/app/actions/fee-actions";
import { getCurrencySymbol } from "@/lib/utils";

interface CreateFeeDialogProps {
    slug: string;
    studentId: string;
    academicYearId?: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currency?: string;
}

export function CreateFeeDialog({ slug, studentId, academicYearId, isOpen, onClose, onSuccess, currency }: CreateFeeDialogProps) {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [structures, setStructures] = useState<any[]>([]);
    const [isLoadingStructures, setIsLoadingStructures] = useState(false);
    const [selectedStructureId, setSelectedStructureId] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadStructures();
        }
    }, [isOpen]);

    async function loadStructures() {
        setIsLoadingStructures(true);
        try {
            const res = await getFeeStructuresAction(slug);
            if (res.success) {
                setStructures(res.data || []);
            }
        } catch (error) {
            console.error("Failed to load fee structures");
        } finally {
            setIsLoadingStructures(false);
        }
    }

    const handleStructureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const structId = e.target.value;
        setSelectedStructureId(structId);

        if (structId) {
            const struct = structures.find(s => s.id === structId);
            if (struct) {
                setTitle(struct.name);
                // Calculate total amount from components
                const total = struct.components?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
                setAmount(total.toString());

                // Build description from components
                const desc = struct.components?.map((c: any) => `${c.name}: ${getCurrencySymbol(c.currency)}${c.amount}`).join('\n');
                setDescription(desc || "");
            }
        } else {
            setTitle("");
            setAmount("");
            setDescription("");
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await createFeeAction(
                studentId,
                title,
                parseFloat(amount),
                new Date(dueDate),
                description,
                academicYearId
            );

            if (res.success) {
                toast.success("Invoice created");
                onSuccess();
            } else {
                toast.error(res.error || "Failed to create invoice");
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
                    <h3 className="text-xl font-black text-zinc-900">Create Invoice</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Structure Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Load from Template</label>
                        <div className="relative">
                            <select
                                value={selectedStructureId}
                                onChange={handleStructureChange}
                                disabled={isLoadingStructures}
                                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand appearance-none"
                            >
                                <option value="">Custom Invoice</option>
                                {structures.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.academicYear})</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand"
                            placeholder="e.g. Tuition Fee Q1"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-brand min-h-[80px] resize-none"
                            placeholder="Additional details..."
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
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
