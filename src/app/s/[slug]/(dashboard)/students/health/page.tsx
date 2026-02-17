"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { HealthRecordsTable } from "@/components/dashboard/student/HealthRecordsTable";
import { getAllStudentHealthRecordsAction } from "@/app/actions/health-record-actions";
import { Loader2, Heart, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function StudentHealthRecordsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [slug]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await getAllStudentHealthRecordsAction(slug);
            if (res.success) {
                setStudents(res.data || []);
            } else {
                toast.error(res.error || "Failed to load health records");
            }
        } catch (error) {
            console.error("Error loading health records:", error);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 rounded-lg">
                        <Heart className="h-6 w-6 text-rose-600" />
                    </div>
                    <h1 className="text-3xl font-black text-zinc-800 tracking-tight">
                        Student Health Records
                    </h1>
                </div>
                <p className="text-zinc-500 max-w-2xl">
                    Comprehensive view of all students' health data, physical measurements, and BMI tracking.
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-dashed">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                        <p className="animate-pulse font-medium">Loading health records...</p>
                    </div>
                </div>
            ) : (
                <HealthRecordsTable data={students} slug={slug} />
            )}
        </div>
    );
}
