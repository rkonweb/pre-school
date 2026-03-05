"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getDriversAction
} from "@/app/actions/transport-actions";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, User, Phone, CreditCard, Loader2, Navigation, Settings2, GripVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { SectionHeader, tableStyles, StatusChip, RowActions } from "@/components/ui/erp-ui";

export default function DriversPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const [columns, setColumns] = useState([
        { id: 'driver', label: 'Driver Details' },
        { id: 'license', label: 'License' },
        { id: 'contact', label: 'Contact' },
        { id: 'status', label: 'Status' }
    ]);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        driver: true,
        license: true,
        contact: true,
        status: true
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
                title="Designated Pilots"
                subtitle="Manage certified transport staff and authorized vehicle operators."
                icon={User}
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
                                    <Droppable droppableId="driver-columns">
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
                    </div>
                }
            />

            {loading ? (
                <div className="flex h-[40vh] items-center justify-center flex-col gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic tracking-[3px]">Mapping personnel data...</p>
                </div>
            ) : (
                <div style={tableStyles.container}>
                    {drivers.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="mx-auto h-20 w-20 rounded-[24px] bg-zinc-50 flex items-center justify-center mb-6 dark:bg-zinc-900">
                                <Navigation className="h-8 w-8 text-zinc-200" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight dark:text-zinc-50">Zero Registry</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">No pilots commissioned for this cluster yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={tableStyles.thead}>
                                    <tr>
                                        <th style={{ ...tableStyles.thNoSort, width: "5rem", textAlign: "center" }}>Actions</th>
                                        {columns.map(col => {
                                            if (!visibleColumns[col.id]) return null;
                                            return <th key={col.id} style={tableStyles.thNoSort as any}>{col.label}</th>;
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map((driver, i) => (
                                        <tr
                                            key={driver.id}
                                            className="group"
                                            style={i % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                            onMouseEnter={e => {
                                                (e.currentTarget).style.background = "#FFFBEB";
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget).style.background = i % 2 === 0 ? "white" : "#F9FAFB";
                                            }}
                                        >
                                            <td style={{ ...tableStyles.td, textAlign: "center" }}>
                                                <RowActions
                                                    onView={`/s/${slug}/transport/fleet/drivers/${driver.id}`}
                                                    viewTooltip="View details"
                                                />
                                            </td>
                                            {columns.map((col) => {
                                                if (!visibleColumns[col.id]) return null;

                                                if (col.id === 'driver') return (
                                                    <td key={col.id} style={tableStyles.td}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                                                                {driver.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-zinc-900 whitespace-nowrap">
                                                                    {driver.name}
                                                                </h3>
                                                                <div className="flex items-center gap-1 font-semibold text-amber-500 text-xs mt-1">
                                                                    {driver.averageScore ? (driver.averageScore / 20).toFixed(1) : "5.0"}
                                                                    <Star className="h-3 w-3 fill-amber-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                                if (col.id === 'license') return (
                                                    <td key={col.id} style={tableStyles.td}>
                                                        <span className="font-semibold text-zinc-900 whitespace-nowrap">{driver.licenseNumber}</span>
                                                    </td>
                                                );
                                                if (col.id === 'contact') return (
                                                    <td key={col.id} style={tableStyles.td}>
                                                        <span className="font-semibold text-zinc-900 whitespace-nowrap">{driver.phone}</span>
                                                    </td>
                                                );
                                                if (col.id === 'status') return (
                                                    <td key={col.id} style={tableStyles.td}>
                                                        <StatusChip label="Clearance Active" />
                                                    </td>
                                                );
                                                return null;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
