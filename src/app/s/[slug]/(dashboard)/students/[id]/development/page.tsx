"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getStudentAction } from "@/app/actions/student-actions";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const StudentDevelopmentTab = dynamic(() => import("@/components/dashboard/students/StudentDevelopmentTab"), { ssr: false });

export default function DevelopmentTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        setIsLoading(true);
        const res = await getStudentAction(slug, id);
        if (res.success) setStudent(res.student);
        setIsLoading(false);
    }

    if (isLoading || !student) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <StudentDevelopmentTab
            schoolSlug={slug}
            schoolId={student.schoolId}
            studentId={id}
            studentName={`${student.firstName} ${student.lastName}`}
            studentGrade={student.grade || student.classroom?.name}
        />
    );
}
