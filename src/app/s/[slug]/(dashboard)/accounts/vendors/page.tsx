'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Mail, Phone, MapPin, Search, Store, ArrowRight, Building2, Landmark } from 'lucide-react';
import { getSchoolIdBySlug, getAccountVendors } from '@/app/actions/account-actions';
import { cn } from '@/lib/utils';

import { DashboardLoader } from '@/components/ui/DashboardLoader';

export default function VendorsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const sid = await getSchoolIdBySlug(slug);
                if (!sid) return;
                const v = await getAccountVendors(sid);
                setVendors(v);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.contactName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vendors & Payees</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage parties you pay expenses to (e.g. electricity board, suppliers).</p>
                </div>
                <Link
                    href={`/s/${slug}/accounts/vendors/new`}
                    className="group flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30 w-fit"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Add Vendor</span>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-[2rem] p-4 border border-zinc-200 shadow-xl shadow-zinc-200/50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.2rem] bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                    <Search className="w-5 h-5 text-zinc-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by vendor name, contact person, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-base font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-medium"
                />
            </div>

            {/* Content Grid */}
            {loading ? (
                <DashboardLoader message="Loading vendors..." className="h-[50vh]" />
            ) : filteredVendors.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-brand/10 flex items-center justify-center mb-6">
                        <Store className="w-12 h-12 text-brand" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 mb-2">
                        {searchQuery ? "No vendors matched your search" : "No vendors added yet"}
                    </h3>
                    <p className="text-sm font-medium text-zinc-500 mb-8 max-w-sm">
                        {searchQuery
                            ? "Try adjusting your search terms to find what you're looking for."
                            : "Start adding vendors to keep track of where your expenses are going."}
                    </p>
                    {!searchQuery && (
                        <Link
                            href={`/s/${slug}/accounts/vendors/new`}
                            className="inline-flex items-center gap-2 text-brand font-bold text-sm hover:underline bg-brand/5 px-6 py-3 rounded-xl transition-all hover:bg-brand/10"
                        >
                            Record your first vendor
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVendors.map((vendor) => (
                        <div key={vendor.id} className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/20 hover:shadow-zinc-200/50 hover:border-brand/30 transition-all flex flex-col relative group overflow-hidden">
                            {/* Decorative Top Accent */}
                            <div className={cn(
                                "h-2 w-full absolute top-0 left-0",
                                vendor.status === 'ACTIVE' ? "bg-green-500" : "bg-zinc-300"
                            )}></div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-brand/5 group-hover:border-brand/20 transition-colors">
                                        <Building2 className="w-6 h-6 text-zinc-400 group-hover:text-brand transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-base font-black text-zinc-900 truncate">{vendor.name}</h3>
                                        </div>
                                        {vendor.contactName && (
                                            <p className="text-xs font-bold text-zinc-500 truncate mt-0.5">{vendor.contactName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    {vendor.email && (
                                        <div className="flex items-center gap-3 text-xs font-medium text-zinc-600 group/link">
                                            <div className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 group-hover/link:bg-brand/10 transition-colors">
                                                <Mail className="w-3 h-3 text-zinc-400 group-hover/link:text-brand transition-colors" />
                                            </div>
                                            <a href={`mailto:${vendor.email}`} className="hover:text-brand truncate transition-colors">{vendor.email}</a>
                                        </div>
                                    )}
                                    {vendor.phone && (
                                        <div className="flex items-center gap-3 text-xs font-medium text-zinc-600 group/link">
                                            <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 group-hover/link:bg-brand/10 transition-colors">
                                                <Phone className="w-3 h-3 text-zinc-500 group-hover/link:text-brand transition-colors" />
                                            </div>
                                            <a href={`tel:${vendor.phone}`} className="hover:text-brand transition-colors">{vendor.phone}</a>
                                        </div>
                                    )}
                                    {vendor.address && (
                                        <div className="flex items-start gap-3 text-xs font-medium text-zinc-600">
                                            <div className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                                                <MapPin className="w-3 h-3 text-zinc-400" />
                                            </div>
                                            <span className="line-clamp-2 pt-1">{vendor.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(vendor.taxId || vendor.bankDetails) && (
                                <div className="px-6 py-4 bg-zinc-50/80 border-t border-zinc-100 grid grid-cols-2 gap-4">
                                    {vendor.taxId && (
                                        <div>
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Tax ID / GST</span>
                                            <span className="text-xs font-bold text-zinc-700 font-mono truncate block">{vendor.taxId}</span>
                                        </div>
                                    )}
                                    {vendor.bankDetails && (
                                        <div>
                                            <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
                                                <Landmark className="w-3 h-3" /> Bank
                                            </span>
                                            <span className="text-xs font-bold text-zinc-700 truncate block">{vendor.bankDetails}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* View Details Link Overlay (optional but good for future) */}
                            {/* <Link href={`/s/${slug}/accounts/vendors/${vendor.id}`} className="absolute inset-0 z-10">
                                <span className="sr-only">View Vendor Details</span>
                            </Link> */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
