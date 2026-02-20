"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { sendOtpAction } from "@/app/actions/auth-actions";

interface PhoneLoginProps {
    type: "school" | "parent";
}

export function PhoneLogin({ type }: PhoneLoginProps) {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const currentDigits = phoneNumber.replace(/\D/g, "");
    const isValid = currentDigits.length === 10;

    const handleContinue = async () => {
        if (!isValid) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const fullNumber = countryCode + currentDigits;
            // Map the internal type ("school" | "parent") to the API type ("school-login" | "parent-login")
            const loginType = type === "school" ? "school-login" : "parent-login";
            const result = await sendOtpAction(fullNumber, loginType);

            if (result && result.success) {
                if (typeof window !== "undefined" && window.sessionStorage) {
                    sessionStorage.setItem("phoneNumber", fullNumber);
                }

                const redirectPath = type === "school" ? "/school-login/verify-otp" : "/parent-login/verify-otp";

                setIsLoading(false);
                setTimeout(() => {
                    router.push(redirectPath);
                }, 100);
            } else {
                setError(result?.error || "OTP service error. Please try again.");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Connection error. Could not reach server.");
            setIsLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl mx-auto mb-6">
                        <span className="text-4xl text-white">🧠</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Bodhi Board</h1>
                    <p className="text-slate-400 mt-2">Welcome Back. Please Sign In.</p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-2xl scale-100 hover:scale-[1.01] transition-transform duration-300">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-slate-300 text-sm font-semibold tracking-wide">Phone Number</Label>
                            <span className={`text-[10px] font-mono font-bold ${isValid ? 'text-teal-400' : 'text-slate-500'}`}>
                                {currentDigits.length}/10
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-24 px-2 py-3 bg-slate-900 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-teal-500/30 outline-none transition-all cursor-pointer hover:bg-slate-800 font-bold"
                            >
                                <option value="+91">🇮🇳 +91</option>
                                <option value="+1">🇺🇸 +1</option>
                            </select>
                            <div className="flex-1 relative">
                                <Input
                                    type="tel"
                                    placeholder="9876543210"
                                    maxLength={10}
                                    value={phoneNumber}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setPhoneNumber(val);
                                        if (val.length === 10) setError(null);
                                    }}
                                    className="h-14 text-xl bg-slate-900 border-white/10 text-white placeholder:text-slate-700 rounded-xl focus:ring-teal-500/30 pr-12 font-bold tracking-widest transition-all"
                                />
                                {isValid && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-400 animate-in zoom-in duration-300" />
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={isLoading || !isValid}
                        className={`w-full h-14 text-lg rounded-xl font-bold transition-all shadow-xl active:scale-[0.98] ${isValid && !isLoading
                            ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:shadow-teal-500/30'
                            : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Working...</span>
                            </div>
                        ) : (
                            "Continue"
                        )}
                    </Button>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}

                    <div className="text-center pt-2">
                        <p className="text-slate-500 text-xs font-semibold">
                            Don't have an account?{" "}
                            <button
                                onClick={() => router.push("/signup")}
                                className="text-teal-400 hover:text-teal-300 transition-colors underline underline-offset-4"
                            >
                                Register your campus
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
