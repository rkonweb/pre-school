"use client";

import { useEffect, useState } from "react";
import { 
    Bell, FileText, Calendar, Tag, Clock, 
    Shield, CheckCircle2, X, Upload, ExternalLink,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
    Btn, ErpInput, ErpCard, ErpModal, 
    Badge, StatusChip, SectionHeader 
} from "@/components/ui/erp-ui";
import { getRolesAction } from "@/app/actions/role-actions";

const CIRCULAR_TYPES = ["CIRCULAR", "NOTICE", "NEWSLETTER", "FORM", "EVENT"];
const CATEGORIES = ["GENERAL", "ACADEMIC", "ADMINISTRATIVE", "FEE-RELATED", "ADMISSION", "SPORTS", "OTHER"];

interface CircularFormProps {
    slug: string;
    initialData?: any;
    onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function CircularForm({ slug, initialData, onSubmit }: CircularFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);

    const [form, setForm] = useState({
        title: initialData?.title || "",
        subject: initialData?.subject || "",
        content: initialData?.content || "",
        type: initialData?.type || "CIRCULAR",
        category: initialData?.category || "GENERAL",
        priority: initialData?.priority || "NORMAL",
        targetClassIds: initialData?.targetClassIds ? JSON.parse(initialData.targetClassIds) : [],
        targetRoles: initialData?.targetRoles ? JSON.parse(initialData.targetRoles) : [],
        isPublished: initialData?.isPublished ?? true,
        expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().split('T')[0] : "",
        fileUrl: initialData?.fileUrl || "",
    });

    useEffect(() => {
        async function fetchRoles() {
            try {
                const res = await getRolesAction(slug);
                if (res.success && res.roles) {
                    // Extract unique role names
                    const roles = res.roles.map((r: any) => r.name);
                    // Add standard system roles if not present, and PUBLIC
                    const systemRoles = ["ADMIN", "PRINCIPAL", "TEACHER", "PARENT", "STAFF", "PUBLIC"];
                    const allRoles = Array.from(new Set([...systemRoles, ...roles]));
                    setAvailableRoles(allRoles);
                } else {
                    setAvailableRoles(["ADMIN", "PRINCIPAL", "TEACHER", "PARENT", "STAFF", "PUBLIC"]);
                }
            } catch (e) {
                setAvailableRoles(["ADMIN", "PRINCIPAL", "TEACHER", "PARENT", "STAFF", "PUBLIC"]);
            } finally {
                setIsLoadingRoles(false);
            }
        }
        fetchRoles();
    }, [slug]);

    const handleSubmit = async () => {
        if (!form.title) {
            toast.error("Circular title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await onSubmit({
                ...form,
                schoolSlug: slug,
                targetClassIds: form.targetClassIds.length > 0 ? form.targetClassIds : ["all"],
            });

            if (res.success) {
                toast.success(initialData ? "Circular updated!" : "Circular created!");
                router.push(`/s/${slug}/circulars`);
            } else {
                toast.error(res.error || "Failed to save circular");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <SectionHeader
                title={initialData ? "Edit Circular" : "Create New Circular"}
                subtitle="Draft and broadcast a new announcement to your school community."
                icon={Bell}
            />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
                <ErpCard title="Main Information">
                    <div className="flex flex-col gap-6">
                        <ErpInput
                            label="Circular Title"
                            placeholder="E.g., Sports Day 2025"
                            required
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            icon={FileText}
                        />
                        <ErpInput
                            label="Subject Line"
                            placeholder="Brief summary..."
                            value={form.subject}
                            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-gray-600">Detailed Content</label>
                            <textarea
                                value={form.content}
                                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                rows={10}
                                placeholder="Write your announcement here..."
                                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand resize-none"
                            />
                        </div>
                    </div>
                </ErpCard>

                <ErpCard title="Targeting & Roles">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-gray-600">Target Roles</label>
                            {isLoadingRoles ? (
                                <div className="flex items-center gap-2 text-gray-400 py-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                                    <span className="text-xs font-medium">Fetching roles...</span>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableRoles.map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setForm(f => {
                                                const current = f.targetRoles;
                                                const next = current.includes(role) ? current.filter((r: string) => r !== role) : [...current, role];
                                                return { ...f, targetRoles: next };
                                            })}
                                            type="button"
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border-2 transition-all",
                                                form.targetRoles.includes(role)
                                                    ? "border-brand bg-brand/10 text-brand"
                                                    : "border-gray-100 text-gray-400 hover:border-gray-200"
                                            )}
                                            style={form.targetRoles.includes(role) ? { borderColor: 'var(--brand-color)', color: 'var(--brand-color)' } : {}}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <ErpInput
                            label="Attachment URL (PDF/Image)"
                            placeholder="https://..."
                            value={form.fileUrl}
                            onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                            icon={Upload}
                        />
                    </div>
                </ErpCard>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <ErpCard title="Settings">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-gray-600">Type</label>
                            <select
                                value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand"
                            >
                                {CIRCULAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-gray-600">Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand"
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-gray-600">Priority</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand"
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="LOW">Low</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-gray-600">Expiry Date</label>
                            <ErpInput
                                type="date"
                                value={form.expiresAt}
                                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                icon={Calendar}
                            />
                            <p className="text-[11px] text-gray-400 italic">Optional. Circular will be hidden after this date.</p>
                        </div>
                    </div>
                </ErpCard>

                <ErpCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-700">Public visibility</span>
                                <span className="text-[11px] text-gray-400">Status: {form.isPublished ? "Public" : "Draft"}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                                className={cn(
                                    "w-12 h-6 rounded-full relative transition-all",
                                    form.isPublished ? "bg-brand" : "bg-gray-200"
                                )}
                                style={form.isPublished ? { backgroundColor: 'var(--brand-color)' } : {}}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                    form.isPublished ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Btn 
                                variant="primary" 
                                fullWidth 
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                icon={CheckCircle2}
                            >
                                {initialData ? "Update Circular" : "Publish Now"}
                            </Btn>
                            <Btn 
                                variant="secondary" 
                                fullWidth 
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Btn>
                        </div>
                    </div>
                </ErpCard>
            </div>
        </div>
        </div>
    );
}
