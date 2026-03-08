"use client";

import { useState } from "react";
import { Plus, Search, MapPin, Phone, Mail, FileText, ChevronRight, Store, Box, Settings2, GripVertical, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createVendorAction } from "@/app/actions/vendor-actions";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function VendorDirectoryClient({ slug, initialVendors }: { slug: string, initialVendors: any[] }) {
    const [vendors, setVendors] = useState(initialVendors);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [categories, setCategories] = useState<string[]>([]);

    // Derived state
    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.categories.some((c: string) => c.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCreateVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await createVendorAction(slug, {
            name,
            contactPerson,
            email,
            phone,
            categories: categories.length ? categories : ["GENERAL"]
        });

        if (res.success && res.data) {
            setVendors([...vendors, res.data].sort((a, b) => a.name.localeCompare(b.name)));
            setIsAddModalOpen(false);
            // Reset form
            setName(""); setContactPerson(""); setEmail(""); setPhone(""); setCategories([]);
        } else {
            alert(res.error || "Failed to create vendor");
        }
        setIsSubmitting(false);
    };

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const [columns, setColumns] = useState([
        { id: 'vendor', label: 'Vendor Details' },
        { id: 'contact', label: 'Contact' },
        { id: 'categories', label: 'Categories' }
    ]);

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        vendor: true,
        contact: true,
        categories: true
    });

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(columns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setColumns(items);
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vendor Directory</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your suppliers for Books, Uniforms, and other store inventory.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand focus:border-brand w-64"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-10 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm hover:border-brand/30 hover:text-brand transition-all outline-none"
                            >
                                <Settings2 className="h-4 w-4" />
                                Columns
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 p-2 rounded-2xl shadow-xl">
                            <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Customize Columns
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="vendor-columns">
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
                                                                snapshot.isDragging ? "bg-slate-100 shadow-sm" : "hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600"
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

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-brand text-[var(--secondary-color)] px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* Vendor Table */}
            {filteredVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
                    <Store className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No vendors found</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                        {search ? "Try adjusting your search query." : "You haven't added any vendors yet. Start by onboarding a new supplier!"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider sticky left-0 z-10 border-r border-slate-200">Action</th>
                                    {columns.map(col => {
                                        if (!visibleColumns[col.id]) return null;
                                        return <th key={col.id} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{col.label}</th>;
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] text-left">
                                            <div className="flex items-center justify-start gap-2 relative z-20">
                                                <Link
                                                    href={`/s/${slug}/vendor/vendors/${vendor.id}`}
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 hover:scale-105 transition-all outline-none"
                                                    title="View Profile"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                        {columns.map((col) => {
                                            if (!visibleColumns[col.id]) return null;

                                            if (col.id === 'vendor') return (
                                                <td key={col.id} className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-brand/10 flex items-center justify-center">
                                                            <Store className="h-5 w-5 text-brand" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-slate-900 hover:text-brand transition-colors"><Link href={`/s/${slug}/vendor/vendors/${vendor.id}`}>{vendor.name}</Link></div>
                                                            <div className="text-sm text-slate-500">ID: {vendor.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'contact') return (
                                                <td key={col.id} className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">{vendor.contactPerson || "—"}</div>
                                                    <div className="text-sm text-slate-500 flex flex-col gap-1 mt-1">
                                                        {vendor.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {vendor.phone}</span>}
                                                        {vendor.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {vendor.email}</span>}
                                                    </div>
                                                </td>
                                            );
                                            if (col.id === 'categories') return (
                                                <td key={col.id} className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {vendor.categories?.length > 0 ? (
                                                            vendor.categories.map((cat: string) => (
                                                                <span key={cat} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                                    {cat}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">General</span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                            return null;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Vendor Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Onboard New Vendor</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleCreateVendor} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" placeholder="e.g. Scholastic Books Inc." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                                    <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand" placeholder="e.g. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand" placeholder="e.g. +1 234 567 890" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand" placeholder="e.g. sales@vendor.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Supplying Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {["BOOKS", "UNIFORMS", "STATIONERY", "SHOES", "SPORTS", "OTHER"].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categories.includes(cat)
                                                ? 'bg-brand text-[var(--secondary-color)]'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting || !name} className="px-6 py-2 bg-brand text-[var(--secondary-color)] text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-50">
                                    {isSubmitting ? "Saving..." : "Onboard Vendor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
