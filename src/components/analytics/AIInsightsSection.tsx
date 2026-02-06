"use client";

import { AIInsight } from "@/app/actions/student-analytics-actions";
import { AlertCircle, Award, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface AIInsightsProps {
    insights: AIInsight[];
}

const iconMap = {
    strength: CheckCircle,
    weakness: AlertCircle,
    improvement: TrendingUp,
    concern: AlertTriangle,
    achievement: Award
};

const colorMap = {
    strength: "bg-green-50 border-green-200 text-green-800",
    weakness: "bg-yellow-50 border-yellow-200 text-yellow-800",
    improvement: "bg-blue-50 border-blue-200 text-blue-800",
    concern: "bg-red-50 border-red-200 text-red-800",
    achievement: "bg-purple-50 border-purple-200 text-purple-800"
};

const iconColorMap = {
    strength: "text-green-600",
    weakness: "text-yellow-600",
    improvement: "text-blue-600",
    concern: "text-red-600",
    achievement: "text-purple-600"
};

export function AIInsightsSection({ insights }: AIInsightsProps) {
    if (insights.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                No insights available yet. More data needed for analysis.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => {
                    const Icon = iconMap[insight.type];
                    const colorClass = colorMap[insight.type];
                    const iconColor = iconColorMap[insight.type];

                    return (
                        <div
                            key={index}
                            className={`border-2 rounded-lg p-4 ${colorClass} transition-all hover:shadow-md`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${iconColor}`} />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">
                                        {insight.title}
                                    </h3>
                                    <p className="text-sm opacity-90">
                                        {insight.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        <span className="px-2 py-1 bg-white/50 rounded">
                                            {insight.category}
                                        </span>
                                        {insight.severity === 'high' && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                                High Priority
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
