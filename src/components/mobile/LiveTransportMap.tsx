"use client";

import React, { useMemo } from "react";
import { GoogleMap, useLoadScript, MarkerF, PolylineF } from "@react-google-maps/api";

interface LiveTransportMapProps {
    center: { lat: number; lng: number };
    stops: any[];
    liveLocation: { lat: number; lng: number } | null;
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

export const LiveTransportMap: React.FC<LiveTransportMapProps> = ({
    center,
    stops,
    liveLocation
}) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const stopPositions = useMemo(() => stops.map(s => ({
        lat: parseFloat(s.latitude),
        lng: parseFloat(s.longitude)
    })), [stops]);

    if (loadError) return <div className="p-10 text-center font-bold text-red-500">Map Load Error</div>;
    if (!isLoaded) return <div className="p-10 text-center font-black animate-pulse text-summer-navy uppercase tracking-widest">Satellite Syncing...</div>;

    return (
        <div className="w-full h-full relative">
            <GoogleMap
                mapContainerClassName="w-full h-full"
                center={liveLocation || center}
                zoom={14}
                options={{
                    disableDefaultUI: true,
                    styles: mapStyles
                }}
            >
                {/* Route Path */}
                <PolylineF
                    path={stopPositions}
                    options={{
                        strokeColor: "#2D9CB8",
                        strokeOpacity: 0.6,
                        strokeWeight: 4,
                    }}
                />

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
