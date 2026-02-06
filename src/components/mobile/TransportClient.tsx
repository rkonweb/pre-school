"use client";

import React, { useState, useEffect } from "react";
import { LiveTransportMap } from "./LiveTransportMap";
import { TransportDetailsCard } from "./TransportDetailsCard";
import { ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface TransportClientProps {
    slug: string;
    parentId: string;
    initialData: any;
    studentId: string;
}

export const TransportClient: React.FC<TransportClientProps> = ({
    slug,
    parentId,
    initialData,
    studentId
}) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const fetchUpdate = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/mobile/v1/transport?studentId=${studentId}`);
            const json = await res.json();
            if (json.success) {
                setData(json.transport);
            }
        } catch (e) {
            console.error("Poll Error:", e);
        } finally {
            setLoading(false);
        }
    };

    // Poll every 5 seconds to match the backend simulation logic
    useEffect(() => {
        const interval = setInterval(fetchUpdate, 5000);
        return () => clearInterval(interval);
    }, [studentId]);

    if (!data) return null;

    const defaultCenter = { lat: 28.6139, lng: 77.2090 };

    return (
        <div className="h-screen w-full relative overflow-hidden bg-slate-100 max-w-md mx-auto shadow-2xl">
            {/* Absolute Map Layer */}
            <div className="absolute inset-0 z-0">
                <LiveTransportMap
                    center={defaultCenter}
                    stops={data.stops || []}
                    liveLocation={data.live}
                />
            </div>

            {/* Floating Header - Elegant Style */}
            <div className="absolute top-12 left-6 right-6 z-50 flex justify-between items-center">
                <Link
                    href={`/${slug}/parent/mobile/dashboard?preview=true`}
                    className="w-12 h-12 rounded-full bg-white shadow-lg shadow-slate-200/50 flex items-center justify-center active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6 text-slate-800" />
                </Link>
                <button
                    onClick={fetchUpdate}
                    className="px-6 py-3 rounded-full bg-white shadow-lg shadow-slate-200/50 text-slate-800 flex items-center gap-2 active:scale-95 transition-transform border border-slate-50"
                >
                    <RefreshCw className={loading ? "w-4 h-4 animate-spin text-[var(--brand-color)]" : "w-4 h-4 text-[var(--brand-color)]"} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Update</span>
                </button>
            </div>

            {/* Details Overlay */}
            <AnimatePresence>
                {data && (
                    <TransportDetailsCard
                        route={data.route}
                        live={data.live}
                        pickupStop={data.pickupStop}
                        dropStop={data.dropStop}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
