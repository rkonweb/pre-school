"use client";

import React, { useState } from "react";
import { Loader2, CreditCard, ShieldCheck, Bus, MapPin, User, ArrowRight } from "lucide-react";
import { payTransportFeeAction } from "@/app/actions/parent-actions";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TransportPaymentProps {
    slug: string;
    studentId: string;
    amount: number;
    route?: any;
    pickupStop?: any;
    dropStop?: any;
    onSuccess: () => void;
}

export const TransportPayment: React.FC<TransportPaymentProps> = ({
    slug,
    studentId,
    amount,
    route,
    pickupStop,
    dropStop,
    onSuccess
}) => {
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);
        // Simulate payment delay
        await new Promise(r => setTimeout(r, 1500));

        const res = await payTransportFeeAction(slug, studentId);
        if (res.success) {
            toast.success("Payment Successful! Transport Active.");
            onSuccess();
        } else {
            toast.error(res.error || "Payment Failed");
        }
        setProcessing(false);
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col p-6 space-y-6">
            <div className="text-center space-y-4 pt-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <ShieldCheck className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Application Approved!</h2>
                    <p className="text-sm font-medium text-slate-400">Your route is assigned. Activate service now.</p>
                </div>
            </div>

            {/* Route Details Card */}
            {route && (
                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Bus className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned Route</p>
                            <h3 className="text-lg font-bold text-slate-800">{route.name}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Vehicle</p>
                            <p className="text-sm font-bold text-slate-700">{route.vehicleNumber || "Not Set"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Driver</p>
                            <p className="text-sm font-bold text-slate-700">{route.driverName || "Assigning..."}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup</p>
                            <p className="text-[11px] font-black text-slate-800 mt-0.5">{pickupStop?.name || "Home"}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-200" />
                        <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Drop</p>
                            <p className="text-[11px] font-black text-slate-800 mt-0.5">{dropStop?.name || "School"}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Summary */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Service Fee</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">₹</span>
                        <span className="text-5xl font-black tracking-tighter">{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs font-medium opacity-80 mt-2">Monthly Subscription Fee</p>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="flex-1" />

            <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-5 bg-[var(--brand-color)] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {processing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <CreditCard className="w-6 h-6" />
                        <span>Pay & Activate Service</span>
                    </>
                )}
            </button>

            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest pb-4">
                Secure SSL Encrypted Transaction
            </p>
        </div>
    );
}
