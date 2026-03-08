"use client";

import { useState, useEffect } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { generateBiometricRegistrationOptions, verifyBiometricRegistration, getStaffBiometrics, removeBiometricCredential } from "@/app/actions/webauthn-actions";
import { Fingerprint, Smartphone, Laptop, Plus, Trash2, KeyRound, Hand } from "lucide-react";
import { FingerSelectionUI } from "./FingerSelectionUI";
import { toast } from "sonner";
import { format } from "date-fns";

interface StaffBiometricSectionProps {
    staffId: string;
    schoolSlug?: string;
}

export function StaffBiometricSection({ staffId, schoolSlug }: StaffBiometricSectionProps) {
    const [credentials, setCredentials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showFingerSelect, setShowFingerSelect] = useState(false);
    const [selectedFingerId, setSelectedFingerId] = useState<string | null>(null);
    const [selectedFingerName, setSelectedFingerName] = useState<string | null>(null);

    useEffect(() => {
        loadCredentials();
    }, [staffId]);

    const loadCredentials = async () => {
        try {
            setIsLoading(true);
            const res = await getStaffBiometrics(staffId);
            if (res.success && res.credentials) {
                setCredentials(res.credentials);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            setIsRegistering(true);
            toast.loading("Preparing secure registration...", { id: "biometric" });

            // 1. Get options from server
            const optionsRes = await generateBiometricRegistrationOptions(staffId);
            if (!optionsRes.success || !optionsRes.options) {
                throw new Error(optionsRes.error || "Failed to generate options");
            }

            toast.loading("Please authenticate using your device (Touch ID, Face ID, USB Key)...", { id: "biometric" });

            // 2. Pass options to browser authenticator (this triggers the native OS prompt)
            let attestationResponse;
            try {
                attestationResponse = await startRegistration({ optionsJSON: optionsRes.options });
            } catch (authError: any) {
                if (authError.name === 'NotAllowedError') {
                    throw new Error("Registration cancelled or timed out.");
                }
                throw authError;
            }

            toast.loading("Verifying credential...", { id: "biometric" });

            // 3. Send response back to server for cryptographic verification
            const verifyRes = await verifyBiometricRegistration(staffId, attestationResponse, selectedFingerName || undefined);

            if (verifyRes.success) {
                toast.success("Biometric device registered successfully!", { id: "biometric" });
                loadCredentials();
            } else {
                throw new Error(verifyRes.error || "Verification failed");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(`Registration failed: ${error.message}`, { id: "biometric" });
        } finally {
            setIsRegistering(false);
            setShowFingerSelect(false);
            setSelectedFingerId(null);
            setSelectedFingerName(null);
        }
    };

    const handleSelectFinger = (id: string, name: string) => {
        if (selectedFingerId === id) {
            setSelectedFingerId(null);
            setSelectedFingerName(null);
        } else {
            setSelectedFingerId(id);
            setSelectedFingerName(name);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this biometric device? They will lose access via this device.")) return;
        
        const res = await removeBiometricCredential(id, `/s/${schoolSlug}/hr/directory/${staffId}/edit`);
        if (res.success) {
            toast.success("Device removed");
            loadCredentials();
        } else {
            toast.error(res.error || "Failed to remove device");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <Fingerprint className="h-5 w-5 text-[--brand-color]" />
                        Biometric Access (WebAuthn / Passkeys)
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                        Allow this staff member to use built-in laptop fingerprint readers (Touch ID / Windows Hello), 
                        mobile face scanners (Face ID), or external USB keys to check-in/out or access secure areas.
                    </p>
                </div>
                <button
                    onClick={() => setShowFingerSelect(true)}
                    disabled={isRegistering}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[--brand-color] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {isRegistering ? (
                        "Waiting for Device..."
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            Register Biometric Details
                        </>
                    )}
                </button>
            </div>

            {showFingerSelect && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <div className="h-10 w-10 rounded-full bg-[rgba(var(--brand-color-rgb),0.1)] flex items-center justify-center text-[--brand-color]">
                            <Hand className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Select Finger (Optional)</h3>
                            <p className="text-xs text-zinc-500">Pick which finger you are registering for easier tracking later.</p>
                        </div>
                    </div>
                    
                    <FingerSelectionUI 
                        selectedFinger={selectedFingerId}
                        onSelect={handleSelectFinger}
                    />

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            onClick={() => {
                                setShowFingerSelect(false);
                                setSelectedFingerId(null);
                                setSelectedFingerName(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRegister}
                            disabled={isRegistering}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[--brand-color] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 min-w-[140px]"
                        >
                            {isRegistering ? "Registering..." : "Continue to Sensor"}
                        </button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center h-24 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                    <span className="text-sm text-zinc-500 font-medium animate-pulse">Loading secure credentials...</span>
                </div>
            ) : credentials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl border-dashed bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <Smartphone className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 font-medium">No biometric details registered</p>
                    <p className="text-sm text-zinc-500 max-w-sm text-center mt-1">
                        Click "Register Biometric Details" to map a fingerprint or facial recognition scanner to this staff account.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {credentials.map((cred) => (
                        <div key={cred.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-[rgba(var(--brand-color-rgb),0.1)] flex items-center justify-center text-[--brand-color]">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-50 leading-tight">
                                        Registered Device
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                                        {cred.credentialID.substring(0, 16)}...
                                    </p>
                                    {cred.fingerName && (
                                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                            <Hand className="h-3 w-3 text-zinc-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                                                {cred.fingerName}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Added {format(new Date(cred.createdAt), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cred.id)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                                title="Remove device"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
