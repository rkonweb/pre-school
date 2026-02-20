"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getDriversAction,
    createDriverAction
} from "@/app/actions/transport-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ShieldCheck, User, Plus, Phone, CreditCard, Loader2, X, Navigation } from "lucide-react";

export default function DriversPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        licenseNumber: "",
        phone: "",
        status: "ACTIVE"
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDrivers();
    }, [slug]);

    async function fetchDrivers() {
        setLoading(true);
        const res = await getDriversAction(slug);
        if (res.success && res.data) {
            setDrivers(res.data);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createDriverAction(formData, slug);
            if (res.success) {
                toast.success("Pilot commissioned successfully");
                setIsModalOpen(false);
                fetchDrivers();
                setFormData({ name: "", licenseNumber: "", phone: "", status: "ACTIVE" });
            } else {
                toast.error(res.error || "Commissioning failed");
            }
        } catch (error) {
            toast.error("An error occurred during deployment");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport`)}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            Designated Pilots
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                            Manage certified transport staff and authorized vehicle operators.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-12 px-8 bg-brand text-[var(--secondary-color)] hover:brightness-110 rounded-2xl font-black text-[10px] uppercase tracking-[2px] flex items-center gap-2 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Enlist Pilot
                </button>
            </div>

            {loading ? (
                <div className="flex h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {drivers.map((driver) => (
                        <div key={driver.id} className="group overflow-hidden rounded-[40px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40 transition-all hover:shadow-brand/5 hover:translate-y-[-4px] dark:bg-zinc-950 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-8">
                                <div className="h-14 w-14 rounded-2xl bg-brand flex items-center justify-center text-[var(--secondary-color)] font-black text-lg shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
                                    {driver.name.charAt(0)}
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                                        <div className="h-1 w-1 rounded-full bg-emerald-600" />
                                        Clearance Active
                                    </span>
                                    <div className="flex items-center gap-1 font-black text-zinc-950 text-[10px] tracking-widest dark:text-zinc-300">
                                        4.9 <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight group-hover:text-brand transition-colors dark:text-zinc-100">
                                        {driver.name}
                                    </h3>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Fleet Pilot Category A</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Contact</p>
                                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-300">{driver.phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">License ID</p>
                                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-300">{driver.licenseNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {drivers.length === 0 && (
                        <div className="col-span-full rounded-[40px] border-2 border-dashed border-zinc-200 py-32 text-center bg-zinc-50/50">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-white text-zinc-200 shadow-xl">
                                <Navigation className="h-10 w-10 text-zinc-100" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Zero Registry</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2">No pilots commissioned for this cluster yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal - Standardized High-Fidelity Style */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-6 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-xl overflow-hidden rounded-[40px] bg-white shadow-3xl animate-in zoom-in-95 duration-300 dark:bg-zinc-950 dark:border dark:border-zinc-800">
                        <div className="p-10">
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tight dark:text-zinc-50">Enlist Pilot</h2>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[2px] mt-1">Personnel Induction Protocol</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="group h-12 w-12 rounded-2xl border border-zinc-100 flex items-center justify-center hover:bg-brand hover:text-[var(--secondary-color)] transition-all shadow-sm dark:border-zinc-800"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Full Legal Name</label>
                                        <input
                                            required
                                            placeholder="Commander John Doe"
                                            className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 text-sm font-bold focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:bg-zinc-950"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Communication Line</label>
                                            <input
                                                required
                                                placeholder="+91..."
                                                className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 text-sm font-bold focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:bg-zinc-950"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">License Identifier</label>
                                            <input
                                                required
                                                placeholder="DL-XXXX-XXXX"
                                                className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 text-sm font-bold focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:focus:bg-zinc-950"
                                                value={formData.licenseNumber}
                                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-14 rounded-2xl border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 transition-all dark:border-zinc-800"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] h-14 rounded-2xl bg-brand text-[10px] font-black uppercase tracking-[2px] text-[var(--secondary-color)] shadow-xl shadow-brand/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                                        Finalize Induction
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Star = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
