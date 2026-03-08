"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { verifyOtpAction, sendOtpAction, loginWithMobileAction, loginParentGlobalAction } from "@/app/actions/auth-actions";

interface OTPLoginProps {
    type: "school" | "parent";
    tenantName?: string;
    brandColor?: string;
}

export function OTPLogin({ type, tenantName, brandColor }: OTPLoginProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(30);
    const [isVerified, setIsVerified] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const primaryColor = brandColor || "#0ea5e9";

    useEffect(() => {
        setIsMounted(true);
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("phoneNumber") : "";

        if (!stored) {
            // Re-route back to the beginning of the auth flow dynamically
            const basePath = typeof window !== "undefined" ? window.location.pathname.replace('/verify-otp', '') : (type === "school" ? "/school-login" : "/parent-login");
            router.push(basePath || "/");
        } else {
            setPhoneNumber(stored);
        }
    }, [router, type]);

    useEffect(() => {
        if (isMounted && !isVerified) {
            // Short delay to ensure browser readiness after route transition
            const timer = setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isMounted, isVerified]);

    useEffect(() => {
        if (isMounted && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer, isMounted]);

    const handleChange = (index: number, value: string) => {
        const cleanVal = value.replace(/\D/g, "");
        if (!cleanVal) {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
            return;
        }

        if (cleanVal.length > 1) {
            const digits = cleanVal.split("").slice(0, 6 - index);
            const newOtp = [...otp];
            digits.forEach((d, idx) => {
                if (index + idx < 6) newOtp[index + idx] = d;
            });
            setOtp(newOtp);
            
            const nextIdx = Math.min(index + digits.length, 5);
            inputRefs.current[nextIdx]?.focus();
            
            if (newOtp.every(d => d !== "")) {
                void handleVerify(newOtp.join(""));
            }
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = cleanVal;
        setOtp(newOtp);
        
        if (index < 5) {
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 10);
        }

        if (newOtp.every(d => d !== "")) {
            void handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
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
                        const callbackUrl = searchParams.get("callbackUrl");
                        // Only use callbackUrl if we are fully logged in and NOT pending signup
                        if (callbackUrl && !(loginRes as any).signupPending) {
                            router.push(callbackUrl);
                        } else {
                            // If they are on a custom domain login, we might not need the explicit `/s/[slug]` in the URL depending on how middleware handles post-login.
                            // But for safety, standard redirect is fine since middleware protects it.
                            router.push(loginRes.redirectUrl);
                        }
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
            const loginType = type === "school" ? "school-login" : "parent-login";
            const result = await sendOtpAction(phoneNumber, loginType);
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

    const handleGoBack = () => {
        const basePath = typeof window !== "undefined" ? window.location.pathname.replace('/verify-otp', '') : (type === "school" ? "/school-login" : "/parent-login");
        router.push(basePath || "/");
    };

    if (!isMounted) return null;

    const maskedPhone = phoneNumber.startsWith("+91")
        ? phoneNumber.slice(0, 7) + "XXXX" + phoneNumber.slice(-2)
        : phoneNumber.slice(0, 3) + "XXXX" + phoneNumber.slice(-2);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}>
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <button
                    onClick={handleGoBack}
                    className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold ml-1"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Edit Number
                </button>

                <div className="text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] shadow-xl mx-auto mb-6 relative" style={{ background: `linear-gradient(135deg, ${primaryColor}33, ${primaryColor}11)`, border: `1px solid ${primaryColor}4d` }}>
                        {isVerified ? (
                            <CheckCircle2 className="h-10 w-10 animate-in zoom-in" style={{ color: primaryColor }} />
                        ) : (
                            <span className="text-4xl">🔐</span>
                        )}
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Security Check
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium">
                        Enter the 6-digit code sent to <br />
                        <span className="font-bold tracking-wider font-mono px-2 py-0.5 rounded-md mt-2 inline-block shadow-sm" style={{ color: primaryColor, backgroundColor: `${primaryColor}1a`, boxShadow: `0 1px 2px ${primaryColor}33` }}>{maskedPhone}</span>
                    </p>
                </div>

                <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                aria-label={`OTP Digit ${index + 1}`}
                                title={`OTP Digit ${index + 1}`}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading || isVerified}
                                autoFocus={index === 0}
                                autoComplete="one-time-code"
                                className={`w-11 h-16 sm:w-14 sm:h-16 text-center text-3xl font-bold bg-slate-50 border-2 rounded-2xl focus:outline-none transition-all text-slate-900 shadow-inner active:scale-95 ${isVerified
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500'
                                    : error
                                        ? 'border-red-300 text-red-600 bg-red-50'
                                        : 'border-slate-200'
                                    }`}
                                style={(!isVerified && !error && (document.activeElement === inputRefs.current[index])) ? { borderColor: primaryColor, boxShadow: `0 0 0 4px ${primaryColor}22` } : {}}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={() => void handleVerify()}
                        disabled={otp.some(digit => !digit) || isVerified || isLoading}
                        className={`w-full h-15 text-lg rounded-2xl font-bold transition-all shadow-xl active:scale-[0.98] ${isVerified
                            ? 'text-white shadow-md'
                            : 'text-white border-none shadow-lg'
                            }`}
                        style={{
                            background: isVerified ? '#10b981' : (otp.some(d => !d) || isLoading) ? '#e2e8f0' : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                            color: (otp.some(d => !d) && !isVerified) ? '#94a3b8' : 'white',
                            cursor: (otp.some(d => !d) || isLoading || isVerified) ? 'not-allowed' : 'pointer'
                        }}
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
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <div className="text-center">
                        {resendTimer > 0 ? (
                            <div className="text-slate-500 text-sm font-bold flex items-center justify-center gap-2 bg-slate-50 py-2 px-4 rounded-xl inline-flex mx-auto border border-slate-100">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                                Resend in <span className="text-slate-700 tracking-tighter w-8 text-center">{resendTimer}s</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => void handleResend()}
                                className="font-bold text-sm underline underline-offset-8 transition-all decoration-2"
                                style={{ color: primaryColor, textDecorationColor: `${primaryColor}4d` }}
                            >
                                Resend verification code
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80">
                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                    Secure Enterprise Authentication
                </div>
            </div>
        </div>
    );
}
