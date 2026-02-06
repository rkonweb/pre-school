"use client";

import { ActivitySummary } from "@/app/actions/student-analytics-actions";
import { Trophy, Star, Calendar } from "lucide-react";

interface ActivitiesTimelineProps {
    data: ActivitySummary;
}

const categoryColors: Record<string, string> = {
    SPORTS: "bg-blue-100 text-blue-800",
    ARTS: "bg-purple-100 text-purple-800",
    CLUB: "bg-green-100 text-green-800",
    MUSIC: "bg-pink-100 text-pink-800",
    DANCE: "bg-yellow-100 text-yellow-800"
};

export function ActivitiesTimeline({ data }: ActivitiesTimelineProps) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Co-curricular Activities</h3>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Star className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{data.total}</p>
                    <p className="text-xs text-gray-600">Total Activities</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{data.awards}</p>
                    <p className="text-xs text-gray-600">Awards</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{data.participations}</p>
                    <p className="text-xs text-gray-600">Participations</p>
                </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(data.byCategory).length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">By Category</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(data.byCategory).map(([category, count]) => (
                            <span
                                key={category}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[category] || "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {category}: {count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            {data.recent.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activities</h4>
                    <div className="space-y-3">
                        {data.recent.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    {activity.type === 'AWARD' ? (
                                        <Trophy className="w-5 h-5 text-yellow-600" />
                                    ) : (
                                        <Star className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.title}
                                    </p>
                                    {activity.achievement && (
                                        <p className="text-sm text-yellow-600 font-medium">
                                            🏆 {activity.achievement}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 text-xs rounded ${categoryColors[activity.category] || "bg-gray-100 text-gray-800"
                                            }`}>
                                            {activity.category}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.total === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No activities recorded yet.</p>
                    <p className="text-sm mt-1">Encourage participation in co-curricular activities!</p>
                </div>
            )}
        </div>
    );
}
