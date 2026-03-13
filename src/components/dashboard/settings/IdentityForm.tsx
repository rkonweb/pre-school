"use client";

import { useState, useEffect, useRef } from "react";
import {
    Building2, Globe, Calendar, Upload, X, Save, Loader2,
    Phone, Shield, CheckCircle2, Check, AlertCircle, Image,
    Palette, Type, Sparkles, Layers,
} from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/image-utils";
import { updateSchoolProfileAction } from "@/app/actions/settings-actions";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "var(--brand-color, #F59E0B)", 
    amberD: "var(--brand-color, #D97706)", 
    amberL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.12)", 
    amberXL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.05)",
    navy: "#1E1B4B", navyM: "#312E81",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redL: "#FEE2E2", redXL: "#FEF2F2",
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

// ─── RIPPLE BUTTON ─────────────────────────────────────────
function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick, fullWidth, type = "button" }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<HTMLButtonElement>(null);
    const vs: any = {
        primary: { bg: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", sh: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)" },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
        danger: { bg: `linear-gradient(135deg,${C.red},#DC2626)`, color: "white", sh: `0 4px 14px ${C.red}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        ghost: { bg: "transparent", color: C.g500, sh: "none" },
        outline: { bg: "transparent", color: "var(--brand-color, #F59E0B)", border: "1.5px solid var(--brand-color, #F59E0B)", sh: "none" },
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
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTopWidth: 2, borderTopStyle: "solid" as const, borderTopColor: v.color, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

// ─── LABEL ─────────────────────────────────────────────────
function Lbl({ children, required }: any) {
    return (
        <label style={{ fontSize: 12, fontWeight: 700, color: C.g500, display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {children}{required && <span style={{ color: C.red }}> *</span>}
        </label>
    );
}

// ─── FIELD INPUT ───────────────────────────────────────────
function FInput({ label, type = "text", value, onChange, placeholder, required, icon: Icon, prefix }: any) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ width: "100%" }}>
            {label && <Lbl required={required}>{label}</Lbl>}
            <div style={{ position: "relative", display: "flex", alignItems: "center", background: focused ? C.amberXL : C.g50, border: `1.5px solid ${focused ? C.amber : C.g200}`, borderRadius: 12, transition: C.tr, boxShadow: focused ? `0 0 0 4px ${C.amber}20` : "none", transform: focused ? "translateY(-1px)" : "none" }}>
                {prefix && <span style={{ padding: "0 0 0 14px", fontSize: 13, color: C.g500, fontWeight: 700, whiteSpace: "nowrap" }}>{prefix}</span>}
                {Icon && <span style={{ padding: "0 0 0 13px", display: "flex" }}><Icon size={15} color={focused ? C.amber : C.g400} /></span>}
                <input type={type} placeholder={placeholder} value={value || ""} onChange={onChange} required={required}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: "11px 14px", fontSize: 13.5, color: C.g800, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, paddingLeft: (Icon || prefix) ? 8 : undefined }} />
            </div>
        </div>
    );
}

// ─── OTP INPUT ─────────────────────────────────────────────
function OTPInput({ value, onChange }: any) {
    return (
        <input type="text" value={value} onChange={onChange} placeholder="· · · ·" maxLength={4}
            style={{ flex: 1, border: `2px solid var(--brand-color, #F59E0B)`, borderRadius: 12, padding: "12px 16px", fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, textAlign: "center", letterSpacing: 12, color: C.navy, outline: "none", background: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.05)", transition: C.tr }} />
    );
}

// ─── SECTION HEADER ────────────────────────────────────────
function SectionHdr({ icon: Icon, title, sub, color = C.amber }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 22 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)", flexShrink: 0 }}>
                <Icon size={20} color="white" strokeWidth={2} />
            </div>
            <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: C.g400 }}>{sub}</div>
            </div>
        </div>
    );
}

