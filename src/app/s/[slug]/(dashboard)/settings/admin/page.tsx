"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { getSchoolAdminsAction, createAdminAction, updateAdminAction, deleteAdminAction, toggleAdminStatusAction } from "@/app/actions/admin-actions";
import {
    ShieldCheck, Plus, User, Mail, Phone, X,
    Edit2, Trash2, Power, UserPlus, Check, AlertTriangle,
    Building2, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/contexts/ConfirmContext";
import { SettingsLoader } from "@/components/dashboard/settings/SettingsPageHeader";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "var(--brand-color, #F59E0B)", 
    amberD: "var(--brand-color, #D97706)", 
    amberL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.12)", 
    amberXL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.05)",
    navy: "#1E1B4B", navyM: "#312E81",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redD: "#DC2626", redL: "#FEE2E2", redXL: "#FEF2F2",
    blue: "#3B82F6", blueL: "#DBEAFE",
    orange: "#F97316",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    shM: "0 8px 32px rgba(0,0,0,0.12)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

const AVATAR_COLORS = [C.amber, C.green, C.blue, "#8B5CF6", "#EC4899", "#14B8A6", C.orange];

// ─── RIPPLE BUTTON ─────────────────────────────────────────
function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick, fullWidth, type = "button" }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<HTMLButtonElement>(null);
    const vs: any = {
        primary: { bg: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", sh: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)" },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
        danger: { bg: `linear-gradient(135deg,${C.red},${C.redD})`, color: "white", sh: `0 4px 14px ${C.red}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        navy: { bg: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "var(--secondary-color, white)", sh: `0 4px 14px ${C.navy}40` },
        ghost: { bg: "transparent", color: C.g500, sh: "none" },
    };
    const ss: any = { sm: { p: "7px 14px", fs: 12, r: 9 }, md: { p: "10px 20px", fs: 13.5, r: 12 }, lg: { p: "13px 28px", fs: 15, r: 14 } };
    const v = vs[variant] || vs.primary; const s = ss[size];
    const dis = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (dis) return;
        const rect = ref.current!.getBoundingClientRect();
        const id = Date.now();
        setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
        onClick?.();
    };

    return (
        <button ref={ref} type={type} disabled={dis} onClick={handleClick}
            onMouseEnter={e => { if (!dis) { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; } }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", width: fullWidth ? "100%" : "auto", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1, position: "relative", overflow: "hidden" }}>
            {ripples.map(rp => <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "ripple 0.6s ease forwards", marginLeft: -4, marginTop: -4, pointerEvents: "none" }} />)}
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTop: `2px solid ${v.color}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

// ─── FIELD INPUT ───────────────────────────────────────────
function FInput({ label, type = "text", value, onChange, placeholder, required, icon: Icon }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ width: "100%" }}>
            {label && (
                <label style={{ fontSize: 11.5, fontWeight: 700, color: C.g500, display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {label}{required && <span style={{ color: C.red }}> *</span>}
                </label>
            )}
            <div style={{ position: "relative", display: "flex", alignItems: "center", background: focused ? C.amberXL : C.g50, border: `1.5px solid ${focused ? C.amber : C.g200}`, borderRadius: 12, transition: C.tr, boxShadow: focused ? `0 0 0 4px ${C.amber}20` : "none", transform: focused ? "translateY(-1px)" : "none" }}>
                {Icon && <span style={{ padding: "0 0 0 13px", display: "flex" }}><Icon size={14} color={focused ? C.amber : C.g400} /></span>}
                <input type={type} placeholder={placeholder} value={value || ""} onChange={onChange} required={required}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: "11px 14px", fontSize: 13.5, color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, paddingLeft: Icon ? 8 : undefined }} />
            </div>
        </div>
    );
}

