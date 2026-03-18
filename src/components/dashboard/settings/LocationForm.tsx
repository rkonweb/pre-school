"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    MapPin, Mail, Phone, Globe, Save,
    Map as MapIcon, Search, Key, ExternalLink,
    AlertTriangle, Check, RefreshCcw,
} from "lucide-react";
import { updateSchoolProfileAction } from "@/app/actions/settings-actions";
import { toast } from "sonner";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { GOOGLE_MAPS_LIBRARIES, DEFAULT_MAP_STYLES } from "@/lib/maps-config";

// ─── DESIGN TOKENS ─────────────────────────────────────────
const C = {
    amber: "#F59E0B", amberD: "#D97706", amberL: "#FEF3C7", amberXL: "#FFFBEB",
    navy: "#1E1B4B", navyM: "#312E81",
    green: "#10B981", greenD: "#059669", greenL: "#D1FAE5", greenXL: "#ECFDF5",
    red: "#EF4444", redL: "#FEE2E2",
    blue: "var(--brand-color, #3B82F6)", 
    blueL: "rgba(var(--brand-color-rgb, 59, 130, 246), 0.12)", 
    blueXL: "rgba(var(--brand-color-rgb, 59, 130, 246), 0.05)",
    g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
    g300: "#D1D5DB", g400: "#9CA3AF", g500: "#6B7280",
    g600: "#4B5563", g700: "#374151", g800: "#1F2937",
    orange: "#F97316",
    sh: "0 4px 24px rgba(0,0,0,0.07)",
    tr: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
    spring: "cubic-bezier(0.34,1.56,0.64,1)",
};

