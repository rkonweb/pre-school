"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { clearUserSessionAction } from "@/app/actions/session-actions";
import { toast } from "sonner";

interface SessionTimeoutListenerProps {
    timeoutMinutes?: number;
}

export function SessionTimeoutListener({ timeoutMinutes = 15 }: SessionTimeoutListenerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const logoutUser = useCallback(async () => {
        try {
            // Clear the session on the server
            await clearUserSessionAction();

            // Show toast (though it might disappear quickly on redirect)
            toast.error("Session timed out due to inactivity.");

            // Force redirect to login with callbackUrl
            const currentUrl = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
            router.push(`/school-login?callbackUrl=${currentUrl}`);
        } catch (error) {
            console.error("Logout failed:", error);
            // Fallback redirect
            window.location.href = "/school-login";
        }
    }, [router, pathname, searchParams]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const timeoutMs = timeoutMinutes * 60 * 1000;

        timerRef.current = setTimeout(() => {
            // Double check strict time difference to avoid wake-from-sleep falase positives
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            if (timeSinceLastActivity >= timeoutMs) {
                logoutUser();
            } else {
                // If we woke up but technically haven't been "idle" from the browser's perspective 
                // in terms of event firing (edge case), just restart the remainder.
                // But generally, if no events fired, we assume idle.
                // However, system sleep might pause the timer? 
                // setTimeout is not guaranteed to be strictly wall-clock time during sleep.
                // But for "idle", if the user was asleep, they were idle. So logout is correct.
                logoutUser();
            }
        }, timeoutMs);

        lastActivityRef.current = Date.now();
    }, [timeoutMinutes, logoutUser]);

    useEffect(() => {
        // Events to track
        const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

        // Initial start
        resetTimer();

        // Event handler
        const handleActivity = () => {
            resetTimer();
        };

        // Add listeners
        // Use throttle? For mousemove it's good, but resetTimer is just clearing/setting timeout.
        // JS engine handles that fast enough usually. But to be safe, maybe throttle?
        // For simplicity and strictness, we'll just run it. Chrome handles this fine.
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return null; // This component doesn't render anything
}
