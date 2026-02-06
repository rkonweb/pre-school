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
    ShieldCheck,
    Sparkles,
    ChevronRight,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendOtpAction, verifyOtpAction, loginWithMobileAction } from "@/app/actions/auth-actions";
import { motion, AnimatePresence } from "framer-motion";

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
        // Simulate login delay
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

            {/* LEFT PANEL: Premium Aesthetic */}
            <div className="hidden lg:flex relative bg-slate-900 text-white flex-col justify-between p-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497294815431-9365093b7331?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 font-medium text-sm tracking-wide">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div className="h-14 w-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-2xl mb-8">
                        <School className="h-7 w-7" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight leading-tight mb-4">
                        School <br /> <span className="text-emerald-400">Administration.</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                        Powerful tools to manage your institution. Track academics, finance, and operations in one unified dashboard.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 mt-auto">
                    <div className="flex-1 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-blue-300 mb-2 font-bold uppercase tracking-wider text-[10px]">
                            <Building2 className="h-3 w-3" /> Campus Management
                        </div>
                        <p className="text-slate-400 text-xs">Streamline daily operations effortlessly.</p>
                    </div>
                    <div className="flex-1 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-300 mb-2 font-bold uppercase tracking-wider text-[10px]">
                            <ShieldCheck className="h-3 w-3" /> Enterprise Grade
                        </div>
                        <p className="text-slate-400 text-xs">Role-based access control & security.</p>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Elegant Login Form */}
            <div className="flex flex-col justify-center h-full w-full bg-white px-8 sm:px-16 lg:px-24">
                <div className="w-full max-w-md mx-auto">

                    <div className="mb-10 lg:hidden flex justify-center">
                        <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl">
                            <School className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Admin Access</h2>
                        <p className="text-slate-500 text-sm font-medium">Log in to your school dashboard.</p>
                    </div>

                    {/* Method Toggle */}
                    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-8 border border-slate-200">
                        <button
                            onClick={() => { setLoginMethod("email"); setError(""); setStep(1); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                loginMethod === "email" ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Mail className="h-4 w-4" />
                            Email
                        </button>
                        <button
                            onClick={() => { setLoginMethod("mobile"); setError(""); setStep(1); }}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                loginMethod === "mobile" ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <UserCircle className="h-4 w-4" />
                            Mobile
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loginMethod === "email" ? (
                        <motion.form
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="email-form"
                            onSubmit={handleSubmitEmail}
                            className="space-y-6"
                        >
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                                    <div className="group flex items-center w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-100 transition-all h-14">
                                        <div className="px-5 h-full flex items-center justify-center text-slate-400">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            className="flex-1 bg-transparent border-none outline-none text-base font-bold px-0 text-slate-800 h-full placeholder:text-slate-300 font-sans"
                                            placeholder="teacher@school.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between pl-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                                        <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot Password?</Link>
                                    </div>
                                    <div className="group flex items-center w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-100 transition-all h-14">
                                        <div className="px-5 h-full flex items-center justify-center text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            className="flex-1 bg-transparent border-none outline-none text-base font-bold px-0 text-slate-800 h-full placeholder:text-slate-300 font-sans"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        /* MOBILE OTP LOGIN */
                        <div className="space-y-8">
                            {step === 1 ? (
                                <motion.form
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    key="mobile-step1"
                                    onSubmit={handleSendOtp}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Mobile Number</label>
                                        <div className="group flex items-center w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-100 transition-all h-14">
                                            <div className="px-5 bg-slate-100 border-r border-slate-200 h-full flex items-center justify-center text-slate-500 font-bold text-base">
                                                +91
                                            </div>
                                            <input
                                                type="tel"
                                                autoFocus
                                                required
                                                placeholder="98765 43210"
                                                maxLength={10}
                                                className="flex-1 bg-transparent border-none outline-none text-lg font-bold px-4 text-slate-800 h-full placeholder:text-slate-300 font-sans"
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
                                        className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                            <>Request Code <Sparkles className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    key="mobile-step2"
                                    onSubmit={handleVerifyAndLogin}
                                    className="space-y-8"
                                >
                                    <div className="text-center mb-2">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Verification Code Sent To</p>
                                        <p className="text-slate-800 font-bold text-lg mt-1 tracking-widest">+91 {mobileNumber}</p>
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpInputRefs.current[i] = el; }}
                                                type="tel"
                                                maxLength={1}
                                                required
                                                autoFocus={i === 0}
                                                className="w-14 h-16 text-center text-3xl font-bold bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-4 focus:ring-slate-100 outline-none transition-all shadow-sm text-slate-900 caret-slate-900"
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
                                            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify & Sign In"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider"
                                        >
                                            Change Number
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </div>
                    )}

                    <div className="mt-12 flex flex-col gap-4 text-center">
                        <p className="text-slate-500 text-sm">
                            New School? <Link href="/signup" className="text-slate-900 font-bold hover:underline">Register your campus</Link>
                        </p>
                        <Link href="/parent-login" className="text-xs font-bold text-slate-300 hover:text-slate-500 transition-colors">
                            Parent Portal Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
