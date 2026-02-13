"use client";

import { Flame, Clock, Calendar, CheckCircle2, TrendingUp } from "lucide-react";

export function AI_KPI_Tiles({ data }: { data?: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI_Tile
                icon={Flame}
                label="HOT Leads"
                value={data?.hotLeads?.value || "0"}
                subtext={data?.hotLeads?.subtext || "---"}
                color="text-red-600 bg-red-100"
            />
            <KPI_Tile
                icon={Clock}
                label="Idle > 24h"
                value={data?.idleHot?.value || "0"}
                subtext={data?.idleHot?.subtext || "---"}
                color="text-orange-600 bg-orange-100"
            />
            <KPI_Tile
                icon={Calendar}
                label="Tours Today"
                value={data?.toursToday?.value || "0"}
                subtext={data?.toursToday?.subtext || "---"}
                color="text-blue-600 bg-blue-100"
            />
            <KPI_Tile
                icon={TrendingUp}
                label="Predicted Admits"
                value={data?.predictedAdmits?.value || "0"}
                subtext={data?.predictedAdmits?.subtext || "---"}
                color="text-green-600 bg-green-100"
            />
        </div>
    );
}

function KPI_Tile({ icon: Icon, label, value, subtext, color }: any) {
    return (
        <div className="p-4 rounded-3xl bg-white border border-zinc-100 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-zinc-900">{value}</h3>
                    <span className="text-[10px] font-bold text-zinc-400">{subtext}</span>
                </div>
            </div>
        </div>
    );
}
