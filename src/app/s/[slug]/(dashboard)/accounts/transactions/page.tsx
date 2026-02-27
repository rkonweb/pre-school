'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ArrowDownRight, ArrowUpRight, Search, FileText, Filter, Receipt } from 'lucide-react';
import { TransactionType } from '@/lib/types/accounts';
import { getSchoolIdBySlug, getTransactions } from '@/app/actions/account-actions';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

import { DashboardLoader } from '@/components/ui/DashboardLoader';

export default function TransactionsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { currency } = useSidebar();

    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const sid = await getSchoolIdBySlug(slug);
                if (!sid) return;
                const txns = await getTransactions(sid);
                setTransactions(txns);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const filteredTransactions = transactions.filter(txn =>
        txn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.transactionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (txn.vendor?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Transactions</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage and track all financial movements.</p>
                </div>
                <Link
                    href={`/s/${slug}/accounts/transactions/new`}
                    className="group flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-brand/20 hover:shadow-brand/30 w-fit"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Record Transaction</span>
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 overflow-hidden flex flex-col">

                {/* Search & Filter Bar */}
                <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/50">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-200 rounded-[1.2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all placeholder:text-zinc-400 shadow-sm"
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto min-h-[400px]">
                    <div className="min-w-[800px] p-0 m-0">
                        {loading ? (
                            <DashboardLoader message="Loading transactions..." className="h-[400px]" />
                        ) : filteredTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-brand/10 flex items-center justify-center mb-6">
                                    <Receipt className="w-10 h-10 text-brand" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 mb-2">No entries found</h3>
                                <p className="text-sm font-medium text-zinc-500 mb-8 max-w-sm">
                                    {searchQuery ? "We couldn't find any transactions matching your search." : "You haven't recorded any financial transactions yet."}
                                </p>
                                {!searchQuery && (
                                    <Link
                                        href={`/s/${slug}/accounts/transactions/new`}
                                        className="inline-flex items-center gap-2 text-brand font-bold text-sm hover:underline bg-brand/5 px-6 py-3 rounded-xl transition-all hover:bg-brand/10"
                                    >
                                        Record your first entry
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-zinc-100/50">Details</th>
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-zinc-100/50">Date / ID</th>
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-r border-zinc-100/50">Category & Method</th>
                                        <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {filteredTransactions.map((txn) => {
                                        const isCredit = txn.type === TransactionType.CREDIT;
                                        return (
                                            <tr key={txn.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                <td className="py-5 px-8 border-r border-zinc-100/30">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-sm",
                                                            isCredit ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-500 border border-red-100"
                                                        )}>
                                                            {isCredit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-zinc-900 group-hover:text-brand transition-colors line-clamp-1">{txn.title}</p>
                                                            {txn.vendor && <p className="text-xs font-bold text-zinc-500 mt-1 line-clamp-1">{txn.vendor.name}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8 border-r border-zinc-100/30">
                                                    <p className="text-sm font-bold text-zinc-900">{new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-[10px] font-black font-mono text-zinc-400 uppercase tracking-widest mt-1.5">{txn.transactionNo}</p>
                                                </td>
                                                <td className="py-5 px-8 border-r border-zinc-100/30">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <span className="px-3 py-1.5 rounded-[0.5rem] bg-zinc-100 text-zinc-600 text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                            {txn.category?.name || 'Uncategorized'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">
                                                            via {txn.paymentMethod.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-8 text-right">
                                                    <p className={cn(
                                                        "text-lg font-black tabular-nums",
                                                        isCredit ? "text-green-600" : "text-zinc-900"
                                                    )}>
                                                        {isCredit ? '+' : '-'}{currency}{Number(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
