"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2, LogOut
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useParentData } from "@/context/parent-context";

export default function FamilyHubPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const schoolName = params.schoolName as string;
    const parentId = params.parentId as string;
    const phone = searchParams.get("phone") || "";

    const {
        students,
        parentProfile,
        school,
        studentStats,
        isLoading
    } = useParentData();



    if (isLoading) return <LoadingScreen />;
    if (!phone) return <AuthErrorScreen schoolName={schoolName} />;
    // if (students.length === 0) return <NoStudentsScreen />; // Optional: only if truly empty after load

    // Cast stats to any to avoid TS errors
    const brandColor = school?.brandColor || "#4f46e5";
    const firstName = parentProfile?.firstName || parentProfile?.name?.split(" ")[0] || "Parent";

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-500/20">
            <main className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
                {/* Greeting Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Good Morning,</p>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">{firstName}</h1>
                    </div>
                </div>

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
                                schoolName={schoolName}
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

function StudentIdentityCard({ student, stats, idx, schoolName, parentId, phone }: any) {
    const isAdmission = student.type === "ADMISSION";
    const gradients = [
        "from-violet-600 to-indigo-600",
        "from-emerald-500 to-teal-600",
        "from-rose-500 to-pink-600",
        "from-blue-600 to-cyan-600"
    ];
    const gradient = gradients[idx % gradients.length];

    return (
        <Link href={`/${schoolName}/parent/${parentId}/${student.id}?phone=${phone}`} className="block group">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                    "relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200/50 bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
                    gradient
                )}
            >
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/90 mb-3">
                                {student.status || "APPLICANT"}
                            </span>
                            <h3 className="text-3xl font-black leading-none mb-1">{student.firstName}</h3>
                            <p className="text-white/70 font-bold">{student.lastName}</p>
                        </div>
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl p-1 shadow-inner border border-white/20">
                            {student.avatar ? (
                                <img src={student.avatar} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-black">{student.firstName[0]}</div>
                            )}
                        </div>
                    </div>

                    {/* Footer Stats - Glassmorphism */}
                    {!isAdmission ? (
                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold mb-1">Attendance</p>
                                <p className="text-xl font-black">{stats?.attendance?.percentage || 0}%</p>
                            </div>
                            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold mb-1">Fees</p>
                                <p className="text-xl font-black">{stats?.fees?.pending > 0 ? "Due" : "Paid"}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="text-xs font-medium leading-relaxed">Admission application in progress. Tap for details.</p>
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

function AuthErrorScreen({ schoolName }: any) {
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
