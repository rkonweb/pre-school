"use client";

import { useState } from "react";
import { format, isToday } from "date-fns";
import { MapPin, Calendar, Clock, Plus, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarInput } from "@/components/ui/calendar";
import { bookTourAction } from "@/app/actions/school-tour-actions";
import { useRouter } from "next/navigation";

interface TourManagerProps {
    slug: string;
    leadId: string;
    tours: any[];
    onUpdate?: () => void;
}

export function TourManager({ slug, leadId, tours, onUpdate }: TourManagerProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [date, setDate] = useState<Date | undefined>(new Date(new Date().setHours(0, 0, 0, 0)));
    const [time, setTime] = useState("10:00");
    const [notes, setNotes] = useState("");

    async function handleBook() {
        if (!date) return;
        setIsSubmitting(true);

        const scheduledAt = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        scheduledAt.setHours(hours, minutes);

        const res = await bookTourAction(slug, {
            leadId,
            scheduledAt,
            notes
        });

        if (res.success) {
            setIsDialogOpen(false);
            setNotes("");
            setDate(new Date());
            setTime("10:00");
            setNotes("");
            setDate(new Date());
            setTime("10:00");
            if (onUpdate) onUpdate();
            router.refresh();
        } else {
            alert("Failed to book tour");
        }
        setIsSubmitting(false);
    }

    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30"];

    const availableTimeSlots = timeSlots.filter(slot => {
        if (!date || !isToday(date)) return true;

        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        if (slotHours > currentHours) return true;
        if (slotHours === currentHours && slotMinutes > currentMinutes) return true;
        return false;
    });

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">School Tours</h3>
                    <p className="text-xs text-zinc-500 font-bold">Manage campus visits</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="h-10 px-4 bg-brand text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand/20 hover:scale-105 transition-all">
                            <MapPin className="h-3.5 w-3.5" /> Book Tour
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-6 pb-2 bg-white">
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900">
                                Book School Tour
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 pt-2 flex flex-col gap-6 bg-white">

                            {/* Date Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Select Date</label>
                                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                                    <CalendarInput
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={{ before: new Date() }}
                                        className="rounded-xl border-none shadow-none bg-transparent p-0 w-full"
                                        classNames={{
                                            months: "flex w-full justify-center",
                                            month_caption: "flex justify-center mb-4 relative items-center",
                                            caption_label: "text-sm font-bold text-zinc-900",
                                            nav: "flex items-center space-x-1",
                                            weekday: "text-zinc-400 font-bold text-[10px] uppercase tracking-widest w-9 text-center",
                                            day: "h-8 w-8 p-0 font-bold text-[11px] text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all flex items-center justify-center mx-auto",
                                            selected: "!bg-transparent !text-brand hover:!text-brand/80 focus:!text-brand !rounded-full shadow-none",
                                            today: "!text-brand !font-black !bg-transparent",
                                            disabled: "!text-zinc-200 !opacity-50 !bg-transparent hover:!bg-transparent hover:!text-zinc-200 cursor-not-allowed",
                                        }}
                                    />
                                </div>

                            </div>

                            {/* Time Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Select Time</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableTimeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setTime(slot)}
                                            className={cn(
                                                "py-2 rounded-xl text-xs font-bold transition-all border",
                                                time === slot
                                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/20 scale-105"
                                                    : "bg-white text-zinc-600 border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50"
                                            )}
                                        >
                                            {format(new Date().setHours(...(slot.split(':').map(Number) as [number, number])), "h:mm a")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Textarea
                                placeholder="Special requests or notes for the tour..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="rounded-2xl resize-none bg-zinc-50/50 border-zinc-100 focus:bg-white transition-all min-h-[100px] text-sm p-4 placeholder:text-zinc-400"
                            />

                            <Button
                                onClick={handleBook}
                                disabled={isSubmitting || !date}
                                className="w-full h-14 rounded-2xl bg-[#A08359] hover:bg-[#8A7048] text-white font-black uppercase tracking-widest shadow-xl shadow-[#A08359]/20 transition-all hover:scale-[1.02] active:scale-95 text-xs"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[400px]">
                {tours.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-300">
                        <MapPin className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No tours scheduled</p>
                    </div>
                ) : (
                    tours.map(tour => (
                        <div key={tour.id} className="group flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-brand/20 transition-all">
                            <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex flex-col items-center justify-center shrink-0 border border-orange-200">
                                <span className="text-xs font-black leading-none">{format(new Date(tour.scheduledAt), "d")}</span>
                                <span className="text-[8px] font-black uppercase">{format(new Date(tour.scheduledAt), "MMM")}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-black text-zinc-900 uppercase">
                                        {format(new Date(tour.scheduledAt), "h:mm a")} - {format(new Date(new Date(tour.scheduledAt).getTime() + 60 * 60 * 1000), "h:mm a")}
                                    </span>
                                    {tour.status === 'COMPLETED' ? (
                                        <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[9px] font-black uppercase">Completed</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[9px] font-black uppercase">Scheduled</span>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-zinc-500 leading-snug mb-2">{tour.notes || "Standard Campus Tour"}</p>

                                {tour.assignedTo && (
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <User className="h-3 w-3" />
                                        <span className="text-[10px] font-bold uppercase">Guide: {tour.assignedTo.firstName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
