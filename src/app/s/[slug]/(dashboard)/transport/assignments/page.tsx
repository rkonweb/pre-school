"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    searchStudentsForTransportAction,
    getRoutesAction,
    getRouteDetailsAction,
    assignStudentToRouteAction,
    removeStudentFromTransportAction
} from "@/app/actions/transport-actions";
import {
    Search,
    Bus,
    MapPin,
    User,
    Check,
    Loader2,
    X,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TransportAssignmentsPage() {
    const params = useParams();
    const slug = params.slug as string;

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [routes, setRoutes] = useState<any[]>([]);

    // Selection
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedRouteId, setSelectedRouteId] = useState("");
    const [stops, setStops] = useState<any[]>([]);

    const [pickupStopId, setPickupStopId] = useState("");
    const [dropStopId, setDropStopId] = useState("");

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRoutes();
    }, [slug]);

    async function fetchRoutes() {
        const res = await getRoutesAction(slug);
        if (res.success) setRoutes(res.data);
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.length > 2) {
                handleSearch();
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    async function handleSearch() {
        setLoadingStudents(true);
        const res = await searchStudentsForTransportAction(searchQuery, slug);
        if (res.success) setStudents(res.data);
        setLoadingStudents(false);
    }

    // When a route is selected, load its stops
    useEffect(() => {
        if (selectedRouteId) {
            async function fetchStops() {
                const res = await getRouteDetailsAction(selectedRouteId);
                if (res.success && res.data) {
                    setStops(res.data.stops);
                }
            }
            fetchStops();
        } else {
            setStops([]);
        }
    }, [selectedRouteId]);

    function selectStudent(student: any) {
        setSelectedStudent(student);
        if (student.transportProfile) {
            setSelectedRouteId(student.transportProfile.routeId);
            setPickupStopId(student.transportProfile.pickupStopId);
            setDropStopId(student.transportProfile.dropStopId);
        } else {
            setSelectedRouteId("");
            setPickupStopId("");
            setDropStopId("");
        }
    }

    async function handleAssign() {
        if (!selectedStudent || !selectedRouteId || !pickupStopId || !dropStopId) {
            toast.error("Please select all fields");
            return;
        }
        setSubmitting(true);
        try {
            const res = await assignStudentToRouteAction(selectedStudent.id, selectedRouteId, pickupStopId, dropStopId, slug);
            if (res.success) {
                toast.success("Student assigned to route");
                // Update local list
                handleSearch(); // Refresh list to show updated profile
                setSelectedStudent(null);
            } else {
                toast.error(res.error || "Failed Assignment");
            }
        } catch (e) {
            toast.error("Error");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRemove() {
        if (!selectedStudent) return;
        if (!confirm("Stop transport for this student?")) return;
        setSubmitting(true);
        try {
            const res = await removeStudentFromTransportAction(selectedStudent.id, slug);
            if (res.success) {
                toast.success("Transport removed");
                handleSearch();
                setSelectedStudent(null);
            }
        } catch (e) {
            toast.error("Error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Student Assignment</h1>
                <p className="text-zinc-500">Assign students to bus routes and stops.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Student Search */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search student name..."
                            className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-zinc-900 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-blue-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        {loadingStudents ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                            </div>
                        ) : (
                            students.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => selectStudent(student)}
                                    className={cn(
                                        "cursor-pointer rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 transition-all hover:bg-zinc-50",
                                        selectedStudent?.id === student.id ? "ring-2 ring-blue-600 bg-blue-50/50" : ""
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500">
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-zinc-900">{student.firstName} {student.lastName}</div>
                                            <div className="text-xs text-zinc-500">{student.grade || "No Grade"}</div>
                                        </div>
                                        {student.transportProfile && (
                                            <div className="ml-auto rounded-full bg-emerald-100 p-1 text-emerald-600">
                                                <Bus className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {students.length === 0 && searchQuery.length > 2 && !loadingStudents && (
                            <div className="text-center text-sm text-zinc-500 py-4">No students found.</div>
                        )}
                    </div>
                </div>

                {/* Right: Assignment Form */}
                <div className="lg:col-span-2">
                    {selectedStudent ? (
                        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-zinc-900">
                                    Transport Details for <span className="text-blue-600">{selectedStudent.firstName}</span>
                                </h2>
                                {selectedStudent.transportProfile && (
                                    <button
                                        onClick={handleRemove}
                                        className="text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl"
                                    >
                                        Remove Transport
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-zinc-700">Select Route</label>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {routes.map(route => (
                                            <div
                                                key={route.id}
                                                onClick={() => setSelectedRouteId(route.id)}
                                                className={cn(
                                                    "cursor-pointer rounded-xl border p-4 transition-all",
                                                    selectedRouteId === route.id ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-zinc-200 bg-white hover:bg-zinc-50"
                                                )}
                                            >
                                                <div className="font-bold text-zinc-900">{route.name}</div>
                                                <div className="text-xs text-zinc-500">{route.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedRouteId && (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-zinc-700">Pickup Stop</label>
                                            <select
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3"
                                                value={pickupStopId}
                                                onChange={(e) => setPickupStopId(e.target.value)}
                                            >
                                                <option value="">Select Pickup Detail</option>
                                                {stops.map(stop => (
                                                    <option key={stop.id} value={stop.id}>
                                                        {stop.sequenceOrder}. {stop.name} ({stop.pickupTime})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-zinc-700">Drop Stop</label>
                                            <select
                                                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-3"
                                                value={dropStopId}
                                                onChange={(e) => setDropStopId(e.target.value)}
                                            >
                                                <option value="">Select Drop Detail</option>
                                                {stops.map(stop => (
                                                    <option key={stop.id} value={stop.id}>
                                                        {stop.sequenceOrder}. {stop.name} ({stop.dropTime})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end pt-6 border-t border-zinc-100">
                                    <button
                                        onClick={handleAssign}
                                        disabled={submitting || !selectedRouteId}
                                        className="flex items-center gap-2 rounded-xl bg-zinc-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 disabled:opacity-50"
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save Assignment
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
                            <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                                <User className="h-8 w-8 text-zinc-300" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900">Select a Student</h3>
                            <p className="text-zinc-500">Search and select a student from the list to manage their transport.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