// ─── RIPPLE BUTTON ─────────────────────────────────────────
function Btn({ variant = "primary", size = "md", icon: Icon, loading, disabled, children, onClick, type = "button" }: any) {
    const [ripples, setRipples] = useState<any[]>([]);
    const ref = useRef<HTMLButtonElement>(null);
    const vs: any = {
        primary: { bg: "var(--school-gradient, linear-gradient(135deg,#3B82F6,#6366F1))", color: "var(--secondary-color, white)", sh: "0 4px 16px rgba(var(--brand-color-rgb, 59, 130, 246), 0.25)" },
        navy: { bg: `linear-gradient(135deg,${C.navy},${C.navyM})`, color: "white", sh: `0 4px 14px ${C.navy}40` },
        success: { bg: `linear-gradient(135deg,${C.green},${C.greenD})`, color: "white", sh: `0 4px 14px ${C.green}40` },
        secondary: { bg: "white", color: C.navy, border: `1.5px solid ${C.g200}`, sh: C.sh },
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
            style={{ background: dis ? C.g100 : v.bg, color: dis ? C.g400 : v.color, border: v.border || "none", borderRadius: s.r, padding: s.p, fontSize: s.fs, fontWeight: 700, cursor: dis ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: dis ? "none" : v.sh, fontFamily: "'Plus Jakarta Sans',sans-serif", transition: `all 0.4s ${C.spring}, filter 0.15s`, opacity: dis ? 0.55 : 1, position: "relative", overflow: "hidden" }}>
            {ripples.map(rp => <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)", animation: "ripple 0.6s ease forwards", marginLeft: -4, marginTop: -4, pointerEvents: "none" }} />)}
            {loading ? <div style={{ width: 14, height: 14, border: `2px solid ${v.color}40`, borderTop: `2px solid ${v.color}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (Icon ? <Icon size={s.fs - 1} strokeWidth={2.2} /> : null)}
            {children}
        </button>
    );
}

// ─── LABELLED INPUT ────────────────────────────────────────
function FInput({ label, value, onChange, placeholder, type = "text", multiline, rows = 3, prefix: Prefix, required }: any) {
    const [focused, setFocused] = useState(false);
    const base: React.CSSProperties = {
        width: "100%", border: `1.5px solid ${focused ? C.blue : C.g200}`, borderRadius: 12,
        background: focused ? C.blueXL : C.g50, outline: "none",
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, fontWeight: 600, color: C.g800,
        transition: C.tr, boxShadow: focused ? `0 0 0 4px ${C.blue}20` : "none",
        boxSizing: "border-box" as const,
    };
    return (
        <div>
            {label && (
                <label style={{ fontSize: 10.5, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: 0.9, display: "block", marginBottom: 8 }}>
                    {label}{required && <span style={{ color: C.red }}> *</span>}
                </label>
            )}
            <div style={{ position: "relative" }}>
                {Prefix && <div style={{ position: "absolute", left: 14, top: multiline ? 14 : "50%", transform: multiline ? "none" : "translateY(-50%)", pointerEvents: "none" }}><Prefix size={16} color={focused ? C.blue : C.g300} strokeWidth={2} /></div>}
                {multiline ? (
                    <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder}
                        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                        style={{ ...base, padding: `12px ${Prefix ? 42 : 14}px`, resize: "none" }} />
                ) : (
                    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                        style={{ ...base, padding: `12px ${Prefix ? 42 : 14}px` }} />
                )}
            </div>
        </div>
    );
}

// ─── SECTION HEADER ────────────────────────────────────────
function SHdr({ icon: Icon, title, color = C.blue }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={color} strokeWidth={2.2} />
            </div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13.5, fontWeight: 800, color: C.navy }}>{title}</span>
        </div>
    );
}

// ─── DIVIDER ───────────────────────────────────────────────
function Divider() {
    return <div style={{ height: 1, background: `linear-gradient(90deg,${C.blue}20,${C.g200},transparent)`, margin: "26px 0" }} />;
}

// ─── CARD ──────────────────────────────────────────────────
function Card({ children, style = {} }: any) {
    return (
        <div style={{ background: "white", borderRadius: 20, padding: "26px 28px", boxShadow: C.sh, border: `1px solid ${C.g100}`, ...style }}>
            {children}
        </div>
    );
}

interface LocationFormProps { slug: string; initialData: any; }

export function LocationForm({ slug, initialData }: LocationFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState(initialData || {});
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingKey, setIsSavingKey] = useState(false);

    const activeKey = formData?.googleMapsApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: activeKey,
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateSchoolProfileAction(slug, formData);
        if (res.success) toast.success("Location and Contact updated");
        else toast.error(res.error || "Failed to update location");
        setIsSaving(false);
    };

    const handleSaveKey = async () => {
        setIsSavingKey(true);
        const res = await updateSchoolProfileAction(slug, { ...formData, googleMapsApiKey: formData.googleMapsApiKey });
        if (res.success) {
            toast.success("Maps API Key saved. Refreshing services...");
            router.refresh();
        } else {
            toast.error(res.error || "Failed to save API key");
        }
        setIsSavingKey(false);
    };

    const set = (field: string, value: any) => setFormData((p: any) => ({ ...p, [field]: value }));

    const mapCenter = useMemo(() => {
        const lat = parseFloat(formData?.latitude);
        const lng = parseFloat(formData?.longitude);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        return { lat: 40.7128, lng: -74.006 };
    }, [formData?.latitude, formData?.longitude]);

    // ── LOAD ERROR ────────────────────────────────────────
    if (loadError && activeKey) return (
        <Card>
            <style>{`@keyframes ripple{to{transform:scale(4);opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: C.redL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                    <AlertTriangle size={28} color={C.red} />
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 6 }}>Maps Configuration Error</div>
                <p style={{ fontSize: 12, color: C.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>ApiProjectMapError</p>
                <p style={{ fontSize: 13.5, color: C.g500, maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.7 }}>
                    The API Key is valid, but the <strong style={{ color: C.blue }}>Maps JavaScript API</strong> service is disabled for your Google Cloud project.
                </p>
                <div style={{ background: C.g50, borderRadius: 16, padding: "20px 24px", maxWidth: 360, margin: "0 auto 24px", border: `1px solid ${C.g100}`, textAlign: "left" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: C.g400, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14, borderBottom: `1px solid ${C.g200}`, paddingBottom: 10 }}>Activation Steps</div>
                    {[
                        "Go to console.cloud.google.com",
                        `Select project: "school-automation"`,
                        "Go to APIs & Services → Library",
                        `Enable "Maps JavaScript API"`,
                        `Enable "Places API" (for search)`,
                    ].map((step, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, background: C.blueL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 10, fontWeight: 800, color: C.blue }}>{i + 1}</span>
                            </div>
                            <span style={{ fontSize: 13, color: C.g600, lineHeight: 1.5 }}>{step}</span>
                        </div>
                    ))}
                </div>
                <Btn icon={RefreshCcw} variant="navy" size="md" onClick={() => router.refresh()}>Retry Synchronization</Btn>
            </div>
        </Card>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
            `}</style>

            {/* ── API KEY CARD ── */}
            <Card style={{ position: "relative", overflow: "hidden", animation: "fadeUp 0.35s ease" }}>
                {/* Watermark */}
                <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.04, pointerEvents: "none" }}>
                    <Key size={130} color={C.navy} />
                </div>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.navy},${C.navyM})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${C.navy}40` }}>
                                <Key size={17} color="white" strokeWidth={2} />
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.navy }}>Google Maps Integration</div>
                                <div style={{ fontSize: 11.5, color: C.g400, fontWeight: 600 }}>Platform credentials for map and address features</div>
                            </div>
                        </div>
                        <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank"
                            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: C.blue, background: C.blueL, padding: "6px 14px", borderRadius: 9, border: `1px solid ${C.blueL}`, textDecoration: "none", transition: C.tr }}>
                            Get API Key <ExternalLink size={11} strokeWidth={2.5} />
                        </a>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <input type="password" value={formData.googleMapsApiKey || ""} onChange={e => set("googleMapsApiKey", e.target.value)}
                                placeholder="Paste your Google Maps API Key here..."
                                style={{ width: "100%", height: 52, background: C.g50, border: `1.5px solid ${C.g200}`, borderRadius: 14, padding: "0 16px", fontFamily: "monospace", fontSize: 13.5, color: C.g800, outline: "none", boxSizing: "border-box", transition: C.tr }}
                                onFocus={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.background = C.amberXL; e.currentTarget.style.boxShadow = `0 0 0 4px ${C.amber}20`; }}
                                onBlur={e => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.background = C.g50; e.currentTarget.style.boxShadow = "none"; }} />
                            {activeKey && (
                                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", padding: "3px 9px", borderRadius: 20, background: C.greenL, border: `1px solid ${C.greenL}`, display: "flex", alignItems: "center", gap: 5 }}>
                                    <Check size={10} color={C.greenD} strokeWidth={3} />
                                    <span style={{ fontSize: 10, fontWeight: 800, color: C.greenD }}>Validated</span>
                                </div>
                            )}
                        </div>
                        <Btn icon={Save} variant="navy" size="md" loading={isSavingKey} onClick={handleSaveKey}>
                            Process Key
                        </Btn>
                    </div>

                    {!activeKey && (
                        <div style={{ marginTop: 14, padding: "12px 16px", background: C.amberXL, border: `1px solid ${C.amberL}`, borderLeft: `4px solid ${C.amber}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
                            <AlertTriangle size={15} color={C.amberD} />
                            <span style={{ fontSize: 12.5, color: C.amberD, fontWeight: 600 }}>
                                Map services (Autocomplete & Map View) disabled. Provide a valid API key to enable institutional tracking.
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            {/* ── LOCATION & MAP CARD ── */}
            <Card style={{ animation: "fadeUp 0.4s ease 0.08s both" }}>
                {/* Search bar */}
                <SHdr icon={Search} title="Institutional Locator" color={C.blue} />
                {isLoaded && activeKey ? (
                    <div style={{ marginBottom: 24 }}>
                        <PlacesAutocomplete onAddressSelect={(address: any, lat: number, lng: number) => {
                            setFormData((p: any) => ({
                                ...p,
                                address: address.formatted_address,
                                city: address.city,
                                state: address.state,
                                zip: address.zip,
                                country: address.country,
                                latitude: lat.toString(),
                                longitude: lng.toString(),
                            }));
                        }} />
                    </div>
                ) : (
                    <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", border: `2px dashed ${C.g200}`, borderRadius: 14, background: C.g50, marginBottom: 24 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.g300, textTransform: "uppercase", letterSpacing: 0.8 }}>
                            {activeKey ? "Warming up search engines..." : "Provide API Key to enable search"}
                        </span>
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                    {/* ── Physical Address ── */}
                    <div>
                        <SHdr icon={MapPin} title="Physical Address" color={C.blue} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <FInput label="Street Address" value={formData.address || ""} onChange={(e: any) => set("address", e.target.value)} placeholder="Enter full physical address..." multiline rows={3} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <FInput label="City" value={formData.city || ""} onChange={(e: any) => set("city", e.target.value)} />
                                <FInput label="State / Province" value={formData.state || ""} onChange={(e: any) => set("state", e.target.value)} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <FInput label="Postal Code" value={formData.zip || ""} onChange={(e: any) => set("zip", e.target.value)} />
                                <FInput label="Country" value={formData.country || ""} onChange={(e: any) => set("country", e.target.value)} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <FInput label="Latitude" value={formData.latitude || ""} onChange={(e: any) => set("latitude", e.target.value)} />
                                <FInput label="Longitude" value={formData.longitude || ""} onChange={(e: any) => set("longitude", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* ── Map ── */}
                    <div>
                        <SHdr icon={MapIcon} title="Virtual Presence" color={C.amber} />
                        <div style={{ height: 360, borderRadius: 16, overflow: "hidden", border: `1.5px solid ${C.g200}`, background: C.g50, position: "relative" }}>
                            {isLoaded && activeKey ? (
                                <>
                                    <GoogleMap zoom={15} center={mapCenter} mapContainerStyle={{ width: "100%", height: "100%" }}
                                        options={{ disableDefaultUI: true, styles: DEFAULT_MAP_STYLES }}>
                                        <MarkerF position={mapCenter} />
                                    </GoogleMap>
                                    {/* Coordinate overlay */}
                                    <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: C.sh }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <MapPin size={13} color="white" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: C.g400, textTransform: "uppercase", letterSpacing: 0.7 }}>Current Sync</div>
                                            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>
                                                {formData.latitude || "0.0"}, {formData.longitude || "0.0"}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, textAlign: "center", padding: 24 }}>
                                    <div style={{ width: 60, height: 60, borderRadius: 18, background: "white", boxShadow: C.sh, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.g100}` }}>
                                        <AlertTriangle size={24} color={C.g300} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Map Service Unavailable</div>
                                        <p style={{ fontSize: 12, color: C.g400 }}>
                                            {activeKey ? "Synchronizing with satellite network..." : "Provide an API Key to activate the map view."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: 14, padding: "12px 16px", background: C.amberXL, border: `1px solid ${C.amberL}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
                            <Globe size={15} color={C.amberD} />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.amberD }}>
                                Precise coordinates ensure parent navigation apps lead accurately to your gate.
                            </span>
                        </div>
                    </div>
                </div>

                <Divider />

                {/* ── Contact ── */}
                <SHdr icon={Phone} title="Contact Information" color={C.green} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <FInput label="Primary Contact Email" value={formData.email || ""} onChange={(e: any) => set("email", e.target.value)} placeholder="admin@school.edu" prefix={Mail} />
                    <FInput label="Front Desk Hotline" value={formData.phone || ""} onChange={(e: any) => set("phone", e.target.value)} placeholder="+91 98765 43210" prefix={Phone} />
                </div>

                {/* Save */}
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${C.g100}`, paddingTop: 20 }}>
                    <Btn icon={Save} variant="navy" size="lg" loading={isSaving} onClick={handleSave}>
                        Save Location & Contact
                    </Btn>
                </div>
            </Card>
        </div>
    );
}

