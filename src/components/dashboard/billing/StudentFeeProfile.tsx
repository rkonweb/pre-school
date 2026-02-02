"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeeItem {
    id: string;
    description: string;
    amount: number;
}

export function StudentFeeProfile() {
    const [oneOffCharges, setOneOffCharges] = useState<FeeItem[]>([
        { id: "1", description: "Zoo Field Trip", amount: 45 },
        { id: "2", description: "Late Pickup Fee (Oct)", amount: 20 },
    ]);

    const [discounts, setDiscounts] = useState<FeeItem[]>([
        { id: "1", description: "Sibling Discount", amount: 100 },
    ]);

    const totalOneOff = oneOffCharges.reduce((acc, item) => acc + item.amount, 0);
    const totalDiscount = discounts.reduce((acc, item) => acc + item.amount, 0);

    return (
        <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/20">
                    <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Balance Due</h4>
                    <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-zinc-50">$1,365.00</p>
                    <button className="mt-4 text-xs font-semibold text-blue-600 underline dark:text-blue-400">View Full Ledger</button>
                </div>
                <div className="rounded-2xl border border-green-100 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-900/20">
                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Next Payment Due</h4>
                    <p className="mt-2 text-3xl font-bold text-green-900 dark:text-zinc-50">$400.00</p>
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">Due on Feb 01, 2026</p>
                </div>
            </div>

            {/* One-off Charges */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Manual / One-off Charges</h3>
                    <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                        <Plus className="h-4 w-4" />
                        Add Charge
                    </button>
                </div>

                <div className="space-y-4">
                    {oneOffCharges.map((charge) => (
                        <div key={charge.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                    <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{charge.description}</p>
                                    <p className="text-xs text-zinc-500">Jan 24, 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold">${charge.amount}</span>
                                <button className="text-zinc-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {oneOffCharges.length === 0 && (
                        <p className="text-center text-sm text-zinc-500 py-4">No one-off charges found.</p>
                    )}
                </div>
            </div>

            {/* Manual Discounts */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Active Discounts</h3>
                    <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                        <Plus className="h-4 w-4" />
                        Add Discount
                    </button>
                </div>

                <div className="space-y-4">
                    {discounts.map((discount) => (
                        <div key={discount.id} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-green-200 bg-green-50/30 dark:border-green-900/30 dark:bg-green-900/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm font-medium">{discount.description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-green-600">-${discount.amount}</span>
                                <button className="text-zinc-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
