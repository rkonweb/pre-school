"use client";

import {
    Users,
    CreditCard,
    MessageCircle,
    Calendar,
    BookOpen,
    Bus,
    Utensils,
    BarChart3,
    Zap,
    CheckCircle2
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

export default function FeaturesPage() {
    const features = [
        {
            icon: Users,
            bgColor: colors.blue,
            textColor: "text-cyan-700",
            title: "Admissions Management",
            desc: "Streamline the entire enrollment process from inquiry to onboarding. Digital forms, document uploads, and automated status updates."
        },
        {
            icon: Calendar,
            bgColor: colors.pink,
            textColor: "text-rose-700",
            title: "Smart Attendance",
            desc: "One-tap attendance for students and staff. Geo-fencing support, leave management, and instant notifications to parents."
        },
        {
            icon: CreditCard,
            bgColor: colors.green,
            textColor: "text-emerald-700",
            title: "Fee Billing & Invoicing",
            desc: "Automated recurring invoices, online payment integration, and overdue reminders. Never miss a payment again."
        },
        {
            icon: MessageCircle,
            bgColor: colors.peach,
            textColor: "text-orange-700",
            title: "Parent Communication",
            desc: "A dedicated parent app for daily reports, photos, event calendars, and two-way messaging with teachers."
        },
        {
            icon: BookOpen,
            bgColor: colors.lightGreen,
            textColor: "text-lime-700",
            title: "Curriculum Planning",
            desc: "Design and track lesson plans, syllabus progress, and student assessments. Align with educational standards effortlessly."
        },
        {
            icon: Bus,
            bgColor: colors.cream,
            textColor: "text-amber-700",
            title: "Transport Tracking",
            desc: "Real-time bus tracking for parents and admins. Route optimization and safe pickup/drop-off verification."
        },
        {
            icon: Utensils,
            bgColor: colors.teal,
            textColor: "text-teal-700",
            title: "Meal Management",
            desc: "Plan weekly menus, track student allergies, and manage inventory for your school kitchen."
        },
        {
            icon: BarChart3,
            bgColor: colors.blue,
            textColor: "text-blue-700",
            title: "Analytics & Reports",
            desc: "Deep insights into admission trends, revenue health, and academic performance. Exportable reports for board meetings."
        }
    ];

    return (
        <div className="bg-[#FBF6E2] font-sans text-slate-800">
            {/* Hero */}
            <section className="relative pt-20 pb-24 overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[80px] bg-[#B6E9F0] opacity-60 pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] bg-[#FFD2CF] opacity-60 pointer-events-none" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-slate-600 text-sm font-bold shadow-sm border border-slate-200 mb-6">
                        <Zap className="h-4 w-4 text-[#E6A57E] fill-[#E6A57E]" />
                        Powering over 500+ preschools globally
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                        Everything you need to <span className="text-[#FF9F99] relative inline-block">
                            Excel.
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#B6E9F0] -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 font-medium max-w-3xl mx-auto">
                        A comprehensive suite of tools designed to handle the complexities of modern early education management, so you can focus on the children.
                    </p>
                </div>
            </section>

            {/* Curriculum Deep Dive */}
            <section className="container mx-auto px-4 py-16">
                <div className="rounded-[3rem] bg-[#B6E9F0] overflow-hidden text-slate-800 shadow-[0_20px_50px_-20px_rgba(182,233,240,0.8)] relative border-[6px] border-white">
                    <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#BDF0D8] to-transparent z-0 opacity-50" />
                    <div className="relative z-10 p-12 md:p-20 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-block px-4 py-1 bg-white rounded-full text-sm font-black uppercase tracking-wider text-slate-600 shadow-sm">
                                Signature Feature
                            </div>
                            <h2 className="text-4xl font-black">Step-by-Step Curriculum Guide</h2>
                            <p className="text-lg text-slate-700 font-medium leading-relaxed">
                                Stop guessing what to teach. Our interactive curriculum planner maps out daily activities, milestones, and learning goals for every age group.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Age-appropriate lesson plans pre-loaded",
                                    "Resource materials and printable worksheets",
                                    "Progress tracking against state standards",
                                    "Teacher observation logs"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                                        <CheckCircle2 className="h-6 w-6 text-slate-900" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            {/* Mockup of Curriculum View */}
                            <div className="bg-white rounded-[2rem] shadow-2xl p-6 text-slate-800 rotate-1 hover:-rotate-1 transition-all duration-500 origin-bottom-right border border-slate-100">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <h4 className="font-bold text-xl">Weekly Lesson Plan</h4>
                                    <span className="text-sm font-bold text-slate-400">Oct 24 - 28</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 bg-[#FCEBC7] rounded-2xl border border-[#FFE2C2]">
                                        <div className="h-12 w-12 bg-[#FFE2C2] rounded-xl flex-shrink-0 flex items-center justify-center font-black text-amber-900/50">M</div>
                                        <div>
                                            <div className="font-black text-slate-800">Sensory Play: Leaves</div>
                                            <div className="text-sm font-bold text-slate-500">Science & Nature • 45 mins</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-[#E0F7FA] rounded-2xl border border-[#B2EBF2]">
                                        <div className="h-12 w-12 bg-[#B2EBF2] rounded-xl flex-shrink-0 flex items-center justify-center font-black text-cyan-900/50">T</div>
                                        <div>
                                            <div className="font-black text-slate-800">Counting Acorns</div>
                                            <div className="text-sm font-bold text-slate-500">Math & Logic • 30 mins</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-[#F1F8E9] rounded-2xl border border-[#DCEDC8]">
                                        <div className="h-12 w-12 bg-[#DCEDC8] rounded-xl flex-shrink-0 flex items-center justify-center font-black text-lime-900/50">W</div>
                                        <div>
                                            <div className="font-black text-slate-800">Forest Animals Art</div>
                                            <div className="text-sm font-bold text-slate-500">Creative Arts • 60 mins</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="group p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:border-[#B6E9F0] hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 shadow-sm" style={{ backgroundColor: f.bgColor }}>
                                <f.icon className={cn("h-8 w-8", f.textColor)} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-slate-600 transition-colors">{f.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}

                    {/* Call to Action Card */}
                    <div className="relative overflow-hidden p-8 rounded-[2.5rem] bg-slate-900 text-white flex flex-col justify-center items-start shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B6E9F0] rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-2xl font-black mb-4 relative z-10">And so much more...</h3>
                        <p className="text-slate-400 font-medium mb-8 relative z-10">Explore the full potential of Bodhi Board with a personalized walkthrough.</p>
                        <button className="px-8 py-4 rounded-xl bg-white text-slate-900 font-black hover:bg-[#B6E9F0] transition-colors relative z-10">
                            Book a Demo
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
