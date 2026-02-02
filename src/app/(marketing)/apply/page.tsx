"use client";

import { useState } from "react";
import {
    ArrowRight,
    CheckCircle,
    FileText,
    Heart,
    Star,
    Users,
    Building
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicAdmissionPage() {
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) setStep(step + 1);
        else setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-blue-100">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-10">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-400 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-zinc-900 dark:text-zinc-50">
                        Begin Your Child's <span className="text-blue-600">Great Journey</span>
                    </h1>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                        Fill out the form below to start the admission process. Our team will get back to you within 24 hours.
                    </p>
                </div>

                {!isSubmitted ? (
                    <div className="rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-blue-500/5 dark:border-zinc-800 dark:bg-zinc-950/80">
                        {/* Multi-step indicator */}
                        <div className="flex items-center justify-between mb-12">
                            {[
                                { step: 1, label: "Child Info", icon: Heart },
                                { step: 2, label: "Parent Info", icon: Users },
                                { step: 3, label: "Review", icon: FileText }
                            ].map((s) => (
                                <div key={s.step} className="flex-1 flex flex-col items-center relative">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                        step >= s.step ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                                    )}>
                                        <s.icon className="h-6 w-6" />
                                    </div>
                                    <span className={cn(
                                        "mt-3 text-[10px] font-bold uppercase tracking-widest",
                                        step >= s.step ? "text-blue-600" : "text-zinc-400"
                                    )}>
                                        {s.label}
                                    </span>
                                    {s.step < 3 && (
                                        <div className={cn(
                                            "absolute top-6 left-[60%] w-[80%] h-[2px]",
                                            step > s.step ? "bg-blue-600" : "bg-zinc-100 dark:bg-zinc-900"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleNext} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {step === 1 && (
                                <div className="grid gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Child's Full Name</label>
                                        <input type="text" required placeholder="Full Name" className="w-full rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold">Date of Birth</label>
                                            <input type="date" required className="w-full rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold">Applying For</label>
                                            <select className="w-full rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900">
                                                <option>Nursery</option>
                                                <option>Playgroup</option>
                                                <option>Junior KG</option>
                                                <option>Senior KG</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="grid gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold">Guardian Name</label>
                                        <input type="text" required placeholder="Father/Mother/Guardian" className="w-full rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold">Phone Number</label>
                                            <input type="tel" required placeholder="+1 (555) 000-0000" className="w-full rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold">Email Address</label>
                                            <input type="email" required placeholder="parent@example.com" className="w-full rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 text-center border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-bold text-blue-900 dark:text-blue-100">Ready to Submit!</h4>
                                    <p className="mt-2 text-sm text-blue-700/70 dark:text-blue-300/70">
                                        By clicking submit, you agree to our initial inquiry policy. We will contact you at the provided phone/email.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => step > 1 && setStep(step - 1)}
                                    className={cn(
                                        "text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300",
                                        step === 1 && "opacity-0 pointer-events-none"
                                    )}
                                >
                                    Go Back
                                </button>
                                <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    {step < 3 ? "Continue" : "Submit Inquiry"}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center animate-in zoom-in duration-500">
                        <div className="h-24 w-24 bg-green-100 rounded-3xl flex items-center justify-center dark:bg-green-900/30">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="mt-8 text-3xl font-extrabold">Inquiry Submitted!</h2>
                        <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-sm">
                            Thank you for your interest in Bright Beginnings. Our admissions coordinator will reach out to you shortly.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="mt-10 rounded-2xl border border-zinc-200 px-8 py-3 text-sm font-bold hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            Back to Website
                        </button>
                    </div>
                )}

                {/* Features for Parents */}
                <div className="mt-24 grid gap-8 sm:grid-cols-3">
                    {[
                        { label: "Vibrant Hub", icon: Building, desc: "A safe & modern environment for your little ones." },
                        { label: "Expert Care", icon: Heart, desc: "Highly trained educators who love what they do." },
                        { label: "Smart Future", icon: Star, desc: "Early education designed for 21st century growth." }
                    ].map((f, i) => (
                        <div key={i} className="flex flex-col items-center text-center px-4">
                            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mb-4 dark:bg-zinc-900 dark:border-zinc-800">
                                <f.icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <h5 className="font-bold text-sm mb-2">{f.label}</h5>
                            <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