// ─── PLACES AUTOCOMPLETE ────────────────────────────────────
function PlacesAutocomplete({ onAddressSelect }: { onAddressSelect: (address: any, lat: number, lng: number) => void }) {
    const { ready, value, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({ debounce: 300 });
    const [focused, setFocused] = useState(false);

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            const components = results[0].address_components;
            const getComponent = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || "";
            onAddressSelect({
                formatted_address: results[0].formatted_address,
                city: getComponent("locality") || getComponent("administrative_area_level_2"),
                state: getComponent("administrative_area_level_1"),
                zip: getComponent("postal_code"),
                country: getComponent("country"),
            }, lat, lng);
        } catch (error) {
            console.error("Error fetching geocode:", error);
            toast.error("Failed to fetch location details");
        }
    };

    return (
        <div style={{ position: "relative", zIndex: 70 }}>
            <div style={{ position: "relative" }}>
                <Search size={16} color={focused ? C.blue : C.g300} strokeWidth={2} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: C.tr }} />
                <input value={value} onChange={e => setValue(e.target.value)} disabled={!ready}
                    onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)}
                    placeholder="Search for school address to sync coordinates..."
                    style={{ width: "100%", height: 52, background: focused ? C.blueXL : C.g50, border: `1.5px solid ${focused ? C.blue : C.g200}`, borderRadius: 14, padding: "0 16px 0 46px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13.5, fontWeight: 600, color: C.g800, outline: "none", boxSizing: "border-box", transition: C.tr, boxShadow: focused ? `0 0 0 4px ${C.blue}20` : "none" }} />
            </div>
            {status === "OK" && (
                <ul style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 8px)", background: "white", border: `1px solid ${C.g100}`, borderRadius: 16, boxShadow: C.sh, overflow: "hidden", listStyle: "none", margin: 0, padding: 0, animation: "slideDown 0.2s ease" }}
                    onMouseDown={e => e.preventDefault()}>
                    {data.map(({ place_id, description }) => (
                        <li key={place_id} onClick={() => handleSelect(description)}
                            onMouseEnter={e => { (e.currentTarget as any).style.background = C.blueXL; }}
                            onMouseLeave={e => { (e.currentTarget as any).style.background = "transparent"; }}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", transition: C.tr, borderBottom: `1px solid ${C.g50}` }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.blueL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <MapPin size={15} color={C.blue} strokeWidth={2.2} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy }}>{description.split(",")[0]}</div>
                                <div style={{ fontSize: 11.5, color: C.g400, fontWeight: 500 }}>{description.split(",").slice(1).join(",").trim()}</div>
                            </div>
                        </li>
                    ))}
                    <div style={{ padding: "8px 16px", background: C.g50, borderTop: `1px solid ${C.g100}`, textAlign: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: C.g300, textTransform: "uppercase", letterSpacing: 1.2 }}>Validated by Google Cloud</span>
                    </div>
                </ul>
            )}
        </div>
    );
}
