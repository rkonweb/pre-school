"use client";

import React, { useEffect, useState } from "react";
import { TrainingSidebar } from "@/components/training/TrainingSidebar";
import { useSearchParams } from "next/navigation";
import { TrainingEditor } from "@/components/training/TrainingEditor";
import {
    getTrainingModulesAction,
    createTrainingModuleAction
} from "@/app/actions/training-actions";
import { getTrainingCategoriesAction } from "@/app/actions/training-categories";
import { toast } from "sonner";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import { useModal } from "@/components/ui/modal/ModalContext";

export default function TrainingPage() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get("categoryId");
    const roleParam = searchParams.get("role")?.toUpperCase(); // Fallback for old links or direct access

    const [modules, setModules] = useState<any[]>([]);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState("TRAINING");

    // Resizable Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);

    const { openInputModal } = useModal();

    const loadData = async () => {
        console.log("TrainingPage loadData", { categoryId, roleParam });
        setLoading(true);
        try {
            // resolve category context
            let targetCategoryId = categoryId;
            let displayName = "TRAINING";

            if (categoryId) {
                // Fetch all categories to find name (or we could have a specific getCategory action, but this is cached/fast enough)
                const catRes = await getTrainingCategoriesAction();
                if (catRes.success && catRes.data) {
                    const cat = catRes.data.find((c: any) => c.id === categoryId);
                    if (cat) displayName = cat.name.toUpperCase();
                }
                const modRes = await getTrainingModulesAction(categoryId);
                console.log("TrainingPage modRes (categoryId)", modRes);
                if (modRes.success) setModules(modRes.data);
            } else if (roleParam) {
                // Legacy/Fallback support
                displayName = roleParam;
                const modRes = await getTrainingModulesAction(undefined, roleParam);
                console.log("TrainingPage modRes (roleParam)", modRes);
                if (modRes.success) setModules(modRes.data);
            } else {
                // Default to "Teacher" category if exists, or first category
                const catRes = await getTrainingCategoriesAction();
                if (catRes.success && catRes.data && catRes.data.length > 0) {
                    const teacherCat = catRes.data.find((c: any) => c.name.toLowerCase() === "teacher");
                    const defaultCat = teacherCat || catRes.data[0];

                    targetCategoryId = defaultCat.id;
                    displayName = defaultCat.name.toUpperCase();
                    const modRes = await getTrainingModulesAction(targetCategoryId ?? undefined);
                    if (modRes.success) setModules(modRes.data);
                }
            }
            setCategoryName(displayName);
        } catch (error) {
            toast.error("Failed to load training data");
        }
        setLoading(false);
    }

    useEffect(() => {
        loadData();
        setActivePageId(null);
    }, [categoryId, roleParam]);


    const handleCreateModule = async () => {
        openInputModal({
            title: `Create New ${categoryName} Module`,
            description: `Enter a title for the new ${categoryName.toLowerCase()} training module.`,
            placeholder: "e.g., Classroom Management",
            onSubmit: async (title: string) => {
                const safeCategoryId = categoryId ?? undefined;
                const safeRole = categoryId ? undefined : (roleParam || "TEACHER");
                const res = await createTrainingModuleAction(title, "", safeRole, safeCategoryId);
                if (res.success) {
                    toast.success("Module created");
                    loadData();
                } else {
                    toast.error(res.error || "Failed to create module");
                }
            }
        });
    };

    // Resize Handlers
    const startResizing = (e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const stopResizing = () => setIsResizing(false);
        const resize = (e: MouseEvent) => {
            if (isResizing) {
                const newWidth = e.clientX - 288; // Subtract AdminSidebar width (approx 288px) or adjust based on layout
                // Actually, e.clientX is absolute. We need to account for the AdminSidebar on the left.
                // The main layout starts after the AdminSidebar. The AdminSidebar collapses.
                // It's safer to rely on movementX, but that accumulates errors.
                // Let's assume the standard layout for now, or just calculate delta.

                // Better approach:
                // We don't exactly know the left offset easily without a ref to the container.
                // But we can constrain the width change. 
                // Let's rely on standard resizing logic relative to the sidebar container? 
                // No, just update width based on mouse movement would be delta based.
                // Let's use logic: newWidth = currentWidth + e.movementX
                // But we need to use functional state update to access current.

                // Wait, functional update with event listener is tricky due to closure staleness.
                // Let's use a Ref for the current width or just use e.clientX if we know the offset.
                // Assuming AdminSidebar is on the left. 
                // If collapsed: 80px. If expanded: 288px.
                // This makes e.clientX unreliable unless we track sidebar state.

                // Let's stick to e.movementX for simplicity, it usually works well enough for UI resizing.
                setSidebarWidth(prev => {
                    const next = prev + e.movementX;
                    if (next < 240) return 240;
                    if (next > 600) return 600;
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
                style={{ width: sidebarWidth, minWidth: 240, maxWidth: 600 }}
            >
                <div className="p-4 border-b border-zinc-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900">{categoryName} TRAINING</h2>
                        <span className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                            {modules.length} Modules
                        </span>
                    </div>

                    <button
                        onClick={handleCreateModule}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-200"
                    >
                        <Plus className="h-4 w-4" />
                        New Module
                    </button>
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
                            onRefresh={loadData}
                        />
                    )}
                </div>

                {/* Drag Handle */}
                <div
                    onMouseDown={startResizing}
                    className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-colors z-50 ${isResizing ? 'bg-indigo-500' : 'bg-transparent'}`}
                />
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden relative">
                {activePageId ? (
                    <TrainingEditor key={activePageId} pageId={activePageId} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-4">
                        <div className="h-24 w-24 rounded-3xl bg-zinc-50 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-zinc-200" />
                        </div>
                        <p className="text-sm font-medium">Select a page to start editing content</p>
                    </div>
                )}
            </div>
        </div>
    );
}
