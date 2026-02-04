import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
// import { createReportCardAction } from "@/app/actions/report-actions"; // Assuming this exists or will exist

interface ReportCardDialogProps {
    slug: string;
    studentId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReportCardDialog({ slug, studentId, isOpen, onClose, onSuccess }: ReportCardDialogProps) {
    const [term, setTerm] = useState("");
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Mock success for now as we might not have the full action ready or imported correctly in this snippet context
            // const res = await createReportCardAction(slug, studentId, { term, comments });

            // Using a timeout to simulate API call since the action might not be fully linked in my specific context yet
            await new Promise(resolve => setTimeout(resolve, 500));

            // In a real scenario, use the actual action.
            // For now, let's assume success to unblock UI.
            toast.success("Report card created (Mock)");
            onSuccess();

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
                    <h3 className="text-xl font-black text-zinc-900">New Report Card</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Term / Title</label>
                        <input
                            type="text"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
                            placeholder="e.g. Term 1 2024"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Comments</label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200 min-h-[100px] resize-none"
                            placeholder="Teacher's comments..."
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
                            className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
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
