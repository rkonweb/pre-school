"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { sendParentOTPAction, verifyParentOTPAction, getSchoolBySlugAction } from "@/app/actions/parent-actions";

export default function ParentLoginPage() {
    const params = useParams();
    const router = useRouter();
    const schoolName = params.schoolName as string;

    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [school, setSchool] = useState<any>(null);
    const [loadingSchool, setLoadingSchool] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        fetchSchoolData();
    }, []);

    const fetchSchoolData = async () => {
        const res = await getSchoolBySlugAction(schoolName);
        if (res.success && res.school) {
            setSchool(res.school);
        }
        setLoadingSchool(false);
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 8) {
            toast.error("Please enter a valid mobile number");
            return;
        }

        setIsLoading(true);
        const res = await sendParentOTPAction(phone);

        setIsLoading(false);
        if (res.success) {
            setStep("otp");
            toast.success("Access code sent successfully");
        } else {
            toast.error(res.error || "Failed to send code");
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 4) {
            toast.error("Please enter the 4-digit code");
            return;
        }

        setIsLoading(true);
        const res = await verifyParentOTPAction(phone, otp);

        setIsLoading(false);
        if (res.success && res.parentId) {
            toast.success("Access Granted!");
            router.push(`/${schoolName}/parent/${res.parentId}?phone=${phone}`);
        } else {
            toast.error(res.error || "Verification failed");
        }
    };

    if (!isMounted || loadingSchool) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const brandColor = school?.brandColor || school?.primaryColor || "#2563eb";
    const schoolDisplayName = school?.name || "School";
    const schoolLogo = school?.logo;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20"
                    style={{ backgroundColor: brandColor }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-10"
                    style={{ backgroundColor: brandColor }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* School Branding */}
                <div className="text-center mb-12 space-y-4">
                    {schoolLogo ? (
                        <div className="inline-flex h-20 w-20 rounded-[2rem] items-center justify-center shadow-2xl overflow-hidden"
                            style={{ backgroundColor: brandColor }}
                        >
                            <img src={schoolLogo} alt={schoolDisplayName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div
                            className="inline-flex h-20 w-20 text-white rounded-[2rem] items-center justify-center font-black italic text-3xl shadow-2xl"
                            style={{ backgroundColor: brandColor }}
                        >
                            {schoolDisplayName.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">{schoolDisplayName}</h1>
                        <p
                            className="font-black text-[10px] uppercase tracking-[0.3em]"
                            style={{ color: brandColor }}
                        >
                            Parent Portal Security
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                    <AnimatePresence mode="wait">
                        {step === "phone" ? (
                            <motion.form
                                key="phone-step"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSendOTP}
                                className="space-y-8"
                            >
                                <div className="space-y-2 text-center">
                                    <h2 className="text-xl font-black tracking-tight">Welcome Back</h2>
                                    <p className="text-zinc-400 text-sm font-medium">Enter your registered mobile number to receive an access code.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full h-16 pl-16 pr-6 bg-zinc-50 border-2 border-transparent focus:bg-white rounded-2xl font-bold transition-all outline-none"
                                            style={{
                                                borderColor: phone.length > 0 ? brandColor : 'transparent'
                                            }}
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold px-4">
                                        * Use the number provided during admission.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Access Code <ArrowRight className="h-5 w-5" /></>}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="otp-step"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleVerifyOTP}
                                className="space-y-8"
                            >
                                <div className="space-y-2 text-center">
                                    <div
                                        className="inline-flex h-12 w-12 rounded-xl items-center justify-center mb-2"
                                        style={{
                                            backgroundColor: `${brandColor}15`,
                                            color: brandColor
                                        }}
                                    >
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tight">Verify Identity</h2>
                                    <p className="text-zinc-400 text-sm font-medium">We&apos;ve sent a 4-digit code to <span className="text-zinc-900 font-bold">{phone}</span></p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter 4-digit Code"
                                            value={otp}
                                            maxLength={4}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            className="w-full h-16 pl-16 pr-6 bg-zinc-50 border-2 border-transparent focus:bg-white rounded-2xl font-bold tracking-[0.5em] text-center text-xl transition-all outline-none"
                                            style={{
                                                borderColor: otp.length > 0 ? brandColor : 'transparent'
                                            }}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep("phone")}
                                        className="text-[10px] font-black uppercase tracking-widest hover:opacity-70 px-4 transition-colors"
                                        style={{ color: brandColor }}
                                    >
                                        Change Phone Number
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                    style={{
                                        backgroundColor: brandColor,
                                        boxShadow: `0 10px 40px -10px ${brandColor}40`
                                    }}
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify & Enter Hub <Sparkles className="h-5 w-5" /></>}
                                </button>

                                <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Didn&apos;t receive code? <span className="text-zinc-900 cursor-pointer">Resend</span>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Info */}
                <p className="mt-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">
                    Secure 256-bit Encrypted Access <br />
                    © 2026 {schoolDisplayName}
                </p>
            </motion.div>
        </div>
    );
}
