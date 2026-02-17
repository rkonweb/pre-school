"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTenantByIdAction, updateTenantAction } from "@/app/actions/tenant-actions";
import { getSystemSettingsAction } from "@/app/actions/settings-actions";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";
import {
    Building2,
    MapPin,
    ShieldCheck,
    Globe,
    CheckCircle2,
    Laptop,
    Mail,
    Phone,
    Loader2,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Calendar,
    Type,
    Zap,
    Crown,
    Star,
    Image as ImageIcon,
    Save,
    ArrowLeft,
    CreditCard,
    Settings,
    Users,
    Palette,
    Link2,
    Hash,
    AlertCircle,
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_FEATURES, ADDONS, calculateMRR, PLAN_PRICES } from "@/config/subscription";
import { toast } from "sonner";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹" };
const EXCHANGE_RATES: Record<string, number> = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 };
const convertPrice = (priceInInr: number, currency: string) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    const converted = priceInInr * rate;
    if (currency === "INR") return Math.round(converted);
    return Math.ceil(converted);
};

// --- Section anchor definitions ---
const SECTIONS = [
    { id: "profile", label: "School Profile", icon: Building2 },
    { id: "social", label: "Social Media", icon: Link2 },
    { id: "contact", label: "Location & Contact", icon: MapPin },
    { id: "admin", label: "Admin Profile", icon: ShieldCheck },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "modules", label: "Modules", icon: Settings },
    { id: "addons", label: "Add-ons", icon: Star },
    { id: "branches", label: "Branches", icon: Users },
    { id: "status", label: "Status", icon: Zap },
];

