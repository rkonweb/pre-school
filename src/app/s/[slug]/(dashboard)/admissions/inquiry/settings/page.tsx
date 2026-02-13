"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Settings,
    MapPin,
    BookOpen,
    Users,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Plus,
    Save,
    Trash2,
    Edit2,
    Check,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    getInquirySettingsAction,
    saveBranchAction,
    deleteBranchAction,
    saveProgramAction,
    deleteProgramAction,
    updateStaffBranchAction
} from "@/app/actions/inquiry-settings-actions";
import { toast } from "sonner";

export default function InquirySettingsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [activeSection, setActiveSection] = useState("branches");
    const [loading, setLoading] = useState(true);
    const [settingsData, setSettingsData] = useState<any>(null);

    // Form States
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchSettings();
    }, [slug]);

    const fetchSettings = async () => {
        setLoading(true);
        const res = await getInquirySettingsAction(slug);
        if (res.success) {
            setSettingsData(res.data);
        } else {
            toast.error(res.error || "Failed to fetch settings");
        }
        setLoading(false);
    };

    const handleSaveBranch = async () => {
        const res = await saveBranchAction(slug, formData);
        if (res.success) {
            toast.success("Branch saved successfully");
            setIsEditing(null);
            fetchSettings();
        } else {
            toast.error(res.error || "Failed to save branch");
        }
    };

    const handleDeleteBranch = async (id: string) => {
        if (!confirm("Are you sure you want to delete this branch?")) return;
        const res = await deleteBranchAction(slug, id);
        if (res.success) {
            toast.success("Branch deleted");
            fetchSettings();
        } else {
            toast.error(res.error || "Failed to delete branch");
        }
    };

    const handleSaveProgram = async () => {
        const res = await saveProgramAction(slug, formData);
        if (res.success) {
            toast.success("Program saved successfully");
            setIsEditing(null);
            fetchSettings();
        } else {
            toast.error(res.error || "Failed to save program");
        }
    };

    const handleDeleteProgram = async (id: string) => {
        if (!confirm("Are you sure you want to delete this program?")) return;
        const res = await deleteProgramAction(slug, id);
        if (res.success) {
            toast.success("Program deleted");
            fetchSettings();
        } else {
            toast.error(res.error || "Failed to delete program");
        }
    };

    const handleUpdateStaffBranch = async (userId: string, branchId: string | null) => {
        const res = await updateStaffBranchAction(slug, userId, branchId);
        if (res.success) {
            toast.success("Staff assignment updated");
            fetchSettings();
        } else {
            toast.error(res.error);
        }
    };

    const SECTIONS = [
        { id: "branches", label: "Branches", icon: MapPin, description: "Manage school branch locations" },
        { id: "programs", label: "Programs", icon: BookOpen, description: "Manage inquiry programs" },
        { id: "staff", label: "Staff & Units", icon: Users, description: "Assign staff to specific branches" },
        { id: "whatsapp", label: "WhatsApp Setup", icon: MessageCircle, description: "WhatsApp API integration" },
    ];

    if (loading && !settingsData) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/s/${slug}/admissions/inquiry`} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                            Inquiry Settings
                        </h1>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-6">
                        Configure the Lead Management Module
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 flex flex-col gap-2">
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            onClick={() => {
                                setActiveSection(section.id);
                                setIsEditing(null);
                            }}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                                activeSection === section.id
                                    ? "bg-brand text-white shadow-xl shadow-brand/20 scale-[1.02]"
                                    : "bg-white border border-zinc-100 text-zinc-500 hover:bg-zinc-50"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                activeSection === section.id ? "bg-white/20" : "bg-zinc-100 group-hover:bg-zinc-200"
                            )}>
                                <section.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest leading-none">{section.label}</p>
                                <p className={cn(
                                    "text-[9px] font-bold mt-1.5 opacity-60",
                                    activeSection === section.id ? "text-white" : "text-zinc-400"
                                )}>{section.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 rounded-[40px] border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-200/40">
                    {activeSection === "branches" && (
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-tight">Manage Branches</h3>
                                <button
                                    onClick={() => {
                                        setIsEditing("new");
                                        setFormData({ name: "" });
                                    }}
                                    className="h-10 px-4 bg-brand text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Add Branch
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {isEditing === "new" && (
                                    <div className="flex items-center gap-4 p-6 rounded-3xl border-2 border-dashed border-brand bg-brand/5 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex-1">
                                            <input
                                                autoFocus
                                                className="w-full bg-transparent border-none text-base font-black text-zinc-900 focus:ring-0 p-0 placeholder:text-zinc-300"
                                                placeholder="Branch Name (e.g. West Campus)"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleSaveBranch}
                                                className="h-10 w-10 rounded-xl bg-brand text-white flex items-center justify-center"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(null)}
                                                className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {settingsData?.branches.map((branch: any) => (
                                    <div key={branch.id} className="flex items-center justify-between p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 group">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                            {isEditing === branch.id ? (
                                                <input
                                                    autoFocus
                                                    className="flex-1 bg-transparent border-none text-base font-black text-zinc-900 focus:ring-0 p-0"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            ) : (
                                                <div>
                                                    <p className="text-base font-black text-zinc-900 leading-none">{branch.name}</p>
                                                    <p className="text-xs text-zinc-400 font-bold uppercase mt-1.5 tracking-widest">Active Branch</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isEditing === branch.id ? (
                                                <>
                                                    <button onClick={handleSaveBranch} className="h-10 w-10 rounded-xl bg-brand text-white flex items-center justify-center">
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => setIsEditing(null)} className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center">
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(branch.id);
                                                            setFormData(branch);
                                                        }}
                                                        className="h-10 w-10 rounded-xl bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center hover:text-brand"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBranch(branch.id)}
                                                        className="h-10 w-10 rounded-xl bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "programs" && (
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-tight">Inquiry Programs</h3>
                                <button
                                    onClick={() => {
                                        setIsEditing("new_program");
                                        setFormData({ name: "", code: "" });
                                    }}
                                    className="h-10 px-4 bg-brand text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Add Program
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {isEditing === "new_program" && (
                                    <div className="flex flex-col gap-4 p-6 rounded-3xl border-2 border-dashed border-brand bg-brand/5 animate-in fade-in slide-in-from-top-4">
                                        <input
                                            autoFocus
                                            className="w-full bg-transparent border-none text-base font-black text-zinc-900 focus:ring-0 p-0 placeholder:text-zinc-300"
                                            placeholder="Program Name (e.g. Toddler)"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <div className="flex items-center justify-between gap-4">
                                            <input
                                                className="w-20 bg-zinc-100 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-brand outline-none"
                                                placeholder="Code"
                                                maxLength={5}
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            />
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleSaveProgram} className="h-8 w-8 rounded-lg bg-brand text-white flex items-center justify-center">
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setIsEditing(null)} className="h-8 w-8 rounded-lg bg-white border border-zinc-200 text-zinc-500 flex items-center justify-center">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {settingsData?.programs.map((program: any) => (
                                    <div key={program.id} className="flex flex-col justify-between p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 group relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-200 text-zinc-400">
                                                {program.code}
                                            </span>
                                        </div>

                                        {isEditing === program.id ? (
                                            <input
                                                autoFocus
                                                className="w-full bg-transparent border-none text-lg font-black text-zinc-900 focus:ring-0 p-0"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        ) : (
                                            <p className="text-lg font-black text-zinc-900 leading-tight">{program.name}</p>
                                        )}

                                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isEditing === program.id ? (
                                                <button onClick={handleSaveProgram} className="h-7 w-7 rounded-lg bg-brand text-white flex items-center justify-center">
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(program.id);
                                                            setFormData(program);
                                                        }}
                                                        className="h-7 w-7 rounded-lg bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center hover:text-brand"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProgram(program.id)}
                                                        className="h-7 w-7 rounded-lg bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "staff" && (
                        <div className="flex flex-col gap-8">
                            <h3 className="text-lg font-black uppercase tracking-tight">Staff & Units</h3>

                            <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50/50">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-200">
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Staff Member</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Assigned Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {settingsData?.staff.map((user: any) => (
                                            <tr key={user.id} className="hover:bg-zinc-100/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-black text-xs uppercase">
                                                            {user.firstName[0]}{user.lastName[0]}
                                                        </div>
                                                        <p className="text-sm font-black text-zinc-900">{user.firstName} {user.lastName}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-md bg-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-brand outline-none"
                                                        value={user.branchId || ""}
                                                        onChange={(e) => handleUpdateStaffBranch(user.id, e.target.value === "" ? null : e.target.value)}
                                                    >
                                                        <option value="">No Unit Assigned</option>
                                                        {settingsData.branches.map((b: any) => (
                                                            <option key={b.id} value={b.id}>{b.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === "whatsapp" && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-lg font-black uppercase tracking-tight">WhatsApp Integration</h3>
                            <div className="p-8 rounded-[32px] bg-green-50 border border-green-100 flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6">
                                    <MessageCircle className="h-10 w-10" />
                                </div>
                                <h4 className="text-lg font-black text-green-900 mb-2">Connect WhatsApp Business API</h4>
                                <p className="text-sm text-green-700 font-medium max-w-sm mb-8 italic">
                                    Automate your parent communication and increase conversion by 3x.
                                </p>
                                <button className="h-12 px-8 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20 hover:scale-[1.02] transition-all">
                                    Get Started with Integration
                                </button>
                            </div>

                            <div className="flex flex-col gap-4 pt-4 border-t border-zinc-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">WhatsApp Number Placeholder</label>
                                <input
                                    type="text"
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full h-12 rounded-2xl border-zinc-200 bg-zinc-50 px-4 text-sm font-bold opacity-50 cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-[10px] font-bold text-zinc-400 italic">Connected number will be displayed here after API integration.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Save indicator (mostly aesthetic now as we use auto-save/modals) */}
            <div className="fixed bottom-8 right-8">
                <button
                    onClick={() => toast.info("Settings are saved automatically upon edit.")}
                    className="h-16 px-10 bg-zinc-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-[1.02] transition-all"
                >
                    <Check className="h-5 w-5" />
                    All Synced
                </button>
            </div>
        </div>
    );
}

