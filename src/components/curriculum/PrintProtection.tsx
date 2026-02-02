"use client";

import { useEffect, useState } from "react";

export function PrintProtection() {
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Detect PrintScreen key
            if (e.key === "PrintScreen") {
                setShowWarning(true);
                // Copy empty text to clipboard to thwart some basic caputre tools 
                // Note: browser support for intercepting PrintScreen varies
                navigator.clipboard.writeText("");
                setTimeout(() => setShowWarning(false), 3000);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen") {
                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 3000);
            }
        }

        // Attempt to detect blur which often happens when screenshot tools are activated
        const handleBlur = () => {
            // setShowWarning(true);
            // setTimeout(() => setShowWarning(false), 2000);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);

        // CSS to hide content during printing if not handled by our secure print
        const style = document.createElement('style');
        style.innerHTML = `
      @media print {
        body { display: none !important; }
      }
    `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
            document.head.removeChild(style);
        };
    }, []);

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
            <div className="text-center p-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-500 ring-2 ring-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                </div>
                <h2 className="text-3xl font-extrabold text-white">Security Violation</h2>
                <p className="mt-4 text-zinc-400 max-w-md">
                    Screen capture is strictly prohibited for curriculum materials.
                    Your activity has been logged for review by the administrator.
                </p>
            </div>
        </div>
    );
}
