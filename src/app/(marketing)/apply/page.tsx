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
        <div className="min-h-screen bg-white font-sans selection:bg-teal/20 text-navy">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-teal/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky/30 rounded-full blur-[150px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[1]">
                        Begin Your Child's <br /><span className="text-teal">Great Journey</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-navy/40 font-bold uppercase tracking-widest max-w-2xl mx-auto">
                        Fill out the form below to start the admission process.
                    </p>
                </div>

                {!isSubmitted ? (
                    <div className="rounded-[4rem] border border-teal/5 bg-white/80 backdrop-blur-2xl p-10 md:p-20 shadow-2xl shadow-navy/5">
                        {/* Multi-step indicator */}
                        <div className="flex items-center justify-between mb-20 px-4">
                            {[
                                { step: 1, label: "Child Info", icon: Heart },
                                { step: 2, label: "Parent Info", icon: Users },
                                { step: 3, label: "Review", icon: FileText }
                            ].map((s) => (
                                <div key={s.step} className="flex-1 flex flex-col items-center relative">
                                    <div className={cn(
                                        "h-16 w-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-700 relative z-10",
                                        step >= s.step ? "bg-teal text-white shadow-xl shadow-teal/30" : "bg-slate-50 text-navy/20"
                                    )}>
                                        <s.icon className="h-8 w-8" />
                                    </div>
                                    <span className={cn(
                                        "mt-5 text-[10px] font-black uppercase tracking-[0.2em]",
                                        step >= s.step ? "text-teal" : "text-navy/20"
                                    )}>
                                        {s.label}
                                    </span>
                                    {s.step < 3 && (
                                        <div className={cn(
                                            "absolute top-8 left-[50%] w-full h-[3px] -z-0",
                                            step > s.step ? "bg-teal" : "bg-slate-50"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleNext} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {step === 1 && (
                                <div className="grid gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] ml-1">Child's Full Name</label>
                                        <input type="text" required placeholder="Full Name" className="w-full rounded-2xl border-teal/5 bg-slate-50 px-6 py-4 text-navy font-bold focus:ring-4 focus:ring-teal/10 shadow-inner outline-none transition-all placeholder:text-navy/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1">Date of Birth</label>
                                            <input type="date" required className="w-full rounded-2xl border-teal/5 bg-slate-50 px-6 py-4 text-navy font-bold focus:ring-4 focus:ring-teal/10 shadow-inner outline-none transition-all" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1">Applying For</label>
                                            <select className="w-full rounded-2xl border-teal/5 bg-slate-50 px-6 py-4 text-navy font-bold focus:ring-4 focus:ring-teal/10 shadow-inner outline-none transition-all cursor-pointer">
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
                                <div className="grid gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1">Guardian Name</label>
                                        <input type="text" required placeholder="Father/Mother/Guardian" className="w-full rounded-2xl border-teal/5 bg-slate-50 px-6 py-4 text-navy font-bold focus:ring-4 focus:ring-teal/10 shadow-inner outline-none transition-all placeholder:text-navy/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1">Phone Number</label>
                                            <input type="tel" required placeholder="+1 (555) 000-0000" className="w-full rounded-2xl border-teal/5 bg-slate-50 px-6 py-4 text-navy font-bold focus:ring-4 focus:ring-teal/10 shadow-inner outline-none transition-all placeholder:text-navy/20" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-1">Email Address</label>
                                            <input type="email" required placeholder="parent@example.com" className="w-full rounded-2xl border-teal/5 bg-slate-50 px-6 py-4 text-navy font-bold focus:ring-4 focus:ring-teal/10 shadow-inner outline-none transition-all placeholder:text-navy/20" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-teal/5 rounded-3xl p-10 text-center border border-teal/10 shadow-inner">
                                    <h4 className="text-2xl font-black text-navy mb-4 tracking-tight">Ready to Submit!</h4>
                                    <p className="text-navy/50 font-bold uppercase tracking-widest text-sm">
                                        By clicking submit, you agree to our initial inquiry policy. We will contact you at the provided phone/email.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-10 border-t border-navy/5">
                                <button
                                    type="button"
                                    onClick={() => step > 1 && setStep(step - 1)}
                                    className={cn(
                                        "text-xs font-black uppercase tracking-widest text-navy/30 hover:text-navy transition-colors",
                                        step === 1 && "opacity-0 pointer-events-none"
                                    )}
                                >
                                    Go Back
                                </button>
                                <button className="flex items-center gap-3 h-16 px-10 rounded-2xl bg-orange text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange/20 hover:scale-105 transition-all">
                                    {step < 3 ? "Continue" : "Submit Inquiry"}
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center animate-in zoom-in duration-700">
                        <div className="h-24 w-24 bg-teal rounded-[2rem] flex items-center justify-center shadow-2xl shadow-teal/20">
                            <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="mt-10 text-5xl font-black text-navy tracking-tighter uppercase leading-[1]">Inquiry Submitted!</h2>
                        <p className="mt-6 text-navy/40 font-bold uppercase tracking-widest text-sm max-w-sm">
                            Thank you for your interest in Bodhi Board. Our admissions coordinator will reach out to you shortly.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="mt-12 h-16 px-10 rounded-2xl bg-navy text-white font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-navy/20"
                        >
                            Back to Website
                        </button>
                    </div>
                )}

                {/* Features for Parents */}
                <div className="mt-40 grid gap-12 sm:grid-cols-3">
                    {[
                        { label: "Vibrant Hub", icon: Building, desc: "A safe & modern environment for your little ones." },
                        { label: "Expert Care", icon: Heart, desc: "Highly trained educators who love what they do." },
                        { label: "Smart Future", icon: Star, desc: "Early education designed for 21st century growth." }
                    ].map((f, i) => (
                        <div key={i} className="flex flex-col items-center text-center px-4 group">
                            <div className="h-16 w-16 bg-white rounded-[1.25rem] shadow-2xl shadow-navy/5 border border-teal/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <f.icon className="h-8 w-8 text-teal" />
                            </div>
                            <h5 className="font-black text-lg mb-2 text-navy tracking-tight">{f.label}</h5>
                            <p className="text-xs font-bold text-navy/40 uppercase tracking-widest italic">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
