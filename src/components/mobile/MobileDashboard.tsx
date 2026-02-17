"use client";

import { motion } from "framer-motion";
import {
    Bell,
    Calendar,
    ChevronRight,
    FileText,
    Menu,
    MessageSquare,
    Bus,
    Image as ImageIcon,
    GraduationCap
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MobileDashboardProps {
    parentProfile: any;
    students: any[];
    studentStats: Record<string, any>;
    slug: string;
    parentId: string;
    phone: string;
}

export function MobileDashboard({
    parentProfile,
    students,
    studentStats,
    slug,
}: MobileDashboardProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
    const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];
    const stats = studentStats[activeStudent?.id] || {};

    return (
        <div className="pb-24 font-sans text-slate-800">
            {/* 1. Elegant Header with Dynamic Brand Color */}
            <div
                className="relative pt-12 pb-24 px-6 rounded-b-[40px] shadow-lg overflow-hidden transition-colors duration-500"
                style={{ background: "var(--brand-color, #2563eb)" }}
            >
                {/* Abstract overlay pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex justify-between items-start mb-8">
                    <div>
                        <p className="text-white/80 text-sm font-medium tracking-wide">Good Morning,</p>
                        <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
                            {parentProfile?.role === "Father" ? "Mr." : parentProfile?.role === "Mother" ? "Mrs." : ""} {parentProfile?.name?.split(' ')[0] || "Parent"}
                        </h1>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                </div>

                {/* Glass Student Selector */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {students.map((student) => (
                        <button
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border border-transparent ${selectedStudentId === student.id
                                ? "bg-white text-[var(--brand-color)] shadow-lg scale-105 font-bold border-white/50"
                                : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 border-white/10"
                                }`}
                        >
                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden border border-white/50">
                                {student.avatar ? (
                                    <img src={student.avatar} alt={student.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px] font-bold text-gray-400">
                                        {student.firstName[0]}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm whitespace-nowrap">{student.firstName}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Main Content Area - Overlapping the Header */}
            <div className="px-6 -mt-16 relative z-20 space-y-6">

                {/* Active Student Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={activeStudent.id}
                    className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                                {activeStudent.grade} • {activeStudent.admissionNumber}
                            </span>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{activeStudent.firstName} {activeStudent.lastName}</h2>
                            <p className="text-slate-400 text-xs font-medium mt-1">
                                {activeStudent.classroom?.teacher
                                    ? `Class Teacher: ${activeStudent.classroom.teacher.lastName || activeStudent.classroom.teacher.firstName}`
                                    : "Classroom assigned"}
                            </p>
                        </div>
                        <Link
                            href={`/${slug}/parent/mobile/dashboard/student/${activeStudent.id}`}
                            className="w-12 h-12 rounded-full bg-slate-50 hover:bg-[var(--brand-color)] hover:text-white transition-all duration-300 flex items-center justify-center group active:scale-95"
                        >
                            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </Link>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                        <div className="text-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance</div>
                            <div className="text-xl font-black" style={{ color: "var(--brand-color)" }}>
                                {stats.attendance?.percentage || 0}%
                            </div>
                        </div>
                        <div className="text-center border-l border-slate-50">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Fees</div>
                            <div className="text-xl font-black text-rose-500">
                                ₹{stats.fees?.totalDue?.toLocaleString() || 0}
                            </div>
                        </div>
                        <div className="text-center border-l border-slate-50">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Homework</div>
                            <div className="text-xl font-black text-emerald-500">
                                {stats.homework?.pending || 0}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Insights / Stats Grid (Previously Feature Grid) */}

                {/* 3. Feature Grid - High Contrast & Elegant */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-2">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FeatureCard
                            href={`/${slug}/parent/mobile/activity?studentId=${activeStudent.id}`}
                            icon={<FileText className="w-6 h-6" />}
                            title="Daily Diary"
                            subtitle="Homework & Updates"
                            color="bg-violet-50 text-violet-600"
                            idx={0}
                        />
                        <FeatureCard
                            href={`/${slug}/parent/mobile/chat`}
                            icon={<MessageSquare className="w-6 h-6" />}
                            title="Live Chat"
                            subtitle="Teacher & Office"
                            color="bg-teal-50 text-teal-600"
                            idx={1}
                        />
                        <FeatureCard
                            href={`/${slug}/parent/mobile/transport?studentId=${activeStudent.id}`}
                            icon={<Bus className="w-6 h-6" />}
                            title="Bus Tracking"
                            subtitle="Live Location"
                            color="bg-amber-50 text-amber-600"
                            idx={2}
                        />
                        <FeatureCard
                            href={`/${slug}/parent/mobile/media?studentId=${activeStudent.id}`}
                            icon={<ImageIcon className="w-6 h-6" />}
                            title="Media Gallery"
                            subtitle="Photos & Videos"
                            color="bg-rose-50 text-rose-600"
                            idx={3}
                        />
                        <FeatureCard
                            href={`/${slug}/parent/mobile/academic?studentId=${activeStudent.id}`}
                            icon={<GraduationCap className="w-6 h-6" />}
                            title="Academic"
                            subtitle="Exams & Reports"
                            color="bg-indigo-50 text-indigo-600"
                            idx={4}
                        />
                    </div>
                </div>

                {/* 4. Recent Updates - Minimalist List */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Recent Updates</h3>
                        <Link href={`/${slug}/parent/mobile/activity`} className="text-xs font-bold text-[var(--brand-color)] hover:underline">View All</Link>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${i === 0 ? "bg-amber-50 text-amber-500" :
                                    i === 1 ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                                    }`}>
                                    {i === 0 ? <Bus className="w-6 h-6" /> : i === 1 ? <FileText className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">
                                        {i === 0 ? "Bus Arrived at School" : i === 1 ? "Math Homework Assigned" : "New Message from Teacher"}
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-1 leading-relaxed">
                                        {i === 0 ? "Your child has safely reached the school campus." : "Complete Exercise 4.2 from the workbook."}
                                    </p>
                                    <span className="text-[10px] text-slate-300 font-bold mt-2 block">{15 + i * 20} mins ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ href, icon, title, subtitle, color, idx }: any) {
    return (
        <Link href={href}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="group bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all active:scale-95 h-full"
            >
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    {icon}
                </div>
                <h4 className="font-bold text-slate-800 text-base">{title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{subtitle}</p>
            </motion.div>
        </Link>
    );
}
