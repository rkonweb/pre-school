"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    User, Settings, Shield, Bell, Phone, Mail, MapPin,
    LogOut, Loader2, GraduationCap, Calendar, Droplet,
    Heart, FileText, Briefcase, Activity, CheckCircle2,
    Users, Target, ClipboardList, PhoneCall
} from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useParentData } from "@/context/parent-context";

export default function ProfilePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const phone = searchParams.get("phone");
    const schoolName = params.schoolName as string;

    const {
        parentProfile: profile,
        students,
        school,
        isLoading
    } = useParentData();

    const [activeTab, setActiveTab] = useState<string>("0"); // "0", "1" (index) or "parent"

    // Auto-select parent tab if no students
    useEffect(() => {
        if (!isLoading && (!students || students.length === 0)) {
            setActiveTab("parent");
        }
    }, [isLoading, students]);

    const brandColor = school?.brandColor || "#2563eb";

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    const activeStudent = activeTab !== "parent" && students ? students[parseInt(activeTab)] : null;

    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 max-w-5xl mx-auto space-y-8 min-h-screen pb-32">

            {/* Page Header */}
            <section>
                <div
                    className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                >
                    My Family
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mt-4 leading-[0.9]">
                    Student <span className="text-zinc-300">Profiles</span>
                </h1>
            </section>

            {/* Tabs */}
            <div className="flex p-1.5 bg-zinc-100/80 backdrop-blur-sm rounded-[24px] overflow-x-auto no-scrollbar">
                {students && students.map((student: any, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => setActiveTab(idx.toString())}
                        className={cn(
                            "flex-1 min-w-[140px] py-3.5 px-4 rounded-[20px] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === idx.toString() ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-900/5" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        {activeTab === idx.toString() && <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />}
                        {student.firstName}
                    </button>
                ))}
                <button
                    onClick={() => setActiveTab("parent")}
                    className={cn(
                        "flex-1 min-w-[140px] py-3.5 px-4 rounded-[20px] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        activeTab === "parent" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-900/5" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    {activeTab === "parent" && <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                    My Profile
                </button>
            </div>

            {/* Content Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeStudent ? (
                    <div className="space-y-6">
                        {/* Student Header Card */}
                        <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                            <div className="h-32 w-32 rounded-[32px] overflow-hidden border-4 border-white shadow-lg bg-zinc-50 shrink-0 z-10">
                                <img
                                    src={activeStudent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStudent.firstName}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left z-10">
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{activeStudent.firstName} {activeStudent.lastName}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500">ID: {activeStudent.id.slice(-6)}</span>
                                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", activeStudent.status === "ACTIVE" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                                        {activeStudent.status}
                                    </span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl -z-0 opacity-50 pointer-events-none" style={{ background: `radial-gradient(circle, ${brandColor}10 0%, transparent 70%)` }} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Academic Alignment */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-lg shadow-zinc-200/10 space-y-6">
                                <SectionHeader icon={Target} title="Academic Alignment" color={brandColor} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard label="Grade" value={activeStudent.grade || activeStudent.classroom?.name?.split(' - ')[0] || "N/A"} />
                                    <InfoCard label="Section" value={activeStudent.classroom?.name?.split(' - ')[1] || "N/A"} />
                                </div>
                            </div>

                            {/* Identity */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-lg shadow-zinc-200/10 space-y-6">
                                <SectionHeader icon={User} title="Student Identity" color={brandColor} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard label="Gender" value={activeStudent.gender} />
                                    <InfoCard label="Date of Birth" value={activeStudent.dateOfBirth ? new Date(activeStudent.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                </div>
                            </div>

                            {/* Health Profile */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-lg shadow-zinc-200/10 space-y-6">
                                <SectionHeader icon={Heart} title="Health Profile" color={brandColor} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard label="Blood Group" value={activeStudent.bloodGroup} />
                                    <InfoCard label="Allergies" value={activeStudent.allergies} />
                                    <InfoCard label="Conditions" value={activeStudent.medicalConditions} colSpan />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-lg shadow-zinc-200/10 space-y-6">
                                <SectionHeader icon={PhoneCall} title="Emergency Contact" color={brandColor} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard label="Contact Name" value={activeStudent.emergencyContactName} />
                                    <InfoCard label="Phone Number" value={activeStudent.emergencyContactPhone} />
                                </div>
                            </div>

                            {/* Enrollment Details */}
                            <div className="md:col-span-2 bg-white rounded-[40px] p-8 border border-zinc-100 shadow-lg shadow-zinc-200/10 space-y-6">
                                <SectionHeader icon={ClipboardList} title="Enrollment Details" color={brandColor} />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InfoCard label="Admission Number" value={activeStudent.admissionNumber} />
                                    <InfoCard label="Joining Date" value={activeStudent.joiningDate ? new Date(activeStudent.joiningDate).toLocaleDateString() : 'N/A'} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Parent Profile View */}
                        <div className="bg-zinc-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10 flex items-center gap-6">
                                <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-3xl font-black">
                                    {profile?.firstName?.[0] || 'P'}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Parent Profile</p>
                                    <h2 className="text-3xl font-black">{profile?.firstName} {profile?.lastName}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Active Account
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20" />
                        </div>

                        <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-lg shadow-zinc-200/10 space-y-6">
                            <SectionHeader icon={Users} title="Contact Information" color={brandColor} />
                            <div className="space-y-4">
                                <div className="flex items-center p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <Phone className="h-5 w-5 text-zinc-400 mr-4" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mobile</p>
                                        <p className="font-bold text-zinc-900">{profile?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <Mail className="h-5 w-5 text-zinc-400 mr-4" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email</p>
                                        <p className="font-bold text-zinc-900">{profile?.email || 'Not Provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <MapPin className="h-5 w-5 text-zinc-400 mr-4" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Address</p>
                                        <p className="font-bold text-zinc-900">{profile?.address || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-lg shadow-zinc-200/10 space-y-6">
                            <SectionHeader icon={Settings} title="App Settings" color={brandColor} />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <div className="flex items-center gap-4">
                                        <Bell className="h-5 w-5 text-zinc-400" />
                                        <span className="font-bold text-sm text-zinc-700">Notifications</span>
                                    </div>
                                    <div className="w-10 h-6 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.replace("/parent-login")}
                            className="w-full py-6 rounded-[32px] bg-red-50 text-red-600 font-black uppercase tracking-widest text-xs hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

function InfoCard({ label, value, colSpan }: { label: string, value: any, colSpan?: boolean }) {
    return (
        <div className={cn("bg-zinc-50 rounded-2xl p-4 border border-zinc-100", colSpan && "col-span-2")}>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">{label}</label>
            <p className="font-bold text-zinc-900 text-sm truncate">{value || "—"}</p>
        </div>
    );
}

function SectionHeader({ icon: Icon, title, color }: any) {
    return (
        <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="h-4 w-4" style={{ color: color }} />
            </div>
            <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900">{title}</h3>
        </div>
    );
}
