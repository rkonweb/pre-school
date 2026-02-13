
"use client";

import { useState } from "react";
import {
    Folder,
    FileText,
    ChevronRight,
    Home,
    Download,
    Search,
    File as FileIcon,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentBrowserProps = {
    category: any; // Using any for simplicity with deep Prisma types, strictly standard interfaces preferred in prod
};

export function DocumentBrowser({ category }: DocumentBrowserProps) {
    const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
    const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Navigation Helpers
    const currentModule = category.modules.find((m: any) => m.id === currentModuleId);
    const currentTopic = currentModule?.topics.find((t: any) => t.id === currentTopicId);

    const handleModuleClick = (moduleId: string) => {
        setCurrentModuleId(moduleId);
        setCurrentTopicId(null);
    };

    const handleTopicClick = (topicId: string) => {
        setCurrentTopicId(topicId);
    };

    const goBack = () => {
        if (currentTopicId) {
            setCurrentTopicId(null);
        } else {
            setCurrentModuleId(null);
        }
    };

    const goHome = () => {
        setCurrentModuleId(null);
        setCurrentTopicId(null);
    };

    // Filter Logic (Basic)
    // If searching, we flatten the view or highlight?
    // For simplicity, let's keep search separate or just filter filtering current view.
    // Let's implement global search later if needed.

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">

            {/* Toolbar / Breadcrumbs */}
            <div className="border-b border-zinc-100 dark:border-zinc-800 p-4 flex items-center justify-between gap-4 bg-zinc-50/50">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 overflow-hidden">
                    <button
                        onClick={goHome}
                        className={cn(
                            "flex items-center gap-1 hover:text-brand transition-colors",
                            !currentModuleId && "font-bold text-zinc-900 dark:text-zinc-50"
                        )}
                    >
                        <Home className="h-4 w-4" />
                        <span>Root</span>
                    </button>

                    {currentModule && (
                        <>
                            <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
                            <button
                                onClick={() => setCurrentTopicId(null)}
                                className={cn(
                                    "hover:text-brand transition-colors truncate",
                                    !currentTopicId && "font-bold text-zinc-900 dark:text-zinc-50"
                                )}
                            >
                                {currentModule.title}
                            </button>
                        </>
                    )}

                    {currentTopic && (
                        <>
                            <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
                            <span className="font-bold text-zinc-900 dark:text-zinc-50 truncate">
                                {currentTopic.title}
                            </span>
                        </>
                    )}
                </div>

                {/* Search (Visual for now) */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="pl-9 pr-4 py-1.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-64"
                        disabled
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">

                {/* VIEW: ROOT (Modules Categories) */}
                {!currentModuleId && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {category.modules.map((module: any) => (
                            <button
                                key={module.id}
                                onClick={() => handleModuleClick(module.id)}
                                className="group flex flex-col items-start p-5 rounded-xl border border-zinc-200 bg-white hover:border-brand/30 hover:shadow-md hover:shadow-brand/5 transition-all text-left"
                            >
                                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                    <Folder className="h-8 w-8 fill-blue-600/20" />
                                </div>
                                <h3 className="font-bold text-zinc-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-xs text-zinc-500 line-clamp-2 mb-3 h-8">
                                    {module.description || "No description"}
                                </p>
                                <div className="mt-auto flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 px-2 py-1 rounded w-full">
                                    <span className="flex-1">{module.topics.length} Sections</span>
                                    <ChevronRight className="h-3 w-3" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* VIEW: MODULE (Topics List) */}
                {currentModuleId && !currentTopicId && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-zinc-900 mb-2">{currentModule.title}</h2>
                            <p className="text-zinc-500 text-sm">{currentModule.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentModule.topics.map((topic: any) => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTopicClick(topic.id)}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all text-left"
                                >
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <Folder className="h-5 w-5 fill-indigo-600/20" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-zinc-900 text-sm">{topic.title}</h4>
                                        <p className="text-xs text-zinc-500">{topic.pages.length} Files</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                                </button>
                            ))}

                            {currentModule.topics.length === 0 && (
                                <div className="col-span-full py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                                    <Folder className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No sections in this folder yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW: TOPIC (Pages/Files List) */}
                {currentTopicId && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                    <Folder className="h-5 w-5 text-zinc-400" />
                                    {currentTopic.title}
                                </h2>
                                <p className="text-sm text-zinc-500 mt-1 pl-7">
                                    Documents and resources details
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {currentTopic.pages.map((page: any) => (
                                <div key={page.id} className="group rounded-xl border border-zinc-200 bg-white p-5 hover:shadow-lg hover:shadow-zinc-200/50 hover:border-zinc-300 transition-all">

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-zinc-900 text-base">{page.title}</h3>
                                                <p className="text-xs text-zinc-500">Updated {new Date(page.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Preview (if simple text) */}
                                    <div
                                        className="prose prose-sm max-w-none text-zinc-600 mb-4 bg-zinc-50 p-4 rounded-lg border border-zinc-100"
                                        dangerouslySetInnerHTML={{ __html: page.content }}
                                    />

                                    {/* Attachments */}
                                    {page.attachments && page.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-100">
                                            {page.attachments.map((att: any) => (
                                                <a
                                                    key={att.id}
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                                                >
                                                    <FileIcon className="h-3 w-3" />
                                                    {att.name || "Attachment"}
                                                    <Download className="h-3 w-3 opacity-50 ml-1" />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            ))}

                            {currentTopic.pages.length === 0 && (
                                <div className="py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No documents found in this section.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
