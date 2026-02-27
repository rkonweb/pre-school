"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    ArrowRight,
    Navigation,
    ShieldCheck,
    ArrowLeft,
    Layers,
    Activity,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

export default function TransportAssignmentsPage() {
    const params = useParams();
    const router = useRouter();
    const { currency } = useSidebar();
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
    const [transportFee, setTransportFee] = useState<number>(0);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRoutes();
    }, [slug]);

    async function fetchRoutes() {
        const res = await getRoutesAction(slug);
        if (res.success && res.data) setRoutes(res.data);
    }

    // Debounced load for search query
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.length > 2) {
                handleSearch();
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    // Handle clearing search term immediately
    useEffect(() => {
        if (searchQuery === "") {
            handleSearch();
        }
    }, [searchQuery]);

    async function handleSearch() {
        setLoadingStudents(true);
        const res = await searchStudentsForTransportAction(searchQuery, slug);
        if (res.success && res.data) setStudents(res.data);
        setLoadingStudents(false);
    }

    // When a route is selected, load its stops
    useEffect(() => {
        if (selectedRouteId) {
            async function fetchStops() {
                const res = await getRouteDetailsAction(selectedRouteId, slug);
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
            setTransportFee(student.transportProfile.transportFee || 0);
        } else {
            setSelectedRouteId("");
            setPickupStopId("");
            setDropStopId("");
            setTransportFee(0);
        }
    }

    async function handleAssign() {
        if (!selectedStudent || !selectedRouteId || !pickupStopId || !dropStopId) {
            toast.error("Please select all fields");
            return;
        }
        setSubmitting(true);
        try {
            const res = await assignStudentToRouteAction(selectedStudent.id, selectedRouteId, pickupStopId, dropStopId, slug, transportFee);
            if (res.success) {
                toast.success("Student assigned to route");
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
        <div className="flex flex-col gap-8 pb-20">
            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport`)}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm"
                        title="Back to Transport Dashboard"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            Assign Students
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                            Assign students to routes and manage their transport details.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Selection Engine */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-brand" />
                        <input
                            type="text"
                            placeholder="Search student name..."
                            className="w-full h-14 rounded-2xl border border-zinc-200 bg-white pl-12 pr-6 text-sm font-medium text-zinc-900 shadow-sm focus:ring-2 focus:ring-brand outline-none transition-all dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar lg:sticky lg:top-8">
                        {loadingStudents ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 tracking-[3px]">Loading students...</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {students.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => selectStudent(student)}
                                        className={cn(
                                            "group text-left p-5 rounded-[24px] border transition-all hover:scale-[1.02] active:scale-[0.98]",
                                            selectedStudent?.id === student.id
                                                ? "bg-brand border-zinc-900 text-[var(--secondary-color)] shadow-xl shadow-zinc-400/20"
                                                : "bg-white border-zinc-100 hover:border-zinc-200 shadow-sm dark:bg-zinc-950 dark:border-zinc-800"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center font-black text-xs shadow-inner transition-colors",
                                                selectedStudent?.id === student.id ? "bg-white/10 text-[var(--secondary-color)]" : "bg-zinc-50 text-zinc-400 dark:bg-zinc-900"
                                            )}>
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-black text-sm uppercase tracking-tight truncate">
                                                    {student.firstName} {student.lastName}
                                                </div>
                                                <div className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                                                    selectedStudent?.id === student.id ? "text-white/40" : "text-zinc-400"
                                                )}>
                                                    Grade: {student.grade || "N/A"}
                                                </div>
                                            </div>
                                            {student.transportProfile && (
                                                <div className={cn(
                                                    "h-8 w-8 rounded-xl flex items-center justify-center shadow-inner transition-all group-hover:rotate-12",
                                                    selectedStudent?.id === student.id ? "bg-brand text-[var(--secondary-color)] shadow-lg shadow-brand/20" : "bg-brand/5 text-brand"
                                                )}>
                                                    <Bus className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {students.length === 0 && searchQuery.length > 2 && !loadingStudents && (
                            <div className="text-center py-20 px-6 rounded-[32px] bg-zinc-50/50 border-2 border-dashed border-zinc-200">
                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                                    <Search className="h-5 w-5 text-zinc-200" />
                                </div>
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-relaxed">No students found.</h3>
                            </div>
                        )}

                        {searchQuery.length <= 2 && !loadingStudents && (
                            <div className="text-center py-20 px-6 rounded-[32px] bg-zinc-50/50 border border-zinc-100">
                                <User className="h-10 w-10 text-zinc-100 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-relaxed">Search for a student to see their details.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Workspace */}
                <div className="lg:col-span-8">
                    {selectedStudent ? (
                        <div className="rounded-[40px] bg-white p-10 shadow-xl shadow-zinc-200/40 border border-zinc-200 relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 dark:bg-zinc-950 dark:border-zinc-800">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center shadow-lg relative overflow-hidden">
                                        <Layers className="h-6 w-6" />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight dark:text-zinc-50">
                                            Transport Details: <span className="text-brand">{selectedStudent.firstName}</span>
                                        </h2>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Route and stop information</p>
                                    </div>
                                </div>
                                {selectedStudent.transportProfile && (
                                    <button
                                        onClick={handleRemove}
                                        className="h-12 px-6 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm dark:bg-red-500/10 dark:border-red-500/20"
                                    >
                                        Remove Transport
                                    </button>
                                )}
                            </div>

                            <div className="space-y-12">
                                {/* Route Selection */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                                            <Navigation className="h-5 w-5 text-brand" />
                                        </div>
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Available Routes</h3>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {routes.map(route => (
                                            <button
                                                key={route.id}
                                                onClick={() => setSelectedRouteId(route.id)}
                                                className={cn(
                                                    "relative text-left p-6 rounded-[28px] border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                                    selectedRouteId === route.id
                                                        ? "bg-brand border-zinc-900 text-[var(--secondary-color)] shadow-xl"
                                                        : "bg-white border-zinc-100 hover:border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800"
                                                )}
                                            >
                                                <div className="font-black text-sm uppercase tracking-tight">{route.name}</div>
                                                <div className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest mt-1 truncate",
                                                    selectedRouteId === route.id ? "text-white/50" : "text-zinc-400"
                                                )}>{route.description || "Route active"}</div>

                                                {selectedRouteId === route.id && (
                                                    <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-brand flex items-center justify-center text-[var(--secondary-color)] shadow-lg">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stop Selection */}
                                {selectedRouteId && (
                                    <>
                                        <div className="grid sm:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Pickup Point</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 pr-12 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all shadow-sm appearance-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                                                        value={pickupStopId}
                                                        onChange={(e) => setPickupStopId(e.target.value)}
                                                        title="Select Pickup Point"
                                                    >
                                                        <option value="">Select Pickup Point</option>
                                                        {stops.map(stop => (
                                                            <option key={stop.id} value={stop.id}>
                                                                Stop {stop.sequenceOrder}: {stop.name} [{stop.pickupTime}]
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Drop Point</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full h-14 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 pr-12 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all shadow-sm appearance-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                                                        value={dropStopId}
                                                        onChange={(e) => setDropStopId(e.target.value)}
                                                        title="Select Drop Point"
                                                    >
                                                        <option value="">Select Drop Point</option>
                                                        {stops.map(stop => (
                                                            <option key={stop.id} value={stop.id}>
                                                                Stop {stop.sequenceOrder}: {stop.name} [{stop.dropTime}]
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fee Integration */}
                                        <div className="p-8 rounded-[32px] bg-emerald-50/50 border border-emerald-100 space-y-4 dark:bg-emerald-500/5 dark:border-emerald-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm dark:bg-zinc-900">
                                                    <Activity className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Transport Fee</h4>
                                            </div>
                                            <div className="relative max-w-xs">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-600 text-sm">{currency}</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full h-14 rounded-2xl border-0 bg-white pl-10 pr-6 text-sm font-black text-zinc-900 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:bg-zinc-900 dark:text-white"
                                                    value={transportFee || ""}
                                                    onChange={(e) => setTransportFee(parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest leading-relaxed">
                                                A fee record will be created when you assign the student.
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end pt-10 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        onClick={handleAssign}
                                        disabled={submitting || !selectedRouteId}
                                        className="h-16 rounded-2xl bg-brand px-12 text-[10px] font-black uppercase tracking-[2px] text-[var(--secondary-color)] shadow-xl shadow-zinc-200 hover:bg-black hover:text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="h-5 w-5 text-brand" />
                                                Assign Student
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-zinc-100 bg-zinc-50/20 p-20 text-center animate-in fade-in duration-700 dark:border-zinc-800">
                            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-50 dark:bg-zinc-900 dark:ring-zinc-800 dark:shadow-none">
                                <Activity className="h-10 w-10 text-zinc-100 dark:text-zinc-800" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight italic dark:text-zinc-100">Select a Student</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                                Select a student from the list to manage their transport.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
