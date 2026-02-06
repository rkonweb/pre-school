"use client";

import { HealthMetrics } from "@/app/actions/student-analytics-actions";
import { Heart, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface HealthSummaryProps {
    data: HealthMetrics;
}

export function HealthSummary({ data }: HealthSummaryProps) {
    const { latest, growthTrend, alerts } = data;

    const getBMIStatus = (bmi?: number) => {
        if (!bmi) return { text: 'Unknown', color: 'text-gray-600' };
        if (bmi < 16) return { text: 'Underweight', color: 'text-yellow-600' };
        if (bmi < 18.5) return { text: 'Normal (Low)', color: 'text-blue-600' };
        if (bmi < 25) return { text: 'Healthy', color: 'text-green-600' };
        if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600' };
        return { text: 'Obese', color: 'text-red-600' };
    };

    const bmiStatus = getBMIStatus(latest?.bmi);

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold">Health & Wellness</h3>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-red-800 mb-1">Health Alerts</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                {alerts.map((alert, index) => (
                                    <li key={index}>• {alert}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Latest Metrics */}
            {latest ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {latest.height && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-xs text-gray-600 mb-1">Height</p>
                                <p className="text-2xl font-bold text-blue-600">{latest.height}</p>
                                <p className="text-xs text-gray-500">cm</p>
                            </div>
                        )}
                        {latest.weight && (
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-xs text-gray-600 mb-1">Weight</p>
                                <p className="text-2xl font-bold text-green-600">{latest.weight}</p>
                                <p className="text-xs text-gray-500">kg</p>
                            </div>
                        )}
                        {latest.bmi && (
                            <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-xs text-gray-600 mb-1">BMI</p>
                                <p className="text-2xl font-bold text-purple-600">{latest.bmi.toFixed(1)}</p>
                                <p className={`text-xs font-medium ${bmiStatus.color}`}>{bmiStatus.text}</p>
                            </div>
                        )}
                        {latest.pulseRate && (
                            <div className="bg-red-50 rounded-lg p-4">
                                <p className="text-xs text-gray-600 mb-1">Pulse Rate</p>
                                <p className="text-2xl font-bold text-red-600">{latest.pulseRate}</p>
                                <p className="text-xs text-gray-500">bpm</p>
                            </div>
                        )}
                    </div>

                    {latest.bloodPressure && (
                        <div className="flex items-center gap-2 text-sm">
                            <Activity className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600">Blood Pressure:</span>
                            <span className="font-semibold">{latest.bloodPressure}</span>
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        Last recorded: {new Date(latest.recordedAt).toLocaleDateString()}
                    </p>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No health records available</p>
                </div>
            )}

            {/* Growth Trend Chart */}
            {growthTrend.length > 1 && (
                <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Growth Trend
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={growthTrend.reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                label={{ value: 'Weight (kg)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                            />
                            <Tooltip
                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: 12 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="height"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                name="Height (cm)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="weight"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                                name="Weight (kg)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
