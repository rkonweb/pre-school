"use client";

import { useEffect, useState } from "react";
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
    ArrowRight,
    ArrowLeft,
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
    Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_FEATURES, ADDONS, calculateMRR } from "@/config/subscription";

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹"
};

const EXCHANGE_RATES: Record<string, number> = {
    INR: 1,
    USD: 0.012, // 1 INR = 0.012 USD (approx)
    EUR: 0.011, // 1 INR = 0.011 EUR
    GBP: 0.0095 // 1 INR = 0.0095 GBP
};

const convertPrice = (priceInInr: number, currency: string) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    const converted = priceInInr * rate;

    // Rounding logic for cleaner numbers
    if (currency === "INR") return Math.round(converted);

    // For other currencies, round to nearest 0.99 or whole number logic if needed
    // Simple rounding for now:
    return Math.ceil(converted);
};

export default function EditTenantPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

    // Initial state
    const [formData, setFormData] = useState({
        // Identity
        schoolName: "",
        subdomain: "",
        brandColor: "#2563eb",
        website: "",
        motto: "",
        foundingYear: "",
        logo: "",

        // Social Media
        socialFacebook: "",
        socialTwitter: "",
        socialLinkedin: "",
        socialInstagram: "",
        socialYoutube: "",

        // Location & Contact
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "United States",
        latitude: "",
        longitude: "",
        contactEmail: "",
        contactPhone: "",

        // Admin
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        adminDesignation: "",

        // Configuration
        plan: "Growth" as any,
        currency: "USD",
        timezone: "UTC-5 (EST)",
        dateFormat: "MM/DD/YYYY",
        modules: [] as string[],
        addons: [] as string[],
        status: "ACTIVE" as any
    });

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

                        // Location
                        address: tenant.address || "",
                        city: tenant.city || "",
                        state: tenant.state || "",
                        zip: tenant.zip || "",
                        country: tenant.country || "United States",
                        latitude: tenant.latitude || "",
                        longitude: tenant.longitude || "",
                        contactEmail: tenant.contactEmail || "",
                        contactPhone: tenant.contactPhone || "",

                        adminName: tenant.adminName,
                        adminEmail: tenant.email,
                        adminPhone: tenant.adminPhone || "",
                        adminDesignation: tenant.adminDesignation || "",

                        plan: tenant.plan,
                        currency: tenant.currency || (settingsRes.success ? settingsRes.data.currency : "USD"),
                        timezone: tenant.timezone || (settingsRes.success ? settingsRes.data.timezone : "UTC-5 (EST)"),
                        dateFormat: tenant.dateFormat || "MM/DD/YYYY",
                        modules: tenant.modules || [],
                        addons: tenant.addons || [],
                        status: tenant.status
                    });
                } else {
                    alert("Tenant not found");
                    router.push("/admin/tenants");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            load();
        }
    }, [id, router]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateTenantAction(id, {
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
                    youtube: formData.socialYoutube
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

                adminName: formData.adminName,
                email: formData.adminEmail,
                adminPhone: formData.adminPhone,
                adminDesignation: formData.adminDesignation,

                plan: formData.plan,
                currency: formData.currency,
                timezone: formData.timezone,
                dateFormat: formData.dateFormat,
                modules: formData.modules,
                addons: formData.addons,
                status: formData.status
            });
            router.refresh();
            router.push("/admin/tenants");
        } catch (e) {
            console.error(e);
            alert("Failed to save changes");
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const steps = [
        { num: 1, label: "Identity" },
        { num: 2, label: "Location" },
        { num: 3, label: "Admin" },
        { num: 4, label: "Config" }
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            {/* Wizard Header */}
            <header className="bg-white border-b border-zinc-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="font-bold text-zinc-900 leading-tight">Edit School Details</h1>
                        <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">ID: {id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                                    step >= s.num ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                                </span>
                                <span className={cn("font-medium transition-colors duration-300 hidden sm:block", step >= s.num ? "text-zinc-900" : "text-zinc-400")}>{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={cn("w-8 h-[2px] rounded-full transition-colors duration-300 hidden sm:block", step > i + 1 ? "bg-blue-600" : "bg-zinc-100")} />
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={() => router.push("/admin/tenants")} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">Cancel</button>
            </header>

            {/* Wizard Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-8 md:p-12">
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-zinc-900">Institutional Identity</h2>
                            <p className="text-zinc-500 mt-2">Establish the digital presence and branding for the new tenant.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">School Name</label>
                                        <input
                                            type="text"
                                            value={formData.schoolName}
                                            onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                                            placeholder="e.g. Springfield Academy"
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Domain Prefix</label>
                                        <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                                            <input
                                                type="text"
                                                value={formData.subdomain}
                                                onChange={e => setFormData({ ...formData, subdomain: e.target.value })}
                                                placeholder="springfield"
                                                className="flex-1 bg-transparent p-3 font-mono text-sm outline-none font-bold text-zinc-700"
                                            />
                                            <div className="bg-zinc-100 px-4 flex items-center text-zinc-500 text-sm font-medium border-l border-zinc-200">
                                                .preschool-erp.com
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Public Website</label>
                                        <div className="relative">
                                            <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                placeholder="https://www.springfield.edu"
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Founding Year</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <input
                                                    type="number"
                                                    value={formData.foundingYear}
                                                    onChange={e => setFormData({ ...formData, foundingYear: e.target.value })}
                                                    placeholder="1995"
                                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">School Motto</label>
                                            <div className="relative">
                                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    value={formData.motto}
                                                    onChange={e => setFormData({ ...formData, motto: e.target.value })}
                                                    placeholder="Excellence in Education"
                                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Brand Color</label>
                                        <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                                            <input
                                                type="color"
                                                value={formData.brandColor}
                                                onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                                                className="h-12 w-16 rounded cursor-pointer border-0 bg-transparent p-0"
                                            />
                                            <div className="text-xs text-zinc-500">
                                                <p className="font-bold text-zinc-900 mb-1">Primary Theme</p>
                                                Used for buttons, highlights, and headers.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Social Media Presence</label>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                                                <input
                                                    type="url"
                                                    value={formData.socialFacebook}
                                                    onChange={e => setFormData({ ...formData, socialFacebook: e.target.value })}
                                                    placeholder="Facebook URL"
                                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
                                                <input
                                                    type="url"
                                                    value={formData.socialTwitter}
                                                    onChange={e => setFormData({ ...formData, socialTwitter: e.target.value })}
                                                    placeholder="Twitter / X URL"
                                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-700" />
                                                <input
                                                    type="url"
                                                    value={formData.socialLinkedin}
                                                    onChange={e => setFormData({ ...formData, socialLinkedin: e.target.value })}
                                                    placeholder="LinkedIn URL"
                                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-600" />
                                                <input
                                                    type="url"
                                                    value={formData.socialInstagram}
                                                    onChange={e => setFormData({ ...formData, socialInstagram: e.target.value })}
                                                    placeholder="Instagram URL"
                                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: LOCATION & CONTACT */}
                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-zinc-900">Location & Contact</h2>
                            <p className="text-zinc-500 mt-2">Physical address and geo-coordinates for mapping services.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-8">
                            {/* Primary Address */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-600" /> Physical Address
                                    </h3>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Street Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="123 Education Lane"
                                            className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">State / Province</label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={e => setFormData({ ...formData, state: e.target.value })}
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Zip / Postal Code</label>
                                            <input
                                                type="text"
                                                value={formData.zip}
                                                onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Country</label>
                                            <select
                                                value={formData.country}
                                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option>United States</option>
                                                <option>Canada</option>
                                                <option>United Kingdom</option>
                                                <option>India</option>
                                                <option>Singapore</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-blue-600" /> Geo-Coordinates & Contact
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Latitude</label>
                                            <input
                                                type="text"
                                                value={formData.latitude}
                                                onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                                placeholder="34.0522"
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-mono text-sm focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Longitude</label>
                                            <input
                                                type="text"
                                                value={formData.longitude}
                                                onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                                placeholder="-118.2437"
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-mono text-sm focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="h-px bg-zinc-100 my-2" />
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">General Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="email"
                                                value={formData.contactEmail}
                                                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                                placeholder="info@school.com"
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 font-medium focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">General Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <input
                                                type="tel"
                                                value={formData.contactPhone}
                                                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3 font-medium focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: ADMIN */}
                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-zinc-900">Administrator Access</h2>
                            <p className="text-zinc-500 mt-2">Create the root admin account for this school.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 max-w-2xl mx-auto space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-700 text-sm mb-6">
                                <ShieldCheck className="h-5 w-5 shrink-0" />
                                <p>This user will have full <strong>Super Admin</strong> privileges within the school's tenant instance.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Principal / Admin Name</label>
                                    <input
                                        type="text"
                                        value={formData.adminName}
                                        onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                        placeholder="Full Name"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Job Title / Designation</label>
                                    <input
                                        type="text"
                                        value={formData.adminDesignation}
                                        onChange={e => setFormData({ ...formData, adminDesignation: e.target.value })}
                                        placeholder="e.g. Principal, Director, IT Administrator"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Personal Email</label>
                                    <input
                                        type="email"
                                        value={formData.adminEmail}
                                        onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                        placeholder="admin@school.com"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={formData.adminPhone}
                                        onChange={e => setFormData({ ...formData, adminPhone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: CONFIG */}
                {step === 4 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-zinc-900">Subscription & Configuration</h2>
                            <p className="text-zinc-500 mt-2">Configure billing plan and regional settings.</p>
                        </div>

                        {/* Regional Settings */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-8">
                            <h4 className="font-bold text-zinc-900 text-sm mb-4 uppercase flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Regional Settings
                            </h4>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Timezone</label>
                                    <select
                                        value={formData.timezone}
                                        onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                    >
                                        <option>UTC-8 (PST)</option>
                                        <option>UTC-5 (EST)</option>
                                        <option>UTC+0 (GMT)</option>
                                        <option>UTC+1 (CET)</option>
                                        <option>UTC+5:30 (IST)</option>
                                        <option>UTC+8 (SGT)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Date Format</label>
                                    <select
                                        value={formData.dateFormat}
                                        onChange={e => setFormData({ ...formData, dateFormat: e.target.value })}
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {/* Plan Cards */}
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => {
                                        setFormData({ ...formData, plan: plan.name as any, modules: plan.includedModules });
                                    }}
                                    className={cn(
                                        "relative rounded-2xl border-2 p-6 cursor-pointer transition-all hover:scale-105",
                                        formData.plan === plan.name ?
                                            (plan.tier === "premium" ? "border-indigo-600 bg-indigo-50/30" :
                                                plan.tier === "enterprise" ? "border-zinc-900 bg-zinc-50/30" :
                                                    "border-blue-600 bg-blue-50/30")
                                            : "border-zinc-100 bg-white hover:border-zinc-200"
                                    )}
                                >
                                    {formData.plan === plan.name && (
                                        <div className={cn(
                                            "absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                                            plan.tier === "premium" ? "bg-indigo-600" : plan.tier === "enterprise" ? "bg-zinc-900" : "bg-blue-600"
                                        )}>
                                            Selected
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                                    <div className="text-3xl font-extrabold mt-2 text-zinc-900">
                                        {CURRENCY_SYMBOLS[formData.currency] || "$"}{convertPrice(plan.price, formData.currency)}
                                        {plan.price > 0 && <span className="text-sm font-medium text-zinc-500">/mo</span>}
                                    </div>
                                    <ul className="mt-6 space-y-3">
                                        {plan.features.slice(0, 4).map((f, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                                                <CheckCircle2 className={cn("h-4 w-4",
                                                    plan.tier === "premium" ? "text-indigo-600" :
                                                        plan.tier === "enterprise" ? "text-zinc-600" :
                                                            "text-blue-600"
                                                )} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Real-time MRR Calculator Widget */}
                        <div className="bg-zinc-900 rounded-[32px] p-8 mb-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-in zoom-in-95 duration-500">
                            <div>
                                <div className="flex items-center gap-2 text-blue-400 mb-2">
                                    <Crown className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Billing Estimates</span>
                                </div>
                                <h4 className="text-4xl font-black">
                                    {CURRENCY_SYMBOLS[formData.currency] || "$"}{convertPrice(calculateMRR(formData.plan, formData.addons), formData.currency)}
                                    <span className="text-lg font-medium text-zinc-500 ml-2">/month (MRR)</span>
                                </h4>
                                <p className="text-zinc-400 text-sm mt-1">Based on {formData.plan} plan + {formData.addons.length} active add-ons</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-zinc-500 uppercase">Subscription Status</p>
                                    <p className="text-md font-black text-emerald-400">{formData.status}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-zinc-900 text-sm uppercase">Institutional Modules & Features</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, modules: ["admissions", "students", "students.profiles", "students.attendance", "academics", "academics.curriculum", "academics.timetable", "academics.classes", "diary", "staff", "staff.directory", "staff.attendance", "staff.payroll", "billing", "inventory", "communication", "settings"] }))}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
                                    >
                                        Enable All
                                    </button>
                                    <span className="text-zinc-300">|</span>
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, modules: [] }))}
                                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase"
                                    >
                                        Disable All
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { id: "admissions", label: "Admissions", desc: "Lead tracking & enrollment" },
                                    {
                                        id: "students", label: "Students", desc: "Student profiles & records", sub: [
                                            { id: "students.profiles", label: "Identity & Profiles" },
                                            { id: "students.attendance", label: "Daily Attendance" }
                                        ]
                                    },
                                    {
                                        id: "academics", label: "Academics", desc: "Courses & scheduling", sub: [
                                            { id: "academics.curriculum", label: "Curriculum Manager" },
                                            { id: "academics.timetable", label: "Timetable & Rotations" },
                                            { id: "academics.classes", label: "Classroom Allocation" }
                                        ]
                                    },
                                    { id: "diary", label: "Digital Diary", desc: "Daily logs & parent updates" },
                                    {
                                        id: "staff", label: "Staff & HR", desc: "Employee management", sub: [
                                            { id: "staff.directory", label: "Staff Directory" },
                                            { id: "staff.attendance", label: "Punch Records" },
                                            { id: "staff.payroll", label: "Payroll Automation" }
                                        ]
                                    },
                                    { id: "billing", label: "Billing & Fees", desc: "Fee collection & invoicing" },
                                    { id: "inventory", label: "Inventory", desc: "Stock & asset tracking" },
                                    { id: "communication", label: "Communication", desc: "Messaging & broadcast" },
                                    { id: "settings", label: "System Config", desc: "Roles & global settings" },
                                ].map((mod) => (
                                    <div key={mod.id} className={cn(
                                        "p-5 rounded-2xl border transition-all duration-300",
                                        formData.modules.includes(mod.id) ? "bg-blue-50/50 border-blue-200 shadow-sm" : "bg-white border-zinc-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                                    )}>
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <div className={cn(
                                                "mt-1 h-5 w-5 rounded-lg border flex items-center justify-center transition-all",
                                                formData.modules.includes(mod.id) ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-600/20" : "border-zinc-300 bg-white"
                                            )}>
                                                {formData.modules.includes(mod.id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.modules.includes(mod.id)}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    let newModules = [...formData.modules];

                                                    if (isChecked) {
                                                        newModules.push(mod.id);
                                                        // Automatically enable all sub-modules if parent is enabled
                                                        if (mod.sub) {
                                                            mod.sub.forEach(s => {
                                                                if (!newModules.includes(s.id)) newModules.push(s.id);
                                                            });
                                                        }
                                                    } else {
                                                        newModules = newModules.filter(x => x !== mod.id);
                                                        // Automatically disable all sub-modules if parent is disabled
                                                        if (mod.sub) {
                                                            const subIds = mod.sub.map(s => s.id);
                                                            newModules = newModules.filter(x => !subIds.includes(x));
                                                        }
                                                    }
                                                    setFormData(p => ({ ...p, modules: newModules }));
                                                }}
                                            />
                                            <div className="flex-1">
                                                <span className="block text-sm font-bold text-zinc-900">{mod.label}</span>
                                                <span className="block text-[10px] text-zinc-500 font-medium leading-relaxed mt-0.5">{mod.desc}</span>
                                            </div>
                                        </label>

                                        {mod.sub && (
                                            <div className="mt-4 pt-4 border-t border-blue-100/50 space-y-2.5">
                                                {mod.sub.map(sub => (
                                                    <label key={sub.id} className="flex items-center gap-2.5 cursor-pointer group">
                                                        <div className={cn(
                                                            "h-4 w-4 rounded-md border flex items-center justify-center transition-all",
                                                            formData.modules.includes(sub.id) ? "bg-blue-500 border-blue-500" : "border-zinc-200 bg-zinc-50 group-hover:border-zinc-300"
                                                        )}>
                                                            {formData.modules.includes(sub.id) && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={formData.modules.includes(sub.id)}
                                                            onChange={(e) => {
                                                                const isChecked = e.target.checked;
                                                                let newModules = [...formData.modules];

                                                                if (isChecked) {
                                                                    newModules.push(sub.id);
                                                                    // Ensure parent is enabled
                                                                    if (!newModules.includes(mod.id)) newModules.push(mod.id);
                                                                } else {
                                                                    newModules = newModules.filter(x => x !== sub.id);
                                                                }
                                                                setFormData(p => ({ ...p, modules: newModules }));
                                                            }}
                                                        />
                                                        <span className={cn(
                                                            "text-[11px] font-bold transition-colors",
                                                            formData.modules.includes(sub.id) ? "text-blue-700" : "text-zinc-400 group-hover:text-zinc-600"
                                                        )}>
                                                            {sub.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* STEP 4.2: ADD-ONS */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 mb-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="font-bold text-zinc-900 text-lg uppercase flex items-center gap-2">
                                        <Star className="h-5 w-5 text-amber-400" /> Premium Add-ons
                                    </h4>
                                    <p className="text-xs text-zinc-500 font-medium">Elevate the institutional experience with specialized integrations.</p>
                                </div>
                                <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Expand Capabilities</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {ADDONS.map((addon) => (
                                    <div
                                        key={addon.id}
                                        onClick={() => {
                                            const newAddons = formData.addons.includes(addon.id)
                                                ? formData.addons.filter(i => i !== addon.id)
                                                : [...formData.addons, addon.id];
                                            setFormData({ ...formData, addons: newAddons });
                                        }}
                                        className={cn(
                                            "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer",
                                            formData.addons.includes(addon.id)
                                                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl scale-[1.02]"
                                                : "bg-white border-zinc-100 hover:border-zinc-200 text-zinc-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                            formData.addons.includes(addon.id) ? "bg-white/10" : "bg-zinc-50"
                                        )}>
                                            <addon.icon className={cn("h-6 w-6", formData.addons.includes(addon.id) ? "text-white" : "text-zinc-400")} />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-sm leading-tight">{addon.label}</h5>
                                            <p className={cn("text-[10px] font-medium mt-1", formData.addons.includes(addon.id) ? "text-zinc-400" : "text-zinc-500")}>
                                                {addon.desc}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-xs font-black", formData.addons.includes(addon.id) ? "text-blue-400" : "text-zinc-900")}>
                                                +{CURRENCY_SYMBOLS[formData.currency] || "$"}{addon.price}
                                            </p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest opacity-50">Monthly</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tenant Config Logic (Only specific to edit page, e.g. status) */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
                            <h4 className="font-bold text-zinc-900 text-sm mb-4 uppercase">Operational Status</h4>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Tenant Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3 font-medium focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="TRIAL">Trial</option>
                                    <option value="PAST_DUE">Past Due</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* Wizard Footer */}
            <footer className="bg-white border-t border-zinc-100 p-6 md:p-8">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="flex items-center gap-2 font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-3 font-bold text-white hover:bg-black transition-all shadow-lg shadow-zinc-900/10"
                        >
                            Continue
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                            {!isSaving && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
