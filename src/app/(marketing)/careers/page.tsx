"use client";

import { ArrowUpRight, Rocket, Sparkles, Zap } from "lucide-react";

export default function CareersPage() {
    return (
        <div className="bg-[#FFFDF5] font-sans text-slate-800">
            {/* HERO */}
            <section className="relative pt-32 pb-32">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-block px-4 py-1.5 bg-[#EDF7CB] text-[#558B2F] rounded-full text-xs font-black uppercase tracking-wider mb-6">We are hiring</div>
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter">
                        Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9F99] to-[#D68F8A]">classroom</span> <br />
                        of tomorrow.
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium mb-12">
                        Join a team of Oxford scholars, ex-teachers, and world-class engineers redefining early education.
                    </p>
                </div>
            </section>

            {/* CULTURE GRID */}
            <section className="container mx-auto px-4 mb-32">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="col-span-2 bg-[#B6E9F0] rounded-[3rem] p-12 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-slate-900 mb-4">London HQ</h3>
                            <p className="text-lg font-bold text-slate-700 max-w-sm">Based in the heart of London with satellite hubs in Oxford and Cambridge.</p>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <Rocket className="h-64 w-64 text-cyan-900" />
                        </div>
                    </div>
                    <div className="bg-[#FFD2CF] rounded-[3rem] p-12 flex flex-col justify-center text-center">
                        <h3 className="text-6xl font-black text-[#D68F8A] mb-2">4.5<span className="text-3xl">/5</span></h3>
                        <p className="font-bold text-rose-900 uppercase tracking-widest text-sm">Glassdoor Score</p>
                    </div>
                </div>
            </section>

            {/* OPEN POSITIONS */}
            <section className="container mx-auto px-4 pb-32 max-w-5xl">
                <h2 className="text-4xl font-black text-slate-900 mb-12">Open Roles</h2>

                <div className="space-y-4">
                    {[
                        { title: "Senior Pedagogy Lead", loc: "London / Remote", type: "Full-time", dept: "Education" },
                        { title: "Founding Engineer (Frontend)", loc: "London / Hybrid", type: "Full-time", dept: "Engineering" },
                        { title: "Growth Marketing Manager", loc: "Remote (UK)", type: "Full-time", dept: "Marketing" },
                        { title: "curriculum Designer", loc: "Oxford", type: "Contract", dept: "Content" },
                    ].map((role, i) => (
                        <div key={i} className="group bg-white p-8 rounded-[2rem] border-2 border-slate-100 hover:border-[#FCEBC7] transition-all hover:shadow-xl cursor-pointer flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{role.title}</h3>
                                <div className="flex gap-4 text-sm font-bold text-slate-500">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full">{role.dept}</span>
                                    <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {role.loc}</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#FCEBC7] transition-colors">
                                <ArrowUpRight className="h-5 w-5 text-slate-900" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
