import { useEffect, useState, useMemo } from "react";
import { getVehicleTelemetryAction } from "@/app/actions/tracking-actions";
import { X, Loader2, Navigation, Activity, Clock, MapPin } from "lucide-react";
import { GoogleMap, useLoadScript, MarkerF, PolylineF, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES, DEFAULT_MAP_STYLES } from "@/lib/maps-config";

interface VehicleTrackingModalProps {
    vehicleId: string;
    onClose: () => void;
    apiKey: string;
}

export default function VehicleTrackingModal({ vehicleId, onClose, apiKey }: VehicleTrackingModalProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: GOOGLE_MAPS_LIBRARIES,
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

    const routePath = useMemo(() => {
        if (!data?.route?.stops) return [];
        return data.route.stops
            .map((stop: any) => ({
                lat: parseFloat(stop.latitude),
                lng: parseFloat(stop.longitude),
                sequenceOrder: typeof stop.sequenceOrder === 'string' ? parseInt(stop.sequenceOrder) : (stop.sequenceOrder || 0)
            }))
            .filter((stop: any) => !isNaN(stop.lat) && !isNaN(stop.lng))
            .sort((a: any, b: any) => a.sequenceOrder - b.sequenceOrder);
    }, [data]);

    // Calculate directions for the assigned route
    useEffect(() => {
        if (!isLoaded || routePath.length < 2) {
            setDirections(null);
            return;
        }

        const directionsService = new google.maps.DirectionsService();

        directionsService.route({
            origin: routePath[0],
            destination: routePath[routePath.length - 1],
            waypoints: routePath.slice(1, -1).map((stop: any) => ({
                location: stop,
                stopover: true
            })),
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
            }
        });
    }, [isLoaded, routePath]);

    if (loading || !isLoaded) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-[40px] p-12 text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Synchronizing Maps...</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-[40px] p-12 max-w-xl text-center space-y-6">
                    <Activity className="h-12 w-12 text-rose-500 mx-auto" />
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 underline">ApiProjectMapError</p>
                        <h3 className="text-xl font-black text-zinc-900">Maps Service Disabled</h3>
                        <p className="text-sm text-zinc-500 max-w-md mx-auto">
                            The API key is active, but the <span className="text-brand font-bold">"Maps JavaScript API"</span> service is disabled for your project in Google Cloud Console.
                        </p>
                    </div>

                    <div className="bg-zinc-50 rounded-3xl p-8 text-left space-y-4 border border-zinc-100 shadow-inner">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">Recovery Protocol</p>
                        <div className="space-y-3 text-xs font-medium text-zinc-600">
                            <p>1. Go to <span className="font-bold underline">console.cloud.google.com</span></p>
                            <p>2. Select your project library</p>
                            <p>3. Enable <span className="text-brand font-bold">"Maps JavaScript API"</span></p>
                            <p>4. Enable <span className="text-brand font-bold">"Places API"</span></p>
                            <p>5. Enable <span className="text-brand font-bold">"Directions API"</span></p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                        Deactivate Interface
                    </button>
                </div>
            </div>
        );
    }

    if (!data || !data.telemetry || data.telemetry.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-12 max-w-md text-center">
                    <p className="text-zinc-600 font-medium mb-6">No telemetry data available for this vehicle.</p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700"
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
                            styles: DEFAULT_MAP_STYLES,
                            zoomControl: true
                        }}
                    >
                        {/* Route Path (Planned) */}
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

                        {/* Trail Path (Actual History) */}
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
                        {routePath.map((stop: any, i: number) => (
                            <MarkerF
                                key={stop.id || i}
                                position={{
                                    lat: stop.lat,
                                    lng: stop.lng
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
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="h-4 w-4 text-blue-500" />
                                <p className="text-xs font-medium text-zinc-500">Speed</p>
                            </div>
                            <p className="text-2xl font-bold text-zinc-900">
                                {latestTelemetry.speed ? `${Math.round(latestTelemetry.speed)} km/h` : "-"}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Navigation className="h-4 w-4 text-green-500" />
                                <p className="text-xs font-medium text-zinc-500">Status</p>
                            </div>
                            <p className="text-2xl font-bold text-zinc-900 capitalize text-green-600">
                                {latestTelemetry.status.toLowerCase()}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <p className="text-xs font-medium text-zinc-500">Delay</p>
                            </div>
                            <p className="text-2xl font-bold text-zinc-900">
                                {latestTelemetry.delayMinutes > 0 ? `+${latestTelemetry.delayMinutes} min` : "On-Time"}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-brand" />
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
