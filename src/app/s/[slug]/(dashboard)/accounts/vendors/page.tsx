'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus, Filter, ChevronUp, ChevronDown, Edit3, Trash2,
    Settings2, Check, GripVertical, Loader2, Building2,
    Mail, Phone, MapPin, Tag, Landmark, Store
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { SearchInput } from '@/components/ui/SearchInput';
import { StandardActionButton } from '@/components/ui/StandardActionButton';
import { getSchoolIdBySlug, getAccountVendors } from '@/app/actions/account-actions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Vendor = {
    id: string;
    name: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    taxId?: string | null;
    bankDetails?: string | null;
    notes?: string | null;
    category?: string | null;
    status: string;
    createdAt: string | Date;
};

const ALL_COLUMNS = [
    { id: 'name', label: 'Vendor Name' },
    { id: 'contact', label: 'Contact' },
    { id: 'category', label: 'Category' },
    { id: 'taxId', label: 'GST / Tax ID' },
    { id: 'bankDetails', label: 'Bank' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Added' },
];

export default function VendorsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
    const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'name', direction: 'asc' });
    const [showColumnToggle, setShowColumnToggle] = useState(false);
    const [columns, setColumns] = useState(ALL_COLUMNS);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        name: true, contact: true, category: true, taxId: true, bankDetails: true, status: true, createdAt: true,
    });

    const toggleColumn = (id: string) => setVisibleColumns(p => ({ ...p, [id]: !p[id] }));

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const next = Array.from(columns);
        const [moved] = next.splice(result.source.index, 1);
        next.splice(result.destination.index, 0, moved);
        setColumns(next);
    };

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            try {
                const sid = await getSchoolIdBySlug(slug);
                if (!sid) return;
                const v = await getAccountVendors(sid);
                setVendors(v as Vendor[]);
            } catch (e) {
                toast.error('Failed to load vendors');
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [slug]);

    const categories = useMemo(() => {
        const cats = vendors.map(v => v.category).filter(Boolean) as string[];
        return [...new Set(cats)].sort();
    }, [vendors]);

    const handleSort = (field: string) => {
        setSortConfig(c => ({ field, direction: c.field === field && c.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortConfig.field !== field) return <div className="w-4 h-4 text-transparent" />;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    const filtered = useMemo(() => {
        return vendors
            .filter(v => {
                const tabMatch = activeTab === 'active' ? v.status === 'ACTIVE' : v.status !== 'ACTIVE';
                if (!tabMatch) return false;
                if (statusFilter !== 'all' && v.status !== statusFilter) return false;
                if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
                if (searchTerm.length >= 2) {
                    const q = searchTerm.toLowerCase();
                    return (
                        v.name.toLowerCase().includes(q) ||
                        (v.contactName || '').toLowerCase().includes(q) ||
                        (v.email || '').toLowerCase().includes(q) ||
                        (v.category || '').toLowerCase().includes(q) ||
                        (v.taxId || '').toLowerCase().includes(q)
                    );
                }
                return true;
            })
            .sort((a, b) => {
                const dir = sortConfig.direction === 'asc' ? 1 : -1;
                const field = sortConfig.field as keyof Vendor;
                const va = (a[field] ?? '') as string;
                const vb = (b[field] ?? '') as string;
                return va.localeCompare(vb) * dir;
            });
    }, [vendors, activeTab, statusFilter, categoryFilter, searchTerm, sortConfig]);

    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

    return (
        <div className="flex flex-col gap-6 pb-20 min-w-0">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Vendors & Payees</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage all parties you pay — suppliers, utilities, contractors.</p>
                </div>
                <div className="flex gap-3">
                    <StandardActionButton
                        variant="primary"
                        icon={Plus}
                        label="Add Vendor"
                        onClick={() => router.push(`/s/${slug}/accounts/vendors/new`)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {([
                        { key: 'active', label: 'Active Vendors' },
                        { key: 'inactive', label: 'Inactive' },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                                activeTab === tab.key
                                    ? "border-brand text-brand"
                                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <SearchInput
                        onSearch={(term) => setSearchTerm(term)}
                        placeholder="Search vendors, contacts, GST..."
                        className="w-full"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-zinc-400" />
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            title="Filter by Category"
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none focus:border-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Column Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                            title="Customize Columns"
                        >
                            <Settings2 className="h-4 w-4" />
                            Columns
                        </button>
                        {showColumnToggle && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowColumnToggle(false)} />
                                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl z-20 dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="mb-2 px-2 py-1 text-xs font-bold uppercase tracking-wider text-zinc-400">Visible Columns</div>
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="vendor-columns" direction="vertical">
                                            {(provided) => (
                                                <div className="space-y-1" {...provided.droppableProps} ref={provided.innerRef}>
                                                    {columns.map((col, index) => (
                                                        <Draggable key={col.id} draggableId={col.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={cn(
                                                                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800",
                                                                        snapshot.isDragging && "bg-zinc-50 shadow-lg ring-1 ring-zinc-200 z-50"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div {...provided.dragHandleProps} className="cursor-grab hover:bg-zinc-200 rounded p-1 text-zinc-400 hover:text-zinc-600 -ml-1 flex-shrink-0">
                                                                            <GripVertical className="h-4 w-4" />
                                                                        </div>
                                                                        <button className="flex-1 text-left" onClick={() => toggleColumn(col.id)}>
                                                                            <span className={visibleColumns[col.id] ? "text-zinc-900 font-medium" : "text-zinc-400"}>
                                                                                {col.label}
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                    <button onClick={() => toggleColumn(col.id)} className="flex-shrink-0 ml-2">
                                                                        {visibleColumns[col.id] && <Check className="h-4 w-4 text-brand" />}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stats Header ── */}
            {!isLoading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Vendors',
                            value: vendors.length,
                            sub: `${categories.length} categories`,
                            color: 'text-blue-700 dark:text-blue-400',
                            bg: 'bg-blue-50 dark:bg-blue-500/10',
                            border: 'border-blue-100 dark:border-blue-500/20',
                        },
                        {
                            label: 'Active',
                            value: vendors.filter(v => v.status === 'ACTIVE').length,
                            sub: vendors.length > 0 ? `${Math.round(vendors.filter(v => v.status === 'ACTIVE').length / vendors.length * 100)}% of total` : '0%',
                            color: 'text-emerald-700 dark:text-emerald-400',
                            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                            border: 'border-emerald-100 dark:border-emerald-500/20',
                        },
                        {
                            label: 'Inactive',
                            value: vendors.filter(v => v.status !== 'ACTIVE').length,
                            sub: 'Not in use',
                            color: 'text-zinc-600 dark:text-zinc-400',
                            bg: 'bg-zinc-50 dark:bg-zinc-800',
                            border: 'border-zinc-200 dark:border-zinc-700',
                        },
                        {
                            label: 'With Bank Details',
                            value: vendors.filter(v => v.bankDetails).length,
                            sub: vendors.filter(v => v.taxId).length + ' with GST/Tax ID',
                            color: 'text-purple-700 dark:text-purple-400',
                            bg: 'bg-purple-50 dark:bg-purple-500/10',
                            border: 'border-purple-100 dark:border-purple-500/20',
                        },
                    ].map(stat => (
                        <div key={stat.label} className={`rounded-xl border ${stat.border} ${stat.bg} px-5 py-4`}>
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 ${stat.color}`}>{stat.label}</p>
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            <p className={`text-[11px] font-medium mt-0.5 opacity-50 ${stat.color}`}>{stat.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-brand" />
                            <p className="text-sm text-zinc-500 animate-pulse font-medium">Loading vendors...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                        {/* Sticky Action Column */}
                                        <th className="px-6 py-4 text-left font-medium sticky left-0 bg-zinc-50 dark:bg-zinc-800/50 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200 dark:before:border-zinc-800">
                                            Action
                                        </th>
                                        {columns.map(col => {
                                            if (!visibleColumns[col.id]) return null;
                                            const sortable = ['name', 'category', 'status', 'createdAt'].includes(col.id);
                                            return (
                                                <th
                                                    key={col.id}
                                                    className={cn(
                                                        "px-6 py-4 font-medium",
                                                        sortable && "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                    )}
                                                    onClick={sortable ? () => handleSort(col.id) : undefined}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {col.label}
                                                        {sortable && <SortIcon field={col.id} />}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {filtered.length > 0 ? filtered.map((vendor) => (
                                        <tr key={vendor.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                            {/* Sticky action cell */}
                                            <td className="px-6 py-4 text-left sticky left-0 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 transition-colors shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 before:content-[''] before:absolute before:inset-0 before:border-r before:border-zinc-200 dark:before:border-zinc-800">
                                                <div className="flex items-center justify-start gap-2 relative z-20">
                                                    <StandardActionButton
                                                        variant="view"
                                                        icon={Edit3}
                                                        tooltip="Edit Vendor"
                                                        onClick={() => router.push(`/s/${slug}/accounts/vendors/${vendor.id}`)}
                                                    />
                                                    <StandardActionButton
                                                        variant="delete"
                                                        icon={Trash2}
                                                        tooltip="Delete Vendor"
                                                        onClick={() => toast.info('Delete coming soon')}
                                                    />
                                                </div>
                                            </td>

                                            {columns.map(col => {
                                                if (!visibleColumns[col.id]) return null;

                                                if (col.id === 'name') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                                                                <Building2 className="w-4 h-4 text-brand" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-medium text-zinc-900 dark:text-zinc-50 truncate max-w-[180px]" title={vendor.name}>
                                                                    {vendor.name}
                                                                </span>
                                                                {vendor.address && (
                                                                    <span className="text-xs text-zinc-400 flex items-center gap-1 truncate max-w-[180px]">
                                                                        <MapPin className="w-3 h-3 shrink-0" />{vendor.address}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                );

                                                if (col.id === 'contact') return (
                                                    <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            {vendor.contactName && <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{vendor.contactName}</p>}
                                                            {vendor.email && (
                                                                <a href={`mailto:${vendor.email}`} className="text-xs text-zinc-500 hover:text-brand flex items-center gap-1 transition-colors">
                                                                    <Mail className="w-3 h-3" />{vendor.email}
                                                                </a>
                                                            )}
                                                            {vendor.phone && (
                                                                <a href={`tel:${vendor.phone}`} className="text-xs text-zinc-500 hover:text-brand flex items-center gap-1 transition-colors">
                                                                    <Phone className="w-3 h-3" />{vendor.phone}
                                                                </a>
                                                            )}
                                                            {!vendor.contactName && !vendor.email && !vendor.phone && (
                                                                <span className="text-zinc-400">—</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );

                                                if (col.id === 'category') return (
                                                    <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                        {vendor.category ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                                <Tag className="w-3 h-3" />{vendor.category}
                                                            </span>
                                                        ) : <span className="text-zinc-400">—</span>}
                                                    </td>
                                                );

                                                if (col.id === 'taxId') return (
                                                    <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                        {vendor.taxId
                                                            ? <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{vendor.taxId}</span>
                                                            : <span className="text-zinc-400">—</span>}
                                                    </td>
                                                );

                                                if (col.id === 'bankDetails') return (
                                                    <td key={col.id} className="px-6 py-4">
                                                        {vendor.bankDetails ? (
                                                            <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 max-w-[140px] truncate">
                                                                <Landmark className="w-3 h-3 text-zinc-400 shrink-0" />{vendor.bankDetails}
                                                            </span>
                                                        ) : <span className="text-zinc-400">—</span>}
                                                    </td>
                                                );

                                                if (col.id === 'status') return (
                                                    <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                                        <span className={cn(
                                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                            vendor.status === 'ACTIVE'
                                                                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400"
                                                        )}>
                                                            {vendor.status}
                                                        </span>
                                                    </td>
                                                );

                                                if (col.id === 'createdAt') return (
                                                    <td key={col.id} className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap">
                                                        {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                );

                                                return null;
                                            })}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={visibleCount + 1} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3 text-zinc-500">
                                                    <Store className="w-10 h-10 text-zinc-300" />
                                                    <p className="font-medium">
                                                        {searchTerm ? 'No vendors matching your search.' : `No ${activeTab} vendors found.`}
                                                    </p>
                                                    {!searchTerm && (
                                                        <Link href={`/s/${slug}/accounts/vendors/new`} className="text-brand text-sm font-medium hover:underline">
                                                            + Add First Vendor
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                            <div className="flex items-center justify-between text-sm text-zinc-500">
                                <span>
                                    Showing <span className="font-bold text-zinc-900 dark:text-zinc-50">{filtered.length}</span> of{' '}
                                    <span className="font-medium">{vendors.length}</span> vendors
                                </span>
                                <span className="text-xs text-zinc-400">
                                    {vendors.filter(v => v.status === 'ACTIVE').length} active · {vendors.filter(v => v.status !== 'ACTIVE').length} inactive
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
