"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    getVehiclesAction,
    deleteVehicleAction
} from "@/app/actions/transport-actions";
import {
    Bus,
    Plus,
    Trash,
    Loader2,
    Search,
    ArrowRight,
    ArrowLeft,
    FileText,
    Settings2,
    GripVertical
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { addDays, isBefore } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function VehiclesPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [brandColor, setBrandColor] = useState("#2D9CB8");

    const [columns, setColumns] = useState([
        { id: 'info', label: 'Vehicle Info' },
        { id: 'capacity', label: 'Capacity' },
        { id: 'status', label: 'Status' },
        { id: 'documents', label: 'Documents' }
    ]);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        info: true,
        capacity: true,
        status: true,
        documents: true
    });

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(columns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setColumns(items);
    };

    useEffect(() => {
        fetchVehicles();
        fetchSettings();
    }, [slug]);

    async function fetchSettings() {
        const res = await getSchoolSettingsAction(slug);
        if (res.success && res.data?.brandColor) {
            setBrandColor(res.data.brandColor);
        }
    }

    async function fetchVehicles() {
        setLoading(true);
        const res = await getVehiclesAction(slug);
        if (res.success && res.data) {
            setVehicles(res.data);
        }
        setLoading(false);
    }

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v =>
            v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vehicles, searchTerm]);

    async function handleDelete(id: string) {
        const confirmed = await confirmDialog({
            title: "Delete Vehicle",
            message: "Are you sure? This will remove the vehicle from the fleet permanently.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await deleteVehicleAction(id, slug);
        if (res.success) {
            toast.success("Vehicle removed from fleet");
            fetchVehicles();
        } else {
            toast.error(res.error || "Decommission failed");
        }
    }

    const getExpiryStatus = (dateStr: string) => {
        if (!dateStr) return "MISSING";
        const date = new Date(dateStr);
        const now = new Date();
        const thirtyDaysLater = addDays(now, 30);

        if (isBefore(date, now)) return "EXPIRED";
        if (isBefore(date, thirtyDaysLater)) return "EXPIRING_SOON";
        return "VALID";
    };

    return (
        <div className="flex flex-col gap-8 pb-20" style={{ '--brand-color': brandColor } as any}>
            {/* Standardized Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex flex-wrap items-center gap-6">
                    <button
                        onClick={() => router.push(`/s/${slug}/transport`)}
                        className="group flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white transition-all hover:border-zinc-900 active:scale-95 shadow-sm shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                            Vehicle List
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                            Manage your school's fleet and check vehicle status.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-12 px-4 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:border-brand/30 hover:text-brand transition-all outline-none"
                            >
                                <Settings2 className="h-4 w-4" />
                                Columns
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl">
                            <DropdownMenuLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Customize Columns
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="vehicle-columns">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {columns.map((col, index) => (
                                                <Draggable key={col.id} draggableId={col.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={cn(
                                                                "flex items-center gap-2 rounded-xl px-2 py-1 transition-colors",
                                                                snapshot.isDragging ? "bg-zinc-100 shadow-sm dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                                            )}
                                                        >
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="cursor-pointer p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                                            >
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>
                                                            <DropdownMenuCheckboxItem
                                                                className="flex-1 rounded-lg cursor-pointer data-[highlighted]:bg-transparent"
                                                                checked={visibleColumns[col.id]}
                                                                onCheckedChange={(checked) =>
                                                                    setVisibleColumns(prev => ({ ...prev, [col.id]: !!checked }))
                                                                }
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                {col.label}
                                                            </DropdownMenuCheckboxItem>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Link
                        href={`/s/${slug}/transport/fleet/vehicles/new`}
                        style={{ backgroundColor: brandColor }}
                        className="h-12 px-8 bg-brand text-[var(--secondary-color)] hover:brightness-110 rounded-2xl font-black text-[10px] uppercase tracking-[2px] flex items-center gap-2 shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Add Vehicle</span>
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-6">
                <div className="relative group max-w-2xl" style={{ '--brand-color': brandColor } as any}>
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-[var(--brand-color)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by registration number or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-[var(--brand-color)] outline-none transition-all shadow-sm dark:bg-zinc-950 dark:border-zinc-800"
                    />
                </div>

                {/* Asset Matrix */}
                <div className="rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
                    {loading ? (
                        <div className="flex h-[40vh] items-center justify-center flex-col gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-brand" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic tracking-[3px]">Loading vehicles...</p>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="mx-auto h-20 w-20 rounded-[24px] bg-zinc-50 flex items-center justify-center mb-6 dark:bg-zinc-900">
                                <Bus className="h-8 w-8 text-zinc-200" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight dark:text-zinc-50">No Vehicles Found</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">Add your first vehicle to start managing the fleet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-zinc-50/50 text-zinc-400 uppercase text-[10px] font-black tracking-widest border-b border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-8 py-5 sticky left-0 bg-zinc-50 dark:bg-zinc-800/50 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200 dark:before:border-zinc-800">Action</th>
                                        {columns.map(col => {
                                            if (!visibleColumns[col.id]) return null;
                                            return <th key={col.id} className="px-8 py-5 whitespace-nowrap">{col.label}</th>;
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {filteredVehicles.map((vehicle) => {
                                        const complianceStatus = [
                                            getExpiryStatus(vehicle.insuranceExpiry),
                                            getExpiryStatus(vehicle.pollutionExpiry),
                                            getExpiryStatus(vehicle.fitnessExpiry),
                                            getExpiryStatus(vehicle.permitExpiry)
                                        ];

                                        const isCritical = complianceStatus.some(s => s === "EXPIRED");

                                        return (
                                            <tr key={vehicle.id} className="group hover:bg-zinc-50/80 transition-all dark:hover:bg-zinc-900/50">
                                                <td className="px-8 py-6 text-left sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 transition-colors shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200 dark:before:border-zinc-800">
                                                    <div className="flex items-center justify-start gap-2 relative z-20">
                                                        <StandardActionButton
                                                            asChild
                                                            variant="view"
                                                            icon={ArrowRight}
                                                            tooltip="View Vehicle Details"
                                                            permission={{ module: 'transport', action: 'read' }}
                                                        >
                                                            <Link href={`/s/${slug}/transport/fleet/vehicles/${vehicle.id}`} />
                                                        </StandardActionButton>
                                                        <StandardActionButton
                                                            variant="delete"
                                                            icon={Trash}
                                                            tooltip="Decommission Vehicle"
                                                            onClick={() => handleDelete(vehicle.id)}
                                                            permission={{ module: 'transport', action: 'delete' }}
                                                        />
                                                    </div>
                                                </td>
                                                {columns.map((col) => {
                                                    if (!visibleColumns[col.id]) return null;

                                                    if (col.id === 'info') return (
                                                        <td key={col.id} className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-12 w-12 rounded-2xl bg-brand flex items-center justify-center text-[var(--secondary-color)] shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                                                    <Bus className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-zinc-900 uppercase tracking-tight text-base whitespace-nowrap dark:text-zinc-50">
                                                                        {vehicle.registrationNumber}
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                                                                        {vehicle.model || "Normal"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    );
                                                    if (col.id === 'capacity') return (
                                                        <td key={col.id} className="px-8 py-6">
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-black text-zinc-900 whitespace-nowrap dark:text-zinc-50">{vehicle.capacity} Seats</div>
                                                                <div className="text-[9px] font-black text-zinc-300 uppercase tracking-widest whitespace-nowrap">Capacity</div>
                                                            </div>
                                                        </td>
                                                    );
                                                    if (col.id === 'status') return (
                                                        <td key={col.id} className="px-8 py-6">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm whitespace-nowrap",
                                                                isCritical
                                                                    ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20"
                                                                    : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                                            )}>
                                                                <div className={cn("h-1 w-1 rounded-full", isCritical ? "bg-red-600 animate-pulse" : "bg-emerald-600")} />
                                                                {isCritical ? "Issue Found" : "Ready"}
                                                            </span>
                                                        </td>
                                                    );
                                                    if (col.id === 'documents') return (
                                                        <td key={col.id} className="px-8 py-6">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex gap-1.5">
                                                                    {complianceStatus.map((s, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className={cn(
                                                                                "h-2 w-6 rounded-full shadow-inner ring-1 ring-inset ring-black/5 shrink-0",
                                                                                s === "VALID" ? "bg-emerald-400" :
                                                                                    s === "EXPIRING_SOON" ? "bg-amber-400" :
                                                                                        "bg-red-500"
                                                                            )}
                                                                            title={s}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                {vehicle.documents && JSON.parse(vehicle.documents).length > 0 && (
                                                                    <div
                                                                        style={{ color: brandColor }}
                                                                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                                                                    >
                                                                        <FileText className="h-3 w-3" />
                                                                        +{JSON.parse(vehicle.documents).length} Other(s)
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                    return null;
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
