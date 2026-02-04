"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    getDriversAction,
    createDriverAction
} from "@/app/actions/transport-actions";
import {
    User,
    Plus,
    Phone,
    CreditCard,
    Loader2,
    X,
    SteeringWheel
} from "lucide-react";
import { toast } from "sonner";

export default function DriversPage() {
    const params = useParams();
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
        if (res.success) {
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
                toast.success("Driver added");
                setIsModalOpen(false);
                fetchDrivers();
                setFormData({ name: "", licenseNumber: "", phone: "", status: "ACTIVE" });
            } else {
                toast.error(res.error || "Failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Drivers</h1>
                    <p className="text-zinc-500">Manage transport staff and drivers.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                    <Plus className="h-4 w-4" />
                    Add Driver
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {drivers.map((driver) => (
                        <div key={driver.id} className="group relative flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition-all hover:scale-[1.01] hover:shadow-md">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 font-bold border border-amber-100">
                                {driver.name.charAt(0)}
                            </div>
                            <div className="space-y-1 w-full">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-zinc-900">{driver.name}</h3>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                                </div>
                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> {driver.phone}
                                </div>
                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                    <CreditCard className="h-3 w-3" /> License: {driver.licenseNumber}
                                </div>
                            </div>
                        </div>
                    ))}
                    {drivers.length === 0 && (
                        <div className="col-span-full py-12 text-center text-zinc-500">
                            No drivers registered.
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900">Add New Driver</h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-zinc-100">
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">Full Name</label>
                                <input
                                    required
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">Phone Number</label>
                                <input
                                    required
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">License Number</label>
                                <input
                                    required
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50"
                                    value={formData.licenseNumber}
                                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Add Driver
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
