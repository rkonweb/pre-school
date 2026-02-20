import React, { useMemo, useState, useEffect } from "react";
import { MapPin, Navigation, Bus, AlertTriangle, Loader2, Activity } from "lucide-react";
import { GoogleMap, useLoadScript, MarkerF, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES, DEFAULT_MAP_STYLES } from "@/lib/maps-config";

interface LiveTransportMapProps {
    center: { lat: number; lng: number };
    stops: any[];
    liveLocation: { lat: number; lng: number } | null;
    apiKey: string;
}

export const LiveTransportMap: React.FC<LiveTransportMapProps> = ({
    center,
    stops,
    liveLocation,
    apiKey
}) => {
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const stopPositions = useMemo(() => stops
        .map(s => ({
            lat: typeof s.latitude === 'string' ? parseFloat(s.latitude) : s.latitude,
            lng: typeof s.longitude === 'string' ? parseFloat(s.longitude) : s.longitude,
            sequenceOrder: typeof s.sequenceOrder === 'string' ? parseInt(s.sequenceOrder) : (s.sequenceOrder || 0)
        }))
        .filter(s => !isNaN(s.lat) && !isNaN(s.lng))
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        , [stops]);

    // Calculate directions
    useEffect(() => {
        if (!isLoaded || stopPositions.length < 2) {
            setDirections(null);
            return;
        }

        const directionsService = new google.maps.DirectionsService();

        directionsService.route({
            origin: stopPositions[0],
            destination: stopPositions[stopPositions.length - 1],
            waypoints: stopPositions.slice(1, -1).map(stop => ({
                location: stop,
                stopover: true
            })),
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
            }
        });
    }, [isLoaded, stopPositions]);

    if (loadError) return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-zinc-50 rounded-[32px] border border-rose-100 shadow-inner overflow-hidden">
            <Activity className="h-10 w-10 text-rose-500 animate-pulse" />
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 underline">ApiProjectMapError</p>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Maps Protocol Interrupted</h3>
                <p className="text-[10px] text-zinc-400 font-medium max-w-[220px] mx-auto">
                    The service "Maps JavaScript API" is disabled in your cloud project.
                </p>
            </div>

            <div className="w-full bg-white rounded-2xl p-4 text-left border border-zinc-100 space-y-2 shadow-sm">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 pb-1">RECOVERY PROTOCOL</p>
                <div className="space-y-1.5 text-[10px] font-bold text-zinc-600">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] text-zinc-400">1</div>
                        <p>Go to <span className="underline">console.cloud.google.com</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] text-zinc-400">2</div>
                        <p>Enable <span className="text-brand">"Maps JavaScript API"</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] text-zinc-400">3</div>
                        <p>Enable <span className="text-brand">"Directions API"</span></p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Linking with Fleet...</p>
        </div>
    );

    return (
        <div className="w-full h-full relative">
            <GoogleMap
                mapContainerClassName="w-full h-full"
                center={liveLocation || center}
                zoom={14}
                options={{
                    disableDefaultUI: true,
                    styles: DEFAULT_MAP_STYLES
                }}
            >
                {/* Route Path snapped to road */}
                {directions && (
                    <DirectionsRenderer
                        options={{
                            directions: directions,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: "#2D9CB8",
                                strokeOpacity: 0.6,
                                strokeWeight: 4,
                            }
                        }}
                    />
                )}

                {/* Bus Stops */}
                {stopPositions.map((pos, i) => (
                    <MarkerF
                        key={i}
                        position={pos}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: "#FFF",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#0C3449",
                            scale: 5,
                        }}
                    />
                ))}

                {/* Live Bus Marker */}
                {liveLocation && (
                    <MarkerF
                        position={liveLocation}
                        icon={{
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 7,
                            fillColor: "#FF8800",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#FFF",
                            rotation: 90 // Simulated direction
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
};
