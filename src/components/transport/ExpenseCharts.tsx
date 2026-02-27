"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
    FUEL: '#3b82f6', // blue
    MAINTENANCE: '#8b5cf6', // purple
    REPAIR: '#f97316', // orange
    INSURANCE: '#22c55e', // green
    OTHER: '#64748b' // slate
};

export default function ExpenseCharts({ expenses }: { expenses: any[] }) {
    const categoryData = useMemo(() => {
        const totals: Record<string, number> = {};
        expenses.forEach(e => {
            if (e.status !== "APPROVED") return;
            const cat = e.category || "OTHER";
            totals[cat] = (totals[cat] || 0) + e.amount;
        });
        return Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const monthlyData = useMemo(() => {
        const months: Record<string, number> = {};
        expenses.forEach(e => {
            if (e.status !== "APPROVED") return;
            const date = new Date(e.date);
            const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            months[monthKey] = (months[monthKey] || 0) + e.amount;
        });
        // Assuming sorting chronologically might be complex without original dates, 
        // but typical JS object insertion order helps if dates are sequential.
        // Better way is passing sorted data. We will just map it.
        return Object.entries(months).map(([month, amount]) => ({ month, amount }));
    }, [expenses]);

    if (!expenses || expenses.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-8">
            <Card className="border-none shadow-xl shadow-zinc-200/50 dark:bg-zinc-950 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg">Spend by Category</CardTitle>
                    <CardDescription>Approved expenditures breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.OTHER} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
                            />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-zinc-200/50 dark:bg-zinc-950 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg">Monthly Expenses</CardTitle>
                    <CardDescription>Historical fleet spends</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <RechartsTooltip
                                cursor={{ fill: '#f3f4f6' }}
                                formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
                            />
                            <Bar dataKey="amount" fill="#18181b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
