"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    updateVehicleAction,
    getVehicleAction
} from "@/app/actions/transport-actions";
import {
    Bus,
    Loader2,
    Shield,
    AlertCircle,
    Wrench,
    ArrowLeft,
    Check,
    Info,
    Activity,
    ClipboardList,
    Download
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EditVehiclePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const vehicleId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"BASIC" | "DOCS" | "SERVICE">("BASIC");
    const [vehicle, setVehicle] = useState<any>(null);
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

    useEffect(() => {
        fetchVehicle();
    }, [vehicleId, slug]);

    async function fetchVehicle() {
        setLoading(true);
        const res = await getVehicleAction(vehicleId, slug);
        if (res.success && res.data) {
            const v = res.data as any;
            setVehicle(v);
            setFormData({
                registrationNumber: v.registrationNumber,
                model: v.model || "",
                capacity: String(v.capacity),
                status: v.status,
                insuranceNumber: v.insuranceNumber || "",
                insuranceExpiry: v.insuranceExpiry ? format(new Date(v.insuranceExpiry), 'yyyy-MM-dd') : "",
                insuranceDocUrl: v.insuranceDocUrl || "",
                pollutionNumber: v.pollutionNumber || "",
                pollutionExpiry: v.pollutionExpiry ? format(new Date(v.pollutionExpiry), 'yyyy-MM-dd') : "",
                pollutionDocUrl: v.pollutionDocUrl || "",
                fitnessExpiry: v.fitnessExpiry ? format(new Date(v.fitnessExpiry), 'yyyy-MM-dd') : "",
                fitnessDocUrl: v.fitnessDocUrl || "",
                permitNumber: v.permitNumber || "",
                permitExpiry: v.permitExpiry ? format(new Date(v.permitExpiry), 'yyyy-MM-dd') : "",
                permitDocUrl: v.permitDocUrl || "",
                rcDocUrl: v.rcDocUrl || ""
            });
        } else {
            toast.error(res.error || "Vehicle not found");
            router.push(`/s/${slug}/transport/vehicles`);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await updateVehicleAction(vehicleId, formData, slug);
            if (res.success) {
                toast.success("Vehicle updated successfully");
                router.push(`/s/${slug}/transport/vehicles`);
            } else {
                toast.error(res.error || "Update failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-brand" />
                <p className="text-[10px] font-black uppercase tracking-[4px] text-zinc-400">Syncing Unit Lifecycle Data</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport/vehicles`)}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">
                            Calibrate Unit <span className="text-brand">#{vehicle?.registrationNumber}</span>
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-0.5">
                            Spatial asset management and operational lifecycle calibration.
                        </p>
                    </div>
                </div>
            </div>

            {/* Config Engine */}
            <div className="grid lg:grid-cols-12 gap-10">
                {/* Module Selection */}
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
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Module 01</div>
                            <div className="text-sm font-black uppercase tracking-tight italic">Unit Metadata</div>
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
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Module 02</div>
                            <div className="text-sm font-black uppercase tracking-tight italic">Compliance Matrix</div>
                        </div>
                        <Shield className={cn("h-5 w-5", activeTab === "DOCS" ? "text-brand" : "text-zinc-200 group-hover:text-zinc-400")} />
                    </button>

                    <button
                        onClick={() => setActiveTab("SERVICE")}
                        className={cn(
                            "w-full flex items-center justify-between p-6 rounded-[28px] border-2 transition-all group",
                            activeTab === "SERVICE"
                                ? "border-zinc-900 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-zinc-200"
                                : "border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200"
                        )}
                    >
                        <div className="text-left">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Module 03</div>
                            <div className="text-sm font-black uppercase tracking-tight italic">Service History</div>
                        </div>
                        <Wrench className={cn("h-5 w-5", activeTab === "SERVICE" ? "text-brand" : "text-zinc-200 group-hover:text-zinc-400")} />
                    </button>
                </div>

                {/* Workspace */}
                <div className="lg:col-span-9">
                    <div className="rounded-[40px] bg-white p-10 border border-zinc-200 shadow-xl shadow-zinc-200/40 relative overflow-hidden min-h-[500px]">
                        {(activeTab === "BASIC" || activeTab === "DOCS") && (
                            <form onSubmit={handleSubmit} className="space-y-10">
                                {activeTab === "BASIC" ? (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <SectionHeading icon={Bus} title="Core Metadata" />

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Registration Identifier</label>
                                            <input
                                                required
                                                className="w-full h-14 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-bold focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm"
                                                value={formData.registrationNumber}
                                                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Make / Model</label>
                                                <input
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
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 block">Operational State</label>
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
                                        <SectionHeading icon={Shield} title="Compliance Matrix" />

                                        <div className="space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                    <Shield className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Insurance Parameters</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 px-1">
                                                <DocField label="Policy No" value={formData.insuranceNumber} onChange={(v) => setFormData({ ...formData, insuranceNumber: v })} />
                                                <DocField label="Termination Date" type="date" value={formData.insuranceExpiry} onChange={(v) => setFormData({ ...formData, insuranceExpiry: v })} />
                                            </div>
                                        </div>

                                        <div className="space-y-8 pt-10 border-t border-zinc-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Emission Compliance</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 px-1">
                                                <DocField label="PUC ID" value={formData.pollutionNumber} onChange={(v) => setFormData({ ...formData, pollutionNumber: v })} />
                                                <DocField label="Expiry Date" type="date" value={formData.pollutionExpiry} onChange={(v) => setFormData({ ...formData, pollutionExpiry: v })} />
                                            </div>
                                        </div>

                                        <div className="space-y-8 pt-10 border-t border-zinc-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                    <Wrench className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Fitness Certification</h4>
                                            </div>
                                            <div className="px-1">
                                                <DocField label="Inspectorate Expiry" type="date" value={formData.fitnessExpiry} onChange={(v) => setFormData({ ...formData, fitnessExpiry: v })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-16 pt-10 border-t border-zinc-100 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="h-14 rounded-2xl bg-blue-600 px-10 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Syncing Configuration
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-5 w-5 text-brand" />
                                                Save Calibration
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "SERVICE" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-10">
                                <div className="flex items-center justify-between">
                                    <SectionHeading icon={ClipboardList} title="Maintenance Registry" />
                                    <button className="h-12 px-6 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <Download className="h-4 w-4" />
                                        Export Datasheet
                                    </button>
                                </div>

                                {vehicle?.maintenanceLogs?.length > 0 ? (
                                    <div className="grid gap-4">
                                        {vehicle.maintenanceLogs.map((log: any) => (
                                            <div key={log.id} className="group relative flex items-center gap-6 rounded-3xl bg-zinc-50/50 p-6 border border-zinc-100 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/40 transition-all border-l-4 border-l-blue-600">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <Wrench className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <h5 className="font-black text-zinc-900 text-base uppercase tracking-tight truncate">{log.type}</h5>
                                                        <span className="shrink-0 text-lg font-black text-zinc-900 tracking-tighter">₹{log.cost.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{format(new Date(log.date), 'dd MMM yyyy')}</p>
                                                        <span className="h-1 w-1 rounded-full bg-zinc-200" />
                                                        <p className="text-[10px] text-brand font-black uppercase tracking-widest">Verified Log Entry</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center rounded-[32px] border-2 border-dashed border-zinc-100 bg-zinc-50/30">
                                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-zinc-50">
                                            <Activity className="h-8 w-8 text-zinc-100" />
                                        </div>
                                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest italic mt-2">Zero incident matrix available</h3>
                                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[4px] mt-1">Unit Lifecycle Stable</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
