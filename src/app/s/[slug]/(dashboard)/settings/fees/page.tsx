"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getFeeStructuresAction } from "@/app/actions/fee-settings-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { FeeStructureManager } from "@/components/dashboard/settings/FeeStructureManager";
import { SettingsPageHeader, SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";
import { getAcademicYearsAction, getCurrentAcademicYearAction } from "@/app/actions/academic-year-actions";
import { CreditCard } from "lucide-react";

export default function FeeSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [structures, setStructures] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [school, setSchool] = useState<any>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [currentYear, setCurrentYear] = useState<any>(null);

    useEffect(() => { load(); }, [slug]);

    async function load() {
        setIsLoading(true);
        const [structuresRes, schoolRes, classesRes, yearsRes, currentYearRes] = await Promise.all([
            getFeeStructuresAction(slug),
            getSchoolSettingsAction(slug),
            getClassroomsAction(slug),
            getAcademicYearsAction(slug),
            getCurrentAcademicYearAction(slug)
        ]);
        if (structuresRes.success) setStructures(structuresRes.data || []);
        if (schoolRes.success) setSchool(schoolRes.data);
        if (classesRes.success) setClassrooms(classesRes.data || []);
        if (yearsRes.success) setAcademicYears(yearsRes.data || []);
        if (currentYearRes.success) setCurrentYear(currentYearRes.data);
        setIsLoading(false);
    }

    if (isLoading) return <SettingsLoader message="Loading fee configuration..." />;

    return (
        <div style={{ animation: "fadeUp 0.45s ease both" }}>
            <SettingsPageHeader
                icon={CreditCard}
                title="Fee Structure"
                description="Configure automated incentives, late thresholds, and class-wise fee rules."
                color="#8B5CF6"
                bg="#EDE9FE"
            />
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #F3F4F6" }}>
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
        </div>
    );
}
