"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    School,
    Check,
    ChevronRight,
    Loader2,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";
import { sendOtpAction, verifyOtpAction, registerSchoolAction } from "@/app/actions/auth-actions";

// Step-specific content configuration - Ocean Energy Palette
const STEP_CONTENT = {
    1: {
        headline: "Manage your preschool",
        highlightedText: "like a pro.",
        description: "Join thousands of educators who have simplified their operations, billing, and parent communication.",
        testimonial: {
            quote: "The best decision we made for our little school. The automated billing alone saves me 10 hours a week!",
            author: "Sarah Jenkins",
            role: "Director, Little Stars",
            avatar: "https://i.pravatar.cc/100?img=5"
        },
        accentColor: "#2C7A7B",
        textColor: "#1A202C",
        backgroundColor: "#C4DADE",
        gradientFrom: "#DDE8ED",
        gradientTo: "#C4DADE"
    },
    2: {
        headline: "Secure & Simple",
        highlightedText: "Setup",
        description: "Your data is protected with bank-level encryption. We take security seriously so you can focus on education.",
        testimonial: {
            quote: "I love how secure everything is. Parents trust us more knowing their data is safe and encrypted.",
            author: "Rajesh Kumar",
            role: "Principal, Bright Minds",
            avatar: "https://i.pravatar.cc/100?img=12"
        },
        accentColor: "#5A9BA8",
        textColor: "#1A202C",
        backgroundColor: "#B9D9D5",
        gradientFrom: "#ECF2F5",
        gradientTo: "#B9D9D5"
    },
    3: {
        headline: "Personalized for",
        highlightedText: "Your School",
        description: "Customize everything from branding to workflows. Make the platform truly yours with flexible settings.",
        testimonial: {
            quote: "We customized it to match our school colors and workflow. It feels like it was built just for us!",
            author: "Priya Sharma",
            role: "Administrator, Little Learners",
            avatar: "https://i.pravatar.cc/100?img=9"
        },
        accentColor: "#C17B5E",
        textColor: "#1A202C",
        backgroundColor: "#F9F0E7",
        gradientFrom: "#F9F0E7",
        gradientTo: "#E7D9CC"
    },
    4: {
        headline: "Choose What",
        highlightedText: "Works for You",
        description: "Flexible plans that grow with your school. Start free, upgrade anytime. No hidden fees, cancel whenever.",
        testimonial: {
            quote: "Started with the free plan and upgraded as we grew. The pricing is transparent and fair!",
            author: "Michael Chen",
            role: "Founder, Happy Kids Academy",
            avatar: "https://i.pravatar.cc/100?img=15"
        },
        accentColor: "#8B9BA3",
        textColor: "#1A202C",
        backgroundColor: "#ECF2F5",
        gradientFrom: "#ECF2F5",
        gradientTo: "#DDE8ED"
    }
};




