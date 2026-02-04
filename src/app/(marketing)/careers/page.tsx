"use client";

import { useEffect, useState, useRef } from "react";
import {
    ArrowUpRight, Rocket, Sparkles, MapPin, Search, ArrowRight, Briefcase,
    Heart, Coffee, Zap, GraduationCap, Globe, Users, Smile, CheckCircle2,
    UploadCloud, Loader2
} from "lucide-react";
import { getJobPostingsAction, getCareersPageContentAction } from "@/app/actions/cms-actions";
import { submitJobApplicationAction } from "@/app/actions/job-actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CareersSection {
    sectionKey: string;
    content: string;
    isEnabled: boolean;
}

interface JobPost {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    isOpen: boolean;
}

export default function CareersPage() {
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [sections, setSections] = useState<CareersSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Form State
    const [selectedJobId, setSelectedJobId] = useState("");

    useEffect(() => {
        Promise.all([
            getJobPostingsAction().then((data) => setJobs(data as unknown as JobPost[])),
            getCareersPageContentAction().then(setSections)
        ]).finally(() => setLoading(false));
    }, []);

    // Filter Logic
    const openJobs = jobs.filter(job => job.isOpen);

    const getSection = (key: string) => sections.find(s => s.sectionKey === key);
    const parseContent = (section: CareersSection | undefined) => {
        if (!section) return null;
        try { return JSON.parse(section.content); } catch { return null; }
    };

    // Default Fallbacks
    const heroSection = getSection("hero");
    const heroContent = parseContent(heroSection) || {
        badge: "We are hiring",
        headline: "Build the <span class='text-teal'>future</span> of education.",
        description: "Join a team of educators and engineers redefining how preschools operate globally."
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedJobId) {
            toast.error("Please select a role to apply for.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        // Ensure jobId is set from the dropdown state if not manually in the form (though select name='jobId' handles it)

        const result = await submitJobApplicationAction(formData);

        if (result.success) {
            toast.success("Application submitted successfully!");
            formRef.current?.reset();
            setFileName(null);
            setSelectedJobId("");
        } else {
            toast.error(result.error || "Failed to submit application");
        }
        setSubmitting(false);
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-teal animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white font-sans text-navy">
            {/* HERO */}
            {(!heroSection || heroSection.isEnabled) && (
                <section className="relative pt-32 pb-24 border-b border-teal/5 overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

                    <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
                        <div className="inline-block px-5 py-2 bg-navy text-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-8 shadow-xl animate-fade-in-up">
                            {heroContent.badge}
                        </div>
                        <h1
                            className="text-5xl md:text-8xl font-black text-navy mb-10 tracking-tighter leading-[1] animate-fade-in-up delay-100"
                            dangerouslySetInnerHTML={{ __html: heroContent.headline }}
                        />
                        <p className="text-xl md:text-2xl text-navy/40 font-bold uppercase tracking-widest max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200">
                            {heroContent.description}
                        </p>

                        <div className="flex justify-center gap-4 animate-fade-in-up delay-300">
                            <button onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })} className="h-20 px-12 bg-orange text-white rounded-full font-black text-xl uppercase tracking-widest hover:scale-105 hover:bg-orange/90 transition-all shadow-[0_20px_40px_rgba(255,136,0,0.3)] flex items-center gap-3">
                                Apply Now <ArrowRight className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* VALUES SECTION */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-navy mb-4 tracking-tight">Why Bodhi Board?</h2>
                        <p className="text-navy/40 font-bold uppercase tracking-widest text-sm max-w-2xl mx-auto">We're built on a foundation of trust, playfulness, and academic rigour.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        <div className="p-10 rounded-[2.5rem] bg-white border border-teal/5 shadow-2xl shadow-navy/5 hover:border-teal/20 hover:-translate-y-2 transition-all duration-500 group">
                            <div className="h-16 w-16 bg-teal rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-teal/20 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                <Heart className="h-8 w-8 fill-white/20" />
                            </div>
                            <h3 className="text-2xl font-black text-navy mb-4 tracking-tight">Heart-Led Tech</h3>
                            <p className="text-navy/50 font-bold leading-relaxed text-sm">We don't just write code; we solve human problems for teachers and families.</p>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-white border border-teal/5 shadow-2xl shadow-navy/5 hover:border-orange/20 hover:-translate-y-2 transition-all duration-500 group">
                            <div className="h-16 w-16 bg-orange rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-orange/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                <Globe className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black text-navy mb-4 tracking-tight">Global Impact</h3>
                            <p className="text-navy/50 font-bold leading-relaxed text-sm">From London to Mumbai, our software powers schools in diverse communities.</p>
                        </div>
                        <div className="p-10 rounded-[2.5rem] bg-white border border-teal/5 shadow-2xl shadow-navy/5 hover:border-navy/20 hover:-translate-y-2 transition-all duration-500 group">
                            <div className="h-16 w-16 bg-navy rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-navy/20 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                <Zap className="h-8 w-8 fill-white/20" />
                            </div>
                            <h3 className="text-2xl font-black text-navy mb-4 tracking-tight">Bias for Action</h3>
                            <p className="text-navy/50 font-bold leading-relaxed text-sm">We move fast, ship often, and learn constantly. Innovation is our daily habit.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PERKS GRID */}
            <section className="py-32 bg-navy text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-teal rounded-full blur-[150px] opacity-10 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
                        <div>
                            <div className="inline-block px-5 py-2 bg-white/5 border border-white/10 text-teal rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-2xl">
                                Benefits
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1] tracking-tighter">We take care of you,<br />so you can build.</h2>
                            <p className="text-xl md:text-2xl text-white/40 font-bold uppercase tracking-widest leading-relaxed mb-12">
                                Our comprehensive benefits package is designed to support your physical, mental, and financial well-being.
                            </p>
                            <div className="space-y-6">
                                {[
                                    "Competitive salary & equity",
                                    "100% Health insurance coverage",
                                    "Unlimited PTO & Sabbaticals",
                                    "Remote-first culture",
                                    "Learning & Development budget",
                                    "Home office stipend"
                                ].map((perk, i) => (
                                    <div key={i} className="flex items-center gap-5">
                                        <div className="h-8 w-8 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-5 w-5 text-teal" />
                                        </div>
                                        <span className="font-black text-white/80 uppercase tracking-widest text-xs">{perk}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group">
                                <Coffee className="h-10 w-10 text-yellow mb-6 group-hover:scale-110 transition-transform" />
                                <div className="font-black text-xl mb-1 tracking-tight">Work/Life</div>
                                <div className="text-xs font-bold text-white/30 uppercase tracking-widest italic">Flexible hours & location</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all mt-12 group">
                                <GraduationCap className="h-10 w-10 text-teal mb-6 group-hover:scale-110 transition-transform" />
                                <div className="font-black text-xl mb-1 tracking-tight">Growth</div>
                                <div className="text-xs font-bold text-white/30 uppercase tracking-widest italic">Fast-track promo cycles</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group">
                                <Users className="h-10 w-10 text-sky mb-6 group-hover:scale-110 transition-transform" />
                                <div className="font-black text-xl mb-1 tracking-tight">Community</div>
                                <div className="text-xs font-bold text-white/30 uppercase tracking-widest italic">Quarterly team retreats</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all mt-12 group">
                                <Smile className="h-10 w-10 text-orange mb-6 group-hover:scale-110 transition-transform" />
                                <div className="font-black text-xl mb-1 tracking-tight">Wellness</div>
                                <div className="text-xs font-bold text-white/30 uppercase tracking-widest italic">Mental health support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OPEN POSITIONS & APPLICATION FORM */}
            <section id="apply-form" className="py-24 bg-white relative">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-navy mb-10 tracking-tighter">Open Roles</h2>
                        <p className="text-xl text-navy/40 font-bold uppercase tracking-widest">We are currently looking for talent in the following areas.</p>

                        {/* Simple List of Roles */}
                        <div className="flex flex-wrap justify-center gap-4 mt-12">
                            {openJobs.length > 0 ? openJobs.map(job => (
                                <span key={job.id} className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-teal/5 shadow-2xl shadow-navy/5 rounded-full text-navy font-black text-xs uppercase tracking-widest">
                                    <Briefcase className="h-4 w-4 text-teal" />
                                    {job.title}
                                </span>
                            )) : (
                                <span className="text-navy/20 font-black uppercase tracking-widest text-xs italic">No specific roles open, but general applications are welcome!</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-2xl border border-teal/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-navy mb-12 flex items-center gap-4 tracking-tight">
                                <Rocket className="h-10 w-10 text-orange" />
                                Submit an Application
                            </h3>

                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
                                <div>
                                    <label className="block text-[10px] font-black text-navy uppercase tracking-[0.25em] mb-4 ml-1">Select a Role <span className="text-orange">*</span></label>
                                    <div className="relative">
                                        <select
                                            name="jobId"
                                            required
                                            className="w-full px-8 py-5 bg-slate-50 border border-teal/5 rounded-2xl font-black text-navy appearance-none focus:ring-4 focus:ring-teal/10 focus:outline-none transition-all cursor-pointer shadow-inner"
                                            value={selectedJobId}
                                            onChange={(e) => setSelectedJobId(e.target.value)}
                                        >
                                            <option value="" disabled>-- Choose the position you are applying for --</option>
                                            {openJobs.map(job => (
                                                <option key={job.id} value={job.id}>
                                                    {job.title} — {job.department} ({job.location})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-navy/20">
                                            <ArrowUpRight className="h-6 w-6 rotate-45" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] ml-1">First Name <span className="text-orange">*</span></label>
                                        <input required name="firstName" className="w-full p-5 bg-slate-50 border border-teal/5 rounded-2xl font-black text-navy focus:ring-4 focus:ring-teal/10 focus:outline-none transition-all shadow-inner" placeholder="Jane" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] ml-1">Last Name <span className="text-orange">*</span></label>
                                        <input required name="lastName" className="w-full p-5 bg-slate-50 border border-teal/5 rounded-2xl font-black text-navy focus:ring-4 focus:ring-teal/10 focus:outline-none transition-all shadow-inner" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] ml-1">Email Address <span className="text-orange">*</span></label>
                                        <input required name="email" type="email" className="w-full p-5 bg-slate-50 border border-teal/5 rounded-2xl font-black text-navy focus:ring-4 focus:ring-teal/10 focus:outline-none transition-all shadow-inner" placeholder="jane@example.com" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] ml-1">Phone <span className="text-orange">*</span></label>
                                        <input required name="phone" className="w-full p-5 bg-slate-50 border border-teal/5 rounded-2xl font-black text-navy focus:ring-4 focus:ring-teal/10 focus:outline-none transition-all shadow-inner" placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] ml-1">LinkedIn Profile</label>
                                        <input name="linkedin" className="w-full p-5 bg-slate-50 border border-teal/5 rounded-2xl font-black text-navy focus:ring-4 focus:ring-teal/10 focus:outline-none transition-all shadow-inner" placeholder="linkedin.com/in/jane" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] ml-1">Portfolio / Website</label>
                                        <input name="portfolio" className="w-full p-5 bg-slate-50 border border-teal/5 rounded-2xl font-black text-navy focus:ring-4 focus:ring-teal/10 focus:outline-none transition-all shadow-inner" placeholder="jane.design" />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <label className="text-[10px] font-black text-navy uppercase tracking-[0.25em] mb-4 block ml-1">Resume / CV <span className="text-orange">*</span></label>
                                    <label className={cn(
                                        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all hover:bg-slate-50 group",
                                        fileName ? "border-teal/30 bg-teal/5" : "border-navy/10"
                                    )}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {fileName ? (
                                                <>
                                                    <CheckCircle2 className="w-10 h-10 mb-2 text-teal" />
                                                    <p className="text-sm text-teal font-black max-w-[300px] truncate">{fileName}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-10 h-10 mb-2 text-navy/10 group-hover:text-teal transition-colors" />
                                                    <p className="mb-1 text-sm font-black text-navy/30 group-hover:text-teal uppercase tracking-widest">Click to upload resume</p>
                                                    <p className="text-[10px] font-bold text-navy/10 uppercase tracking-widest">PDF, DOC up to 5MB</p>
                                                </>
                                            )}
                                        </div>
                                        <input name="resume" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
                                    </label>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-20 bg-orange text-white rounded-[1.25rem] font-black text-xl uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,136,0,0.3)] hover:scale-105 hover:bg-orange/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        {submitting ? <Loader2 className="h-8 w-8 animate-spin" /> : <>Submit Application <ArrowRight className="h-6 w-6" /></>}
                                    </button>
                                    <p className="text-center text-[10px] text-navy/20 font-black uppercase tracking-[0.25em] mt-8">
                                        By clicking "Submit", you agree to our Privacy Policy and Terms of Service.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
