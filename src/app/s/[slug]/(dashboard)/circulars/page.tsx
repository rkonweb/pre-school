"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
    Plus, Bell, Search, Filter, Settings2, 
    MoreVertical, Edit2, Trash2, Eye, EyeOff, 
    Calendar, Tag, Clock, Users, Shield, 
    AlertCircle, CheckCircle2, X, Upload, ExternalLink,
    FileText, User, ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
    getCircularsAction, 
    updateCircularAction, 
    deleteCircularAction 
} from "@/app/actions/circular-actions";
import { 
    Btn, ErpTabs, SectionHeader, tableStyles, 
    SortIcon, RowActions, StatusChip, ErpCard,
    Badge
} from "@/components/ui/erp-ui";
import { format } from "date-fns";
import { SearchInput } from "@/components/ui/SearchInput";
import { useConfirm } from "@/contexts/ConfirmContext";

const CATEGORIES = ["GENERAL", "ACADEMIC", "ADMINISTRATIVE", "FEE-RELATED", "ADMISSION", "SPORTS", "OTHER"];

export default function CircularsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { confirm: confirmDialog } = useConfirm();

    const [circulars, setCirculars] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [activeTab, setActiveTab] = useState(0); // 0: Active, 1: Drafts, 2: Archived

    useEffect(() => { loadData(); }, [slug]);

    async function loadData() {
        setIsLoading(true);
        try {
            const res = await getCircularsAction(slug);
            if (res.success) setCirculars(res.data || []);
            else toast.error(res.error || "Failed to load circulars");
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    async function togglePublish(circularId: string, current: boolean) {
        try {
            const res = await updateCircularAction(circularId, slug, { isPublished: !current });
            if (res.success) {
                toast.success(!current ? "Circular published" : "Circular moved to drafts");
                loadData();
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    }

    async function handleDelete(id: string) {
        const confirmed = await confirmDialog({
            title: "Delete Circular",
            message: "Are you sure you want to delete this circular? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            const res = await deleteCircularAction(id, slug);
            if (res.success) {
                toast.success("Circular deleted successfully");
                loadData();
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting circular");
        }
    }

    const filteredCirculars = circulars.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.subject?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;
        
        let matchesTab = true;
        if (activeTab === 0) matchesTab = c.isPublished;
        else if (activeTab === 1) matchesTab = !c.isPublished;
        else if (activeTab === 2) {
            matchesTab = c.expiresAt && new Date(c.expiresAt) < new Date();
        }

        return matchesSearch && matchesCategory && matchesTab;
    });

    const getPriorityBadgeColor = (p: string) => {
        switch (p) {
            case "URGENT": return "red";
            case "HIGH": return "orange";
            case "NORMAL": return "blue";
            default: return "gray";
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-20 min-w-0">
            <SectionHeader
                title="Circular Hub"
                subtitle="Manage and broadcast school announcements with precision targeting."
                icon={Bell}
                action={
                    <Link href={`/s/${slug}/circulars/new`} passHref>
                        <Btn variant="primary" icon={Plus}>
                            New Circular
                        </Btn>
                    </Link>
                }
            />

            <ErpTabs
                tabs={[
                    { label: "Active", icon: Clock },
                    { label: "Drafts", icon: FileText },
                    { label: "Archived", icon: Shield }
                ]}
                active={activeTab}
                onChange={setActiveTab}
            />

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[300px]">
                    <SearchInput
                        onSearch={setSearchTerm}
                        placeholder="Search circulars..."
                    />
                </div>
                <div className="flex items-center gap-2.5">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="rounded-[10px] border-[1.5px] border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="ALL">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={tableStyles.container}>
                {isLoading ? (
                    <div className="flex h-[240px] flex-col items-center justify-center gap-3">
                        <div className="w-9 h-9 rounded-full border-[3px] border-gray-100 border-t-brand animate-spin" style={{ borderTopColor: 'var(--brand-color)' }} />
                        <p className="text-[13px] font-semibold text-gray-500">Loading circulars...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full border-collapse">
                            <thead style={tableStyles.thead}>
                                <tr>
                                    <th className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase sticky left-0 z-20 bg-[var(--brand-color)] text-[var(--secondary-color)] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-white/10">Action</th>
                                    <th className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase text-[var(--secondary-color)]">Circular Detail</th>
                                    <th className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase text-[var(--secondary-color)]">Target</th>
                                    <th className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase text-[var(--secondary-color)]">Category</th>
                                    <th className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase text-[var(--secondary-color)]">Priority</th>
                                    <th className="px-6 py-4 border-b border-white/10 text-left text-[11px] font-bold tracking-wider uppercase text-[var(--secondary-color)]">Dated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCirculars.length > 0 ? (
                                    filteredCirculars.map((c, i) => (
                                        <tr
                                            key={c.id}
                                            className={cn("transition-all hover:translate-x-[3px]", i % 2 === 0 ? "bg-white" : "bg-gray-50")}
                                        >
                                            <td className="px-6 py-4 border-b border-gray-100 bg-inherit text-left align-middle sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-gray-100">
                                                <RowActions
                                                    onEdit={() => {}} // Not used as we wrap in Link below
                                                    onDelete={() => handleDelete(c.id)}
                                                    extra={
                                                        <div className="flex items-center gap-2">
                                                            <Link href={`/s/${slug}/circulars/${c.id}/edit`} title="Edit Circular">
                                                                <Btn variant="ghost" size="sm" icon={Edit2} className="!p-1" />
                                                            </Link>
                                                            <Btn 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                icon={c.isPublished ? EyeOff : Eye} 
                                                                onClick={() => togglePublish(c.id, c.isPublished)}
                                                                title={c.isPublished ? "Move to Draft" : "Publish"}
                                                                className="!p-1"
                                                            />
                                                        </div>
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100">
                                                <div className="flex flex-col gap-1 min-w-[200px]">
                                                    <span className="font-bold text-gray-800 text-[14px] leading-tight line-clamp-1">{c.title}</span>
                                                    <span className="text-[11px] text-gray-500 font-medium line-clamp-1">{c.subject || "No subject"}</span>
                                                    {c.fileUrl && (
                                                        <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline">
                                                            <ExternalLink size={10} /> View Attachment
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100">
                                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                    {JSON.parse(c.targetRoles || "[]").map((r: string) => (
                                                        <Badge key={r} label={r} size="sm" color="navy" />
                                                    ))}
                                                    {JSON.parse(c.targetRoles || "[]").length === 0 && <span className="text-gray-400 text-xs italic">All Roles</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100">
                                                <Badge label={c.category} color="amber" size="sm" dot />
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100">
                                                <StatusChip label={c.priority} color={getPriorityBadgeColor(c.priority) as any} />
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-semibold text-gray-700">{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold">
                                                        <User size={10} /> {c.author?.firstName || "Admin"}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl">📭</div>
                                                <p className="text-gray-400 font-medium">No circulars found matching your criteria.</p>
                                                <Link href={`/s/${slug}/circulars/new`}>
                                                    <Btn variant="soft" icon={Plus}>Create First Circular</Btn>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
