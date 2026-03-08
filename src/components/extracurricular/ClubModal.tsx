"use client";

import React, { useEffect, useState } from "react";
import { 
    ErpModal, ErpInput, Btn, C 
} from "@/components/ui/erp-ui";
import { 
    Select, SelectContent, SelectItem, 
    SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Shield, Users, Info, Palmtree } from "lucide-react";
import { getStaffAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";

interface ClubModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    slug: string;
}

export default function ClubModal({ open, onClose, onSubmit, initialData, slug }: ClubModalProps) {
    const [formData, setFormData] = useState<any>({
        name: "",
        description: "",
        coachId: "",
        capacity: "",
        meetingSchedule: "",
        logo: ""
    });
    const [staff, setStaff] = useState<any[]>([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    description: initialData.description || "",
                    coachId: initialData.coachId || "",
                    capacity: initialData.capacity ? String(initialData.capacity) : "",
                    meetingSchedule: initialData.meetingSchedule || "",
                    logo: initialData.logo || ""
                });
            } else {
                setFormData({
                    name: "",
                    description: "",
                    coachId: "",
                    capacity: "",
                    meetingSchedule: "",
                    logo: ""
                });
            }
            loadStaff();
        }
    }, [open, initialData]);

    const loadStaff = async () => {
        setIsLoadingStaff(true);
        const res = await getStaffAction(slug);
        if (res.success) {
            setStaff(res.data);
        }
        setIsLoadingStaff(false);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Club name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...formData,
                capacity: formData.capacity ? parseInt(formData.capacity) : null
            };
            await onSubmit(submissionData);
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save club");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ErpModal
            open={open}
            onClose={onClose}
            title={initialData ? "Edit Club" : "New Club"}
            subtitle={initialData ? "Modify club details and settings." : "Create a new specialized student organization."}
            icon={Palmtree}
            maxWidth={550}
            footer={
                <div className="flex gap-3">
                    <Btn variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Btn>
                    <Btn variant="primary" onClick={handleSave} loading={isSubmitting}>
                        {initialData ? "Update Club" : "Create Club"}
                    </Btn>
                </div>
            }
        >
            <div className="flex flex-col gap-5 py-2">
                <ErpInput
                    label="Club Name"
                    placeholder="e.g. Science Club, Chess Academy"
                    icon={Shield}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-zinc-600">President / Mentor</label>
                    <Select 
                        value={formData.coachId} 
                        onValueChange={(val: string) => setFormData({ ...formData, coachId: val })}
                    >
                        <SelectTrigger className="bg-zinc-50 border-zinc-200">
                            <SelectValue placeholder="Select a staff member" />
                        </SelectTrigger>
                        <SelectContent>
                            {staff.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.firstName} {s.lastName} ({s.designation || "Staff"})
                                </SelectItem>
                            ))}
                            {staff.length === 0 && !isLoadingStaff && (
                                <div className="p-3 text-center text-xs text-zinc-400">No staff found</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ErpInput
                        label="Capacity Limit"
                        placeholder="e.g. 30"
                        type="number"
                        icon={Users}
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                    <ErpInput
                        label="Meeting Schedule"
                        placeholder="e.g. Saturdays 10 AM"
                        icon={Info}
                        value={formData.meetingSchedule}
                        onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-zinc-600">Description</label>
                    <textarea
                        className="w-full p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-500/20 transition-all outline-none resize-none h-32"
                        placeholder="Detail the club's mission, activities, and goals..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </div>
        </ErpModal>
    );
}
