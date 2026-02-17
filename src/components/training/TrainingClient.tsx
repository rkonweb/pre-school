"use client";

import React, { useState, useEffect } from "react";
import { TrainingSidebar } from "@/components/training/TrainingSidebar";
import { TrainingViewer } from "@/components/training/TrainingViewer";
import { Loader2, BookOpen } from "lucide-react";
import { getTrainingModulesAction } from "@/app/actions/training-actions";
import { getTrainingCategoriesAction } from "@/app/actions/training-categories";

interface TrainingClientProps {
    initialModules?: any[];
}

export function TrainingClient({ initialModules = [] }: TrainingClientProps) {
    const [modules, setModules] = useState<any[]>(initialModules);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(initialModules.length === 0);
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        if (initialModules.length === 0) {
            const loadData = async () => {
                setLoading(true);
                // Default to teacher category or all
                // For now, let's fetch 'TEACHER' role modules or just everything
                const res = await getTrainingModulesAction();
                if (res.success) {
                    setModules(res.data);
                }
                setLoading(false);
            };
            loadData();
        }
    }, [initialModules]);

    // Resize Handlers
    const startResizing = (e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const stopResizing = () => setIsResizing(false);
        const resize = (e: MouseEvent) => {
            if (isResizing) {
                setSidebarWidth(prev => {
                    const next = prev + e.movementX;
                    if (next < 240) return 240;
                    if (next > 500) return 500;
                    return next;
                });
            }
        };

        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
        }

        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden select-none">
            {/* Sidebar Column */}
            <div
                className="flex flex-col border-r border-zinc-100 bg-zinc-50/50 relative group"
                style={{ width: sidebarWidth, minWidth: 240, maxWidth: 500 }}
            >
                <div className="p-4 border-b border-zinc-100 bg-white">
                    <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        Training Center
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                        Access your training materials and resources.
                    </p>
                </div>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                        </div>
                    ) : (
                        <TrainingSidebar
                            modules={modules}
                            activePageId={activePageId || undefined}
                            onSelectPage={setActivePageId}
                            readOnly={true}
                        />
                    )}
                </div>

                {/* Drag Handle */}
                <div
                    onMouseDown={startResizing}
                    className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-colors z-50 ${isResizing ? 'bg-indigo-500' : 'bg-transparent'}`}
                />
            </div>

            {/* Viewer Area */}
            <div className="flex-1 overflow-hidden relative bg-white">
                {activePageId ? (
                    <TrainingViewer key={activePageId} pageId={activePageId} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-4 p-8 text-center">
                        <div className="h-24 w-24 rounded-3xl bg-zinc-50 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-zinc-200" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">Welcome to Training Center</h3>
                        <p className="text-sm text-zinc-500 max-w-md">
                            Select a module from the sidebar to start browsing training materials and resources.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
