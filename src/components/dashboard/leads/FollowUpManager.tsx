"use client";

import { useState } from "react";
import { format, isToday } from "date-fns";
import { Calendar as CalendarIcon, Phone, MessageCircle, Clock, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createFollowUpAction, completeFollowUpAction } from "@/app/actions/follow-up-actions";

interface FollowUpManagerProps {
    slug: string;
    leadId: string;
    followUps: any[];
    onUpdate?: () => void;
}

export function FollowUpManager({ slug, leadId, followUps, onUpdate }: FollowUpManagerProps) {
    const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [type, setType] = useState("CALL");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("10:00");
    const [notes, setNotes] = useState("");

    const filteredFollowUps = followUps.filter(f =>
        activeTab === 'PENDING' ? f.status !== 'COMPLETED' : f.status === 'COMPLETED'
    );

    async function handleCreate() {
        if (!date) return;
        setIsSubmitting(true);

        // Combine date and time
        const scheduledAt = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        scheduledAt.setHours(hours, minutes);

        const res = await createFollowUpAction(slug, {
            leadId,
            type,
            scheduledAt,
            notes
        });

        if (res.success) {
            setIsDialogOpen(false);
            setNotes("");
            // Reset to defaults
            setDate(new Date());
            setTime("10:00");
            if (onUpdate) onUpdate();
        } else {
            alert("Failed to schedule follow-up");
        }
        setIsSubmitting(false);
    }

    async function handleComplete(id: string) {
        if (!confirm("Mark this follow-up as done?")) return;
        await completeFollowUpAction(slug, id, "Completed from Lead Detail");
        if (onUpdate) onUpdate();
    }

    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

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
                <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'PENDING' ? "bg-white text-brand shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('COMPLETED')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === 'COMPLETED' ? "bg-white text-green-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        History
                    </button>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="text-[10px] font-black uppercase text-brand hover:brightness-90 flex items-center gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Schedule
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-6 pb-2 bg-white">
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900">
                                Schedule Follow-up
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 pt-2 flex flex-col gap-6 bg-white">

                            {/* Type Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Follow-up Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'CALL', label: 'Call', icon: Phone, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                                        { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600 bg-green-50 border-green-100' },
                                        { id: 'EMAIL', label: 'Email', icon: MessageCircle, color: 'text-purple-600 bg-purple-50 border-purple-100' }, // Reusing Icon for now as Email icon wasn't imported
                                        { id: 'MEETING', label: 'Meeting', icon: Clock, color: 'text-orange-600 bg-orange-50 border-orange-100' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setType(item.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all",
                                                type === item.id
                                                    ? `ring-2 ring-offset-2 ring-brand ${item.color} border-transparent shadow-md`
                                                    : "bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50 hover:border-zinc-200"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">Select Date</label>
                                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                                    <Calendar
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
                                placeholder="Add purpose or notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="rounded-2xl resize-none bg-zinc-50/50 border-zinc-100 focus:bg-white transition-all min-h-[100px] text-sm p-4 placeholder:text-zinc-400"
                            />

                            <Button
                                onClick={handleCreate}
                                disabled={isSubmitting || !date}
                                className="w-full h-14 rounded-2xl bg-[#A08359] hover:bg-[#8A7048] text-white font-black uppercase tracking-widest shadow-xl shadow-[#A08359]/20 transition-all hover:scale-[1.02] active:scale-95 text-xs"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule Follow-up"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[400px]">
                {filteredFollowUps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-300">
                        <CalendarIcon className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No {activeTab.toLowerCase()} follow-ups</p>
                    </div>
                ) : (
                    filteredFollowUps.map(item => (
                        <div key={item.id} className="group flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-brand/20 transition-all">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                item.type === 'CALL' ? "bg-blue-100 text-blue-600" :
                                    item.type === 'WHATSAPP' ? "bg-green-100 text-green-600" :
                                        "bg-zinc-200 text-zinc-500"
                            )}>
                                {item.type === 'CALL' ? <Phone className="h-4 w-4" /> :
                                    item.type === 'WHATSAPP' ? <MessageCircle className="h-4 w-4" /> :
                                        <Clock className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-black text-zinc-900 uppercase">
                                        {format(new Date(item.scheduledAt), "MMM d, h:mm a")}
                                    </span>
                                    {item.status !== 'COMPLETED' && (
                                        <button
                                            onClick={() => handleComplete(item.id)}
                                            className="h-6 px-2 rounded-md bg-white border border-zinc-200 text-[10px] font-bold text-zinc-400 hover:text-green-600 hover:border-green-200 transition-colors"
                                        >
                                            Mark Done
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-zinc-600 leading-snug">{item.notes || "No notes provided"}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md",
                                        new Date(item.scheduledAt) < new Date() && item.status !== 'COMPLETED'
                                            ? "bg-red-100 text-red-600"
                                            : "bg-zinc-100 text-zinc-400"
                                    )}>
                                        {item.status}
                                    </span>
                                    {item.assignedTo && (
                                        <span className="text-[9px] font-bold text-zinc-400">
                                            • Assigned to {item.assignedTo.firstName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
