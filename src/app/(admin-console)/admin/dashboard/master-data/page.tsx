"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    ChevronRight,
    ChevronDown,
    Trash2,
    Edit2,
    Database,
    Loader2,
    LayoutGrid,
    Map,
    GraduationCap,
    CheckCircle2,
    ArrowRight,
    Briefcase,
    Heart,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getMasterDataAction,
    createMasterDataAction,
    updateMasterDataAction,
    deleteMasterDataAction,
    getMasterDataStatsAction,
    bulkCreateMasterDataAction,
    getAllMasterDataForExportAction
} from "@/app/actions/master-data-actions";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const DATA_TYPES = [
    { id: "GRADE", label: "Grades", icon: GraduationCap, description: "Academic levels for enrollment" },
    { id: "COUNTRY", label: "Countries", icon: Map, description: "Primary geographical regions" },
    { id: "STATE", label: "States", icon: LayoutGrid, description: "Administrative subdivisions" },
    { id: "CITY", label: "Cities", icon: Database, description: "Individual municipal locations" },
    { id: "DESIGNATION", label: "Designations", icon: Briefcase, description: "Staff roles and job titles" },
    { id: "DEPARTMENT", label: "Departments", icon: LayoutGrid, description: "School sections and units" },
    { id: "EMPLOYMENT_TYPE", label: "Employment Types", icon: Briefcase, description: "Types of employment contracts" },
    { id: "BLOOD_GROUP", label: "Blood Groups", icon: Heart, description: "Medical blood group classifications" },
    { id: "GENDER", label: "Gender Identities", icon: User, description: "Gender options for profiles" },
    { id: "SECTION", label: "Sections", icon: LayoutGrid, description: "Classroom divisions (A, B, C...)" },
    { id: "SUBJECT", label: "Subjects", icon: GraduationCap, description: "Teaching subjects for staff assignments" },
];

