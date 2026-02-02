"use client";

import { Edit2, Trash2, BookOpen, MessageSquare, Bell, CheckCircle, Clock, Users, Calendar, Paperclip } from "lucide-react";

interface DiaryListViewProps {
    entries: any[];
    onEdit: (entry: any) => void;
    onDelete: (id: string) => void;
}

export function DiaryListView({ entries, onEdit, onDelete }: DiaryListViewProps) {
    function getTypeIcon(type: string) {
        switch (type) {
            case "HOMEWORK":
                return <BookOpen className="h-4 w-4" />;
            case "MESSAGE":
                return <MessageSquare className="h-4 w-4" />;
            case "ANNOUNCEMENT":
                return <Bell className="h-4 w-4" />;
            case "REMINDER":
                return <Clock className="h-4 w-4" />;
            default:
                return <CheckCircle className="h-4 w-4" />;
        }
    }

    function getTypeColor(type: string) {
        switch (type) {
            case "HOMEWORK":
                return "bg-blue-100 text-blue-700";
            case "MESSAGE":
                return "bg-green-100 text-green-700";
            case "ANNOUNCEMENT":
                return "bg-purple-100 text-purple-700";
            case "REMINDER":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-zinc-100 text-zinc-700";
        }
    }

    function getStatusBadge(status: string) {
        const styles = {
            DRAFT: "bg-zinc-100 text-zinc-700",
            SCHEDULED: "bg-blue-100 text-blue-700",
            PUBLISHED: "bg-green-100 text-green-700",
            ARCHIVED: "bg-zinc-100 text-zinc-400"
        };
        return styles[status as keyof typeof styles] || styles.DRAFT;
    }

    function formatDate(date: string | null) {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    if (entries.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] border border-zinc-200 p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 bg-zinc-50 rounded-[24px] flex items-center justify-center border border-zinc-100">
                        <BookOpen className="h-6 w-6 text-zinc-200" />
                    </div>
                    <p className="text-zinc-400 font-bold text-sm">No diary entries found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {entries.map((entry) => {
                const attachments = entry.attachments ? JSON.parse(entry.attachments) : [];
                const readCount = entry.recipients?.filter((r: any) => r.isRead).length || 0;
                const totalRecipients = entry._count?.recipients || 0;
                const ackCount = entry.recipients?.filter((r: any) => r.isAcknowledged).length || 0;

                return (
                    <div
                        key={entry.id}
                        className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            {/* Type Icon */}
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${getTypeColor(entry.type)}`}>
                                {getTypeIcon(entry.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-zinc-900 mb-1">{entry.title}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getTypeColor(entry.type)}`}>
                                                {entry.type}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getStatusBadge(entry.status)}`}>
                                                {entry.status}
                                            </span>
                                            {entry.priority !== "NORMAL" && (
                                                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-red-100 text-red-700">
                                                    {entry.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(entry)}
                                            className="p-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-900 hover:text-white transition-all"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(entry.id)}
                                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-600 mb-3 line-clamp-2">{entry.content}</p>

                                {/* Meta Info */}
                                <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(entry.scheduledFor || entry.publishedAt)}</span>
                                    </div>
                                    {entry.classroom && (
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>{entry.classroom.name}</span>
                                        </div>
                                    )}
                                    {totalRecipients > 0 && (
                                        <div className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>{readCount}/{totalRecipients} read</span>
                                        </div>
                                    )}
                                    {entry.requiresAck && (
                                        <div className="flex items-center gap-1">
                                            <Bell className="h-3 w-3" />
                                            <span>{ackCount}/{totalRecipients} acknowledged</span>
                                        </div>
                                    )}
                                    {attachments.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            <span>{attachments.length} file(s)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
