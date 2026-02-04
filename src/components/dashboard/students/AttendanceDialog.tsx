import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { markAttendanceAction } from "@/app/actions/attendance-actions";

interface AttendanceDialogProps {
    onClose: () => void;
    studentId: string;
    onSuccess: () => void;
}

export function AttendanceDialog({ onClose, studentId, onSuccess }: AttendanceDialogProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState("PRESENT");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await markAttendanceAction(studentId, date, status, notes);
            if (res.success) {
                toast.success("Attendance marked");
                onSuccess();
            } else {
                toast.error(res.error || "Failed to mark attendance");
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
                    <h3 className="text-xl font-black text-zinc-900">Mark Attendance</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200 appearance-none"
                        >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                            <option value="EXCUSED">Excused</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200 min-h-[100px] resize-none"
                            placeholder="Reason for absence or other notes..."
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
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