export default function EditTenantPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [activeSection, setActiveSection] = useState("profile");
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [formData, setFormData] = useState({
        schoolName: "",
        subdomain: "",
        brandColor: "#2563eb",
        website: "",
        motto: "",
        foundingYear: "",
        logo: "",
        socialFacebook: "",
        socialTwitter: "",
        socialLinkedin: "",
        socialInstagram: "",
        socialYoutube: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
        latitude: "",
        longitude: "",
        contactEmail: "",
        contactPhone: "",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        adminDesignation: "",
        plan: "Growth" as any,
        planId: "",
        currency: "INR",
        timezone: "UTC+5:30 (IST)",
        dateFormat: "DD/MM/YYYY",
        modules: [] as string[],
        addons: [] as string[],
        status: "ACTIVE" as any,
        subscriptionStatus: "TRIAL",
        subscriptionStartDate: "",
        subscriptionEndDate: "",
        maxBranches: 1,
    });

    // Scroll spy
    useEffect(() => {
        const onScroll = () => {
            setShowScrollTop(window.scrollY > 400);
            for (let i = SECTIONS.length - 1; i >= 0; i--) {
                const el = document.getElementById(`section-${SECTIONS[i].id}`);
                if (el && el.getBoundingClientRect().top <= 120) {
                    setActiveSection(SECTIONS[i].id);
                    break;
                }
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [tenant, settingsRes, plansData] = await Promise.all([
                    getTenantByIdAction(id),
                    getSystemSettingsAction(),
                    getSubscriptionPlansAction()
                ]);
                setPlans(plansData);
                if (tenant) {
                    setBranches(tenant.branches || []);
                    setFormData({
                        schoolName: tenant.name,
                        subdomain: tenant.subdomain || "",
                        brandColor: tenant.brandColor || "#2563eb",
                        website: tenant.website || "",
                        motto: tenant.motto || "",
                        foundingYear: tenant.foundingYear || "",
                        logo: tenant.logo || "",
                        socialFacebook: tenant.socialMedia?.facebook || "",
                        socialTwitter: tenant.socialMedia?.twitter || "",
                        socialLinkedin: tenant.socialMedia?.linkedin || "",
                        socialInstagram: tenant.socialMedia?.instagram || "",
                        socialYoutube: tenant.socialMedia?.youtube || "",
                        address: tenant.address || "",
                        city: tenant.city || "",
                        state: tenant.state || "",
                        zip: tenant.zip || "",
                        country: tenant.country || "India",
                        latitude: tenant.latitude || "",
                        longitude: tenant.longitude || "",
                        contactEmail: tenant.contactEmail || "",
                        contactPhone: tenant.contactPhone || "",
                        adminName: tenant.adminName,
                        adminEmail: (() => {
                            const email = tenant.adminEmail || tenant.email || "";
                            // Only use the email if it's valid, otherwise use empty string
                            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                return email;
                            }
                            return "";
                        })(),
                        adminPhone: tenant.adminPhone || "",
                        adminDesignation: tenant.adminDesignation || "",
                        plan: tenant.plan,
                        planId: tenant.planId || "",
                        currency: tenant.currency || (settingsRes.success && settingsRes.data ? settingsRes.data.currency : "INR"),
                        timezone: tenant.timezone || (settingsRes.success && settingsRes.data ? settingsRes.data.timezone : "UTC+5:30 (IST)"),
                        dateFormat: tenant.dateFormat || "DD/MM/YYYY",
                        modules: tenant.modules || [],
                        addons: tenant.addons || [],
                        status: tenant.status,
                        subscriptionStatus: tenant.subscriptionStatus || tenant.status || "TRIAL",
                        subscriptionStartDate: tenant.subscriptionStartDate ? new Date(tenant.subscriptionStartDate).toISOString().split("T")[0] : "",
                        subscriptionEndDate: tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toISOString().split("T")[0] : "",
                        maxBranches: tenant.maxBranches || 1,
                    });
                } else {
                    setValidationErrors(["Tenant not found or deleted."]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const validateForm = (): boolean => {
        const errors: string[] = [];
        if (!formData.schoolName.trim()) errors.push("School Name is required");
        if (!formData.adminName.trim()) errors.push("Admin Name is required");
        if (formData.adminEmail && formData.adminEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
            errors.push("Admin Email is invalid");
        }
        if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            errors.push("School Email is invalid");
        }
        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error("Please fix validation errors before saving.");
            return;
        }
        setIsSaving(true);
        try {
            const result = await updateTenantAction(id, {
                name: formData.schoolName,
                subdomain: formData.subdomain,
                brandColor: formData.brandColor,
                website: formData.website,
                motto: formData.motto,
                foundingYear: formData.foundingYear,
                logo: formData.logo,
                socialMedia: {
                    facebook: formData.socialFacebook,
                    twitter: formData.socialTwitter,
                    linkedin: formData.socialLinkedin,
                    instagram: formData.socialInstagram,
                    youtube: formData.socialYoutube,
                },
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: formData.country,
                latitude: formData.latitude,
                longitude: formData.longitude,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                phone: formData.contactPhone,
                email: formData.adminEmail,
                adminName: formData.adminName,
                adminPhone: formData.adminPhone,
                adminDesignation: formData.adminDesignation,
                plan: formData.plan,
                currency: formData.currency,
                timezone: formData.timezone,
                dateFormat: formData.dateFormat,
                modules: formData.modules,
                addons: formData.addons,
                status: formData.status,
                subscriptionStatus: formData.subscriptionStatus,
                subscriptionStartDate: formData.subscriptionStartDate || undefined,
                subscriptionEndDate: formData.subscriptionEndDate || undefined,
            });
            if (result.success) {
                toast.success("School details saved successfully!");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to save changes");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const scrollToSection = (sectionId: string) => {
        const el = document.getElementById(`section-${sectionId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-zinc-500">Loading school details...</p>
                </div>
            </div>
        );
    }

    if (validationErrors.includes("Tenant not found or deleted.")) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 max-w-md w-full text-center space-y-4">
                    <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto text-red-600">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Tenant Not Found</h2>
                        <p className="text-sm text-zinc-500 mt-1">The school you are trying to edit does not exist or has been deleted.</p>
                    </div>
                    <button onClick={() => router.push("/admin/tenants")} className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all">
                        Back to Tenants
                    </button>
                    <p className="text-[10px] text-zinc-400 font-mono">ID: {id}</p>
                </div>
            </div>
        );
    }

    const SectionCard = ({ id: sectionId, title, subtitle, icon: Icon, children }: { id: string; title: string; subtitle: string; icon: any; children: React.ReactNode }) => (
        <section id={`section-${sectionId}`} className="scroll-mt-24">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="px-8 py-5 border-b border-zinc-50 bg-gradient-to-r from-zinc-50/80 to-white flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
                        <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>
                    </div>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </section>
    );

    const InputField = ({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) => (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );

    const inputClass = (hasError?: boolean) => cn(
        "w-full rounded-xl border bg-zinc-50/50 p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all outline-none",
        hasError ? "border-red-300" : "border-zinc-200"
    );

    const iconInputClass = "w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-10 pr-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all outline-none";

    return (
        <div className="min-h-screen bg-zinc-50/70 font-sans">
            {/* Sticky Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/admin/tenants")} className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                        <ArrowLeft className="h-4 w-4 text-zinc-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        {formData.logo ? (
                            <img src={formData.logo} alt="" className="h-9 w-9 rounded-xl object-cover border border-zinc-200" />
                        ) : (
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: formData.brandColor }}>
                                {formData.schoolName.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 className="font-bold text-zinc-900 leading-tight text-sm">{formData.schoolName || "School Details"}</h1>
                            <p className="text-[10px] text-zinc-400 font-mono">{formData.subdomain}.preschool-erp.com</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {validationErrors.length > 0 && (
                        <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold mr-2">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {validationErrors.length} error{validationErrors.length > 1 ? "s" : ""}
                        </div>
                    )}
                    <button onClick={() => router.push("/admin/tenants")} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex gap-8 p-8">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:block w-56 shrink-0">
                    <nav className="sticky top-24 space-y-1">
                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => scrollToSection(s.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-medium transition-all",
                                    activeSection === s.id
                                        ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/60"
                                )}
                            >
                                <s.icon className={cn("h-4 w-4 shrink-0", activeSection === s.id ? "text-blue-600" : "")} />
                                {s.label}
                            </button>
                        ))}
                        {/* MRR preview */}
                        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Est. MRR</p>
                            <p className="text-2xl font-black mt-1">
                                {CURRENCY_SYMBOLS[formData.currency] || "₹"}{convertPrice(calculateMRR(formData.plan, formData.addons), formData.currency)}
                            </p>
                            <p className="text-[10px] text-blue-200 mt-1">{formData.plan} + {formData.addons.length} add-ons</p>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 space-y-6">
                    {/* Validation Errors Banner */}
                    {validationErrors.length > 0 && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-800">Please fix the following errors:</p>
                                <ul className="mt-1 space-y-0.5">
                                    {validationErrors.map((e, i) => (
                                        <li key={i} className="text-xs text-red-600 font-medium">• {e}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* ─── SECTION: SCHOOL PROFILE ─── */}
                    <SectionCard id="profile" title="School Profile" subtitle="Core identity, branding, and visual configuration" icon={Building2}>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <InputField label="School Name" required error={validationErrors.some(e => e.includes("School Name"))}>
                                    <input type="text" value={formData.schoolName} onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                                        autoComplete="off"
                                        placeholder="e.g. Little Chanakyas Preschool" className={inputClass(validationErrors.some(e => e.includes("School Name")))} />
                                </InputField>
                                <InputField label="Domain Prefix">
                                    <div className="flex rounded-xl border border-zinc-200 bg-zinc-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                                        <input type="text" value={formData.subdomain} onChange={e => setFormData({ ...formData, subdomain: e.target.value })}
                                            autoComplete="off"
                                            placeholder="little-chanakyas" className="flex-1 bg-transparent p-3 font-mono text-sm outline-none font-bold text-zinc-700" />
                                        <div className="bg-zinc-100 px-4 flex items-center text-zinc-500 text-xs font-medium border-l border-zinc-200">.preschool-erp.com</div>
                                    </div>
                                </InputField>
                                <InputField label="Public Website">
                                    <div className="relative">
                                        <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })}
                                            autoComplete="off"
                                            placeholder="https://www.school.com" className={iconInputClass} />
                                    </div>
                                </InputField>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Founding Year">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input type="number" value={formData.foundingYear} onChange={e => setFormData({ ...formData, foundingYear: e.target.value })}
                                                autoComplete="off"
                                                placeholder="2005" className={iconInputClass} />
                                        </div>
                                    </InputField>
                                    <InputField label="School Motto">
                                        <div className="relative">
                                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input type="text" value={formData.motto} onChange={e => setFormData({ ...formData, motto: e.target.value })}
                                                autoComplete="off"
                                                placeholder="Excellence in Education" className={iconInputClass} />
                                        </div>
                                    </InputField>
                                </div>
                            </div>
                            <div className="space-y-5">
                                <InputField label="School Logo">
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30">
                                        {formData.logo ? (
                                            <img src={formData.logo} alt="Logo" className="h-16 w-16 rounded-xl object-cover border border-zinc-200" />
                                        ) : (
                                            <div className="h-16 w-16 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                                                <ImageIcon className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input type="url" value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                                autoComplete="off"
                                                placeholder="Paste logo URL" className="w-full text-xs rounded-lg border border-zinc-200 bg-white p-2 font-medium focus:ring-2 focus:ring-blue-500/30 outline-none" />
                                            <p className="text-[10px] text-zinc-400 mt-1">Recommended: 512×512px, PNG or SVG</p>
                                        </div>
                                    </div>
                                </InputField>
                                <InputField label="Brand Color">
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50/30">
                                        <input type="color" value={formData.brandColor} onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                                            className="h-12 w-16 rounded-lg cursor-pointer border-0 bg-transparent p-0" />
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{formData.brandColor}</p>
                                            <p className="text-[10px] text-zinc-400">Used for buttons, sidebar, and highlights</p>
                                        </div>
                                        <div className="ml-auto flex gap-1">
                                            {["#2563eb", "#7c3aed", "#dc2626", "#059669", "#AE7B64"].map(c => (
                                                <button key={c} onClick={() => setFormData({ ...formData, brandColor: c })}
                                                    className={cn("h-7 w-7 rounded-lg border-2 transition-all hover:scale-110", formData.brandColor === c ? "border-zinc-900 scale-110" : "border-transparent")}
                                                    style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>
                                </InputField>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ─── SECTION: SOCIAL MEDIA ─── */}
                    <SectionCard id="social" title="Social Media Pages" subtitle="Manage the school's social media presence across platforms" icon={Link2}>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { key: "socialFacebook", label: "Facebook", icon: Facebook, color: "text-blue-600", placeholder: "https://facebook.com/school" },
                                { key: "socialTwitter", label: "Twitter / X", icon: Twitter, color: "text-sky-500", placeholder: "https://x.com/school" },
                                { key: "socialLinkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700", placeholder: "https://linkedin.com/company/school" },
                                { key: "socialInstagram", label: "Instagram", icon: Instagram, color: "text-pink-600", placeholder: "https://instagram.com/school" },
                                { key: "socialYoutube", label: "YouTube", icon: Youtube, color: "text-red-600", placeholder: "https://youtube.com/@school" },
                            ].map(s => (
                                <div key={s.key} className="relative">
                                    <s.icon className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", s.color)} />
                                    <input
                                        type="url"
                                        value={(formData as any)[s.key]}
                                        onChange={e => setFormData({ ...formData, [s.key]: e.target.value })}
                                        autoComplete="off"
                                        placeholder={s.placeholder}
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50/50 border py-3 pl-10 pr-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* ─── SECTION: LOCATION & CONTACT ─── */}
                    <SectionCard id="contact" title="Location & Contact" subtitle="Physical address, geo-coordinates, and contact information" icon={MapPin}>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <InputField label="Street Address">
                                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        autoComplete="off"
                                        placeholder="123 Education Lane" className={inputClass()} />
                                </InputField>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="City">
                                        <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} autoComplete="off" className={inputClass()} />
                                    </InputField>
                                    <InputField label="State / Province">
                                        <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} autoComplete="off" className={inputClass()} />
                                    </InputField>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Zip / Postal Code">
                                        <input type="text" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} autoComplete="off" className={inputClass()} />
                                    </InputField>
                                    <InputField label="Country">
                                        <select value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className={inputClass()}>
                                            <option>India</option><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Singapore</option>
                                        </select>
                                    </InputField>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Latitude">
                                        <input type="text" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                            autoComplete="off"
                                            placeholder="12.9716" className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
                                    </InputField>
                                    <InputField label="Longitude">
                                        <input type="text" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                            autoComplete="off"
                                            placeholder="77.5946" className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500/30 outline-none" />
                                    </InputField>
                                </div>
                                <div className="h-px bg-zinc-100 my-2" />
                                <InputField label="School Email">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                            autoComplete="off"
                                            placeholder="info@school.com" className={cn(iconInputClass, validationErrors.some(e => e.includes("School Email")) ? "border-red-300" : "")} />
                                    </div>
                                </InputField>
                                <InputField label="School Phone">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <input type="tel" value={formData.contactPhone} maxLength={15}
                                            autoComplete="off"
                                            onChange={e => { const val = e.target.value.replace(/[^+\d]/g, ""); setFormData({ ...formData, contactPhone: val }); }}
                                            placeholder="+91 98765 43210" className={iconInputClass} />
                                    </div>
                                </InputField>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ─── SECTION: ADMIN PROFILE ─── */}
                    <SectionCard id="admin" title="Administrator Profile" subtitle="Primary admin account — the unique phone number used during signup" icon={ShieldCheck}>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-700 text-sm mb-6">
                            <ShieldCheck className="h-5 w-5 shrink-0" />
                            <p className="text-xs font-medium">This user has full <strong>Super Admin</strong> privileges. The mobile number is the globally unique login credential and cannot be changed here.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <InputField label="Admin Full Name" required error={validationErrors.some(e => e.includes("Admin Name"))}>
                                <input type="text" value={formData.adminName} onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                    autoComplete="off"
                                    placeholder="Aryan Sharma" className={inputClass(validationErrors.some(e => e.includes("Admin Name")))} />
                            </InputField>
                            <InputField label="Designation / Title">
                                <input type="text" value={formData.adminDesignation} onChange={e => setFormData({ ...formData, adminDesignation: e.target.value })}
                                    autoComplete="off"
                                    placeholder="e.g. Principal, Director" className={inputClass()} />
                            </InputField>
                            <InputField label="Login Phone Number (Read-Only)">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input type="tel" value={formData.adminPhone} readOnly
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-3 pl-10 pr-3 text-sm font-mono font-bold text-zinc-500 cursor-not-allowed outline-none" />
                                </div>
                                <p className="text-[10px] text-amber-600 font-medium mt-1">⚠️ This is the globally unique signup phone. Contact support to change.</p>
                            </InputField>
                            <InputField label="Admin Email (Globally Unique)">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input type="email" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                        autoComplete="off"
                                        placeholder="admin@school.com" className={cn(iconInputClass, validationErrors.some(e => e.includes("Admin Email")) ? "border-red-300" : "")} />
                                </div>
                            </InputField>
                        </div>
                    </SectionCard>

                    {/* ─── SECTION: SUBSCRIPTION ─── */}
                    <SectionCard id="subscription" title="Subscription & Billing" subtitle="Manage plan, billing cycle, and subscription dates" icon={CreditCard}>
                        {/* Regional Settings */}
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            <InputField label="Currency">
                                <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className={inputClass()}>
                                    <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                                </select>
                            </InputField>
                            <InputField label="Timezone">
                                <select value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} className={inputClass()}>
                                    <option>UTC+5:30 (IST)</option><option>UTC-8 (PST)</option><option>UTC-5 (EST)</option><option>UTC+0 (GMT)</option><option>UTC+1 (CET)</option><option>UTC+8 (SGT)</option>
                                </select>
                            </InputField>
                            <InputField label="Date Format">
                                <select value={formData.dateFormat} onChange={e => setFormData({ ...formData, dateFormat: e.target.value })} className={inputClass()}>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </InputField>
                        </div>

                        {/* Plan Selection Cards */}
                        <p className="text-xs font-bold text-zinc-500 uppercase mb-3">Select Plan</p>
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => setFormData({ ...formData, plan: plan.name as any, modules: plan.includedModules })}
                                    className={cn(
                                        "relative rounded-2xl border-2 p-5 cursor-pointer transition-all hover:scale-[1.02]",
                                        formData.plan === plan.name
                                            ? (plan.tier === "premium" ? "border-indigo-500 bg-indigo-50/30 shadow-lg shadow-indigo-500/10" :
                                                plan.tier === "enterprise" ? "border-zinc-800 bg-zinc-50/30 shadow-lg shadow-zinc-800/10" :
                                                    "border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-500/10")
                                            : "border-zinc-100 bg-white hover:border-zinc-200"
                                    )}
                                >
                                    {formData.plan === plan.name && (
                                        <div className={cn(
                                            "absolute -top-2.5 left-1/2 -translate-x-1/2 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                                            plan.tier === "premium" ? "bg-indigo-500" : plan.tier === "enterprise" ? "bg-zinc-800" : "bg-blue-500"
                                        )}>Active</div>
                                    )}
                                    <h3 className="text-sm font-bold text-zinc-900">{plan.name}</h3>
                                    <div className="text-2xl font-black mt-1 text-zinc-900">
                                        {CURRENCY_SYMBOLS[formData.currency] || "₹"}{convertPrice(plan.price, formData.currency)}
                                        {plan.price > 0 && <span className="text-xs font-medium text-zinc-400">/mo</span>}
                                    </div>
                                    <ul className="mt-3 space-y-1.5">
                                        {plan.features.slice(0, 3).map((f, i) => (
                                            <li key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                                                <CheckCircle2 className={cn("h-3.5 w-3.5",
                                                    plan.tier === "premium" ? "text-indigo-500" :
                                                        plan.tier === "enterprise" ? "text-zinc-600" : "text-blue-500"
                                                )} />{f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Subscription Dates & Status */}
                        <div className="grid md:grid-cols-3 gap-4 p-5 rounded-xl bg-zinc-50/80 border border-zinc-100">
                            <InputField label="Subscription Status">
                                <select value={formData.subscriptionStatus} onChange={e => setFormData({ ...formData, subscriptionStatus: e.target.value })} className={inputClass()}>
                                    <option value="TRIAL">Trial</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="PAST_DUE">Past Due</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </InputField>
                            <InputField label="Start Date">
                                <input type="date" value={formData.subscriptionStartDate} onChange={e => setFormData({ ...formData, subscriptionStartDate: e.target.value })}
                                    autoComplete="off"
                                    className={inputClass()} />
                            </InputField>
                            <InputField label="End Date">
                                <input type="date" value={formData.subscriptionEndDate} onChange={e => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                                    autoComplete="off"
                                    className={inputClass()} />
                            </InputField>
                        </div>
                    </SectionCard>

                    {/* ─── SECTION: MODULES ─── */}
                    <SectionCard id="modules" title="Institutional Modules" subtitle="Enable or disable feature modules for this school" icon={Settings}>
                        <div className="flex items-center justify-end gap-2 mb-4">
                            <button onClick={() => setFormData(p => ({ ...p, modules: ["admissions", "students", "students.profiles", "students.attendance", "academics", "academics.curriculum", "academics.timetable", "academics.classes", "diary", "staff", "staff.directory", "staff.attendance", "staff.payroll", "billing", "inventory", "communication", "settings"] }))}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase">Enable All</button>
                            <span className="text-zinc-300">|</span>
                            <button onClick={() => setFormData(p => ({ ...p, modules: [] }))}
                                className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase">Disable All</button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { id: "admissions", label: "Admissions", desc: "Lead tracking & enrollment" },
                                { id: "students", label: "Students", desc: "Student profiles & records", sub: [{ id: "students.profiles", label: "Identity & Profiles" }, { id: "students.attendance", label: "Daily Attendance" }] },
                                { id: "academics", label: "Academics", desc: "Courses & scheduling", sub: [{ id: "academics.curriculum", label: "Curriculum Manager" }, { id: "academics.timetable", label: "Timetable & Rotations" }, { id: "academics.classes", label: "Classroom Allocation" }] },
                                { id: "diary", label: "Digital Diary", desc: "Daily logs & parent updates" },
                                { id: "staff", label: "Staff & HR", desc: "Employee management", sub: [{ id: "staff.directory", label: "Staff Directory" }, { id: "staff.attendance", label: "Punch Records" }, { id: "staff.payroll", label: "Payroll Automation" }] },
                                { id: "billing", label: "Billing & Fees", desc: "Fee collection & invoicing" },
                                { id: "inventory", label: "Inventory", desc: "Stock & asset tracking" },
                                { id: "communication", label: "Communication", desc: "Messaging & broadcast" },
                                { id: "settings", label: "System Config", desc: "Roles & global settings" },
                            ].map((mod) => (
                                <div key={mod.id} className={cn(
                                    "p-4 rounded-xl border transition-all duration-200",
                                    formData.modules.includes(mod.id) ? "bg-blue-50/50 border-blue-200" : "bg-white border-zinc-100 opacity-60 hover:opacity-100"
                                )}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <div className={cn(
                                            "mt-0.5 h-5 w-5 rounded-lg border flex items-center justify-center transition-all shrink-0",
                                            formData.modules.includes(mod.id) ? "bg-blue-600 border-blue-600" : "border-zinc-300 bg-white"
                                        )}>
                                            {formData.modules.includes(mod.id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={formData.modules.includes(mod.id)}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                let newModules = [...formData.modules];
                                                if (isChecked) {
                                                    newModules.push(mod.id);
                                                    if (mod.sub) mod.sub.forEach(s => { if (!newModules.includes(s.id)) newModules.push(s.id); });
                                                } else {
                                                    newModules = newModules.filter(x => x !== mod.id);
                                                    if (mod.sub) { const subIds = mod.sub.map(s => s.id); newModules = newModules.filter(x => !subIds.includes(x)); }
                                                }
                                                setFormData(p => ({ ...p, modules: newModules }));
                                            }} />
                                        <div className="flex-1">
                                            <span className="block text-sm font-bold text-zinc-900">{mod.label}</span>
                                            <span className="block text-[10px] text-zinc-500 font-medium mt-0.5">{mod.desc}</span>
                                        </div>
                                    </label>
                                    {mod.sub && (
                                        <div className="mt-3 pt-3 border-t border-blue-100/50 space-y-2 ml-8">
                                            {mod.sub.map(sub => (
                                                <label key={sub.id} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={cn(
                                                        "h-4 w-4 rounded-md border flex items-center justify-center transition-all",
                                                        formData.modules.includes(sub.id) ? "bg-blue-500 border-blue-500" : "border-zinc-200 bg-zinc-50"
                                                    )}>
                                                        {formData.modules.includes(sub.id) && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={formData.modules.includes(sub.id)}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            let newModules = [...formData.modules];
                                                            if (isChecked) { newModules.push(sub.id); if (!newModules.includes(mod.id)) newModules.push(mod.id); }
                                                            else { newModules = newModules.filter(x => x !== sub.id); }
                                                            setFormData(p => ({ ...p, modules: newModules }));
                                                        }} />
                                                    <span className={cn("text-[11px] font-bold transition-colors", formData.modules.includes(sub.id) ? "text-blue-700" : "text-zinc-400")}>{sub.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* ─── SECTION: ADD-ONS ─── */}
                    <SectionCard id="addons" title="Premium Add-ons" subtitle="Elevate the institutional experience with specialized integrations" icon={Star}>
                        <div className="grid md:grid-cols-2 gap-4">
                            {ADDONS.map((addon) => (
                                <div
                                    key={addon.id}
                                    onClick={() => {
                                        const newAddons = formData.addons.includes(addon.id) ? formData.addons.filter(i => i !== addon.id) : [...formData.addons, addon.id];
                                        setFormData({ ...formData, addons: newAddons });
                                    }}
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer",
                                        formData.addons.includes(addon.id)
                                            ? "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-600/20 scale-[1.01]"
                                            : "bg-white border-zinc-100 hover:border-zinc-200 text-zinc-600"
                                    )}
                                >
                                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", formData.addons.includes(addon.id) ? "bg-white/10" : "bg-zinc-50")}>
                                        <addon.icon className={cn("h-5 w-5", formData.addons.includes(addon.id) ? "text-white" : "text-zinc-400")} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-sm">{addon.label}</h5>
                                        <p className={cn("text-[10px] font-medium mt-0.5", formData.addons.includes(addon.id) ? "text-blue-200" : "text-zinc-400")}>{addon.desc}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={cn("text-xs font-black", formData.addons.includes(addon.id) ? "text-blue-200" : "text-zinc-900")}>
                                            +{CURRENCY_SYMBOLS[formData.currency] || "₹"}{addon.price}
                                        </p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Monthly</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {/* ─── SECTION: BRANCHES ─── */}
                    <SectionCard id="branches" title="Branch Management" subtitle="Control multi-branch capabilities for this school" icon={Users}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <InputField label="Max Branches Allowed">
                                    <input type="number" min="1" value={formData.maxBranches} onChange={e => setFormData({ ...formData, maxBranches: parseInt(e.target.value) || 1 })}
                                        className="w-24 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500/30 outline-none" />
                                </InputField>
                            </div>
                            <div className="px-4 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-600">
                                {branches.length} / {formData.maxBranches || 1} Used
                            </div>
                        </div>
                        {branches.length > 0 ? (
                            <div className="space-y-2">
                                {branches.map((branch) => (
                                    <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs",
                                                branch.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                                {branch.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-zinc-900">{branch.name}</p>
                                                <p className="text-[10px] text-zinc-400 font-mono">ID: {branch.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                                branch.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                                {branch.status}
                                            </span>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Are you sure you want to ${branch.status === 'ACTIVE' ? 'suspend' : 'activate'} this branch?`)) return;
                                                    const { toggleBranchStatusAction } = await import("@/app/actions/super-admin-actions");
                                                    const res = await toggleBranchStatusAction(formData.subdomain, branch.id);
                                                    if (res.success) {
                                                        setBranches(branches.map(b => b.id === branch.id ? { ...b, status: b.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : b));
                                                        toast.success("Branch status updated");
                                                    } else {
                                                        toast.error(res.error || "Failed to update branch");
                                                    }
                                                }}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                                            >
                                                {branch.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-400">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-medium">No branches created yet</p>
                            </div>
                        )}
                    </SectionCard>

                    {/* ─── SECTION: STATUS ─── */}
                    <SectionCard id="status" title="Operational Status" subtitle="Control the overall tenant status" icon={Zap}>
                        <div className="max-w-md">
                            <InputField label="Tenant Status">
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className={inputClass()}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="TRIAL">Trial</option>
                                    <option value="PAST_DUE">Past Due</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </InputField>
                            <div className="mt-4 flex items-center gap-3">
                                <div className={cn("h-3 w-3 rounded-full",
                                    formData.status === "ACTIVE" ? "bg-emerald-500" :
                                        formData.status === "TRIAL" ? "bg-blue-500" :
                                            formData.status === "PAST_DUE" ? "bg-amber-500" : "bg-red-500"
                                )} />
                                <p className="text-xs text-zinc-500 font-medium">
                                    {formData.status === "ACTIVE" && "School is fully operational with all features enabled."}
                                    {formData.status === "TRIAL" && "School is on a trial period. Full access is provided."}
                                    {formData.status === "PAST_DUE" && "Payment is overdue. Access may be restricted soon."}
                                    {formData.status === "SUSPENDED" && "School access is suspended. Users cannot log in."}
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Bottom Save Bar */}
                    <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 -mx-8 px-8 py-4 flex items-center justify-between rounded-b-2xl">
                        <p className="text-xs text-zinc-400">
                            ID: <span className="font-mono">{id}</span> · Last modified: {new Date().toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.push("/admin/tenants")} className="px-5 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? "Saving..." : "Save All Changes"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Scroll to top */}
            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-8 right-8 h-10 w-10 rounded-full bg-zinc-900 text-white shadow-2xl flex items-center justify-center hover:bg-blue-600 transition-all animate-in fade-in zoom-in duration-300"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
