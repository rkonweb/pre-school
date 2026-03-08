"use client";

import { useEffect, useState, useRef } from "react";
import {
    Router, Server, Users, RefreshCcw, CheckCircle2,
    Link as LinkIcon, Copy, Activity, Info, Wifi,
    Fingerprint, Clock, ChevronDown, Check, X,
} from "lucide-react";
import {
    getBiometricUnmappedUsersAction,
    getRecentBiometricLogsAction,
    mapBiometricUserAction,
    getConnectedDevicesAction,
    generateSampleBiometricDataAction,
} from "@/app/actions/biometric-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "var(--brand-color, #F59E0B)", 
    amberD: "var(--brand-color, #D97706)", 
    amberL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.12)", 
    amberXL: "rgba(var(--brand-color-rgb, 245, 158, 11), 0.05)",
    navy: "#1E1B4B", navyM: "#312E81",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redD: "#DC2626", redL: "#FEE2E2", redXL: "#FEF2F2",
    blue: "#3B82F6", blueL: "#DBEAFE", blueXL: "#EFF6FF",
    purple: "#8B5CF6", purpleL: "#EDE9FE",
    orange: "#F97316", orangeL: "#FFEDD5",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    shM: "0 8px 32px rgba(0,0,0,0.12)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

// ─── RIPPLE BUTTON ─────────────────────────────────────────
function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick, type = "button", fullWidth }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<HTMLButtonElement>(null);
    const vs: any = {
        primary: { bg: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", sh: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.25)" },
        navy: { bg: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "white", sh: `0 4px 14px ${C.navy}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
        ghost: { bg: "transparent", color: C.g500, sh: "none" },
        purple: { bg: `linear-gradient(135deg,${C.purple},#7C3AED)`, color: "white", sh: `0 4px 14px ${C.purple}40` },
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

// ─── CARD ──────────────────────────────────────────────────
function Card({ children, style = {} }: any) {
    return (
        <div style={{ background: "white", borderRadius: 20, padding: "24px 26px", boxShadow: C.sh, border: `1px solid ${C.g100}`, ...style }}>
            {children}
        </div>
    );
}

export default function BiometricSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
    const [unmappedIds, setUnmappedIds] = useState<string[]>([]);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"mapping" | "logs">("mapping");
    const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [serverUrl, setServerUrl] = useState("");
    const [mappingLoading, setMappingLoading] = useState<Record<string, boolean>>({});

    const loadData = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        try {
            const [devicesRes, unmappedRes, logsRes, staffRes] = await Promise.all([
                getConnectedDevicesAction(slug),
                getBiometricUnmappedUsersAction(slug),
                getRecentBiometricLogsAction(slug),
                getStaffAction(slug),
            ]);
            if (devicesRes.success) setConnectedDevices(devicesRes.data as any[]);
            if (unmappedRes.success) setUnmappedIds(unmappedRes.data as string[]);
            if (logsRes.success) setRecentLogs(logsRes.data as any[]);
            if (staffRes.success) setStaffList(staffRes.data as any[]);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); setIsRefreshing(false); }
    };

    useEffect(() => {
        if (!slug) return;
        loadData();
        const interval = setInterval(() => loadData(), 30000);
        setServerUrl(`${window.location.origin}/api/biometric/push?sn=SN-TEST-8899`);
        return () => clearInterval(interval);
    }, [slug]);

    const handleLinkUser = async (deviceUserId: string) => {
        const staffId = selectedUsers[deviceUserId];
        if (!staffId) { toast.error("Please select a staff member first"); return; }
        setMappingLoading(p => ({ ...p, [deviceUserId]: true }));
        const res = await mapBiometricUserAction(slug, deviceUserId, staffId);
        if (res.success) {
            toast.success("User mapped successfully!");
            loadData();
            setSelectedUsers(p => { const n = { ...p }; delete n[deviceUserId]; return n; });
        } else toast.error("Error: " + res.error);
        setMappingLoading(p => ({ ...p, [deviceUserId]: false }));
    };

    const copyToClipboard = () => {
        if (!serverUrl) return;
        navigator.clipboard.writeText(serverUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const STEPS = [
        { n: 1, t: "Connect device to WiFi / LAN network" },
        { n: 2, t: "Open ADMS / Cloud Settings in device menu" },
        { n: 3, t: "Paste the Server URL below and Save" },
    ];

    if (isLoading) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 14, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#3B82F6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px #3B82F645" }}>
                <Fingerprint size={26} color="white" strokeWidth={2} />
            </div>
            <div style={{ width: 40, height: 40, border: `3px solid ${C.g100}`, borderTop: `3px solid ${C.blue}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 14, color: C.g400, fontWeight: 600 }}>Loading biometric data...</span>
        </div>
    );

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", maxWidth: 1050 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
                @keyframes ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
                @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 14, animation: "fadeUp 0.35s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--school-gradient, linear-gradient(135deg,#3B82F6,#8B5CF6))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(var(--brand-color-rgb, 59, 130, 246), 0.25)", flexShrink: 0 }}>
                        <Fingerprint size={24} color="var(--secondary-color, white)" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: 0, lineHeight: 1.2 }}>Biometric Attendance</h1>
                        <p style={{ fontSize: 13.5, color: C.g400, margin: "5px 0 0", fontWeight: 500 }}>Connect devices and manage attendance data sources in real-time.</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn icon={Activity} variant="purple" size="md" onClick={async () => {
                        const res = await generateSampleBiometricDataAction(slug);
                        if (res.success) { toast.success("Sample data generated"); loadData(true); }
                        else toast.error("Failed to generate sample data");
                    }}>Generate Sample</Btn>
                    <Btn icon={RefreshCcw} variant="secondary" size="md" loading={isRefreshing} onClick={() => loadData(true)}>
                        Refresh
                    </Btn>
                </div>
            </div>

            {/* ── STATS BAR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20, animation: "fadeUp 0.4s ease 0.07s both" }}>
                {[
                    { label: "Connected Devices", value: connectedDevices.length, color: C.blue, bg: C.blueL, icon: Server },
                    { label: "Unmapped IDs", value: unmappedIds.length, color: unmappedIds.length > 0 ? C.red : C.green, bg: unmappedIds.length > 0 ? C.redL : C.greenL, icon: Users },
                    { label: "Recent Logs", value: recentLogs.length, color: C.amber, bg: C.amberL, icon: Activity },
                ].map((stat, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 16, padding: "16px 20px", boxShadow: C.sh, border: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <stat.icon size={20} color={stat.color} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 12, color: C.g400, fontWeight: 600 }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── HERO CONNECT GUIDE ── */}
            <div style={{
                borderRadius: 22, marginBottom: 20, overflow: "hidden",
                background: `linear-gradient(145deg,${C.navy},${C.navyM},#4C1D95)`,
                boxShadow: `0 12px 40px ${C.navy}50`,
                position: "relative", animation: "fadeUp 0.45s ease 0.14s both",
            }}>
                {/* Decorative blobs */}
                <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(139,92,246,0.2)", filter: "blur(60px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(59,130,246,0.2)", filter: "blur(50px)", pointerEvents: "none" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, padding: "28px 32px", position: "relative", zIndex: 1 }}>
                    {/* Left — instructions */}
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 14px", borderRadius: 20, background: "rgba(255,255,255,0.12)", marginBottom: 14 }}>
                            <Router size={13} color="rgba(255,255,255,0.8)" />
                            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.9 }}>Hardware Setup</span>
                        </div>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 21, fontWeight: 800, color: "white", margin: "0 0 10px", lineHeight: 1.3 }}>
                            Connect your Machine in seconds
                        </h2>
                        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", margin: "0 0 20px", maxWidth: 420, lineHeight: 1.7 }}>
                            Copy the endpoint below and paste it into your device's <strong style={{ color: "rgba(255,255,255,0.85)" }}>Cloud Server</strong> / <strong style={{ color: "rgba(255,255,255,0.85)" }}>ADMS Settings</strong>.
                        </p>
                        {/* URL field */}
                        <div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.9, marginBottom: 8 }}>Server URL Endpoint</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "4px 4px 4px 16px", backdropFilter: "blur(4px)" }}>
                                <code style={{ flex: 1, fontFamily: "monospace", fontSize: 12.5, color: "rgba(255,255,255,0.8)", wordBreak: "break-all", lineHeight: 1.5 }}>
                                    {serverUrl || "Loading..."}
                                </code>
                                <button onClick={copyToClipboard}
                                    style={{ width: 38, height: 38, borderRadius: 10, background: copied ? C.green : "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: C.tr, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                                    {copied ? <Check size={16} color="white" strokeWidth={2.5} /> : <Copy size={15} color={C.navy} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right — step list */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, minWidth: 260 }}>
                        {STEPS.map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "white" }}>{s.n}</span>
                                </div>
                                <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", fontWeight: 600, lineHeight: 1.4 }}>{s.t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MAIN GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18, animation: "fadeUp 0.5s ease 0.2s both" }}>
                {/* ── LEFT: Connected Devices ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Card>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.blueL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Server size={16} color={C.blue} strokeWidth={2.2} />
                            </div>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: C.navy }}>Connected Devices</span>
                        </div>

                        {connectedDevices.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "24px 10px" }}>
                                <div style={{ width: 52, height: 52, borderRadius: 15, background: C.g100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", animation: "float 3s ease-in-out infinite" }}>
                                    <Wifi size={22} color={C.g300} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 4 }}>No active devices</div>
                                <div style={{ fontSize: 12, color: C.g400 }}>Devices appear here once they send data.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {connectedDevices.map((device: any) => {
                                    const isOnline = device.status === "ONLINE";
                                    return (
                                        <div key={device.serialNumber} style={{ background: C.g50, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${isOnline ? C.greenL : C.g200}`, transition: C.tr }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ position: "relative", width: 10, height: 10 }}>
                                                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: isOnline ? C.green : C.g300, display: "block" }} />
                                                        {isOnline && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green, animation: "ping 1.5s ease-in-out infinite" }} />}
                                                    </div>
                                                    <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, color: C.navy }}>{device.serialNumber || "Unknown"}</span>
                                                </div>
                                                <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: isOnline ? C.greenL : C.g100, color: isOnline ? C.greenD : C.g400 }}>
                                                    {isOnline ? "Online" : "Offline"}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.g400 }}>
                                                <span>Last seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : "Never"}</span>
                                                <span style={{ fontWeight: 700, color: C.navy }}>{device.totalPunches} uploads</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Help tip */}
                    <div style={{ background: C.amberXL, borderRadius: 16, padding: "16px 18px", border: `1px solid ${C.amberL}`, borderLeft: `4px solid ${C.amber}` }}>
                        <div style={{ display: "flex", gap: 10 }}>
                            <Info size={15} color={C.amberD} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.amberD, marginBottom: 4 }}>Need Help?</div>
                                <p style={{ fontSize: 12.5, color: C.amberD, opacity: 0.75, margin: 0, lineHeight: 1.6 }}>
                                    Most devices use port 80 or 443. Ensure your firewall allows outbound traffic to our server.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Tabs ── */}
                <Card style={{ padding: 0, overflow: "hidden" }}>
                    {/* Tab Navigation */}
                    <div style={{ display: "flex", borderBottom: `1.5px solid ${C.g100}`, padding: "0 24px" }}>
                        {[
                            { id: "mapping", label: "User Mapping", icon: Users, badge: unmappedIds.length > 0 ? unmappedIds.length : null },
                            { id: "logs", label: "Recent Logs", icon: Activity, badge: null },
                        ].map(tab => {
                            const active = activeTab === tab.id;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px", border: "none", background: "transparent", cursor: "pointer", borderBottom: active ? `3px solid ${C.amber}` : "3px solid transparent", color: active ? C.navy : C.g400, fontWeight: active ? 700 : 600, fontSize: 13.5, transition: C.tr, marginBottom: -1.5, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                    <tab.icon size={15} strokeWidth={2.2} />
                                    {tab.label}
                                    {tab.badge !== null && (
                                        <span style={{ padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: C.redL, color: C.red, minWidth: 20, textAlign: "center" }}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div style={{ padding: "24px" }}>
                        {/* ── MAPPING TAB ── */}
                        {activeTab === "mapping" && (
                            <div>
                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Unmapped Biometric IDs</div>
                                    <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>These IDs have punched in but aren't linked to a staff member yet.</p>
                                </div>

                                {unmappedIds.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                        <div style={{ width: 64, height: 64, borderRadius: 18, background: C.greenL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                            <CheckCircle2 size={28} color={C.green} strokeWidth={2} />
                                        </div>
                                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 6 }}>All Caught Up!</div>
                                        <p style={{ fontSize: 13.5, color: C.g400, maxWidth: 320, margin: "0 auto" }}>All biometric IDs are mapped to system users. New IDs will appear here automatically.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {unmappedIds.map((id: string) => (
                                            <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "center", background: C.g50, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${C.g200}`, transition: C.tr }}
                                                onMouseEnter={e => { (e.currentTarget as any).style.borderColor = C.amber; (e.currentTarget as any).style.background = C.amberXL; }}
                                                onMouseLeave={e => { (e.currentTarget as any).style.borderColor = C.g200; (e.currentTarget as any).style.background = C.g50; }}>
                                                {/* Device ID */}
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: C.orangeL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 800, color: C.orange }}>{id}</span>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Device ID: {id}</div>
                                                        <div style={{ fontSize: 11.5, color: C.g400 }}>Awaiting mapping</div>
                                                    </div>
                                                </div>
                                                {/* Staff select */}
                                                <div style={{ position: "relative" }}>
                                                    <select value={selectedUsers[id] || ""} onChange={e => setSelectedUsers(p => ({ ...p, [id]: e.target.value }))}
                                                        style={{ width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10, border: `1.5px solid ${selectedUsers[id] ? C.amber : C.g200}`, background: selectedUsers[id] ? C.amberXL : "white", fontSize: 13, fontWeight: 600, color: C.g800, outline: "none", appearance: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                                                        <option value="">Select Staff Member...</option>
                                                        {staffList.map((s: any) => (
                                                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={14} color={C.g400} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                                </div>
                                                {/* Link button */}
                                                <Btn icon={LinkIcon} variant={selectedUsers[id] ? "success" : "secondary"} size="sm" disabled={!selectedUsers[id]} loading={mappingLoading[id]} onClick={() => handleLinkUser(id)}>
                                                    Map
                                                </Btn>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── LOGS TAB ── */}
                        {activeTab === "logs" && (
                            <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                                    <div>
                                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Recent Validations</div>
                                        <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>Live feed of processed biometric punches.</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: C.greenL, border: `1px solid ${C.greenL}` }}>
                                        <div style={{ position: "relative", width: 8, height: 8 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "block" }} />
                                            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green, animation: "ping 1.5s ease-in-out infinite" }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: C.greenD }}>Live</span>
                                    </div>
                                </div>

                                {recentLogs.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "40px 20px", borderRadius: 16, border: `2px dashed ${C.g200}`, background: C.g50 }}>
                                        <div style={{ width: 52, height: 52, borderRadius: 15, background: C.g100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", animation: "float 3s ease-in-out infinite" }}>
                                            <Clock size={22} color={C.g300} />
                                        </div>
                                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 5 }}>No logs yet</div>
                                        <p style={{ fontSize: 13, color: C.g400 }}>Punch events from devices will appear here in real-time.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {recentLogs.map((log: any, i: number) => {
                                            const isUnknown = log.userName === "Unknown";
                                            const isIN = log.statusLabel === "IN";
                                            const statusColor = isIN ? C.green : C.amber;
                                            const statusBg = isIN ? C.greenL : C.amberL;
                                            return (
                                                <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto auto", gap: 14, alignItems: "center", background: C.g50, borderRadius: 14, padding: "12px 16px", border: `1px solid ${C.g100}`, animation: `fadeUp 0.25s ease ${i * 0.04}s both` }}>
                                                    {/* Time */}
                                                    <div style={{ fontFamily: "monospace", fontSize: 12, color: C.g500, fontWeight: 700 }}>
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                    {/* User */}
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{ width: 30, height: 30, borderRadius: 9, background: isUnknown ? C.g100 : C.blueL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 800, color: isUnknown ? C.g400 : C.blue }}>{log.userName.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: isUnknown ? C.g400 : C.navy }}>{log.userName}</div>
                                                            <div style={{ fontSize: 11, color: C.g400 }}>Device: {log.deviceId || "N/A"}</div>
                                                        </div>
                                                    </div>
                                                    {/* Status badge */}
                                                    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: statusBg, color: statusColor, whiteSpace: "nowrap" }}>
                                                        {log.statusLabel}
                                                    </span>
                                                    {/* Time full */}
                                                    <span style={{ fontSize: 11, color: C.g300, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                                                        {new Date(log.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
