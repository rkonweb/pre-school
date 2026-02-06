"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Heart,
    Phone,
    Calendar,
    User,
    ShieldCheck,
    Star,
    MessageCircle,
    Clock,
    Award,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentProfileViewProps {
    student: any;
    attendancePct: number;
    feesDue: number;
    classroom: any;
    teacher: any;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
    student,
    attendancePct,
    classroom,
    teacher
}) => {
    return (
        <div className="pb-32 font-sans text-slate-800">
            {/* Immersive Profile Header */}
            <div
                className="relative pt-16 pb-24 px-8 rounded-b-[50px] mb-8 overflow-hidden shadow-xl"
                style={{ background: "var(--brand-color, #2563eb)" }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl mb-6 border-4 border-white/20 backdrop-blur-sm"
                    >
                        <img
                            src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`}
                            className="w-full h-full object-cover rounded-full"
                            alt={student.firstName}
                        />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{student.firstName} {student.lastName}</h1>
                    <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
                        {classroom?.name || "Pre-School"}
                    </span>
                </div>
            </div>

            {/* Info Grid - Floating over header */}
            <div className="px-6 -mt-20 relative z-20 mb-8">
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex justify-around">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Age {student.age || "4"}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Years</span>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                            <Heart className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{student.bloodGroup || "O+"}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Blood</span>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Active</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Status</span>
                    </div>
                </div>
            </div>

            {/* Stats Rings Grid */}
            <div className="px-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100 border border-slate-50 flex flex-col items-center"
                    >
                        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                            <svg className="w-full h-full rotate-[-90deg]">
                                <circle cx="48" cy="48" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
                                <motion.circle
                                    cx="48" cy="48" r="40" fill="transparent" stroke="var(--brand-color, #2563eb)" strokeWidth="8"
                                    strokeDasharray="251.2"
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * attendancePct) / 100 }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-slate-800">{attendancePct}%</span>
                            </div>
                        </div>
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-widest">Attendance</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100 border border-slate-50 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 mb-4 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 relative">
                                <Award className="w-8 h-8" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-full"
                                />
                            </div>
                        </div>
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-widest text-center">Milestones</p>
                    </motion.div>
                </div>
            </div>

            {/* Teacher Bridge */}
            <div className="px-6 mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-2">Class Teacher</h3>
                <div className="bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 relative overflow-hidden">
                            {teacher?.avatar ? (
                                <img src={teacher.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">Ms. {teacher?.lastName || teacher?.firstName || "Teacher"}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Senior Educator</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={`tel:${teacher?.mobile}`}
                            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform hover:bg-slate-100"
                        >
                            <Phone className="w-4 h-4" />
                        </a>
                        <button className="w-10 h-10 rounded-full bg-[var(--brand-color)] flex items-center justify-center text-white active:scale-95 transition-transform shadow-lg shadow-blue-200">
                            <MessageCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Learning Profile Chips */}
            <div className="px-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-2">Key Strengths</h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: "Storytelling", color: "bg-blue-50 text-blue-600", icon: Star },
                        { label: "Fine Motor", color: "bg-rose-50 text-rose-600", icon: Heart },
                        { label: "Social", color: "bg-emerald-50 text-emerald-600", icon: ShieldCheck },
                        { label: "Outdoor", color: "bg-amber-50 text-amber-600", icon: MapPin },
                        { label: "Punctual", color: "bg-indigo-50 text-indigo-600", icon: Clock },
                    ].map((skill, i) => (
                        <div
                            key={i}
                            className={cn("px-4 py-2 rounded-xl flex items-center gap-2 border border-transparent shadow-sm", "bg-white text-slate-600 border-slate-100")}
                        >
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", skill.color)}>
                                <skill.icon className="w-3 h-3" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-tight">{skill.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
