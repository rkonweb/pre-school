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
    Navigation,
    ShieldCheck,
    Layers,
    Activity,
    IndianRupee
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SectionHeader, ErpCard, Btn, ErpInput, C } from "@/components/ui/erp-ui";
import { useSidebar } from "@/context/SidebarContext";

export default function TransportAssignmentsPage() {
    const params = useParams();
    const router = useRouter();
    const { currency } = useSidebar();
    const slug = params.slug as string;

    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [routes, setRoutes] = useState<any[]>([]);
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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.length > 2) {
                handleSearch();
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

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
                handleSearch();
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
        <div className="space-y-6">
            <SectionHeader
                title="Route Assignments"
                subtitle="Assign students to transport routes and manage pick-up points."
                icon={<Navigation size={18} color={C.amber} />}
            />

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Selection Engine */}
                <div className="lg:col-span-4 space-y-6">
                    <ErpInput
                        placeholder="Search student identity..."
                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar lg:sticky lg:top-8">
                        {loadingStudents ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-brand" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Syncing Registry...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {students.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => selectStudent(student)}
                                        className={cn(
                                            "group text-left p-5 rounded-[28px] border-2 transition-all duration-300",
                                            selectedStudent?.id === student.id
                                                ? "bg-zinc-900 border-zinc-900 text-white shadow-2xl scale-[1.02]"
                                                : "bg-white border-zinc-100 hover:border-zinc-200 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner",
                                                selectedStudent?.id === student.id ? "bg-white/10 text-white" : "bg-zinc-50 text-zinc-400"
                                            )}>
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-black text-sm uppercase tracking-tight truncate">
                                                    {student.firstName} {student.lastName}
                                                </div>
                                                <div className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-60",
                                                    selectedStudent?.id === student.id ? "text-white" : "text-zinc-400"
                                                )}>
                                                    Grade: {student.grade || "N/A"}
                                                </div>
                                            </div>
                                            {student.transportProfile && (
                                                <div className={cn(
                                                    "h-8 w-8 rounded-xl flex items-center justify-center shadow-inner",
                                                    selectedStudent?.id === student.id ? "bg-brand text-[var(--secondary-color)]" : "bg-brand/5 text-brand"
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
                            <ErpCard className="text-center py-24 border-dashed border-2 border-zinc-200">
                                <div className="h-14 w-14 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-6 w-6 text-zinc-200" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Zero Results</h3>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2 italic">Student not in registry.</p>
                            </ErpCard>
                        )}
                    </div>
                </div>

                {/* Right: Workspace */}
                <div className="lg:col-span-8">
                    {selectedStudent ? (
                        <ErpCard className="p-10 shadow-2xl shadow-zinc-200/50 border-zinc-100 relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 rounded-3xl bg-zinc-100 flex items-center justify-center shadow-lg border border-zinc-200/50 relative group">
                                        <Layers className="h-8 w-8 text-zinc-900 group-hover:rotate-12 transition-transform" />
                                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-brand rounded-full animate-ping" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">
                                            Transport Profile
                                        </h2>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Assignment for {selectedStudent.firstName}</p>
                                    </div>
                                </div>
                                {selectedStudent.transportProfile && (
                                    <Btn
                                        variant="danger"
                                        onClick={handleRemove}
                                        loading={submitting}
                                        icon={X}
                                    >
                                        Detach Transport
                                    </Btn>
                                )}
                            </div>

                            <div className="space-y-16">
                                {/* Route Selection */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-900 shadow-sm">
                                            <Navigation className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Network Selection</h3>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        {routes.map(route => (
                                            <button
                                                key={route.id}
                                                onClick={() => setSelectedRouteId(route.id)}
                                                className={cn(
                                                    "relative text-left p-8 rounded-[36px] border-2 transition-all duration-300",
                                                    selectedRouteId === route.id
                                                        ? "bg-brand border-zinc-900 text-[var(--secondary-color)] shadow-xl scale-[1.02]"
                                                        : "bg-white border-zinc-100 hover:border-zinc-200"
                                                )}
                                            >
                                                <div className="font-black text-base uppercase tracking-tight leading-none">{route.name}</div>
                                                <div className={cn(
                                                    "text-[9px] font-black uppercase tracking-[0.2em] mt-2 opacity-50 italic",
                                                    selectedRouteId === route.id ? "text-white" : "text-zinc-400"
                                                )}>{route.description || "Active Corridor"}</div>

                                                {selectedRouteId === route.id && (
                                                    <div className="absolute -top-3 -right-3 h-10 w-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white border-4 border-white shadow-2xl animate-in zoom-in-50 duration-300">
                                                        <Check className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stop Selection */}
                                {selectedRouteId && (
                                    <div className="animate-in slide-in-from-top-12 duration-700 space-y-10">
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div className="space-y-3 px-1">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pick-up Logistics</label>
                                                <div className="relative group">
                                                    <select
                                                        aria-label="Pick-up Stop"
                                                        className="w-full h-16 rounded-3xl border-2 border-zinc-100 bg-zinc-50/50 px-8 pr-14 text-sm font-black text-zinc-900 focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white outline-none transition-all appearance-none"
                                                        value={pickupStopId}
                                                        onChange={(e) => setPickupStopId(e.target.value)}
                                                    >
                                                        <option value="">Select Pickup Point</option>
                                                        {stops.map(stop => (
                                                            <option key={stop.id} value={stop.id}>
                                                                ST {stop.sequenceOrder}: {stop.name} [{stop.pickupTime}]
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-brand" />
                                                </div>
                                            </div>
                                            <div className="space-y-3 px-1">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Drop-off Logistics</label>
                                                <div className="relative group">
                                                    <select
                                                        aria-label="Drop-off Stop"
                                                        className="w-full h-16 rounded-3xl border-2 border-zinc-100 bg-zinc-50/50 px-8 pr-14 text-sm font-black text-zinc-900 focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white outline-none transition-all appearance-none"
                                                        value={dropStopId}
                                                        onChange={(e) => setDropStopId(e.target.value)}
                                                    >
                                                        <option value="">Select Drop Point</option>
                                                        {stops.map(stop => (
                                                            <option key={stop.id} value={stop.id}>
                                                                ST {stop.sequenceOrder}: {stop.name} [{stop.dropTime}]
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 group-focus-within:text-brand transition-colors" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fee Integration */}
                                        <div className="p-10 rounded-[48px] bg-emerald-50/30 border-2 border-dashed border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-3xl bg-white border border-emerald-100 flex items-center justify-center shadow-xl shadow-emerald-200/20 text-emerald-600 group-hover:scale-110 transition-transform">
                                                    <IndianRupee className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Financial Covenant</h4>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 opacity-60 italic">Monthly Transport Retainer</p>
                                                </div>
                                            </div>
                                            <div className="relative w-full md:w-64">
                                                <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-emerald-600 text-lg opacity-40">{currency}</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full h-16 rounded-[28px] border-0 bg-white ring-2 ring-emerald-100 pl-16 pr-8 text-lg font-black text-zinc-900 shadow-2xl shadow-emerald-200/30 focus:ring-brand transition-all outline-none"
                                                    value={transportFee || ""}
                                                    onChange={(e) => setTransportFee(parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-12 border-t border-zinc-50">
                                    <Btn
                                        size="lg"
                                        variant="primary"
                                        onClick={handleAssign}
                                        disabled={submitting || !selectedRouteId}
                                        loading={submitting}
                                        icon={ShieldCheck}
                                        className="h-20 px-16 rounded-[28px] text-[11px] uppercase tracking-[3px]"
                                    >
                                        Authorize Assignment
                                    </Btn>
                                </div>
                            </div>
                        </ErpCard>
                    ) : (
                        <div className="flex h-full min-h-[600px] flex-col items-center justify-center rounded-[64px] border-2 border-dashed border-zinc-100 bg-zinc-50/20 p-20 text-center animate-pulse">
                            <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[40px] bg-white shadow-2xl shadow-zinc-200 border border-zinc-50 relative">
                                <Activity className="h-12 w-12 text-zinc-100" />
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-transparent opacity-50 rounded-[40px]" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight italic opacity-20">Awaiting Target</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-4 max-w-xs leading-relaxed">
                                Select a student identity from the registry to initiate mission assignment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
