"use client";

import { Phone, MessageCircle, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadActionBarProps {
    mobile: string;
    onSchedule: () => void;
}

export function LeadActionBar({ mobile, onSchedule }: LeadActionBarProps) {
    const cleanMobile = mobile.replace(/\D/g, '');

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 h-16 rounded-full px-6 flex items-center gap-6 shadow-2xl shadow-zinc-900/40 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <a
                href={`tel:${cleanMobile}`}
                title="Call Parent"
                className="h-10 w-10 bg-brand text-[var(--secondary-color)] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-brand/20"
            >
                <Phone className="h-5 w-5" />
            </a>

            <a
                href={`https://wa.me/${cleanMobile}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open WhatsApp"
                className="h-10 w-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-green-500/20"
            >
                <MessageCircle className="h-5 w-5" />
            </a>

            <button
                onClick={onSchedule}
                title="Schedule Follow-up"
                className="h-10 w-10 bg-white text-zinc-900 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
                <Calendar className="h-5 w-5" />
            </button>

            <div className="h-8 w-px bg-white/20" />

            <button className="text-xs font-black uppercase text-white/50 hover:text-white transition-colors flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Send Brochure
            </button>
        </div>
    );
}
