"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { cn } from "@/lib/utils";

interface AdmissionSourceChartProps {
    data: {
        id: string;
        label: string;
        value: number;
        fill: string;
    }[];
}

export function AdmissionSourceChart({ data }: AdmissionSourceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-sm font-medium gap-2">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-zinc-200" />
                No source data available
            </div>
        );
    }

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="w-full h-[350px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                const percentage = ((d.value / total) * 100).toFixed(1);
                                return (
                                    <div className="bg-zinc-900 text-white text-[10px] rounded-xl py-3 px-4 shadow-2xl border border-white/10 backdrop-blur-md">
                                        <p className="font-black uppercase tracking-widest mb-1 opacity-60">{d.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-black">{d.value}</span>
                                            <span className="text-brand font-bold">({percentage}%)</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity outline-none" />
                        ))}
                    </Pie>
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        content={({ payload }) => (
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
                                {payload?.map((entry: any, index: number) => (
                                    <div key={`legend-${index}`} className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            {entry.value}
                                        </span>
                                        <span className="text-[10px] font-bold text-zinc-400">
                                            {data[index].value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Total</p>
                <p className="text-4xl font-black text-zinc-900 leading-none">{total}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Leads</p>
            </div>
        </div>
    );
}
