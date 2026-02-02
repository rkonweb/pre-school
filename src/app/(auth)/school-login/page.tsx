"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Mail,
    Lock,
    ArrowRight,
    School,
    UserCircle,
    Loader2,
    ArrowLeft,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendOtpAction, verifyOtpAction, loginWithMobileAction } from "@/app/actions/auth-actions";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
    const [step, setStep] = useState(1); // 1=Phone, 2=OTP
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("method") === "mobile") {
            setLoginMethod("mobile");
        }
    }, []);

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

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push("/dashboard");
        }, 1500);
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

        const loginRes = await loginWithMobileAction(mobileNumber);
        if (loginRes.success && loginRes.redirectUrl) {
            router.push(loginRes.redirectUrl);
        } else {
            setIsLoading(false);
            setError(loginRes.error || "Login failed");
        }
    };

    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans">

            {/* LEFT PANEL: Shared Premium Aesthetic */}
            <div className="hidden lg:flex relative bg-[#0F172A] text-white flex-col justify-between p-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571260899304-425eee447efc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-[#0F172A] shadow-lg mb-8">
                        <School className="h-6 w-6" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight leading-tight mb-4">
                        Access your <br /> <span className="text-[#99D6DE]">School Portal.</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-md">
                        Manage students, track attendance, and oversee institutional growth in one high-performance dashboard.
                    </p>
                </div>

                <div className="relative z-10 p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mt-auto">
                    <div className="flex items-center gap-3 text-[#99D6DE] mb-2 font-bold uppercase tracking-wider text-xs">
                        <ShieldCheck className="h-4 w-4" /> Secure Access
                    </div>
                    <p className="text-slate-300 text-sm">
                        All connections are end-to-end encrypted with multi-tenant isolation.
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL: Login Form */}
            <div className="flex flex-col justify-center h-full w-full bg-white px-6 sm:px-12 py-12 lg:py-0">
                <div className="w-full max-w-md mx-auto">

                    <div className="mb-10 lg:hidden flex justify-center">
                        <div className="h-12 w-12 bg-[#0F172A] rounded-xl flex items-center justify-center text-white shadow-xl">
                            <School className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2">School Login</h2>
                        <p className="text-slate-500 font-medium">Access your school management dashboard.</p>
                    </div>

                    {/* Method Toggle */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border-2 border-slate-100">
                        <button
                            onClick={() => { setLoginMethod("email"); setError(""); setStep(1); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                loginMethod === "email" ? "bg-white text-[#0F172A] shadow-lg" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Mail className="h-4 w-4" />
                            Email
                        </button>
                        <button
                            onClick={() => { setLoginMethod("mobile"); setError(""); setStep(1); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                loginMethod === "mobile" ? "bg-white text-[#0F172A] shadow-lg" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <UserCircle className="h-4 w-4" />
                            Mobile
                        </button>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-pulse">
                            {error}
                        </div>
                    )}

                    {loginMethod === "email" ? (
                        <form onSubmit={handleSubmitEmail} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#0F172A] transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 font-bold text-slate-800 focus:border-[#0F172A] focus:bg-white outline-none transition-all"
                                        placeholder="teacher@school.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                    <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#0F172A] transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 font-bold text-slate-800 focus:border-[#0F172A] focus:bg-white outline-none transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 rounded-2xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                    <>Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* MOBILE OTP LOGIN */
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            {step === 1 ? (
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Mobile Number</label>
                                        <div className="flex items-center w-full bg-slate-50 border-2 border-slate-100 rounded-2xl overflow-hidden focus-within:border-[#0F172A] focus-within:bg-white transition-all h-16">
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
                                        className="w-full py-5 rounded-2xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Request Access Code"}
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
                                                className="w-16 h-20 text-center text-4xl font-black bg-white border-2 border-slate-200 rounded-2xl focus:border-[#0F172A] focus:scale-105 outline-none transition-all shadow-sm text-[#0F172A]"
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
                                            className="w-full py-5 rounded-2xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Verify & Login"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
                                        >
                                            Change Number
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center flex flex-col gap-4">
                        <p className="text-slate-500">
                            Don't have an account? <Link href="/signup" className="text-[#0F172A] font-extrabold hover:underline">Sign up for free</Link>
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-px w-8 bg-slate-100" />
                            <Link href="/parent-login" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">Are you a parent? Click here</Link>
                            <span className="h-px w-8 bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
