"use client";

import { SubjectPerformance } from "@/app/actions/student-analytics-actions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AcademicChartsProps {
    subjects: SubjectPerformance[];
    overallPercentage: number;
    overallGrade: string;
    trend: 'improving' | 'declining' | 'stable';
}

export function AcademicCharts({ subjects, overallPercentage, overallGrade, trend }: AcademicChartsProps) {
    const trendColors = {
        improving: "text-green-600",
        declining: "text-red-600",
        stable: "text-blue-600"
    };

    const trendIcons = {
        improving: "↗",
        declining: "↘",
        stable: "→"
    };

    return (
        <div className="space-y-6">
            {/* Overall Performance Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Overall Academic Performance</h3>
                <div className="flex items-end gap-6">
                    <div>
                        <p className="text-5xl font-bold">{overallPercentage.toFixed(1)}%</p>
                        <p className="text-blue-100 mt-1">Average Score</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold">{overallGrade}</p>
                        <p className="text-blue-100 mt-1">Grade</p>
                    </div>
                    <div className="ml-auto">
                        <p className={`text-2xl font-bold ${trendColors[trend]}`}>
                            {trendIcons[trend]} {trend.charAt(0).toUpperCase() + trend.slice(1)}
                        </p>
                        <p className="text-blue-100 mt-1 text-right">Trend</p>
                    </div>
                </div>
            </div>

            {/* Subject Performance Chart */}
            {subjects.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjects}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="subject"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                label={{ value: 'Percentage', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                            />
                            <Tooltip
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Bar
                                dataKey="percentage"
                                fill="#3b82f6"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Subject Details Table */}
            {subjects.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Percentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.map((subject, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {subject.subject}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {subject.marks} / {subject.maxMarks}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {subject.percentage.toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {subject.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${subject.status === 'PASSED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {subject.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
