"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";
import {
    CheckCircle2, Ticket, ShieldCheck, Zap, Crown,
    Users, CreditCard, Heart, ArrowRight,
    Star, BookOpen, Lock, Smile, TrendingUp, Award, Sticker, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Pastel Palette from user
const colors = {
    pink: "#FFD2CF",
    peach: "#FFE2C2",
    cream: "#FCEBC7",
    offWhite: "#FBF6E2",
    lightGreen: "#EDF7CB",
    green: "#D8F2C9",
    teal: "#BDF0D8",
    blue: "#B6E9F0"
};

export default function Home() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

    useEffect(() => {
        getSubscriptionPlansAction().then(data => {
            setPlans(data.slice(0, 3));
        }).catch(console.error);
    }, []);

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case "free": return <Ticket className="h-6 w-6 text-slate-500" />;
            case "basic": return <ShieldCheck className="h-6 w-6 text-[#7EBC89]" />; // Darker version of teal
            case "premium": return <Zap className="h-6 w-6 text-[#E6A57E]" />; // Darker version of peach
            case "enterprise": return <Crown className="h-6 w-6 text-[#D68F8A]" />; // Darker version of pink
            default: return <Ticket className="h-6 w-6" />;
        }
    };

    return (
        <div className="overflow-x-hidden bg-[#FBF6E2] font-sans text-slate-800">
            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-48 overflow-visible">
                {/* Pastel Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[80px] bg-[#B6E9F0] opacity-60" />
                    <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[80px] bg-[#FFD2CF] opacity-60" />
                    <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full blur-[80px] bg-[#D8F2C9] opacity-60" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 backdrop-blur-md px-5 py-2 text-sm font-bold text-slate-600 mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
                        <span className="flex h-3 w-3 rounded-full bg-[#FFD2CF] ring-2 ring-[#FFD2CF] ring-offset-2 animate-pulse"></span>
                        <span className="tracking-wide">LOVED BY 500+ SCHOOLS</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1.05]">
                        The <span className="text-[#FF9F99]">happiest</span> way <br />
                        to run your <span className="relative inline-block">
                            preschool.
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#B6E9F0] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto max-w-2xl text-xl md:text-2xl text-slate-600 leading-relaxed font-medium mb-12">
                        Admissions, billing, curriculum, and parent updates—all in one playful, easy-to-use playground.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            className="h-16 px-10 rounded-full bg-slate-900 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] hover:bg-slate-800 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                            href="/signup"
                        >
                            Start My Free Trial
                            <Sparkles className="h-5 w-5 text-[#FFE2C2]" />
                        </Link>
                        <Link
                            className="h-16 px-10 rounded-full bg-white text-slate-900 border-2 border-[#FCEBC7] font-bold text-lg flex items-center justify-center shadow-sm hover:bg-[#FCEBC7] transition-all duration-300"
                            href="/demo"
                        >
                            See How It Works
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-10 flex items-center justify-center gap-3 text-sm font-bold text-slate-500">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-4 border-[#FBF6E2] bg-slate-200 bg-[url('https://i.pravatar.cc/100?img=${i+20}')] bg-cover" />
                            ))}
                        </div>
                        <div className="flex flex-col items-start leading-tight ml-2">
                            <div className="flex text-[#FF9F99]">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                            </div>
                            <span>4.9/5 from happy educators</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. VISUAL SHOWCASE - The "Toy Box" */}
            <section className="container mx-auto px-4 -mt-32 mb-40 relative z-20">
                <div className="relative mx-auto max-w-6xl">
                    <div className="relative rounded-[3rem] bg-white p-4 shadow-[0_20px_50px_-20px_rgba(182,233,240,0.6)] border-[6px] border-white ring-4 ring-[#FCEBC7]/50 animate-in slide-in-from-bottom-8 duration-1000">
                        <div className="rounded-[2.5rem] overflow-hidden bg-[#FBF6E2] aspect-[16/10] relative border border-slate-100">
                            {/* Mockup Header */}
                            <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm">
                                <div className="flex items-center gap-8">
                                    <div className="h-10 w-10 bg-[#FFD2CF] rounded-xl flex items-center justify-center text-[#D68F8A] font-black text-xl">P</div>
                                    <div className="flex gap-8 text-sm font-bold text-slate-400">
                                        <span className="text-slate-900 bg-[#EDF7CB] px-3 py-1 rounded-full">Dashboard</span>
                                        <span className="hover:text-slate-600 transition-colors cursor-pointer">Classroom</span>
                                        <span className="hover:text-slate-600 transition-colors cursor-pointer">Billing</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#B6E9F0]" />
                                </div>
                            </div>

                            {/* Dashboard Body */}
                            <div className="p-8 md:p-12 h-full overflow-hidden">
                                <div className="grid grid-cols-4 gap-6 mb-8">
                                    {/* Widget 1 */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Sticker className="h-12 w-12 rotate-12" /></div>
                                        <div className="text-sm font-bold text-slate-400 mb-2">New Students</div>
                                        <div className="text-4xl font-black text-slate-800">12</div>
                                        <div className="text-xs font-bold text-[#7EBC89] mt-2 flex items-center gap-1 bg-[#D8F2C9]/50 w-fit px-2 py-1 rounded-lg">+3 this week</div>
                                    </div>
                                    {/* Widget 2 */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 group hover:-translate-y-1 transition-transform">
                                        <div className="text-sm font-bold text-slate-400 mb-2">Revenue</div>
                                        <div className="text-4xl font-black text-slate-800">$24k</div>
                                        <div className="text-xs font-bold text-slate-400 mt-2">Oct 2023</div>
                                    </div>
                                    {/* Widget 3 - Featured */}
                                    <div className="col-span-2 bg-[#B6E9F0] p-6 rounded-3xl shadow-sm text-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                        <div className="relative z-10">
                                            <div className="inline-block px-3 py-1 bg-white/40 rounded-full text-xs font-bold mb-3 backdrop-blur-sm">Owners Guide</div>
                                            <h3 className="font-bold text-xl mb-1">Today's Focus: Fire Drill</h3>
                                            <p className="text-sm opacity-80 mb-4">Scheduled for 11:00 AM. Checklist ready.</p>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-[#B6E9F0] bg-white" />)}
                                            </div>
                                        </div>
                                        <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                                    </div>
                                </div>

                                <div className="flex gap-6 h-full">
                                    <div className="flex-1 bg-[#FFF5F4] rounded-3xl border border-[#FFD2CF]/30 p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="font-bold text-lg text-slate-800">Nap Time Updates</h4>
                                            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-[#FF9F99]"><Heart className="h-4 w-4 fill-current" /></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                                                <div className="h-10 w-10 bg-[#FFE2C2] rounded-full flex items-center justify-center text-xl">😴</div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-800">Leo took a nap</div>
                                                    <div className="text-xs text-slate-400 font-bold">1 hr 30 mins</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm opacity-60">
                                                <div className="h-10 w-10 bg-[#EDF7CB] rounded-full flex items-center justify-center text-xl">🎨</div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-800">Art Class ended</div>
                                                    <div className="text-xs text-slate-400 font-bold">Just now</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-1/3 bg-white rounded-3xl border border-slate-50 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(#EDF7CB_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                                        <div className="relative z-10">
                                            <div className="h-24 w-24 bg-[#D8F2C9] rounded-full flex items-center justify-center mb-4 mx-auto text-3xl shadow-inner">🍏</div>
                                            <div className="font-bold text-lg text-slate-800">Meal Plan</div>
                                            <div className="text-sm text-slate-400 font-bold">Vegetarian Week</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FEATURES - "Sweet Solutions" */}
            <section className="py-32">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Sweet solutions for <br />sticky problems.</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">Say goodbye to paper piles and hello to peace of mind.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                title: "The Daily Guide",
                                desc: "Like a gentle hand guiding you through the day. Ratios, compliance, and billing checked automatically.",
                                color: "#B6E9F0",
                                icon: BookOpen,
                                iconColor: "text-cyan-600"
                            },
                            {
                                title: "Parent Joy",
                                desc: "Beautiful digital diaries, photos, and updates that make parents feel connected and happy.",
                                color: "#FFD2CF",
                                icon: Heart,
                                iconColor: "text-rose-500"
                            },
                            {
                                title: "Smart Billing",
                                desc: "Invoices that send themselves. Get paid on time without the awkward conversations.",
                                color: "#D8F2C9",
                                icon: CreditCard,
                                iconColor: "text-green-600"
                            }
                        ].map((card, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: card.color }}>
                                    <card.icon className={cn("h-8 w-8", card.iconColor)} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">{card.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* 4. PRICING */}
            <section id="pricing" className="py-32 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#FBF6E2] to-white"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-[#EDF7CB] text-[#7EBC89] font-black text-xs uppercase tracking-widest mb-4">Simple Pricing</div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Invest in extra recess.</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">Clear plans that grow with your little learners.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                        {plans.length === 0 ? (
                            [1, 2, 3].map(i => <div key={i} className="h-[500px] rounded-[3rem] bg-slate-50 animate-pulse" />)
                        ) : (
                            plans.map((plan, i) => (
                                <div
                                    key={plan.id}
                                    className={cn(
                                        "relative flex flex-col rounded-[3rem] p-10 transition-all duration-300",
                                        plan.isPopular
                                            ? "bg-[#FFE2C2] shadow-xl scale-105 z-10 ring-8 ring-white"
                                            : "bg-slate-50 border-2 border-slate-100"
                                    )}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                                            Most Loved
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-black mb-2 text-slate-900">{plan.name}</h3>
                                        <p className="text-sm font-bold text-slate-500">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-slate-900">
                                                {plan.price === 0 ? "Free" : `₹${plan.price}`}
                                            </span>
                                            {plan.price > 0 && <span className="text-lg font-bold text-slate-400">/mo</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        <div className="flex items-center gap-3 font-bold text-slate-700">
                                            <Users className="h-5 w-5 text-slate-400" />
                                            <span>Up to {plan.limits?.maxStudents} Students</span>
                                        </div>
                                        {plan.features.slice(0, 4).map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#7EBC89]" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/signup"
                                        className={cn(
                                            "w-full h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all",
                                            plan.isPopular
                                                ? "bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 shadow-xl shadow-orange-900/10"
                                                : "bg-white text-slate-900 hover:bg-slate-200 border border-slate-200"
                                        )}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* 5. BIG CTA */}
            <section className="py-32 container mx-auto px-4">
                <div className="bg-[#B6E9F0] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-lg border-b-8 border-[#99D6DE]">
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/30 rounded-fullblur-xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFD2CF] rounded-full blur-[80px] opacity-50 translate-x-1/3 translate-y-1/3"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Ready to play?</h2>
                        <p className="text-xl md:text-2xl text-slate-700 mb-12 font-medium">
                            Join the community of educators who are making preschool management a breeze.
                        </p>
                        <button className="h-20 px-12 bg-slate-900 text-white rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">
                            Start Your Free Trial
                        </button>
                        <div className="mt-8 flex items-center justify-center gap-6 text-sm font-bold text-slate-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-slate-900" /> No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-slate-900" /> Cancel anytime
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
