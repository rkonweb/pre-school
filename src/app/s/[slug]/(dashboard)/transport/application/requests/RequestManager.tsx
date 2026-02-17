'use client';

import { useState } from "react";
import { Check, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { approveTransportRequestAction, rejectTransportRequestAction } from "@/app/actions/transport-actions";
import { useConfirm } from "@/contexts/ConfirmContext";

export default function RequestManager({ requests, routes }: any) {
    const { confirm: confirmDialog } = useConfirm();
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [assignment, setAssignment] = useState({ routeId: "", stopId: "", startDate: "" });

    const handleApprove = async (studentId: string) => {
        if (!assignment.routeId || !assignment.stopId || !assignment.startDate) {
            toast.error("Please select a route, stop and start date");
            return;
        }

        const res = await approveTransportRequestAction(studentId, assignment);
        if (res.success) {
            toast.success("Request approved and fee generated");
            setSelectedRequest(null);
            // Revalidate/Refresh logic needed here
        } else {
            toast.error(res.error || "Failed to approve");
        }
    };

    const handleReject = async (studentId: string) => {
        const confirmed = await confirmDialog({
            title: "Reject Request",
            message: "Reject this transport request?",
            variant: "warning",
            confirmText: "Reject",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await rejectTransportRequestAction(studentId);
        if (res.success) {
            toast.success("Request rejected");
        } else {
            toast.error(res.error);
        }
    };

    const selectedRoute = routes.find((r: any) => r.id === assignment.routeId);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Transport Applications</h2>

            <div className="grid gap-4">
                {requests.length === 0 && <p className="text-zinc-500">No pending requests.</p>}

                {requests.map((req: any) => (
                    <div key={req.id} className="border p-4 rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold flex items-center gap-2">
                                    {req.student.firstName} {req.student.lastName}
                                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">{req.status}</span>
                                </h3>
                                <p className="text-sm text-zinc-500">Grade: {req.student.grade}</p>

                                <div className="mt-3 flex items-start gap-2 text-sm bg-zinc-50 p-2 rounded border border-zinc-100">
                                    <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-semibold text-zinc-700">Requested Location:</span>
                                        <p className="text-zinc-600">{req.applicationAddress || "No address provided"}</p>
                                        <div className="text-xs text-zinc-400 mt-1">Coordinates: {req.applicationLat?.toFixed(4)}, {req.applicationLng?.toFixed(4)}</div>
                                    </div>
                                </div>
                            </div>

                            {!selectedRequest && (
                                <button
                                    onClick={() => setSelectedRequest(req.studentId)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                    Assign Route
                                </button>
                            )}
                        </div>

                        {selectedRequest === req.studentId && (
                            <div className="mt-4 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2">
                                <h4 className="font-semibold text-sm mb-3">Assign Route & Stop</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <label className="text-xs font-medium text-zinc-500">Select Route</label>
                                        <select
                                            className="w-full border p-2 rounded text-sm"
                                            value={assignment.routeId}
                                            onChange={e => setAssignment({ ...assignment, routeId: e.target.value, stopId: "" })}
                                        >
                                            <option value="">-- Choose Route --</option>
                                            {routes.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-zinc-500">Select Stop</label>
                                        <select
                                            className="w-full border p-2 rounded text-sm"
                                            value={assignment.stopId}
                                            onChange={e => setAssignment({ ...assignment, stopId: e.target.value })}
                                            disabled={!assignment.routeId}
                                        >
                                            <option value="">-- Choose Stop --</option>
                                            {selectedRoute?.stops.map((s: any) => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.pickupTime}) - ${s.monthlyFee}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-zinc-500">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full border p-2 rounded text-sm"
                                            value={assignment.startDate}
                                            onChange={e => setAssignment({ ...assignment, startDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setSelectedRequest(null)} className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded text-sm">Cancel</button>
                                    <button onClick={() => handleReject(req.studentId)} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm flex items-center gap-1"><X className="h-3 w-3" /> Reject</button>
                                    <button onClick={() => handleApprove(req.studentId)} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm flex items-center gap-1 hover:bg-green-700 shadow-sm"><Check className="h-3 w-3" /> Approve & Generate Fee</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
