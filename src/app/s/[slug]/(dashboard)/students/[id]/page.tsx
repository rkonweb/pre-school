
"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useParams, useRouter } from "next/navigation";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useConfirm } from "@/contexts/ConfirmContext";
import {
    ArrowLeft,
    User,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Target,
    ShieldCheck,
    TrendingUp,
    Heart,
    PhoneCall,
    History,
    FileUp,
    FileText,
    Loader2,
    CheckCircle2,
    Building2,
    Briefcase,
    Edit3,
    Activity,
    ClipboardList,
    Trophy,
    Plus,
    X,
    MoreHorizontal,
    BookOpen,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    DollarSign,
    Banknote,
    CreditCard,
    Printer,
    GraduationCap
} from "lucide-react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isSameYear,
    isAfter,
    startOfDay
} from "date-fns";
import { cn, getCurrencySymbol } from "@/lib/utils";
import { getStudentAction, updateStudentAction, deleteStudentAction, searchStudentsAction, connectSiblingAction, disconnectSiblingAction } from "@/app/actions/student-actions";
import { getStudentLibraryHistoryAction } from "@/app/actions/library-actions";
import { getStudentAttendanceAction, markAttendanceAction } from "@/app/actions/attendance-actions";
import { getStudentReportsAction, createReportCardAction } from "@/app/actions/report-actions";
import { getStudentSmartAnalyticsAction } from "@/app/actions/analytics-actions";
import { getStudentFeesAction, createFeeAction, recordPaymentAction, getFeeStructuresAction, deleteFeeAction, updateFeeAction, syncStudentFeesAction } from "@/app/actions/fee-actions";
import { getFamilyStudentsAction } from "@/app/actions/parent-actions";
import { Trash2, Search } from "lucide-react";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { toast } from "sonner";
import { getCookie } from "@/lib/cookies";
import { AttendanceDialog } from "@/components/dashboard/students/AttendanceDialog";
import { ReportCardDialog } from "@/components/dashboard/students/ReportCardDialog";
import { CreateFeeDialog } from "@/components/dashboard/students/CreateFeeDialog";
import { ConnectSiblingDialog } from "@/components/dashboard/students/ConnectSiblingDialog";
import { PayFeeDialog } from "@/components/dashboard/students/PayFeeDialog";
import { StudentProgressTab } from "@/components/dashboard/students/StudentProgressTab";
import HealthRecordManager from "@/components/dashboard/student/HealthRecordManager";
import { Badge } from "@/components/ui/badge";
import PrintableReport from "@/components/reports/PrintableReport";
import { StandardActionButton } from "@/components/ui/StandardActionButton";

// Helper components remain the same
const SectionTitle = ({ icon: Icon, title, light = false }: any) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", light ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-900")}>
            <Icon className="h-5 w-5" />
        </div>
        <h3 className={cn("text-lg font-black", light ? "text-white" : "text-zinc-900")}>{title}</h3>
    </div>
);

const InputField = ({ label, value, onChange, readOnly, type = "text" }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{label}</label>
        <input
            type={type}
            value={value || ""}
            disabled={readOnly}
            onChange={e => onChange(e.target.value)}
            className={cn(
                "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all outline-none focus:ring-2 focus:ring-zinc-200",
                readOnly ? "text-zinc-500 cursor-not-allowed opacity-75" : "text-zinc-900 border-2 border-zinc-100 bg-white"
            )}
        />
    </div>
);

