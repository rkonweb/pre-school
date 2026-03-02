'use client';

import { useState, useRef } from "react";
import { Search, Filter, Download, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SourceFilter = 'ALL' | 'CREDIT' | 'DEBIT' | 'TRANSPORT' | 'MANUAL' | 'FEE' | 'PAYROLL';
export type DateFilter = 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_FY';

interface TransactionFiltersProps {
    searchQuery: string;
    onSearchChange: (v: string) => void;
    sourceFilter: SourceFilter;
    onSourceFilterChange: (v: SourceFilter) => void;
    dateFilter: DateFilter;
    onDateFilterChange: (v: DateFilter) => void;
    categoryFilter: string;
    onCategoryFilterChange: (v: string) => void;
    categories: { id: string; name: string; type: string }[];
    totalCount: number;
    filteredCount: number;
    onExportCSV: () => void;
    financialYears: { id: string; name: string; isActive: boolean }[];
    selectedFYId: string;
    onFYChange: (id: string) => void;
}

const SOURCE_TABS: { id: SourceFilter; label: string; emoji: string }[] = [
    { id: 'ALL', label: 'All', emoji: '📋' },
    { id: 'CREDIT', label: 'Income', emoji: '↑' },
    { id: 'DEBIT', label: 'Expense', emoji: '↓' },
    { id: 'TRANSPORT', label: 'Transport', emoji: '🚌' },
    { id: 'FEE', label: 'Fees', emoji: '💳' },
    { id: 'PAYROLL', label: 'Payroll', emoji: '👤' },
    { id: 'MANUAL', label: 'Manual', emoji: '⚡' },
];

const DATE_OPTIONS: { id: DateFilter; label: string }[] = [
    { id: 'ALL', label: 'All Time' },
    { id: 'TODAY', label: 'Today' },
    { id: 'THIS_WEEK', label: 'This Week' },
    { id: 'THIS_MONTH', label: 'This Month' },
    { id: 'THIS_QUARTER', label: 'This Quarter' },
    { id: 'THIS_FY', label: 'This FY' },
];

export default function TransactionFilters({
    searchQuery, onSearchChange,
    sourceFilter, onSourceFilterChange,
    dateFilter, onDateFilterChange,
    categoryFilter, onCategoryFilterChange,
    categories, totalCount, filteredCount,
    onExportCSV,
    financialYears, selectedFYId, onFYChange
}: TransactionFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="space-y-4">
            {/* Source Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {SOURCE_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onSourceFilterChange(tab.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                            sourceFilter === tab.id
                                ? "bg-zinc-900 text-white shadow-lg"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        )}
                    >
                        <span>{tab.emoji}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Search + Controls row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search description, reference, vendor..."
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all placeholder:text-zinc-400"
                    />
                    {searchQuery && (
                        <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-lg">
                            <X className="h-3.5 w-3.5 text-zinc-400" />
                        </button>
                    )}
                </div>

                {/* Financial Year */}
                <div className="relative">
                    <select
                        value={selectedFYId}
                        onChange={e => onFYChange(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                        title="Financial Year"
                    >
                        <option value="">All Years</option>
                        {financialYears.map(fy => (
                            <option key={fy.id} value={fy.id}>{fy.name}{fy.isActive ? ' ★' : ''}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* Date filter */}
                <div className="relative">
                    <select
                        value={dateFilter}
                        onChange={e => onDateFilterChange(e.target.value as DateFilter)}
                        className="appearance-none pl-3 pr-8 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                        title="Date Range"
                    >
                        {DATE_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* Category filter */}
                <div className="relative">
                    <select
                        value={categoryFilter}
                        onChange={e => onCategoryFilterChange(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
                        title="Category"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* Export */}
                <button
                    onClick={onExportCSV}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:border-zinc-400 transition-all whitespace-nowrap"
                    title="Export to CSV"
                >
                    <Download className="h-4 w-4" />
                    Export
                </button>
            </div>

            {/* Result count */}
            <p className="text-xs font-bold text-zinc-400">
                Showing <span className="text-zinc-700">{filteredCount}</span> of <span className="text-zinc-700">{totalCount}</span> transactions
            </p>
        </div>
    );
}
