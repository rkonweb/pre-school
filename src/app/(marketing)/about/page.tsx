"use client";

import { ArrowRight, GraduationCap, Heart, Library, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="bg-[#FBF6E2] font-sans text-slate-800">
            {/* HERITAGE HERO */}
            <section className="relative pt-32 pb-48 overflow-visible">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#B6E9F0] rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFD2CF] rounded-full blur-[100px] opacity-40 translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#D68F8A]/30 bg-[#FFD2CF]/30 backdrop-blur-md px-5 py-2 text-sm font-black text-[#D68F8A] mb-8 uppercase tracking-widest">
                        <GraduationCap className="h-4 w-4" />
                        <span>Born in the UK</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-slate-900 leading-[1.1]">
                        Pedagogy meets <br /> <span className="text-[#7EBC89]">Playfulness.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
                        Developed by a collective of Oxford educationists and top-tier scholars who believe early childhood software should be as thoughtful as the curriculum itself.
                    </p>
                </div>
            </section>

            {/* THE OXFORD DIFFERENCE */}
            <section className="container mx-auto px-4 py-24 -mt-32 relative z-20">
                <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBF6E2] rounded-full blur-[80px] opacity-60 pointer-events-none" />

                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="flex-1">
                            <h2 className="text-4xl font-black text-slate-900 mb-6">Not just code.<br />Academic <span className="text-[#FF9F99]">Rigour.</span></h2>
                            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
                                Most platforms are built by software engineers who have never stepped into a nursery. Bodhi Board is different.
                            </p>
                            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
                                Our founding team met in the hallowed halls of **Oxford University**. Combining backgrounds in **Developmental Psychology**, **Early Years Education**, and **Computer Science**, we set out to build a system that respects the nuance of child development while leveraging cutting-edge technology.
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-4">
                                    <div className="h-14 w-14 rounded-full border-4 border-white bg-slate-200 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60')] bg-cover" title="Dr. Sarah (Oxford, PhD)" />
                                    <div className="h-14 w-14 rounded-full border-4 border-white bg-slate-200 bg-[url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60')] bg-cover" title="James (Cambridge, MEd)" />
                                    <div className="h-14 w-14 rounded-full border-4 border-white bg-slate-200 bg-[url('https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60')] bg-cover" title="Elena (LSE, MSc)" />
                                </div>
                                <div className="text-sm font-bold text-slate-500">
                                    Trusted by alumni from<br />Oxford, Cambridge, & LSE
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            {/* Decorative Badge */}
                            <div className="absolute -top-10 -right-10 h-32 w-32 bg-[#EDF7CB] rounded-full flex items-center justify-center animate-spin-slow">
                                <span className="text-4xl">🇬🇧</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#B6E9F0] p-6 rounded-[2rem] h-48 flex flex-col justify-end">
                                    <Library className="h-8 w-8 text-cyan-800 mb-2" />
                                    <div className="font-black text-xl text-cyan-900">Research Backed</div>
                                </div>
                                <div className="bg-[#FFE2C2] p-6 rounded-[2rem] h-48 flex flex-col justify-end mt-12">
                                    <Heart className="h-8 w-8 text-orange-800 mb-2" />
                                    <div className="font-black text-xl text-orange-900">Holistic Care</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS FROM UK */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900">A British Standard of Excellence</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Universities Represented", val: "12" },
                            { label: "PhD Researchers", val: "5" },
                            { label: "Years of Research", val: "20+" },
                            { label: "Global Campuses", val: "3" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:scale-105 transition-transform">
                                <div className="text-4xl font-black text-slate-900 mb-2">{stat.val}</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 container mx-auto px-4 text-center">
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-10">Experience the difference.</h2>
                    <Link href="/contact" className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-lg hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1 inline-flex items-center gap-3">
                        Meet the Faculty <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
