"use client";

import { useState, useEffect, useRef } from "react";
import {
    Building2, Globe, Calendar, Upload, X, Save, Loader2,
    Phone, Shield, CheckCircle2, Check, AlertCircle, Image,
    Palette, Type, Sparkles,
} from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/image-utils";
import { updateSchoolProfileAction } from "@/app/actions/settings-actions";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { toast } from "sonner";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
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
        primary: { bg: `linear-gradient(135deg,${C.amber},${C.orange})`, color: "white", sh: `0 4px 16px ${C.amber}45` },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
        danger: { bg: `linear-gradient(135deg,${C.red},#DC2626)`, color: "white", sh: `0 4px 14px ${C.red}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        ghost: { bg: "transparent", color: C.g500, sh: "none" },
        outline: { bg: "transparent", color: C.amber, border: `1.5px solid ${C.amber}`, sh: "none" },
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
            style={{ flex: 1, border: `2px solid ${C.amber}`, borderRadius: 12, padding: "12px 16px", fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, textAlign: "center", letterSpacing: 12, color: C.navy, outline: "none", background: C.amberXL, transition: C.tr }} />
    );
}

// ─── SECTION HEADER ────────────────────────────────────────
function SectionHdr({ icon: Icon, title, sub, color = C.amber }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 22 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${color},${color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${color}40`, flexShrink: 0 }}>
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
                <SectionHdr icon={Palette} title="Brand Colors" sub="Primary and secondary theme colors used across the portal" color={C.purple} />
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

            {/* ── PHONE NUMBER ── */}
            <Card style={{ animation: "fadeUp 0.55s ease 0.21s both" }}>
                <SectionHdr icon={Phone} title="Registered Phone Number" sub="Manage your account phone with OTP verification" color={C.green} />

                {phoneStep === "idle" && (
                    <div style={{ background: C.g50, borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1.5px solid ${C.g200}` }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Current Phone</div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: currentPhone ? C.navy : C.g300 }}>
                                {currentPhone ? `+91 ${currentPhone}` : "No number registered"}
                            </div>
                        </div>
                        <Btn icon={Phone} variant="success" size="md" loading={isPhoneLoading} onClick={startPhoneChange}>
                            {currentPhone ? "Change Number" : "Add Number"}
                        </Btn>
                    </div>
                )}

                {phoneStep === "verify-old" && (
                    <div style={{ background: C.amberXL, borderRadius: 16, padding: "20px 22px", border: `2px solid ${C.amberL}`, animation: "fadeUp 0.3s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                            <Shield size={16} color={C.amberD} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: C.amberD }}>Verify Current Number</span>
                        </div>
                        <p style={{ fontSize: 13, color: C.g600, marginBottom: 16 }}>
                            OTP sent to <strong>+91 {currentPhone}</strong>
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                            <OTPInput value={oldPhoneOtp} onChange={(e: any) => setOldPhoneOtp(e.target.value)} />
                            <Btn variant="primary" size="md" icon={Check} loading={isPhoneLoading} disabled={oldPhoneOtp.length !== 4} onClick={verifyOldPhone}>Verify</Btn>
                            <Btn variant="secondary" size="md" onClick={cancelPhoneChange}>Cancel</Btn>
                        </div>
                    </div>
                )}

                {phoneStep === "enter-new" && (
                    <div style={{ background: C.amberXL, borderRadius: 16, padding: "20px 22px", border: `2px solid ${C.amberL}`, animation: "fadeUp 0.3s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                            <Phone size={16} color={C.amberD} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: C.amberD }}>Enter New Phone Number</span>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <FInput placeholder="Enter 10-digit number" value={newPhone} prefix="+91" type="tel"
                                onChange={(e: any) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
                            <Btn variant="primary" size="md" icon={Phone} loading={isPhoneLoading} disabled={newPhone.length !== 10} onClick={sendNewPhoneOtp}>Send OTP</Btn>
                            <Btn variant="secondary" size="md" onClick={cancelPhoneChange}>Cancel</Btn>
                        </div>
                    </div>
                )}

                {phoneStep === "verify-new" && (
                    <div style={{ background: C.greenXL, borderRadius: 16, padding: "20px 22px", border: `2px solid ${C.greenL}`, animation: "fadeUp 0.3s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                            <Shield size={16} color={C.greenD} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: C.greenD }}>Verify New Number</span>
                        </div>
                        <p style={{ fontSize: 13, color: C.g600, marginBottom: 16 }}>OTP sent to <strong>+91 {newPhone}</strong></p>
                        <div style={{ display: "flex", gap: 10 }}>
                            <OTPInput value={newPhoneOtp} onChange={(e: any) => setNewPhoneOtp(e.target.value)} />
                            <Btn variant="success" size="md" icon={Check} loading={isPhoneLoading} disabled={newPhoneOtp.length !== 4} onClick={verifyNewPhone}>Verify & Update</Btn>
                            <Btn variant="secondary" size="md" onClick={cancelPhoneChange}>Cancel</Btn>
                        </div>
                    </div>
                )}
            </Card>

            {/* ── SAVE BUTTON ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                <Btn variant="primary" size="lg" icon={Save} loading={isSaving} onClick={handleSave}>
                    Update Identity
                </Btn>
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
                        <div style={{ position: "relative", height: 380, background: C.g900 as any }}>
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
