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
import { StandardActionButton } from "@/components/ui/StandardActionButton";

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
        <div className="flex flex-col gap-8 pb-20">
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
                            Designated Pilots
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium mt-1">
                            Manage certified transport staff and authorized vehicle operators.
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
            </div>

            {loading ? (
                <div className="flex h-[40vh] items-center justify-center flex-col gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic tracking-[3px]">Mapping personnel data...</p>
                </div>
            ) : (
                <div className="rounded-[32px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden dark:bg-zinc-950 dark:border-zinc-800">
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
                                    {drivers.map((driver) => (
                                        <tr key={driver.id} className="group hover:bg-zinc-50/80 transition-all dark:hover:bg-zinc-900/50">
                                            <td className="px-8 py-6 text-left sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 transition-colors shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200 dark:before:border-zinc-800">
                                                <div className="flex items-center justify-start gap-2 relative z-20">
                                                    <StandardActionButton
                                                        variant="view"
                                                        icon={ArrowRight}
                                                        tooltip="View details"
                                                        permission={{ module: 'transport', action: 'read' }}
                                                    />
                                                </div>
                                            </td>
                                            {columns.map((col) => {
                                                if (!visibleColumns[col.id]) return null;

                                                if (col.id === 'driver') return (
                                                    <td key={col.id} className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-2xl bg-brand flex items-center justify-center text-[var(--secondary-color)] font-black text-lg shadow-lg shadow-brand/20 shrink-0">
                                                                {driver.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black text-zinc-900 uppercase tracking-tight group-hover:text-brand transition-colors whitespace-nowrap dark:text-zinc-50">
                                                                    {driver.name}
                                                                </h3>
                                                                <div className="flex items-center gap-1 font-black text-amber-500 text-[10px] tracking-widest mt-1">
                                                                    {driver.averageScore ? (driver.averageScore / 20).toFixed(1) : "5.0"}
                                                                    <Star className="h-3 w-3 fill-amber-500" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                                if (col.id === 'license') return (
                                                    <td key={col.id} className="px-8 py-6">
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-300 whitespace-nowrap">{driver.licenseNumber}</span>
                                                    </td>
                                                );
                                                if (col.id === 'contact') return (
                                                    <td key={col.id} className="px-8 py-6">
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-300 whitespace-nowrap">{driver.phone}</span>
                                                    </td>
                                                );
                                                if (col.id === 'status') return (
                                                    <td key={col.id} className="px-8 py-6">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 whitespace-nowrap">
                                                            <div className="h-1 w-1 rounded-full bg-emerald-600" />
                                                            Clearance Active
                                                        </span>
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
