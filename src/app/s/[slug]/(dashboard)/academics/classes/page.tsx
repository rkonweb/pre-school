"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Plus, Search, BookOpen, Edit3, Trash2, User, School, Calendar, MapPin, LayoutGrid, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getClassroomsAction, deleteClassroomAction } from "@/app/actions/classroom-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { SectionHeader, Btn, tableStyles } from "@/components/ui/erp-ui";

export default function ClassesPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();

    const [isLoading, setIsLoading] = useState(true);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => { loadData(); }, []);

    async function loadData(showLoading = true) {
        if (showLoading) setIsLoading(true);
        try {
            const classesRes = await getClassroomsAction(slug);
            if (classesRes.success) { setClassrooms(classesRes.data || []); }
            else { toast.error("Failed to load classes"); }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }

    const filteredClasses = (classrooms || []).filter(c =>
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.teacher?.firstName || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({ title: "Delete Class", message: "Are you sure you want to delete this class? This cannot be undone.", variant: "danger", confirmText: "Delete", cancelText: "Cancel" });
        if (!confirmed) return;
        try {
            const res = await deleteClassroomAction(slug, id);
            if (res.success) { toast.success("Class deleted"); loadData(false); }
            else { toast.error(res.error || "Failed to delete"); }
        } catch (e) { toast.error("Delete failed"); }
    };

    const stats = [
        { label: "Total Classes", value: classrooms.length, icon: School, bg: "rgba(245,158,11,0.1)", iconColor: "#F59E0B" },
        { label: "Total Students", value: classrooms.reduce((acc, c) => acc + (c._count?.students || 0), 0), icon: Users, bg: "#ECFDF5", iconColor: "#059669" },
        { label: "Teachers Assigned", value: classrooms.filter(c => c.teacherId).length, icon: User, bg: "#F5F3FF", iconColor: "#7C3AED" },
        { label: "Total Capacity", value: classrooms.reduce((acc, c) => acc + (c.capacity || 0), 0), icon: LayoutGrid, bg: "#FFF7ED", iconColor: "#EA580C" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}>
            <SectionHeader
                title="Classes & Sections"
                subtitle="Manage academic hierarchy, class teachers, and timetables."
                icon={School}
                action={
                    <div style={{ display: "flex", gap: 10 }}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button title="More options" style={{ height: 42, padding: "0 14px", background: "white", border: "1.5px solid #E5E7EB", borderRadius: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#374151" }}>
                                    <MoreHorizontal style={{ width: 16, height: 16 }} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                <DropdownMenuItem onClick={() => router.push(`/s/${slug}/staff`)} className="flex items-center gap-2"><User className="h-4 w-4" /> Manage Staff</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/s/${slug}/academics/timetable`)} className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Timetables</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Btn variant="primary" icon={Plus} onClick={() => router.push(`/s/${slug}/academics/classes/create`)}>New Class</Btn>
                    </div>
                }
            />

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                {stats.map(stat => (
                    <div key={stat.label} style={{ background: "white", borderRadius: 20, border: "1.5px solid #F3F4F6", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 14, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <stat.icon style={{ width: 22, height: 22, color: stat.iconColor }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: "#18181B", lineHeight: 1.1 }}>{stat.value}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative", maxWidth: 420 }}>
                <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9CA3AF" }} />
                <input
                    type="text"
                    placeholder="Search classes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: "100%", height: 48, paddingLeft: 42, paddingRight: 16, background: "white", borderRadius: 14, border: "1.5px solid #E5E7EB", fontSize: 14, fontWeight: 600, color: "#374151", outline: "none", boxSizing: "border-box" }}
                />
            </div>

            {/* Table */}
            <div style={tableStyles.container}>
                {isLoading ? (
                    <div style={{ padding: 40 }}><DashboardLoader message="Loading academic classes..." /></div>
                ) : filteredClasses.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={tableStyles.thead}>
                                <tr>
                                    {["Class Name", "Class Teacher", "Details", "Stats", "Actions"].map((h, i) => (
                                        <th key={h} style={{ ...tableStyles.thNoSort, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map((item, i) => (
                                    <tr
                                        key={item.id}
                                        style={i % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                        onMouseEnter={e => { (e.currentTarget).style.background = "#FFFBEB"; }}
                                        onMouseLeave={e => { (e.currentTarget).style.background = i % 2 === 0 ? "white" : "#F9FAFB"; }}
                                    >
                                        <td style={tableStyles.td}>
                                            <div style={{ fontWeight: 700, color: "#18181B", fontSize: 14 }}>{item.name}</div>
                                            {item.roomNumber && <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}><MapPin style={{ width: 11, height: 11 }} /> Room {item.roomNumber}</div>}
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F3F4F6", border: "1.5px solid #E5E7EB", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    {item.teacher?.avatar ? <img src={item.teacher.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Teacher" /> : <User style={{ width: 14, height: 14, color: "#9CA3AF" }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{item.teacher?.firstName ? `${item.teacher.firstName} ${item.teacher.lastName}` : "Not Assigned"}</div>
                                                    <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>{item.teacher?.email || "—"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><BookOpen style={{ width: 12, height: 12 }} /> {item.timetable ? "Timetable Set" : "No Timetable"}</div>
                                                <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><LayoutGrid style={{ width: 12, height: 12 }} /> Capacity: {item.capacity || "N/A"}</div>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Users style={{ width: 16, height: 16, color: "#9CA3AF" }} />
                                                <span style={{ fontWeight: 700, color: "#374151", fontSize: 14 }}>{item._count?.students || 0}</span>
                                                {item.capacity && <span style={{ fontSize: 11, color: "#9CA3AF" }}>/ {item.capacity}</span>}
                                            </div>
                                        </td>
                                        <td style={{ ...tableStyles.td, textAlign: "right" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                                                <button onClick={() => router.push(`/s/${slug}/academics/timetable`)} title="Manage Timetable" style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                                                    <Calendar style={{ width: 14, height: 14 }} />
                                                </button>
                                                <button onClick={() => router.push(`/s/${slug}/academics/classes/${item.id}/edit`)} title="Edit Class" style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                                                    <Edit3 style={{ width: 14, height: 14 }} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} title="Delete Class" style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #FCA5A5", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                                                    <Trash2 style={{ width: 14, height: 14 }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
                        {classrooms.length === 0 && !search ? (
                            <>
                                <School style={{ width: 56, height: 56, color: "#E5E7EB", marginBottom: 16 }} />
                                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#18181B", marginBottom: 8 }}>No classes found</h3>
                                <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500, maxWidth: 280, marginBottom: 24 }}>Get started by creating your first academic class section.</p>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <Btn variant="secondary" onClick={() => router.push(`/s/${slug}/staff`)}>Assign Staff First</Btn>
                                    <Btn variant="primary" icon={Plus} onClick={() => router.push(`/s/${slug}/academics/classes/create`)}>Create First Class</Btn>
                                </div>
                            </>
                        ) : (
                            <>
                                <Search style={{ width: 40, height: 40, color: "#E5E7EB", marginBottom: 12 }} />
                                <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 500 }}>No classes found matching your search.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
