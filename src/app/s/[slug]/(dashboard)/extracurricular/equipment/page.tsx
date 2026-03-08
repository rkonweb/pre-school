"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
    Package, Plus, Search, Filter, 
    MoreVertical, Edit2, Trash2, MapPin, 
    AlertTriangle, CheckCircle2, History
} from "lucide-react";
import { 
    SectionHeader, Btn, tableStyles, 
    SortIcon, StatusChip, ErpModal, 
    ErpInput, ErpCard, RowActions
} from "@/components/ui/erp-ui";
import { 
    getEquipmentAction, 
    createEquipmentAction, 
    updateEquipmentAction, 
    deleteEquipmentAction 
} from "@/app/actions/extracurricular-actions";
import { DashboardLoader } from "@/components/ui/DashboardLoader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EquipmentPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [equipment, setEquipment] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortCol, setSortCol] = useState("name");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const loadData = async () => {
        setIsLoading(true);
        const res = await getEquipmentAction(slug);
        if (res.success) setEquipment(res.data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    const handleSave = async (data: any) => {
        setIsSubmitting(true);
        const res = selectedItem 
            ? await updateEquipmentAction(slug, selectedItem.id, data)
            : await createEquipmentAction(slug, data);
        
        if (res.success) {
            toast.success(selectedItem ? "Equipment updated" : "Equipment added");
            setShowModal(false);
            setSelectedItem(null);
            loadData();
        } else {
            toast.error(res.error);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        const res = await deleteEquipmentAction(slug, id);
        if (res.success) {
            toast.success("Item deleted");
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const filtered = equipment.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const valA = String(a[sortCol] || "").toLowerCase();
        const valB = String(b[sortCol] || "").toLowerCase();
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    const handleSort = (col: string) => {
        if (sortCol === col) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortCol(col);
            setSortDir("asc");
        }
    };

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="flex flex-col gap-6 p-8">
            <SectionHeader
                title="Equipment Inventory"
                subtitle="Manage sports gear, musical instruments, and club assets."
                icon={Package}
                action={
                    <Btn 
                        onClick={() => {
                            setSelectedItem(null);
                            setShowModal(true);
                        }}
                        icon={Plus}
                    >
                        Add Equipment
                    </Btn>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ErpCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Assets</p>
                        <h3 className="text-2xl font-black text-zinc-900">{equipment.length}</h3>
                    </div>
                </ErpCard>
                <ErpCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Good Condition</p>
                        <h3 className="text-2xl font-black text-zinc-900">
                            {equipment.filter(e => e.condition === "NEW" || e.condition === "GOOD").length}
                        </h3>
                    </div>
                </ErpCard>
                <ErpCard className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Needs Attention</p>
                        <h3 className="text-2xl font-black text-zinc-900">
                            {equipment.filter(e => e.condition === "POOR" || e.condition === "BROKEN").length}
                        </h3>
                    </div>
                </ErpCard>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[32px] border-2 border-zinc-100 shadow-sm mt-2">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search equipment or location..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-none rounded-2xl text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[32px] border-2 border-zinc-100 shadow-sm overflow-hidden mt-2">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr style={tableStyles.thead}>
                                <th style={tableStyles.th} className="pl-8" onClick={() => handleSort("name")}>
                                    Asset Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={tableStyles.th} onClick={() => handleSort("quantity")}>
                                    Quantity <SortIcon col="quantity" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={tableStyles.th} onClick={() => handleSort("location")}>
                                    Location <SortIcon col="location" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={tableStyles.th}>Condition</th>
                                <th style={tableStyles.th}>Maintenance</th>
                                <th style={{ ...tableStyles.th, textAlign: 'center' }} className="pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item, idx) => (
                                <tr 
                                    key={item.id} 
                                    style={idx % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}
                                    className="group hover:bg-zinc-50/50 transition-colors"
                                >
                                    <td style={tableStyles.td} className="pl-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                                <Package size={18} />
                                            </div>
                                            <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">{item.name}</span>
                                        </div>
                                    </td>
                                    <td style={tableStyles.td} className="py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-zinc-100 text-zinc-800 rounded-lg text-xs font-black">{item.quantity}</span>
                                        </div>
                                    </td>
                                    <td style={tableStyles.td} className="py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[13px]">
                                            <MapPin size={14} className="text-zinc-300" />
                                            {item.location || "Unassigned"}
                                        </div>
                                    </td>
                                    <td style={tableStyles.td} className="py-4">
                                        <StatusChip 
                                            label={item.condition || "GOOD"} 
                                            color={
                                                item.condition === "NEW" ? "green" :
                                                item.condition === "GOOD" ? "amber" :
                                                item.condition === "FAIR" ? "orange" :
                                                item.condition === "POOR" ? "red" :
                                                "gray"
                                            }
                                        />
                                    </td>
                                    <td style={tableStyles.td} className="py-4 text-xs font-bold text-zinc-400 italic">
                                        {item.maintenanceSchedule || "Regular Checkup"}
                                    </td>
                                    <td style={tableStyles.td} className="py-4 pr-8">
                                        <RowActions 
                                            onEdit={() => {
                                                setSelectedItem(item);
                                                setShowModal(true);
                                            }}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 bg-zinc-50/20">
                        <Package className="w-12 h-12 text-zinc-200" />
                        <p className="text-sm font-black text-zinc-400 uppercase tracking-widest leading-none">No inventory records found</p>
                    </div>
                )}
            </div>

            <EquipmentModal
                open={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedItem(null);
                }}
                onSubmit={handleSave}
                loading={isSubmitting}
                item={selectedItem}
            />
        </div>
    );
}

