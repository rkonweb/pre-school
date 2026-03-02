'use client';

import { useState, useMemo, useCallback } from "react";
import { useSidebar } from "@/context/SidebarContext";
import TransactionStats from "./TransactionStats";
import TransactionFilters, { SourceFilter, DateFilter } from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import AddTransactionDrawer from "./AddTransactionDrawer";
import { useRouter } from "next/navigation";

interface TransactionsClientProps {
    slug: string;
    transactions: any[];
    categories: any[];
    vendors: any[];
    financialYears: any[];
    stats: any;
    selectedFYId: string;
}

function matchesDateFilter(date: Date, filter: DateFilter): boolean {
    const now = new Date();
    const d = new Date(date);
    switch (filter) {
        case 'TODAY':
            return d.toDateString() === now.toDateString();
        case 'THIS_WEEK': {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return d >= weekStart;
        }
        case 'THIS_MONTH':
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'THIS_QUARTER': {
            const q = Math.floor(now.getMonth() / 3);
            const qStart = new Date(now.getFullYear(), q * 3, 1);
            return d >= qStart;
        }
        case 'THIS_FY': {
            const fyStart = new Date(now.getMonth() >= 3
                ? new Date(now.getFullYear(), 3, 1)
                : new Date(now.getFullYear() - 1, 3, 1));
            return d >= fyStart;
        }
        default:
            return true;
    }
}

function exportToCSV(txns: any[], currency: string) {
    const headers = ['Date', 'Transaction No', 'Description', 'Source', 'Category', 'Type', 'Status', 'Amount', 'Vendor', 'Reference'];
    const rows = txns.map(t => [
        new Date(t.date).toLocaleDateString('en-GB'),
        t.transactionNo,
        t.description || '',
        t.source || 'MANUAL',
        t.category?.name || '',
        t.type,
        t.status,
        t.amount,
        t.vendor?.name || '',
        t.reference || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function TransactionsClient({
    slug, transactions, categories, vendors, financialYears, stats, selectedFYId
}: TransactionsClientProps) {
    const { currency } = useSidebar();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>('ALL');
    const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [fyId, setFyId] = useState(selectedFYId);

    // When FY changes, re-navigate to reload server data
    const handleFYChange = useCallback((id: string) => {
        setFyId(id);
        router.push(`?fy=${id}`);
    }, [router]);

    const filtered = useMemo(() => {
        return transactions.filter(txn => {
            const q = searchQuery.toLowerCase();
            if (q && !(
                (txn.description || '').toLowerCase().includes(q) ||
                (txn.transactionNo || '').toLowerCase().includes(q) ||
                (txn.vendor?.name || '').toLowerCase().includes(q) ||
                (txn.reference || '').toLowerCase().includes(q)
            )) return false;

            if (sourceFilter === 'CREDIT' && txn.type !== 'CREDIT') return false;
            if (sourceFilter === 'DEBIT' && txn.type !== 'DEBIT') return false;
            if (['TRANSPORT', 'FEE', 'PAYROLL', 'MANUAL'].includes(sourceFilter) && txn.source !== sourceFilter) return false;

            if (categoryFilter && txn.categoryId !== categoryFilter) return false;

            if (dateFilter !== 'ALL' && !matchesDateFilter(txn.date, dateFilter)) return false;

            return true;
        });
    }, [transactions, searchQuery, sourceFilter, dateFilter, categoryFilter]);

    return (
        <div className="min-h-screen bg-zinc-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Transactions</h1>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Complete financial ledger — all income & expenses</p>
                </div>
                <AddTransactionDrawer
                    slug={slug}
                    financialYears={financialYears}
                    categories={categories}
                    vendors={vendors}
                    onSuccess={() => router.refresh()}
                />
            </div>

            {/* Stats */}
            {stats && (
                <TransactionStats
                    totalIncome={stats.totalIncome}
                    totalExpense={stats.totalExpense}
                    netBalance={stats.netBalance}
                    pendingAmount={stats.pendingAmount}
                    pendingCount={stats.pendingCount}
                    thisMonthNet={stats.thisMonthNet}
                    currency={currency}
                />
            )}

            {/* Filters + Table Card */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/30 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <TransactionFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sourceFilter={sourceFilter}
                        onSourceFilterChange={setSourceFilter}
                        dateFilter={dateFilter}
                        onDateFilterChange={setDateFilter}
                        categoryFilter={categoryFilter}
                        onCategoryFilterChange={setCategoryFilter}
                        categories={categories}
                        totalCount={transactions.length}
                        filteredCount={filtered.length}
                        onExportCSV={() => exportToCSV(filtered, currency)}
                        financialYears={financialYears}
                        selectedFYId={fyId}
                        onFYChange={handleFYChange}
                    />
                </div>

                <TransactionTable
                    transactions={filtered}
                    currency={currency}
                    slug={slug}
                />
            </div>
        </div>
    );
}
