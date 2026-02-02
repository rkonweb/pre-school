"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { getSchoolAdminsAction, createAdminAction, updateAdminAction, deleteAdminAction, toggleAdminStatusAction } from "@/app/actions/admin-actions";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    ChevronRight,
    Plus,
    User,
    Mail,
    Phone,
    Loader2,
    X,
    Edit2,
    Trash2,
    Power,
    UserPlus,
    Building2
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [isLoading, setIsLoading] = useState(true);
    const [schoolData, setSchoolData] = useState<any>(null);
    const [admins, setAdmins] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

    const loadData = async () => {
        if (!schoolData?.id) return;

        setIsLoading(true);
        const adminsRes = await getSchoolAdminsAction(schoolData.id);
        if (adminsRes.success) setAdmins(adminsRes.data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        async function load() {
            const res = await getSchoolSettingsAction(slug);
            if (res.success && res.data) {
                setSchoolData(res.data);
                const adminsRes = await getSchoolAdminsAction(res.data.id);
                if (adminsRes.success) setAdmins(adminsRes.data || []);
            }
            setIsLoading(false);
        }
        load();
    }, [slug]);

    const handleToggleStatus = async (userId: string) => {
        const result = await toggleAdminStatusAction(userId);
        if (result.success) {
            toast.success("Admin status updated");
            loadData();
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this administrator?")) return;

        const result = await deleteAdminAction(userId);
        if (result.success) {
            toast.success("Administrator removed");
            loadData();
        } else {
            toast.error(result.error || "Failed to remove administrator");
        }
    };

    if (isLoading) return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
    );

    return (
        <div className="max-w-4xl space-y-10 animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">System Access Control</h3>
                    <p className="text-sm text-zinc-500 mt-1 font-medium italic">Manage who has administrative authority over the school dashboard.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-200"
                >
                    <Plus className="h-4 w-4" /> Add Admin
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4 text-blue-700 text-sm">
                <ShieldCheck className="h-6 w-6 shrink-0" />
                <div className="space-y-1">
                    <p className="font-bold">Privileged Access</p>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                        Administrators listed below can modify institutional settings, manage student records, and assign roles to other staff members. Ensure only trusted personnel are granted these permissions.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {admins?.map((admin) => (
                    <motion.div
                        key={admin.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white rounded-[32px] border border-zinc-100 p-6 flex items-center justify-between transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-zinc-200/50"
                    >
                        <div className="flex items-center gap-6">
                            <div className={`h-16 w-16 border-2 rounded-[22px] flex items-center justify-center text-xl font-black transition-all duration-300 shadow-sm ${admin.status === "ACTIVE"
                                ? "bg-zinc-50 border-zinc-100 text-zinc-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                                : "bg-red-50 border-red-200 text-red-400"
                                }`}>
                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-zinc-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                    {admin.firstName} {admin.lastName}
                                </p>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <Mail className="h-3 w-3" /> {admin.email || admin.mobile}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${admin.status === "ACTIVE"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                        }`}>
                                        {admin.status}
                                    </span>
                                    {admin.designation && (
                                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em]">
                                            {admin.designation}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleToggleStatus(admin.id)}
                                className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                title={admin.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            >
                                <Power className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedAdmin(admin);
                                    setShowEditModal(true);
                                }}
                                className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(admin.id)}
                                className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {(!admins || admins.length === 0) && (
                <div className="p-20 text-center space-y-4 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <User className="h-8 w-8 text-zinc-200" />
                    </div>
                    <p className="text-sm font-bold text-zinc-400">No administrators found.</p>
                </div>
            )}

            <AddAdminModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                schoolId={schoolData?.id}
                onSuccess={loadData}
            />

            <EditAdminModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                }}
                admin={selectedAdmin}
                onSuccess={loadData}
            />
        </div>
    );
}

function AddAdminModal({ isOpen, onClose, schoolId, onSuccess }: any) {
    const [formData, setFormData] = useState({
        mobile: "",
        email: "",
        firstName: "",
        lastName: "",
        designation: "",
        department: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await createAdminAction(schoolId, formData);
        if (result.success) {
            toast.success("Administrator added successfully");
            onClose();
            onSuccess();
            setFormData({ mobile: "", email: "", firstName: "", lastName: "", designation: "", department: "" });
        } else {
            toast.error(result.error || "Failed to add administrator");
        }
        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-zinc-900">Add Administrator</h3>
                            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Mobile *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Designation</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Add Administrator"}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function EditAdminModal({ isOpen, onClose, admin, onSuccess }: any) {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        designation: "",
        department: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (admin) {
            setFormData({
                email: admin.email || "",
                firstName: admin.firstName || "",
                lastName: admin.lastName || "",
                designation: admin.designation || "",
                department: admin.department || ""
            });
        }
    }, [admin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await updateAdminAction(admin.id, formData);
        if (result.success) {
            toast.success("Administrator updated successfully");
            onClose();
            onSuccess();
        } else {
            toast.error(result.error || "Failed to update administrator");
        }
        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && admin && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-zinc-900">Edit Administrator</h3>
                            <button onClick={onClose} className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Designation</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Update Administrator"}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
