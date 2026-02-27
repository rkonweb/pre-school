
'use client';

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { generateTransportInvoicesAction } from "@/app/actions/transport-fee-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getStudentsAction } from "@/app/actions/student-actions";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { getFeeStructuresAction } from "@/app/actions/fee-settings-actions";
import { Check, Loader2, Calendar, Bus, Filter, Users, LayoutGrid } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLoader } from "@/components/ui/DashboardLoader";

export default function GenerateInvoicesPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();

    const [periodType, setPeriodType] = useState<'MONTHLY' | 'TERM' | 'YEARLY'>('MONTHLY');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedYearId, setSelectedYearId] = useState<string>("");

    // Terms
    const [feeStructures, setFeeStructures] = useState<any[]>([]);
    const [selectedTermName, setSelectedTermName] = useState<string>("");

    // Filters
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            loadStudents();
        } else {
            setStudents([]);
            setSelectedStudentId("");
        }
    }, [selectedClassId]);

    async function loadData() {
        setIsLoadingData(true);
        try {
            const [classesRes, yearsRes, structuresRes] = await Promise.all([
                getClassroomsAction(slug),
                getAcademicYearsAction(slug),
                getFeeStructuresAction(slug)
            ]);

            if (classesRes.success) setClassrooms(resToData(classesRes));
            if (yearsRes.success) {
                const years = resToData(yearsRes);
                setAcademicYears(years);
                const current = years.find((y: any) => y.isCurrent) || years[0];
                if (current) setSelectedYearId(current.id);
            }
            if (structuresRes.success) setFeeStructures(resToData(structuresRes));

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    }

    function resToData(res: any) {
        return res.data || [];
    }

    async function loadStudents() {
        try {
            const res = await getStudentsAction(slug, {
                filters: { class: classrooms.find(c => c.id === selectedClassId)?.name }
            });
            if (res.success) setStudents(res.students || []);
        } catch (error) {
            console.error(error);
        }
    }

    // Extract terms for the selected academic year
    const availableTerms = useMemo(() => {
        const selectedYear = academicYears.find(y => y.id === selectedYearId);
        if (!selectedYear) return [];

        const yearStructures = feeStructures.filter(s => s.academicYear === selectedYear.name);
        const termSet = new Set<string>();

        yearStructures.forEach(s => {
            if (s.termConfig) {
                try {
                    const config = JSON.parse(s.termConfig);
                    config.terms?.forEach((t: any) => {
                        if (t.name) termSet.add(t.name);
                    });
                } catch (e) { }
            }
        });

        return Array.from(termSet).sort();
    }, [selectedYearId, academicYears, feeStructures]);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const selectedYear = academicYears.find(y => y.id === selectedYearId);
            const yearNum = selectedYear ? new Date(selectedYear.startDate).getFullYear() : new Date().getFullYear();

            // For Term Wise, we might need a multiplier or just the name
            // Assumption: Term = 3 months for transport fee calculation
            const monthCountMap = {
                'MONTHLY': 1,
                'TERM': 3,
                'YEARLY': 10
            };

            const res = await generateTransportInvoicesAction(
                slug,
                periodType,
                month,
                yearNum,
                {
                    classroomId: selectedClassId,
                    studentId: selectedStudentId,
                    termId: selectedTermName,
                    monthCount: monthCountMap[periodType]
                }
            );
            if (res.success) {
                toast.success(`Successfully generated ${res.count} invoices!`);
                router.push(`/s/${slug}/transport/fees`);
            } else {
                toast.error(res.error || "Generation failed");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (isLoadingData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-8">
                <DashboardLoader message="Loading transport configuration..." />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
            <div className="text-center">
                <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-brand/5 shadow-inner">
                    <Bus className="h-10 w-10 text-brand" />
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Generate Transport Invoices</h1>
                <p className="text-zinc-500 mt-2 font-medium">Bulk create or individual invoices for transport services.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border-2 border-zinc-100 rounded-3xl shadow-xl shadow-zinc-200/20 p-8 space-y-8">
                        {/* Section 1: Selection Scope */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="h-5 w-5 text-brand" />
                                <h2 className="font-bold text-zinc-900">Selection Scope</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Class / Section</label>
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">All Classes (Bulk)</option>
                                        {classrooms.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Specific Student</label>
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        disabled={!selectedClassId}
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand focus:bg-white transition-all outline-none disabled:opacity-50"
                                    >
                                        <option value="">All Students in Class</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name || `${s.firstName} ${s.lastName}`}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Frequency */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5 text-brand" />
                                <h2 className="font-bold text-zinc-900">Billing Frequency</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'MONTHLY', label: 'Monthly' },
                                    { id: 'TERM', label: 'Term Wise' },
                                    { id: 'YEARLY', label: 'Annually' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setPeriodType(type.id as any)}
                                        className={`py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all ${periodType === type.id
                                            ? 'border-brand bg-brand/5 text-brand'
                                            : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Period Selection */}
                        <div className="pt-6 border-t border-zinc-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {periodType === 'MONTHLY' && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                            Billing Month
                                        </label>
                                        <select
                                            value={month}
                                            onChange={(e) => setMonth(parseInt(e.target.value))}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand focus:bg-white transition-all outline-none"
                                        >
                                            {months.map((m, idx) => (
                                                <option key={idx} value={idx + 1}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {periodType === 'TERM' && (
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                            Select Term
                                        </label>
                                        <select
                                            value={selectedTermName}
                                            onChange={(e) => setSelectedTermName(e.target.value)}
                                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand focus:bg-white transition-all outline-none"
                                        >
                                            <option value="">Select a Term</option>
                                            {availableTerms.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
                                        Academic Year
                                    </label>
                                    <select
                                        value={selectedYearId}
                                        onChange={(e) => setSelectedYearId(e.target.value)}
                                        className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-brand focus:bg-white transition-all outline-none"
                                    >
                                        {academicYears.map((y) => (
                                            <option key={y.id} value={y.id}>{y.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary & Action */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-zinc-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Bus className="h-32 w-32" />
                        </div>

                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-brand" />
                            Generation Summary
                        </h3>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Type</span>
                                <span className="font-black text-sm">{periodType}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Scope</span>
                                <span className="font-black text-sm truncate max-w-[120px]">
                                    {selectedStudentId ? 'Single Student' : (selectedClassId ? 'Class Bulk' : 'Full Bulk')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Period</span>
                                <span className="font-black text-sm">
                                    {periodType === 'MONTHLY' ? `${months[month - 1]}` : (periodType === 'TERM' ? selectedTermName : 'Annual')}
                                    {' '} {academicYears.find(y => y.id === selectedYearId)?.name}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || (periodType === 'TERM' && !selectedTermName)}
                            className="w-full mt-8 py-5 bg-brand text-[var(--secondary-color)] rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 shadow-xl shadow-brand/40 transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:grayscale"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" /> Generate Invoices
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-100">
                        <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900 mb-1">Billing Policy</h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Invoices are only generated for students with <strong>APPROVED</strong> transport profiles.
                                    {periodType === 'TERM' && " Terms are pulled from your Academic settings."}
                                    {periodType === 'YEARLY' && " Annual billing covers the full academic session (10 months)."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
