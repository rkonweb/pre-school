"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    alert: (title: string, message: string, variant?: "danger" | "warning" | "info" | "success") => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within ConfirmProvider");
    }
    return context;
}

interface DialogState {
    isOpen: boolean;
    type: "confirm" | "alert";
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: "danger" | "warning" | "info" | "success";
    resolve: ((value: boolean) => void) | null;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [dialogState, setDialogState] = useState<DialogState>({
        isOpen: false,
        type: "confirm",
        title: "",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        variant: "info",
        resolve: null,
    });

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                type: "confirm",
                title: options.title,
                message: options.message,
                confirmText: options.confirmText || "Confirm",
                cancelText: options.cancelText || "Cancel",
                variant: options.variant || "info",
                resolve,
            });
        });
    };

    const alert = (title: string, message: string, variant: "danger" | "warning" | "info" | "success" = "info"): Promise<void> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                type: "alert",
                title,
                message,
                confirmText: "OK",
                cancelText: "",
                variant,
                resolve: () => {
                    resolve();
                    return true;
                },
            });
        });
    };

    const handleConfirm = () => {
        if (dialogState.resolve) {
            dialogState.resolve(true);
        }
        setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    };

    const handleCancel = () => {
        if (dialogState.resolve) {
            dialogState.resolve(false);
        }
        setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    };

    const getIcon = () => {
        switch (dialogState.variant) {
            case "danger":
            case "warning":
                return <AlertTriangle className="h-12 w-12 text-red-500" />;
            case "success":
                return <CheckCircle2 className="h-12 w-12 text-green-500" />;
            case "info":
            default:
                return <Info className="h-12 w-12 text-blue-500" />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (dialogState.variant) {
            case "danger":
            case "warning":
                return "bg-red-600 hover:bg-red-700 text-white";
            case "success":
                return "bg-green-600 hover:bg-green-700 text-white";
            case "info":
            default:
                return "bg-brand hover:brightness-110 text-[var(--secondary-color)]";
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm, alert }}>
            {children}

            {/* Modal */}
            {dialogState.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                        {/* Header with Icon */}
                        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-50 to-white border-b border-zinc-100">
                            <div className="mb-4">{getIcon()}</div>
                            <h3 className="text-2xl font-black text-zinc-900 text-center">
                                {dialogState.title}
                            </h3>
                        </div>

                        {/* Message */}
                        <div className="p-8">
                            <p className="text-sm text-zinc-600 text-center leading-relaxed">
                                {dialogState.message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 bg-zinc-50">
                            {dialogState.type === "confirm" && (
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-6 py-3 rounded-2xl font-bold text-sm text-zinc-700 bg-white border-2 border-zinc-200 hover:bg-zinc-50 transition-all active:scale-95"
                                >
                                    {dialogState.cancelText}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${getConfirmButtonClass()}`}
                            >
                                {dialogState.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
