"use client";

import { SubjectPerformance } from "@/app/actions/student-analytics-actions";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

interface SubjectRadarChartProps {
    subjects: SubjectPerformance[];
}

export function SubjectRadarChart({ subjects }: SubjectRadarChartProps) {
    if (subjects.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                No subject data available
            </div>
        );
    }

    const data = subjects.map(subject => ({
        subject: subject.subject,
        percentage: subject.percentage
    }));

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Subject Performance Balance</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Radar
                        name="Performance"
                        dataKey="percentage"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Performance']}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
