"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVehicleByIdAction, updateVehicleAction } from "@/app/actions/transport-actions";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { uploadToSubfolderAction, deleteFileAction } from "@/app/actions/upload-actions";
import { FileUpload } from "@/components/upload/FileUpload";
import {
    Bus,
    Loader2,
    Shield,
    AlertCircle,
    Wrench,
    ArrowLeft,
    Check,
    FileText,
    X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EditVehiclePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const vehicleId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeUploads, setActiveUploads] = useState(0);
    const isAnyFileUploading = activeUploads > 0;
    const [activeTab, setActiveTab] = useState<"BASIC" | "DOCS">("BASIC");
    const [brandColor, setBrandColor] = useState("#2D9CB8");
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
        rcDocUrl: "",
        documents: [] as { name: string, url: string }[]
    });

    useEffect(() => {
        const fetchVehicle = async () => {
            const res = await getVehicleByIdAction(vehicleId);
            if (res.success && res.data) {
                const v = res.data as any;
                setFormData({
                    registrationNumber: v.registrationNumber || "",
                    model: v.model || "",
                    capacity: v.capacity?.toString() || "30",
                    status: v.status || "ACTIVE",
                    insuranceNumber: v.insuranceNumber || "",
                    insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry).toISOString().split('T')[0] : "",
                    insuranceDocUrl: v.insuranceDocUrl || "",
                    pollutionNumber: v.pollutionNumber || "",
                    pollutionExpiry: v.pollutionExpiry ? new Date(v.pollutionExpiry).toISOString().split('T')[0] : "",
                    pollutionDocUrl: v.pollutionDocUrl || "",
                    fitnessExpiry: v.fitnessExpiry ? new Date(v.fitnessExpiry).toISOString().split('T')[0] : "",
                    fitnessDocUrl: v.fitnessDocUrl || "",
                    permitNumber: v.permitNumber || "",
                    permitExpiry: v.permitExpiry ? new Date(v.permitExpiry).toISOString().split('T')[0] : "",
                    permitDocUrl: v.permitDocUrl || "",
                    rcDocUrl: v.rcDocUrl || "",
                    documents: v.documents ? JSON.parse(v.documents) : []
                });
            } else {
                toast.error("Vehicle not found");
                router.push(`/s/${slug}/transport/vehicles`);
            }
            setLoading(false);
        };
        const fetchSettings = async () => {
            const res = await getSchoolSettingsAction(slug);
            if (res.success && res.data?.brandColor) {
                setBrandColor(res.data.brandColor);
            }
        };
        fetchVehicle();
        fetchSettings();
    }, [vehicleId, slug, router]);

    const addDocument = () => {
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, { name: "", url: "" }]
        }));
    };

    const removeDocument = async (index: number) => {
        const doc = formData.documents[index];
        if (doc.url) {
            const confirm = window.confirm(`Are you sure you want to remove this document and delete the file from Google Drive?`);
            if (!confirm) return;
            await deleteFileAction(doc.url, slug);
        }

        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const updateDocument = (index: number, field: "name" | "url", value: string) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map((doc, i) => i === index ? { ...doc, [field]: value } : doc)
        }));
    };

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
            <div className="flex h-[60vh] items-center justify-center flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-zinc-500 italic">Fetching vehicle details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20" style={{ '--brand-color': brandColor } as any}>
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Edit Vehicle</h1>
                    <p className="text-sm text-zinc-500">Update details for {formData.registrationNumber}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2">
                    <button
                        onClick={() => setActiveTab("BASIC")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeTab === "BASIC"
                                ? "bg-white shadow-sm border border-zinc-200"
                                : "text-zinc-600 hover:bg-zinc-50"
                        )}
                        style={activeTab === "BASIC" ? { borderLeft: `4px solid ${brandColor}`, color: brandColor } : {}}
                    >
                        <Bus className="h-4 w-4" />
                        Basic Information
                    </button>
                    <button
                        onClick={() => setActiveTab("DOCS")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeTab === "DOCS"
                                ? "bg-white shadow-sm border border-zinc-200"
                                : "text-zinc-600 hover:bg-zinc-50"
                        )}
                        style={activeTab === "DOCS" ? { borderLeft: `4px solid ${brandColor}`, color: brandColor } : {}}
                    >
                        <Shield className="h-4 w-4" />
                        Documents & Compliance
                    </button>
                </div>

                {/* Main Form Area */}
                <div className="lg:col-span-9">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8">
                            {activeTab === "BASIC" ? (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Bus className="h-5 w-5 text-blue-600" />
                                            Vehicle Details
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Registration Number</label>
                                                <input
                                                    required
                                                    placeholder="e.g. TN-01-AB-1234"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] outline-none transition-all"
                                                    value={formData.registrationNumber}
                                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Model / Make</label>
                                                <input
                                                    placeholder="e.g. Tata Marcopolo"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] outline-none transition-all"
                                                    value={formData.model}
                                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Seating Capacity</label>
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] outline-none transition-all"
                                                    value={formData.capacity}
                                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Status</label>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="MAINTENANCE">Maintenance</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    {/* Insurance */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-emerald-600" />
                                            Insurance Limits
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Policy Number</label>
                                                <input
                                                    placeholder="Policy Number"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                    value={formData.insuranceNumber}
                                                    onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                                    value={formData.insuranceExpiry}
                                                    onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Insurance Document</label>
                                                <FileUpload
                                                    value={formData.insuranceDocUrl}
                                                    onUpload={(url) => setFormData({ ...formData, insuranceDocUrl: url })}
                                                    onUploadingStateChange={(isUploading) => setActiveUploads(prev => isUploading ? prev + 1 : Math.max(0, prev - 1))}
                                                    schoolSlug={slug}
                                                    mainFolder="Vehicles"
                                                    subFolder={formData.registrationNumber}
                                                    label="Insurance Certificate"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pollution */}
                                    <div className="pt-6 border-t border-zinc-100 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                            Pollution Certificate
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Certificate Number</label>
                                                <input
                                                    placeholder="PUC Number"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                                    value={formData.pollutionNumber}
                                                    onChange={(e) => setFormData({ ...formData, pollutionNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Expiry Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                                    value={formData.pollutionExpiry}
                                                    onChange={(e) => setFormData({ ...formData, pollutionExpiry: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Pollution Document</label>
                                                <FileUpload
                                                    value={formData.pollutionDocUrl}
                                                    onUpload={(url) => setFormData({ ...formData, pollutionDocUrl: url })}
                                                    onUploadingStateChange={(isUploading) => setActiveUploads(prev => isUploading ? prev + 1 : Math.max(0, prev - 1))}
                                                    schoolSlug={slug}
                                                    mainFolder="Vehicles"
                                                    subFolder={formData.registrationNumber}
                                                    label="Pollution Certificate"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fitness */}
                                    <div className="pt-6 border-t border-zinc-100 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Wrench className="h-5 w-5 text-indigo-600" />
                                            Fitness Certificate
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-zinc-700">Fitness Expiry Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    value={formData.fitnessExpiry}
                                                    onChange={(e) => setFormData({ ...formData, fitnessExpiry: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-medium text-zinc-700 mb-1.5 block">Fitness Document</label>
                                                <FileUpload
                                                    value={formData.fitnessDocUrl}
                                                    onUpload={(url) => setFormData({ ...formData, fitnessDocUrl: url })}
                                                    onUploadingStateChange={(isUploading) => setActiveUploads(prev => isUploading ? prev + 1 : Math.max(0, prev - 1))}
                                                    schoolSlug={slug}
                                                    mainFolder="Vehicles"
                                                    subFolder={formData.registrationNumber}
                                                    label="Fitness Certificate"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Documents */}
                                    <div className="pt-6 border-t border-zinc-100 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-gray-600" />
                                                Additional Documents
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addDocument}
                                                className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
                                            >
                                                + Add Document
                                            </button>
                                        </h3>

                                        <div className="space-y-4">
                                            {formData.documents.map((doc, index) => (
                                                <div key={index} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 relative group animate-in slide-in-from-top-2 duration-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDocument(index)}
                                                        className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-sm font-medium text-zinc-700">Document Name</label>
                                                            <input
                                                                placeholder="e.g. Permit, Tax Token"
                                                                className="w-full h-10 px-3 rounded-md border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                                value={doc.name}
                                                                onChange={(e) => updateDocument(index, "name", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-sm font-medium text-zinc-700">File</label>
                                                            <FileUpload
                                                                value={doc.url}
                                                                onUpload={(url) => updateDocument(index, "url", url)}
                                                                onUploadingStateChange={(isUploading) => {
                                                                    setActiveUploads(prev => isUploading ? prev + 1 : Math.max(0, prev - 1));
                                                                }}
                                                                schoolSlug={slug}
                                                                mainFolder="Vehicles"
                                                                subFolder={formData.registrationNumber}
                                                                label={doc.name || "Additional Document"}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {formData.documents.length === 0 && (
                                                <div className="text-center py-8 text-zinc-400 text-sm border-2 border-dashed border-zinc-100 rounded-xl">
                                                    No additional documents added.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || isAnyFileUploading}
                                style={{ backgroundColor: brandColor }}
                                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg"
                            >
                                {(submitting || isAnyFileUploading) ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {isAnyFileUploading ? "Uploading Documents..." : "Saving..."}
                                    </>
                                ) : <Check className="h-4 w-4" />}
                                Update Vehicle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
