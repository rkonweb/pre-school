"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck, Sparkles, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
    getUserNotificationsAction,
    markNotificationReadAction,
    markAllNotificationsReadAction,
} from "@/app/actions/notification-actions";

interface NotificationCenterProps {
    userId: string;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const loadNotifications = async () => {
        const res = await getUserNotificationsAction(userId);
        if (res.success && res.data) {
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        const result = await markNotificationReadAction(notificationId);
        if (result.success) {
            loadNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        setIsLoading(true);
        const result = await markAllNotificationsReadAction(userId);
        if (result.success) {
            toast.success("All notifications marked as read");
            loadNotifications();
        }
        setIsLoading(false);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "HOMEWORK_REMINDER": return <Calendar className="h-5 w-5 text-blue-500" />;
            case "HOMEWORK_REVIEWED": return <Sparkles className="h-5 w-5 text-amber-500" />;
            case "ANNOUNCEMENT": return <Bell className="h-5 w-5 text-purple-500" />;
            case "ALERT": return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Bell className="h-5 w-5 text-zinc-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "HOMEWORK_REMINDER": return "from-blue-50 to-blue-100 border-blue-200";
            case "HOMEWORK_REVIEWED": return "from-amber-50 to-amber-100 border-amber-200";
            case "ANNOUNCEMENT": return "from-purple-50 to-purple-100 border-purple-200";
            case "ALERT": return "from-red-50 to-red-100 border-red-200";
            default: return "from-zinc-50 to-zinc-100 border-zinc-200";
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-all text-zinc-600"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60]"
                        />

                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[70] flex flex-col"
                        >
                            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                        Notifications
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="h-9 w-9 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                                    >
                                        <X className="h-4 w-4 text-zinc-500" />
                                    </button>
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={isLoading}
                                        className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto bg-white">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                            <Bell className="h-10 w-10 text-zinc-200" />
                                        </div>
                                        <p className="text-zinc-500 font-bold">All caught up!</p>
                                        <p className="text-zinc-400 text-sm mt-1">We'll notify you when Emma has new work or updates.</p>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-3">
                                        {notifications.map((notification) => (
                                            <NotificationCard
                                                key={notification.id}
                                                notification={notification}
                                                onMarkAsRead={handleMarkAsRead}
                                                getIcon={getNotificationIcon}
                                                getColor={getNotificationColor}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function NotificationCard({ notification, onMarkAsRead, getIcon, getColor }: any) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        if (!notification.isRead) onMarkAsRead(notification.id);
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleClick}
            className={`
                group relative rounded-2xl p-4 cursor-pointer transition-all border
                ${notification.isRead
                    ? 'bg-zinc-50/50 border-zinc-100 grayscale-[0.5]'
                    : 'bg-white border-blue-100 shadow-sm shadow-blue-500/5'
                }
            `}
        >
            {!notification.isRead && (
                <div className="absolute top-4 right-4 h-2 w-2 bg-blue-600 rounded-full" />
            )}

            <div className="flex gap-4">
                <div className={`
                    h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${notification.isRead ? 'bg-zinc-100' : 'bg-gradient-to-br ' + getColor(notification.type)}
                `}>
                    {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-black mb-1 pr-4 ${notification.isRead ? 'text-zinc-600' : 'text-zinc-900'}`}>
                        {notification.title}
                    </h4>
                    <p className={`text-xs ${notification.isRead ? 'text-zinc-400' : 'text-zinc-500'} ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {notification.message}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-wider">
                        {timeAgo(notification.createdAt)}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
