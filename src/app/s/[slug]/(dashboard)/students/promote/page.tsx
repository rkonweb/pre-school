"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Users, AlertCircle, GraduationCap, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { getStudentsAction } from "@/app/actions/student-actions";
import { promoteStudentsAction } from "@/app/actions/student-promotion-actions";
import { StudentAvatar, cleanName } from "@/components/dashboard/students/StudentAvatar";
import { SectionHeader } from "@/components/ui/erp-ui";

export default function PromoteStudentsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPromoting, setIsPromoting] = useState(false);
    const [isStudentsLoading, setIsStudentsLoading] = useState(false);
    const [sourceClassId, setSourceClassId] = useState("");
    const [targetClassId, setTargetClassId] = useState("");
    const [targetYearId, setTargetYearId] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

    const yearOptions = useMemo(() => {
        if (academicYears.length === 0) return [];
        const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
        const options = [...academicYears];
        try {
            const parts = currentYear.name.split("-");
            if (parts.length === 2) {
                const nextYearName = `${parseInt(parts[0]) + 1}-${parseInt(parts[1]) + 1}`;
                if (!academicYears.find(y => y.name === nextYearName)) {
                    options.push({ id: `NEW:${nextYearName}`, name: nextYearName, isCurrent: false, isNew: true });
                }
            }
        } catch (e) { }
        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [academicYears]);

    useEffect(() => {
        if (yearOptions.length > 0 && !targetYearId) {
            const nextYearOption = yearOptions.find(y => y.isNew);
            if (nextYearOption) { setTargetYearId(nextYearOption.id); }
            else {
                const current = academicYears.find(y => y.isCurrent);
                if (current) {
                    const parts = current.name.split("-");
                    if (parts.length === 2) {
                        const nextName = `${parseInt(parts[0]) + 1}-${parseInt(parts[1]) + 1}`;
                        const exist = yearOptions.find(y => y.name === nextName);
                        if (exist) setTargetYearId(exist.id);
                    }
                }
            }
        }
    }, [yearOptions, targetYearId]);

    useEffect(() => { loadData(); }, []);
    const loadData = async () => {
        setIsLoading(true);
        const [classesRes, yearsRes] = await Promise.all([getClassroomsAction(slug), getAcademicYearsAction(slug)]);
        if (classesRes.success) setClassrooms(classesRes.data || []);
        if (yearsRes.success) setAcademicYears(yearsRes.data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        if (sourceClassId) { loadStudents(); }
        else { setStudents([]); setSelectedStudents([]); }
    }, [sourceClassId]);

    const loadStudents = async () => {
        setIsStudentsLoading(true);
        const res = await getStudentsAction(slug, { filters: { class: classrooms.find(c => c.id === sourceClassId)?.name, status: "ACTIVE" }, limit: 200 });
        if (res.success) { setStudents(res.students || []); setSelectedStudents(res.students?.map((s: any) => s.id) || []); }
        setIsStudentsLoading(false);
    };

    const handlePromote = async () => {
        if (!targetClassId || !targetYearId || selectedStudents.length === 0) { toast.error("Please select a target class, year, and at least one student."); return; }
        setIsPromoting(true);
        try {
            const res = await promoteStudentsAction({ schoolSlug: slug, studentIds: selectedStudents, targetClassroomId: targetClassId, targetAcademicYearId: targetYearId });
            if (res.success) { toast.success(res.message); router.push(`/s/${slug}/students`); }
            else { toast.error(res.error || "Promotion failed"); }
        } catch (err: any) { toast.error("An unexpected error occurred during promotion."); }
        finally { setIsPromoting(false); }
    };

    const toggleSelectAll = () => {
        if (selectedStudents.length === students.length) { setSelectedStudents([]); }
        else { setSelectedStudents(students.map(s => s.id)); }
    };
    const toggleStudent = (id: string) => {
        if (selectedStudents.includes(id)) { setSelectedStudents(selectedStudents.filter(s => s !== id)); }
        else { setSelectedStudents([...selectedStudents, id]); }
    };

    const sel = { height: 44, borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", padding: "0 14px", fontSize: 14, fontWeight: 600, color: "#374151", outline: "none", width: "100%", cursor: "pointer" };
    const sourceClassName = classrooms.find(c => c.id === sourceClassId)?.name;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}>
            <SectionHeader
                title="Promote Students"
                subtitle="Move students to the next grade and prepare records for the upcoming academic year."
                icon={GraduationCap}
            />

            <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 24, alignItems: "start" }}>
                {/* LEFT: Config Panel */}
                <div style={{ background: "white", borderRadius: 22, border: "1.5px solid #E5E7EB", overflow: "hidden", position: "sticky", top: 80, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F3F4F6", background: "linear-gradient(135deg,#1E1B4B,#312E81)", display: "flex", alignItems: "center", gap: 10 }}>
                        <GraduationCap style={{ width: 20, height: 20, color: "#FDE68A" }} />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "white" }}>Promotion Settings</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Configure the move parameters</div>
                        </div>
                    </div>
                    <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
                        {/* From */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>FROM (Current Class)</label>
                            <select value={sourceClassId} onChange={e => setSourceClassId(e.target.value)} style={sel}>
                                <option value="">Select Source Class</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F9FAFB", border: "1.5px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ArrowRight style={{ width: 16, height: 16, color: "#6B7280", transform: "rotate(90deg)" }} />
                            </div>
                        </div>
                        {/* To */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>TO (Next Class)</label>
                            <select value={targetClassId} onChange={e => setTargetClassId(e.target.value)} style={sel}>
                                <option value="">Select Target Class</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={{ height: 1, background: "#F3F4F6" }} />
                        {/* Academic Year */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <label style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1 }}>Target Academic Year</label>
                                {targetYearId && targetYearId.startsWith("NEW:") && (
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "2px 8px" }}>New Year</span>
                                )}
                            </div>
                            <select value={targetYearId} onChange={e => setTargetYearId(e.target.value)} style={sel}>
                                <option value="">Select Year</option>
                                {yearOptions.map(y => <option key={y.id} value={y.id}>{y.name}{(y as any).isNew ? " (Create New)" : ""}</option>)}
                            </select>
                            <p style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>Students will be moved into this academic year.</p>
                        </div>
                        <StandardActionButton
                            onClick={handlePromote}
                            variant="primary"
                            icon={Users}
                            label={`Promote ${selectedStudents.length} Students`}
                            loading={isPromoting}
                            disabled={!targetClassId || !targetYearId || selectedStudents.length === 0}
                            className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-brand/20"
                            permission={{ module: 'students.profiles', action: 'edit' }}
                        />
                    </div>
                </div>

                {/* RIGHT: Students List */}
                <div style={{ background: "white", borderRadius: 22, border: "1.5px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ padding: "16px 22px", borderBottom: "1.5px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F9FAFB" }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 16, color: "#18181B" }}>Students List</div>
                            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                                {sourceClassId ? `Finding students in ${sourceClassName}` : "Select a source class to populate list"}
                            </div>
                        </div>
                        {students.length > 0 && (
                            <button onClick={toggleSelectAll} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#374151" }}>
                                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${selectedStudents.length === students.length ? "#F59E0B" : "#D1D5DB"}`, background: selectedStudents.length === students.length ? "#F59E0B" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {selectedStudents.length === students.length && <CheckCircle2 style={{ width: 11, height: 11, color: "white" }} />}
                                </div>
                                Select All ({selectedStudents.length})
                            </button>
                        )}
                    </div>
                    <div style={{ maxHeight: 500, overflowY: "auto" }}>
                        {isStudentsLoading ? (
                            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                                {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 56, background: "#F3F4F6", borderRadius: 14, animation: "pulse 1.5s ease-in-out infinite" }} />)}
                            </div>
                        ) : students.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
                                <div style={{ width: 56, height: 56, background: "#F3F4F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                    <Users style={{ width: 28, height: 28, color: "#D1D5DB" }} />
                                </div>
                                <div style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No students found</div>
                                <p style={{ fontSize: 13, color: "#9CA3AF", maxWidth: 300 }}>
                                    {sourceClassId ? "There are no active students in the selected source class." : "Please select a source class to view students."}
                                </p>
                            </div>
                        ) : students.map((student, i) => (
                            <div
                                key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", cursor: "pointer", borderBottom: "1px solid #F9FAFB", background: selectedStudents.includes(student.id) ? "rgba(245,158,11,0.04)" : "white", transition: "background 0.1s" }}
                                onMouseEnter={e => { if (!selectedStudents.includes(student.id)) (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = selectedStudents.includes(student.id) ? "rgba(245,158,11,0.04)" : "white"; }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div onClick={e => e.stopPropagation()} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${selectedStudents.includes(student.id) ? "#F59E0B" : "#D1D5DB"}`, background: selectedStudents.includes(student.id) ? "#F59E0B" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                                        onClick={(e) => { e.stopPropagation(); toggleStudent(student.id); }}>
                                        {selectedStudents.includes(student.id) && <CheckCircle2 style={{ width: 12, height: 12, color: "white" }} />}
                                    </div>
                                    <StudentAvatar src={student.avatar} name={student.name} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "#18181B" }}>{cleanName(student.name)}</div>
                                        <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Adm: {student.admissionNumber || "N/A"}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: "3px 10px" }}>Ready for Promotion</span>
                                    <ChevronRight style={{ width: 14, height: 14, color: "#D1D5DB" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
