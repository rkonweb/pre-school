"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useModal } from "./ModalContext";
import { X, Loader2, AlertTriangle, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ============================================================================
// CONFIRMATION MODAL
// ============================================================================

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary";
}

function ConfirmationModal({ title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", variant = "primary" }: ConfirmationModalProps) {
    const { closeModal } = useModal();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        closeModal();
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
            <div className="p-6 text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${variant === "danger" ? "bg-red-50 text-red-600" : "bg-brand/10 text-brand"}`}>
                    {variant === "danger" ? <AlertTriangle className="h-8 w-8" /> : <Info className="h-8 w-8" />}
                </div>

                <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto leading-relaxed">{message}</p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => {
                            if (onCancel) onCancel();
                            closeModal();
                        }}
                        disabled={loading}
                        className="min-w-[100px] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all border border-zinc-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`min-w-[140px] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all ${variant === "danger"
                            ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                            : "bg-brand hover:brightness-110 shadow-brand/30"
                            }`}
                    >
                        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// INPUT MODAL
// ============================================================================

interface InputModalProps {
    title: string;
    description?: string;
    label?: string;
    placeholder?: string;
    initialValue?: string;
    onSubmit: (value: string) => Promise<void> | void;
    submitText?: string;
}

function InputModal({ title, description, label, placeholder, initialValue = "", onSubmit, submitText = "Submit" }: InputModalProps) {
    const { closeModal } = useModal();
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Force focus after mount
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Safer submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted. Value:", value);
        if (!value.trim()) return;

        try {
            setLoading(true);
            console.log("Calling onSubmit prop...");
            await onSubmit(value);
            console.log("onSubmit returned.");
            closeModal();
        } catch (error) {
            console.error("Modal Submit Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-zinc-200">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
                    <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {description && <p className="text-sm text-zinc-500 mb-6">{description}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {label && <label className="text-xs font-medium text-zinc-700">{label}</label>}
                            <input
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={loading}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !value.trim()}
                                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-brand hover:brightness-110 shadow-lg shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitText}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================================================
// GLOBAL RENDERER
// ============================================================================

export function GlobalModalRenderer() {
    const { isOpen, modalType, modalProps, closeModal } = useModal();
    const MotionDiv = motion.div as any; // Cast to avoid lint errors with older types

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <MotionDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none p-4">
                        <MotionDiv
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="pointer-events-auto"
                        >
                            {modalType === "CONFIRMATION" && <ConfirmationModal {...modalProps} />}
                            {modalType === "INPUT" && <InputModal {...modalProps} />}
                        </MotionDiv>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
