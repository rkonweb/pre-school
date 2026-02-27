"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getFeeStructuresAction } from "@/app/actions/fee-settings-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { FeeStructureManager } from "@/components/dashboard/settings/FeeStructureManager";
import { Loader2 } from "lucide-react";

import { getAcademicYearsAction, getCurrentAcademicYearAction } from "@/app/actions/academic-year-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";

export default function FeeSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [structures, setStructures] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [school, setSchool] = useState<any>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [currentYear, setCurrentYear] = useState<any>(null);

    useEffect(() => {
        load();
    }, [slug]);

    async function load() {
        setIsLoading(true);
        const [structuresRes, schoolRes, classesRes, yearsRes, currentYearRes] = await Promise.all([
            getFeeStructuresAction(slug),
            getSchoolSettingsAction(slug),
            getClassroomsAction(slug),
            getAcademicYearsAction(slug),
            getCurrentAcademicYearAction(slug)
        ]);

        if (structuresRes.success) {
            setStructures(structuresRes.data || []);
        }
        if (schoolRes.success) {
            setSchool(schoolRes.data);
        }
        if (classesRes.success) {
            setClassrooms(classesRes.data || []);
        }
        if (yearsRes.success) {
            setAcademicYears(yearsRes.data || []);
        }
        if (currentYearRes.success) {
            setCurrentYear(currentYearRes.data);
        }

        setIsLoading(false);
    }

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <DashboardLoader message="Loading fee configuration..." />
        </div>
    );

    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Fee Configuration
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Configure automated incentives, late thresholds, and salary rules.
                    </p>
                </div>
            </div>

            <FeeStructureManager
                slug={slug}
                initialData={structures}
                classrooms={classrooms}
                onRefresh={load}
                currency={school?.currency}
                academicYears={academicYears}
                currentAcademicYear={currentYear}
            />
        </div>
    );
}
