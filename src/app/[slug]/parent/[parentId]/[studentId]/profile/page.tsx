"use client";

import { motion } from "framer-motion";
import {
    User,
    Heart,
    Users,
    MapPin,
    Phone,
    Mail,
    Briefcase,
    Calendar,
    ShieldAlert,
    GraduationCap,
    Info,
    ChevronLeft
} from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getStudentDetailsAction } from "@/app/actions/parent-actions";
import { cn } from "@/lib/utils";
import LoadingOverlay from "@/components/parent/LoadingOverlay";
import { format } from "date-fns";

export default function ParentStudentProfilePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter(); // Helper for back button
    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const slug = params.slug as string;
    const studentId = params.studentId as string;
    const phone = searchParams.get("phone") || "";

    const loadData = async () => {
        setIsLoading(true);
        const res = await getStudentDetailsAction(slug, studentId, phone);
        if (res.success) {
            setStudent(res.student);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [slug, studentId, phone]);

    if (isLoading) return <LoadingOverlay message="Fetching profile details..." />;

    if (!student) return <div className="p-8 text-center font-bold text-zinc-400">Profile not found.</div>;

    const brandColor = student.school?.brandColor || student.school?.primaryColor || "#3b82f6";

    return (
        <div className="flex flex-col min-h-screen bg-[#F1F5F9] pb-32">
            {/* Header */}
            <header className="px-5 pt-6 pb-4 shrink-0 z-40 sticky top-0 bg-[#F1F5F9]/80 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.back()}
                            className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </motion.button>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">My Profile</h2>
                    </div>
                </div>
            </header>

            <main className="px-5 py-4 space-y-8 max-w-4xl mx-auto w-full">

                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[40px] bg-white border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-8 sm:p-12 text-center"
                >
                    {/* Background Abstract */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-zinc-100 mb-6 group transition-transform hover:scale-105">
                            {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-4xl font-black text-white"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    {student.firstName[0]}
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 mb-2">
                            {student.name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100/50">
                                {student.admissionNumber || "ID: TBD"}
                            </span>
                            <span className="px-4 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-black uppercase tracking-widest">
                                {student.grade || "No Grade"} {student.classroom?.name?.split(" - ")[1] ? `- ${student.classroom?.name?.split(" - ")[1]}` : ""}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Info Sections Grid */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Health & Personal */}
                    <ProfileSection
                        icon={Heart}
                        title="Health & Personal"
                        color="rose"
                        items={[
                            { label: "Blood Group", value: student.bloodGroup || "Not Provided" },
                            { label: "Gender", value: student.gender || "Not Specified" },
                            { label: "Date of Birth", value: student.dateOfBirth ? format(new Date(student.dateOfBirth), "do MMMM yyyy") : "TBD" },
                            { label: "Medical Conditions", value: student.medicalConditions || "None Reported", fullWidth: true },
                            { label: "Allergies", value: student.allergies || "None Reported", fullWidth: true },
                        ]}
                    />

                    {/* Emergency Contact */}
                    <ProfileSection
                        icon={ShieldAlert}
                        title="Emergency Contact"
                        color="amber"
                        items={[
                            { label: "Contact Person", value: student.emergencyContactName || "Not Provided" },
                            { label: "Phone Number", value: student.emergencyContactPhone || "Not Provided" },
                        ]}
                    />

                    {/* Residential Address */}
                    <ProfileSection
                        icon={MapPin}
                        title="Residential Address"
                        color="emerald"
                        className="md:col-span-2"
                        items={[
                            { label: "Address", value: student.address || "No address on file", fullWidth: true },
                            { label: "City", value: student.city || "N/A" },
                            { label: "State", value: student.state || "N/A" },
                            { label: "Zip Code", value: student.zip || "N/A" },
                            { label: "Country", value: student.country || "N/A" },
                        ]}
                    />

                    {/* Father's Details */}
                    <ProfileSection
                        icon={Users}
                        title="Father's Details"
                        color="blue"
                        items={[
                            { label: "Full Name", value: student.fatherName || student.parentName || "Not Provided" },
                            { label: "Occupation", value: student.fatherOccupation || "Not Specified" },
                            { label: "Phone", value: student.fatherPhone || student.parentMobile || "Not Provided" },
                            { label: "Email", value: student.fatherEmail || student.parentEmail || "Not Provided" },
                        ]}
                    />

                    {/* Mother's Details */}
                    <ProfileSection
                        icon={Users}
                        title="Mother's Details"
                        color="pink"
                        items={[
                            { label: "Full Name", value: student.motherName || "Not Provided" },
                            { label: "Occupation", value: student.motherOccupation || "Not Specified" },
                            { label: "Phone", value: student.motherPhone || "Not Provided" },
                            { label: "Email", value: student.motherEmail || "Not Provided" },
                        ]}
                    />
                </div>

                {/* Enrollment Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[32px] bg-zinc-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
                            <GraduationCap className="h-8 w-8 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">School Enrollment</p>
                            <h3 className="text-xl font-bold">{student.school?.name}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Joining Date</p>
                        <p className="text-lg font-bold">
                            {student.joiningDate ? format(new Date(student.joiningDate), "MMMM yyyy") : "N/A"}
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

function ProfileSection({ icon: Icon, title, items, color, className }: any) {
    const colorMap: any = {
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        pink: "bg-pink-50 text-pink-600 border-pink-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("bg-white rounded-[32px] border border-zinc-100 p-6 sm:p-8 shadow-xl shadow-zinc-200/20", className)}
        >
            <div className="flex items-center gap-3 mb-8">
                <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", colorMap[color])}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-800">{title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {items.map((item: any, idx: number) => (
                    <div key={idx} className={cn(item.fullWidth ? "col-span-2" : "col-span-1")}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-zinc-900 break-words">{item.value}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
