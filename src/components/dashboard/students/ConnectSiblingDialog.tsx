import { useState } from "react";
import { X, Loader2, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { searchStudentsAction, connectSiblingAction } from "@/app/actions/student-actions";

interface ConnectSiblingDialogProps {
    slug: string;
    studentId: string;
    currentParentPhone: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ConnectSiblingDialog({ slug, studentId, currentParentPhone, isOpen, onClose, onSuccess }: ConnectSiblingDialogProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!query) return;
        setIsLoading(true);
        try {
            const res = await searchStudentsAction(slug, query);
            if (res.success && res.students) {
                setResults(res.students.filter((s: any) => s.id !== studentId));
            } else {
                setResults([]);
            }
        } catch (error) {
            toast.error("Search failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async (siblingId: string) => {
        setIsSubmitting(true);
        try {
            // Logic: we likely link them via parent Phone number or explicitly.
            // Assuming the action handles the linking logic
            const res = await connectSiblingAction(slug, studentId, siblingId);
            if (res.success) {
                toast.success("Sibling connected");
                onSuccess();
            } else {
                toast.error(res.error || "Failed to connect");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-zinc-900">Connect Sibling</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
                            placeholder="Search by name..."
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="w-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-colors"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {results.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div>
                                    <p className="text-xs font-bold text-zinc-900">{student.firstName} {student.lastName}</p>
                                    <p className="text-[10px] text-zinc-500">{student.admissionNumber}</p>
                                </div>
                                <button
                                    onClick={() => handleConnect(student.id)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 transition-colors"
                                >
                                    Connect
                                </button>
                            </div>
                        ))}
                        {results.length === 0 && query && !isLoading && (
                            <p className="text-center text-zinc-400 text-xs py-4">No students found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
