"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getFeeStructuresAction } from "@/app/actions/fee-settings-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { FeeStructureManager } from "@/components/dashboard/settings/FeeStructureManager";
import { Loader2 } from "lucide-react";

import { getAcademicYearsAction, getCurrentAcademicYearAction } from "@/app/actions/academic-year-actions";

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
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
    );

    return (
        <FeeStructureManager
            slug={slug}
            initialData={structures}
            classrooms={classrooms}
            onRefresh={load}
            currency={school?.currency}
            academicYears={academicYears}
            currentAcademicYear={currentYear}
        />
    );
}
