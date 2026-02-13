import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { markAttendanceAction } from "@/app/actions/attendance-actions";
import { getSchoolNow, isSchoolFutureDate } from "@/lib/date-utils";
import { useEffect } from "react";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface AttendanceDialogProps {
    onClose: () => void;
    studentId: string;
    academicYearId?: string;
    onSuccess: () => void;
    initialData?: {
        date: string;
        status: string;
        notes?: string;
    };
    timezone?: string;
}

export function AttendanceDialog({ onClose, studentId, academicYearId, onSuccess, initialData, timezone = "Asia/Kolkata" }: AttendanceDialogProps) {
    const { role } = useRolePermissions();
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    const [date, setDate] = useState(initialData?.date || "");

    useEffect(() => {
        if (!date) {
            const now = getSchoolNow(timezone);
            const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            setDate(d);
        }
    }, [date, timezone]);
    const [status, setStatus] = useState(initialData?.status || "PRESENT");
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic frontend validation
        if (isSchoolFutureDate(date, timezone)) {
            toast.error("Cannot mark attendance for future dates.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await markAttendanceAction(studentId, date, status, notes, academicYearId);
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

    const schoolNow = getSchoolNow(timezone);
    const today = `${schoolNow.getFullYear()}-${String(schoolNow.getMonth() + 1).padStart(2, '0')}-${String(schoolNow.getDate()).padStart(2, '0')}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-zinc-900">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-zinc-900 line-clamp-1">Mark Attendance</h3>
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
                            max={today}
                            disabled={!isAdmin}
                            className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
                            required
                        />
                        {!isAdmin && (
                            <p className="mt-1 text-[10px] font-medium text-zinc-500 px-1">
                                Only Admins can modify past attendance.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-brand appearance-none"
                        >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                            <option value="HALF_DAY">Half Day</option>
                            <option value="EXCUSED">Excused</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3 px-4 font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-brand min-h-[100px] resize-none"
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
                            className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest bg-brand text-white hover:brightness-110 transition-colors flex items-center justify-center gap-2"
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
