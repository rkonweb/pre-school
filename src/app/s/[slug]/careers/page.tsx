"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Briefcase, MapPin, Building2, Clock, CheckCircle2, ChevronRight, X, Sparkles, Users, Laptop, HeartHandshake, Zap, Trophy, Shield } from "lucide-react";
import { getJobPostingsAction, submitApplicationAction } from "@/app/actions/hr-public-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { PhoneInput } from "@/components/ui/PhoneInput";

export default function CareersPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phone, setPhone] = useState("");

    useEffect(() => {
        loadJobs();
    }, [slug]);

    async function loadJobs() {
        setIsLoading(true);
        const res = await getJobPostingsAction(slug);
        if (res.success) {
            setJobs(res.data);
        } else {
            toast.error("Failed to load open positions");
        }
        setIsLoading(false);
    }

    async function handleSubmitApplication(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            jobId: selectedJob.id,
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            resumeUrl: formData.get("resumeUrl") as string || null,
            linkedin: formData.get("linkedin") as string || null,
            portfolio: formData.get("portfolio") as string || null,
            coverLetter: formData.get("coverLetter") as string || null,
        };

        const res = await submitApplicationAction(data, slug);
        if (res.success) {
            toast.success("Application submitted successfully! We will be in touch.");
            setSelectedJob(null);
        } else {
            toast.error(res.error || "Failed to submit application");
        }
        setIsSubmitting(false);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-brand/20">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden bg-zinc-950 dark:bg-zinc-900 min-h-[70vh] flex flex-col items-center justify-center">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center opacity-[0.15] mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand/30 rounded-full blur-[120px] opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] opacity-30 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl">
                        <Sparkles className="h-4 w-4 text-brand" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">Join the Education Revolution</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white leading-[1.1]">
                        Shape the <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-light to-white italic pr-4">Future of Minds.</span>
                    </h1>

                    <p className="text-zinc-400 text-xl max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                        We are looking for passionate, driven individuals to join our mission of redefining educational excellence. Stop working a job and start building a legacy.
                    </p>

                    <button
                        onClick={() => {
                            document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-brand text-zinc-950 px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 mx-auto shadow-[0_0_40px_-10px_rgba(var(--brand-rgb),0.5)] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_60px_-15px_rgba(var(--brand-rgb),0.7)]"
                    >
                        View Open Roles
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Glass Stats Bar */}
                <div className="absolute bottom-10 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-[80%] max-w-6xl">
                    <div className="bg-white/10 dark:bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 shadow-2xl">
                        {[
                            { label: "Active Roles", value: jobs.length.toString(), icon: Briefcase },
                            { label: "Talent Score", value: "98%", icon: Trophy },
                            { label: "Response Time", value: "< 24h", icon: Zap },
                            { label: "Culture Rating", value: "4.9/5", icon: HeartHandshake },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand">
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-white">{stat.value}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Join Us Section */}
            <div className="py-24 bg-white dark:bg-zinc-950 border-y border-zinc-100 dark:border-zinc-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black tracking-tight mb-4">The Bodhi <span className="text-brand italic">Advantage</span></h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto">Experience a workplace designed for growth, well-being, and unparalleled impact.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Premium Tools", desc: "Work with the best hardware and modern software stack. No legacy nonsense.", icon: Laptop },
                            { title: "Health & Wellness", desc: "Comprehensive coverage, mental health days, and an in-house wellness center.", icon: Shield },
                            { title: "Lifelong Learning", desc: "Dedicated budgets for courses, conferences, and continuous upskilling.", icon: Users },
                        ].map((perk, i) => {
                            const Icon = perk.icon;
                            return (
                                <div key={i} className="bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all group border border-zinc-100 dark:border-zinc-800">
                                    <div className="h-16 w-16 bg-white dark:bg-zinc-950 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm group-hover:bg-brand group-hover:text-zinc-950 transition-colors">
                                        <Icon className="h-8 w-8 text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-3">{perk.title}</h3>
                                    <p className="text-zinc-500 leading-relaxed font-medium">{perk.desc}</p>
                                </div>
                            );
                        })}

                    </div>
                </div>
            </div>

            {/* Job Listings */}
            <div id="openings" className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <Briefcase className="h-6 w-6 text-brand" />
                            Open Positions
                        </h2>
                        <p className="text-zinc-500 font-medium mt-2">{jobs.length} roles available right now</p>
                    </div>
                </div>

                {jobs.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-16 text-center shadow-xl shadow-zinc-200/20 dark:shadow-black/20">
                        <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-zinc-400">
                            <Briefcase className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Open Roles</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">We aren't actively hiring at the moment, but check back soon or follow us on our socials.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {jobs.map(job => (
                            <div key={job.id} onClick={() => setSelectedJob(job)} className="bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-brand/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/20 transition-colors"></div>
                                <div className="flex-1 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-brand border border-zinc-100 dark:border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                                            Hiring Now
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-3 group-hover:text-brand transition-colors text-zinc-900 dark:text-zinc-50">{job.title}</h3>
                                    <div className="space-y-4 mt-6 text-sm font-medium text-zinc-500">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400"><Building2 className="h-4 w-4" /></div>
                                            {job.department}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400"><MapPin className="h-4 w-4" /></div>
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400"><Clock className="h-4 w-4" /></div>
                                            {job.type.replace("_", " ")}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Posted {format(new Date(job.createdAt), "MMM d")}</span>
                                    <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-brand group-hover:text-zinc-950 group-hover:border-transparent transition-all shadow-sm">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Application Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />

                    <div className="relative bg-white dark:bg-zinc-950 w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 z-10 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black italic">{selectedJob.title}</h3>
                                <p className="text-brand text-xs font-bold uppercase tracking-widest mt-1">Application Form</p>
                            </div>
                            <button onClick={() => setSelectedJob(null)} className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="prose dark:prose-invert max-w-none mb-10">
                                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">Role Description</h4>
                                <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300 font-medium">{selectedJob.description}</p>

                                {selectedJob.requirements && (
                                    <>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mt-8 mb-2">Requirements</h4>
                                        <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300 font-medium">{selectedJob.requirements}</p>
                                    </>
                                )}
                            </div>

                            <form onSubmit={handleSubmitApplication} className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-widest text-brand border-b border-zinc-100 dark:border-zinc-800 pb-2">Your Application</h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">First Name *</label>
                                        <input type="text" name="firstName" required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Last Name *</label>
                                        <input type="text" name="lastName" required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Email Address *</label>
                                        <input type="email" name="email" required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Phone Number *</label>
                                        <PhoneInput value={phone} onChange={setPhone} />
                                        <input type="hidden" name="phone" value={phone} required />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Resume/CV URL *</label>
                                    <input type="url" name="resumeUrl" required placeholder="Link to Google Drive, Dropbox, etc." className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                    <p className="text-xs text-zinc-400">Please provide a public, viewable link to your resume.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">LinkedIn Profile</label>
                                        <input type="url" name="linkedin" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Portfolio/Website</label>
                                        <input type="url" name="portfolio" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Cover Letter / Note</label>
                                    <textarea name="coverLetter" rows={4} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all resize-none" placeholder="Tell us why you are a great fit..." />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 rounded-2xl bg-brand text-zinc-950 font-black uppercase tracking-[0.2em] shadow-xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-8"
                                >
                                    {isSubmitting ? (
                                        <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5" />
                                    )}
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Footer */}
            <footer className="bg-zinc-950 text-white py-12 text-center">
                <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                    <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black italic mb-4">Bodhi <span className="text-brand">Careers</span></h3>
                <p className="text-zinc-500 text-sm mb-8">Empowering educators and innovators worldwide.</p>
                <div className="flex justify-center gap-6 text-sm font-bold text-zinc-400">
                    <a href="#" className="hover:text-white transition-colors">Home</a>
                    <a href="#" className="hover:text-white transition-colors">About Us</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                </div>
            </footer>
        </div>
    );
}
