"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import {
    ArrowLeft,
    User,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Target,
    FileText,
    Loader2,
    CheckCircle2,
    Search,
    Copy,
    Building2,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createInquiryAction, checkParentByPhoneAction } from "@/app/actions/admission-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";

export default function NewInquiryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [grades, setGrades] = useState<any[]>([]);
    const [isLoadingGrades, setIsLoadingGrades] = useState(true);
    const [formData, setFormData] = useState({
        studentName: "",
        studentAge: "",
        studentGender: "MALE",
        dateOfBirth: "",
        parentName: "",
        parentPhone: "",
        fatherName: "",
        fatherPhone: "",
        fatherEmail: "",
        fatherOccupation: "",
        motherName: "",
        motherPhone: "",
        motherEmail: "",
        motherOccupation: "",
        address: "",
        city: "",
        stateId: "", // Track the master data ID for state
        state: "",   // The name of the state
        countryId: "", // Track the master data ID for country
        country: "",   // The name of the country
        zip: "",
        priority: "MEDIUM",
        enrolledGrade: "",
        source: "WALK_IN",
        notes: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const admissionSchema = z.object({
        studentName: z.string().min(2, "Student name must be at least 2 characters"),
        studentGender: z.enum(["MALE", "FEMALE", "OTHER"]),
        dateOfBirth: z.string().min(1, "Date of birth is required"),
        enrolledGrade: z.string().min(1, "Please select an enrollment grade"),
        fatherName: z.string().optional(),
        fatherPhone: z.string().optional().refine(v => !v || /^\d{10}$/.test(v), "Phone must be 10 digits"),
        fatherEmail: z.string().optional().refine(v => !v || z.string().email().safeParse(v).success, "Invalid email address"),
        motherName: z.string().optional(),
        motherPhone: z.string().optional().refine(v => !v || /^\d{10}$/.test(v), "Phone must be 10 digits"),
        motherEmail: z.string().optional().refine(v => !v || z.string().email().safeParse(v).success, "Invalid email address"),
        address: z.string().min(5, "Address must be at least 5 characters"),
        countryId: z.string().min(1, "Please select a country"),
        stateId: z.string().min(1, "Please select a state"),
        city: z.string().min(1, "Please select a city"),
        zip: z.string().regex(/^\d{6}$/, "Zip code must be exactly 6 digits"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
        source: z.string().min(1, "Please select a source")
    }).refine(data => {
        // Ensure at least one parent name is provided
        return data.fatherName || data.motherName;
    }, {
        message: "At least one parent name (Father or Mother) is required",
        path: ["fatherName"]
    }).refine(data => {
        // Ensure at least one parent phone is provided
        return data.fatherPhone || data.motherPhone;
    }, {
        message: "At least one parent phone number is required",
        path: ["fatherPhone"]
    }).refine(data => {
        // Ensure at least one parent email is provided
        return data.fatherEmail || data.motherEmail;
    }, {
        message: "At least one parent email address is required",
        path: ["fatherEmail"]
    });

    const [masterCountries, setMasterCountries] = useState<any[]>([]);
    const [masterStates, setMasterStates] = useState<any[]>([]);
    const [masterCities, setMasterCities] = useState<any[]>([]);
    const [isLoadingGeography, setIsLoadingGeography] = useState({
        countries: false,
        states: false,
        cities: false
    });

    useEffect(() => {
        if (mounted) {
            fetchGrades();
            fetchCountries();
        }
    }, [mounted]);

    const fetchCountries = async () => {
        setIsLoadingGeography(prev => ({ ...prev, countries: true }));
        const res = await getMasterDataAction("COUNTRY", null);
        if (res.success) setMasterCountries(res.data || []);
        setIsLoadingGeography(prev => ({ ...prev, countries: false }));
    };

    const fetchStates = async (countryId: string) => {
        setIsLoadingGeography(prev => ({ ...prev, states: true }));
        const res = await getMasterDataAction("STATE", countryId);
        if (res.success) setMasterStates(res.data || []);
        setIsLoadingGeography(prev => ({ ...prev, states: false }));
    };

    const fetchCities = async (stateId: string) => {
        setIsLoadingGeography(prev => ({ ...prev, cities: true }));
        const res = await getMasterDataAction("CITY", stateId);
        if (res.success) setMasterCities(res.data || []);
        setIsLoadingGeography(prev => ({ ...prev, cities: false }));
    };

    const handleCountryChange = (id: string) => {
        const country = masterCountries.find(c => c.id === id);
        setFormData({
            ...formData,
            countryId: id,
            country: country?.name || "",
            stateId: "",
            state: "",
            city: ""
        });
        if (id) fetchStates(id);
        else setMasterStates([]);
        setMasterCities([]);
    };

    const handleStateChange = (id: string) => {
        const state = masterStates.find(s => s.id === id);
        setFormData({
            ...formData,
            stateId: id,
            state: state?.name || "",
            city: ""
        });
        if (id) fetchCities(id);
        else setMasterCities([]);
    };

    const fetchGrades = async () => {
        setIsLoadingGrades(true);
        const res = await getMasterDataAction("GRADE", null);
        if (res.success) {
            setGrades(res.data || []);
        }
        setIsLoadingGrades(false);
    };

    const calculateAge = (dob: string) => {
        if (!dob) return "";
        const birthDate = new Date(dob);
        const today = new Date();

        // Target: Coming March 31st
        let targetYear = today.getFullYear();
        const thisYearCutoff = new Date(targetYear, 2, 31); // March 31st of current year

        // If today is after March 31st, the 'coming' one is next year
        if (today > thisYearCutoff) {
            targetYear++;
        }

        const targetDate = new Date(targetYear, 2, 31);

        let years = targetDate.getFullYear() - birthDate.getFullYear();
        let months = targetDate.getMonth() - birthDate.getMonth();

        // Basic month adjustment
        if (months < 0) {
            years--;
            months += 12;
        }

        // Day of month adjustment for exact "completed months"
        if (targetDate.getDate() < birthDate.getDate()) {
            months--;
            if (months < 0) {
                years--;
                months += 12;
            }
        }

        return `${years} Years ${months} Months`;
    };

    const handleDOBChange = (dob: string) => {
        const age = calculateAge(dob);
        setFormData({ ...formData, dateOfBirth: dob, studentAge: age });
    };

    const [siblingCheckPhone, setSiblingCheckPhone] = useState("");
    const [foundSiblingParent, setFoundSiblingParent] = useState<any>(null);
    const [isCheckingSibling, setIsCheckingSibling] = useState(false);

    const performSiblingCheck = async () => {
        if (!siblingCheckPhone || siblingCheckPhone.length < 5) {
            alert("Please enter a valid phone number");
            return;
        }
        setIsCheckingSibling(true);
        setFoundSiblingParent(null);

        const res = await checkParentByPhoneAction(slug, siblingCheckPhone);

        setIsCheckingSibling(false);
        if (res.success && res.parent) {
            setFoundSiblingParent(res.parent);
        } else {
            alert("No existing parent record found.");
        }
    };

    const applySiblingData = async (role: 'father' | 'mother') => {
        if (!foundSiblingParent) return;

        // Base Data Update
        let updates: any = {
            // Father
            fatherName: foundSiblingParent.fatherName || foundSiblingParent.parentName || formData.fatherName,
            fatherPhone: foundSiblingParent.fatherPhone || foundSiblingParent.parentMobile || formData.fatherPhone,
            fatherEmail: foundSiblingParent.fatherEmail || foundSiblingParent.parentEmail || formData.fatherEmail,
            fatherOccupation: foundSiblingParent.fatherOccupation || formData.fatherOccupation,

            // Mother
            motherName: foundSiblingParent.motherName || formData.motherName,
            motherPhone: foundSiblingParent.motherPhone || formData.motherPhone,
            motherEmail: foundSiblingParent.motherEmail || formData.motherEmail,
            motherOccupation: foundSiblingParent.motherOccupation || formData.motherOccupation,

            // Address Basics
            address: foundSiblingParent.address || formData.address,
            zip: foundSiblingParent.zip || formData.zip,

            notes: (formData.notes || "") + `\n[System]: Sibling of ${foundSiblingParent.childName || "Student"}`
        };

        // Advanced Address Logic (Country -> State -> City)
        // We match Names to IDs to make dropdowns work
        if (foundSiblingParent.country && masterCountries.length > 0) {
            const countryObj = masterCountries.find(c => c.name.toLowerCase() === foundSiblingParent.country.toLowerCase());
            if (countryObj) {
                updates.countryId = countryObj.id;
                updates.country = countryObj.name;

                // Fetch States
                const statesRes = await getMasterDataAction("STATE", countryObj.id);
                if (statesRes.success) {
                    setMasterStates(statesRes.data);

                    if (foundSiblingParent.state) {
                        const stateObj = (statesRes.data as any[]).find(s => s.name.toLowerCase() === foundSiblingParent.state.toLowerCase());
                        if (stateObj) {
                            updates.stateId = stateObj.id;
                            updates.state = stateObj.name;

                            // Fetch Cities
                            const citiesRes = await getMasterDataAction("CITY", stateObj.id);
                            if (citiesRes.success) {
                                setMasterCities(citiesRes.data);

                                if (foundSiblingParent.city) {
                                    const cityObj = (citiesRes.data as any[]).find(c => c.name.toLowerCase() === foundSiblingParent.city.toLowerCase());
                                    if (cityObj) {
                                        updates.city = cityObj.name; // Only city name, not cityId as per formData structure
                                    } else {
                                        updates.city = foundSiblingParent.city; // Fallback
                                    }
                                }
                            }
                        } else {
                            updates.state = foundSiblingParent.state; // Fallback
                        }
                    }
                }
            } else {
                updates.country = foundSiblingParent.country; // Fallback
            }
        }

        setFormData(prev => ({ ...prev, ...updates }));
        setFoundSiblingParent(null);
        setSiblingCheckPhone("");
        alert("Parent & Address details auto-filled from sibling record.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const validation = admissionSchema.safeParse(formData);
        if (!validation.success) {
            const newErrors: Record<string, string> = {};
            validation.error.issues.forEach(err => {
                if (err.path[0]) {
                    newErrors[err.path[0].toString()] = err.message;
                }
            });
            setErrors(newErrors);
            // Focus on first error (simple scroll)
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.getElementsByName(firstErrorField)[0];
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsSaving(true);

        const { stateId, countryId, ...cleanData } = formData;

        const submissionData = {
            ...cleanData,
            studentAge: formData.studentAge ? (formData.studentAge.includes("Years") ? parseInt(formData.studentAge) : null) : null,
            parentName: formData.parentName || formData.fatherName || formData.motherName || "Unnamed Parent"
        };

        const res = await createInquiryAction(slug, submissionData);

        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push(`/s/${slug}/admissions`);
            }, 2000);
        } else {
            alert(res.error || "Failed to create inquiry");
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    if (success) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-brand rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-brand/20">
                        <CheckCircle2 className="h-12 w-12 text-[var(--secondary-color)]" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-zinc-900">Inquiry Registered</h2>
                        <p className="text-zinc-500 font-medium mt-2">The record has been added to the pipeline.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push(`/s/${slug}/admissions`)}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <div className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-zinc-900 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm">Back to Pipeline</span>
                </button>

                <div className="text-right">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Inquiry Intake</h1>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1">Detailed Registration</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Student Section */}
                    <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={User} title="Student Information" />
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <InputField
                                name="studentName"
                                label="Full Legal Name"
                                value={formData.studentName}
                                error={errors.studentName}
                                onChange={(v: any) => setFormData({ ...formData, studentName: v })}
                            />
                            <div className="space-y-2" id="studentGender">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Gender</label>
                                <div className={cn(
                                    "flex p-1 bg-zinc-50 rounded-2xl",
                                    errors.studentGender && "ring-2 ring-red-500"
                                )}>
                                    {["MALE", "FEMALE", "OTHER"].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, studentGender: g })}
                                            className={cn(
                                                "flex-1 py-3 text-[10px] font-black rounded-xl transition-all",
                                                formData.studentGender === g ? "bg-brand text-[var(--secondary-color)] shadow-sm" : "text-zinc-400"
                                            )}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                {errors.studentGender && <p className="text-[10px] text-red-500 font-bold px-1">{errors.studentGender}</p>}
                            </div>
                            <InputField
                                name="dateOfBirth"
                                label="Date of Birth"
                                value={formData.dateOfBirth}
                                type="date"
                                error={errors.dateOfBirth}
                                onChange={(v: any) => handleDOBChange(v)}
                            />
                            <InputField
                                label="Calculated Age"
                                value={formData.studentAge}
                                readOnly={true}
                                placeholder="Select DOB"
                                hint="Age as of coming March 31st"
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Grade for Enrollment</label>
                                <select
                                    name="enrolledGrade"
                                    value={formData.enrolledGrade}
                                    onChange={e => setFormData({ ...formData, enrolledGrade: e.target.value })}
                                    className={cn(
                                        "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold appearance-none focus:ring-2 focus:ring-brand transition-all",
                                        errors.enrolledGrade && "ring-2 ring-red-500"
                                    )}
                                >
                                    <option value="">{isLoadingGrades ? "Loading Grades..." : "Select Grade"}</option>
                                    {grades.map(grade => (
                                        <option key={grade.id} value={grade.name}>
                                            {grade.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.enrolledGrade && <p className="text-[10px] text-red-500 font-bold px-1">{errors.enrolledGrade}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Parents Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Users} title="Father's Details" />
                            <div className="space-y-6 mt-8">
                                <InputField name="fatherName" label="Name" error={errors.fatherName} value={formData.fatherName} onChange={(v: any) => setFormData({ ...formData, fatherName: v })} />
                                <InputField
                                    name="fatherPhone"
                                    label="Phone"
                                    error={errors.fatherPhone}
                                    value={formData.fatherPhone}
                                    maxLength={10}
                                    onChange={(v: any) => {
                                        const val = v.replace(/\D/g, "").slice(0, 10);
                                        setFormData({ ...formData, fatherPhone: val });
                                    }}
                                />
                                <InputField name="fatherEmail" label="Email" error={errors.fatherEmail} value={formData.fatherEmail} onChange={(v: any) => setFormData({ ...formData, fatherEmail: v })} />
                                <InputField name="fatherOccupation" label="Occupation" value={formData.fatherOccupation} onChange={(v: any) => setFormData({ ...formData, fatherOccupation: v })} />
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Users} title="Mother's Details" />
                            <div className="space-y-6 mt-8">
                                <InputField name="motherName" label="Name" error={errors.motherName} value={formData.motherName} onChange={(v: any) => setFormData({ ...formData, motherName: v })} />
                                <InputField
                                    name="motherPhone"
                                    label="Phone"
                                    error={errors.motherPhone}
                                    value={formData.motherPhone}
                                    maxLength={10}
                                    onChange={(v: any) => {
                                        const val = v.replace(/\D/g, "").slice(0, 10);
                                        setFormData({ ...formData, motherPhone: val });
                                    }}
                                />
                                <InputField name="motherEmail" label="Email" error={errors.motherEmail} value={formData.motherEmail} onChange={(v: any) => setFormData({ ...formData, motherEmail: v })} />
                                <InputField name="motherOccupation" label="Occupation" value={formData.motherOccupation} onChange={(v: any) => setFormData({ ...formData, motherOccupation: v })} />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={MapPin} title="Address" />
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="md:col-span-2">
                                <InputField
                                    name="address"
                                    label="Street Address"
                                    value={formData.address}
                                    error={errors.address}
                                    onChange={(v: any) => setFormData({ ...formData, address: v })}
                                />
                            </div>

                            {/* Country Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Country</label>
                                <select
                                    name="countryId"
                                    value={formData.countryId}
                                    onChange={e => handleCountryChange(e.target.value)}
                                    className={cn(
                                        "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold appearance-none focus:ring-2 focus:ring-brand transition-all",
                                        errors.countryId && "ring-2 ring-red-500"
                                    )}
                                >
                                    <option value="">{isLoadingGeography.countries ? "Loading..." : "Select Country"}</option>
                                    {masterCountries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.countryId && <p className="text-[10px] text-red-500 font-bold px-1">{errors.countryId}</p>}
                            </div>

                            {/* State Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">State / Province</label>
                                <select
                                    name="stateId"
                                    disabled={!formData.countryId}
                                    value={formData.stateId}
                                    onChange={e => handleStateChange(e.target.value)}
                                    className={cn(
                                        "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold appearance-none focus:ring-2 focus:ring-brand transition-all disabled:opacity-50",
                                        errors.stateId && "ring-2 ring-red-500"
                                    )}
                                >
                                    <option value="">{isLoadingGeography.states ? "Loading..." : "Select State"}</option>
                                    {masterStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {errors.stateId && <p className="text-[10px] text-red-500 font-bold px-1">{errors.stateId}</p>}
                            </div>

                            {/* City Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">City</label>
                                <select
                                    name="city"
                                    disabled={!formData.stateId}
                                    value={formData.city} // We store city name in formData.city
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className={cn(
                                        "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold appearance-none focus:ring-2 focus:ring-brand transition-all disabled:opacity-50",
                                        errors.city && "ring-2 ring-red-500"
                                    )}
                                >
                                    <option value="">{isLoadingGeography.cities ? "Loading..." : "Select City"}</option>
                                    {masterCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                {errors.city && <p className="text-[10px] text-red-500 font-bold px-1">{errors.city}</p>}
                            </div>

                            <InputField
                                name="zip"
                                label="Zip Code"
                                value={formData.zip}
                                error={errors.zip}
                                onChange={(v: any) => setFormData({ ...formData, zip: v })}
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {/* Sibling Check Widget */}
                    <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={Users} title="Sibling Check" />
                        <p className="text-[10px] text-zinc-400 font-medium mt-2 mb-4 leading-relaxed">
                            Search for an existing parent to link a sibling and autofill details.
                        </p>

                        <div className="flex gap-2 mb-4">
                            <input
                                value={siblingCheckPhone}
                                onChange={(e) => setSiblingCheckPhone(e.target.value)}
                                placeholder="Parent Phone..."
                                className="flex-1 bg-zinc-50 border-0 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-brand outline-none"
                            />
                            <button
                                type="button"
                                onClick={performSiblingCheck}
                                disabled={isCheckingSibling}
                                className="bg-brand text-[var(--secondary-color)] rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                {isCheckingSibling ? "..." : "Check"}
                            </button>
                        </div>

                        {foundSiblingParent && (
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="h-12 w-12 bg-green-200 rounded-2xl flex items-center justify-center text-green-800 font-black shrink-0 shadow-sm border border-green-300/50 mt-1">
                                        {(foundSiblingParent.parentName?.[0] || "P")}
                                    </div>
                                    <div className="space-y-1.5 w-full">
                                        {foundSiblingParent.fatherName && (
                                            <div className="flex items-baseline gap-3">
                                                <span className="w-12 text-[9px] font-black uppercase text-green-600/60 tracking-widest text-right shrink-0">Father</span>
                                                <span className="text-sm font-black text-green-950 truncate">{foundSiblingParent.fatherName}</span>
                                            </div>
                                        )}
                                        {foundSiblingParent.motherName && (
                                            <div className="flex items-baseline gap-3">
                                                <span className="w-12 text-[9px] font-black uppercase text-green-600/60 tracking-widest text-right shrink-0">Mother</span>
                                                <span className="text-sm font-black text-green-950 truncate">{foundSiblingParent.motherName}</span>
                                            </div>
                                        )}
                                        {!foundSiblingParent.fatherName && !foundSiblingParent.motherName && (
                                            <div className="flex items-baseline gap-3">
                                                <span className="w-12 text-[9px] font-black uppercase text-green-600/60 tracking-widest text-right shrink-0">Parent</span>
                                                <span className="text-sm font-black text-green-950 truncate">{foundSiblingParent.parentName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-baseline gap-3">
                                            <span className="w-12 text-[9px] font-black uppercase text-green-600/60 tracking-widest text-right shrink-0">Sibling</span>
                                            <span className="text-sm font-black text-green-950 truncate">{foundSiblingParent.childName || `${foundSiblingParent.firstName || ""} ${foundSiblingParent.lastName || ""}`}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => applySiblingData('father')}
                                    className="col-span-2 w-full bg-brand text-[var(--secondary-color)] py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    Auto Fill Parent Details
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20 sticky top-8">
                        <SectionTitle icon={Target} title="Pipeline Priority" />
                        <div className="grid grid-cols-3 gap-2 mt-6">
                            {["LOW", "MEDIUM", "HIGH"].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={cn(
                                        "py-3 text-[10px] font-black rounded-xl transition-all border-2",
                                        formData.priority === p ? "bg-brand border-brand text-[var(--secondary-color)] shadow-lg shadow-brand/20" : "bg-zinc-50 border-zinc-50 text-zinc-400"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="mt-10">
                            <SectionTitle icon={Building2} title="Inquiry Source" />
                            <select
                                name="source"
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                                className={cn(
                                    "w-full mt-4 bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm appearance-none",
                                    errors.source && "ring-2 ring-red-500"
                                )}
                            >
                                <option value="WALK_IN">Walk-in</option>
                                <option value="SOCIAL_MEDIA">Social Media</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="ADVERTISEMENT">Advertisement</option>
                            </select>
                            {errors.source && <p className="text-[10px] text-red-500 font-bold px-1 mt-1">{errors.source}</p>}
                        </div>

                        <div className="mt-10">
                            <SectionTitle icon={FileText} title="Initial Notes" />
                            <textarea
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full mt-4 bg-zinc-50 border-0 rounded-2xl p-6 text-sm font-bold min-h-[150px] resize-none focus:ring-2 focus:ring-brand outline-none"
                                placeholder="Internal observations..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full mt-10 h-16 bg-brand text-[var(--secondary-color)] rounded-[24px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-brand/30 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                            Register Inquiry
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function SectionTitle({ icon: Icon, title }: any) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand/10 rounded-lg flex items-center justify-center">
                <Icon className="h-4 w-4 text-brand" />
            </div>
            <h3 className="text-zinc-900 font-black text-xs uppercase tracking-widest">{title}</h3>
        </div>
    );
}

function InputField({ label, value, readOnly, type = "text", onChange, hint, action, error, name, ...props }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
                {hint && <span className="text-[9px] font-bold text-brand uppercase tracking-tighter">{hint}</span>}
            </div>
            <div className="relative">
                <input
                    {...props}
                    name={name}
                    type={type}
                    value={value || ""}
                    readOnly={readOnly}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={cn(
                        "w-full h-14 px-6 rounded-2xl text-sm font-bold border-0 focus:ring-2 focus:ring-brand outline-none transition-all",
                        readOnly ? "bg-zinc-50 text-zinc-500 shadow-inner" : "bg-white border-2 border-zinc-100 text-zinc-900 shadow-sm",
                        error ? "border-red-500 ring-2 ring-red-500/10" : "border-zinc-100",
                        action && "pr-24"
                    )}
                />
                {action && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {action}
                    </div>
                )}
            </div>
            {error && <p className="text-[10px] text-red-500 font-bold px-1">{error}</p>}
        </div>
    );
}