function EquipmentModal({ open, onClose, onSubmit, loading, item }: any) {
    const [formData, setFormData] = useState({
        name: "",
        quantity: 1,
        location: "",
        condition: "GOOD",
        maintenanceSchedule: ""
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                quantity: item.quantity,
                location: item.location || "",
                condition: item.condition || "GOOD",
                maintenanceSchedule: item.maintenanceSchedule || ""
            });
        } else {
            setFormData({
                name: "",
                quantity: 1,
                location: "",
                condition: "GOOD",
                maintenanceSchedule: ""
            });
        }
    }, [item, open]);

    return (
        <ErpModal
            open={open}
            onClose={onClose}
            title={item ? "Edit Equipment" : "Add New Equipment"}
            subtitle="Track assets and maintain inventory status."
            icon={Package}
        >
            <div className="flex flex-col gap-5 py-4">
                <ErpInput 
                    label="Asset Name"
                    placeholder="e.g. Footballs, Chess Boards, Yoga Mats"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <ErpInput 
                        label="Quantity"
                        type="number"
                        value={formData.quantity.toString()}
                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        required
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-black text-zinc-500 uppercase px-1">Condition</label>
                        <select 
                            title="Select Condition"
                            className="bg-zinc-50 border-2 border-zinc-100 rounded-2xl p-3 text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer"
                            value={formData.condition}
                            onChange={e => setFormData({ ...formData, condition: e.target.value })}
                        >
                            <option value="NEW">New</option>
                            <option value="GOOD">Good</option>
                            <option value="FAIR">Fair</option>
                            <option value="POOR">Poor</option>
                            <option value="BROKEN">Broken</option>
                        </select>
                    </div>
                </div>

                <ErpInput 
                    label="Location / Storage"
                    placeholder="e.g. Sports Room, Cabinet 4, Hall B"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                />

                <ErpInput 
                    label="Maintenance Schedule"
                    placeholder="e.g. Every 3 months, Check for air pressure"
                    value={formData.maintenanceSchedule}
                    onChange={e => setFormData({ ...formData, maintenanceSchedule: e.target.value })}
                />

                <Btn 
                    loading={loading}
                    fullWidth 
                    size="lg"
                    className="mt-4"
                    onClick={() => onSubmit(formData)}
                >
                    {item ? "Update Equipment" : "Add to Inventory"}
                </Btn>
            </div>
        </ErpModal>
    );
}
