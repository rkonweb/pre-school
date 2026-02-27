"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
    Loader2, LogOut
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useParentData } from "@/context/parent-context";
import VibrantHeader from "@/components/mobile/VibrantHeader";

export default function FamilyHubPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = params.slug as string;
    const parentId = params.parentId as string;
    const phone = searchParams.get("phone") || "";

    const {
        students,
        parentProfile,
        school,
        studentStats,
        isLoading
    } = useParentData();



    // Auto-redirect if exactly one student
    useEffect(() => {
        if (!isLoading && students.length === 1) {
            const studentId = students[0].id;
            router.replace(`/${slug}/parent/${parentId}/${studentId}${phone ? `?phone=${phone}` : ''}`);
        }
    }, [isLoading, students, slug, parentId, phone, router]);

    // 4. Handle states
    if (isLoading) return <LoadingScreen />;

    // If exactly one student, we are redirecting - show nothing to avoid flash
    if (students.length === 1) return null;

    if (!phone) return <AuthErrorScreen slug={slug} />;
    if (students.length === 0) return <NoStudentsScreen />;

    // Cast stats to any to avoid TS errors
    const brandColor = school?.brandColor || "#4f46e5";
    const firstName = parentProfile?.firstName || parentProfile?.name?.split(" ")[0] || "Parent";

    return (
        <div className="min-h-screen bg-[#F1F5F9] pb-24 font-sans selection:bg-indigo-500/20">
            {/* Vibrant Header */}
            <VibrantHeader
                mode="dashboard"
                greetingName={parentProfile?.name?.split(' ')[0] || "Parent"}
                brandColor={brandColor}
            />

            <main className="max-w-5xl mx-auto px-4 pt-4 space-y-8">

                {/* 2. Students "Cover Flow" */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Kids</h2>
                        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
                            Manage
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {students.map((student: any, idx: number) => (
                            <StudentIdentityCard
                                key={student.id}
                                student={student}
                                stats={studentStats[student.id]}
                                idx={idx}
                                slug={slug}
                                parentId={parentId}
                                phone={phone}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

// --- Subcomponents ---

function StudentIdentityCard({ student, stats, idx, slug, parentId, phone }: any) {
    const isAdmission = student.type === "ADMISSION";
    const gradients = [
        "from-indigo-500/90 to-blue-600/90",
        "from-emerald-500/90 to-teal-600/90",
        "from-rose-500/90 to-pink-600/90",
        "from-amber-500/90 to-orange-600/90"
    ];
    const gradient = gradients[idx % gradients.length];

    return (
        <Link href={`/${slug}/parent/${parentId}/${student.id}?phone=${phone}`} className="block group w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className={cn(
                    "relative overflow-hidden rounded-[2rem] p-6 text-white shadow-lg shadow-slate-200/50 bg-gradient-to-br backdrop-blur-xl border border-white/20 transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02] sm:hover:shadow-2xl",
                    gradient
                )}
            >
                {/* Decorative Blur Orbs */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-[40px] pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-[50px] pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                    {/* Header: Status & Avatar */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col gap-2">
                            <div className="inline-flex w-fit items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/95">
                                    {student.status || "APPLICANT"}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl sm:text-3xl font-black leading-none mb-1 tracking-tight">{student.firstName}</h3>
                                <p className="text-white/80 font-bold text-sm sm:text-base">{student.lastName}</p>
                            </div>
                        </div>

                        <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/30 backdrop-blur-xl rounded-2xl p-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/30 ring-4 ring-white/10 shrink-0">
                            {student.avatar ? (
                                <img src={student.avatar} className="w-full h-full object-cover rounded-[10px]" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-black bg-white/20 rounded-[10px] shadow-inner text-white">
                                    {student.firstName[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Stats - Glassmorphism */}
                    {!isAdmission ? (
                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 border border-white/20 shadow-sm flex flex-col justify-center">
                                <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold mb-0.5 flex items-center gap-1.5">
                                    <span>Attendance</span>
                                </p>
                                <p className="text-xl font-black tracking-tight">{stats?.attendance?.percentage || 0}%</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 border border-white/20 shadow-sm flex flex-col justify-center">
                                <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold mb-0.5 flex items-center gap-1.5">
                                    <span>Fees</span>
                                </p>
                                <p className="text-xl font-black tracking-tight flex items-center gap-2">
                                    {stats?.fees?.pending > 0 ? (
                                        <>Due <span className="w-2 h-2 rounded-full bg-rose-400" /></>
                                    ) : (
                                        <>Paid <span className="w-2 h-2 rounded-full bg-emerald-400" /></>
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-auto bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-sm">
                            <p className="text-sm font-semibold leading-relaxed text-white/90">Admission application in progress. Tap to view tracker.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}



function LoadingScreen() {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
    );
}

function AuthErrorScreen({ slug }: any) {
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                <LogOut className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Session Expired</h2>
            <p className="text-slate-500 max-w-xs mx-auto mb-4">Please log in again to verify your identity.</p>
            <Link href="/parent-login" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Login</Link>
        </div>
    );
}

function NoStudentsScreen() {
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-black">No Students Found</h2>
        </div>
    );
}
