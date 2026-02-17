"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation"; // Added import
import {
    MapPin,
    Mail,
    Phone,
    Globe,
    Save,
    Loader2,
    Map as MapIcon,
    Search,
    MapPin as MapPinIcon,
    Key,
    ExternalLink,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { updateSchoolProfileAction } from "@/app/actions/settings-actions";
import { toast } from "sonner";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { cn } from "@/lib/utils";

interface LocationFormProps {
    slug: string;
    initialData: any;
}

const libraries: ("places")[] = ["places"];

export function LocationForm({ slug, initialData }: LocationFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState(initialData || {});
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingKey, setIsSavingKey] = useState(false);

    // Google Maps Script Load - Uses DB key if available, otherwise env
    const activeKey = formData?.googleMapsApiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: activeKey,
        libraries,
    });

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateSchoolProfileAction(slug, formData);
        if (res.success) {
            toast.success("Location and Contact updated");
        } else {
            toast.error(res.error || "Failed to update location");
        }
        setIsSaving(false);
    };

    const handleSaveKey = async () => {
        setIsSavingKey(true);
        const res = await updateSchoolProfileAction(slug, {
            ...formData,
            googleMapsApiKey: formData.googleMapsApiKey
        });
        if (res.success) {
            toast.success("Maps API Key saved. Refreshing services...");
            // Force reload to pick up new key
            router.refresh();
        } else {
            toast.error(res.error || "Failed to save API key");
        }
        setIsSavingKey(false);
    };

    const mapCenter = useMemo(() => {
        const lat = parseFloat(formData?.latitude);
        const lng = parseFloat(formData?.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
        return { lat: 40.7128, lng: -74.0060 }; // Default to NYC if no coords
    }, [formData?.latitude, formData?.longitude]);

    if (loadError && activeKey) return (
        <div className="max-w-4xl p-12 bg-white rounded-[40px] border border-rose-100 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
            <h3 className="text-xl font-black text-zinc-900">Maps Configuration Error</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
                The provided Google Maps API key appears to be invalid or restricted. Please check your credentials.
            </p>
            <button onClick={() => router.refresh()} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase hover:bg-blue-700 transition-colors">Retry Connection</button>
        </div>
    );

    return (
        <div className="w-full space-y-12 animate-in fade-in duration-700">
            {/* API Key Management Section */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-zinc-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <Key className="h-32 w-32 text-zinc-900" />
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                                <Key className="h-6 w-6 text-zinc-400" /> Google Maps Integration
                            </h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Platform Credentials</p>
                        </div>
                        <a
                            href="https://console.cloud.google.com/google/maps-apis/credentials"
                            target="_blank"
                            className="flex items-center gap-2 text-[10px] font-black text-brand hover:text-brand/80 transition-colors uppercase tracking-[0.15em] bg-brand/5 px-3 py-1.5 rounded-lg border border-brand/10"
                        >
                            Get API Key <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="password"
                                value={formData.googleMapsApiKey || ""}
                                onChange={e => setFormData({ ...formData, googleMapsApiKey: e.target.value })}
                                placeholder="Paste your Google Maps API Key here..."
                                className="w-full h-16 bg-zinc-50 border border-zinc-200 rounded-2xl px-6 text-zinc-900 font-mono text-sm focus:ring-2 focus:ring-brand transition-all outline-none"
                            />
                            {activeKey && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <span className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">Validated</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSaveKey}
                            disabled={isSavingKey}
                            className="h-16 px-8 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                            style={{ backgroundColor: 'var(--brand-color)', boxShadow: '0 20px 25px -5px rgba(var(--brand-color-rgb, 0, 0, 0), 0.1), 0 8px 10px -6px rgba(var(--brand-color-rgb, 0, 0, 0), 0.1)' }}
                        >
                            {isSavingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Process Key
                        </button>
                    </div>

                    {!activeKey && (
                        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-start gap-4">
                            <AlertTriangle className="h-5 w-5 text-zinc-400 shrink-0" />
                            <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
                                Google Maps services (Autocomplete & Map View) are currently disabled. Please provide a valid API key to enable institutional tracking.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 space-y-12">

                {/* Search Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-100 rounded-2xl flex items-center justify-center">
                            <Search className="h-5 w-5" style={{ color: 'var(--brand-color)' }} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">Institutional Locator</h3>
                    </div>
                    {isLoaded && activeKey ? (
                        <PlacesAutocomplete
                            onAddressSelect={(address, lat, lng) => {
                                setFormData({
                                    ...formData,
                                    address: address.formatted_address,
                                    city: address.city,
                                    state: address.state,
                                    zip: address.zip,
                                    country: address.country,
                                    latitude: lat.toString(),
                                    longitude: lng.toString()
                                });
                            }}
                        />
                    ) : (
                        <div className="h-16 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/50">
                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                {activeKey ? "Warming up search engines..." : "Provide API Key to enable search"}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Address Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-zinc-100 rounded-2xl flex items-center justify-center">
                                <MapPin className="h-5 w-5" style={{ color: 'var(--brand-color)' }} />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900">Physical Address</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Street Address</label>
                                <textarea
                                    rows={3}
                                    value={formData.address || ""}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 focus:ring-2 focus:ring-brand transition-all font-bold resize-none placeholder:text-zinc-300"
                                    placeholder="Enter full physical address..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">City</label>
                                    <input
                                        value={formData.city || ""}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-bold focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">State / Province</label>
                                    <input
                                        value={formData.state || ""}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-bold focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Postal Code</label>
                                    <input
                                        value={formData.zip || ""}
                                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-bold focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Country</label>
                                    <input
                                        value={formData.country || ""}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-bold focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Latitude</label>
                                    <input
                                        value={formData.latitude || ""}
                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-bold focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Longitude</label>
                                    <input
                                        value={formData.longitude || ""}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-bold focus:ring-2 focus:ring-brand"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Visualization */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <MapIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900">Virtual Presence</h3>
                        </div>

                        <div className="h-[400px] w-full rounded-[32px] overflow-hidden border border-zinc-100 shadow-inner bg-zinc-50 relative group">
                            {isLoaded && activeKey ? (
                                <GoogleMap
                                    zoom={15}
                                    center={mapCenter}
                                    mapContainerClassName="h-full w-full"
                                    options={{
                                        disableDefaultUI: true,
                                        styles: [
                                            {
                                                "featureType": "all",
                                                "elementType": "labels.text.fill",
                                                "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }]
                                            },
                                            {
                                                "featureType": "all",
                                                "elementType": "labels.text.stroke",
                                                "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }]
                                            }
                                        ]
                                    }}
                                >
                                    <MarkerF position={mapCenter} />
                                </GoogleMap>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-6 p-10 text-center">
                                    <div className="h-20 w-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center border border-zinc-100">
                                        <AlertTriangle className="h-10 w-10 text-zinc-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-black text-zinc-900">Map Service Unavailable</p>
                                        <p className="text-[10px] font-medium text-zinc-400 leading-relaxed uppercase tracking-tight">
                                            {activeKey ? "Synchronizing with satellite network..." : "Provide an API Key above to activate the satellite viewport."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeKey && (
                                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                                            <MapPinIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Current Sync</p>
                                            <p className="text-xs font-bold text-zinc-900 truncate">
                                                {formData.latitude || "0.0"}, {formData.longitude || "0.0"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center gap-4">
                            <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                <Globe className="h-5 w-5" style={{ color: 'var(--brand-color)' }} />
                            </div>
                            <p className="text-[10px] font-bold text-zinc-900 leading-relaxed uppercase tracking-tight">
                                Precise coordinates ensure parent navigation apps lead accurately to your gate.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="pt-10 border-t border-zinc-100">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Primary Contact Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <input
                                    value={formData.email || ""}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Front Desk Hotline</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <input
                                    value={formData.phone || ""}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-zinc-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-white px-10 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-2xl disabled:opacity-50"
                        style={{ backgroundColor: 'var(--brand-color)', boxShadow: '0 25px 50px -12px rgba(var(--brand-color-rgb, 0, 0, 0), 0.25)' }}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Commit Connectivity
                    </button>
                </div>
            </div >
        </div >
    );
}

function PlacesAutocomplete({ onAddressSelect }: { onAddressSelect: (address: any, lat: number, lng: number) => void }) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here if needed */
        },
        debounce: 300,
    });

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);

            // Extract address components
            const components = results[0].address_components;
            const getComponent = (type: string) => components.find(c => c.types.includes(type))?.long_name || "";

            onAddressSelect({
                formatted_address: results[0].formatted_address,
                city: getComponent("locality") || getComponent("administrative_area_level_2"),
                state: getComponent("administrative_area_level_1"),
                zip: getComponent("postal_code"),
                country: getComponent("country")
            }, lat, lng);

        } catch (error) {
            console.error("Error fetching geocode:", error);
            toast.error("Failed to fetch location details");
        }
    };

    return (
        <div className="relative z-[70]">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-brand transition-colors" />
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    className="w-full h-16 rounded-2xl bg-zinc-50 border border-zinc-200 pl-14 pr-6 font-bold text-zinc-900 focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none placeholder:text-zinc-400"
                    placeholder="Enter school address to sync coordinates..."
                />
            </div>

            {status === "OK" && (status as any) !== "ZERO_RESULTS" && (
                <ul className="absolute left-0 right-0 mt-3 bg-white border border-zinc-100 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            className="p-5 hover:bg-zinc-50 cursor-pointer flex items-center gap-4 transition-colors group relative overflow-hidden"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.setProperty('--hover-color', 'var(--brand-color)');
                            }}
                        >
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: 'var(--brand-color)' }}
                            />
                            <div
                                className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all"
                                style={{ '--hover-bg': 'var(--brand-color)' } as any}
                            >
                                <MapPinIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900 leading-tight mb-0.5">{description.split(',')[0]}</p>
                                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight truncate max-w-[400px]">
                                    {description.split(',').slice(1).join(',').trim()}
                                </p>
                            </div>
                        </li>
                    ))}
                    <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Validated by Google Cloud</span>
                    </div>
                </ul>
            )}
        </div>
    );
}
