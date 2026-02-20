"use client";

import React, { useState, useCallback, useRef } from "react";
import { Loader2, Bus, MapPin, CheckCircle, Navigation, Map as MapIcon, Edit3, Search } from "lucide-react";
import { applyForTransportAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleMap, useLoadScript, MarkerF, Autocomplete } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES, DEFAULT_MAP_STYLES } from "@/lib/maps-config";

interface TransportApplicationProps {
    slug: string;
    studentId: string;
    studentName: string;
    parentPhone: string;
    googleMapsApiKey: string;
    onSuccess: () => void;
}

export const TransportApplication: React.FC<TransportApplicationProps> = ({
    slug,
    studentId,
    studentName,
    parentPhone,
    googleMapsApiKey,
    onSuccess
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [address, setAddress] = useState("");
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapMode, setMapMode] = useState(false);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: googleMapsApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                toast.success("Current location captured!");
            },
            (error) => {
                toast.error("Unable to retrieve your location");
                console.error(error);
            }
        );
    }, []);

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setLocation({ lat, lng });
                if (place.formatted_address) {
                    setAddress(place.formatted_address);
                }
            }
        } else {
            console.log("Autocomplete is not loaded yet!");
        }
    };

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const handleApply = async () => {
        if (!address) {
            toast.error("Please provide an address");
            return;
        }

        setSubmitting(true);
        const res = await applyForTransportAction(slug, studentId, address, location?.lat, location?.lng);

        if (res.success) {
            toast.success("Application Submitted Successfully!");
            onSuccess();
        } else {
            toast.error(res.error || "Application Failed");
        }
        setSubmitting(false);
    }

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
    }, []);

    return (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
            <div className="p-6 space-y-8 flex-1 pb-10">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bus className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Transport Application</h2>
                    <p className="text-sm text-gray-500">Provide your pickup details to apply for transport service.</p>
                </div>

                {/* Pre-filled Info */}
                <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Student</p>
                            <p className="text-sm font-bold text-slate-800">{studentName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Edit3 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Parent Phone</p>
                            <p className="text-sm font-bold text-slate-800">{parentPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Location Selection */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider ml-1">Pickup Address</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Type your full address here..."
                            rows={3}
                            className="w-full p-4 bg-white border border-gray-200 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={getCurrentLocation}
                            className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <Navigation className="h-4 w-4 text-blue-500" />
                            Current Location
                        </button>
                        <button
                            onClick={() => setMapMode(!mapMode)}
                            className={`flex items-center justify-center gap-2 p-3 border rounded-2xl text-xs font-bold transition-all shadow-sm ${mapMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <MapIcon className={`h-4 w-4 ${mapMode ? 'text-white' : 'text-blue-500'}`} />
                            {mapMode ? 'Closing Map' : 'Select on Map'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {mapMode && isLoaded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 400 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner relative flex flex-col"
                            >
                                <div className="absolute top-4 left-4 right-4 z-[100] space-y-2">
                                    <Autocomplete
                                        onLoad={onLoad}
                                        onPlaceChanged={onPlaceChanged}
                                    >
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search for a location..."
                                                className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </Autocomplete>
                                    <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/50 inline-block">
                                        <p className="text-[10px] font-bold text-slate-800">Tap on map to pin your location manually</p>
                                    </div>
                                </div>
                                <GoogleMap
                                    mapContainerClassName="w-full h-full min-h-[400px]"
                                    center={location || { lat: 28.6139, lng: 77.2090 }}
                                    zoom={15}
                                    onClick={onMapClick}
                                    options={{
                                        disableDefaultUI: true,
                                        styles: DEFAULT_MAP_STYLES
                                    }}
                                >
                                    {location && (
                                        <MarkerF position={location} />
                                    )}
                                </GoogleMap>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {location && !mapMode && (
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-700 uppercase">Map Coordinates Linked</span>
                            </div>
                            <button
                                onClick={() => setLocation(null)}
                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit Application Button (Inside flow to avoid overlap with BottomNav) */}
                <div className="pt-8">
                    <button
                        onClick={handleApply}
                        disabled={submitting || !address}
                        className="w-full py-5 bg-[var(--brand-color)] text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Submit Application</span>
                                <CheckCircle className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                        By submitting, you agree to school transport terms
                    </p>
                </div>
            </div>
        </div>
    );
};

