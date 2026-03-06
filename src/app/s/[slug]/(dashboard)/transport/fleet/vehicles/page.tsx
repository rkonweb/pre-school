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
import { addDays, isBefore } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getSchoolSettingsAction } from "@/app/actions/settings-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import { SectionHeader, Btn, tableStyles, StatusChip, RowActions } from "@/components/ui/erp-ui";

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

        const res = await deleteVehicleAction(slug, id);
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
        <div className="space-y-6">
            <SectionHeader
                title="Vehicle List"
                subtitle="Manage your school's fleet and check vehicle status."
                icon={Bus}
                action={

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
                            <DropdownMenuContent className="w-56 p-2 rounded-2xl shadow-xl">
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
                        <Link href={`/s/${slug}/transport/fleet/vehicles/new`} passHref>
                            <Btn icon={Plus} variant="primary">
                                Add Vehicle
                            </Btn>
                        </Link>
                    </div>
                }
            />

            {/* Controls Bar */}
            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by registration number or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Asset Matrix */}
            <div className={cn(tableStyles.container, "bg-white overflow-hidden shadow-xl shadow-zinc-200/40")}>
                {loading ? (
                    <div className="flex h-[40vh] items-center justify-center flex-col gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic tracking-[3px]">Loading vehicles...</p>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="mx-auto h-20 w-20 rounded-[32px] bg-zinc-50 flex items-center justify-center mb-6">
                            <Bus className="h-8 w-8 text-zinc-200" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">No Vehicles Found</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed italic spacing-wider">Add your first vehicle to start managing the fleet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center w-20">Actions</th>
                                    {columns.map(col => {
                                        if (!visibleColumns[col.id]) return null;
                                        return (
                                            <th key={col.id} className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-left">
                                                {col.label}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map((vehicle, i) => {
                                    const complianceStatus = [
                                        { s: getExpiryStatus(vehicle.insuranceExpiry), label: 'INS' },
                                        { s: getExpiryStatus(vehicle.pollutionExpiry), label: 'POL' },
                                        { s: getExpiryStatus(vehicle.fitnessExpiry), label: 'FIT' },
                                        { s: getExpiryStatus(vehicle.permitExpiry), label: 'PRM' }
                                    ];

                                    const isCritical = complianceStatus.some(item => item.s === "EXPIRED");

                                    return (
                                        <tr
                                            key={vehicle.id}
                                            className={cn(
                                                "group transition-all duration-200 border-b border-zinc-50 last:border-0",
                                                i % 2 === 0 ? "bg-white" : "bg-zinc-50/20",
                                                "hover:bg-amber-50/50"
                                            )}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <RowActions
                                                    onView={`/s/${slug}/transport/fleet/vehicles/${vehicle.id}`}
                                                    viewTooltip="View Vehicle Details"
                                                    onDelete={() => handleDelete(vehicle.id)}
                                                    deleteTooltip="Decommission Vehicle"
                                                    deleteTitle="Delete Vehicle"
                                                />
                                            </td>
                                            {columns.map((col) => {
                                                if (!visibleColumns[col.id]) return null;

                                                if (col.id === 'info') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200/50 shadow-sm shrink-0">
                                                                <Bus className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-zinc-900 whitespace-nowrap uppercase tracking-tight text-sm leading-tight">
                                                                    {vehicle.registrationNumber}
                                                                </div>
                                                                <div className="text-[10px] font-bold text-zinc-400 whitespace-nowrap uppercase tracking-widest mt-1">
                                                                    {vehicle.model || "Standard"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                                if (col.id === 'capacity') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <div className="text-xs font-black text-zinc-900 whitespace-nowrap uppercase tracking-widest">{vehicle.capacity} Seats</div>
                                                    </td>
                                                );
                                                if (col.id === 'status') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <StatusChip
                                                            label={isCritical ? "Issue Found" : "Ready"}
                                                        />
                                                    </td>
                                                );
                                                if (col.id === 'documents') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex gap-1.5">
                                                                {complianceStatus.map((item, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={cn(
                                                                            "h-1.5 w-6 rounded-full shadow-inner ring-1 ring-inset ring-black/5 shrink-0",
                                                                            item.s === "VALID" ? "bg-emerald-400" :
                                                                                item.s === "EXPIRING_SOON" ? "bg-amber-400" :
                                                                                    "bg-red-500"
                                                                        )}
                                                                        title={`${item.label}: ${item.s}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            {vehicle.documents && JSON.parse(vehicle.documents).length > 0 && (
                                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-brand whitespace-nowrap uppercase tracking-widest">
                                                                    <FileText className="h-3 w-3" />
                                                                    +{JSON.parse(vehicle.documents).length} Additional
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
    );
}
