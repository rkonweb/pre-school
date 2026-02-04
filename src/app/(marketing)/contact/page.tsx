"use client";

import { Mail, MapPin, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        // Simulate API call
        setTimeout(() => setStatus("success"), 1500);
    };

    return (
        <div className="bg-white font-sans text-navy">
            <div className="grid lg:grid-cols-2 min-h-screen">

                {/* Left: Contact Info (Dark) */}
                <div className="bg-navy text-white p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
                    {/* Abstract BG */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-block px-5 py-2 bg-white text-navy rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-xl">
                            Contact Us
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[1]">Let's start a conversation.</h1>
                        <p className="text-xl md:text-2xl text-white/40 font-bold uppercase tracking-widest max-w-lg mb-12">
                            Whether you're a small daycare or a large school network, we're here to help you transform your operations.
                        </p>

                        <div className="space-y-10">
                            <div className="flex items-start gap-8 group">
                                <div className="h-16 w-16 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-teal group-hover:border-teal transition-all duration-300">
                                    <Mail className="h-8 w-8 text-teal group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl mb-1 tracking-tight">Email Us</h3>
                                    <p className="text-white/40 font-bold">hello@bodhiboard.com</p>
                                    <p className="text-white/40 font-bold">support@bodhiboard.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-8 group">
                                <div className="h-16 w-16 rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange group-hover:border-orange transition-all duration-300">
                                    <MapPin className="h-8 w-8 text-orange group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl mb-1 tracking-tight">Visit Us</h3>
                                    <p className="text-white/40 font-bold">123 Education Lane</p>
                                    <p className="text-white/40 font-bold">Bangalore, IN 560001</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-20 lg:mt-0">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em]">
                            © {new Date().getFullYear()} Bodhi Board. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="bg-white p-12 lg:p-24 flex items-center justify-center">
                    <div className="w-full max-w-lg">
                        {status === "success" ? (
                            <div className="bg-teal/5 p-12 rounded-[3rem] border border-teal/10 text-center animate-fade-in-up shadow-2xl shadow-teal/5">
                                <div className="h-20 w-20 bg-teal text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal/20">
                                    <MessageSquare className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-black text-navy mb-4 tracking-tight">Message Sent!</h3>
                                <p className="text-navy/50 font-bold uppercase tracking-widest text-sm">We'll get back to you as soon as possible.</p>
                                <button onClick={() => setStatus("idle")} className="mt-10 text-xs font-black text-teal uppercase tracking-widest hover:text-navy transition-colors">Send another message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-[0.25em] mb-3 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-teal/5 focus:outline-none focus:ring-4 focus:ring-teal/10 focus:bg-white transition-all font-bold text-navy placeholder:text-navy/20 shadow-inner"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-[0.25em] mb-3 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-teal/5 focus:outline-none focus:ring-4 focus:ring-teal/10 focus:bg-white transition-all font-bold text-navy placeholder:text-navy/20 shadow-inner"
                                        placeholder="jane@school.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-[0.25em] mb-3 ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-teal/5 focus:outline-none focus:ring-4 focus:ring-teal/10 focus:bg-white transition-all font-bold text-navy placeholder:text-navy/20 shadow-inner resize-none"
                                        placeholder="Tell us about your school..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={status === "submitting"}
                                    className="w-full h-20 bg-orange text-white rounded-[1.25rem] font-black text-xl uppercase tracking-[0.2em] hover:scale-105 hover:shadow-2xl hover:shadow-orange/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {status === "submitting" ? "Sending..." : "Send Message"}
                                    <ArrowRight className="h-6 w-6" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
