"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, useLoadScript, MarkerF, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { Loader2, MapPin, AlertCircle, Activity } from "lucide-react";
import { GOOGLE_MAPS_LIBRARIES, DEFAULT_MAP_STYLES } from "@/lib/maps-config";


interface RouteMapPreviewProps {
    stops: any[];
    apiKey: string;
}




export default function RouteMapPreview({ stops, apiKey }: RouteMapPreviewProps) {
    const mapRef = useRef<google.maps.Map | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    // Valid stops with coordinates, sorted by sequenceOrder if available
    const validStops = useMemo(() => {
        return [...stops]
            .map(s => ({
                ...s,
                lat: typeof s.lat === 'string' ? parseFloat(s.lat) : s.lat,
                lng: typeof s.lng === 'string' ? parseFloat(s.lng) : s.lng,
                sequenceOrder: typeof s.sequenceOrder === 'string' ? parseInt(s.sequenceOrder) : (s.sequenceOrder || 0)
            }))
            .filter(s => s.lat !== 0 && s.lng !== 0 && !isNaN(s.lat) && !isNaN(s.lng))
            .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    }, [stops]);

    // Calculate directions
    useEffect(() => {
        if (!isLoaded || validStops.length < 2) {
            setDirections(null);
            return;
        }

        const directionsService = new google.maps.DirectionsService();

        const request: google.maps.DirectionsRequest = {
            origin: { lat: validStops[0].lat, lng: validStops[0].lng },
            destination: { lat: validStops[validStops.length - 1].lat, lng: validStops[validStops.length - 1].lng },
            waypoints: validStops.slice(1, -1).map(stop => ({
                location: { lat: stop.lat, lng: stop.lng },
                stopover: true
            })),
            travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
            } else {
                console.error(`Directions request failed: ${status}`);
            }
        });
    }, [isLoaded, validStops]);

    // Update bounds when stops change
    useEffect(() => {
        if (isLoaded && mapRef.current && validStops.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            validStops.forEach(stop => bounds.extend({ lat: stop.lat, lng: stop.lng }));

            if (validStops.length === 1) {
                mapRef.current.setCenter({ lat: validStops[0].lat, lng: validStops[0].lng });
                mapRef.current.setZoom(15);
            } else {
                mapRef.current.fitBounds(bounds);
            }
        }
    }, [isLoaded, validStops]);

    const center = validStops.length > 0
        ? { lat: validStops[0].lat, lng: validStops[0].lng }
        : { lat: 28.6139, lng: 77.2090 }; // Delhi default

    if (loadError) return (
        // ... (keep the same error UI)
        <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-50 border border-rose-100 rounded-3xl p-6 text-center space-y-3 overflow-y-auto">
            <Activity className="h-10 w-10 text-rose-500" />
            <div>
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest underline">ApiProjectMapError</p>
                <p className="text-xs font-black text-zinc-900 uppercase tracking-tight">Maps Protocol Blocked</p>
                <p className="text-[10px] text-zinc-500 font-medium max-w-[200px] mx-auto mt-2">
                    The <span className="text-brand font-bold">"Maps JavaScript API"</span> is disabled in your Google project library.
                </p>
                <div className="mt-4 p-4 bg-white rounded-2xl border border-zinc-100 text-[9px] text-zinc-400 font-black text-left space-y-1.5 shadow-sm">
                    <p className="text-zinc-600 border-b border-zinc-50 pb-1 mb-1 uppercase tracking-widest">RECOVERY STEPS:</p>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-500 font-bold">1</div>
                        <p>Go to <span className="text-zinc-600 underline">console.cloud.google.com</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-500 font-bold">2</div>
                        <p>Enable <span className="text-brand">"Maps JavaScript API"</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-500 font-bold">3</div>
                        <p>Enable <span className="text-brand">"Places API"</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-100 flex items-center justify-center text-[7px] text-zinc-500 font-bold">4</div>
                        <p>Enable <span className="text-brand">"Directions API"</span></p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isLoaded) return <div className="h-full w-full flex items-center justify-center bg-zinc-50 rounded-3xl"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>;

    return (
        <div className="h-full w-full relative rounded-3xl overflow-hidden border border-zinc-200 shadow-inner">
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
                    fullscreenControl: false
                }}
            >
                {validStops.map((stop, idx) => (
                    <MarkerF
                        key={idx}
                        position={{ lat: stop.lat, lng: stop.lng }}
                        label={{
                            text: (idx + 1).toString(),
                            className: "font-black text-[10px] text-white",
                            color: "#FFF"
                        }}
                    />
                ))}

                {directions && (
                    <DirectionsRenderer
                        options={{
                            directions: directions,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: "#F43F5E",
                                strokeOpacity: 0.8,
                                strokeWeight: 4,
                            }
                        }}
                    />
                )}
            </GoogleMap>

            <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur shadow-xl border border-zinc-200/50 rounded-2xl px-4 py-2 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-brand" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Route Visualizer</span>
                </div>
            </div>
        </div>
    );
}