// ─── ICON ACTION BUTTON ────────────────────────────────────
function IconBtn({ icon: Icon, hoverColor = C.amber, hoverBg = C.amberL, onClick, title }: any) {
    const [hovered, setHovered] = useState(false);
    return (
        <button onClick={onClick} title={title}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${hovered ? hoverColor + "60" : C.g200}`, background: hovered ? hoverBg : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: C.tr, transform: hovered ? "scale(1.08)" : "scale(1)" }}>
            <Icon size={14} color={hovered ? hoverColor : C.g400} strokeWidth={2.2} />
        </button>
    );
}

// ─── MODAL WRAPPER ─────────────────────────────────────────
function Modal({ isOpen, onClose, children }: any) {
    if (!isOpen) return null;
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,0.65)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", padding: 20, animation: "fadeIn 0.2s ease" }}
            onClick={onClose}>
            <div style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 500, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "scaleIn 0.3s ease" }}
                onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

// ─── ADMIN FORM CONTENT ────────────────────────────────────
function AdminForm({ title, sub, formData, setFormData, onSubmit, onClose, isSubmitting, showMobile = false }: any) {
    return (
        <>
            {/* Modal Header */}
            <div style={{ padding: "22px 26px 18px", borderBottom: `1px solid ${C.g100}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: `linear-gradient(135deg,${C.navy},${C.navyM})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${C.navy}40` }}>
                        <UserPlus size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: C.navy }}>{title}</div>
                        <div style={{ fontSize: 12.5, color: C.g400, marginTop: 2 }}>{sub}</div>
                    </div>
                </div>
                <button onClick={onClose}
                    style={{ width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${C.g200}`, background: C.g50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={14} color={C.g500} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit}>
                <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <FInput label="First Name" placeholder="e.g. Priya" value={formData.firstName} required icon={User}
                            onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} />
                        <FInput label="Last Name" placeholder="e.g. Sharma" value={formData.lastName} required icon={User}
                            onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                    {showMobile && (
                        <FInput label="Mobile" type="tel" placeholder="10-digit number" value={formData.mobile} required icon={Phone}
                            onChange={(e: any) => setFormData({ ...formData, mobile: e.target.value })} />
                    )}
                    <FInput label="Email" type="email" placeholder="admin@school.edu" value={formData.email} icon={Mail}
                        onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <FInput label="Designation" placeholder="e.g. Vice Principal" value={formData.designation} icon={Lock}
                            onChange={(e: any) => setFormData({ ...formData, designation: e.target.value })} />
                        <FInput label="Department" placeholder="e.g. Administration" value={formData.department} icon={Building2}
                            onChange={(e: any) => setFormData({ ...formData, department: e.target.value })} />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: "16px 26px", borderTop: `1px solid ${C.g100}`, display: "flex", gap: 10, justifyContent: "flex-end", background: C.g50, borderRadius: "0 0 28px 28px" }}>
                    <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
                    <Btn variant="navy" icon={Check} loading={isSubmitting} type="submit">
                        {title.includes("Add") ? "Add Administrator" : "Save Changes"}
                    </Btn>
                </div>
            </form>
        </>
    );
}

// ─── ADD ADMIN MODAL ───────────────────────────────────────
function AddAdminModal({ isOpen, onClose, schoolId, onSuccess }: any) {
    const [formData, setFormData] = useState({ mobile: "", email: "", firstName: "", lastName: "", designation: "", department: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await createAdminAction(schoolId, formData);
        if (result.success) {
            toast.success("Administrator added successfully");
            onClose(); onSuccess();
            setFormData({ mobile: "", email: "", firstName: "", lastName: "", designation: "", department: "" });
        } else toast.error(result.error || "Failed to add administrator");
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <AdminForm title="Add Administrator" sub="Grant dashboard access to a new admin" formData={formData} setFormData={setFormData}
                onSubmit={handleSubmit} onClose={onClose} isSubmitting={isSubmitting} showMobile />
        </Modal>
    );
}

// ─── EDIT ADMIN MODAL ──────────────────────────────────────
function EditAdminModal({ isOpen, onClose, admin, onSuccess }: any) {
    const params = useParams();
    const slug = params.slug as string;
    const [formData, setFormData] = useState({ email: "", firstName: "", lastName: "", designation: "", department: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (admin) setFormData({ email: admin.email || "", firstName: admin.firstName || "", lastName: admin.lastName || "", designation: admin.designation || "", department: admin.department || "" });
    }, [admin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await updateAdminAction(slug, admin.id, formData);
        if (result.success) { toast.success("Administrator updated successfully"); onClose(); onSuccess(); }
        else toast.error(result.error || "Failed to update administrator");
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isOpen && !!admin} onClose={onClose}>
            <AdminForm title="Edit Administrator" sub="Modify this admin's profile and access details" formData={formData} setFormData={setFormData}
                onSubmit={handleSubmit} onClose={onClose} isSubmitting={isSubmitting} />
        </Modal>
    );
}

// ─── MAIN PAGE ─────────────────────────────────────────────
export default function AdminSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();
    const [isLoading, setIsLoading] = useState(true);
    const [schoolData, setSchoolData] = useState<any>(null);
    const [admins, setAdmins] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

    const loadData = async () => {
        if (!schoolData?.id) return;
        setIsLoading(true);
        const adminsRes = await getSchoolAdminsAction(schoolData.id);
        if (adminsRes.success) setAdmins(adminsRes.data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        async function load() {
            const res = await getSchoolSettingsAction(slug);
            if (res.success && res.data) {
                setSchoolData(res.data);
                const adminsRes = await getSchoolAdminsAction(res.data.id);
                if (adminsRes.success) setAdmins(adminsRes.data || []);
            }
            setIsLoading(false);
        }
        load();
    }, [slug]);

    const handleToggleStatus = async (userId: string) => {
        const result = await toggleAdminStatusAction(slug, userId);
        if (result.success) { toast.success("Admin status updated"); loadData(); }
        else toast.error(result.error || "Failed to update status");
    };

    const handleDelete = async (userId: string) => {
        const confirmed = await confirmDialog({ title: "Remove Administrator", message: "Are you sure you want to remove this administrator?", variant: "danger", confirmText: "Remove", cancelText: "Cancel" });
        if (!confirmed) return;
        const result = await deleteAdminAction(slug, userId);
        if (result.success) { toast.success("Administrator removed"); loadData(); }
        else toast.error(result.error || "Failed to remove administrator");
    };

    if (isLoading) return <SettingsLoader message="Loading admin panel..." />;

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", maxWidth: 900 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                @keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
                @keyframes slideRight{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
                @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.1)}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)", flexShrink: 0 }}>
                        <ShieldCheck size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: 0, lineHeight: 1.2 }}>Admin Panel</h1>
                        <p style={{ fontSize: 13.5, color: C.g400, margin: "5px 0 0", fontWeight: 500 }}>Control administrative access and manage dashboard privileges for your school.</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn icon={UserPlus} variant="primary" size="md" onClick={() => setShowAddModal(true)}>
                        Add Admin
                    </Btn>
                </div>
            </div>

            {/* Privileged Access Alert */}
            <div style={{ background: `linear-gradient(135deg,${C.amberXL},#FFF8F0)`, border: `1.5px solid ${C.amber}30`, borderLeft: `4px solid ${C.amber}`, borderRadius: 18, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20, animation: "fadeUp 0.4s ease 0.1s both" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: C.amberL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <AlertTriangle size={18} color={C.amberD} />
                </div>
                <div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Privileged Access Warning</div>
                    <p style={{ fontSize: 13, color: C.g600, lineHeight: 1.7 }}>
                        Administrators can modify institutional settings, manage student records, and assign roles to staff. Only grant access to trusted personnel.
                    </p>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
                {[
                    { label: "Total Admins", value: admins.length, color: C.navy, bg: "#EDE9FE" },
                    { label: "Active", value: admins.filter(a => a.status === "ACTIVE").length, color: C.green, bg: C.greenL },
                    { label: "Inactive", value: admins.filter(a => a.status !== "ACTIVE").length, color: C.red, bg: C.redL },
                ].map((stat, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 16, padding: "16px 20px", boxShadow: C.sh, border: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 14, animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>
                        <div style={{ width: 44, height: 44, borderRadius: 13, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.g500 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Admin List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {admins.length === 0 ? (
                    <div style={{ background: "white", borderRadius: 20, padding: "60px 40px", textAlign: "center", boxShadow: C.sh, border: `2px dashed ${C.g200}` }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: C.g100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", animation: "float 3s ease-in-out infinite" }}>
                            <User size={28} color={C.g300} />
                        </div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 6 }}>No Administrators Found</div>
                        <p style={{ fontSize: 13.5, color: C.g400, marginBottom: 20 }}>Add your first administrator to manage school access.</p>
                        <Btn icon={UserPlus} variant="navy" onClick={() => setShowAddModal(true)}>Add First Admin</Btn>
                    </div>
                ) : (
                    admins.map((admin, i) => {
                        const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        const isActive = admin.status === "ACTIVE";
                        const initials = `${admin.firstName?.[0] || ""}${admin.lastName?.[0] || ""}`.toUpperCase();

                        return (
                            <div key={admin.id} style={{
                                background: "white", borderRadius: 20,
                                border: `1.5px solid ${isActive ? C.g100 : C.redL}`,
                                padding: "18px 22px",
                                boxShadow: isActive ? C.sh : `0 4px 20px ${C.red}10`,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                transition: C.tr, animation: `slideRight 0.35s ease ${i * 0.07}s both`,
                                position: "relative", overflow: "hidden",
                            }}
                                onMouseEnter={e => { (e.currentTarget as any).style.transform = "translateX(3px)"; (e.currentTarget as any).style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; }}
                                onMouseLeave={e => { (e.currentTarget as any).style.transform = "none"; (e.currentTarget as any).style.boxShadow = C.sh; }}>

                                {/* Inactive overlay stripe */}
                                {!isActive && (
                                    <div style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", background: `linear-gradient(180deg,${C.red},${C.redD})` }} />
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                                        background: isActive ? `linear-gradient(135deg,${avatarColor},${avatarColor}cc)` : C.g100,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800,
                                        color: isActive ? "white" : C.g300,
                                        boxShadow: isActive ? `0 4px 16px ${avatarColor}40` : "none",
                                        transition: C.tr,
                                    }}>
                                        {initials || <User size={20} />}
                                    </div>

                                    <div>
                                        {/* Name + badges */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                                            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.navy }}>
                                                {admin.firstName} {admin.lastName}
                                            </span>
                                            <span style={{
                                                padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                background: isActive ? C.greenL : C.redL,
                                                color: isActive ? C.greenD : C.redD,
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                                                {isActive ? "Active" : "Inactive"}
                                            </span>
                                            {admin.designation && (
                                                <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: C.amberL, color: C.amberD }}>
                                                    {admin.designation}
                                                </span>
                                            )}
                                        </div>

                                        {/* Contact info */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            {(admin.email || admin.mobile) && (
                                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.g500 }}>
                                                    <Mail size={12} color={C.g400} />
                                                    {admin.email || `+91 ${admin.mobile}`}
                                                </div>
                                            )}
                                            {admin.department && (
                                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.g500 }}>
                                                    <Building2 size={12} color={C.g400} />
                                                    {admin.department}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <IconBtn icon={Power}
                                        hoverColor={isActive ? C.red : C.green}
                                        hoverBg={isActive ? C.redL : C.greenL}
                                        title={isActive ? "Deactivate" : "Activate"}
                                        onClick={() => handleToggleStatus(admin.id)} />
                                    <IconBtn icon={Edit2}
                                        hoverColor={C.amber} hoverBg={C.amberL}
                                        title="Edit Admin"
                                        onClick={() => { setSelectedAdmin(admin); setShowEditModal(true); }} />
                                    <IconBtn icon={Trash2}
                                        hoverColor={C.red} hoverBg={C.redL}
                                        title="Remove Admin"
                                        onClick={() => handleDelete(admin.id)} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <AddAdminModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} schoolId={schoolData?.id} onSuccess={loadData} />
            <EditAdminModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedAdmin(null); }} admin={selectedAdmin} onSuccess={loadData} />
        </div>
    );
}
