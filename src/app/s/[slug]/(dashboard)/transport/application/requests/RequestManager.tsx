'use client';

import { useState } from "react";
import { Check, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { approveTransportRequestAction, rejectTransportRequestAction } from "@/app/actions/transport-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import { ErpCard, Btn, StatusChip } from "@/components/ui/erp-ui";

export default function RequestManager({ requests, routes, slug }: any) {
    const { confirm: confirmDialog } = useConfirm();
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [assignment, setAssignment] = useState({ routeId: "", stopId: "", startDate: "" });

    const handleApprove = async (studentId: string) => {
        if (!assignment.routeId || !assignment.stopId || !assignment.startDate) {
            toast.error("Please select a route, stop and start date");
            return;
        }

        const res = await approveTransportRequestAction(slug, studentId, assignment);
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

        const res = await rejectTransportRequestAction(slug, studentId);
        if (res.success) {
            toast.success("Request rejected");
        } else {
            toast.error(res.error);
        }
    };

    const selectedRoute = routes.find((r: any) => r.id === assignment.routeId);

    return (
        <div className="grid gap-6">
            {requests.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center bg-white rounded-[40px] border-2 border-dashed border-zinc-200">
                    <Check className="h-12 w-12 text-zinc-200 mb-4" />
                    <h3 className="text-xl font-black text-zinc-900 uppercase">All Requests Processed</h3>
                    <p className="text-sm font-bold text-zinc-400 uppercase mt-2">Check back later for new transport applications.</p>
                </div>
            )}

            {requests.map((req: any) => (
                <ErpCard key={req.id} hover className="border-zinc-100">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-900 text-lg uppercase shadow-sm border border-zinc-200/50">
                                {req.student.firstName?.[0]}{req.student.lastName?.[0]}
                            </div>
                            <div>
                                <h3 className="font-black text-zinc-900 uppercase tracking-tight text-lg leading-tight flex items-center gap-3">
                                    {req.student.firstName} {req.student.lastName}
                                    <StatusChip label="Pending" />
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Grade: {req.student.grade || 'N/A'}</p>

                                <div className="mt-4 flex items-start gap-3 text-sm bg-zinc-50/50 p-4 rounded-[20px] border border-zinc-100">
                                    <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.1em]">Requested Location</span>
                                        <p className="text-zinc-700 font-bold mt-1">{req.applicationAddress || "No address provided"}</p>
                                        <div className="text-[10px] font-bold text-zinc-400 mt-2 flex items-center gap-2">
                                            <span className="bg-zinc-200/50 px-1.5 py-0.5 rounded">LAT: {req.applicationLat?.toFixed(4)}</span>
                                            <span className="bg-zinc-200/50 px-1.5 py-0.5 rounded">LNG: {req.applicationLng?.toFixed(4)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!selectedRequest && (
                            <Btn
                                onClick={() => setSelectedRequest(req.studentId)}
                                variant="primary"
                                size="sm"
                                icon={MapPin}
                            >
                                Assign Route
                            </Btn>
                        )}
                    </div>

                    {selectedRequest === req.studentId && (
                        <div className="mt-8 pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4">
                            <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">Dispatch Assignment</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Route</label>
                                    <select
                                        aria-label="Select Route"
                                        className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand"
                                        value={assignment.routeId}
                                        onChange={e => setAssignment({ ...assignment, routeId: e.target.value, stopId: "" })}
                                    >
                                        <option value="">-- Choose Route --</option>
                                        {routes.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Stop</label>
                                    <select
                                        aria-label="Select Stop"
                                        className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
                                        value={assignment.stopId}
                                        onChange={e => setAssignment({ ...assignment, stopId: e.target.value })}
                                        disabled={!assignment.routeId}
                                    >
                                        <option value="">-- Choose Stop --</option>
                                        {selectedRoute?.stops.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.pickupTime}) - ₹{s.monthlyFee}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        aria-label="Start Date"
                                        type="date"
                                        className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand"
                                        value={assignment.startDate}
                                        onChange={e => setAssignment({ ...assignment, startDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end items-center gap-3">
                                <Btn variant="ghost" onClick={() => setSelectedRequest(null)}>Cancel</Btn>
                                <Btn variant="danger" icon={X} onClick={() => handleReject(req.studentId)}>Reject</Btn>
                                <Btn variant="success" icon={Check} onClick={() => handleApprove(req.studentId)}>Approve & Generate</Btn>
                            </div>
                        </div>
                    )}
                </ErpCard>
            ))}
        </div>
    );
}
