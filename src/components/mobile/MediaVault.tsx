"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Image as ImageIcon,
    Video,
    Mic,
    Play,
    Maximize2,
    Download,
    Calendar,
    Filter
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type MediaType = "PHOTO" | "VIDEO" | "AUDIO";

interface MediaItem {
    id: string;
    type: MediaType;
    url: string;
    title: string;
    timestamp: string | Date;
    source: string;
}

interface MediaVaultProps {
    items: MediaItem[];
    loading?: boolean;
}

export const MediaVault: React.FC<MediaVaultProps> = ({
    items,
    loading = false
}) => {
    const [filter, setFilter] = useState<MediaType | "ALL">("ALL");
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    const filteredItems = items.filter(item => filter === "ALL" || item.type === filter);

    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-2 px-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="pb-24">
            {/* Category Pills */}
            <div className="flex gap-2 px-6 mb-6 overflow-x-auto no-scrollbar pt-2">
                {["ALL", "PHOTO", "VIDEO", "AUDIO"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type as any)}
                        className={cn(
                            "px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95",
                            filter === type
                                ? "bg-summer-navy text-white shadow-lg shadow-navy-100"
                                : "bg-white text-gray-400 border border-gray-100"
                        )}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-3 gap-1 px-1">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, idx) => (
                        <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedMedia(item)}
                            className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-100 rounded-sm"
                        >
                            {item.type === "PHOTO" ? (
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : item.type === "VIDEO" ? (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                    <Video className="w-8 h-8 text-white/50" />
                                    <div className="absolute top-2 right-2">
                                        <Play className="w-3 h-3 text-white fill-current" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50">
                                    <Mic className="w-8 h-8 text-indigo-400" />
                                    <span className="text-[8px] font-black text-indigo-400 uppercase mt-2">Voice Note</span>
                                </div>
                            )}

                            {/* Overlay Metadata */}
                            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[8px] text-white font-bold truncate">{item.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                    <div className="p-6 rounded-full bg-gray-50 mb-4">
                        <ImageIcon className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-bold text-summer-navy">No media found</h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">
                        Records will appear here as they are shared by teachers.
                    </p>
                </div>
            )}

            {/* Fullscreen Preview Modal */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col pt-12"
                    >
                        <div className="flex justify-between items-center px-6 mb-6">
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                            <div className="text-center">
                                <p className="text-white text-xs font-bold uppercase tracking-widest leading-none mb-1">
                                    {selectedMedia.source}
                                </p>
                                <p className="text-white/40 text-[10px] uppercase font-black">
                                    {format(new Date(selectedMedia.timestamp), "MMMM do, yyyy")}
                                </p>
                            </div>
                            <button className="text-white/60">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center p-4">
                            {selectedMedia.type === "PHOTO" ? (
                                <motion.img
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    src={selectedMedia.url}
                                    className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl"
                                />
                            ) : selectedMedia.type === "VIDEO" ? (
                                <video
                                    controls
                                    src={selectedMedia.url}
                                    className="max-w-full max-h-[70vh] rounded-2xl"
                                    autoPlay
                                />
                            ) : (
                                <div className="w-full max-w-xs bg-white/10 rounded-[40px] p-8 backdrop-blur-xl border border-white/10">
                                    <div className="w-20 h-20 bg-summer-teal rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/20">
                                        <Mic className="w-10 h-10 text-white" />
                                    </div>
                                    <p className="text-center text-white font-bold mb-8">Voice Note from Teacher</p>
                                    {/* Simplified Playback Simulation */}
                                    <div className="h-1 bg-white/20 rounded-full w-full relative mb-8">
                                        <div className="absolute left-0 top-0 h-full w-[40%] bg-summer-teal rounded-full" />
                                        <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                                    </div>
                                    <div className="flex justify-center">
                                        <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-summer-navy active:scale-95 transition-transform">
                                            <Play className="w-6 h-6 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-10 mb-12">
                            <h2 className="text-white text-xl font-black mb-2 tracking-tight">{selectedMedia.title}</h2>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Included in the daily diary entry for your child's learning milestones.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
