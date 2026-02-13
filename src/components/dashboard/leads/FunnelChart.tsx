"use client";

import { ResponsiveContainer, FunnelChart as RechartsFunnelChart, Funnel, LabelList, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";

interface FunnelChartProps {
    data: {
        id: string;
        label: string;
        value: number;
        fill: string;
    }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-zinc-400 text-sm font-medium italic">
                No funnel data available
            </div>
        );
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsFunnelChart>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-zinc-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                                        <p className="font-black uppercase tracking-wide mb-1">{data.label}</p>
                                        <p className="font-medium">
                                            <span className="text-brand font-black text-lg">{data.value}</span> leads
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Funnel
                        dataKey="value"
                        data={data}
                        isAnimationActive
                    >
                        <LabelList position="right" fill="#000" stroke="none" dataKey="label" className="text-xs font-black uppercase tracking-widest text-zinc-500" />
                        <LabelList position="center" fill="#fff" stroke="none" dataKey="value" className="text-sm font-black" />
                    </Funnel>
                </RechartsFunnelChart>
            </ResponsiveContainer>
        </div>
    );
}
