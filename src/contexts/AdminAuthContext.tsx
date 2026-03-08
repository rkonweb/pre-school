"use client";

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";
import { ShieldAlert, Fingerprint, MessageSquareText, Key, CheckCircle2, ArrowRight } from "lucide-react";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { generateBiometricAuthenticationOptions, verifyBiometricAuthentication } from "@/app/actions/webauthn-actions";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth-actions";
import { startAuthentication } from "@simplewebauthn/browser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminAuthOptions {
    actionName: string;
    description?: string;
}

interface AdminAuthContextType {
    requestAdminAuth: (options: AdminAuthOptions) => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error("useAdminAuth must be used within AdminAuthProvider");
    }
    return context;
}

interface DialogState {
    isOpen: boolean;
    actionName: string;
    description: string;
    resolve: ((value: boolean) => void) | null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [dialogState, setDialogState] = useState<DialogState>({
        isOpen: false,
        actionName: "",
        description: "",
        resolve: null,
    });

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"select_method" | "otp_input" | "success">("select_method");
    const [mobile, setMobile] = useState<string | null>(null);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpErr, setOtpErr] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (dialogState.isOpen) {
            setStep("select_method");
            setOtp(["", "", "", "", "", ""]);
            setOtpErr(false);
            setLoading(true);
            
            // Feth current user's mobile to use for OTP/Biometric
            getCurrentUserAction().then(res => {
                if (res.success && res.user && res.user.mobile) {
                    setMobile(res.user.mobile);
                } else {
                    toast.error("Could not fetch user mobile number.");
                    handleCancel();
                }
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [dialogState.isOpen]);

    const requestAdminAuth = (options: AdminAuthOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                actionName: options.actionName,
                description: options.description || "Secondary authentication is required to perform this action.",
                resolve,
            });
        });
    };

    const handleSuccess = () => {
        setStep("success");
        setTimeout(() => {
            if (dialogState.resolve) {
                dialogState.resolve(true);
            }
            setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
        }, 1500);
    };

    const handleCancel = () => {
        if (dialogState.resolve) {
            dialogState.resolve(false);
        }
        setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    };

    const startBiometric = async () => {
        if (!mobile) return;
        setLoading(true);
        try {
            const optionsRes = await generateBiometricAuthenticationOptions(mobile);
            if (!optionsRes.success || !optionsRes.options) {
                toast.error(optionsRes.error || "Biometric offline.");
                setLoading(false);
                return;
            }

            let authResp;
            try {
                authResp = await startAuthentication({ optionsJSON: optionsRes.options });
            } catch (err: any) {
                if (err.name !== "NotAllowedError") {
                    toast.error("Biometric authentication failed or cancelled.");
                }
                setLoading(false);
                return;
            }

            const verifyRes = await verifyBiometricAuthentication(mobile, authResp);
            if (verifyRes.success) {
                handleSuccess();
            } else {
                toast.error("Biometric verification failed.");
            }
        } catch (e: any) {
            toast.error("Authentication error.");
        } finally {
            setLoading(false);
        }
    };

    const requestOtp = async () => {
        if (!mobile) return;
        setLoading(true);
        try {
            const res = await sendOtpAction(mobile, "school-login");
            if (res.success) {
                setStep("otp_input");
            } else {
                toast.error(res.error || "Failed to send OTP.");
            }
        } catch (e) {
            toast.error("Connection error while requesting OTP.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpCode = async (code: string) => {
        if (!mobile) return;
        setLoading(true);
        try {
            const res = await verifyOtpAction(mobile, code, "school-login");
            if (res.success) {
                handleSuccess();
            } else {
                setOtpErr(true);
                setOtp(["", "", "", "", "", ""]);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            }
        } catch (e) {
            toast.error("Verification error.");
            setOtpErr(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpInput = (i: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[i] = val.slice(-1);
        setOtp(next);
        setOtpErr(false);
        if (val && i < 5) {
            setTimeout(() => otpRefs.current[i + 1]?.focus(), 0);
        }
    };

    const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) {
            const next = [...otp];
            next[i - 1] = "";
            setOtp(next);
            setTimeout(() => otpRefs.current[i - 1]?.focus(), 0);
        }
        if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const next = [...otp];
        d.split("").forEach((c, index) => { if (index < 6) next[index] = c; });
        setOtp(next);
        const focusIndex = Math.min(d.length, 5);
        setTimeout(() => otpRefs.current[focusIndex]?.focus(), 0);
        
        if (d.length === 6) {
            verifyOtpCode(d);
        }
    };

    useEffect(() => {
        if (step === "otp_input" && otp.every(d => d !== "")) {
            verifyOtpCode(otp.join(""));
        }
    }, [otp, step]);

    return (
        <AdminAuthContext.Provider value={{ requestAdminAuth }}>
            {children}

            {dialogState.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                <div className="h-8 w-8 rounded-full border-4 border-zinc-200 border-t-amber-600 animate-spin" />
                            </div>
                        )}
                        
                        {/* Header */}
                        <div className="flex flex-col items-center justify-center pt-8 pb-6 px-8 bg-amber-50 border-b border-amber-100">
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-sm">
                                <ShieldAlert strokeWidth={2.5} className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-amber-950 text-center">
                                Identity Verification
                            </h3>
                            <p className="text-sm font-medium text-amber-700/80 mt-1 text-center">
                                Required for: <span className="font-bold">{dialogState.actionName}</span>
                            </p>
                        </div>

                        {/* Body - Step 1: Select Method */}
                        {step === "select_method" && (
                            <div className="p-8">
                                <p className="text-sm text-zinc-500 mb-6 text-center">
                                    {dialogState.description}
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={startBiometric}
                                        className="group relative flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-zinc-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all text-left bg-white"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-amber-100 group-hover:text-amber-600 text-zinc-500 flex items-center justify-center transition-colors">
                                            <Fingerprint className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-zinc-900 group-hover:text-amber-900">Use Passkey</h4>
                                            <p className="text-xs text-zinc-500 font-medium">Touch ID, Face ID, or Windows Hello</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-amber-500 transition-colors" />
                                    </button>

                                    <button 
                                        onClick={requestOtp}
                                        className="group relative flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-zinc-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left bg-white"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-blue-100 group-hover:text-blue-600 text-zinc-500 flex items-center justify-center transition-colors">
                                            <MessageSquareText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-zinc-900 group-hover:text-blue-900">Send an OTP</h4>
                                            <p className="text-xs text-zinc-500 font-medium">SMS verification to your registered mobile</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Body - Step 2: OTP Input */}
                        {step === "otp_input" && (
                            <div className="p-8 pb-10 flex flex-col items-center">
                                <h4 className="font-bold text-zinc-900 mb-1 text-center">Enter 6-Digit Code</h4>
                                <p className="text-sm font-medium text-zinc-500 mb-6 text-center">
                                    Sent to {mobile ? "••••••" + mobile.slice(-4) : "your phone"}
                                </p>

                                <div className="flex gap-2 mb-6" onPaste={handlePaste}>
                                    {otp.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={d}
                                            onChange={(e) => handleOtpInput(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKey(i, e)}
                                            className={cn(
                                                "w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all",
                                                otpErr ? "border-red-500 text-red-600 bg-red-50" : "border-zinc-200 focus:border-blue-500 focus:ring-4 ring-blue-50 text-zinc-900"
                                            )}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setStep("select_method")}
                                    className="text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
                                >
                                    Choose another method
                                </button>
                            </div>
                        )}

                        {/* Body - Step 3: Success */}
                        {step === "success" && (
                            <div className="p-10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-lg text-zinc-900">Identity Verified</h4>
                                <p className="text-sm text-zinc-500 font-medium mt-1">Proceeding with action...</p>
                            </div>
                        )}

                        {/* Footer */}
                        {step !== "success" && (
                            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-center">
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 transition-colors w-full"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminAuthContext.Provider>
    );
}
