"use client";

import { useEffect, useState } from "react";
import { getVehicleTelemetryAction } from "@/app/actions/tracking-actions";
import { X, Loader2, Navigation, Activity, Clock, MapPin } from "lucide-react";
import { GoogleMap, useLoadScript, MarkerF, PolylineF } from "@react-google-maps/api";

interface VehicleTrackingModalProps {
    vehicleId: string;
    onClose: () => void;
}

const libraries: ("places")[] = ["places"];

const mapStyles = [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }]
    }
];

export default function VehicleTrackingModal({ vehicleId, onClose }: VehicleTrackingModalProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    useEffect(() => {
        const fetchData = async () => {
            const res = await getVehicleTelemetryAction(vehicleId);
            if (res.success && res.data) {
                setData(res.data);
            }
            setLoading(false);
        };

        fetchData();
    }, [vehicleId]);

    if (loading || !isLoaded) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                    <p className="mt-4 text-zinc-600">Loading map...</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-12 max-w-md">
                    <p className="text-red-600 font-bold">Map Load Error</p>
                    <p className="text-zinc-600 mt-2">Unable to load Google Maps. Please check your API key.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!data || !data.telemetry || data.telemetry.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-12 max-w-md">
                    <p className="text-zinc-600 font-medium">No telemetry data available for this vehicle.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const latestTelemetry = data.telemetry[0];
    const currentLocation = {
        lat: latestTelemetry.latitude,
        lng: latestTelemetry.longitude
    };

    // Route path (if available)
    const routePath = data.route?.stops.map((stop: any) => ({
        lat: parseFloat(stop.latitude),
        lng: parseFloat(stop.longitude)
    })) || [];

    // Trail path (last 10 locations)
    const trailPath = data.telemetry.map((t: any) => ({
        lat: t.latitude,
        lng: t.longitude
    }));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-200">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">
                            {data.vehicle.registrationNumber}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {data.route?.name || "No route assigned"} • {data.route?.driver?.name || "No driver"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6 text-zinc-600" />
                    </button>
                </div>

                {/* Map */}
                <div className="flex-1 relative">
                    <GoogleMap
                        mapContainerClassName="w-full h-full"
                        center={currentLocation}
                        zoom={14}
                        options={{
                            disableDefaultUI: true,
                            styles: mapStyles,
                            zoomControl: true
                        }}
                    >
                        {/* Route Path */}
                        {routePath.length > 0 && (
                            <PolylineF
                                path={routePath}
                                options={{
                                    strokeColor: "#2D9CB8",
                                    strokeOpacity: 0.6,
                                    strokeWeight: 4,
                                }}
                            />
                        )}

                        {/* Trail Path */}
                        {trailPath.length > 1 && (
                            <PolylineF
                                path={trailPath}
                                options={{
                                    strokeColor: "#FF8800",
                                    strokeOpacity: 0.4,
                                    strokeWeight: 3,
                                    geodesic: true
                                }}
                            />
                        )}

                        {/* Route Stops */}
                        {data.route?.stops.map((stop: any, i: number) => (
                            <MarkerF
                                key={stop.id}
                                position={{
                                    lat: parseFloat(stop.latitude),
                                    lng: parseFloat(stop.longitude)
                                }}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,
                                    fillColor: "#FFF",
                                    fillOpacity: 1,
                                    strokeWeight: 2,
                                    strokeColor: "#0C3449",
                                    scale: 6,
                                }}
                                label={{
                                    text: (i + 1).toString(),
                                    color: "#0C3449",
                                    fontSize: "10px",
                                    fontWeight: "bold"
                                }}
                            />
                        ))}

                        {/* Current Vehicle Position */}
                        <MarkerF
                            position={currentLocation}
                            icon={{
                                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                scale: 8,
                                fillColor: "#FF8800",
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: "#FFF",
                                rotation: latestTelemetry.heading || 0
                            }}
                        />
                    </GoogleMap>
                </div>

                {/* Info Footer */}
                <div className="p-6 border-t border-zinc-200 bg-zinc-50">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-zinc-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="h-4 w-4 text-blue-500" />
                                <p className="text-xs font-medium text-zinc-500">Speed</p>
                            </div>
                            <p className="text-2xl font-bold text-zinc-900">
                                {latestTelemetry.speed ? `${Math.round(latestTelemetry.speed)} km/h` : "-"}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Navigation className="h-4 w-4 text-green-500" />
                                <p className="text-xs font-medium text-zinc-500">Status</p>
                            </div>
                            <p className="text-2xl font-bold text-zinc-900 capitalize">
                                {latestTelemetry.status.toLowerCase()}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <p className="text-xs font-medium text-zinc-500">Delay</p>
                            </div>
                            <p className="text-2xl font-bold text-zinc-900">
                                {latestTelemetry.delayMinutes > 0 ? `+${latestTelemetry.delayMinutes} min` : "On-Time"}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-purple-500" />
                                <p className="text-xs font-medium text-zinc-500">Last Update</p>
                            </div>
                            <p className="text-lg font-bold text-zinc-900">
                                {new Date(latestTelemetry.recordedAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
