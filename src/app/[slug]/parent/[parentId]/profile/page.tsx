"use client";
import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useParentData } from "@/context/parent-context";

export default function ProfileRedirect() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { students } = useParentData();

    useEffect(() => {
        if (students && students.length > 0) {
            const studentId = students[0].id;
            const phone = searchParams.get("phone");
            const target = `/${params.slug}/parent/${params.parentId}/${studentId}/menu${phone ? `?phone=${phone}` : ""}`;
            router.replace(target);
        }
    }, [students, params, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="h-8 w-8 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    );
}
