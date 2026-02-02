"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-[#FBF6E2] font-sans text-slate-800 min-h-screen">
            <section className="container mx-auto px-4 py-32">
                <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

                    {/* LEFT: INFO */}
                    <div className="flex-1 p-12 md:p-20 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B6E9F0] rounded-full blur-[100px] opacity-20 pointer-events-none" />

                        <div className="relative z-10">
                            <h1 className="text-4xl md:text-5xl font-black mb-8">Let's start a conversation.</h1>
                            <p className="text-lg text-slate-300 font-medium mb-12">
                                Whether you're a small nursery or a large district, our Oxford-based team is here to help.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-6 w-6 text-[#FFD2CF]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Headquarters</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            12 Innovation Way,<br />
                                            Oxford Science Park,<br />
                                            OX4 4GA, United Kingdom
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-6 w-6 text-[#EDF7CB]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                        <p className="text-slate-400">hello@bodhiboard.co.uk</p>
                                        <p className="text-slate-400">support@bodhiboard.co.uk</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: FORM */}
                    <div className="flex-1 p-12 md:p-20 bg-white">
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
                                    <input className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-900 focus:border-slate-900 outline-none transition-colors" placeholder="Jane" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                                    <input className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-900 focus:border-slate-900 outline-none transition-colors" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">School Name</label>
                                <input className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-900 focus:border-slate-900 outline-none transition-colors" placeholder="Sunshine Academy" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
                                <textarea className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-xl p-4 font-bold text-slate-900 focus:border-slate-900 outline-none transition-colors resize-none" placeholder="Tell us about your needs..." />
                            </div>

                            <button className="w-full h-14 bg-[#FF9F99] hover:bg-[#ff8f87] text-white rounded-xl font-black text-lg transition-colors shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1">
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </section>
        </div>
    );
}