function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;

                return (
                    <div key={i} className="flex items-center gap-2">
                        <div
                            className={cn(
                                "h-2 rounded-full transition-all duration-500",
                                isActive ? "w-8 bg-[#0F172A]" : isCompleted ? "w-2 bg-green-500" : "w-2 bg-slate-200"
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(10);

    // State
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        schoolName: "",
        selectedPlanId: "free"
    });

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        getSubscriptionPlansAction().then(setPlans).catch(console.error);
    }, []);

    useEffect(() => {
        if (step === 5) {
            const timer = setInterval(() => {
                setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            const redirectTimer = setTimeout(() => {
                router.push("/school-login?method=mobile");
            }, 10000);

            return () => {
                clearInterval(timer);
                clearTimeout(redirectTimer);
            };
        }
    }, [step, router]);

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
        const res = await sendOtpAction(mobileNumber, "signup");
        setIsLoading(false);

        if (res.success) {
            setStep(2);
        } else {
            setError(res.error || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        setIsLoading(true);
        const res = await verifyOtpAction(mobileNumber, otp.join(""));
        setIsLoading(false);

        if (res.success) {
            setStep(3);
        } else {
            setError(res.error || "Invalid OTP");
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep(4);
    };

    const handleFinalSubmit = async () => {
        setError("");
        setIsLoading(true);

        const res = await registerSchoolAction({
            firstName: formData.firstName,
            lastName: formData.lastName,
            schoolName: formData.schoolName,
            mobile: mobileNumber,
            planId: formData.selectedPlanId
        });

        setIsLoading(false);

        if (res.success) {
            setStep(5); // Success Step
        } else {
            setError(res.error || "Registration failed");
        }
    };

    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">

            {/* LEFT PANEL: Dynamic Brand & Visuals */}
            <div
                key={step}
                className="hidden lg:flex relative flex-col justify-between p-16 overflow-hidden transition-all duration-1000"
                style={{
                    background: `linear-gradient(135deg, ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.backgroundColor || '#D1FAE5'} 0%, ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.gradientFrom || '#ECFDF5'} 100%)`
                }}
            >
                {/* Animated Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay animate-in zoom-in-95 duration-1000" />

                {/* Multiple Animated Gradient Orbs */}
                <div
                    className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none animate-in zoom-in-50 duration-1000 opacity-20"
                    style={{
                        background: `radial-gradient(circle, ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor || '#059669'} 0%, transparent 70%)`
                    }}
                />
                <div
                    className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none animate-in zoom-in-75 duration-1000 delay-150 opacity-15"
                    style={{
                        background: `radial-gradient(circle, ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor || '#059669'} 0%, transparent 70%)`
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none animate-in zoom-in-90 duration-1000 delay-300 opacity-10"
                    style={{
                        background: `radial-gradient(circle, ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor || '#059669'} 0%, transparent 70%)`
                    }}
                />

                {/* Animated Decorative Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Bouncing Circles */}
                    <div
                        className="absolute w-32 h-32 rounded-full opacity-10 animate-in zoom-in-50 duration-1000"
                        style={{
                            top: '10%',
                            right: '15%',
                            backgroundColor: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor,
                            animation: 'bounce-slow 8s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute w-24 h-24 rounded-full opacity-10 animate-in zoom-in-75 duration-1000 delay-200"
                        style={{
                            bottom: '20%',
                            left: '10%',
                            backgroundColor: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor,
                            animation: 'bounce-slow 10s ease-in-out infinite 2s'
                        }}
                    />

                    {/* Rotating Squares */}
                    <div
                        className="absolute w-20 h-20 opacity-5 animate-in zoom-in-50 duration-1000 delay-100"
                        style={{
                            top: '60%',
                            right: '25%',
                            backgroundColor: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor,
                            borderRadius: '12px',
                            animation: 'rotate-slow 20s linear infinite'
                        }}
                    />
                    <div
                        className="absolute w-16 h-16 opacity-5 animate-in zoom-in-75 duration-1000 delay-300"
                        style={{
                            top: '25%',
                            left: '20%',
                            backgroundColor: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor,
                            borderRadius: '8px',
                            animation: 'rotate-slow 15s linear infinite reverse'
                        }}
                    />
                </div>

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(16)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full animate-in fade-in duration-1000"
                            style={{
                                width: `${Math.random() * 8 + 3}px`,
                                height: `${Math.random() * 8 + 3}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor || '#059669',
                                opacity: Math.random() * 0.4 + 0.1,
                                animation: `float ${Math.random() * 10 + 15}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    ))}
                </div>

                {/* Top Content */}
                <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-700">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 transition-all hover:gap-3 mb-8 font-semibold group"
                        style={{ color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.textColor }}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </Link>
                    <div
                        className="h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl mb-8 animate-in zoom-in-50 duration-500 relative"
                        style={{
                            backgroundColor: `${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}20`,
                            border: `3px solid ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}`,
                            animation: 'pulse-glow 3s ease-in-out infinite'
                        }}
                    >
                        <School
                            className="h-8 w-8"
                            style={{ color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor }}
                        />
                    </div>
                    <h1
                        className="text-6xl font-black tracking-tight leading-tight mb-6 animate-in slide-in-from-left-6 duration-700 delay-100"
                        style={{ color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.textColor }}
                    >
                        {STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.headline || "Manage your preschool"} <br />
                        <span
                            className="transition-all duration-500 inline-block hover:scale-105"
                            style={{
                                color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor || '#059669'
                            }}
                        >
                            {STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.highlightedText || "like a pro."}
                        </span>
                    </h1>
                    <p
                        className="text-xl max-w-md leading-relaxed animate-in slide-in-from-left-4 duration-700 delay-200 font-medium"
                        style={{ color: `${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.textColor}CC` }}
                    >
                        {STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.description || "Join thousands of educators who have simplified their operations, billing, and parent communication."}
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-3 mt-8 animate-in fade-in duration-700 delay-300">
                        <div
                            className="px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 animate-in zoom-in-50 duration-500 delay-400"
                            style={{
                                backgroundColor: `${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}15`,
                                border: `2px solid ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}40`,
                                color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor
                            }}
                        >
                            <Check className="w-4 h-4" />
                            No Credit Card
                        </div>
                        <div
                            className="px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 animate-in zoom-in-50 duration-500 delay-500"
                            style={{
                                backgroundColor: `${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}15`,
                                border: `2px solid ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}40`,
                                color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor
                            }}
                        >
                            <Check className="w-4 h-4" />
                            Free Forever Plan
                        </div>
                    </div>
                </div>

                {/* Bottom Testimonial */}
                <blockquote
                    className="relative z-10 p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 hover:scale-[1.02] transition-all shadow-xl"
                    style={{
                        backgroundColor: `${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}10`,
                        border: `2px solid ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}30`
                    }}
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="h-16 w-16 rounded-2xl bg-cover bg-center flex-shrink-0 animate-in zoom-in-50 duration-500 delay-300"
                            style={{
                                backgroundImage: `url('${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.testimonial.avatar}')`,
                                border: `3px solid ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}60`
                            }}
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-5 h-5 animate-in zoom-in-50 duration-300 text-xl"
                                        style={{
                                            animationDelay: `${400 + i * 50}ms`,
                                            color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor || '#059669'
                                        }}
                                    >
                                        ★
                                    </div>
                                ))}
                            </div>
                            <p
                                className="text-lg font-semibold leading-relaxed"
                                style={{ color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.textColor }}
                            >
                                "{STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.testimonial.quote || "The best decision we made for our little school."}"
                            </p>
                        </div>
                    </div>
                    <div
                        className="flex items-center justify-between pt-4"
                        style={{ borderTop: `1px solid ${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}20` }}
                    >
                        <div>
                            <div
                                className="font-bold"
                                style={{ color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.textColor }}
                            >
                                {STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.testimonial.author || "Sarah Jenkins"}
                            </div>
                            <div
                                className="text-sm"
                                style={{ color: `${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.textColor}80` }}
                            >
                                {STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.testimonial.role || "Director, Little Stars"}
                            </div>
                        </div>
                        <div
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                                backgroundColor: `${STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor}20`,
                                color: STEP_CONTENT[step as keyof typeof STEP_CONTENT]?.accentColor
                            }}
                        >
                            Verified ✓
                        </div>
                    </div>
                </blockquote>

                {/* CSS Animations */}
                <style jsx>{`
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0) translateX(0) scale(1);
                            opacity: 0.1;
                        }
                        25% {
                            transform: translateY(-30px) translateX(15px) scale(1.3);
                            opacity: 0.4;
                        }
                        50% {
                            transform: translateY(-50px) translateX(-15px) scale(0.9);
                            opacity: 0.2;
                        }
                        75% {
                            transform: translateY(-30px) translateX(20px) scale(1.2);
                            opacity: 0.35;
                        }
                    }
                    @keyframes bounce-slow {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-30px);
                        }
                    }
                    @keyframes rotate-slow {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }
                    @keyframes pulse-glow {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.05);
                            opacity: 0.9;
                        }
                    }
                `}</style>
            </div>

            {/* RIGHT PANEL: Form */}
            < div className="flex flex-col justify-center h-full overflow-y-auto w-full bg-white relative" >
                {/* Mobile Header */}
                < div className="lg:hidden p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20" >
                    <div className="h-10 w-10 bg-[#0F172A] rounded-lg flex items-center justify-center text-white">
                        <School className="h-5 w-5" />
                    </div>
                    <Link href="/" className="text-sm font-bold text-slate-500">Back</Link>
                </div >

                <div className="w-full max-w-xl mx-auto px-6 sm:px-12 py-12 lg:py-0">

                    <div className="mb-8">
                        {step < 5 && <StepIndicator currentStep={step} totalSteps={4} />}

                        {step === 5 ? (
                            <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500 py-10">
                                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-xl shadow-green-200">
                                    <Check className="h-12 w-12" />
                                </div>
                                <h2 className="text-4xl font-bold text-slate-900 mb-4">Welcome Aboard!</h2>
                                <p className="text-xl text-slate-500 max-w-md mx-auto mb-8">
                                    Your account for <span className="font-bold text-slate-900">{formData.schoolName}</span> has been created successfully.
                                </p>
                                <button
                                    onClick={() => router.push("/school-login?method=mobile")}
                                    className="w-full py-5 rounded-xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed to Login <ArrowRight className="h-5 w-5" />
                                </button>
                                <p className="mt-6 text-sm font-medium text-slate-400">
                                    Redirecting to login in <span className="text-[#0F172A] font-bold">{countdown}s</span>...
                                </p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-[#0F172A] mt-6 tracking-tight">
                                    {step === 1 && "Let's get started"}
                                    {step === 2 && "Verify your number"}
                                    {step === 3 && "Tell us about you"}
                                    {step === 4 && "Select a plan"}
                                </h2>
                                <p className="mt-2 text-slate-500 text-lg">
                                    {step === 1 && "Enter your mobile number to verify your identity."}
                                    {step === 2 && <span>We sent a 4-digit code to <span className="font-bold text-slate-800">+91 {mobileNumber}</span></span>}
                                    {step === 3 && "We just need a few details to set up your school profile."}
                                    {step === 4 && "Choose a plan that fits your needs. You can change later."}
                                </p>
                            </>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-pulse">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* STEPS */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Mobile Number</label>
                                <div className="flex items-center w-full bg-slate-50 border-[3px] border-slate-100 rounded-xl overflow-hidden focus-within:border-[#0F172A] focus-within:bg-white transition-all group h-16">
                                    <div className="pl-6 pr-4 bg-slate-100/50 border-r-2 border-slate-200 h-full flex items-center justify-center">
                                        <span className="font-black text-xl text-slate-500 select-none">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        autoFocus
                                        placeholder="9876543210"
                                        maxLength={10}
                                        className="flex-1 w-full bg-transparent border-none outline-none text-xl font-bold px-4 py-4 text-slate-800 placeholder:text-slate-300 h-full"
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
                                disabled={mobileNumber.length !== 10 || isLoading}
                                className="w-full py-5 rounded-xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Verification Code"}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex gap-4">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpInputRefs.current[i] = el; }}
                                        type="tel"
                                        maxLength={1}
                                        className="w-full h-20 text-center text-3xl font-black bg-white border-[3px] border-slate-200 rounded-xl focus:border-[#0F172A] focus:scale-105 outline-none transition-all shadow-sm text-[#0F172A]"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-slate-700">Change Number</button>
                                <button type="button" className="text-sm font-bold text-slate-400 hover:text-slate-700">Resend Code</button>
                            </div>

                            <button
                                type="submit"
                                disabled={otp.join("").length < 4 || isLoading}
                                className="w-full py-5 rounded-xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify Code"}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                                    <input
                                        required
                                        className="w-full h-14 bg-slate-50 border-[3px] border-slate-100 rounded-xl px-4 font-bold text-slate-800 focus:border-[#0F172A] focus:bg-white outline-none transition-all"
                                        placeholder="Jane"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                                    <input
                                        required
                                        className="w-full h-14 bg-slate-50 border-[3px] border-slate-100 rounded-xl px-4 font-bold text-slate-800 focus:border-[#0F172A] focus:bg-white outline-none transition-all"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">School Name</label>
                                <input
                                    required
                                    className="w-full h-14 bg-slate-50 border-[3px] border-slate-100 rounded-xl px-4 font-bold text-slate-800 focus:border-[#0F172A] focus:bg-white outline-none transition-all"
                                    placeholder="Little Stars Academy"
                                    value={formData.schoolName}
                                    onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 rounded-xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                Continue <ChevronRight className="h-5 w-5" />
                            </button>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <div className="space-y-4">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => setFormData({ ...formData, selectedPlanId: plan.id })}
                                        className={cn(
                                            "relative flex cursor-pointer rounded-xl border-[3px] p-5 transition-all duration-200",
                                            formData.selectedPlanId === plan.id
                                                ? "bg-slate-50 border-[#0F172A] ring-0"
                                                : "bg-white border-slate-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                                                    formData.selectedPlanId === plan.id ? "border-[#0F172A]" : "border-slate-300"
                                                )}>
                                                    {formData.selectedPlanId === plan.id && <div className="h-3 w-3 bg-[#0F172A] rounded-full" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-lg">{plan.name}</div>
                                                    <div className="text-xs font-medium text-slate-500">{plan.description}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xl font-black text-slate-900">
                                                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                                </span>
                                                <div className="text-[10px] uppercase font-bold text-slate-400">/ month</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleFinalSubmit}
                                disabled={isLoading}
                                className="w-full py-5 rounded-xl bg-[#0F172A] text-white font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Complete Setup"}
                            </button>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}
