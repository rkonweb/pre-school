"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Briefcase, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Actions
import { createJobPostingAction } from "@/app/actions/hr-actions";

export default function NewPostingPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleCreatePosting(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get("title") as string,
            department: formData.get("department") as string,
            type: formData.get("type") as string,
            location: formData.get("location") as string,
            description: formData.get("description") as string,
            requirements: formData.get("requirements") as string,
        };

        const res = await createJobPostingAction(data, slug);
        if (res.success) {
            toast.success("Job posting created successfully");
            router.push(`/s/${slug}/hr/recruitment`);
            router.refresh();
        } else {
            toast.error(res.error || "Failed to create posting");
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Link href={`/s/${slug}/hr/recruitment`} className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex items-center gap-1">
                            <ChevronLeft className="h-4 w-4" />
                            Recruitment Board
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        Draft <span className="text-brand">Posting</span>
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Create a comprehensive job posting to attract top talent.</p>
                </div>
            </div>

            <form onSubmit={handleCreatePosting} className="space-y-8">
                {/* Basic Details Canvas */}
                <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-6 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-brand" />
                        Role Profile
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Job Title <span className="text-rose-500">*</span></label>
                                <input type="text" name="title" required className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" placeholder="e.g. Senior Preschool Teacher" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Department <span className="text-rose-500">*</span></label>
                                <input type="text" name="department" required className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" placeholder="e.g. Academic" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Employment Type <span className="text-rose-500">*</span></label>
                                <select name="type" required title="Employment Type" className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all appearance-none">
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                    <option value="CONTRACT">Contract</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">Location <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input type="text" name="location" required className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl pl-11 pr-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all" placeholder="e.g. Main Campus" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Description Canvas */}
                <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-6 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand" />
                        Comprehensive Details
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Job Description & Responsibilities <span className="text-rose-500">*</span></label>
                            <textarea name="description" required rows={6} className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all resize-none" placeholder="Outline the day-to-day responsibilities and core mission of this role..." />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Qualifications & Requirements</label>
                            <textarea name="requirements" rows={5} className="w-full bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all resize-none" placeholder="List required degrees, certifications, and essential skills..." />
                            <p className="text-[10px] text-zinc-400 mt-2 italic">Leave blank if not applicable.</p>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Link
                        href={`/s/${slug}/hr/recruitment`}
                        className="px-8 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-10 py-4 rounded-2xl bg-brand text-[var(--secondary-color)] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 border-2 border-[var(--secondary-color)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        {isSubmitting ? "Publishing..." : "Publish Job Posting"}
                    </button>
                </div>
            </form>
        </div>
    );
}
