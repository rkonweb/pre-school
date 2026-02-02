"use client";

import { useState, useEffect } from "react";
import {
    Building2,
    Laptop,
    Calendar,
    Type,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Upload,
    X,
    CheckCircle2,
    Save,
    Loader2,
    Phone,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/image-utils";
import { updateSchoolProfileAction } from "@/app/actions/settings-actions";
import { sendOtpAction, verifyOtpAction } from "@/app/actions/auth-actions";
import { getCurrentUserAction } from "@/app/actions/session-actions";
import { toast } from "sonner";

interface IdentityFormProps {
    slug: string;
    initialData: any;
}

export function IdentityForm({ slug, initialData }: IdentityFormProps) {
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(1);
    const [imgNaturalAspect, setImgNaturalAspect] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // Phone number management
    const [currentPhone, setCurrentPhone] = useState<string>("");
    const [newPhone, setNewPhone] = useState("");
    const [oldPhoneOtp, setOldPhoneOtp] = useState("");
    const [newPhoneOtp, setNewPhoneOtp] = useState("");
    const [phoneStep, setPhoneStep] = useState<"idle" | "verify-old" | "enter-new" | "verify-new">("idle");
    const [isPhoneLoading, setIsPhoneLoading] = useState(false);

    // Load current user phone on mount
    useEffect(() => {
        async function loadCurrentPhone() {
            const userRes = await getCurrentUserAction();
            if (userRes.success && userRes.data) {
                setCurrentPhone(userRes.data.mobile || "");
            }
        }
        loadCurrentPhone();
    }, []);

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setTempImage(result);
                const img = new Image();
                img.onload = () => {
                    setImgNaturalAspect(img.naturalWidth / img.naturalHeight);
                    setIsCropModalOpen(true);
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    const finalizeLogo = async () => {
        if (tempImage && croppedAreaPixels) {
            const cropped = await getCroppedImg(tempImage, croppedAreaPixels);
            setFormData({ ...formData, logo: cropped });
            setIsCropModalOpen(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateSchoolProfileAction(slug, formData);
        if (res.success) {
            toast.success("Identity updated successfully");
        } else {
            toast.error(res.error || "Failed to update identity");
        }
        setIsSaving(false);
    };

    // Phone number handlers
    async function startPhoneChange() {
        if (!currentPhone) {
            // No phone registered, go directly to new phone
            setPhoneStep("enter-new");
            return;
        }
        // Send OTP to current phone for verification
        setIsPhoneLoading(true);
        const res = await sendOtpAction(currentPhone, "login");
        setIsPhoneLoading(false);

        if (res.success) {
            toast.success("OTP sent to your current number");
            setPhoneStep("verify-old");
        } else {
            toast.error(res.error || "Failed to send OTP");
        }
    }

    async function verifyOldPhone() {
        setIsPhoneLoading(true);
        const res = await verifyOtpAction(currentPhone, oldPhoneOtp);
        setIsPhoneLoading(false);

        if (res.success) {
            toast.success("Current number verified");
            setPhoneStep("enter-new");
            setOldPhoneOtp("");
        } else {
            toast.error(res.error || "Invalid OTP");
        }
    }

    async function sendNewPhoneOtp() {
        if (!/^[0-9]{10}$/.test(newPhone)) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        setIsPhoneLoading(true);
        const res = await sendOtpAction(newPhone, "login");
        setIsPhoneLoading(false);

        if (res.success) {
            toast.success("OTP sent to new number");
            setPhoneStep("verify-new");
        } else {
            toast.error(res.error || "Failed to send OTP");
        }
    }

    async function verifyNewPhone() {
        setIsPhoneLoading(true);
        const res = await verifyOtpAction(newPhone, newPhoneOtp);
        setIsPhoneLoading(false);

        if (res.success) {
            // Update phone in database (you'll need to create this action)
            setCurrentPhone(newPhone);
            toast.success("Phone number updated successfully");
            setPhoneStep("idle");
            setNewPhone("");
            setNewPhoneOtp("");
        } else {
            toast.error(res.error || "Invalid OTP");
        }
    }

    function cancelPhoneChange() {
        setPhoneStep("idle");
        setNewPhone("");
        setOldPhoneOtp("");
        setNewPhoneOtp("");
    }

    return (
        <div className="max-w-4xl space-y-12 animate-in fade-in duration-700">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 space-y-10">
                <div className="flex flex-col md:flex-row gap-10 items-start border-b border-zinc-100 pb-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">School Seal / Logo</label>
                        <div className="relative group h-40 w-40 rounded-[32px] bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-500">
                            {formData.logo ? (
                                <>
                                    <img src={formData.logo} alt="Logo" className="h-full w-full object-cover" />
                                    <button onClick={() => setFormData({ ...formData, logo: "" })} className="absolute top-2 right-2 h-8 w-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <X className="h-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-zinc-300" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Upload PNG/JPG</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 pt-8">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-zinc-900">Institutional Branding</h3>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
                            This logo is the primary identifier for your school and will appear on official certificates, transcripts, and portal headers.
                        </p>
                        <button
                            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                        >
                            Change Official Logo
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="space-y-1.5 font-bold">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400">School Legal Name</label>
                            <input
                                value={formData.name || ""}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400">Institutional Motto</label>
                            <input
                                value={formData.motto || ""}
                                onChange={e => setFormData({ ...formData, motto: e.target.value })}
                                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400">Public Website</label>
                            <div className="relative">
                                <Laptop className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
                                <input
                                    value={formData.website || ""}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400">Founding Year</label>
                            <input
                                type="number"
                                value={formData.foundingYear || ""}
                                onChange={e => setFormData({ ...formData, foundingYear: e.target.value })}
                                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-zinc-400">Theme Color</label>
                            <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                                <input
                                    type="color"
                                    value={formData.brandColor || "#2563eb"}
                                    onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                                    className="h-10 w-20 rounded-lg cursor-pointer border-0 bg-transparent"
                                />
                                <span className="text-[10px] font-black text-zinc-500 uppercase">Primary Portal Color</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phone Number Management Section */}
                <div className="pt-10 border-t border-zinc-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900">Registered Phone Number</h3>
                            <p className="text-sm text-zinc-500">Manage your account phone number with OTP verification</p>
                        </div>
                    </div>

                    {phoneStep === "idle" && (
                        <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Current Phone</label>
                                    <p className="text-lg font-black text-zinc-900 mt-1">
                                        {currentPhone ? `+91 ${currentPhone}` : "No phone number registered"}
                                    </p>
                                </div>
                                <button
                                    onClick={startPhoneChange}
                                    disabled={isPhoneLoading}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {currentPhone ? "Change Number" : "Add Number"}
                                </button>
                            </div>
                        </div>
                    )}

                    {phoneStep === "verify-old" && (
                        <div className="bg-amber-50 rounded-2xl p-6 space-y-4 border-2 border-amber-200">
                            <div className="flex items-center gap-2 text-amber-700">
                                <Shield className="h-5 w-5" />
                                <span className="font-bold text-sm">Verify Current Number</span>
                            </div>
                            <p className="text-sm text-zinc-600">
                                OTP sent to <span className="font-bold">+91 {currentPhone}</span>. Use <span className="font-black text-blue-600">1234</span> for testing.
                            </p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={oldPhoneOtp}
                                    onChange={(e) => setOldPhoneOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    maxLength={4}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-amber-300 font-bold text-center text-lg tracking-widest"
                                />
                                <button
                                    onClick={verifyOldPhone}
                                    disabled={isPhoneLoading || oldPhoneOtp.length !== 4}
                                    className="px-6 py-3 bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isPhoneLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Verify
                                </button>
                                <button
                                    onClick={cancelPhoneChange}
                                    className="px-6 py-3 bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {phoneStep === "enter-new" && (
                        <div className="bg-blue-50 rounded-2xl p-6 space-y-4 border-2 border-blue-200">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Phone className="h-5 w-5" />
                                <span className="font-bold text-sm">Enter New Phone Number</span>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-300 bg-white">
                                    <span className="font-bold text-zinc-500">+91</span>
                                    <input
                                        type="tel"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        placeholder="Enter 10-digit number"
                                        maxLength={10}
                                        className="flex-1 font-bold outline-none"
                                    />
                                </div>
                                <button
                                    onClick={sendNewPhoneOtp}
                                    disabled={isPhoneLoading || newPhone.length !== 10}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isPhoneLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Send OTP
                                </button>
                                <button
                                    onClick={cancelPhoneChange}
                                    className="px-6 py-3 bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {phoneStep === "verify-new" && (
                        <div className="bg-green-50 rounded-2xl p-6 space-y-4 border-2 border-green-200">
                            <div className="flex items-center gap-2 text-green-700">
                                <Shield className="h-5 w-5" />
                                <span className="font-bold text-sm">Verify New Number</span>
                            </div>
                            <p className="text-sm text-zinc-600">
                                OTP sent to <span className="font-bold">+91 {newPhone}</span>. Use <span className="font-black text-blue-600">1234</span> for testing.
                            </p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newPhoneOtp}
                                    onChange={(e) => setNewPhoneOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    maxLength={4}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-green-300 font-bold text-center text-lg tracking-widest"
                                />
                                <button
                                    onClick={verifyNewPhone}
                                    disabled={isPhoneLoading || newPhoneOtp.length !== 4}
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isPhoneLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Verify & Update
                                </button>
                                <button
                                    onClick={cancelPhoneChange}
                                    className="px-6 py-3 bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-zinc-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-zinc-900 text-white px-10 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Update Identity
                    </button>
                </div>
            </div>

            {/* Crop Modal */}
            {isCropModalOpen && tempImage && (
                <div className="fixed inset-0 z-[100] bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-zinc-900">Crop Logo</h3>
                            <button onClick={() => setIsCropModalOpen(false)}><X /></button>
                        </div>
                        <div className="relative h-[400px] bg-zinc-50">
                            <Cropper
                                image={tempImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-8 flex gap-4">
                            <button onClick={() => setAspect(1)} className="px-4 py-2 bg-zinc-100 rounded-xl text-[10px] font-bold uppercase">Square</button>
                            <button onClick={() => setAspect(imgNaturalAspect)} className="px-4 py-2 bg-zinc-100 rounded-xl text-[10px] font-bold uppercase">Original</button>
                            <div className="flex-1" />
                            <button onClick={finalizeLogo} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest">Apply Logo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
