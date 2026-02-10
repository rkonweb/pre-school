'use client';

import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Navigation } from "lucide-react";
import { applyForTransportAction } from "@/app/actions/transport-actions";

export default function TransportApplication({ studentId, existingProfile }: any) {
    const [address, setAddress] = useState(existingProfile?.applicationAddress || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // In a real app, use Google Maps API to get lat/lng
    const [lat, setLat] = useState(existingProfile?.applicationLat || 0);
    const [lng, setLng] = useState(existingProfile?.applicationLng || 0);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate geocoding for now
        const mockLat = 28.6139;
        const mockLng = 77.2090;

        const res = await applyForTransportAction(studentId, {
            address,
            lat: mockLat,
            lng: mockLng
        });

        if (res.success) {
            toast.success("Application submitted successfully");
            // Refresh
        } else {
            toast.error(res.error || "Failed to submit application");
        }
        setIsSubmitting(false);
    };

    if (existingProfile && existingProfile.status === "APPROVED") {
        return (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <h3 className="text-green-800 font-bold text-lg mb-2">Transport Approved</h3>
                <p className="text-green-700">Your transport application has been approved. You can view your route details in the dashboard.</p>
                <div className="mt-4">
                    <span className="font-semibold">Assigned Route:</span> {existingProfile.route?.name} <br />
                    <span className="font-semibold">Pickup:</span> {existingProfile.pickupStop?.name} ({existingProfile.pickupStop?.pickupTime})
                </div>
            </div>
        );
    }

    if (existingProfile && existingProfile.status === "PENDING") {
        return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <h3 className="text-yellow-800 font-bold text-lg mb-2">Application Pending</h3>
                <p className="text-yellow-700">Your application is currently under review by the transport department.</p>
                <div className="mt-4 text-sm text-yellow-600 bg-yellow-100 p-2 rounded inline-block">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {existingProfile.applicationAddress}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl border shadow-sm">
            <div className="text-center mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                    <BusIcon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Apply for Transport</h2>
                <p className="text-sm text-zinc-500">Enter your pickup location to request school bus service.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-zinc-700 mb-1 block">Pickup Address</label>
                    <textarea
                        className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                        placeholder="Enter your full address..."
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-700">
                    <Navigation className="h-5 w-5 shrink-0" />
                    <p>The transport department will review your location and assign the nearest active route and stop.</p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !address}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
            </div>
        </div>
    );
}

function BusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M8 6v6" />
            <path d="M15 6v6" />
            <path d="M2 12h19.6" />
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
            <circle cx="7" cy="18" r="2" />
            <path d="M9 18h5" />
            <circle cx="16" cy="18" r="2" />
        </svg>
    )
}
