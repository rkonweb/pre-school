"use client";

import { Building2, Heart, Users, Globe, Sparkles } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white font-sans text-navy">
            {/* Hero */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-teal text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-xl">
                        <Heart className="h-4 w-4 fill-white animate-pulse" />
                        Our Mission
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-navy mb-8 tracking-tighter leading-[1]">
                        We build tools that let educators <span className="text-teal">focus on the magic.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-navy/40 font-bold uppercase tracking-widest max-w-2xl mx-auto">
                        Bodhi Board was born from a simple belief: Preschool directors should spend their time nurturing children, not wrestling with spreadsheets.
                    </p>
                </div>
            </section>

            {/* Story / Values */}
            <section className="py-24 bg-slate-50 border-y border-teal/5">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-teal/5 shadow-2xl shadow-navy/5 hover:shadow-navy/10 hover:-translate-y-2 transition-all duration-500 group">
                            <div className="h-16 w-16 bg-teal rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-teal/20 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-navy tracking-tight">Community First</h3>
                            <p className="text-navy/50 font-bold leading-relaxed text-sm">
                                We believe in the power of local communities. Our software is designed to strengthen the bond between schools and families.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-teal/5 shadow-2xl shadow-navy/5 hover:shadow-navy/10 hover:-translate-y-2 transition-all duration-500 group">
                            <div className="h-16 w-16 bg-orange rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-navy tracking-tight">Child-Centric</h3>
                            <p className="text-navy/50 font-bold leading-relaxed text-sm">
                                Every feature we build is tested against one question: "Does this ultimately benefit the child's experience?"
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-teal/5 shadow-2xl shadow-navy/5 hover:shadow-navy/10 hover:-translate-y-2 transition-all duration-500 group">
                            <div className="h-16 w-16 bg-navy rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-navy/20 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                <Globe className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-navy tracking-tight">Global Standard</h3>
                            <p className="text-navy/50 font-bold leading-relaxed text-sm">
                                Bringing world-class operational standards to preschools of all sizes, from home-based daycares to multi-campus academies.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-24 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-black text-navy mb-20 tracking-tight">Built by educators & engineers</h2>
                    <div className="flex flex-wrap justify-center gap-12">
                        {/* Placeholder Avatars */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="group relative">
                                <div className="h-32 w-32 rounded-[2rem] bg-navy/5 overflow-hidden border-4 border-white shadow-2xl mx-auto mb-6 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500">
                                    <div className={`w-full h-full bg-[url('https://i.pravatar.cc/150?img=${i + 20}')] bg-cover`} />
                                </div>
                                <div className="font-black text-navy tracking-tight">Alex {String.fromCharCode(64 + i)}</div>
                                <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mt-1">Co-Founder</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
