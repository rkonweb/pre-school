"use server";

import React from "react";
import { ActivityTimeline } from "@/components/mobile/ActivityTimeline";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { getStudentActivityFeedAction, getFamilyStudentsAction } from "@/app/actions/parent-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { redirect } from "next/navigation";
import { ChevronLeft, Filter, Search } from "lucide-react";
import Link from "next/link";

export default async function ParentActivityPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ studentId?: string; preview?: string }>;
}) {
    const { slug } = await params;
    const { studentId: queryStudentId, preview } = await searchParams;

    // 1. Auth & Context
    const userRes = await getCurrentUserAction();

    // PREVIEW BYPASS: Use demo phone if preview mode is active
    const phone = (preview === "true") ? "9999999999" : (userRes.data?.mobile || "");

    if (preview !== "true" && (!userRes.success || !userRes.data)) {
        redirect("/parent-login");
    }

    // 2. Fetch Students to get the default or selected one
    const familyRes = await getFamilyStudentsAction(phone);
    if (!familyRes.success || !familyRes.students?.length) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-10 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-summer-navy mb-2">No Students Found</h1>
                    <p className="text-gray-500">We couldn't find any student records linked to your phone number.</p>
                </div>
            </div>
        );
    }

    const students = familyRes.students;
    const selectedStudentId = queryStudentId || students[0].id;
    const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

    // 3. Fetch Feed Data
    const feedRes = await getStudentActivityFeedAction(slug, selectedStudentId, phone, 50);
    const activities = (feedRes.success ? feedRes.feed : []) || [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">
            {/* Dynamic Header */}
            <div className="bg-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-sm relative z-30">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href={`/${slug}/parent/mobile/dashboard${preview === "true" ? "?preview=true" : ""}`}
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-6 h-6 text-summer-navy" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-summer-navy tracking-tight">DAILY DIARY</h1>
                        <div className="flex items-center gap-1 justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Updates</span>
                        </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform">
                        <Filter className="w-5 h-5 text-summer-navy" />
                    </button>
                </div>

                {/* Student Selector Chips */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {students.map((student: any) => (
                        <Link
                            key={student.id}
                            href={`/${slug}/parent/mobile/activity?studentId=${student.id}${preview === "true" ? "&preview=true" : ""}`}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${selectedStudentId === student.id
                                ? "bg-summer-teal text-white shadow-lg shadow-teal-200 scale-105"
                                : "bg-gray-50 text-gray-400"
                                }`}
                        >
                            {student.firstName}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Floating Search Bar (Visual only for now) */}
            <div className="px-6 -mt-4 relative z-40">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center px-4 py-3 gap-3">
                    <Search className="w-5 h-5 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        className="flex-1 text-sm bg-transparent outline-none text-summer-navy placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* Activity Feed Container */}
            <div className="pt-8 pb-24">
                <ActivityTimeline activities={activities} slug={slug} />
            </div>

            {/* Unified Bottom Nav */}
            <MobileBottomNav slug={slug} activeTab="ACTIVITY" preview={preview === "true"} />
        </div>
    );
}

function UserIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}

// Icons for the bottom nav
function Utensils(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    )
}
