"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createVehicleAction } from "@/app/actions/transport-actions";
import {
    Bus,
    Loader2,
    Shield,
    AlertCircle,
    Wrench,
    ArrowLeft,
    Check,
    Navigation,
    Activity,
    FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NewVehiclePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"BASIC" | "DOCS">("BASIC");
    const [formData, setFormData] = useState({
        registrationNumber: "",
        model: "",
        capacity: "30",
        status: "ACTIVE",
        insuranceNumber: "",
        insuranceExpiry: "",
        insuranceDocUrl: "",
        pollutionNumber: "",
        pollutionExpiry: "",
        pollutionDocUrl: "",
        fitnessExpiry: "",
        fitnessDocUrl: "",
        permitNumber: "",
        permitExpiry: "",
        permitDocUrl: "",
        rcDocUrl: ""
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createVehicleAction(formData, slug);
            if (res.success) {
                toast.success("Vehicle added successfully");
                router.push(`/s/${slug}/transport/vehicles`);
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">
                            Commission Unit
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-0.5">
                            Initialize a new operational asset into the cluster's transit network.
                        </p>
                    </div>
                </div>
            </div>

            {/* Config Engine */}
            <div className="grid lg:grid-cols-12 gap-10">
                {/* Phase Selection */}
                <div className="lg:col-span-3 space-y-4">
                    <button
                        onClick={() => setActiveTab("BASIC")}
                        className={cn(
                            "w-full flex items-center justify-between p-6 rounded-[28px] border-2 transition-all group",
                            activeTab === "BASIC"
                                ? "border-zinc-900 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-zinc-200"
                                : "border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200"
                        )}
                    >
                        <div className="text-left">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Phase 01</div>
                            <div className="text-sm font-black uppercase tracking-tight italic">Core Telemetry</div>
                        </div>
                        <Activity className={cn("h-5 w-5", activeTab === "BASIC" ? "text-brand" : "text-zinc-200 group-hover:text-zinc-400")} />
                    </button>

                    <button
                        onClick={() => setActiveTab("DOCS")}
                        className={cn(
                            "w-full flex items-center justify-between p-6 rounded-[28px] border-2 transition-all group",
                            activeTab === "DOCS"
                                ? "border-zinc-900 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-zinc-200"
                                : "border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200"
                        )}
                    >
                        <div className="text-left">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Phase 02</div>
                            <div className="text-sm font-black uppercase tracking-tight italic">Compliance Matrix</div>
                        </div>
                        <Shield className={cn("h-5 w-5", activeTab === "DOCS" ? "text-brand" : "text-zinc-200 group-hover:text-zinc-400")} />
                    </button>
                </div>

                {/* Parameter Matrix */}
                <div className="lg:col-span-9">
                    <form onSubmit={handleSubmit} className="rounded-[40px] bg-white p-10 border border-zinc-200 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
                        {activeTab === "BASIC" ? (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <SectionHeading icon={Bus} title="Unit Identity" />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Registration Identifier</label>
                                    <input
                                        required
                                        placeholder="TN-01-AB-1234"
                                        className="w-full h-14 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-bold focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm"
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Unit Model / Make</label>
                                        <input
                                            placeholder="Tata Marcopolo XL"
                                            className="w-full h-14 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-bold focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Payload Capacity</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full h-14 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-bold focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 block">Initial Readiness State</label>
                                    <div className="flex flex-wrap gap-4">
                                        {["ACTIVE", "MAINTENANCE", "INACTIVE"].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status: s })}
                                                className={cn(
                                                    "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                                    formData.status === s
                                                        ? "bg-blue-600 text-white hover:bg-blue-700 border-zinc-900 shadow-lg"
                                                        : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Insurance */}
                                <div className="space-y-8">
                                    <SectionHeading icon={Shield} title="Insurance Parameters" color="bg-emerald-50 text-emerald-600" />
                                    <div className="grid grid-cols-2 gap-8 px-1">
                                        <DocField
                                            label="Policy Reference"
                                            value={formData.insuranceNumber}
                                            onChange={(v) => setFormData({ ...formData, insuranceNumber: v })}
                                            placeholder="POL-2024-XXXX"
                                        />
                                        <DocField
                                            label="Termination Date"
                                            type="date"
                                            value={formData.insuranceExpiry}
                                            onChange={(v) => setFormData({ ...formData, insuranceExpiry: v })}
                                        />
                                    </div>
                                </div>

                                {/* Pollution */}
                                <div className="space-y-8 pt-10 border-t border-zinc-100">
                                    <SectionHeading icon={AlertCircle} title="Emission Compliance" color="bg-amber-50 text-amber-600" />
                                    <div className="grid grid-cols-2 gap-8 px-1">
                                        <DocField
                                            label="Certificate ID"
                                            value={formData.pollutionNumber}
                                            onChange={(v) => setFormData({ ...formData, pollutionNumber: v })}
                                            placeholder="PUC-XXXX-XXXX"
                                        />
                                        <DocField
                                            label="Expiry Sequence"
                                            type="date"
                                            value={formData.pollutionExpiry}
                                            onChange={(v) => setFormData({ ...formData, pollutionExpiry: v })}
                                        />
                                    </div>
                                </div>

                                {/* Fitness */}
                                <div className="space-y-8 pt-10 border-t border-zinc-100">
                                    <SectionHeading icon={Wrench} title="Fitness Verification" color="bg-indigo-50 text-indigo-600" />
                                    <div className="px-1">
                                        <DocField
                                            label="Inspectorate Expiry Date"
                                            type="date"
                                            value={formData.fitnessExpiry}
                                            onChange={(v) => setFormData({ ...formData, fitnessExpiry: v })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Control Deck */}
                        <div className="mt-16 pt-10 border-t border-zinc-100 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="h-14 rounded-2xl bg-blue-600 px-10 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Finalizing Initialization
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-5 w-5 text-brand" />
                                        Initialize Commissioning
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function SectionHeading({ icon: Icon, title, color = "bg-blue-600 text-white hover:bg-blue-700" }: { icon: any, title: string, color?: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-lg", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{title}</h3>
        </div>
    );
}

function DocField({ label, value, onChange, type = "text", placeholder }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