const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
};

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const id = params.id as string;
    const { can, isLoading: isPermsLoading } = useRolePermissions();
    const { confirm: confirmDialog } = useConfirm();

    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [activeTab, setActiveTab] = useState<"profile" | "attendance" | "reports" | "fees" | "library" | "progress" | "health">("profile");

    const [student, setStudent] = useState<any>(null);
    const [siblings, setSiblings] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [fees, setFees] = useState<any[]>([]);
    const [libraryTransactions, setLibraryTransactions] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const testReportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `Annual_Report_${student?.firstName}_${student?.lastName}`,
    });

    const handlePrintTest = useReactToPrint({
        contentRef: testReportRef,
        documentTitle: `Test_Report_${student?.firstName}`,
    });

    const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);
    const [isAddReportOpen, setIsAddReportOpen] = useState(false);
    const [isCreateFeeOpen, setIsCreateFeeOpen] = useState(false);
    const [isConnectSiblingOpen, setIsConnectSiblingOpen] = useState(false);
    const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
    const [editingFee, setEditingFee] = useState<any>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceModalInitialData, setAttendanceModalInitialData] = useState<{ date: string, status: string, notes: string } | undefined>(undefined);
    const [isPayFeeOpen, setIsPayFeeOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, [id]);

    async function loadData(silent = false, force = false) {
        try {
            if (!silent) setIsLoading(true);

            const withTimeout = (p: Promise<any>, label: string) =>
                Promise.race([
                    p,
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), 20000))
                ]).catch(err => {
                    console.error(`${label} Error:`, err);
                    return { success: false, error: err.message };
                });

            const academicYearId = getCookie(`academic_year_${slug}`) || undefined;

            // 1. Sync Fees first to ensure getStudentFeesAction has latest data
            await withTimeout(syncStudentFeesAction(id, slug, force), "Sync Fees");

            const [studentRes, gradesRes, classroomsRes, attendanceRes, reportsRes, feesRes, sectionsRes, analyticsRes, libraryRes, yearsRes] = await Promise.all([
                withTimeout(getStudentAction(slug, id), "Student"),
                withTimeout(getMasterDataAction("GRADE", null), "Grades"),
                withTimeout(getClassroomsAction(slug), "Classrooms"),
                withTimeout(getStudentAttendanceAction(slug, id, academicYearId), "Attendance"),
                withTimeout(getStudentReportsAction(id, academicYearId), "Reports"),
                withTimeout(getStudentFeesAction(slug, id), "Fees"),
                withTimeout(getMasterDataAction("SECTION", null), "Sections"),
                withTimeout(getStudentSmartAnalyticsAction(slug, id, academicYearId), "Analytics"),
                withTimeout(getStudentLibraryHistoryAction(slug, id), "Library"),
                withTimeout(getAcademicYearsAction(slug), "Academic Years")
            ]);

            if (studentRes.success && studentRes.student) {
                setStudent(studentRes.student);
                if (studentRes.student.parentMobile) {
                    getFamilyStudentsAction(studentRes.student.parentMobile).then(res => {
                        if (res.success) setSiblings(res.students);
                    });
                }
            } else {
                toast.error("Failed to load student profile");
                if (!student) router.push(`/s/${slug}/students`);
                return;
            }

            setGrades(gradesRes.success ? gradesRes.data || [] : []);
            setClassrooms(classroomsRes.success ? classroomsRes.data || [] : []);
            setAttendance(attendanceRes.success ? attendanceRes.data || [] : []);
            setReports(reportsRes.success ? reportsRes.data || [] : []);
            setFees(feesRes?.success ? feesRes.data || [] : []);
            setSections(sectionsRes?.success ? sectionsRes.data || [] : []);
            setAnalytics(analyticsRes?.success ? analyticsRes.data : null);
            setLibraryTransactions(libraryRes?.success ? libraryRes.data || [] : []);
            setAcademicYears(yearsRes?.success ? yearsRes.data || [] : []);

        } catch (error) {
            console.error("Load Data Error:", error);
            toast.error("Failed to load data");
        } finally {
            if (!silent) setIsLoading(false);
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await updateStudentAction(slug, id, student);
        if (res.success) {
            toast.success("Profile updated");
            setMode("view");
            loadData(true);
        } else {
            toast.error(res.error || "Update failed");
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        const confirmed = await confirmDialog({
            title: "Delete Student",
            message: "Delete student permanently? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await deleteStudentAction(slug, id);
        if (res.success) {
            toast.success("Student deleted");
            router.push(`/s/${slug}/students`);
        } else {
            toast.error(res.error || "Delete failed");
        }
    };

    const handleDisconnect = async (siblingId: string) => {
        const confirmed = await confirmDialog({
            title: "Disconnect Sibling",
            message: "Are you sure you want to remove this sibling linkage?",
            variant: "warning",
            confirmText: "Disconnect",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await disconnectSiblingAction(slug, siblingId);
        if (res.success) {
            toast.success("Sibling disconnected");
            loadData(true);
        } else {
            toast.error(res.error || "Failed to disconnect");
        }
    };

    if (!mounted || isLoading || isPermsLoading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <p className="text-zinc-500 font-medium">Student not found or failed to load.</p>
                <button
                    onClick={() => router.push(`/s/${slug}/students`)}
                    className="px-4 py-2 bg-brand text-white hover:brightness-110 rounded-lg text-sm font-medium"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    const isReadOnly = mode === "view";

    // Permissions
    const canEditProfile = can('students.profiles', 'edit');
    const canDeleteProfile = can('students.profiles', 'delete');
    // For other modules, we'll check broadly
    const canAttendance = can('attendance', 'create');
    const canReports = can('reports', 'create');
    const canFees = can('fees', 'create');

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/students`)}
                        className="h-12 w-12 rounded-2xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <img
                                src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`}
                                className="h-16 w-16 rounded-[24px] bg-zinc-100 object-cover shadow-lg border-2 border-white"
                            />
                            {!isReadOnly && canEditProfile && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[24px] cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const tempUrl = URL.createObjectURL(file);
                                            setStudent({ ...student, avatar: tempUrl });
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            try {
                                                const { updateStudentAvatarAction } = await import("@/app/actions/student-actions");
                                                const res = await updateStudentAvatarAction(slug, id, formData);
                                                if (res.success && res.avatar) {
                                                    setStudent((prev: any) => ({ ...prev, avatar: res.avatar }));
                                                    toast.success("Photo updated");
                                                }
                                            } catch (err) {
                                                toast.error("Upload failed");
                                            }
                                        }}
                                    />
                                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                </label>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-zinc-900">{student.firstName} {student.lastName}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ID: {student.id.slice(-8)}</span>
                                <div className="h-1 w-1 rounded-full bg-zinc-300" />
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    student.status === "ACTIVE" ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                                )}>
                                    {student.status}
                                </span>
                                {student.promotedToClassroomId && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" />
                                        Promoted
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StandardActionButton
                        onClick={() => setMode(mode === "view" ? "edit" : "view")}
                        variant={mode === "view" ? "primary" : "ghost"}
                        icon={mode === "view" ? Edit3 : X}
                        label={mode === "view" ? "Edit Profile" : "Cancel"}
                        permission={{ module: 'students.profiles', action: 'edit' }}
                    />
                    {mode === "view" && (
                        <StandardActionButton
                            onClick={handleDelete}
                            variant="delete"
                            icon={Trash2}
                            iconOnly
                            tooltip="Delete Student"
                            permission={{ module: 'students.profiles', action: 'delete' }}
                        />
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-zinc-100 rounded-[28px] w-full overflow-x-auto">
                {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "attendance", label: "Attendance", icon: Activity },
                    { id: "fees", label: "Fees", icon: Briefcase },
                    { id: "reports", label: "Reports", icon: ClipboardList },
                    { id: "progress", label: "Progress", icon: TrendingUp },
                    { id: "health", label: "Health", icon: Heart },
                    { id: "library", label: "Library", icon: BookOpen }
                ].map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any);
                        }}
                        className={cn(
                            "flex-1 min-w-[100px] py-3.5 rounded-[22px] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id ? "bg-white text-brand shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "profile" && (
                    <form onSubmit={handleUpdate} className="grid lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-10">
                            {/* Identity Section */}
                            <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={User} title="Student Identity" />
                                <div className="grid md:grid-cols-2 gap-8 mt-10">
                                    <InputField label="First Name" value={student.firstName} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, firstName: v })} />
                                    <InputField label="Last Name" value={student.lastName} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, lastName: v })} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Gender</label>
                                        <select
                                            disabled={isReadOnly}
                                            value={student.gender || ""}
                                            onChange={e => setStudent({ ...student, gender: e.target.value })}
                                            className={cn(
                                                "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all disabled:opacity-75 disabled:cursor-not-allowed",
                                                isReadOnly ? "text-zinc-500 shadow-inner" : "text-zinc-900 border-2 border-zinc-100"
                                            )}
                                        >
                                            <option value="">Select</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <InputField
                                        label="Date of Birth"
                                        type="date"
                                        value={formatDateForInput(student.dateOfBirth)}
                                        readOnly={isReadOnly}
                                        onChange={(v: any) => setStudent({ ...student, dateOfBirth: v })}
                                    />
                                    {/* Status Update Dropdown (Only in Edit Mode) */}
                                    {!isReadOnly && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Current Status</label>
                                            <div className="relative group">
                                                <select
                                                    value={student.status || "ACTIVE"}
                                                    onChange={e => setStudent({ ...student, status: e.target.value })}
                                                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-200 appearance-none shadow-sm group-hover:bg-white"
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                    <option value="ABSENT">Absent</option>
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Medical Section */}
                            <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={Heart} title="Health Profile" />
                                <div className="grid md:grid-cols-3 gap-8 mt-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Blood Group</label>
                                        <select
                                            disabled={isReadOnly}
                                            value={student.bloodGroup || ""}
                                            onChange={e => setStudent({ ...student, bloodGroup: e.target.value })}
                                            className={cn(
                                                "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all disabled:opacity-75 disabled:cursor-not-allowed",
                                                isReadOnly ? "text-zinc-500" : "text-zinc-900 border-2 border-zinc-100"
                                            )}
                                        >
                                            <option value="">Select</option>
                                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputField label="Allergies" value={student.allergies} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, allergies: v })} />
                                    <InputField label="Medical Conditions" value={student.medicalConditions} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, medicalConditions: v })} />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={PhoneCall} title="Emergency Contact" />
                                <div className="grid md:grid-cols-2 gap-8 mt-10">
                                    <InputField label="Name" value={student.emergencyContactName} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, emergencyContactName: v })} />
                                    <InputField label="Phone" value={student.emergencyContactPhone} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, emergencyContactPhone: v })} />
                                </div>
                            </div>

                            {!isReadOnly && (
                                <StandardActionButton
                                    type="submit"
                                    loading={isSaving}
                                    variant="primary"
                                    icon={CheckCircle2}
                                    label="Save Profile changes"
                                    className="w-full h-16 rounded-[24px]"
                                    permission={{ module: 'students.profiles', action: 'edit' }}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            {/* Enrollment Details */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={ClipboardList} title="Enrollment Details" />
                                <div className="mt-8 space-y-6">
                                    <InputField
                                        label="Admission Number"
                                        value={student.admissionNumber}
                                        readOnly={isReadOnly}
                                        onChange={(v: any) => setStudent({ ...student, admissionNumber: v })}
                                    />
                                    <InputField
                                        label="Joining Date"
                                        type="date"
                                        value={formatDateForInput(student.joiningDate)}
                                        readOnly={isReadOnly}
                                        onChange={(v: any) => setStudent({ ...student, joiningDate: v })}
                                    />
                                </div>
                            </div>

                            {/* Academic Alignment */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={Target} title="Academic Alignment" />
                                <div className="mt-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Grade</label>
                                        <select
                                            disabled={isReadOnly}
                                            value={student.grade || ""}
                                            onChange={e => {
                                                const newGrade = e.target.value;
                                                setStudent({ ...student, grade: newGrade, classroomId: "" });
                                            }}
                                            className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Grade</option>
                                            {grades.map(g => (
                                                <option key={g.id} value={g.name}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Section</label>
                                        <select
                                            disabled={isReadOnly || !student.grade}
                                            value={(() => {
                                                if (!student.classroomId || !Array.isArray(classrooms)) return "";
                                                const currentClass = classrooms.find(c => c.id === student.classroomId);
                                                if (currentClass?.name) {
                                                    const parts = currentClass.name.split(" - ");
                                                    return parts.length > 1 ? parts[parts.length - 1] : "";
                                                }
                                                return "";
                                            })()}
                                            onChange={e => {
                                                const newSection = e.target.value;
                                                const targetName = `${student.grade} - ${newSection}`;
                                                const matchingClass = classrooms.find(c => c.name === targetName);

                                                if (matchingClass) {
                                                    setStudent({ ...student, classroomId: matchingClass.id });
                                                } else if (newSection) {
                                                    toast.error(`Class "${targetName}" not found.`);
                                                } else {
                                                    setStudent({ ...student, classroomId: "" });
                                                }
                                            }}
                                            className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Section</option>
                                            {sections && sections.length > 0 ? sections.map((s: any) => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            )) : (
                                                ["A", "B", "C", "D"].map(s => <option key={s} value={s}>{s}</option>)
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Next Year Assignment (Promoted) */}
                            {student.promotedToClassroomId && (
                                <div className="bg-blue-50/50 rounded-[40px] p-8 border border-blue-100 shadow-xl shadow-blue-200/10">
                                    <SectionTitle icon={GraduationCap} title="Next Year Assignment" />
                                    <div className="mt-8 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Target Grade</p>
                                            <p className="text-sm font-bold mt-1 px-1 text-blue-900">{student.promotedToGrade}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Target Section</p>
                                            <p className="text-sm font-bold mt-1 px-1 text-blue-900">
                                                {(() => {
                                                    if (!student.promotedToClassroomId || !Array.isArray(classrooms)) return "Unassigned";
                                                    const targetClass = classrooms.find(c => c.id === student.promotedToClassroomId);
                                                    if (targetClass?.name) {
                                                        const parts = targetClass.name.split(" - ");
                                                        return parts.length > 1 ? parts[parts.length - 1] : "Primary";
                                                    }
                                                    return "Unassigned";
                                                })()}
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-bold">
                                                {(() => {
                                                    if (academicYears.length === 0) return "Effective from Next Academic Year";

                                                    // 1. Find Current Year
                                                    const currentYear = academicYears.find(y => y.isCurrent) ||
                                                        academicYears.find(y => y.name === student.school?.currentAcademicYear);

                                                    if (!currentYear) return "Effective from Next Academic Year";

                                                    // 2. Find closest future academic year
                                                    const futureYears = academicYears
                                                        .filter(y => new Date(y.startDate) > new Date(currentYear.startDate))
                                                        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

                                                    const nextYear = futureYears[0];

                                                    if (!nextYear || !nextYear.startDate) return "Effective from Next Academic Year";

                                                    return `Effective from ${format(new Date(nextYear.startDate), "do MMM yyyy")}`;
                                                })()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Parent Connectivity */}
                            <div className="bg-brand rounded-[40px] p-8 text-white shadow-2xl shadow-brand/20">
                                <SectionTitle icon={Users} title="Guardian connectivity" light />
                                <div className="mt-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Primary Guardian</p>
                                        <p className="text-sm font-bold mt-1">{student.parentName}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Phone className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <p className="text-xs font-bold">{student.parentMobile}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Mail className="h-4 w-4 text-white" />
                                        </div>
                                        <p className="text-xs font-bold">{student.parentEmail || "No email linked"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sibling Connections */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <div className="flex items-center justify-between mb-6">
                                    <SectionTitle icon={Users} title="Siblings" />
                                    <StandardActionButton
                                        type="button"
                                        onClick={() => setIsConnectSiblingOpen(true)}
                                        variant="primary"
                                        icon={Plus}
                                        label="Connect"
                                        className="h-8 px-3 rounded-lg text-[10px]"
                                        permission={{ module: 'students.profiles', action: 'edit' }}
                                    />
                                </div>
                                <div className="space-y-4">
                                    {siblings.filter(s => s.id !== student.id).map(sib => (
                                        <div key={sib.id} className="flex items-center justify-between gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 group">
                                            <div className="flex items-center gap-4">
                                                <img src={sib.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sib.firstName}`} className="h-10 w-10 rounded-full bg-white object-cover" />
                                                <div>
                                                    <p className="text-xs font-bold text-zinc-900">{sib.firstName} {sib.lastName}</p>
                                                    <p className="text-[10px] text-zinc-500 font-bold">{sib.classroom?.name || "Unassigned"}</p>
                                                </div>
                                            </div>
                                            <StandardActionButton
                                                onClick={() => handleDisconnect(sib.id)}
                                                variant="delete"
                                                icon={Trash2}
                                                iconOnly
                                                tooltip="Unlink Sibling"
                                                className="opacity-0 group-hover:opacity-100"
                                                permission={{ module: 'students.profiles', action: 'edit' }}
                                            />
                                        </div>
                                    ))}
                                    {siblings.filter(s => s.id !== student.id).length === 0 && (
                                        <p className="text-xs text-zinc-400 font-medium italic">No siblings connected.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {activeTab === "attendance" && (
                    <div className="space-y-8">
                        {/* Attendance Header & Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900">Attendance Log</h3>
                                <p className="text-sm font-medium text-zinc-500 mt-1">Monthly overview and daily records.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-white rounded-2xl border border-zinc-200 p-1 shadow-sm">
                                    <button
                                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-zinc-50 text-zinc-500 transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <div className="px-4 text-sm font-black text-zinc-700 min-w-[140px] text-center">
                                        {format(currentMonth, 'MMMM yyyy')}
                                    </div>
                                    <button
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-zinc-50 text-zinc-500 transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                                <StandardActionButton
                                    onClick={() => setIsAddAttendanceOpen(true)}
                                    variant="primary"
                                    icon={Plus}
                                    label="Mark Attendance"
                                    permission={{ module: 'attendance', action: 'create' }}
                                />
                            </div>
                        </div>

                        {/* Monthly Overview Stats */}
                        {(() => {
                            const monthStart = startOfMonth(currentMonth);
                            const monthEnd = endOfMonth(currentMonth);
                            const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
                            const workingDaysCount = daysInMonth.filter(day => {
                                const dayOfWeek = day.getDay();
                                return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Sunday (0) and Saturday (6)
                            }).length;

                            const monthRecords = attendance.filter(r =>
                                isSameMonth(new Date(r.date), currentMonth) &&
                                isSameYear(new Date(r.date), currentMonth)
                            );

                            const stats = {
                                working: workingDaysCount,
                                present: monthRecords.filter(r => r.status === 'PRESENT').length,
                                absent: monthRecords.filter(r => r.status === 'ABSENT').length,
                                late: monthRecords.filter(r => r.status === 'LATE').length,
                                halfDay: monthRecords.filter(r => r.status === 'HALF_DAY').length,
                                excused: monthRecords.filter(r => r.status === 'EXCUSED').length
                            };

                            return (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <div className="bg-white p-4 rounded-[24px] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                                                <Briefcase className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Working Days</span>
                                        </div>
                                        <p className="text-2xl font-black text-zinc-900">{stats.working}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-[24px] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Present</span>
                                        </div>
                                        <p className="text-2xl font-black text-emerald-600">{stats.present}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-[24px] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <History className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Late</span>
                                        </div>
                                        <p className="text-2xl font-black text-amber-600">{stats.late}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-[24px] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Half Day</span>
                                        </div>
                                        <p className="text-2xl font-black text-purple-600">{stats.halfDay}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-[24px] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <ShieldCheck className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Excused</span>
                                        </div>
                                        <p className="text-2xl font-black text-blue-600">{stats.excused}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-[24px] border border-zinc-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                                <X className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Absent</span>
                                        </div>
                                        <p className="text-2xl font-black text-red-600">{stats.absent}</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Calendar View */}
                        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden p-8">
                            <div className="grid grid-cols-7 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {(() => {
                                    const monthStart = startOfMonth(currentMonth);
                                    const monthEnd = endOfMonth(currentMonth);
                                    const startDate = startOfWeek(monthStart);
                                    const endDate = endOfWeek(monthEnd);
                                    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                                    return calendarDays.map((day, idx) => {
                                        const isFutureDate = isAfter(startOfDay(day), startOfDay(new Date()));
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const dateKey = format(day, "yyyy-MM-dd");
                                        const record = attendance.find(a => format(new Date(a.date), "yyyy-MM-dd") === dateKey);
                                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                                        let statusColor = isWeekend ? "bg-zinc-50/50 text-zinc-300 border-transparent" : "bg-zinc-50 border-transparent text-zinc-400";
                                        if (isFutureDate) statusColor = "bg-zinc-50/20 text-zinc-200 border-transparent opacity-30";
                                        let statusIcon = null;

                                        if (record) {
                                            if (record.status === 'PRESENT') {
                                                statusColor = "bg-emerald-50 border-emerald-100 text-emerald-600";
                                                statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mb-1" />;
                                            } else if (record.status === 'ABSENT') {
                                                statusColor = "bg-red-50 border-red-100 text-red-600";
                                                statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-red-500 mb-1" />;
                                            } else if (record.status === 'LATE') {
                                                statusColor = "bg-amber-50 border-amber-100 text-amber-600";
                                                statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mb-1" />;
                                            } else if (record.status === 'HALF_DAY') {
                                                statusColor = "bg-purple-50 border-purple-100 text-purple-600";
                                                statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mb-1" />;
                                            } else if (record.status === 'EXCUSED') {
                                                statusColor = "bg-blue-50 border-blue-100 text-blue-600";
                                                statusIcon = <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mb-1" />;
                                            }
                                        }

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    if (!canAttendance || isFutureDate) return;
                                                    setAttendanceModalInitialData({
                                                        date: dateKey,
                                                        status: record?.status || "PRESENT",
                                                        notes: record?.notes || ""
                                                    });
                                                    setIsAddAttendanceOpen(true);
                                                }}
                                                className={cn(
                                                    "min-h-[100px] rounded-2xl border p-3 flex flex-col items-center justify-between transition-all relative group",
                                                    isCurrentMonth ? statusColor : "bg-zinc-50/30 border-transparent text-zinc-300 opacity-50",
                                                    record ? "shadow-sm" : "",
                                                    canAttendance && !isFutureDate ? "cursor-pointer hover:border-brand/30 hover:shadow-md" : "cursor-default",
                                                    isSameDay(day, new Date()) ? "ring-2 ring-brand/20" : ""
                                                )}
                                            >
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    isSameDay(day, new Date()) ? "bg-brand text-white h-7 w-7 flex items-center justify-center rounded-full shadow-lg shadow-brand/20" : ""
                                                )}>
                                                    {format(day, 'd')}
                                                </span>

                                                {record && (
                                                    <div className="flex flex-col items-center">
                                                        {statusIcon}
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{record.status.replace('_', ' ')}</span>
                                                    </div>
                                                )}

                                                {/* Tooltip for notes if present */}
                                                {record?.notes && (
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[150px] bg-zinc-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                        {record.notes}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-top-zinc-900" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Recent Activity List (Simplified) */}
                        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-zinc-100">
                                <h4 className="text-lg font-black text-zinc-900">Recent Logs ({format(currentMonth, 'MMMM')})</h4>
                            </div>
                            <div className="space-y-4 p-6">
                                {attendance
                                    .filter(r => isSameMonth(new Date(r.date), currentMonth) && isSameYear(new Date(r.date), currentMonth))
                                    .map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center",
                                                    record.status === "PRESENT" ? "bg-emerald-100 text-emerald-600" :
                                                        record.status === "ABSENT" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                                )}>
                                                    {record.status === "ABSENT" ? <X className="h-5 w-5" /> :
                                                        record.status === "EXCUSED" ? <ShieldCheck className="h-5 w-5" /> : <History className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900">
                                                        {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                                                    </p>
                                                    {record.notes && <p className="text-xs text-zinc-500 font-medium">{record.notes}</p>}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                record.status === "PRESENT" ? "bg-emerald-100 text-emerald-600" :
                                                    record.status === "ABSENT" ? "bg-red-100 text-red-600" :
                                                        record.status === "EXCUSED" ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500"
                                            )}>
                                                {record.status}
                                            </span>
                                        </div>
                                    ))}
                                {attendance.filter(r => isSameMonth(new Date(r.date), currentMonth)).length === 0 && (
                                    <p className="text-center text-zinc-400 font-bold py-8">No records for this month.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "reports" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900">Progress Reports</h3>
                                <p className="text-sm font-medium text-zinc-500 mt-1">Holistic academic and developmental assessment.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StandardActionButton
                                    onClick={() => handlePrint()}
                                    variant="outline"
                                    icon={Printer}
                                    label="Print Annual Report"
                                />
                            </div>
                        </div>

                        {/* Analytical Reports Section (Synced from Module) */}
                        <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-zinc-900">Automated Analytics</h4>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Real-time Exam Sync</p>
                                </div>
                            </div>

                            {analytics?.academics.examHistory.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {analytics.academics.examHistory.slice().reverse().map((exam: any, idx: number) => (
                                            <div
                                                key={idx}
                                                onClick={() => setExpandedExamId(expandedExamId === exam.id ? null : exam.id)}
                                                className={cn(
                                                    "p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                                                    expandedExamId === exam.id
                                                        ? "bg-brand text-white border-brand shadow-xl shadow-brand/20 scale-[1.02]"
                                                        : "bg-zinc-50 border-zinc-100 hover:border-brand/30 hover:shadow-lg hover:shadow-zinc-200/20"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        expandedExamId === exam.id ? "text-white/60" : "text-zinc-400"
                                                    )}>{exam.date}</span>
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-lg flex items-center justify-center font-black text-[10px] border shadow-sm",
                                                        expandedExamId === exam.id ? "bg-white/10 border-white/20 text-white" : "bg-white border-zinc-100 text-brand"
                                                    )}>
                                                        {exam.percentage.toFixed(0)}%
                                                    </div>
                                                </div>
                                                <h5 className="font-bold mb-4">{exam.name}</h5>
                                                <div className={cn(
                                                    "w-full h-2 rounded-full overflow-hidden border",
                                                    expandedExamId === exam.id ? "bg-white/20 border-white/10" : "bg-white border-zinc-100"
                                                )}>
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all",
                                                            expandedExamId === exam.id ? "bg-white" : "bg-brand"
                                                        )}
                                                        style={{ width: `${exam.percentage}%` }}
                                                    />
                                                </div>

                                                <div className={cn(
                                                    "absolute right-4 bottom-4 transition-transform duration-300",
                                                    expandedExamId === exam.id ? "rotate-180" : ""
                                                )}>
                                                    <ChevronDown className="h-4 w-4 opacity-40" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Expanded Exam Detail */}
                                    {expandedExamId && analytics.academics.examHistory.find((e: any) => e.id === expandedExamId) && (
                                        <div className="mt-8 p-8 rounded-[32px] bg-zinc-50 border border-zinc-100 animate-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h4 className="text-xl font-black text-zinc-900">
                                                        {analytics.academics.examHistory.find((e: any) => e.id === expandedExamId)?.name} Detail
                                                    </h4>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Subject-wise performance breakdown</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StandardActionButton
                                                        onClick={() => handlePrintTest()}
                                                        variant="outline"
                                                        icon={Printer}
                                                        label="Print Test Report"
                                                        className="h-10 px-4 rounded-xl text-[10px]"
                                                    />
                                                    <StandardActionButton
                                                        onClick={() => setExpandedExamId(null)}
                                                        variant="ghost"
                                                        icon={X}
                                                        iconOnly
                                                        tooltip="Close"
                                                        className="h-10 w-10 rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {analytics.academics.examHistory.find((e: any) => e.id === expandedExamId)?.subjects.map((sub: any, sIdx: number) => (
                                                    <div key={sIdx} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <span className="text-xs font-bold text-zinc-900">{sub.name}</span>
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-lg text-[10px] font-black",
                                                                sub.grade.includes('A') ? "bg-emerald-50 text-emerald-600" :
                                                                    sub.grade.includes('B') ? "bg-blue-50 text-blue-600" :
                                                                        sub.grade.includes('C') ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                                                            )}>
                                                                {sub.grade}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Marks</p>
                                                                <p className="text-lg font-black text-zinc-900">{sub.marks}<span className="text-xs text-zinc-300 font-bold ml-1">/ {sub.maxMarks}</span></p>
                                                            </div>
                                                            <div className="h-12 w-12 rounded-full border-4 border-zinc-50 flex items-center justify-center text-[10px] font-black text-zinc-400 relative">
                                                                {Math.round((sub.marks / sub.maxMarks) * 100)}%
                                                                <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] rotate-[-90deg]">
                                                                    <circle
                                                                        cx="28" cy="28" r="24"
                                                                        fill="transparent"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                        strokeDasharray={`${(sub.marks / sub.maxMarks) * 150} 150`}
                                                                        className="text-brand opacity-20"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <AlertCircle className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
                                    <p className="text-zinc-400 font-bold">No exam results synced yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "library" && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-zinc-900">Library History</h3>
                            <p className="text-sm font-medium text-zinc-500 mt-1">Book borrowing and return records.</p>
                        </div>

                        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Book Information</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Issued Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {libraryTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-zinc-900">{tx.book?.title || "Unknown Title"}</div>
                                                <div className="text-xs text-zinc-500">{tx.book?.author || "Unknown Author"}</div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-zinc-700">
                                                {new Date(tx.issuedDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    tx.status === "ISSUED" ? "bg-amber-100 text-amber-600" :
                                                        tx.status === "RETURNED" ? "bg-emerald-100 text-emerald-600" :
                                                            "bg-zinc-100 text-zinc-500"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-red-600">
                                                {tx.fineAmount > 0 ? getCurrencySymbol(student.school?.currency) + tx.fineAmount : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                    {libraryTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <BookOpen className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
                                                <p className="text-zinc-400 font-bold">No library history found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "fees" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-zinc-900">Fee History</h2>
                        </div>

                        {/* Fee Stats Dashboard */}
                        {(() => {
                            const stats = {
                                total: fees.reduce((acc, fee) => acc + fee.amount, 0),
                                collected: fees.reduce((acc, fee) => acc + (fee.payments?.reduce((pAcc: number, p: any) => pAcc + p.amount, 0) || 0), 0),
                                pending: 0,
                                overdue: 0
                            };
                            stats.pending = stats.total - stats.collected;

                            fees.forEach(fee => {
                                const paid = fee.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
                                if (paid < fee.amount && new Date(fee.dueDate) < new Date()) {
                                    stats.overdue += (fee.amount - paid);
                                }
                            });

                            return (
                                <Fragment>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Total Invoiced</p>
                                            <p className="text-2xl font-black text-zinc-900">{getCurrencySymbol(student.school?.currency)}{stats.total.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm">
                                            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-2">Collected</p>
                                            <p className="text-2xl font-black text-emerald-600">{getCurrencySymbol(student.school?.currency)}{stats.collected.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Pending</p>
                                            <p className="text-2xl font-black text-zinc-900">{getCurrencySymbol(student.school?.currency)}{stats.pending.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm">
                                            <p className="text-[10px] font-black text-red-600/60 uppercase tracking-widest mb-2">Overdue</p>
                                            <p className="text-2xl font-black text-red-600">{getCurrencySymbol(student.school?.currency)}{stats.overdue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </Fragment>
                            );
                        })()}

                        {/* Organized Fee Tables by Academic Year */}
                        {(() => {
                            const groupedFees: Record<string, any[]> = {};
                            const yearToClassMap: Record<string, string> = {};

                            fees.forEach(fee => {
                                const yearName = fee.academicYear?.name || "Other";
                                if (!groupedFees[yearName]) groupedFees[yearName] = [];
                                groupedFees[yearName].push(fee);

                                if (fee.academicYearId && !yearToClassMap[yearName]) {
                                    const isCurrentYear = (student.school?.currentAcademicYear === yearName);
                                    const isPromotedYear = (student.promotedToClassroom?.academicYearId === fee.academicYearId);

                                    if (student.classroom?.academicYearId === fee.academicYearId || isCurrentYear) {
                                        yearToClassMap[yearName] = student.classroom?.name;
                                    } else if (isPromotedYear) {
                                        yearToClassMap[yearName] = student.promotedToClassroom?.name;
                                    } else if (classrooms) {
                                        // Final fallback: Look for a classroom assigned to this student in this academic year
                                        const found = classrooms.find((c: any) => c.academicYearId === fee.academicYearId);
                                        if (found) yearToClassMap[yearName] = found.name;
                                    }
                                }
                            });

                            const sortedYears = Object.keys(groupedFees).sort((a, b) => b.localeCompare(a)); // Descending

                            if (fees.length === 0) {
                                return (
                                    <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl py-20 text-center">
                                        <Briefcase className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
                                        <p className="text-zinc-400 font-bold">No invoices generated yet.</p>
                                    </div>
                                );
                            }

                            return (
                                <Fragment>
                                    {sortedYears.map(year => (
                                        <div key={year} className="space-y-4">
                                            <div className="flex items-center justify-between px-2 mt-8 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-5 w-5 text-brand" />
                                                    <h3 className="text-lg font-black text-zinc-900">
                                                        Academic Year {year}
                                                        {yearToClassMap[year] && (
                                                            <span className="text-zinc-400 font-bold ml-2">({yearToClassMap[year]})</span>
                                                        )}
                                                    </h3>
                                                </div>
                                                {year === sortedYears[0] && (
                                                    <button
                                                        onClick={() => {
                                                            toast.promise(loadData(false, true), {
                                                                loading: 'Resetting and syncing fees...',
                                                                success: 'Fees reset successfully!',
                                                                error: 'Failed to sync fees.'
                                                            });
                                                        }}
                                                        disabled={isLoading}
                                                        className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline flex items-center gap-1"
                                                    >
                                                        <Plus className="h-3 w-3" /> Sync Now
                                                    </button>
                                                )}
                                            </div>

                                            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-xl overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                                        <tr>
                                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice Details</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Paid</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Balance</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-50">
                                                        {groupedFees[year].map((fee) => {
                                                            const totalPaid = fee.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
                                                            const balance = fee.amount - totalPaid;
                                                            const isOverdue = balance > 0 && new Date(fee.dueDate) < new Date();

                                                            return (
                                                                <Fragment key={fee.id}>
                                                                    <tr className="hover:bg-zinc-50/50 transition-all group">
                                                                        <td className="px-8 py-6">
                                                                            <div className="font-bold text-zinc-900 text-base">{fee.title}</div>
                                                                            <div className="text-[10px] text-zinc-400 font-bold mt-1">Due {new Date(fee.dueDate).toLocaleDateString()}</div>
                                                                        </td>
                                                                        <td className="px-8 py-6">
                                                                            <span className={cn(
                                                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                                                fee.status === 'PAID' ? "bg-emerald-100 text-emerald-700" :
                                                                                    fee.status === 'PARTIAL' ? "bg-blue-100 text-blue-700" :
                                                                                        isOverdue ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-500"
                                                                            )}>
                                                                                {isOverdue && fee.status !== 'PAID' ? 'OVERDUE' : fee.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-8 py-6 text-sm font-bold text-zinc-900">
                                                                            {getCurrencySymbol(student.school?.currency)}{fee.amount.toLocaleString()}
                                                                        </td>
                                                                        <td className="px-8 py-6 text-sm font-bold text-emerald-600">
                                                                            {getCurrencySymbol(student.school?.currency)}{totalPaid.toLocaleString()}
                                                                        </td>
                                                                        <td className="px-8 py-6 text-sm font-bold text-zinc-500">
                                                                            {getCurrencySymbol(student.school?.currency)}{balance.toLocaleString()}
                                                                        </td>
                                                                        <td className="px-8 py-6 text-right">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                {fee.status !== 'PAID' && (
                                                                                    <StandardActionButton
                                                                                        onClick={() => {
                                                                                            setSelectedFee(fee);
                                                                                            setIsPayFeeOpen(true);
                                                                                        }}
                                                                                        variant="view"
                                                                                        label="Pay"
                                                                                        className="h-9 px-4 rounded-xl text-[10px]"
                                                                                    />
                                                                                )}
                                                                                <StandardActionButton
                                                                                    onClick={async () => {
                                                                                        const confirmed = await confirmDialog({
                                                                                            title: "Delete Invoice",
                                                                                            message: "Are you sure you want to delete this invoice?",
                                                                                            variant: "danger",
                                                                                            confirmText: "Delete",
                                                                                            cancelText: "Cancel"
                                                                                        });

                                                                                        if (!confirmed) return;

                                                                                        const res = await deleteFeeAction(fee.id);
                                                                                        if (res.success) {
                                                                                            toast.success("Invoice deleted");
                                                                                            loadData(true);
                                                                                        } else {
                                                                                            toast.error(res.error || "Failed to delete");
                                                                                        }
                                                                                    }}
                                                                                    variant="delete"
                                                                                    icon={X}
                                                                                    iconOnly
                                                                                    tooltip="Delete Invoice"
                                                                                    className="h-9 w-9 rounded-xl"
                                                                                    permission={{ module: 'fees', action: 'delete' }}
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                    {fee.payments && fee.payments.length > 0 && (
                                                                        <tr className="bg-zinc-50/30">
                                                                            <td colSpan={6} className="px-8 py-4">
                                                                                <div className="pl-4 border-l-2 border-zinc-200">
                                                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Payment History</p>
                                                                                    <div className="space-y-2">
                                                                                        {fee.payments.map((payment: any) => (
                                                                                            <div key={payment.id} className="flex items-center justify-between text-[10px]">
                                                                                                <div className="flex items-center gap-4">
                                                                                                    <span className="font-bold text-zinc-700 w-20">{new Date(payment.date || payment.createdAt).toLocaleDateString()}</span>
                                                                                                    <span className="font-bold text-zinc-400 w-20">{payment.method}</span>
                                                                                                    {payment.reference && (
                                                                                                        <span className="font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded italic">
                                                                                                            ref: {payment.reference}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                                <span className="font-black text-emerald-600">
                                                                                                    + {getCurrencySymbol(student.school?.currency)}{payment.amount.toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </Fragment>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </Fragment>
                            );
                        })()}
                    </div>
                )}

                {activeTab === "progress" && (
                    <StudentProgressTab schoolSlug={slug} studentId={id} />
                )}

                {activeTab === "health" && (
                    <HealthRecordManager studentId={id} slug={slug} />
                )}

                {isAddAttendanceOpen && (
                    <AttendanceDialog
                        onClose={() => {
                            setIsAddAttendanceOpen(false);
                            setAttendanceModalInitialData(undefined);
                        }}
                        studentId={id}
                        academicYearId={getCookie(`academic_year_${slug}`) || undefined}
                        onSuccess={() => {
                            loadData(true);
                            setIsAddAttendanceOpen(false);
                            setAttendanceModalInitialData(undefined);
                        }}
                        initialData={attendanceModalInitialData}
                        timezone={student?.school?.timezone}
                    />
                )}
                {isAddReportOpen && (
                    <ReportCardDialog
                        slug={slug}
                        studentId={id}
                        academicYearId={getCookie(`academic_year_${slug}`) || undefined}
                        isOpen={isAddReportOpen}
                        onClose={() => setIsAddReportOpen(false)}
                        onSuccess={() => {
                            loadData(true);
                            setIsAddReportOpen(false);
                        }}
                    />
                )}
                {isCreateFeeOpen && (
                    <CreateFeeDialog
                        slug={slug}
                        studentId={id}
                        academicYearId={getCookie(`academic_year_${slug}`) || undefined}
                        isOpen={isCreateFeeOpen}
                        onClose={() => setIsCreateFeeOpen(false)}
                        onSuccess={() => {
                            loadData(true);
                            setIsCreateFeeOpen(false);
                        }}
                        currency={student.school?.currency}
                    />
                )}
                {isPayFeeOpen && selectedFee && (
                    <PayFeeDialog
                        fee={selectedFee}
                        isOpen={isPayFeeOpen}
                        onClose={() => {
                            setIsPayFeeOpen(false);
                            setSelectedFee(null);
                        }}
                        onSuccess={() => {
                            loadData(true);
                            setIsPayFeeOpen(false);
                            setSelectedFee(null);
                        }}
                        currency={student.school?.currency}
                    />
                )}
                {isConnectSiblingOpen && (
                    <ConnectSiblingDialog
                        slug={slug}
                        studentId={id}
                        currentParentPhone={student.parentMobile}
                        isOpen={isConnectSiblingOpen}
                        onClose={() => setIsConnectSiblingOpen(false)}
                        onSuccess={() => {
                            loadData(true);
                            setIsConnectSiblingOpen(false);
                        }}
                    />
                )}

                {/* Hidden Printable Report for Sync */}
                <div className="hidden">
                    {student && analytics && (
                        <PrintableReport
                            ref={reportRef}
                            student={student}
                            school={student.school}
                            analytics={analytics}
                        />
                    )}
                    {student && analytics && expandedExamId && (
                        <PrintableReport
                            ref={testReportRef}
                            student={student}
                            school={student.school}
                            analytics={analytics}
                            selectedExamId={expandedExamId}
                        />
                    )}
                </div>
            </div>
        </div >
    );
}
