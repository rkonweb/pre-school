'use client';

import { useState, useMemo } from "react";
import {
    Plus, MapPin, Bus, Search,
    ChevronDown, ChevronUp,
    User, Phone, Filter, Layers, Navigation
} from "lucide-react";
import { toast } from "sonner";
import { deleteRouteAction } from "@/app/actions/transport-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionHeader, Btn, tableStyles, RowActions, ErpCard, ErpInput, StatusChip } from "@/components/ui/erp-ui";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type Route = any;

interface RouteManagerProps {
    schoolSlug: string;
    initialRoutes: Route[];
    vehicles: any[];
}

export default function RouteManager({ schoolSlug, initialRoutes, vehicles }: RouteManagerProps) {
    const { confirm: confirmDialog } = useConfirm();

    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const [filterDriver, setFilterDriver] = useState<'all' | 'assigned' | 'unassigned'>('all');
    const [filterVehicle, setFilterVehicle] = useState<'all' | 'assigned' | 'unassigned'>('all');

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedRoutes = useMemo(() => {
        let sortableRoutes = [...routes];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            sortableRoutes = sortableRoutes.filter(r =>
                r.name.toLowerCase().includes(lowerQuery) ||
                r.pickupVehicle?.registrationNumber.toLowerCase().includes(lowerQuery) ||
                r.dropVehicle?.registrationNumber.toLowerCase().includes(lowerQuery) ||
                r.driver?.name.toLowerCase().includes(lowerQuery)
            );
        }

        if (filterDriver !== 'all') {
            sortableRoutes = sortableRoutes.filter(r =>
                filterDriver === 'assigned' ? !!r.driverId : !r.driverId
            );
        }

        if (filterVehicle !== 'all') {
            sortableRoutes = sortableRoutes.filter(r =>
                filterVehicle === 'assigned' ? (!!r.pickupVehicleId || !!r.dropVehicleId) : (!r.pickupVehicleId && !r.dropVehicleId)
            );
        }

        if (sortConfig !== null) {
            sortableRoutes.sort((a, b) => {
                let aValue: any = a[sortConfig.key];
                let bValue: any = b[sortConfig.key];

                if (sortConfig.key === 'students') {
                    aValue = a._count?.students || 0;
                    bValue = b._count?.students || 0;
                } else if (sortConfig.key === 'stops') {
                    aValue = a.stops.length;
                    bValue = b.stops.length;
                } else if (sortConfig.key === 'driver') {
                    aValue = a.driver?.name || "";
                    bValue = b.driver?.name || "";
                } else if (sortConfig.key === 'vehicle') {
                    aValue = a.pickupVehicle?.registrationNumber || "";
                    bValue = b.pickupVehicle?.registrationNumber || "";
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableRoutes;
    }, [routes, sortConfig, searchQuery, filterDriver, filterVehicle]);

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Terminate Route",
            message: "This will dissolve the connection between drivers, vehicles and student commute paths. Proceed?",
            variant: "danger",
            confirmText: "Purge Context",
        });

        if (confirmed) {
            const res = await deleteRouteAction(schoolSlug, id);
            if (res.success) {
                toast.success("Route Purged Successfully");
                setRoutes(routes.filter(r => r.id !== id));
            } else {
                toast.error("Process Failure: Could not dissolve route.");
            }
        }
    };

    const [columns, setColumns] = useState([
        { id: 'name', label: 'Network Node', sortKey: 'name' },
        { id: 'driver', label: 'Pilot', sortKey: 'driver' },
        { id: 'vehicle', label: 'Unit', sortKey: 'vehicle' },
        { id: 'stops', label: 'Points', sortKey: 'stops' },
        { id: 'students', label: 'Payload', sortKey: 'students' }
    ]);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        name: true,
        driver: true,
        vehicle: true,
        stops: true,
        students: true
    });

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(columns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setColumns(items);
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Logistics Network"
                subtitle="Configure the school's transport corridors and operational nodes."
                icon={Navigation}
                action={
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-10 px-5 bg-white border-2 border-zinc-100 text-[10px] font-black uppercase tracking-widest hover:border-brand hover:text-brand rounded-2xl transition-all shadow-sm outline-none flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5" />
                                    Interface
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-3 rounded-[32px] shadow-2xl border-zinc-100">
                                <DropdownMenuLabel className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 px-2">
                                    Network Viewports
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="mb-2" />
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="route-columns">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                                                {columns.map((col, index) => (
                                                    <Draggable key={col.id} draggableId={col.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={cn(
                                                                    "flex items-center gap-3 rounded-[18px] px-3 py-2 transition-all group",
                                                                    snapshot.isDragging ? "bg-zinc-900 text-white shadow-xl" : "hover:bg-zinc-50"
                                                                )}
                                                            >
                                                                <div {...provided.dragHandleProps} className="text-zinc-300 group-hover:text-brand transition-colors">
                                                                    <div className="grid grid-cols-2 gap-0.5">
                                                                        {[...Array(6)].map((_, i) => <div key={i} className="h-1 w-1 rounded-full bg-current" />)}
                                                                    </div>
                                                                </div>
                                                                <DropdownMenuCheckboxItem
                                                                    className="flex-1 p-0 bg-transparent focus:bg-transparent text-[11px] font-black uppercase tracking-tight cursor-pointer"
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

                        <Link href={`/s/${schoolSlug}/transport/route/routes/new`} passHref>
                            <Btn variant="primary" icon={Plus}>Establish Corridor</Btn>
                        </Link>
                    </div>
                }
            />

            {/* Filter Hub */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
                <div className="xl:col-span-5">
                    <ErpInput
                        placeholder="Scan for route identity, pilots or units..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={Search}
                    />
                </div>
                <div className="xl:col-span-7 flex flex-wrap items-center gap-4">
                    <div className="h-12 flex items-center gap-3 px-5 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                        <User className="h-4 w-4 text-zinc-400" />
                        <select
                            aria-label="Pilot Status"
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-zinc-600"
                            value={filterDriver}
                            onChange={(e) => setFilterDriver(e.target.value as any)}
                        >
                            <option value="all">Deployment: All</option>
                            <option value="assigned">Piloted</option>
                            <option value="unassigned">Remote/Empty</option>
                        </select>
                    </div>

                    <div className="h-12 flex items-center gap-3 px-5 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                        <Bus className="h-4 w-4 text-zinc-400" />
                        <select
                            aria-label="Unit Status"
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-zinc-600"
                            value={filterVehicle}
                            onChange={(e) => setFilterVehicle(e.target.value as any)}
                        >
                            <option value="all">Units: All</option>
                            <option value="assigned">Stocked</option>
                            <option value="unassigned">Deficient</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Network Infrastructure Table */}
            <ErpCard className="!p-0 overflow-hidden shadow-2xl shadow-zinc-200/40 border-zinc-100 rounded-[32px]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] text-center w-32">Actions</th>
                                {columns.map((col) => {
                                    if (!visibleColumns[col.id]) return null;
                                    return (
                                        <th
                                            key={col.id}
                                            onClick={() => handleSort(col.sortKey)}
                                            className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] text-left cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronUp className={cn("h-2.5 w-2.5", sortConfig?.key === col.sortKey && sortConfig.direction === 'asc' ? 'text-brand' : 'text-zinc-300')} />
                                                    <ChevronDown className={cn("h-2.5 w-2.5", sortConfig?.key === col.sortKey && sortConfig.direction === 'desc' ? 'text-brand' : 'text-zinc-300')} />
                                                </div>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {sortedRoutes.length > 0 ? (
                                sortedRoutes.map((route, i) => (
                                    <tr key={route.id} className={cn("group transition-colors", i % 2 === 0 ? "bg-white" : "bg-zinc-50/20", "hover:bg-amber-50/40")}>
                                        <td className="px-8 py-6 flex justify-center">
                                            <RowActions
                                                onEdit={`/s/${schoolSlug}/transport/route/routes/${route.id}/edit`}
                                                onDelete={() => handleDelete(route.id)}
                                            />
                                        </td>
                                        {columns.map((col) => {
                                            if (!visibleColumns[col.id]) return null;

                                            if (col.id === 'name') return (
                                                <td key={col.id} className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-11 w-11 rounded-[1.25rem] bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm group-hover:bg-brand group-hover:text-white transition-all">
                                                            <Bus className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-zinc-900 uppercase text-xs tracking-tight">{route.name}</div>
                                                            <div className="text-[10px] font-bold text-zinc-400 mt-1 italic">{route.description || "Uncharted corridor"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'driver') return (
                                                <td key={col.id} className="px-8 py-6 whitespace-nowrap">
                                                    {route.driver ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">
                                                                {route.driver.name[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-zinc-900 uppercase text-xs tracking-tight leading-none">{route.driver.name}</div>
                                                                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5 opacity-60">
                                                                    <Phone className="h-3 w-3" /> {route.driver.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <StatusChip label="Vacancy" variant="warning" />
                                                    )}
                                                </td>
                                            );
                                            if (col.id === 'vehicle') return (
                                                <td key={col.id} className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col gap-2">
                                                        {route.pickupVehicle ? (
                                                            <div className="flex items-center gap-3 group/tag">
                                                                <span className="text-[7px] font-black bg-zinc-900 text-white px-1.5 py-0.5 rounded tracking-widest leading-none">P</span>
                                                                <span className="font-black text-zinc-900 text-[10px] tracking-widest bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200/50">{route.pickupVehicle.registrationNumber}</span>
                                                            </div>
                                                        ) : <span className="text-[9px] font-bold text-zinc-300 italic">No inbound unit</span>}

                                                        {route.dropVehicle ? (
                                                            <div className="flex items-center gap-3 group/tag">
                                                                <span className="text-[7px] font-black bg-zinc-400 text-white px-1.5 py-0.5 rounded tracking-widest leading-none">D</span>
                                                                <span className="font-black text-zinc-900 text-[10px] tracking-widest bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200/50">{route.dropVehicle.registrationNumber}</span>
                                                            </div>
                                                        ) : <span className="text-[9px] font-bold text-zinc-300 italic">No outbound unit</span>}
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'stops') return (
                                                <td key={col.id} className="px-8 py-6 whitespace-nowrap text-center">
                                                    <div className="inline-flex items-center gap-2 group/stop h-9 px-4 bg-zinc-100 rounded-[14px] border border-zinc-200/60 font-black text-zinc-900 text-[10px] uppercase tracking-widest hover:border-brand transition-all">
                                                        <MapPin className="h-3 w-3 text-brand" />
                                                        {route._count?.stops || route.stops?.length || 0}
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'students') return (
                                                <td key={col.id} className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-brand/5 border border-brand/10 flex items-center justify-center font-black text-brand text-[10px] shadow-inner">
                                                            {route._count?.students || 0}
                                                        </div>
                                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Commuters</span>
                                                    </div>
                                                </td>
                                            );
                                            return null;
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-32 text-center">
                                        <div className="mx-auto h-24 w-24 rounded-[40px] bg-zinc-50 flex items-center justify-center mb-8 relative">
                                            <Navigation className="h-10 w-10 text-zinc-200" />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 to-transparent rounded-[40px] animate-pulse" />
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight italic">Zero Connectivity</h3>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-3 max-w-sm mx-auto leading-relaxed italic opacity-60">
                                            No corridors matching the current operational parameters were detected.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ErpCard>

            {/* Matrix Status */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-brand animate-ping" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] italic">Live Intelligence Stream: Active</span>
                </div>
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200">
                    Matrix Index: {sortedRoutes.length} / {routes.length} Established Nodes
                </div>
            </div>
        </div>
    );
}
