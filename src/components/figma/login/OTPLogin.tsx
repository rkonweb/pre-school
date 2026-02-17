"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { verifyOtpAction, sendOtpAction, loginWithMobileAction, loginParentGlobalAction } from "@/app/actions/auth-actions";

interface OTPLoginProps {
    type: "school" | "parent";
}

export function OTPLogin({ type }: OTPLoginProps) {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(30);
    const [isVerified, setIsVerified] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("phoneNumber") : "";

        if (!stored) {
            router.push(type === "school" ? "/school-login" : "/parent-login");
        } else {
            setPhoneNumber(stored);
        }
    }, [router, type]);

    useEffect(() => {
        if (isMounted && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer, isMounted]);

    const handleChange = (index: number, value: string) => {
        const char = value.slice(-1);
        if (!/^\d*$/.test(char)) return;

        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);

        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (char && index === 5) {
            void handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otpCode?: string) => {
        const codeToVerify = otpCode || otp.join("");
        if (codeToVerify.length !== 6) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await verifyOtpAction(phoneNumber, codeToVerify);

            if (result.success) {
                setIsVerified(true);

                // After verification, perform the actual login
                let loginRes;
                if (type === "school") {
                    loginRes = await loginWithMobileAction(phoneNumber);
                } else {
                    loginRes = await loginParentGlobalAction(phoneNumber);
                }

                if (loginRes.success && loginRes.redirectUrl) {
                    // Check if user has an incomplete signup
                    if ((loginRes as any).signupPending) {
                        // Store phone so signup pages can track progress
                        sessionStorage.setItem("phoneNumber", phoneNumber);
                    }
                    setTimeout(() => {
                        router.push(loginRes.redirectUrl);
                    }, 800);
                } else {
                    setError(loginRes.error || "Session creation failed.");
                    setIsLoading(false);
                    setIsVerified(false);
                }
            } else {
                setError(result.error || "Invalid verification code.");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Verification failed. Please try again.");
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await sendOtpAction(phoneNumber, "login");
            if (result.success) {
                setResendTimer(30);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                setError(result.error || "Failed to resend code.");
            }
        } catch (err) {
            setError("Error resending code.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) return null;

    const maskedPhone = phoneNumber.startsWith("+91")
        ? phoneNumber.slice(0, 7) + "XXXX" + phoneNumber.slice(-2)
        : phoneNumber.slice(0, 3) + "XXXX" + phoneNumber.slice(-2);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <button
                    onClick={() => router.push(type === "school" ? "/school-login" : "/parent-login")}
                    className="group flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors font-bold ml-1"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Edit Number
                </button>

                <div className="text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-teal-400/20 to-cyan-500/20 border border-teal-500/30 shadow-2xl shadow-teal-500/10 mx-auto mb-6 relative">
                        {isVerified ? (
                            <CheckCircle2 className="h-10 w-10 text-teal-400 animate-in zoom-in" />
                        ) : (
                            <span className="text-4xl text-teal-400">🔐</span>
                        )}
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Security Check
                    </h1>
                    <p className="text-slate-400 mt-3 font-medium">
                        Enter the 6-digit code sent to <br />
                        <span className="font-bold text-teal-300 tracking-wider font-mono bg-teal-500/10 px-2 py-0.5 rounded-md mt-2 inline-block shadow-sm shadow-teal-500/20">{maskedPhone}</span>
                    </p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading || isVerified}
                                autoFocus={index === 0}
                                className={`w-11 h-16 sm:w-14 sm:h-16 text-center text-3xl font-bold bg-slate-900/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all text-white shadow-inner active:scale-95 ${isVerified
                                    ? 'border-teal-400 text-teal-400 bg-teal-400/5'
                                    : error
                                        ? 'border-red-500/50 text-red-400 bg-red-500/5'
                                        : 'border-white/10 focus:border-teal-400'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={() => void handleVerify()}
                        disabled={otp.some(digit => !digit) || isVerified || isLoading}
                        className={`w-full h-15 text-lg rounded-2xl font-bold transition-all shadow-xl active:scale-[0.98] ${isVerified
                            ? 'bg-teal-500 text-slate-900 shadow-teal-500/20'
                            : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 border-none hover:shadow-teal-500/30'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Authorizing...</span>
                            </div>
                        ) : isVerified ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 transition-all" />
                                <span>Access Granted</span>
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <div className="text-center">
                        {resendTimer > 0 ? (
                            <div className="text-slate-500 text-sm font-bold flex items-center justify-center gap-2 bg-slate-900/40 py-2 px-4 rounded-xl inline-flex mx-auto border border-white/5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
                                Resend in <span className="text-slate-300 tracking-tighter w-8 text-center">{resendTimer}s</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => void handleResend()}
                                className="text-teal-400 hover:text-teal-300 font-bold text-sm underline underline-offset-8 decoration-teal-500/30 hover:decoration-teal-400 transition-all decoration-2"
                            >
                                Resend verification code
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                    Secure Enterprise Authentication
                </div>
            </div>
        </div>
    );
}
