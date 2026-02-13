"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
    { name: "Hot (86-100)", value: 15, color: "#ef4444" },
    { name: "Warm (61-85)", value: 35, color: "#f97316" },
    { name: "Cool (31-60)", value: 30, color: "#3b82f6" },
    { name: "Cold (0-30)", value: 20, color: "#9ca3af" },
];

export function AIInsightsChart({ distribution }: { distribution?: any[] }) {
    const chartData = distribution?.map(d => ({
        name: d.label,
        value: d.count,
        color: d.color.startsWith('bg-') ?
            (d.color === "bg-red-500" ? "#ef4444" :
                d.color === "bg-orange-500" ? "#f97316" :
                    d.color === "bg-blue-500" ? "#3b82f6" : "#9ca3af") : d.color
    })) || data;
    return (
        <div className="h-[300px] w-full bg-white rounded-[32px] border border-zinc-200 p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Lead Score Distribution</h3>
                <p className="text-xs font-bold text-zinc-400">Current spread of lead quality.</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        itemStyle={{ fontSize: "12px", fontWeight: "bold", color: "#374151" }}
                    />
                    <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        formatter={(value, entry: any) => <span className="text-xs font-bold text-zinc-600 ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
