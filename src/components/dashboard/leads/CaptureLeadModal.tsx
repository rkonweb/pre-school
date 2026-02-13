"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { PhoneInput } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLeadAction, getBranchesAction, getCounsellorsAction } from "@/app/actions/lead-actions";
import { Loader2, Plus, MessageCircle, Phone, User, Calendar, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaptureLeadModalProps {
    slug: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CaptureLeadModal({ slug, isOpen, onOpenChange, onSuccess }: CaptureLeadModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    const [counsellors, setCounsellors] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        parentName: "",
        mobile: "",
        childName: "",
        childAge: "",
        programInterested: "",
        preferredBranchId: "",
        source: "DIRECT",
        counsellorId: "",
        consentWhatsApp: true,
        consentCalls: true,
    });

    useEffect(() => {
        if (isOpen) {
            loadMetaData();
        }
    }, [isOpen, slug]);

    async function loadMetaData() {
        const [bRes, cRes] = await Promise.all([
            getBranchesAction(slug),
            getCounsellorsAction(slug)
        ]);
        if (bRes.success) setBranches(bRes.branches || []);
        if (cRes.success) setCounsellors(cRes.counsellors || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await createLeadAction(slug, {
            ...formData,
            childAge: formData.childAge ? parseInt(formData.childAge) : undefined,
        });

        if (res.success) {
            onOpenChange(false);
            setFormData({
                parentName: "",
                mobile: "",
                childName: "",
                childAge: "",
                programInterested: "",
                preferredBranchId: "",
                source: "DIRECT",
                counsellorId: "",
                consentWhatsApp: true,
                consentCalls: true,
            });
            if (onSuccess) onSuccess();
        } else {
            alert(res.error || "Failed to capture lead");
        }
        setIsSubmitting(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-[32px] border-zinc-200 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 bg-zinc-50 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                            <Plus className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900">Capture New Lead</DialogTitle>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Manual intake form for walk-ins & calls</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Basic Info */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Parent Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                <Input
                                    required
                                    placeholder="Full Name"
                                    value={formData.parentName}
                                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                                    className="pl-10 h-12 rounded-2xl border-zinc-100 focus:ring-brand"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Mobile Number</Label>
                            <PhoneInput
                                required
                                placeholder="10-digit mobile"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                className="h-12 rounded-2xl border-zinc-100 focus:ring-brand"
                            />
                        </div>
                    </div>

                    {/* Child Info */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Child Name</Label>
                            <Input
                                required
                                placeholder="Child Full Name"
                                value={formData.childName}
                                onChange={e => setFormData({ ...formData, childName: e.target.value })}
                                className="h-12 rounded-2xl border-zinc-100 focus:ring-brand"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Child Age</Label>
                            <Input
                                type="number"
                                placeholder="Approx. Age"
                                value={formData.childAge}
                                onChange={e => setFormData({ ...formData, childAge: e.target.value })}
                                className="h-12 rounded-2xl border-zinc-100 focus:ring-brand"
                            />
                        </div>
                    </div>

                    {/* Intent & Branch */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Program</Label>
                            <Select
                                value={formData.programInterested}
                                onValueChange={(val: string) => setFormData({ ...formData, programInterested: val })}
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-zinc-100">
                                    <SelectValue placeholder="Select Program" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl">
                                    {['Playschool', 'Pre-KG', 'LKG', 'UKG', 'Daycare'].map(p => (
                                        <SelectItem key={p} value={p} className="rounded-xl">{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Preferred Branch</Label>
                            <Select
                                value={formData.preferredBranchId}
                                onValueChange={(val: string) => setFormData({ ...formData, preferredBranchId: val })}
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-zinc-100">
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl">
                                    {branches.map(b => (
                                        <SelectItem key={b.id} value={b.id} className="rounded-xl">{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Source & Counsellor */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Lead Source</Label>
                            <Select
                                value={formData.source}
                                onValueChange={(val: string) => setFormData({ ...formData, source: val })}
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-zinc-100">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl">
                                    {['DIRECT', 'WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE', 'REFERRAL', 'OTHER'].map(s => (
                                        <SelectItem key={s} value={s} className="rounded-xl">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Assign Counsellor</Label>
                            <Select
                                value={formData.counsellorId}
                                onValueChange={(val: string) => setFormData({ ...formData, counsellorId: val })}
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-zinc-100">
                                    <SelectValue placeholder="Select Staff" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl">
                                    {counsellors.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="rounded-xl">{c.firstName} {c.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Consents */}
                    <div className="flex items-center gap-6 pt-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, consentWhatsApp: !formData.consentWhatsApp })}
                            className={cn(
                                "flex-1 h-12 rounded-2xl border flex items-center justify-center gap-2 transition-all",
                                formData.consentWhatsApp ? "bg-green-50 border-green-200 text-green-700" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                            )}
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp Consent</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, consentCalls: !formData.consentCalls })}
                            className={cn(
                                "flex-1 h-12 rounded-2xl border flex items-center justify-center gap-2 transition-all",
                                formData.consentCalls ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-zinc-50 border-zinc-100 text-zinc-400"
                            )}
                        >
                            <Phone className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Call Consent</span>
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-zinc-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Lead Details"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