export default function MasterDataPage() {
    const [selectedType, setSelectedType] = useState("GRADE");
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCount, setTotalCount] = useState(0);

    // Parent handling
    const [selectedParentId, setSelectedParentId] = useState<string | null | undefined>(null);
    const [parentChain, setParentChain] = useState<any[]>([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        parentId: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedType, selectedParentId]);

    async function loadData() {
        try {
            setIsLoading(true);
            const [dataRes, statsRes] = await Promise.all([
                getMasterDataAction(selectedType, selectedParentId),
                getMasterDataStatsAction()
            ]);

            if (dataRes.success && dataRes.data) {
                setData(dataRes.data);
            } else {
                console.error("Master Data Load Error:", dataRes?.error);
                setData([]);
            }

            if (statsRes.success) {
                setTotalCount(statsRes.count);
            }
        } catch (error: any) {
            console.error("Unexpected load error:", error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }

    const [potentialParents, setPotentialParents] = useState<any[]>([]);
    const [isLoadingParents, setIsLoadingParents] = useState(false);

    const getParentType = (type: string) => {
        if (type === "STATE") return "COUNTRY";
        if (type === "CITY") return "STATE";
        if (type === "SECTION") return "GRADE";
        return null;
    };

    const fetchParents = async (type: string) => {
        const parentType = getParentType(type);
        if (!parentType) return;

        setIsLoadingParents(true);
        const res = await getMasterDataAction(parentType, undefined); // Fetch all potential parents
        if (res.success) {
            setPotentialParents(res.data || []);
        }
        setIsLoadingParents(false);
    };

    const handleOpenAdd = async () => {
        setEditingItem(null);
        setFormData({
            name: "",
            code: "",
            parentId: selectedParentId || ""
        });
        await fetchParents(selectedType);
        setIsModalOpen(true);
    };

    const handleEdit = async (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            code: item.code || "",
            parentId: item.parentId || ""
        });
        await fetchParents(selectedType);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            const res = await deleteMasterDataAction(id);
            if (res.success) {
                loadData();
            } else {
                alert(res.error || "Failed to delete");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for hierarchical types
        const parentType = getParentType(selectedType);
        if (parentType && !formData.parentId) {
            alert(`Please select a parent ${parentType}`);
            return;
        }

        setIsSaving(true);

        const res = editingItem
            ? await updateMasterDataAction(editingItem.id, formData)
            : await createMasterDataAction({ ...formData, type: selectedType });

        if (res.success) {
            setIsModalOpen(false);
            loadData();
        } else {
            alert(res.error || "Failed to save");
        }
        setIsSaving(false);
    };

    const navigateToChild = (item: any) => {
        setParentChain([...parentChain, item]);
        setSelectedParentId(item.id);

        if (selectedType === "COUNTRY") setSelectedType("STATE");
        else if (selectedType === "STATE") setSelectedType("CITY");
    };

    const goBackToParent = (index: number) => {
        if (index === -1) {
            setParentChain([]);
            setSelectedParentId(null);
            setSelectedType("COUNTRY");
        } else {
            const newChain = parentChain.slice(0, index + 1);
            setParentChain(newChain);
            const parent = newChain[newChain.length - 1];
            setSelectedParentId(parent.id);

            if (newChain.length === 1) setSelectedType("STATE");
            else if (newChain.length === 2) setSelectedType("CITY");
        }
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeType = DATA_TYPES.find(t => t.id === selectedType);

    return (
        <div className="p-8 space-y-8 bg-zinc-50/50 min-h-screen">
            {/* Standard Dashboard Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">Master Data</h1>
                    <p className="text-zinc-500 font-medium">Standardize and manage global predefined records.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Sync Stat:</span>
                        <span className="text-xs font-extrabold text-blue-600">{totalCount.toLocaleString()} Live</span>
                    </div>
                </div>
            </div>

            <BulkActions
                data={data}
                selectedType={selectedType}
                parentId={selectedParentId}
                onRefresh={loadData}
            />

            {/* Content Panel: Heading (Nav) on Left, Data on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Master Heading (Navigation Panel) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-[32px] border border-zinc-200 p-6 shadow-sm">
                        <h3 className="text-xs font-black text-zinc-400 p-2 uppercase tracking-widest mb-2">Configurations</h3>
                        <div className="space-y-1.5">
                            {DATA_TYPES.map((type) => {
                                const isSelected = selectedType === type.id;
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            if (type.id === "GRADE" || type.id === "COUNTRY") {
                                                setSelectedParentId(null);
                                            } else {
                                                setSelectedParentId(undefined);
                                            }
                                            setParentChain([]);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all group",
                                            isSelected
                                                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                                                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-9 w-9 flex items-center justify-center rounded-xl transition-all",
                                            isSelected ? "bg-white/10" : "bg-zinc-50 text-zinc-400 group-hover:bg-white"
                                        )}>
                                            <Icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-none">{type.label}</p>
                                        </div>
                                        {isSelected && <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-100 overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-sm font-black text-blue-100 uppercase tracking-widest mb-4">System Context</h4>
                            <p className="text-xs font-bold leading-relaxed mb-4">
                                Changes made here are reflected globally across all registered school tenants.
                            </p>
                            <div className="inline-flex items-center gap-2 bg-blue-500/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                                <CheckCircle2 className="h-3 w-3" />
                                Policy Enforced
                            </div>
                        </div>
                        <Database className="absolute -bottom-6 -right-6 h-32 w-32 text-white/10 rotate-12" />
                    </div>
                </div>

                {/* Data Panel */}
                <div className="lg:col-span-9 space-y-6">
                    <div className="bg-white rounded-[40px] border border-zinc-200 shadow-xl shadow-zinc-200/40 overflow-hidden">

                        {/* Data Header Area */}
                        <div className="p-8 border-b border-zinc-100 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-zinc-50/20">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goBackToParent(-1)}
                                        className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
                                    >
                                        {activeType?.label}
                                    </button>
                                    {parentChain.length > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                                    {parentChain.map((p, i) => (
                                        <div key={p.id} className="flex items-center gap-2">
                                            <button
                                                onClick={() => goBackToParent(i)}
                                                className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                                                    i === parentChain.length - 1 ? "text-blue-600" : "text-zinc-400 hover:text-zinc-900"
                                                )}
                                            >
                                                {p.name}
                                            </button>
                                            {i < parentChain.length - 1 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                                        </div>
                                    ))}
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                                    {parentChain.length > 0 ? parentChain[parentChain.length - 1].name : `${activeType?.label} Registry`}
                                </h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Fast search..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="bg-white border border-zinc-200 rounded-2xl py-2.5 pl-11 pr-5 font-bold text-xs focus:ring-2 focus:ring-blue-600 outline-none w-48 transition-all focus:w-64 shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleOpenAdd}
                                    className="bg-zinc-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add New
                                </button>
                            </div>
                        </div>

                        {/* Table Area */}
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-100 text-[10px] h-12 font-black text-zinc-400 uppercase tracking-widest">
                                        <th className="px-10">Entity Identification</th>
                                        <th className="px-10">Sys Code</th>
                                        <th className="px-10">Hierarchical Map</th>
                                        <th className="px-10 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="py-24 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                                            </td>
                                        </tr>
                                    ) : filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="h-16 w-16 bg-zinc-50 rounded-[24px] flex items-center justify-center border border-zinc-100">
                                                        <Database className="h-6 w-6 text-zinc-200" />
                                                    </div>
                                                    <p className="text-zinc-400 font-bold text-sm lowercase">0 matching entities</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((item) => (
                                            <tr key={item.id} className="group hover:bg-zinc-50/50 transition-all">
                                                <td className="px-10 py-6">
                                                    <span className="font-bold text-zinc-900">{item.name}</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                                                        {item.code || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    {(item.children?.length > 0 || item._count?.children > 0) ? (
                                                        <button
                                                            onClick={() => navigateToChild(item)}
                                                            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all hover:bg-blue-600 hover:text-white"
                                                        >
                                                            <ChevronDown className="h-3 w-3" />
                                                            {item.children?.length || item._count?.children} children
                                                        </button>
                                                    ) : (selectedType !== "GRADE" && selectedType !== "CITY") ? (
                                                        <button
                                                            onClick={() => navigateToChild(item)}
                                                            className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            Drill down
                                                            <ChevronRight className="h-3 w-3" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest italic opacity-50">Leaf Node</span>
                                                    )}
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id, item.name)}
                                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                        <div className="p-8 border-b border-zinc-100 bg-zinc-50/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                                    {editingItem ? "Refine Entry" : "Create Entry"}
                                </h2>
                            </div>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-1">
                                {selectedType} {parentChain.length > 0 && `for ${parentChain[parentChain.length - 1].name}`}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            {/* Dynamic Parent Selector */}
                            {getParentType(selectedType) && (
                                <div className="grid grid-cols-3 gap-6 items-center">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Parent Entity</label>
                                    <div className="col-span-2 relative">
                                        <select
                                            required
                                            value={formData.parentId}
                                            onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                            className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all border border-transparent focus:border-blue-100 appearance-none"
                                        >
                                            <option value="">Select Parent {getParentType(selectedType)}</option>
                                            {potentialParents.map(parent => (
                                                <option key={parent.id} value={parent.id}>
                                                    {parent.name} {parent.code ? `(${parent.code})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {isLoadingParents ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-6 items-center">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Master Name</label>
                                <div className="col-span-2">
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all border border-transparent focus:border-blue-100"
                                        placeholder="Identification name..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 items-center">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">System Identifier</label>
                                <div className="col-span-2">
                                    <input
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all border border-transparent focus:border-blue-100"
                                        placeholder="Internal reference code..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 px-8 rounded-2xl border-2 border-zinc-100 font-black text-xs text-zinc-500 hover:bg-zinc-50 transition-all active:scale-95 uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-4 px-8 rounded-2xl bg-zinc-900 text-white font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {editingItem ? "Commit Changes" : "Create Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function BulkActions({ data, selectedType, parentId, onRefresh }: any) {
    const [isImporting, setIsImporting] = useState(false);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const handleExport = async () => {
        const toastId = toast.loading("Preparing full system export...");

        try {
            const res = await getAllMasterDataForExportAction();

            if (!res.success || !res.data) {
                toast.error("Failed to fetch export data", { id: toastId });
                return;
            }

            const allData = res.data;
            const wb = XLSX.utils.book_new();

            const groupedData: Record<string, any[]> = {};
            allData.forEach((item: any) => {
                const type = item.type || "Uncategorized";
                if (!groupedData[type]) groupedData[type] = [];
                groupedData[type].push({
                    Name: item.name,
                    Code: item.code || "",
                    ID: item.id,
                    ParentID: item.parentId || ""
                });
            });

            Object.keys(groupedData).sort().forEach(type => {
                const sheetName = type.substring(0, 31);
                const ws = XLSX.utils.json_to_sheet(groupedData[type]);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            });

            const fileName = `FULL_MasterData_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success(`Export complete! (${allData.length} records)`, { id: toastId });

        } catch (err) {
            console.error("Export Error", err);
            toast.error("Export failed", { id: toastId });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                let parsed: any[] = [];
                let headers: string[] = [];

                if (file.name.endsWith(".csv")) {
                    Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            if (results.meta.fields) headers = results.meta.fields;
                            parsed = results.data;
                            setPreviewData(parsed);
                            setFileHeaders(headers);
                            setShowPreview(true);
                            setIsImporting(false);
                        },
                        error: () => {
                            toast.error("Failed to parse CSV");
                            setIsImporting(false);
                        }
                    });
                } else {
                    const wb = XLSX.read(bstr, { type: "binary" });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    parsed = XLSX.utils.sheet_to_json(ws);

                    if (parsed.length > 0) {
                        headers = Object.keys(parsed[0] as object);
                    }

                    setPreviewData(parsed);
                    setFileHeaders(headers);
                    setShowPreview(true);
                    setIsImporting(false);
                }
            } catch (error) {
                console.error("File Read Error", error);
                toast.error("Failed to read file");
                setIsImporting(false);
            }
        };

        if (file.name.endsWith(".csv")) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
        e.target.value = "";
    };

    const handleImportConfirm = async (cleanedData: any[], strategy: string) => {
        setIsImporting(true);
        const res = await bulkCreateMasterDataAction(selectedType, parentId || null, cleanedData, strategy); // Pass strategy
        if (res.success) {
            toast.success(`Import success: ${res.count} records processed`);
            onRefresh();
            setShowPreview(false);
            setPreviewData(null);
        } else {
            toast.error(res.error || "Import failed");
        }
        setIsImporting(false);
    };

    return (
        <>
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 flex items-center justify-between shadow-sm">
                <div>
                    <h3 className="font-bold text-lg text-zinc-900">Bulk Operations</h3>
                    <p className="text-sm text-zinc-500">Import or Export {selectedType} data.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-bold text-sm transition-all">
                        <Download className="h-4 w-4" />
                        Export XLSX
                    </button>
                    <div className="relative">
                        <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} disabled={isImporting} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                        <button disabled={isImporting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-sm transition-all disabled:opacity-50">
                            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {isImporting ? "Processing..." : "Bulk Upload"}
                        </button>
                    </div>
                </div>
            </div>

            {showPreview && previewData && (
                <ImportPreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    data={previewData}
                    headers={fileHeaders}
                    onConfirm={handleImportConfirm}
                    targetType={selectedType}
                />
            )}
        </>
    );
}

function ImportPreviewModal({ isOpen, onClose, data, headers, onConfirm, targetType }: any) {
    const [strategy, setStrategy] = useState("APPEND");

    if (!isOpen) return null;

    // Auto-detect columns
    const nameCol = headers.find((h: string) => h.toLowerCase().includes("name")) || headers[0] || "";
    const codeCol = headers.find((h: string) => h.toLowerCase().includes("code")) || "";

    const handleConfirm = () => {
        if (!nameCol) {
            toast.error("Could not detect 'Name' column in your file");
            return;
        }

        const cleaned = data.map((row: any) => ({
            name: row[nameCol],
            code: codeCol ? row[codeCol] : undefined
        })).filter((i: any) => i.name);

        onConfirm(cleaned, strategy);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-zinc-100">
                    <h3 className="text-xl font-black text-zinc-900">Import {data.length} {targetType} Records</h3>
                    <p className="text-sm text-zinc-500 mt-1">Choose how to handle existing data</p>
                </div>

                <div className="p-8 overflow-y-auto space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Import Strategy</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setStrategy("APPEND")}
                                className={cn("p-4 rounded-2xl border-2 text-left transition-all", strategy === "APPEND" ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200")}
                            >
                                <span className="block font-bold text-sm text-zinc-900">Append Only</span>
                                <span className="block text-xs text-zinc-500 mt-1">Add new records. Skip duplicates.</span>
                            </button>
                            <button
                                onClick={() => setStrategy("UPDATE")}
                                className={cn("p-4 rounded-2xl border-2 text-left transition-all", strategy === "UPDATE" ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200")}
                            >
                                <span className="block font-bold text-sm text-zinc-900">Update Existing</span>
                                <span className="block text-xs text-zinc-500 mt-1">Update fields if name matches. Add new otherwise.</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Preview (First 5 Rows)</label>
                        <div className="bg-zinc-50 rounded-2xl p-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200">
                                        <th className="pb-2 pr-4 font-bold text-zinc-600 text-xs">Name</th>
                                        {codeCol && <th className="pb-2 font-bold text-zinc-600 text-xs">Code</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(0, 5).map((row: any, i: number) => (
                                        <tr key={i} className="border-b border-zinc-100 last:border-0">
                                            <td className="py-2 pr-4 font-medium text-zinc-900">{row[nameCol]}</td>
                                            {codeCol && <td className="py-2 font-medium text-zinc-600">{row[codeCol] || "-"}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.length > 5 && (
                                <p className="text-xs text-zinc-400 mt-3 text-center">+ {data.length - 5} more rows</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-zinc-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 h-14 rounded-2xl border-2 border-zinc-100 font-black text-xs uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all">Cancel</button>
                    <button onClick={handleConfirm} className="flex-1 h-14 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">Complete Import</button>
                </div>
            </div>
        </div>
    );
}

