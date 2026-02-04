"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    getVehiclesAction,
    createVehicleAction,
    updateVehicleAction,
    deleteVehicleAction
} from "@/app/actions/transport-actions";
import {
    Bus,
    Plus,
    Edit,
    Trash,
    Loader2,
    X,
    MoreVertical,
    Tool
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VehiclesPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<any>(null);
    const [formData, setFormData] = useState({
        registrationNumber: "",
        model: "",
        capacity: "30",
        status: "ACTIVE"
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchVehicles();
    }, [slug]);

    async function fetchVehicles() {
        setLoading(true);
        const res = await getVehiclesAction(slug);
        if (res.success) {
            setVehicles(res.data);
        }
        setLoading(false);
    }

    function handleOpenModal(vehicle: any = null) {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({
                registrationNumber: vehicle.registrationNumber,
                model: vehicle.model || "",
                capacity: String(vehicle.capacity),
                status: vehicle.status
            });
        } else {
            setEditingVehicle(null);
            setFormData({
                registrationNumber: "",
                model: "",
                capacity: "30",
                status: "ACTIVE"
            });
        }
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            let res;
            if (editingVehicle) {
                res = await updateVehicleAction(editingVehicle.id, formData, slug);
            } else {
                res = await createVehicleAction(formData, slug);
            }

            if (res.success) {
                toast.success(editingVehicle ? "Vehicle updated" : "Vehicle added");
                setIsModalOpen(false);
                fetchVehicles();
            } else {
                toast.error(res.error || "Operation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure? This will remove the vehicle.")) return;
        const res = await deleteVehicleAction(id, slug);
        if (res.success) {
            toast.success("Vehicle deleted");
            fetchVehicles();
        } else {
            toast.error(res.error || "Failed to delete");
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Vehicle Management</h1>
                    <p className="text-zinc-500">Add and manage your transport fleet.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vehicles.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-zinc-500">
                            No vehicles found. Add one to get started.
                        </div>
                    ) : (
                        vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 transition-all hover:scale-[1.01] hover:shadow-md">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <Bus className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-zinc-900">{vehicle.registrationNumber}</h3>
                                                <p className="text-xs font-medium text-zinc-500">{vehicle.model || "Unknown Model"}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                                            vehicle.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                                                vehicle.status === "MAINTENANCE" ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-500"
                                        )}>
                                            {vehicle.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="rounded-lg bg-zinc-50 p-2 text-center">
                                            <span className="block text-[10px] font-bold uppercase text-zinc-400">Capacity</span>
                                            <span className="font-bold text-zinc-900">{vehicle.capacity} Seats</span>
                                        </div>
                                        <div className="rounded-lg bg-zinc-50 p-2 text-center">
                                            <span className="block text-[10px] font-bold uppercase text-zinc-400">Routes</span>
                                            <span className="font-bold text-zinc-900">{vehicle._count?.routes || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-2 border-t border-zinc-50 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={() => handleOpenModal(vehicle)}
                                        className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(vehicle.id)}
                                        className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                    >
                                        <Trash className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900">
                                {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-zinc-100">
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">Registration Number</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Model</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700">Capacity</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">Status</label>
                                <select
                                    className="w-full rounded-xl border-zinc-200 bg-zinc-50 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
