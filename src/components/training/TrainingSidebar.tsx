"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    Book,
    Folder,
    FileText,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    createTrainingTopicAction,
    createTrainingPageAction,
    renameTrainingModuleAction,
    renameTrainingTopicAction,
    renameTrainingPageAction,
    deleteTrainingModuleAction,
    deleteTrainingTopicAction,
    deleteTrainingPageAction
} from "@/app/actions/training-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/ui/modal/ModalContext";

interface TrainingSidebarProps {
    modules: any[];
    activePageId?: string;
    onSelectPage: (id: string) => void;
    onRefresh?: () => void;
}

export function TrainingSidebar({ modules, activePageId, onSelectPage, onRefresh }: TrainingSidebarProps) {
    const router = useRouter();
    const { openModal } = useModal();
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)));
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

    const toggleModule = (id: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleTopic = (id: string) => {
        setExpandedTopics(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAddTopic = async (moduleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("INPUT", {
            title: "New Topic",
            description: "Enter a title for the new topic.",
            placeholder: "e.g., Introduction",
            submitText: "Create Topic",
            onSubmit: async (title: string) => {
                const res = await createTrainingTopicAction(moduleId, title);
                if (res.success) {
                    toast.success("Topic created");
                    router.refresh();
                    if (onRefresh) onRefresh();
                    setExpandedModules(prev => new Set(prev).add(moduleId));
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const handleAddPage = async (topicId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("INPUT", {
            title: "New Page",
            description: "Enter a title for the new page.",
            placeholder: "e.g., Lesson 1",
            submitText: "Create Page",
            onSubmit: async (title: string) => {
                const res = await createTrainingPageAction(topicId, title);
                if (res.success) {
                    toast.success("Page created");
                    router.refresh();
                    if (onRefresh) onRefresh();
                    setExpandedTopics(prev => new Set(prev).add(topicId));
                    onSelectPage(res.data.id);
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const handleRenameModule = async (id: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("INPUT", {
            title: "Rename Module",
            initialValue: currentTitle,
            submitText: "Update",
            onSubmit: async (title: string) => {
                if (title === currentTitle) return;
                const res = await renameTrainingModuleAction(id, title);
                if (res.success) {
                    toast.success("Module renamed");
                    router.refresh();
                    if (onRefresh) onRefresh();
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const handleDeleteModule = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("CONFIRMATION", {
            title: "Delete Module",
            message: "Are you sure you want to delete this module? All topics and pages inside it will be permanently lost.",
            confirmText: "Delete Module",
            variant: "danger",
            onConfirm: async () => {
                const res = await deleteTrainingModuleAction(id);
                if (res.success) {
                    toast.success("Module deleted");
                    router.refresh();
                    if (onRefresh) onRefresh();
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const handleRenameTopic = async (id: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("INPUT", {
            title: "Rename Topic",
            initialValue: currentTitle,
            submitText: "Update",
            onSubmit: async (title: string) => {
                if (title === currentTitle) return;
                const res = await renameTrainingTopicAction(id, title);
                if (res.success) {
                    toast.success("Topic renamed");
                    router.refresh();
                    if (onRefresh) onRefresh();
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const handleDeleteTopic = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("CONFIRMATION", {
            title: "Delete Topic",
            message: "Are you sure you want to delete this topic? All pages inside it will be permanently lost.",
            confirmText: "Delete Topic",
            variant: "danger",
            onConfirm: async () => {
                const res = await deleteTrainingTopicAction(id);
                if (res.success) {
                    toast.success("Topic deleted");
                    router.refresh();
                    if (onRefresh) onRefresh();
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const handleRenamePage = async (id: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("INPUT", {
            title: "Rename Page",
            initialValue: currentTitle,
            submitText: "Update",
            onSubmit: async (title: string) => {
                if (title === currentTitle) return;
                const res = await renameTrainingPageAction(id, title);
                if (res.success) {
                    toast.success("Page renamed");
                    router.refresh();
                    if (onRefresh) onRefresh();
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    const handleDeletePage = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        openModal("CONFIRMATION", {
            title: "Delete Page",
            message: "Are you sure you want to delete this page?",
            confirmText: "Delete Page",
            variant: "danger",
            onConfirm: async () => {
                const res = await deleteTrainingPageAction(id);
                if (res.success) {
                    toast.success("Page deleted");
                    router.refresh();
                    if (onRefresh) onRefresh();
                    if (activePageId === id) onSelectPage("");
                } else {
                    toast.error(res.error);
                }
            }
        });
    };

    return (
        <div className="w-full h-full border-r border-zinc-200 bg-zinc-50/80 flex flex-col font-sans">
            <div className="p-4 border-b border-zinc-200 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-zinc-900">
                    <Book className="h-4 w-4" />
                    <h2 className="text-sm font-semibold tracking-tight">Training Modules</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {modules.map((module) => (
                    <div key={module.id} className="mb-1">
                        {/* Module Header */}
                        <div
                            onClick={() => toggleModule(module.id)}
                            className={cn(
                                "group flex items-center justify-between px-3 py-1.5 mx-2 rounded-md cursor-pointer transition-colors select-none",
                                expandedModules.has(module.id) ? "bg-white shadow-sm ring-1 ring-zinc-200" : "hover:bg-zinc-100"
                            )}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <ChevronRight className={cn(
                                    "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
                                    expandedModules.has(module.id) && "rotate-90"
                                )} />
                                <span className="text-lg font-black text-zinc-900 truncate tracking-tight">{module.title}</span>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleRenameModule(module.id, module.title, e)}
                                    className="h-6 w-6 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-blue-600 transition-all"
                                    title="Rename Module"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteModule(module.id, e)}
                                    className="h-6 w-6 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-all"
                                    title="Delete Module"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={(e) => handleAddTopic(module.id, e)}
                                    className="h-6 w-6 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-green-600 transition-all"
                                    title="Add Topic"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Topics */}
                        <AnimatePresence initial={false}>
                            {expandedModules.has(module.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-0.5 pt-0.5 pb-2">
                                        {module.topics.map((topic: any) => (
                                            <div key={topic.id} className="relative">
                                                {/* Vertical line guide */}
                                                <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-zinc-200" />

                                                <div
                                                    onClick={() => toggleTopic(topic.id)}
                                                    className="group flex items-center justify-between pl-8 pr-3 py-1 mx-2 rounded-md hover:bg-zinc-100/80 cursor-pointer select-none relative z-10"
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Folder className={cn(
                                                            "h-3.5 w-3.5 shrink-0 transition-colors",
                                                            expandedTopics.has(topic.id) ? "text-indigo-600 fill-indigo-600/20" : "text-zinc-600"
                                                        )} />
                                                        <span className="text-base font-bold text-zinc-800 truncate">{topic.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => handleRenameTopic(topic.id, topic.title, e)}
                                                            className="h-5 w-5 rounded hover:bg-white flex items-center justify-center text-zinc-400 hover:text-blue-600 transition-all shadow-none hover:shadow-sm"
                                                            title="Rename Topic"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteTopic(topic.id, e)}
                                                            className="h-5 w-5 rounded hover:bg-white flex items-center justify-center text-zinc-400 hover:text-red-600 transition-all shadow-none hover:shadow-sm"
                                                            title="Delete Topic"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleAddPage(topic.id, e)}
                                                            className="h-5 w-5 rounded hover:bg-white flex items-center justify-center text-zinc-400 hover:text-green-600 transition-all shadow-none hover:shadow-sm"
                                                            title="Add Page"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Pages */}
                                                <AnimatePresence initial={false}>
                                                    {expandedTopics.has(topic.id) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pt-0.5">
                                                                {topic.pages.map((page: any) => (
                                                                    <div key={page.id} className="relative">
                                                                        <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-zinc-200" />
                                                                        <div
                                                                            onClick={() => onSelectPage(page.id)}
                                                                            className={cn(
                                                                                "group flex items-center gap-2 pl-[3.25rem] pr-3 py-2.5 mx-2 rounded-md cursor-pointer transition-all select-none relative z-10 text-sm font-semibold",
                                                                                activePageId === page.id
                                                                                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200"
                                                                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                                                            )}
                                                                        >
                                                                            <FileText className={cn(
                                                                                "h-4 w-4 shrink-0",
                                                                                activePageId === page.id ? "text-white" : "text-zinc-400"
                                                                            )} />
                                                                            <span className="truncate flex-1">{page.title}</span>
                                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button
                                                                                    onClick={(e) => handleRenamePage(page.id, page.title, e)}
                                                                                    className="h-5 w-5 rounded hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-blue-600 transition-all"
                                                                                    title="Rename Page"
                                                                                >
                                                                                    <Pencil className="h-3 w-3" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => handleDeletePage(page.id, e)}
                                                                                    className="h-5 w-5 rounded hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-all"
                                                                                    title="Delete Page"
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {topic.pages.length === 0 && (
                                                                    <div className="pl-[3.25rem] py-1 text-[10px] text-zinc-400 italic relative">
                                                                        <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-zinc-200" />
                                                                        No pages
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                        {module.topics.length === 0 && (
                                            <div className="pl-8 py-1 text-[10px] text-zinc-400 italic relative">
                                                <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-zinc-200" />
                                                No topics
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {modules.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Book className="h-6 w-6 text-zinc-300" />
                        </div>
                        <p className="text-sm font-medium text-zinc-900">No Modules</p>
                        <p className="text-xs text-zinc-500 mt-1">Create a module to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
