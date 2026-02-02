"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    School,
    UserCircle,
    Loader2,
    ArrowLeft,
    ShieldCheck,
    MessageCircle,
    Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendOtpAction, verifyOtpAction, loginParentGlobalAction } from "@/app/actions/auth-actions";

export default function ParentLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1=Phone, 2=OTP
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [error, setError] = useState("");

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) otpInputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (mobileNumber.length !== 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }

        setIsLoading(true);
        const res = await sendOtpAction(mobileNumber, "login");
        setIsLoading(false);

        if (res.success) {
            setStep(2);
        } else {
            setError(res.error || "Failed to send OTP");
        }
    };

    const handleVerifyAndLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const verifyRes = await verifyOtpAction(mobileNumber, otp.join(""));
        if (!verifyRes.success) {
            setIsLoading(false);
            setError(verifyRes.error || "Invalid OTP");
            return;
        }

        const loginRes = await loginParentGlobalAction(mobileNumber);
        if (loginRes.success && loginRes.redirectUrl) {
            router.push(loginRes.redirectUrl);
        } else {
            setIsLoading(false);
            setError(loginRes.error || "Login failed");
        }
    };

    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans">

            {/* LEFT PANEL: Parent Aesthetic */}
            <div className="hidden lg:flex relative bg-rose-600 text-white flex-col justify-between p-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1484981138541-3d074aa97716?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-lg mb-8">
                        <Heart className="h-6 w-6" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight leading-tight mb-4">
                        Parent <br /> <span className="text-rose-100">Companion.</span>
                    </h1>
                    <p className="text-lg text-rose-50 max-w-md">
                        Stay connected with your child's journey. Track progress, pay fees, and message teachers instantly.
                    </p>
                </div>

                <div className="relative z-10 p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mt-auto">
                    <div className="flex items-center gap-3 text-rose-100 mb-2 font-bold uppercase tracking-wider text-xs">
                        <MessageCircle className="h-4 w-4" /> Instant Updates
                    </div>
                    <p className="text-rose-50 text-sm">
                        Get real-time notifications about your child's activities and performance.
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL: Login Form */}
            <div className="flex flex-col justify-center h-full w-full bg-white px-6 sm:px-12 py-12 lg:py-0">
                <div className="w-full max-w-md mx-auto">

                    <div className="mb-10 lg:hidden flex justify-center">
                        <div className="h-12 w-12 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-xl">
                            <Heart className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2">Parent Login</h2>
                        <p className="text-slate-500 font-medium">Secure access to your child's portal.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Mobile Number</label>
                                    <div className="flex items-center w-full bg-slate-50 border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-rose-600 focus-within:bg-white transition-all h-16">
                                        <div className="px-6 bg-slate-100/50 border-r-2 border-slate-200 h-full flex items-center justify-center">
                                            <span className="font-black text-xl text-slate-500 select-none">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            autoFocus
                                            required
                                            placeholder="9876543210"
                                            maxLength={10}
                                            className="flex-1 bg-transparent border-none outline-none text-xl font-bold px-4 text-slate-800 h-full"
                                            value={mobileNumber}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                if (val.length <= 10) setMobileNumber(val);
                                            }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || mobileNumber.length !== 10}
                                    className="w-full py-5 rounded-2xl bg-rose-600 text-white font-bold text-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Verify Identity"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyAndLogin} className="space-y-8">
                                <div className="text-center mb-4">
                                    <p className="text-slate-500 font-medium italic">Sent to +91 {mobileNumber}</p>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpInputRefs.current[i] = el; }}
                                            type="tel"
                                            maxLength={1}
                                            required
                                            className="w-16 h-20 text-center text-4xl font-black bg-white border-2 border-slate-200 rounded-2xl focus:border-rose-600 focus:scale-105 outline-none transition-all shadow-sm text-slate-900"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.join("").length < 4}
                                        className="w-full py-5 rounded-2xl bg-rose-600 text-white font-bold text-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Login to Portal"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full text-center text-sm font-bold text-slate-400 hover:text-rose-600 transition-colors"
                                    >
                                        Use a different number
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-px w-8 bg-slate-100" />
                            <Link href="/school-login" className="text-xs font-bold text-slate-400 hover:text-[#0F172A] transition-colors">Are you a school administrator? Login here</Link>
                            <span className="h-px w-8 bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
