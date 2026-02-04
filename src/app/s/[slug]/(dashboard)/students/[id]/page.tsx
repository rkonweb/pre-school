
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRolePermissions } from "@/hooks/useRolePermissions";
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
    BookOpen
} from "lucide-react";
import { cn, getCurrencySymbol } from "@/lib/utils";
import { getStudentAction, updateStudentAction, deleteStudentAction, searchStudentsAction, connectSiblingAction, disconnectSiblingAction } from "@/app/actions/student-actions";
import { getStudentLibraryHistoryAction } from "@/app/actions/library-actions";
import { getStudentAttendanceAction, markAttendanceAction } from "@/app/actions/attendance-actions";
import { getStudentReportsAction, createReportCardAction } from "@/app/actions/report-actions";
import { getStudentFeesAction, createFeeAction, recordPaymentAction, getFeeStructuresAction, deleteFeeAction, updateFeeAction } from "@/app/actions/fee-actions";
import { getFamilyStudentsAction } from "@/app/actions/parent-actions";
import { Trash2, Search } from "lucide-react";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";
import { AttendanceDialog } from "@/components/dashboard/students/AttendanceDialog";
import { ReportCardDialog } from "@/components/dashboard/students/ReportCardDialog";
import { CreateFeeDialog } from "@/components/dashboard/students/CreateFeeDialog";
import { ConnectSiblingDialog } from "@/components/dashboard/students/ConnectSiblingDialog";

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
            readOnly={readOnly}
            onChange={e => onChange(e.target.value)}
            className={cn(
                "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all outline-none focus:ring-2 focus:ring-zinc-200",
                readOnly ? "text-zinc-500 shadow-inner" : "text-zinc-900 border-2 border-zinc-100 bg-white"
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

    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [activeTab, setActiveTab] = useState<"profile" | "attendance" | "reports" | "fees" | "library">("profile");

    const [student, setStudent] = useState<any>(null);
    const [siblings, setSiblings] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [fees, setFees] = useState<any[]>([]);
    const [libraryTransactions, setLibraryTransactions] = useState<any[]>([]);

    const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);
    const [isAddReportOpen, setIsAddReportOpen] = useState(false);
    const [isCreateFeeOpen, setIsCreateFeeOpen] = useState(false);
    const [isConnectSiblingOpen, setIsConnectSiblingOpen] = useState(false);
    const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
    const [editingFee, setEditingFee] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, [id]);

    async function loadData(silent = false) {
        try {
            if (!silent) setIsLoading(true);

            const withTimeout = (p: Promise<any>, label: string) =>
                Promise.race([
                    p,
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), 10000))
                ]).catch(err => {
                    console.error(`${label} Error:`, err);
                    return { success: false, error: err.message };
                });

            const [studentRes, gradesRes, classroomsRes, attendanceRes, reportsRes, feesRes, sectionsRes] = await Promise.all([
                withTimeout(getStudentAction(id), "Student"),
                withTimeout(getMasterDataAction("GRADE", null), "Grades"),
                withTimeout(getClassroomsAction(slug), "Classrooms"),
                withTimeout(getStudentAttendanceAction(id), "Attendance"),
                withTimeout(getStudentReportsAction(id), "Reports"),
                withTimeout(getStudentFeesAction(id), "Fees"),
                withTimeout(getMasterDataAction("SECTION", null), "Sections"),
                withTimeout(getStudentLibraryHistoryAction(id), "Library")
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
            const libraryRes = await getStudentLibraryHistoryAction(id);
            setLibraryTransactions(libraryRes.success ? libraryRes.data || [] : []);

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
        if (!confirm("Delete student permanently?")) return;
        const res = await deleteStudentAction(slug, id);
        if (res.success) {
            toast.success("Student deleted");
            router.push(`/s/${slug}/students`);
        } else {
            toast.error(res.error || "Delete failed");
        }
    };

    const handleDisconnect = async (siblingId: string) => {
        if (!confirm("Are you sure you want to remove this sibling linkage?")) return;
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <p className="text-zinc-500 font-medium">Student not found or failed to load.</p>
                <button
                    onClick={() => router.push(`/s/${slug}/students`)}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium"
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
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {canEditProfile && (
                        <button
                            onClick={() => setMode(mode === "view" ? "edit" : "view")}
                            className={cn(
                                "h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all",
                                mode === "view" ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200" : "bg-zinc-100 text-zinc-600"
                            )}
                        >
                            {mode === "view" ? <Edit3 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            {mode === "view" ? "Edit Profile" : "Cancel"}
                        </button>
                    )}
                    {mode === "view" && canDeleteProfile && (
                        <button
                            onClick={handleDelete}
                            className="h-12 w-12 rounded-2xl border-2 border-red-50 text-red-500 flex items-center justify-center hover:bg-red-50 transition-all"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-zinc-100 rounded-[28px] w-full max-w-2xl overflow-x-auto">
                {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "attendance", label: "Attendance", icon: Activity },
                    { id: "fees", label: "Fees", icon: Briefcase },
                    { id: "reports", label: "Reports", icon: ClipboardList },
                    { id: "progress", label: "Progress", icon: TrendingUp },
                    { id: "library", label: "Library", icon: BookOpen } // Imported BookOpen or use Book
                ].map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (tab.id === 'progress') {
                                router.push(`/s/${slug}/students/${id}/progress`);
                            } else {
                                setActiveTab(tab.id as any);
                            }
                        }}
                        className={cn(
                            "flex-1 min-w-[100px] py-3.5 rounded-[22px] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
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
                                                "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all",
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
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Status</label>
                                            <select
                                                value={student.status || "ACTIVE"}
                                                onChange={e => setStudent({ ...student, status: e.target.value })}
                                                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-200"
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                                <option value="ABSENT">Absent</option>
                                            </select>
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
                                                "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all",
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

                            {!isReadOnly && canEditProfile && (
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                    Save Profile changes
                                </button>
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
                                            className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm appearance-none"
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
                                            className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm appearance-none"
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

                            {/* Parent Connectivity */}
                            <div className="bg-zinc-900 rounded-[40px] p-8 text-white shadow-2xl shadow-zinc-200">
                                <SectionTitle icon={Users} title="Guardian connectivity" light />
                                <div className="mt-8 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Primary Guardian</p>
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
                                            <Mail className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <p className="text-xs font-bold">{student.parentEmail || "No email linked"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sibling Connections */}
                            <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <div className="flex items-center justify-between mb-6">
                                    <SectionTitle icon={Users} title="Siblings" />
                                    {canEditProfile && (
                                        <button
                                            type="button"
                                            onClick={() => setIsConnectSiblingOpen(true)}
                                            className="text-[10px] font-black bg-zinc-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="h-3 w-3" /> Connect
                                        </button>
                                    )}
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
                                            {canEditProfile && (
                                                <button
                                                    onClick={() => handleDisconnect(sib.id)}
                                                    className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Unlink Sibling"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900">Attendance Log</h3>
                                <p className="text-sm font-medium text-zinc-500 mt-1">Daily records for current academic term.</p>
                            </div>
                            {canAttendance && (
                                <button
                                    onClick={() => setIsAddAttendanceOpen(true)}
                                    className="h-12 px-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    Mark Attendance
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Notes</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {attendance.map((record) => (
                                        <tr key={record.id} className="group hover:bg-zinc-50/50 transition-all">
                                            <td className="px-8 py-6 text-sm font-bold text-zinc-700">
                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    record.status === "PRESENT" ? "bg-emerald-100 text-emerald-600" :
                                                        record.status === "ABSENT" ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
                                                )}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-zinc-500 font-medium">{record.notes || "—"}</td>
                                            <td className="px-8 py-6 text-right">
                                                {canAttendance && (
                                                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all">
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {attendance.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <Activity className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
                                                <p className="text-zinc-400 font-bold">No attendance records found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "reports" && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900">Progress Reports</h3>
                                <p className="text-sm font-medium text-zinc-500 mt-1">Holistic academic and developmental assessment.</p>
                            </div>
                            {canReports && (
                                <button
                                    onClick={() => setIsAddReportOpen(true)}
                                    className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Report
                                </button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {reports.map((report) => (
                                <div key={report.id} className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20 group hover:scale-[1.01] transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                <Trophy className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-zinc-900">{report.term}</h4>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Generated {new Date(report.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 opacity-0 group-hover:opacity-100 transition-all">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-4 mb-8">
                                        {Object.entries(report.marks).map(([subject, grade]: any) => (
                                            <div key={subject} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                                                <span className="text-xs font-bold text-zinc-700">{subject}</span>
                                                <span className="text-xs font-black text-blue-600 px-3 py-1 bg-white rounded-xl shadow-sm">{grade}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-5 bg-blue-50/50 rounded-[28px] border border-blue-100/50">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Educator Comments</p>
                                        <p className="text-xs font-medium text-blue-900 italic leading-relaxed">"{report.comments}"</p>
                                    </div>
                                </div>
                            ))}
                            {reports.length === 0 && (
                                <div className="md:col-span-2 bg-white rounded-[40px] border border-zinc-100 p-20 text-center">
                                    <ClipboardList className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                                    <p className="text-zinc-400 font-bold">No progress reports published yet.</p>
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
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900">Tuition & Billing</h3>
                                <p className="text-sm font-medium text-zinc-500 mt-1">Manage invoices and track payments.</p>
                            </div>
                            {canFees && (
                                <button
                                    onClick={() => setIsCreateFeeOpen(true)}
                                    className="h-12 px-6 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Invoice
                                </button>
                            )}
                        </div>

                        <div className="grid gap-6">
                            {fees.map((fee) => (
                                <div key={fee.id} className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "h-14 w-14 rounded-2xl flex items-center justify-center border-2",
                                                fee.status === "PAID" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                                    fee.status === "PENDING" ? "bg-amber-50 border-amber-100 text-amber-600" :
                                                        "bg-zinc-50 border-zinc-100 text-zinc-400"
                                            )}>
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-zinc-900">{fee.title}</h4>
                                                {fee.description && (
                                                    <div className="mt-2 text-xs text-zinc-500 font-bold whitespace-pre-wrap leading-relaxed border-l-2 border-zinc-200 pl-3">
                                                        {fee.description}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-xs font-bold text-zinc-400">Due {new Date(fee.dueDate).toLocaleDateString()}</p>
                                                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        fee.status === "PAID" ? "text-emerald-500" :
                                                            fee.status === "PENDING" ? "text-amber-500" :
                                                                "text-zinc-400"
                                                    )}>{fee.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="text-xl font-black text-zinc-900">{getCurrencySymbol(student.school?.currency)}{fee.amount.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {fee.status !== "PAID" && (
                                                    <button
                                                        onClick={() => setSelectedFeeId(fee.id)}
                                                        className="h-12 px-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-200"
                                                    >
                                                        Pay
                                                    </button>
                                                )}
                                                {canFees && (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingFee(fee)}
                                                            className="h-12 w-12 bg-zinc-100 text-zinc-600 rounded-2xl flex items-center justify-center hover:bg-zinc-200 transition-all"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm("Are you sure you want to delete this invoice?")) {
                                                                    const res = await deleteFeeAction(fee.id);
                                                                    if (res.success) {
                                                                        toast.success("Invoice deleted");
                                                                        loadData(true);
                                                                    } else {
                                                                        toast.error(res.error || "Failed to delete");
                                                                    }
                                                                }
                                                            }}
                                                            className="h-12 w-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {fee.payments && fee.payments.length > 0 && (
                                        <div className="mt-8 pt-6 border-t border-dashed border-zinc-200">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Payment History</p>
                                            <div className="space-y-3">
                                                {fee.payments.map((payment: any) => (
                                                    <div key={payment.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-zinc-400 shadow-sm">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-zinc-900">Payment Received</p>
                                                                <p className="text-[10px] font-bold text-zinc-400">{new Date(payment.date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-black text-zinc-900">+ {getCurrencySymbol(student.school?.currency)}{payment.amount.toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {fees.length === 0 && (
                                <div className="bg-white rounded-[40px] border border-zinc-100 p-20 text-center">
                                    <Briefcase className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                                    <p className="text-zinc-400 font-bold">No invoices generated yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Injected the overlays here */}
            {isAddAttendanceOpen && (
                <AttendanceDialog
                    onClose={() => setIsAddAttendanceOpen(false)}
                    studentId={id}
                    onSuccess={() => {
                        loadData(true);
                        setIsAddAttendanceOpen(false);
                    }}
                />
            )}
            {isAddReportOpen && (
                <ReportCardDialog
                    slug={slug}
                    studentId={id}
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
                    isOpen={isCreateFeeOpen}
                    onClose={() => setIsCreateFeeOpen(false)}
                    onSuccess={() => {
                        loadData(true);
                        setIsCreateFeeOpen(false);
                    }}
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
        </div>
    );
}
