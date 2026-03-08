"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { sendOtpAction } from "@/app/actions/auth-actions";
import { COUNTRY_CODES } from "@/components/ui/PhoneInput";

interface PhoneLoginProps {
    type: "school" | "parent";
    tenantName?: string;
    brandColor?: string;
}

export function PhoneLogin({ type, tenantName, brandColor }: PhoneLoginProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Fallback styling if brandColor is missing
    const primaryColor = brandColor || "#0ea5e9";

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

                const callbackUrl = searchParams.get("callbackUrl");
                // Maintain current tenant domain/slug context
                let redirectPath = type === "school" ? `${window.location.pathname}/verify-otp` : "/parent-login/verify-otp";
                if (callbackUrl) {
                    redirectPath += `?callbackUrl=${encodeURIComponent(callbackUrl)}`;
                }

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}>
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center">
                    {/* Using initial of tenant name or default B for Bodhi */}
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-xl mx-auto mb-6" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                        <span className="text-4xl text-white font-bold">{tenantName ? tenantName.charAt(0) : "B"}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{tenantName || "Bodhi Board"}</h1>
                    <p className="text-slate-500 mt-2">Welcome Back. Please Sign In.</p>
                </div>

                <div className="bg-white border border-slate-100 p-8 rounded-[2rem] space-y-6 shadow-2xl scale-100 hover:scale-[1.01] transition-transform duration-300">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="parent-phone" className="text-slate-700 text-sm font-semibold tracking-wide">Phone Number</Label>
                            <span className="text-[10px] font-mono font-bold" style={{ color: isValid ? primaryColor : '#94a3b8' }}>
                                {currentDigits.length}/10
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <select
                                aria-label="Country Code"
                                title="Country Code"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-32 px-2 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 outline-none transition-all cursor-pointer hover:bg-slate-100 font-bold text-sm"
                            >
                                {COUNTRY_CODES.map(c => (
                                    <option key={`${c.code}-${c.name}`} value={c.code}>
                                        {c.flag} {c.code}
                                    </option>
                                ))}
                            </select>
                            <div className="flex-1 relative">
                                <Input
                                    id="parent-phone"
                                    type="tel"
                                    autoFocus
                                    placeholder="9876543210"
                                    maxLength={10}
                                    value={phoneNumber}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setPhoneNumber(val);
                                        if (val.length === 10) setError(null);
                                    }}
                                    className="h-14 text-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl pr-12 font-bold tracking-widest transition-all"
                                />
                                {isValid && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 animate-in zoom-in duration-300" style={{ color: primaryColor }} />
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={isLoading || !isValid}
                        className={`w-full h-14 text-lg rounded-xl font-bold transition-all shadow-xl active:scale-[0.98] ${isValid && !isLoading
                            ? 'text-white'
                            : 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                            }`}
                        style={isValid && !isLoading ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` } : undefined}
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
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
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
