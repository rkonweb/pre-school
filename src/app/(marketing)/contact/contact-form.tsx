"use client";

import { useState } from "react";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function ContactForm({ formContent }: { formContent: any }) {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        // Simulate API call
        setTimeout(() => setStatus("success"), 1500);
    };

    return (
        <div className="w-full max-w-lg">
            {status === "success" ? (
                <div className="bg-teal/5 p-12 rounded-[3rem] border border-teal/10 text-center animate-fade-in-up shadow-2xl shadow-teal/5">
                    <div className="h-20 w-20 bg-teal text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal/20">
                        <MessageSquare className="h-10 w-10" />
                    </div>
                    <h3 className="text-3xl font-black text-navy mb-4 tracking-tight">Message Sent!</h3>
                    <p className="text-navy/50 font-bold uppercase tracking-widest text-sm">
                        {formContent?.successMessage || "We'll get back to you as soon as possible."}
                    </p>
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
                        {status === "submitting" ? "Sending..." : (formContent?.submitButtonText || "Send Message")}
                        <ArrowRight className="h-6 w-6" />
                    </button>
                </form>
            )}
        </div>
    );
}
