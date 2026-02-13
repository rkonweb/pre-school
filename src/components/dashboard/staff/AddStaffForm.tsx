"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Briefcase, Mail, Phone, Calendar, FileText, X, User, MapPin, CreditCard, Heart, Linkedin, Twitter, Facebook, Instagram, ArrowUpDown, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { createStaffAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { AvatarWithAdjustment } from "./AvatarWithAdjustment";



interface AddStaffFormProps {
    schoolSlug?: string;
    onCancel: () => void;
    onSuccess: () => void;
    roles?: any[];
    designations?: { id: string; name: string; code: string }[];
    departments?: { id: string; name: string; code: string }[];
    employmentTypes?: { id: string; name: string; code: string }[];
    bloodGroups?: { id: string; name: string; code: string }[];
    genders?: { id: string; name: string; code: string }[];
    subjects?: { id: string; name: string; code: string }[];
    initialData?: any;
    staffId?: string;
}

import { updateStaffAction } from "@/app/actions/staff-actions";

export function AddStaffForm({ schoolSlug, onCancel, onSuccess, roles = [], designations = [], departments = [], employmentTypes = [], bloodGroups = [], genders = [], subjects = [], initialData, staffId }: AddStaffFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    // ... existing state/logic ...

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Multi-Select State for Subjects
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
        initialData?.subjects ? (initialData.subjects.includes(",") ? initialData.subjects.split(",").map((s: any) => s.trim()) : [initialData.subjects]) : []
    );
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(initialData?.designation || "");
    const [wasSubmitted, setWasSubmitted] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Cropper State
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [croppedArea, setCroppedArea] = useState<any>(null);
    const [avatarAdjustment, setAvatarAdjustment] = useState<string>(initialData?.avatarAdjustment || "");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const toggleSubject = (subjectName: string) => {
        if (selectedSubjects.includes(subjectName)) {
            setSelectedSubjects(prev => prev.filter(s => s !== subjectName));
        } else {
            setSelectedSubjects(prev => [...prev, subjectName]);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedArea(croppedArea);
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const finalizeAdjustment = () => {
        if (croppedArea) {
            const adjustment = JSON.stringify({
                crop,
                zoom,
                croppedArea,
                croppedAreaPixels
            });
            setAvatarAdjustment(adjustment);
            setIsCropModalOpen(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;

        if (!form.checkValidity()) {
            setWasSubmitted(true);
            const firstInvalid = form.querySelector(':invalid') as HTMLElement;
            firstInvalid?.focus();
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        if (avatarInputRef.current?.files?.[0]) {
            formData.set("avatarFile", avatarInputRef.current.files[0]);
        }

        if (staffId && initialData) {
            // Update Mode
            const res = await updateStaffAction(staffId, formData);
            if (res.success) {
                toast.success("Staff profile updated successfully");
                onSuccess();
            } else {
                toast.error(res.error || "Failed to update staff");
            }
        } else if (schoolSlug) {
            // Create Mode
            const res = await createStaffAction(schoolSlug, formData);
            if (res.success) {
                toast.success("Staff member added successfully");
                onSuccess();
            } else {
                toast.error(res.error || "Failed to add staff");
            }
        }
        setIsLoading(false);
    };

    // Helper for date values (YYYY-MM-DD)
    const formatDate = (date: any) => {
        if (!date) return "";
        return new Date(date).toISOString().split('T')[0];
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col gap-8">
            <div className="flex flex-col gap-8">

                {/* 1. Personal Information */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Personal Information</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Basic identification details for the staff member.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-3">
                            <div
                                onClick={() => avatarInputRef.current?.click()}
                                className="relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-300 bg-white transition-all hover:border-brand hover:bg-brand/5 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-brand dark:hover:bg-brand/10"
                            >
                                {avatarPreview || initialData?.avatar ? (
                                    <AvatarWithAdjustment
                                        src={avatarPreview || initialData?.avatar}
                                        adjustment={avatarAdjustment}
                                        className="h-full w-full"
                                    />
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-zinc-400 group-hover:text-brand" />
                                        <span className="mt-2 text-xs font-medium text-zinc-500">Upload Photo</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="text-[10px] font-black uppercase text-brand hover:underline"
                                >
                                    {avatarPreview || initialData?.avatar ? "Change" : "Upload"}
                                </button>
                                {(avatarPreview || initialData?.avatar) && (
                                    <button
                                        type="button"
                                        onClick={() => setIsCropModalOpen(true)}
                                        className="text-[10px] font-black uppercase text-zinc-500 hover:text-brand transition-colors"
                                    >
                                        Adjust View
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={avatarInputRef} name="avatarFile" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            <input type="hidden" name="avatarAdjustment" value={avatarAdjustment} />
                        </div>

                        {/* Fields */}
                        <div className="grid flex-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">First Name <span className="text-red-500">*</span></label>
                                <input
                                    name="firstName"
                                    defaultValue={initialData?.firstName}
                                    required
                                    className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1",
                                        "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                        wasSubmitted ? "invalid:border-red-500 invalid:ring-1 invalid:ring-red-500" : "border-zinc-300 dark:border-zinc-700"
                                    )}
                                />
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Last Name <span className="text-red-500">*</span></label>
                                <input
                                    name="lastName"
                                    defaultValue={initialData?.lastName}
                                    required
                                    className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1",
                                        "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                        wasSubmitted ? "invalid:border-red-500 invalid:ring-1 invalid:ring-red-500" : "border-zinc-300 dark:border-zinc-700"
                                    )}
                                />
                            </div>

                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={initialData?.email}
                                    required
                                    className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1",
                                        "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                        wasSubmitted ? "invalid:border-red-500 invalid:ring-1 invalid:ring-red-500" : "border-zinc-300 dark:border-zinc-700"
                                    )}
                                />
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number <span className="text-red-500">*</span></label>
                                <input
                                    name="mobile"
                                    type="tel"
                                    defaultValue={initialData?.mobile}
                                    required
                                    maxLength={10}
                                    onInput={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.value = target.value.replace(/\D/g, "").slice(0, 10);
                                    }}
                                    className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1",
                                        "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                        wasSubmitted ? "invalid:border-red-500 invalid:ring-1 invalid:ring-red-500" : "border-zinc-300 dark:border-zinc-700"
                                    )}
                                />
                            </div>

                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date of Birth</label>
                                <input name="dateOfBirth" type="date" defaultValue={formatDate(initialData?.dateOfBirth)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gender</label>
                                <select name="gender" defaultValue={initialData?.gender} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800">
                                    <option value="">Select Gender</option>
                                    {genders.length > 0 ? (
                                        genders.map((g) => (
                                            <option key={g.id} value={g.name}>
                                                {g.name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Blood Group</label>
                                <select name="bloodGroup" defaultValue={initialData?.bloodGroup} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800">
                                    <option value="">Select Group</option>
                                    {bloodGroups.length > 0 ? (
                                        bloodGroups.map((bg) => (
                                            <option key={bg.id} value={bg.name}>
                                                {bg.name}
                                            </option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role & Permissions */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100/50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Roles & Permissions</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Assign system access level and permissions.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="customRoleId" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Assigned System Role
                            </label>
                            <div className="relative">
                                <select
                                    id="customRoleId"
                                    name="customRoleId"
                                    defaultValue={initialData?.customRoleId || ""}
                                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                >
                                    <option value="">No Specific Role (Standard Staff Access)</option>
                                    {roles?.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400">
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">
                                This determines what modules the staff member can access in the dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Professional Details */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100/50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Professional Details</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Role, department, and employment information.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="space-y-2">
                            <label htmlFor="designation" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="designation"
                                    name="designation"
                                    required
                                    value={selectedDesignation}
                                    onChange={(e) => setSelectedDesignation(e.target.value)}
                                    className={cn(
                                        "w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-4",
                                        "focus:border-brand focus:ring-brand/10 dark:bg-zinc-950 dark:text-zinc-200",
                                        wasSubmitted ? "invalid:border-red-500 invalid:ring-4 invalid:ring-red-500/10" : "border-zinc-200 dark:border-zinc-800"
                                    )}
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400">
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="department" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Department</label>
                            <div className="relative">
                                <select
                                    id="department"
                                    name="department"
                                    defaultValue={initialData?.department || ""}
                                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.name}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400">
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {selectedDesignation !== "Driver" && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Teaching Subjects</label>
                                <div className="relative">
                                    {/* Trigger Area */}
                                    <div
                                        onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
                                        className="min-h-[3rem] w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition-all cursor-pointer flex flex-wrap gap-2 items-center focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950"
                                    >
                                        {selectedSubjects.length === 0 ? (
                                            <span className="text-zinc-500">Select Subjects...</span>
                                        ) : (
                                            selectedSubjects.map(sub => (
                                                <span key={sub} className="bg-brand/10 text-brand border border-brand/20 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                                    {sub}
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleSubject(sub); }} className="hover:text-blue-900">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))
                                        )}
                                        <div className="ml-auto pointer-events-none text-zinc-400">
                                            <ArrowUpDown className="h-4 w-4" />
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    {isSubjectsOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsSubjectsOpen(false)} />
                                            <div className="absolute z-20 top-full mt-2 w-full rounded-xl border border-zinc-200 bg-white p-2 shadow-xl max-h-60 overflow-y-auto dark:bg-zinc-900 dark:border-zinc-800">
                                                {subjects.map(sub => {
                                                    const isSelected = selectedSubjects.includes(sub.name);
                                                    return (
                                                        <div
                                                            key={sub.id}
                                                            onClick={() => toggleSubject(sub.name)}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors",
                                                                isSelected ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                                            )}
                                                        >
                                                            <div className={cn("h-4 w-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-brand border-brand text-white" : "border-zinc-300 dark:border-zinc-600")}>
                                                                {isSelected && <Check className="h-3 w-3" />}
                                                            </div>
                                                            {sub.name}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {/* Hidden Input for Form Submission */}
                                    <input type="hidden" name="subjects" value={selectedSubjects.join(",")} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="employmentType" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Employment Type</label>
                            <div className="relative">
                                <select
                                    id="employmentType"
                                    name="employmentType"
                                    defaultValue={initialData?.employmentType || ""}
                                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                >
                                    <option value="">Select Type</option>
                                    {employmentTypes.map((type) => (
                                        <option key={type.id} value={type.code}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400">
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date of Joining <span className="text-red-500">*</span></label>
                            <input
                                name="joiningDate"
                                type="date"
                                required
                                defaultValue={formatDate(initialData?.joiningDate)}
                                className={cn(
                                    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                                    "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                    wasSubmitted ? "invalid:border-red-500 invalid:ring-1 invalid:ring-red-500" : "border-zinc-300 dark:border-zinc-700"
                                )}
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Qualifications</label>
                            <input name="qualifications" defaultValue={initialData?.qualifications} placeholder="e.g. B.Ed, MA English" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-3" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Experience Summary</label>
                            <textarea name="experience" defaultValue={initialData?.experience} rows={2} placeholder="Brief summary of past experience..." className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                    </div>
                </div>

                {/* 3. Contact & Address */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Contact & Address</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Residential address and observation contacts.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Street Address</label>
                            <input name="address" defaultValue={initialData?.address} placeholder="123 Main St, Apt 4B" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                        <div className="space-y-1.5" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">City</label>
                            <input name="addressCity" defaultValue={initialData?.addressCity} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                        <div className="space-y-1.5" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">State / Province</label>
                            <input name="addressState" defaultValue={initialData?.addressState} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                        <div className="space-y-1.5" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Zip / Postal Code</label>
                            <input name="addressZip" defaultValue={initialData?.addressZip} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                        <div className="space-y-1.5" suppressHydrationWarning>
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Country</label>
                            <input name="addressCountry" defaultValue={initialData?.addressCountry} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px] space-y-1.5" suppressHydrationWarning>
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                <Linkedin className="h-4 w-4 text-brand" /> LinkedIn Profile
                            </div>
                            <input name="linkedin" defaultValue={initialData?.linkedin} placeholder="https://linkedin.com/in/..." className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                        </div>
                    </div>
                </div>

                {/* 4. Banking & Emergency */}
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Emergency Contact */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100/50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                                <Heart className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Emergency Contact</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Who to call in urgencies.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Contact Name</label>
                                <input name="emergencyContactName" defaultValue={initialData?.emergencyContactName} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Relationship</label>
                                <input name="emergencyContactRelation" defaultValue={initialData?.emergencyContactRelation} placeholder="e.g. Spouse, Father" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Emergency Phone</label>
                                <input
                                    name="emergencyContactPhone"
                                    defaultValue={initialData?.emergencyContactPhone}
                                    type="tel"
                                    maxLength={10}
                                    onInput={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.value = target.value.replace(/\D/g, "").slice(0, 10);
                                    }}
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100/50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Banking Details</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">For salary and payroll processing.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bank Name</label>
                                <input name="bankName" defaultValue={initialData?.bankName} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Account Number</label>
                                <input name="bankAccountNo" defaultValue={initialData?.bankAccountNo} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div className="space-y-1.5" suppressHydrationWarning>
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">IFSC / Sort Code</label>
                                <input name="bankIfsc" defaultValue={initialData?.bankIfsc} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Documents */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Documents</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Upload necessary verification documents.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">CV / Resume</label>
                            <input type="file" name="cv" accept=".pdf,.doc,.docx" className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">ID Proof (Passport/DL)</label>
                            <input type="file" name="idProof" accept="image/*,.pdf" className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Qualifications</label>
                            <input type="file" name="certificate" accept="image/*,.pdf" className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-20 -mx-6 -mb-6 mt-auto border-t border-zinc-200 bg-white/80 p-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-xl bg-brand px-10 py-2.5 text-sm font-bold text-white shadow-xl shadow-brand/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : (staffId ? "Update Staff" : "Add Staff")}
                    </button>
                </div>
            </div>

            {/* Crop Modal */}
            {isCropModalOpen && (avatarPreview || initialData?.avatar) && (
                <div className="fixed inset-0 z-[100] bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Adjust View</h3>
                            <button type="button" onClick={() => setIsCropModalOpen(false)}>
                                <X className="h-6 w-6 text-zinc-400 hover:text-zinc-600 transition-colors" />
                            </button>
                        </div>
                        <div className="relative h-[400px] bg-zinc-50 dark:bg-zinc-950">
                            <Cropper
                                image={avatarPreview || initialData?.avatar}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>
                        <div className="p-8 flex items-center gap-6">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Zoom Level</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brand"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={finalizeAdjustment}
                                className="px-10 py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-brand/20 active:scale-95"
                            >
                                Apply Adjustment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
