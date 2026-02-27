"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, FileUp, Trash2, Edit3, X, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";
import { cn } from "@/lib/utils";
import { updateStudentAvatarAction, deleteStudentAction } from "@/app/actions/student-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import dynamic from "next/dynamic";

const IssueTCDialog = dynamic(() => import("@/components/dashboard/students/IssueTCDialog").then(m => m.IssueTCDialog), { ssr: false });
const PromoteStudentDialog = dynamic(() => import("@/components/dashboard/students/PromoteStudentDialog").then(m => m.PromoteStudentDialog), { ssr: false });

interface StudentProfileHeaderProps {
    student: any;
    slug: string;
    id: string;
}

export function StudentProfileHeader({ student: initialStudent, slug, id }: StudentProfileHeaderProps) {
    const router = useRouter();
    const { confirm: confirmDialog } = useConfirm();
    const [student, setStudent] = useState(initialStudent);
    const [isIssueTCOpen, setIsIssueTCOpen] = useState(false);
    const [isPromoteOpen, setIsPromoteOpen] = useState(false);

    const handleDelete = async () => {
        const confirmed = await confirmDialog({
            title: "Delete Student",
            message: "Are you sure you want to delete this student? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await deleteStudentAction(slug, id);
        if (res.success) {
            toast.success("Student deleted successfully");
            router.push(`/s/${slug}/students`);
        } else {
            toast.error(res.error || "Failed to delete student");
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.push(`/s/${slug}/students`)}
                    title="Back to Students"
                    className="h-12 w-12 rounded-2xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-500" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <StudentAvatar
                            src={student.avatar}
                            name={`${student.firstName} ${student.lastName}`}
                            className="h-16 w-16 rounded-[24px] shadow-lg border-2 border-white"
                        />
                        <label
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[24px] cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                            title="Change student photo"
                        >
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                title="Change student photo"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const tempUrl = URL.createObjectURL(file);
                                    setStudent({ ...student, avatar: tempUrl });
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    try {
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
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
                            {cleanName(student.firstName)} {cleanName(student.lastName)}
                        </h1>
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
                    onClick={() => setIsPromoteOpen(true)}
                    variant="secondary"
                    icon={GraduationCap}
                    label="Promote"
                    permission={{ module: 'students.profiles', action: 'edit' }}
                />
                <StandardActionButton
                    onClick={() => setIsIssueTCOpen(true)}
                    variant="secondary"
                    icon={FileUp}
                    label="Issue TC"
                    permission={{ module: 'students.profiles', action: 'edit' }}
                />
                <StandardActionButton
                    onClick={handleDelete}
                    variant="delete"
                    icon={Trash2}
                    iconOnly
                    label="Delete Student"
                    tooltip="Delete Student"
                    permission={{ module: 'students.profiles', action: 'delete' }}
                />
            </div>

            {isPromoteOpen && (
                <PromoteStudentDialog
                    open={isPromoteOpen}
                    onOpenChange={setIsPromoteOpen}
                    studentId={id}
                    studentName={`${student.firstName} ${student.lastName}`}
                    schoolSlug={slug}
                    currentClassroom={student.classroom?.name}
                    currentGrade={student.grade}
                />
            )}

            {isIssueTCOpen && (
                <IssueTCDialog
                    open={isIssueTCOpen}
                    onOpenChange={setIsIssueTCOpen}
                    studentId={id}
                    studentName={`${student.firstName} ${student.lastName}`}
                    schoolSlug={slug}
                />
            )}
        </div>
    );
}
