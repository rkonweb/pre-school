"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useParentData } from "@/context/parent-context";
import ParentHomeworkPage from "@/components/parent/ParentHomework";
import { StickyHeader } from "@/components/ui-theme";
import { HeaderSettingsButton } from "@/components/ui-theme/HeaderSettingsButton";

export default function AcademicsPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const studentId = params.studentId as string;
    const parentId = params.parentId as string;
    const slug = params.slug as string;
    const phone = searchParams.get("phone") || "";

    const { students, isLoading: isContextLoading } = useParentData();
    const student = students.find((s: any) => s.id === studentId);

    if (isContextLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F1F5F9] pb-24">
            <StickyHeader
                title="Homework"
                subtitle={`${student?.firstName || studentId}'s Tasks`}
                showBell={true}
                rightAction={
                    <HeaderSettingsButton
                        slug={slug}
                        parentId={parentId}
                        studentId={studentId}
                        phone={phone}
                    />
                }
            />

            <main className="flex-1 px-5 py-6 space-y-6 relative z-0">
                <ParentHomeworkPage studentId={studentId} parentId={parentId} slug={slug} />
            </main>
        </div>
    );
}
