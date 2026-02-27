
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, GraduationCap, CheckCircle2, ArrowRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { promoteStudentsAction } from "@/app/actions/student-promotion-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { useRouter } from "next/navigation";

interface PromoteStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: string;
    studentName: string;
    schoolSlug: string;
    currentClassroom?: string;
    currentGrade?: string;
    onSuccess?: () => void;
}

export function PromoteStudentDialog({
    open,
    onOpenChange,
    studentId,
    studentName,
    schoolSlug,
    currentClassroom,
    currentGrade,
    onSuccess
}: PromoteStudentDialogProps) {
    const [isPromoting, setIsPromoting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<any>(null);
    const [selectedClassroom, setSelectedClassroom] = useState<any>(null);

    const router = useRouter();

    useEffect(() => {
        if (open) {
            setSelectedYear(null);
            setSelectedClassroom(null);
            loadInitialData();
        }
    }, [open, schoolSlug]);

    const loadInitialData = async () => {
        setIsLoadingData(true);
        try {
            const [classRes, yearRes] = await Promise.all([
                getClassroomsAction(schoolSlug),
                getAcademicYearsAction(schoolSlug)
            ]);

            const loadedClassrooms = classRes.success ? (classRes.data || []) : [];
            const loadedYears = yearRes.success ? (yearRes.data || []) : [];

            setClassrooms(loadedClassrooms);
            setAcademicYears(loadedYears);

            // Auto-select next academic year
            const currentYear = loadedYears.find((y: any) => y.isCurrent);
            if (currentYear) {
                const futureYears = loadedYears
                    .filter((y: any) => new Date(y.startDate) > new Date(currentYear.startDate))
                    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                if (futureYears.length > 0) {
                    setSelectedYear(futureYears[0]);
                }
            }
        } catch (error) {
            toast.error("Failed to load classrooms or academic years");
        } finally {
            setIsLoadingData(false);
        }
    };

    const handlePromote = async () => {
        if (!selectedClassroom || !selectedYear) {
            toast.error("Please select both target classroom and academic year");
            return;
        }
        setIsPromoting(true);
        try {
            const res = await promoteStudentsAction({
                schoolSlug,
                studentIds: [studentId],
                targetClassroomId: selectedClassroom.id,
                targetAcademicYearId: selectedYear.id
            });

            if (res.success) {
                toast.success(`${studentName} has been scheduled for promotion`);
                onOpenChange(false);
                if (onSuccess) onSuccess();
                router.refresh();
            } else {
                toast.error(res.error || "Failed to promote student");
            }
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setIsPromoting(false);
        }
    };

    const canPromote = !!selectedClassroom && !!selectedYear && !isPromoting && !isLoadingData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">

                {/* Brand Header */}
                <div
                    className="relative px-8 pt-8 pb-10 overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #AE7B64 0%, #C4956F 60%, #D4A882 100%)" }}
                >
                    <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
                        <GraduationCap size={130} strokeWidth={1.2} className="text-white" />
                    </div>
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner flex-shrink-0">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-white tracking-tight">
                                Promote Student
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-white/80 font-medium text-sm leading-relaxed">
                            Assign <span className="font-bold text-white">{studentName}</span> to a classroom for the next academic cycle.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Current Placement Card — overlaps header */}
                <div className="px-8 -mt-5 relative z-10">
                    <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Current Placement</p>
                            <p className="text-sm font-bold text-zinc-900">
                                {currentClassroom || "No Class"}
                                {currentGrade ? ` · ${currentGrade}` : ""}
                            </p>
                        </div>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#AE7B6420" }}>
                            <CheckCircle2 className="h-4 w-4" style={{ color: "#AE7B64" }} />
                        </div>
                    </div>
                </div>

                {/* Form Fields — each as flex-col to stack label above trigger */}
                <div className="px-8 pt-5 pb-4 space-y-5">

                    {/* Academic Year */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Target Academic Year
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="w-full flex items-center justify-between bg-zinc-50 border border-zinc-100 h-12 rounded-xl px-4 font-bold text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-60"
                                    disabled={isLoadingData}
                                >
                                    <span className={selectedYear ? "text-zinc-900" : "text-zinc-400 font-medium text-sm"}>
                                        {isLoadingData
                                            ? "Loading..."
                                            : selectedYear
                                                ? `${selectedYear.name}${selectedYear.isCurrent ? " (Current)" : ""}`
                                                : "Select Academic Year"}
                                    </span>
                                    {isLoadingData
                                        ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400 flex-shrink-0" />
                                        : <ChevronDown className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    }
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                sideOffset={4}
                                className="w-[376px] rounded-xl border-zinc-100 shadow-xl p-1"
                            >
                                {academicYears.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-zinc-400">No academic years found</div>
                                ) : (
                                    academicYears.map((year) => (
                                        <DropdownMenuItem
                                            key={year.id}
                                            className="rounded-lg font-bold py-3 px-3 cursor-pointer flex items-center"
                                            onClick={() => setSelectedYear(year)}
                                        >
                                            <span className="flex-1">{year.name}</span>
                                            {year.isCurrent && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mr-2">
                                                    Current
                                                </span>
                                            )}
                                            {selectedYear?.id === year.id && (
                                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#AE7B64" }} />
                                            )}
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Classroom */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                            Target Classroom
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="w-full flex items-center justify-between bg-zinc-50 border border-zinc-100 h-12 rounded-xl px-4 font-bold text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-60"
                                    disabled={isLoadingData}
                                >
                                    <span className={selectedClassroom ? "text-zinc-900" : "text-zinc-400 font-medium text-sm"}>
                                        {isLoadingData
                                            ? "Loading..."
                                            : selectedClassroom
                                                ? selectedClassroom.name
                                                : "Select Target Class"}
                                    </span>
                                    {isLoadingData
                                        ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400 flex-shrink-0" />
                                        : <ChevronDown className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    }
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                sideOffset={4}
                                className="w-[376px] rounded-xl border-zinc-100 shadow-xl p-1 max-h-52 overflow-y-auto"
                            >
                                {classrooms.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-zinc-400">No classrooms found</div>
                                ) : (
                                    classrooms.map((cls) => (
                                        <DropdownMenuItem
                                            key={cls.id}
                                            className="rounded-lg font-bold py-3 px-3 cursor-pointer flex items-center"
                                            onClick={() => setSelectedClassroom(cls)}
                                        >
                                            <span className="flex-1">{cls.name}</span>
                                            {selectedClassroom?.id === cls.id && (
                                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#AE7B64" }} />
                                            )}
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPromoting}
                        className="flex-1 h-12 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!canPromote}
                        onClick={handlePromote}
                        className="flex-1 h-12 rounded-xl font-black text-white shadow-lg gap-2 border-0 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #AE7B64 0%, #C4956F 100%)" }}
                    >
                        {isPromoting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing…
                            </>
                        ) : (
                            <>
                                Promote Student
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
