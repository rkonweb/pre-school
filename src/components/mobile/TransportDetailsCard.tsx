"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Phone,
    Bus,
    Clock,
    ShieldCheck,
    User,
    Navigation,
    MapPin
} from "lucide-react";

interface TransportDetailsCardProps {
    route: {
        name: string;
        vehicleNumber?: string;
        driverName?: string;
        driverPhone?: string;
    };
    live: {
        lat: number;
        lng: number;
        speed: number;
        lastUpdated: string | Date;
    } | null;
    pickupStop?: any;
    dropStop?: any;
}

export const TransportDetailsCard: React.FC<TransportDetailsCardProps> = ({
    route,
    live,
    pickupStop,
    dropStop
}) => {
    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[32px] p-6 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] absolute bottom-0 left-0 right-0 z-50 pb-8 rounded-b-none"
        >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

            {/* Pulse Anchor for Live Status */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Live</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--brand-color)] flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Bus className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{route.name}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3 text-[var(--brand-color)]" />
                        {route.vehicleNumber || "BUS-2026"}
                    </p>
                </div>
            </div>

            {/* Driver & Call Action */}
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Driver</p>
                        <p className="text-sm font-bold text-slate-800">{route.driverName || "Suresh Kumar"}</p>
                    </div>
                </div>
                <a
                    href={`tel:${route.driverPhone}`}
                    className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
                >
                    <Phone className="w-5 h-5" />
                </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600 uppercase">ETA</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">12 <span className="text-xs font-bold text-slate-400">min</span></p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Navigation className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Speed</span>
                    </div>
                    <p className="text-xl font-black text-slate-800">{Math.round(live?.speed || 0)} <span className="text-xs font-bold text-slate-400">km/h</span></p>
                </div>
            </div>

            {/* Route Progress Preview */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-color)] ring-4 ring-blue-50" />
                    <span className="text-xs font-bold text-slate-600">{pickupStop?.name || "Home"}</span>
                </div>

                <div className="flex-1 h-px bg-slate-100 mx-4 relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-400 px-2 text-[10px] font-bold uppercase tracking-widest">
                        To
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">{dropStop?.name || "School"}</span>
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                </div>
            </div>
        </motion.div>
    );
};
