"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html>
            <body className="bg-zinc-50 min-h-screen flex items-center justify-center p-4 font-sans text-zinc-900">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
                    <p className="text-zinc-500 mb-8">
                        A critical error occurred. Our team has been notified.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="w-full py-3 px-4 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Try again
                    </button>
                    {error.digest && (
                        <p className="mt-4 text-xs text-zinc-400 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}
