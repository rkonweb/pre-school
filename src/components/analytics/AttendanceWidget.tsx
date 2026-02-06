"use client";

import { AttendanceStats } from "@/app/actions/student-analytics-actions";
import { Calendar, CheckCircle, XCircle, Clock, Heart, Coffee } from "lucide-react";

interface AttendanceWidgetProps {
    data: AttendanceStats;
}

export function AttendanceWidget({ data }: AttendanceWidgetProps) {
    const getPercentageColor = (percentage: number) => {
        if (percentage >= 95) return "text-green-600";
        if (percentage >= 85) return "text-blue-600";
        if (percentage >= 75) return "text-yellow-600";
        return "text-red-600";
    };

    const getPercentageRing = (percentage: number) => {
        if (percentage >= 95) return "stroke-green-600";
        if (percentage >= 85) return "stroke-blue-600";
        if (percentage >= 75) return "stroke-yellow-600";
        return "stroke-red-600";
    };

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (data.percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Attendance Overview</h3>
            </div>

            <div className="flex items-center justify-between mb-6">
                {/* Circular Progress */}
                <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="45"
                            className={getPercentageRing(data.percentage)}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getPercentageColor(data.percentage)}`}>
                            {data.percentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">Attendance</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 grid grid-cols-2 gap-3 ml-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-xs text-gray-500">Present</p>
                            <p className="text-lg font-semibold">{data.present}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div>
                            <p className="text-xs text-gray-500">Absent</p>
                            <p className="text-lg font-semibold">{data.absent}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                            <p className="text-xs text-gray-500">Late</p>
                            <p className="text-lg font-semibold">{data.late}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-600" />
                        <div>
                            <p className="text-xs text-gray-500">Sick</p>
                            <p className="text-lg font-semibold">{data.sick}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Days */}
            <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                    Total Days: <span className="font-semibold">{data.totalDays}</span>
                </p>
            </div>
        </div>
    );
}