// ─── LOGO UPLOADER ─────────────────────────────────────────
function LogoUploader({ label, id, preview, onChange, onClear, hint }: any) {
    const [isDragging, setIsDragging] = useState(false);
    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <Lbl>{label}</Lbl>
            <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) onChange({ target: { files: [file] } }); }}
                style={{ position: "relative", height: 160, borderRadius: 18, border: `2px dashed ${isDragging ? C.amber : C.g200}`, background: isDragging ? C.amberXL : C.g50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: C.tr, overflow: "hidden", cursor: "pointer" }}
                onClick={() => !preview && document.getElementById(id)?.click()}>
                {preview ? (
                    <>
                        <img src={preview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }} />
                        <button onClick={e => { e.stopPropagation(); onClear(); }}
                            style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: C.red, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 2px 8px ${C.red}50` }}>
                            <X size={13} color="white" />
                        </button>
                    </>
                ) : (
                    <label htmlFor={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: C.amberL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Upload size={22} color={C.amber} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Drop file or click to upload</div>
                            <div style={{ fontSize: 11.5, color: C.g400, marginTop: 3 }}>{hint}</div>
                        </div>
                    </label>
                )}
                <input type="file" id={id} accept="image/*" onChange={onChange} style={{ display: "none" }} />
            </div>
        </div>
    );
}

// ─── COLOR PICKER ──────────────────────────────────────────
function ColorPicker({ label, sub, value, onChange }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.g50, borderRadius: 14, border: `1.5px solid ${C.g200}`, transition: C.tr }}
            onMouseEnter={e => { (e.currentTarget as any).style.borderColor = C.amber; (e.currentTarget as any).style.background = C.amberXL; }}
            onMouseLeave={e => { (e.currentTarget as any).style.borderColor = C.g200; (e.currentTarget as any).style.background = C.g50; }}>
            <div style={{ position: "relative" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: value, boxShadow: `0 3px 12px ${value}55`, border: `3px solid white`, outline: `1.5px solid ${C.g200}` }} />
                <input type="color" value={value} onChange={onChange}
                    style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
            </div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.g800 }}>{label}</div>
                <div style={{ fontSize: 11.5, color: C.g400, marginTop: 2 }}>{sub}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.g500, marginTop: 3, fontFamily: "monospace" }}>{value}</div>
            </div>
        </div>
    );
}

// ─── DIVIDER ───────────────────────────────────────────────
function Divider() {
    return <div style={{ height: 1, background: `linear-gradient(90deg,${C.amber}30,${C.g200},transparent)`, margin: "28px 0" }} />;
}

// ─── CARD ──────────────────────────────────────────────────
function Card({ children, style = {} }: any) {
    return (
        <div style={{ background: "white", borderRadius: 20, padding: "28px 30px", boxShadow: C.sh, border: `1px solid ${C.g100}`, marginBottom: 20, ...style }}>
            {children}
        </div>
    );
}

interface IdentityFormProps {
    slug: string;
    initialData: any;
}

export function IdentityForm({ slug, initialData }: IdentityFormProps) {
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(1);
    const [imgNaturalAspect, setImgNaturalAspect] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [croppingTarget, setCroppingTarget] = useState<"logo" | "printableLogo">("logo");

    // ─── GRADIENT STATE ────────────────
    const defaultGradient = { from: formData.brandColor || "#F59E0B", to: "#EF4444", angle: 135, style: "linear" as "linear" | "radial" };
    const [gc, setGc] = useState<{ from: string; to: string; angle: number; style: "linear" | "radial" }>(
        formData.gradientConfig && Object.keys(formData.gradientConfig).length > 0
            ? formData.gradientConfig
            : defaultGradient
    );
    const setGradient = (patch: Partial<typeof gc>) => {
        const next = { ...gc, ...patch };
        setGc(next);
        setFormData({ ...formData, gradientConfig: next });
    };
    const PRESETS = [
        { label: "Amber",    from: "#F59E0B", to: "#EF4444", angle: 135, style: "linear" as const },
        { label: "Ocean",    from: "#0EA5E9", to: "#6366F1", angle: 120, style: "linear" as const },
        { label: "Forest",   from: "#10B981", to: "#0D9488", angle: 135, style: "linear" as const },
        { label: "Rose",     from: "#F43F5E", to: "#EC4899", angle: 120, style: "linear" as const },
        { label: "Midnight", from: "#1E1B4B", to: "#4338CA", angle: 160, style: "linear" as const },
        { label: "Aurora",   from: "#8B5CF6", to: "#06B6D4", angle: 100, style: "radial" as const },
        { label: "Gold",     from: "#D97706", to: "#B45309", angle: 135, style: "linear" as const },
        { label: "Coral",    from: "#FB923C", to: "#F472B6", angle: 120, style: "linear" as const },
    ];
    const liveGradient = gc.style === "radial"
        ? `radial-gradient(circle, ${gc.from}, ${gc.to})`
        : `linear-gradient(${gc.angle}deg, ${gc.from}, ${gc.to})`;

    // Phone number management
    const [currentPhone, setCurrentPhone] = useState<string>("");
    const [newPhone, setNewPhone] = useState("");
    const [oldPhoneOtp, setOldPhoneOtp] = useState("");
    const [newPhoneOtp, setNewPhoneOtp] = useState("");
    const [phoneStep, setPhoneStep] = useState<"idle" | "verify-old" | "enter-new" | "verify-new">("idle");
    const [isPhoneLoading, setIsPhoneLoading] = useState(false);

    useEffect(() => {
        async function loadCurrentPhone() {
            const userRes = await getCurrentUserAction();
            if (userRes.success && userRes.data) {
                setCurrentPhone(userRes.data.mobile || "");
            }
        }
        loadCurrentPhone();
    }, []);

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleLogoUpload = (e: any, target: "logo" | "printableLogo") => {
        const file = e?.target?.files?.[0];
        if (file) {
            setCroppingTarget(target);
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setTempImage(result);
                const img = new window.Image();
                img.onload = () => {
                    setImgNaturalAspect(img.naturalWidth / img.naturalHeight);
                    setIsCropModalOpen(true);
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    const finalizeLogo = async () => {
        if (tempImage && croppedAreaPixels) {
            const cropped = await getCroppedImg(tempImage, croppedAreaPixels);
            setFormData({ ...formData, [croppingTarget]: cropped });
            setIsCropModalOpen(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateSchoolProfileAction(slug, formData);
        if (res.success) {
            toast.success("Identity updated successfully");
        } else {
            toast.error(res.error || "Failed to update identity");
        }
        setIsSaving(false);
    };

    async function startPhoneChange() {
        if (!currentPhone) { setPhoneStep("enter-new"); return; }
        setIsPhoneLoading(true);
        const res = await sendOtpAction(currentPhone, "login");
        setIsPhoneLoading(false);
        if (res.success) { toast.success("OTP sent to your current number"); setPhoneStep("verify-old"); }
        else toast.error(res.error || "Failed to send OTP");
    }

    async function verifyOldPhone() {
        setIsPhoneLoading(true);
        const res = await verifyOtpAction(currentPhone, oldPhoneOtp);
        setIsPhoneLoading(false);
        if (res.success) { toast.success("Current number verified"); setPhoneStep("enter-new"); setOldPhoneOtp(""); }
        else toast.error(res.error || "Invalid OTP");
    }

    async function sendNewPhoneOtp() {
        if (!/^[0-9]{10}$/.test(newPhone)) { toast.error("Please enter a valid 10-digit mobile number"); return; }
        setIsPhoneLoading(true);
        const res = await sendOtpAction(newPhone, "login");
        setIsPhoneLoading(false);
        if (res.success) { toast.success("OTP sent to new number"); setPhoneStep("verify-new"); }
        else toast.error(res.error || "Failed to send OTP");
    }

    async function verifyNewPhone() {
        setIsPhoneLoading(true);
        const res = await verifyOtpAction(newPhone, newPhoneOtp);
        setIsPhoneLoading(false);
        if (res.success) { setCurrentPhone(newPhone); toast.success("Phone number updated successfully"); setPhoneStep("idle"); setNewPhone(""); setNewPhoneOtp(""); }
        else toast.error(res.error || "Invalid OTP");
    }

    function cancelPhoneChange() { setPhoneStep("idle"); setNewPhone(""); setOldPhoneOtp(""); setNewPhoneOtp(""); }

    useEffect(() => {
        const btn = document.getElementById("save-identity-btn");
        if (btn) {
            const clickHandler = () => handleSave();
            btn.addEventListener("click", clickHandler);
            return () => btn.removeEventListener("click", clickHandler);
        }
    }, [formData, isSaving]); // Re-bind if formData changes to capture latest state in handleSave closure

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", maxWidth: 900 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.1)}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
                @keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
            `}</style>

            {/* ── LOGOS SECTION ── */}
            <Card style={{ animation: "fadeUp 0.4s ease both" }}>
                <SectionHdr icon={Image} title="School Logos" sub="Upload your official seal and printable logos" color={C.amber} />
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <LogoUploader
                        label="School Seal / Digital Logo"
                        id="logo-upload"
                        preview={formData.logo}
                        hint="PNG/JPG recommended · Appears on portal & certificates"
                        onChange={(e: any) => handleLogoUpload(e, "logo")}
                        onClear={() => setFormData({ ...formData, logo: "" })}
                    />
                    <LogoUploader
                        label="Printable Report Logo"
                        id="printable-logo-upload"
                        preview={formData.printableLogo}
                        hint="High-contrast B&W recommended · Used on printed reports"
                        onChange={(e: any) => handleLogoUpload(e, "printableLogo")}
                        onClear={() => setFormData({ ...formData, printableLogo: "" })}
                    />
                </div>
            </Card>

            {/* ── IDENTITY DETAILS ── */}
            <Card style={{ animation: "fadeUp 0.45s ease 0.07s both" }}>
                <SectionHdr icon={Building2} title="Institutional Details" sub="Legal name, motto, website and founding year" color={C.navy} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                    <FInput label="School Legal Name" placeholder="e.g. Springfield Public School" value={formData.name} required icon={Building2}
                        onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} />
                    <FInput label="Institutional Motto" placeholder="e.g. Knowledge is Power" value={formData.motto} icon={Type}
                        onChange={(e: any) => setFormData({ ...formData, motto: e.target.value })} />
                    <FInput label="Public Website" placeholder="https://yourschool.edu" value={formData.website} icon={Globe}
                        onChange={(e: any) => setFormData({ ...formData, website: e.target.value })} />
                    <FInput label="Founding Year" type="number" placeholder="e.g. 1994" value={formData.foundingYear} icon={Calendar}
                        onChange={(e: any) => setFormData({ ...formData, foundingYear: e.target.value })} />
                </div>
            </Card>

            {/* ── THEME COLORS ── */}
            <Card style={{ animation: "fadeUp 0.5s ease 0.14s both" }}>
                <SectionHdr icon={Palette} title="Brand Colors" sub="Primary and secondary theme colors used across the portal" color="#8B5CF6" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <ColorPicker
                        label="Primary Color"
                        sub="Backgrounds & brand elements"
                        value={formData.brandColor || "#F59E0B"}
                        onChange={(e: any) => setFormData({ ...formData, brandColor: e.target.value })}
                    />
                    <ColorPicker
                        label="Secondary Color"
                        sub="Text on brand backgrounds"
                        value={formData.secondaryColor || "#ffffff"}
                        onChange={(e: any) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                </div>

                {/* Live Preview */}
                <div style={{ marginTop: 18, borderRadius: 14, overflow: "hidden", boxShadow: C.sh }}>
                    <div style={{ background: formData.brandColor || "#F59E0B", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Sparkles size={18} color={formData.secondaryColor || "#fff"} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: formData.secondaryColor || "#fff" }}>
                                {formData.name || "Your School Name"}
                            </div>
                            <div style={{ fontSize: 11.5, color: formData.secondaryColor || "#fff", opacity: 0.7 }}>
                                {formData.motto || "Your school motto"}
                            </div>
                        </div>
                        <div style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 9, background: "rgba(255,255,255,0.2)", color: formData.secondaryColor || "#fff", fontSize: 12, fontWeight: 700 }}>
                            Preview
                        </div>
                    </div>
                    <div style={{ background: C.g50, padding: "10px 20px", fontSize: 11.5, color: C.g400, fontWeight: 600, borderTop: `1px solid ${C.g100}` }}>
                        ↑ Live preview of how your brand colors will appear across the portal
                    </div>
                </div>
            </Card>

            {/* ── GLOBAL GRADIENT ── */}
            <Card style={{ animation: "fadeUp 0.52s ease 0.18s both" }}>
                <SectionHdr icon={Layers} title="Global Gradient Style" sub="Custom gradient used on navigation, banners and highlight elements across the portal" color="#8B5CF6" />

                {/* Preset Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                    {PRESETS.map(p => (
                        <button key={p.label}
                            onClick={() => {
                                const next = { from: p.from, to: p.to, angle: p.angle, style: p.style };
                                setGc(next);
                                setFormData({ ...formData, gradientConfig: next });
                            }}
                            style={{
                                padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                                background: `linear-gradient(${p.angle}deg, ${p.from}, ${p.to})`,
                                color: "white", boxShadow: `0 3px 10px ${p.from}60`,
                                transition: C.tr, outline: (gc.from === p.from && gc.to === p.to) ? `3px solid ${C.navy}` : "none",
                                transform: (gc.from === p.from && gc.to === p.to) ? "scale(1.07)" : "scale(1)"
                            }}
                        >{p.label}</button>
                    ))}
                </div>

                {/* Color Pickers Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <ColorPicker
                        label="From Color"
                        sub="Starting color of the gradient"
                        value={gc.from}
                        onChange={(e: any) => setGradient({ from: e.target.value })}
                    />
                    <ColorPicker
                        label="To Color"
                        sub="Ending color of the gradient"
                        value={gc.to}
                        onChange={(e: any) => setGradient({ to: e.target.value })}
                    />
                </div>

                {/* Angle + Style Row */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
                    {/* Angle Slider */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <Lbl>Gradient Angle</Lbl>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <input type="range" min={0} max={360} value={gc.angle}
                                onChange={e => setGradient({ angle: Number(e.target.value) })}
                                disabled={gc.style === "radial"}
                                style={{ flex: 1, accentColor: gc.from, cursor: gc.style === "radial" ? "not-allowed" : "pointer", opacity: gc.style === "radial" ? 0.4 : 1 }}
                            />
                            <div style={{
                                minWidth: 54, textAlign: "center", fontFamily: "monospace", fontSize: 13, fontWeight: 800,
                                color: C.navy, background: C.g100, padding: "5px 10px", borderRadius: 8
                            }}>{gc.angle}°</div>
                        </div>
                    </div>
                    {/* Style Toggle */}
                    <div>
                        <Lbl>Style</Lbl>
                        <div style={{ display: "flex", gap: 8 }}>
                            {(["linear", "radial"] as const).map(s => (
                                <button key={s} onClick={() => setGradient({ style: s })}
                                    style={{
                                        padding: "8px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                                        border: `2px solid ${gc.style === s ? "#8B5CF6" : C.g200}`,
                                        background: gc.style === s ? "#EDE9FE" : "white",
                                        color: gc.style === s ? "#7C3AED" : C.g500,
                                        cursor: "pointer", transition: C.tr, textTransform: "capitalize"
                                    }}
                                >{s}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Preview Banner */}
                <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: C.sh }}>
                    <div style={{ background: liveGradient, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Sparkles size={19} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: "white" }}>{formData.name || "Your School Name"}</div>
                            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)" }}>Navigation Bar · Banners · Highlights</div>
                        </div>
                        <div style={{ padding: "7px 16px", borderRadius: 9, background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700 }}>
                            {gc.style === "radial" ? "Radial" : `${gc.angle}°`}
                        </div>
                    </div>
                    <div style={{ background: C.g50, padding: "10px 20px", fontSize: 11.5, color: C.g400, fontWeight: 600, borderTop: `1px solid ${C.g100}` }}>
                        ↑ Live preview of the global gradient applied across your school portal
                    </div>
                </div>
            </Card>

            {/* ── PHONE NUMBER ── */}
            <div style={{
                borderRadius: 22, overflow: "hidden",
                background: `linear-gradient(145deg,${C.navy},${C.navyM},#4C1D95)`,
                boxShadow: `0 12px 40px ${C.navy}50`,
                position: "relative", animation: "fadeUp 0.55s ease 0.21s both",
            }}>
                <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(16,185,129,0.15)", filter: "blur(60px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(59,130,246,0.15)", filter: "blur(50px)", pointerEvents: "none" }} />

                <div style={{ padding: "28px 32px", position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 14px", borderRadius: 20, background: "rgba(255,255,255,0.12)", marginBottom: 14 }}>
                            <Shield size={13} color="rgba(255,255,255,0.8)" />
                            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.9 }}>Account Security</span>
                        </div>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 21, fontWeight: 800, color: "white", margin: "0 0 10px", lineHeight: 1.3 }}>
                            Registered Phone Number
                        </h2>
                        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: 420, lineHeight: 1.5 }}>
                            Manage your account phone with OTP verification. This number is used for important alerts.
                        </p>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", borderRadius: 18, padding: "20px", display: "flex", flexDirection: "column", gap: 16, minWidth: 300, maxWidth: 400, flex: 1 }}>
                        {phoneStep === "idle" && (
                            <>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Current Phone</div>
                                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: currentPhone ? "white" : "rgba(255,255,255,0.4)" }}>
                                        {currentPhone || "No number registered"}
                                    </div>
                                </div>
                                <Btn icon={Phone} variant="success" size="md" loading={isPhoneLoading} onClick={startPhoneChange} fullWidth={true}>
                                    {currentPhone ? "Change Number" : "Add Number"}
                                </Btn>
                            </>
                        )}

                        {phoneStep === "verify-old" && (
                            <div style={{ animation: "fadeUp 0.3s ease" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                                    <Shield size={16} color="rgba(255,255,255,0.9)" />
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Verify Current Number</span>
                                </div>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                                    OTP sent to <strong>+91 {currentPhone}</strong>
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <OTPInput value={oldPhoneOtp} onChange={(e: any) => setOldPhoneOtp(e.target.value)} />
                                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                        <Btn variant="primary" size="md" icon={Check} loading={isPhoneLoading} disabled={oldPhoneOtp.length !== 4} onClick={verifyOldPhone} fullWidth={true}>Verify</Btn>
                                        <Btn variant="ghost" size="md" onClick={cancelPhoneChange} style={{ color: "rgba(255,255,255,0.7)" }}>Cancel</Btn>
                                    </div>
                                </div>
                            </div>
                        )}

                        {phoneStep === "enter-new" && (
                            <div style={{ animation: "fadeUp 0.3s ease" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                                    <Phone size={16} color="rgba(255,255,255,0.9)" />
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Enter New Phone</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4 }}>
                                        <PhoneInput value={newPhone} onChange={(v: string) => setNewPhone(v)} />
                                    </div>
                                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                        <Btn variant="primary" size="md" icon={Phone} loading={isPhoneLoading} disabled={newPhone.length !== 10} onClick={sendNewPhoneOtp} fullWidth={true}>Send OTP</Btn>
                                        <Btn variant="ghost" size="md" onClick={cancelPhoneChange} style={{ color: "rgba(255,255,255,0.7)" }}>Cancel</Btn>
                                    </div>
                                </div>
                            </div>
                        )}

                        {phoneStep === "verify-new" && (
                            <div style={{ animation: "fadeUp 0.3s ease" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                                    <Shield size={16} color="rgba(255,255,255,0.9)" />
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "white" }}>Verify New Number</span>
                                </div>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>OTP sent to <strong>+91 {newPhone}</strong></p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <OTPInput value={newPhoneOtp} onChange={(e: any) => setNewPhoneOtp(e.target.value)} />
                                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                                        <Btn variant="success" size="md" icon={Check} loading={isPhoneLoading} disabled={newPhoneOtp.length !== 4} onClick={verifyNewPhone} fullWidth={true}>Verify</Btn>
                                        <Btn variant="ghost" size="md" onClick={cancelPhoneChange} style={{ color: "rgba(255,255,255,0.7)" }}>Cancel</Btn>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CROP MODAL ── */}
            {isCropModalOpen && tempImage && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(30,27,75,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}
                    onClick={() => setIsCropModalOpen(false)}>
                    <div style={{ background: "white", borderRadius: 28, width: "90%", maxWidth: 640, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "scaleIn 0.3s ease" }}
                        onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.g100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: C.navy }}>Crop Logo</div>
                                <div style={{ fontSize: 12.5, color: C.g400, marginTop: 2 }}>Adjust crop area to fit your logo</div>
                            </div>
                            <button onClick={() => setIsCropModalOpen(false)}
                                style={{ width: 32, height: 32, borderRadius: 9, border: `1.5px solid ${C.g200}`, background: C.g50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={14} color={C.g500} />
                            </button>
                        </div>
                        {/* Crop Area */}
                        <div style={{ position: "relative", height: 380, background: "#111827" }}>
                            <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={aspect}
                                onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                        </div>
                        {/* Actions */}
                        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 10, borderTop: `1px solid ${C.g100}`, background: C.g50 }}>
                            <button onClick={() => setAspect(1)}
                                style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.g200}`, background: "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.g700 }}>
                                Square
                            </button>
                            <button onClick={() => setAspect(imgNaturalAspect)}
                                style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${C.g200}`, background: "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.g700 }}>
                                Original
                            </button>
                            <div style={{ flex: 1 }} />
                            <Btn variant="primary" size="md" icon={Check} onClick={finalizeLogo}>Apply Logo</Btn>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
