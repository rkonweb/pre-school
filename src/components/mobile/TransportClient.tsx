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
    apiKey: string;
}

export const TransportClient: React.FC<TransportClientProps> = ({
    slug,
    parentId,
    initialData,
    studentId,
    apiKey
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
        <div className="h-full w-full relative overflow-hidden bg-slate-100">
            {/* Absolute Map Layer */}
            <div className="absolute inset-0 z-0">
                <LiveTransportMap
                    center={defaultCenter}
                    stops={data.stops || []}
                    liveLocation={data.live}
                    apiKey={apiKey}
                />
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
