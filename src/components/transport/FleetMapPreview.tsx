"use client";

import { useEffect, useState, useRef } from "react";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Loader2, Bus, Navigation, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface FleetMapPreviewProps {
    schoolSlug: string;
    initialVehicles: any[];
    apiKey: string;
}

import { GOOGLE_MAPS_LIBRARIES, DEFAULT_MAP_STYLES } from "@/lib/maps-config";




export default function FleetMapPreview({ schoolSlug, initialVehicles, apiKey }: FleetMapPreviewProps) {
    const [vehicles, setVehicles] = useState(initialVehicles);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    useEffect(() => {
        // Setup SSE for real-time updates
        const eventSource = new EventSource(`/api/tracking/stream?schoolSlug=${schoolSlug}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setVehicles(data);
            } catch (error) {
                console.error("SSE Parse Error:", error);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [schoolSlug]);

    const activeVehicles = vehicles.filter(v => v.telemetry);

    // Default center to a reasonable location or the first active vehicle
    const center = activeVehicles.length > 0
        ? { lat: activeVehicles[0].telemetry.latitude, lng: activeVehicles[0].telemetry.longitude }
        : { lat: 28.6139, lng: 77.2090 }; // Delhi default

    if (loadError) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-50 border border-rose-100 rounded-xl p-6 text-center space-y-3">
            <Activity className="h-10 w-10 text-rose-500" />
            <div>
                <p className="text-sm font-black text-rose-600 uppercase tracking-tighter">Maps Protocol Offline</p>
                <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        <span className="text-rose-600 underline">ApiProjectMapError</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium max-w-[220px] mx-auto">
                        The API key is active, but the service "Maps JavaScript API" is disabled in your Google Cloud Project.
                    </p>
                </div>

                <div className="mt-4 p-4 bg-white rounded-2xl border border-zinc-100 text-[9px] text-zinc-400 font-black text-left space-y-1.5 shadow-sm">
                    <p className="text-zinc-900 border-b border-zinc-50 pb-1 mb-1">RECOVERY PROTOCOL:</p>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-400">1</div>
                        <p>Go to <span className="text-zinc-600 underline">console.cloud.google.com</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-400">2</div>
                        <p>Enable <span className="text-brand">"Maps JavaScript API"</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-400">3</div>
                        <p>Enable <span className="text-brand">"Directions API"</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-400">4</div>
                        <p>Ensure Billing is attached to the project</p>
                    </div>
                </div>
            </div>
        </div>
    );
    if (!isLoaded) return <div className="h-full w-full flex items-center justify-center bg-zinc-50 rounded-xl"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>;

    return (
        <div className="h-full w-full relative group rounded-xl overflow-hidden border border-zinc-200">
            <GoogleMap
                mapContainerClassName="w-full h-full"
                center={center}
                zoom={12}
                onLoad={map => { mapRef.current = map; }}
                options={{
                    disableDefaultUI: true,
                    styles: DEFAULT_MAP_STYLES,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true
                }}
            >
                {activeVehicles.map((vehicle) => (
                    <MarkerF
                        key={vehicle.id}
                        position={{
                            lat: vehicle.telemetry.latitude,
                            lng: vehicle.telemetry.longitude
                        }}
                        onClick={() => setSelectedVehicle(vehicle)}
                        icon={{
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 6,
                            fillColor: vehicle.telemetry.delayMinutes > 0 ? "#EAB308" : "#22C55E",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#FFF",
                            rotation: vehicle.telemetry.heading || 0
                        }}
                    />
                ))}

                {selectedVehicle && (
                    <InfoWindowF
                        position={{
                            lat: selectedVehicle.telemetry.latitude,
                            lng: selectedVehicle.telemetry.longitude
                        }}
                        onCloseClick={() => setSelectedVehicle(null)}
                    >
                        <div className="p-2 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                                <Bus className="h-4 w-4 text-brand" />
                                <span className="font-bold text-zinc-900">{selectedVehicle.registrationNumber}</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <p className="text-zinc-500 flex items-center justify-between">
                                    <span>Route:</span>
                                    <span className="font-semibold text-zinc-900">{selectedVehicle.routeName || "N/A"}</span>
                                </p>
                                <p className="text-zinc-500 flex items-center justify-between">
                                    <span>Speed:</span>
                                    <span className="font-semibold text-zinc-900">{Math.round(selectedVehicle.telemetry.speed || 0)} km/h</span>
                                </p>
                                <p className="text-zinc-500 flex items-center justify-between">
                                    <span>Status:</span>
                                    <span className={cn(
                                        "font-bold uppercase tracking-tighter",
                                        selectedVehicle.telemetry.delayMinutes > 0 ? "text-yellow-600" : "text-green-600"
                                    )}>
                                        {selectedVehicle.telemetry.delayMinutes > 0 ? `Delayed (+${selectedVehicle.telemetry.delayMinutes}m)` : "On-Time"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur shadow-xl border border-zinc-200/50 rounded-lg p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-zinc-600">Live Fleet Overlay</span>
                    </div>
                </div>
            </div>

            {/* View Full Tracker Link */}
            <div className="absolute bottom-4 right-4 z-10 transition-transform group-hover:scale-105">
                <a
                    href={`/s/${schoolSlug}/transport/fleet/tracking`}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold shadow-2xl hover:bg-black transition-all"
                >
                    <Navigation className="h-3 w-3" />
                    Full Tracking Page
                </a>
            </div>
        </div>
    );
}
