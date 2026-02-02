"use client";

import { useEffect, useState } from "react";
import { subscribeToPushAction } from "@/app/actions/notification-actions";
import { toast } from "sonner";
import { Bell, BellOff, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export function usePushNotifications(userId: string, userType: "PARENT" | "TEACHER" | "ADMIN") {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();

            if (sub) {
                setSubscription(sub);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const subscribe = async () => {
        setIsPending(true);
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                toast.error('Notification permission denied');
                setIsPending(false);
                return false;
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            const result = await subscribeToPushAction({
                userId,
                userType,
                subscription: sub.toJSON() as any,
                deviceType: getDeviceType(),
            });

            if (result.success) {
                setSubscription(sub);
                setIsSubscribed(true);
                toast.success('Push notifications enabled!');
                setIsPending(false);
                return true;
            } else {
                toast.error('Failed to enable notifications');
                setIsPending(false);
                return false;
            }
        } catch (error: any) {
            console.error('Error subscribing to push:', error);
            toast.error('Failed to enable notifications');
            setIsPending(false);
            return false;
        }
    };

    const unsubscribe = async () => {
        setIsPending(true);
        try {
            if (subscription) {
                await subscription.unsubscribe();
                setSubscription(null);
                setIsSubscribed(false);
                toast.success('Push notifications disabled');
                setIsPending(false);
                return true;
            }
            setIsPending(false);
            return false;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast.error('Failed to disable notifications');
            setIsPending(false);
            return false;
        }
    };

    return {
        isSupported,
        isSubscribed,
        subscribe,
        unsubscribe,
        isPending,
    };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'TABLET';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'MOBILE';
    }
    return 'DESKTOP';
}

export function PushNotificationButton({ userId, userType }: {
    userId: string;
    userType: "PARENT" | "TEACHER" | "ADMIN"
}) {
    const { isSupported, isSubscribed, subscribe, unsubscribe, isPending } = usePushNotifications(userId, userType);

    if (!isSupported) return null;

    return (
        <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isPending}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300
                ${isSubscribed
                    ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={isSubscribed ? "Disable Notifications" : "Enable Notifications"}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
                <Bell className="h-4 w-4" />
            ) : (
                <BellOff className="h-4 w-4" />
            )}
            <span className="hidden md:inline">
                {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
            </span>
        </button>
    );
}
