"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Briefcase, Mail, Phone, Calendar, FileText, X, User, MapPin, CreditCard, Heart, Linkedin, Twitter, Facebook, Instagram, ArrowUpDown, Check, Shield, DollarSign, Users, IndianRupee, CheckCircle2, ChevronRight, ArrowLeft, ShieldCheck, Camera, Search, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createStaffAction, updateStaffAction, addSalaryRevisionAction } from "@/app/actions/staff-actions";
import { toast } from "sonner";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { AvatarWithAdjustment } from "./AvatarWithAdjustment";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { validateEmail, validatePhone, isEmpty } from "@/lib/validators";



interface AddStaffFormProps {
    schoolSlug?: string;
    onCancel: () => void;
    onSuccess: () => void;
    roles?: any[];
    designations?: any[];
    departments?: any[];
    employmentTypes?: any[];
    bloodGroups?: any[];
    genders?: any[];
    subjects?: any[];
    initialData?: any;
    staffId?: string;
    branches?: any[];
}

export function AddStaffForm({
    schoolSlug,
    onCancel,
    onSuccess,
    roles = [],
    designations = [],
    departments = [],
    employmentTypes = [],
    bloodGroups = [],
    genders = [],
    subjects = [],
    initialData,
    staffId,
    branches = []
}: AddStaffFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Salary state
    const [salaryBasic, setSalaryBasic] = useState("");
    const [salaryHra, setSalaryHra] = useState("");
    const [salaryAllowance, setSalaryAllowance] = useState("");
    const [salaryPf, setSalaryPf] = useState("");
    const [salaryTax, setSalaryTax] = useState("");
    const [salaryInsurance, setSalaryInsurance] = useState("");
    const [salaryEffectiveDate, setSalaryEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
    const [salaryRevisionType, setSalaryRevisionType] = useState("INITIAL");
    const [salaryReason, setSalaryReason] = useState("");
    const [customSalaryAdditions, setCustomSalaryAdditions] = useState<{ id: string; label: string; amount: number }[]>([]);
    const [customSalaryDeductions, setCustomSalaryDeductions] = useState<{ id: string; label: string; amount: number }[]>([]);

    const totalCustomAdd = customSalaryAdditions.reduce((acc, i) => acc + i.amount, 0);
    const totalCustomDed = customSalaryDeductions.reduce((acc, i) => acc + i.amount, 0);
    const salaryGross = (parseFloat(salaryBasic || "0") + parseFloat(salaryHra || "0") + parseFloat(salaryAllowance || "0") + totalCustomAdd);
    const salaryNet = salaryGross - (parseFloat(salaryPf || "0") + parseFloat(salaryTax || "0") + parseFloat(salaryInsurance || "0") + totalCustomDed);

    const addSalaryItem = (type: 'add' | 'ded') => {
        const item = { id: Math.random().toString(36).substr(2, 9), label: '', amount: 0 };
        if (type === 'add') setCustomSalaryAdditions(prev => [...prev, item]);
        else setCustomSalaryDeductions(prev => [...prev, item]);
    };
    const updateSalaryItem = (type: 'add' | 'ded', id: string, field: 'label' | 'amount', val: string) => {
        const setter = type === 'add' ? setCustomSalaryAdditions : setCustomSalaryDeductions;
        setter(prev => prev.map(i => i.id === id ? { ...i, [field]: field === 'amount' ? Number(val) : val } : i));
    };
    const removeSalaryItem = (type: 'add' | 'ded', id: string) => {
        const setter = type === 'add' ? setCustomSalaryAdditions : setCustomSalaryDeductions;
        setter(prev => prev.filter(i => i.id !== id));
    };


    // State for Avatar and Cropping
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null);
    const [avatarAdjustment, setAvatarAdjustment] = useState(initialData?.avatarAdjustment || '{"x":0,"y":0,"zoom":1}');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [selectedRole, setSelectedRole] = useState(initialData?.role || "STAFF");
    const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
        if (initialData?.department) {
            const dept = departments.find(d => d.name === initialData.department);
            return dept?.id || "";
        }
        return "";
    });
    const [selectedDesignation, setSelectedDesignation] = useState(initialData?.designation || "");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
        initialData?.subjects ? initialData.subjects.split(",").map((s: string) => s.trim()) : []
    );
    const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
    const [wasSubmitted, setWasSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    // Controlled phone values for PhoneInput (not native inputs)
    const [mobileValue, setMobileValue] = useState(initialData?.mobile || "");
    const [emergencyPhone, setEmergencyPhone] = useState(initialData?.emergencyContactPhone || "");

    // Filtered Designations based on Department
    const filteredDesignations = designations.filter(d =>
        !selectedDeptId || d.parentId === selectedDeptId
    );

    // Teaching subjects visibility: ONLY for Teachers
    const isTeacher = selectedDesignation.toLowerCase().includes("teacher");

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
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const finalizeAdjustment = () => {
        if (croppedAreaPixels) {
            const adj = JSON.stringify({
                ...croppedAreaPixels,
                zoom
            });
            setAvatarAdjustment(adj);
        }
        setIsCropModalOpen(false);
    };

    const toggleSubject = (subjectName: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectName)
                ? prev.filter(s => s !== subjectName)
                : [...prev, subjectName]
        );
    };

    const formatDate = (date: any) => {
        if (!date) return "";
        try {
            const d = new Date(date);
            return d.toISOString().split('T')[0];
        } catch (e) {
            return "";
        }
    };

    const validateForm = (formData: FormData): boolean => {
        const errors: Record<string, string> = {};
        const req = (name: string) => {
            const v = formData.get(name);
            return !v || String(v).trim() === "";
        };

        // Required fields
        if (req("firstName")) errors.firstName = "Required";
        if (req("lastName")) errors.lastName = "Required";
        if (req("email")) errors.email = "Required";
        if (req("joiningDate")) errors.joiningDate = "Required";
        if (!selectedDesignation) errors.designation = "Required";

        // Mobile (from controlled state)
        if (isEmpty(mobileValue)) errors.mobile = "Required";
        else if (validatePhone(mobileValue)) errors.mobile = validatePhone(mobileValue)!;

        // Email format
        if (!errors.email) {
            const emailErr = validateEmail(String(formData.get("email") || ""));
            if (emailErr) errors.email = emailErr;
        }

        // Emergency phone (optional but must be valid if provided)
        if (!isEmpty(emergencyPhone)) {
            const epErr = validatePhone(emergencyPhone);
            if (epErr) errors.emergencyContactPhone = epErr;
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            const missing = Object.keys(errors).filter(k => errors[k] === "Required")
                .map(k => k.replace(/([A-Z])/g, " $1").trim())
                .map(k => k.charAt(0).toUpperCase() + k.slice(1));
            const invalid = Object.keys(errors).filter(k => errors[k] !== "Required")
                .map(k => `${k.replace(/([A-Z])/g, " $1").trim()}: ${errors[k]}`);
            const msgs = [missing.length ? `Missing: ${missing.join(", ")}` : "", ...invalid].filter(Boolean);
            toast.error(msgs.join(" · "), { duration: 6000 });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWasSubmitted(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        // Inject controlled phone values into FormData
        formData.set("mobile", mobileValue);
        formData.set("emergencyContactPhone", emergencyPhone);

        if (!validateForm(formData)) return;

        setIsLoading(true);

        try {
            let res;
            if (staffId) {
                res = await updateStaffAction(schoolSlug!, staffId, formData);
            } else {
                res = await createStaffAction(schoolSlug!, formData);
            }

            if (res.success) {
                const newStaffId = (res as any).id;
                if (!staffId && newStaffId && salaryGross > 0) {
                    await addSalaryRevisionAction(schoolSlug!, newStaffId, {
                        amount: salaryGross,
                        effectiveDate: salaryEffectiveDate || new Date().toISOString().split("T")[0],
                        reason: salaryReason || "Initial Salary",
                        type: salaryRevisionType,
                        basic: parseFloat(salaryBasic || "0"),
                        hra: parseFloat(salaryHra || "0"),
                        allowance: parseFloat(salaryAllowance || "0"),
                        pf: parseFloat(salaryPf || "0"),
                        tax: parseFloat(salaryTax || "0"),
                        insurance: parseFloat(salaryInsurance || "0"),
                        customAdditions: JSON.stringify(customSalaryAdditions),
                        customDeductions: JSON.stringify(customSalaryDeductions),
                        netSalary: salaryNet,
                    });
                }
                toast.success(staffId ? "Staff updated successfully" : "Staff added successfully");
                setFormErrors({});
                onSuccess();
            } else {
                toast.error(res.error || "Failed to save staff");
            }
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col gap-8 pb-28">
            {/* ... Personal Info ... */}

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
                            <label className={cn("text-sm font-medium", formErrors.firstName ? "text-red-500" : "text-zinc-700 dark:text-zinc-300")}>First Name <span className="text-red-500">*</span></label>
                            <input
                                name="firstName"
                                defaultValue={initialData?.firstName}
                                required
                                data-lpignore="true"
                                autoComplete="off"
                                className={cn(
                                    "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1",
                                    "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                    formErrors.firstName ? "border-red-400 ring-1 ring-red-200" : "border-zinc-300 dark:border-zinc-700"
                                )}
                                onChange={() => setFormErrors(e => ({ ...e, firstName: "" }))}
                            />
                            {formErrors.firstName && <p className="text-xs text-red-500 font-medium">{formErrors.firstName}</p>}
                        </div>
                        <div className="space-y-1.5" suppressHydrationWarning>
                            <label className={cn("text-sm font-medium", formErrors.lastName ? "text-red-500" : "text-zinc-700 dark:text-zinc-300")}>Last Name <span className="text-red-500">*</span></label>
                            <input
                                name="lastName"
                                defaultValue={initialData?.lastName}
                                required
                                data-lpignore="true"
                                autoComplete="off"
                                className={cn(
                                    "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1",
                                    "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                    formErrors.lastName ? "border-red-400 ring-1 ring-red-200" : "border-zinc-300 dark:border-zinc-700"
                                )}
                                onChange={() => setFormErrors(e => ({ ...e, lastName: "" }))}
                            />
                            {formErrors.lastName && <p className="text-xs text-red-500 font-medium">{formErrors.lastName}</p>}
                        </div>

                        <div className="space-y-1.5" suppressHydrationWarning>
                            <label className={cn("text-sm font-medium", formErrors.email ? "text-red-500" : "text-zinc-700 dark:text-zinc-300")}>Email Address <span className="text-red-500">*</span></label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={initialData?.email}
                                required
                                data-lpignore="true"
                                autoComplete="off"
                                className={cn(
                                    "w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1",
                                    "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                    formErrors.email ? "border-red-400 ring-1 ring-red-200" : "border-zinc-300 dark:border-zinc-700"
                                )}
                                onChange={() => setFormErrors(e => ({ ...e, email: "" }))}
                            />
                            {formErrors.email && <p className="text-xs text-red-500 font-medium">{formErrors.email}</p>}
                        </div>
                        <div className="space-y-1.5" suppressHydrationWarning>
                            <PhoneInput
                                label="Phone Number *"
                                value={mobileValue}
                                onChange={(v) => { setMobileValue(v); setFormErrors(e => ({ ...e, mobile: "" })); }}
                                error={formErrors.mobile}
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
                    {/* Account Role Selector */}
                    <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Account Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="role"
                                name="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                            >
                                <option value="STAFF">Staff Member</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400">
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500">
                            Admins have full access to their assigned branch. Staff access is defined by the profile below.
                        </p>
                    </div>

                    {/* Branch Selector (Only if multiple branches exist) */}
                    {branches.length > 0 && (
                        <div className="space-y-2">
                            <label htmlFor="branchId" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Assigned Branch
                            </label>
                            <div className="relative">
                                <select
                                    id="branchId"
                                    name="branchId"
                                    defaultValue={initialData?.branchId || ""}
                                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                >
                                    {/* Only show "All Branches" if creating an Admin (School Admin) */}
                                    <option value="">{selectedRole === "ADMIN" ? "All Branches (School Level)" : "Main Branch (Default)"}</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400">
                                    <MapPin className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Permissions Role (Hidden if Admin?) - Let's keep it but optional for Admin */}
                    {selectedRole === "STAFF" && (
                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="customRoleId" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Access Permissions Profile
                            </label>
                            <div className="relative">
                                <select
                                    id="customRoleId"
                                    name="customRoleId"
                                    defaultValue={initialData?.customRoleId || ""}
                                    className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                >
                                    <option value="">Standard Teacher Access</option>
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
                                Defines specific module access for non-admin staff.
                            </p>
                        </div>
                    )}
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
                        <label htmlFor="department" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Department</label>
                        <div className="relative">
                            <select
                                id="department"
                                name="department"
                                value={departments.find(d => d.id === selectedDeptId)?.name || ""}
                                onChange={(e) => {
                                    const dept = departments.find(d => d.name === e.target.value);
                                    setSelectedDeptId(dept?.id || "");
                                    setSelectedDesignation("");
                                }}
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
                                disabled={!selectedDeptId}
                                className={cn(
                                    "w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-4",
                                    "focus:border-brand focus:ring-brand/10 dark:bg-zinc-950 dark:text-zinc-200",
                                    !selectedDeptId && "cursor-not-allowed opacity-50 bg-zinc-50 dark:bg-zinc-900",
                                    wasSubmitted ? "invalid:border-red-500 invalid:ring-4 invalid:ring-red-500/10" : "border-zinc-200 dark:border-zinc-800"
                                )}
                            >
                                <option value="">{selectedDeptId ? "Select Designation" : "Select Department First"}</option>
                                {filteredDesignations.map((role) => (
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

                    {isTeacher && (
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



                    <div className="space-y-1.5" suppressHydrationWarning>
                        <label className={cn("text-sm font-medium", formErrors.joiningDate ? "text-red-500" : "text-zinc-700 dark:text-zinc-300")}>Date of Joining <span className="text-red-500">*</span></label>
                        <input
                            name="joiningDate"
                            type="date"
                            required
                            defaultValue={formatDate(initialData?.joiningDate)}
                            className={cn(
                                "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                                "focus:border-brand focus:ring-brand dark:bg-zinc-800",
                                formErrors.joiningDate ? "border-red-400 ring-1 ring-red-200" : "border-zinc-300 dark:border-zinc-700"
                            )}
                            onChange={() => setFormErrors(e => ({ ...e, joiningDate: "" }))}
                        />
                        {formErrors.joiningDate && <p className="text-xs text-red-500 font-medium">{formErrors.joiningDate}</p>}
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
                            <PhoneInput
                                label=""
                                value={emergencyPhone}
                                onChange={(v) => { setEmergencyPhone(v); setFormErrors(e => ({ ...e, emergencyContactPhone: "" })); }}
                                error={formErrors.emergencyContactPhone}
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

            {/* 4b. Salary Package */}
            {!staffId && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100/50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Initial Salary Package</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Set starting compensation — earnings, deductions, custom items, and revision details. (Optional)</p>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* ─── EARNINGS ─── */}
                        <div className="space-y-5">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-1.5">
                                <Plus className="h-3.5 w-3.5" /> Earnings
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    { label: 'Basic Pay', val: salaryBasic, set: setSalaryBasic },
                                    { label: 'HRA', val: salaryHra, set: setSalaryHra },
                                    { label: 'Other Allowances', val: salaryAllowance, set: setSalaryAllowance },
                                ].map(f => (
                                    <div key={f.label} className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{f.label}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">₹</span>
                                            <input type="number" min="0" placeholder="0" value={f.val}
                                                onChange={e => f.set(e.target.value)}
                                                className="w-full rounded-xl border border-zinc-200 bg-white pl-7 pr-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Additions */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Additions (Bonus, Incentives…)</span>
                                    <button type="button" onClick={() => addSalaryItem('add')}
                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                {customSalaryAdditions.map(item => (
                                    <div key={item.id} className="flex gap-2">
                                        <input placeholder="Label (e.g. Sales Bonus)" value={item.label}
                                            onChange={e => updateSalaryItem('add', item.id, 'label', e.target.value)}
                                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                        <input type="number" placeholder="₹0" value={item.amount || ''}
                                            onChange={e => updateSalaryItem('add', item.id, 'amount', e.target.value)}
                                            className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                                        <button type="button" onClick={() => removeSalaryItem('add', item.id)}
                                            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── DEDUCTIONS ─── */}
                        <div className="space-y-5">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-1.5">
                                <Minus className="h-3.5 w-3.5" /> Deductions
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    { label: 'Professional Tax', val: salaryTax, set: setSalaryTax },
                                    { label: 'Provident Fund (PF)', val: salaryPf, set: setSalaryPf },
                                    { label: 'Insurance', val: salaryInsurance, set: setSalaryInsurance },
                                ].map(f => (
                                    <div key={f.label} className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{f.label}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">₹</span>
                                            <input type="number" min="0" placeholder="0" value={f.val}
                                                onChange={e => f.set(e.target.value)}
                                                className="w-full rounded-xl border border-zinc-200 bg-white pl-7 pr-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Deductions */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Custom Deductions (LOP, Penalty…)</span>
                                    <button type="button" onClick={() => addSalaryItem('ded')}
                                        className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                {customSalaryDeductions.map(item => (
                                    <div key={item.id} className="flex gap-2">
                                        <input placeholder="Label (e.g. LOP Deduction)" value={item.label}
                                            onChange={e => updateSalaryItem('ded', item.id, 'label', e.target.value)}
                                            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                                        <input type="number" placeholder="₹0" value={item.amount || ''}
                                            onChange={e => updateSalaryItem('ded', item.id, 'amount', e.target.value)}
                                            className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-950" />
                                        <button type="button" onClick={() => removeSalaryItem('ded', item.id)}
                                            className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── REVISION META + CALCULATOR ─── */}
                    <div className="mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid gap-6 lg:grid-cols-3 items-start">
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Effective From</label>
                                <input type="date" value={salaryEffectiveDate}
                                    onChange={e => setSalaryEffectiveDate(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Revision Type</label>
                                <select value={salaryRevisionType} onChange={e => setSalaryRevisionType(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950">
                                    <option value="INITIAL">Initial Hire</option>
                                    <option value="INCREMENT">Increment</option>
                                    <option value="PROMOTION">Promotion</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Reason / Notes</label>
                                <input placeholder="e.g. Joining package per offer letter" value={salaryReason}
                                    onChange={e => setSalaryReason(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10 dark:border-zinc-800 dark:bg-zinc-950" />
                            </div>
                        </div>

                        {/* Live Calculator Card */}
                        <div className="bg-zinc-900 text-white rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-5xl italic pointer-events-none">NET</div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Net Take Home / Month</p>
                                <p className="text-3xl font-black mt-1 italic tracking-tighter text-emerald-400">
                                    ₹{salaryNet.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-[10px] font-bold text-zinc-500">
                                <div className="flex justify-between">
                                    <span>Gross CTC</span>
                                    <span className="text-zinc-300">₹{salaryGross.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Deductions</span>
                                    <span className="text-rose-400">-₹{(parseFloat(salaryPf || '0') + parseFloat(salaryTax || '0') + parseFloat(salaryInsurance || '0') + totalCustomDed).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Custom Add-ons</span>
                                    <span className="text-emerald-400">+₹{totalCustomAdd.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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



            {/* Sticky Footer — fixed to viewport bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 shadow-2xl">
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
            {
                isCropModalOpen && (avatarPreview || initialData?.avatar) && (
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
                )
            }
        </form >
    );
}
