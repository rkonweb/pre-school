"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Building2,
    MapPin,
    CreditCard,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    UploadCloud,
    Globe,
    ShieldCheck,
    Mail,
    Phone,
    Laptop,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Image as ImageIcon,
    Calendar,
    Type
} from "lucide-react";
import { cn } from "@/lib/utils";

import { createTenantAction } from "@/app/actions/tenant-actions";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { SubscriptionPlan } from "@/types/subscription";

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

export default function OnboardSchoolPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

    // Carousel State
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollLeft = container.scrollLeft;
            // Approximate card width + gap is around 336px
            const index = Math.round(scrollLeft / 330);
            setActiveIndex(Math.min(Math.max(0, index), plans.length - 1));
        }
    };

    const scrollToIndex = (index: number) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const child = container.children[index] as HTMLElement;
            if (child) {
                child.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest'
                });
            }
            setActiveIndex(index);
        }
    };

    useEffect(() => {
        getSubscriptionPlansAction().then(data => {
            setPlans(data);
            // Auto-select popular or first plan
            const defaultPlan = data.find(p => p.isPopular) || data[0];
            if (defaultPlan) {
                setFormData(prev => ({
                    ...prev,
                    plan: defaultPlan.name,
                    modules: defaultPlan.includedModules || []
                }));
            }
        }).catch(console.error);
    }, []);

    const [formData, setFormData] = useState({
        // Identity
        schoolName: "",
        subdomain: "",
        brandColor: "#2563eb",
        website: "",
        motto: "",
        foundingYear: "",
        logo: "", // Mock URL or placeholder

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
        plan: "Growth",
        currency: "USD",
        timezone: "UTC-5 (EST)",
        dateFormat: "MM/DD/YYYY",
        modules: ["attendance", "communication", "billing"]
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await createTenantAction({
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
                email: formData.adminEmail || "admin@school.com",
                adminPhone: formData.adminPhone,
                adminDesignation: formData.adminDesignation,

                plan: formData.plan as any,
                region: formData.country === "United States" ? "US-West" : "Global",
                currency: formData.currency,
                timezone: formData.timezone,
                dateFormat: formData.dateFormat,
                modules: formData.modules
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            router.refresh();
            router.push("/admin/tenants");
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            alert(`Failed to provision tenant: ${err.message}`);
        }
    };

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
                    <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-zinc-900/10">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="font-bold text-zinc-900 leading-tight">New School Provisioning</h1>
                        <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">WIZARD MODE</p>
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
                <button onClick={() => router.back()} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">Exit</button>
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
                                <p>This user will have full <strong>Super Admin</strong> privileges within the school's tenant instance. An invitation email will be sent with login instructions.</p>
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

                        {/* Carousel Dots */}
                        <div className="flex justify-center gap-2 mb-6">
                            {plans.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollToIndex(idx)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        activeIndex === idx ? "w-8 bg-blue-600" : "w-2 bg-zinc-300 hover:bg-zinc-400"
                                    )}
                                    aria-label={`Go to plan ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <div className="relative group">
                            {/* Left Navigation Arrow */}
                            <button
                                onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                                disabled={activeIndex === 0}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-900 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
                            >
                                <ChevronLeft className="h-6 w-6 stroke-[3]" />
                            </button>

                            {/* Right Navigation Arrow */}
                            <button
                                onClick={() => scrollToIndex(Math.min(plans.length - 1, activeIndex + 1))}
                                disabled={activeIndex === plans.length - 1}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center text-zinc-900 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
                            >
                                <ChevronRight className="h-6 w-6 stroke-[3]" />
                            </button>

                            <div
                                ref={scrollRef}
                                onScroll={handleScroll}
                                className="flex gap-4 overflow-x-auto py-8 -mx-4 px-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-x-contain"
                            >
                                {/* Dynamic Plan Cards */}
                                {plans.map((plan, index) => (
                                    <div
                                        key={plan.id}
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                plan: plan.name,
                                                modules: plan.includedModules || []
                                            });
                                            scrollToIndex(index);
                                        }}
                                        className={cn(
                                            "relative rounded-3xl border-2 p-6 cursor-pointer transition-all duration-500 ease-out min-w-[320px] max-w-[320px] flex-shrink-0 snap-center flex flex-col",
                                            formData.plan === plan.name
                                                ? "border-blue-600 bg-blue-50/20 shadow-xl shadow-blue-600/10 scale-100 opacity-100 z-10"
                                                : "border-zinc-100 bg-white hover:border-zinc-200 shadow-sm scale-90 opacity-60 hover:opacity-100 hover:scale-95"
                                        )}
                                    >
                                        {formData.plan === plan.name && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                Selected
                                            </div>
                                        )}
                                        <h3 className="text-xl font-black text-zinc-900 text-center">{plan.name}</h3>
                                        <div className="text-4xl font-black mt-4 text-zinc-900 text-center">
                                            {plan.price === 0 ? "Free" : `${CURRENCY_SYMBOLS[formData.currency] || "$"}${convertPrice(plan.price, formData.currency)}`}
                                            {plan.price > 0 && <span className="text-sm font-bold text-zinc-400">/mo</span>}
                                        </div>

                                        {/* Limits Grid */}
                                        <div className="grid grid-cols-3 gap-2 py-6 my-6 border-y border-zinc-100">
                                            <div className="text-center">
                                                <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Students</div>
                                                <div className="text-lg font-black text-zinc-900">{plan.limits?.maxStudents || 0}</div>
                                            </div>
                                            <div className="text-center border-l border-zinc-100">
                                                <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Staff</div>
                                                <div className="text-lg font-black text-zinc-900">{plan.limits?.maxStaff || 0}</div>
                                            </div>
                                            <div className="text-center border-l border-zinc-100">
                                                <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-1">Storage</div>
                                                <div className="text-lg font-black text-zinc-900">{(plan.limits as any)?.maxStorageGB || 0}GB</div>
                                            </div>
                                        </div>

                                        {/* Modules List (Previously Table) */}
                                        <div className="space-y-3 flex-1">
                                            <p className="text-xs font-bold text-zinc-900 uppercase">Included Modules</p>
                                            <ul className="space-y-3">
                                                {["Admissions", "Attendance", "Billing", "Communication", "Inventory", "Transport", "Curriculum"].map((mod) => {
                                                    const hasModule = plan.includedModules?.includes(mod.toLowerCase());
                                                    return (
                                                        <li key={mod} className={cn("flex items-center gap-3 text-sm font-medium", hasModule ? "text-zinc-700" : "text-zinc-300")}>
                                                            {hasModule ? (
                                                                <CheckCircle2 className={cn("h-5 w-5 shrink-0", plan.name === "Premium" ? "text-emerald-500" : "text-blue-600")} />
                                                            ) : (
                                                                <div className="h-5 w-5 rounded-full border-2 border-zinc-100 shrink-0" />
                                                            )}
                                                            {mod}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-zinc-100">
                                            <button className={cn(
                                                "w-full py-3 rounded-xl font-bold text-sm transition-all",
                                                formData.plan === plan.name
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                    : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                                            )}>
                                                {formData.plan === plan.name ? "Selected Plan" : "Select Plan"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                        >
                            {loading ? "Provisioning Server..." : "Launch School Instance"}
                            {!loading && <Globe className="h-4 w-4" />}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
