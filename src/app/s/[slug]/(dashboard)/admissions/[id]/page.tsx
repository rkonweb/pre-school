"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    User,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Target,
    ShieldCheck,
    TrendingUp,
    Heart,
    PhoneCall,
    History,
    FileUp,
    FileText,
    Loader2,
    CheckCircle2,
    Building2,
    Briefcase,
    Edit3,
    Eye,
    Copy,
    ExternalLink,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getAdmissionAction,
    updateAdmissionAction,
    initiateAdmissionAction,
    approveAdmissionAction,
    uploadDocumentAction,
    removeDocumentAction,
    getSiblingsAction
} from "@/app/actions/admission-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";

export default function AdmissionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const id = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [formData, setFormData] = useState<any>(null);
    const [grades, setGrades] = useState<any[]>([]);
    const [filteredSections, setFilteredSections] = useState<any[]>([]); // For Dropdown (Master Data Sections)
    const [allClassrooms, setAllClassrooms] = useState<any[]>([]); // For Lookup (Classroom Entities)
    const [selectedGrade, setSelectedGrade] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    // Address Master Data
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [siblings, setSiblings] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        loadData();
        fetchInitialData();
    }, [id]);

    // SECTION FIlTERING
    useEffect(() => {
        if (!selectedGrade || grades.length === 0) {
            setFilteredSections([]);
            return;
        }

        const gradeObj = grades.find(g => g.name === selectedGrade);
        if (gradeObj) {
            // Fetch Sections (Master Data) linked to this Grade
            getMasterDataAction("SECTION", gradeObj.id).then((res: any) => {
                if (res.success) {
                    setFilteredSections(res.data);
                } else {
                    setFilteredSections([]);
                }
            });
        }
    }, [selectedGrade, grades]);


    // Cascading Effects
    useEffect(() => {
        if (!formData?.country) {
            setStates([]);
            return;
        }
        const selectedCountry = countries.find(c => c.name === formData.country);
        if (selectedCountry) {
            getMasterDataAction("STATE", selectedCountry.id).then(res => {
                if (res.success) setStates((res as any).data);
            });
        }
    }, [formData?.country, countries]);

    useEffect(() => {
        if (!formData?.state) {
            setCities([]);
            return;
        }
        const selectedState = states.find(s => s.name === formData.state);
        if (selectedState) {
            getMasterDataAction("CITY", selectedState.id).then(res => {
                if (res.success) setCities((res as any).data);
            });
        }
    }, [formData?.state, states]);

    const fetchInitialData = async () => {
        const [gradesRes, classroomsRes, countriesRes] = await Promise.all([
            getMasterDataAction("GRADE", null),
            getClassroomsAction(slug),
            getMasterDataAction("COUNTRY", null)
        ]);
        if (gradesRes.success && Array.isArray((gradesRes as any).data)) {
            setGrades((gradesRes as any).data);
        }
        setAllClassrooms((classroomsRes as any).success ? (classroomsRes as any).data : []);
        // Note: We don't set 'sections' here anymore, as it's dependent on Grade

        if (countriesRes.success) setCountries((countriesRes as any).data);
    };

    async function loadData() {
        setIsLoading(true);
        const res = await getAdmissionAction(id);
        if (res.success && res.admission) {
            const data = res.admission;
            if (data.dateOfBirth) {
                try {
                    data.dateOfBirth = new Date(data.dateOfBirth).toISOString().split('T')[0];
                } catch (e) {
                    console.error("Date parse error", e);
                }
            }
            setFormData(data);
            setSelectedGrade(res.admission.enrolledGrade || "");

            // Fetch Siblings
            const pPhone = data.parentPhone || data.fatherPhone || data.motherPhone;
            if (pPhone) {
                getSiblingsAction(slug, pPhone, id).then(sRes => {
                    if (sRes.success) setSiblings(sRes.siblings || []);
                });
            }
        } else {
            alert(res.error || "Failed to load record");
            router.push(`/s/${slug}/admissions`);
        }
        setIsLoading(false);
    }

    const calculateAge = (dob: string) => {
        if (!dob) return "";
        const birthDate = new Date(dob);
        const today = new Date();

        let targetYear = today.getFullYear();
        const thisYearCutoff = new Date(targetYear, 2, 31);
        if (today > thisYearCutoff) targetYear++;

        const targetDate = new Date(targetYear, 2, 31);

        let years = targetDate.getFullYear() - birthDate.getFullYear();
        let months = targetDate.getMonth() - birthDate.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        if (targetDate.getDate() < birthDate.getDate()) {
            months--;
            if (months < 0) {
                years--;
                months += 12;
            }
        }

        return `${years} Years ${months} Months`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const submissionData = {
            ...formData,
            studentAge: formData.studentAge ? parseInt(formData.studentAge.toString()) : null,
        };

        const res = await updateAdmissionAction(slug, id, submissionData);

        if (res.success) {
            toast.success("Record updated successfully");
            setMode("view");
            loadData();
        } else {
            toast.error(res.error || "Update failed");
        }
        setIsSaving(false);
    };

    const handleInitiateAdmission = async () => {
        if (!confirm("This will upgrade the inquiry to an Admission Process. An email will be simulated to the parent. Continue?")) return;

        setIsSaving(true);
        const res = await initiateAdmissionAction(slug, id);
        if (res.success) {
            const link = `${window.location.origin}/admission-portal/${res.token}`;

            // Optimistic Update to show Green Box immediately
            setFormData((prev: any) => ({
                ...prev,
                stage: "APPLICATION",
                accessToken: res.token
            }));

            // Try to auto-copy
            navigator.clipboard.writeText(link).catch(() => { });

            toast.success("Admission Initiated & Link Copied", {
                description: link,
                duration: 10000,
                action: {
                    label: "Copy Again",
                    onClick: () => navigator.clipboard.writeText(link)
                }
            });

            // loadData(); // Removed to prevent stale cache indicating INQUIRY stage
        } else {
            toast.error(res.error || "Failed to initiate");
        }
        setIsSaving(false);
    };

    // Helper for fuzzy matching
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    const findMatchingClassroom = (grade: string, section: string, classrooms: any[]) => {
        if (!grade || !section) return null;
        const targetSlug = normalize(`${grade}${section}`);

        return classrooms.find(c => {
            const classSlug = normalize(c.name);
            return classSlug === targetSlug || (classSlug.includes(normalize(grade)) && classSlug.endsWith(normalize(section)));
        });
    };

    const handleApproveAdmission = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!selectedGrade || !selectedSection) {
            alert("Please select both Grade and Section for enrollment.");
            return;
        }

        if (allClassrooms.length === 0) {
            alert("Setup Required: No classrooms found. Please go to Classroom Registry to create them.");
            return;
        }

        const matchingClass = findMatchingClassroom(selectedGrade, selectedSection, allClassrooms);
        const targetName = `${selectedGrade} - ${selectedSection}`;

        if (!matchingClass) {
            alert(`Classroom "${targetName}" not found. Create it in Registry first.`);
            return;
        }

        if (!confirm("Confirm Approval? This will create a Formal Student Record.")) return;

        setIsSaving(true);
        try {
            const res = await approveAdmissionAction(slug, id, matchingClass.id, selectedGrade);
            if (res.success) {
                toast.success("Success! Student Enrolled.");
                alert("Student Enrolled Successfully!"); // Force feedback
                loadData();
            } else {
                console.error("Approval Response Error:", res.error);
                alert(`Approval Failed: ${res.error}`);
            }
        } catch (err: any) {
            console.error("Unexpected Approval Error:", err);
            alert(`Unexpected Error: ${err.message || err}`);
        }
        setIsSaving(false);
    };

    const handleUploadDoc = (key: string) => {
        setActiveDocKey(key);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeDocKey) return;

        // Validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Format not supported. Please upload JPG, PNG, WEBP or PDF.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Max size is 5MB.");
            return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading(`Uploading ${file.name}...`);

        try {
            // 1. Convert to Base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            const base64 = await base64Promise;

            // 2. Upload to GCS via API
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: base64,
                    fileName: file.name,
                    contentType: file.type,
                    folder: 'admissions'
                })
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

            // 3. Update Admission Record
            const res = await uploadDocumentAction(slug, id, activeDocKey, uploadData.url);

            if (res.success) {
                toast.success("Document uploaded successfully", { id: loadingToast });
                loadData();
            } else {
                throw new Error(res.error || "Failed to link document");
            }
        } catch (error: any) {
            console.error("Upload Error:", error);
            toast.error(error.message || "Upload failed", { id: loadingToast });
        } finally {
            setIsSaving(false);
            setActiveDocKey(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveDoc = async (key: string) => {
        if (!confirm("Are you sure you want to remove this document?")) return;

        setIsSaving(true);
        const res = await removeDocumentAction(slug, id, key);
        if (res.success) {
            toast.success("Document removed");
            loadData();
        } else {
            toast.error(res.error || "Removal failed");
        }
        setIsSaving(false);
    };

    if (!mounted || isLoading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (!formData) return null;

    const isReadOnly = mode === "view";

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

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900">{formData.studentName}</h1>
                        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-1">Applicant Profile</p>
                    </div>
                    {mode === "view" ? (
                        <button
                            onClick={() => setMode("edit")}
                            className="bg-blue-600 text-white hover:bg-blue-700 h-12 px-6 rounded-2xl font-black text-sm flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-zinc-200"
                        >
                            <Edit3 className="h-4 w-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={() => setMode("view")}
                            className="bg-zinc-100 text-zinc-500 h-12 px-6 rounded-2xl font-black text-sm active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Student Section */}
                    <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={User} title="Student Information" />
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <InputField label="Full Legal Name" value={formData.studentName} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, studentName: v })} />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Gender</label>
                                <div className="flex p-1 bg-zinc-50 rounded-2xl">
                                    {["MALE", "FEMALE", "OTHER"].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            disabled={isReadOnly}
                                            onClick={() => setFormData({ ...formData, studentGender: g })}
                                            className={cn(
                                                "flex-1 py-3 text-[10px] font-black rounded-xl transition-all",
                                                formData.studentGender === g ? "bg-white text-brand shadow-sm" : "text-zinc-400"
                                            )}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <InputField
                                label="Date of Birth"
                                value={formData.dateOfBirth}
                                type="date"
                                readOnly={isReadOnly}
                                onChange={(v: any) => setFormData({ ...formData, dateOfBirth: v, studentAge: calculateAge(v) })}
                            />
                            <InputField label="Calculated Age" value={formData.studentAge} readOnly={true} />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Grade for Enrollment</label>
                                <select
                                    disabled={isReadOnly}
                                    value={formData.enrolledGrade || ""}
                                    onChange={e => setFormData({ ...formData, enrolledGrade: e.target.value })}
                                    className={cn(
                                        "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold appearance-none focus:ring-2 focus:ring-brand transition-all",
                                        isReadOnly ? "text-zinc-500 cursor-not-allowed" : "text-zinc-900"
                                    )}
                                >
                                    <option value="">Select Grade</option>
                                    {grades.map(g => (
                                        <option key={g.id} value={g.name}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Parents Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Users} title="Father's Details" />
                            <div className="space-y-6 mt-8">
                                <InputField label="Name" value={formData.fatherName} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, fatherName: v })} />
                                <InputField label="Phone" value={formData.fatherPhone} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, fatherPhone: v })} />
                                <InputField label="Email" value={formData.fatherEmail} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, fatherEmail: v })} />
                                <InputField label="Occupation" value={formData.fatherOccupation} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, fatherOccupation: v })} />
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Users} title="Mother's Details" />
                            <div className="space-y-6 mt-8">
                                <InputField label="Name" value={formData.motherName} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, motherName: v })} />
                                <InputField label="Phone" value={formData.motherPhone} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, motherPhone: v })} />
                                <InputField label="Email" value={formData.motherEmail} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, motherEmail: v })} />
                                <InputField label="Occupation" value={formData.motherOccupation} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, motherOccupation: v })} />
                            </div>
                        </div>
                    </div>



                    {/* Address Section */}
                    <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={MapPin} title="Address" />
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="md:col-span-2">
                                <InputField label="Street Address" value={formData.address} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, address: v })} />
                            </div>

                            <SelectField
                                label="Country"
                                value={formData.country}
                                options={countries}
                                readOnly={isReadOnly}
                                onChange={(v: string) => setFormData({ ...formData, country: v, state: "", city: "" })}
                                placeholder="Select Country"
                            />

                            <SelectField
                                label="State"
                                value={formData.state}
                                options={states}
                                readOnly={isReadOnly}
                                onChange={(v: string) => setFormData({ ...formData, state: v, city: "" })}
                                placeholder="Select State"
                            />

                            <SelectField
                                label="City"
                                value={formData.city}
                                options={cities}
                                readOnly={isReadOnly}
                                onChange={(v: string) => setFormData({ ...formData, city: v })}
                                placeholder="Select City"
                            />

                            <InputField label="Zip Code" value={formData.zip} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, zip: v })} />
                        </div>
                    </div>

                    {/* NEW: Comprehensive Sections */}
                    {formData.stage !== "INQUIRY" || formData.admissionFormStep > 0 ? (
                        <>
                            {/* Medical & Safety */}
                            <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={Heart} title="Medical Profile" />
                                <div className="grid md:grid-cols-3 gap-8 mt-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Blood Group</label>
                                        <select
                                            disabled={isReadOnly}
                                            value={formData.bloodGroup || ""}
                                            onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                            className={cn(
                                                "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold appearance-none transition-all",
                                                isReadOnly ? "text-zinc-500" : "text-zinc-900 border-2 border-zinc-100"
                                            )}
                                        >
                                            <option value="">Select</option>
                                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputField label="Allergies" value={formData.allergies} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, allergies: v })} />
                                    <InputField label="Medical Conditions" value={formData.medicalConditions} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, medicalConditions: v })} />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={PhoneCall} title="Emergency contingency" />
                                <div className="grid md:grid-cols-2 gap-8 mt-10">
                                    <InputField label="Emergency Contact Name" value={formData.emergencyContactName} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, emergencyContactName: v })} />
                                    <InputField label="Emergency Contact Phone" value={formData.emergencyContactPhone} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, emergencyContactPhone: v })} />
                                </div>
                            </div>

                            {/* Academic History */}
                            <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={History} title="Previous Schooling" />
                                <div className="mt-10">
                                    <InputField label="Previous Institution Attended" value={formData.previousSchool} readOnly={isReadOnly} onChange={(v: any) => setFormData({ ...formData, previousSchool: v })} />
                                </div>
                            </div>

                            {/* Documents Display */}
                            <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                                <SectionTitle icon={FileUp} title="Uploaded Documents" />
                                <div className="grid gap-4 mt-8">
                                    {(() => {
                                        const docList = [
                                            { label: "Child's Birth Certificate", key: "birth_cert" },
                                            { label: "Parent Identification", key: "parent_id" },
                                            { label: "Academic Transcript", key: "transcript" },
                                            { label: "Immunization Records", key: "immunization" }
                                        ];

                                        let currentDocs: any = {};
                                        try {
                                            if (formData.documents) {
                                                currentDocs = typeof formData.documents === 'string'
                                                    ? JSON.parse(formData.documents)
                                                    : formData.documents;
                                            }
                                        } catch (e) {
                                            currentDocs = {};
                                        }

                                        return docList.map((doc) => {
                                            const fileUrl = currentDocs[doc.key];
                                            return (
                                                <div key={doc.key} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-xl flex items-center justify-center border transition-all",
                                                            fileUrl ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-zinc-100 text-zinc-400"
                                                        )}>
                                                            <FileUp className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="font-bold text-sm text-zinc-900 block">{doc.label}</span>
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                                                {fileUrl ? "Verified & Uploaded" : "Pending Upload"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {fileUrl ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => window.open(fileUrl, '_blank')}
                                                                    className="h-10 px-4 bg-white border border-zinc-100 rounded-xl text-[10px] font-black uppercase text-zinc-600 hover:bg-zinc-50 transition-all"
                                                                >
                                                                    View
                                                                </button>
                                                                {!isReadOnly && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveDoc(doc.key)}
                                                                        className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all"
                                                                    >
                                                                        <Edit3 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            !isReadOnly && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUploadDoc(doc.key)}
                                                                    className="h-10 px-6 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                                                                >
                                                                    Upload
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                <div className="lg:col-span-4 space-y-6">

                    {/* Siblings Section (Right Panel) */}
                    {siblings.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-500/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xs uppercase tracking-widest">Family</h3>
                                        <p className="text-[10px] font-bold opacity-80">{siblings.length} Linked Records</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {siblings.map((sib: any) => (
                                    <button
                                        key={sib.id}
                                        type="button"
                                        onClick={() => window.open(`/s/${slug}/${sib.type === 'STUDENT' ? 'students' : 'admissions'}/${sib.id}`, '_blank')}
                                        className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-3 flex items-center gap-3 transition-all text-left group"
                                    >
                                        <div className="h-8 w-8 bg-white text-indigo-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                            {sib.name?.[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-xs truncate leading-tight">{sib.name}</p>
                                            <p className="text-[9px] uppercase font-bold opacity-70 truncate mt-0.5">
                                                {sib.grade ? `Grade ${sib.grade}` : (sib.type === 'ADMISSION' ? "Applicant" : "")}
                                            </p>
                                        </div>
                                        <span className={cn("text-[8px] font-black uppercase px-2 py-1 rounded bg-black/20 text-white/90")}>
                                            {sib.status?.substring(0, 3)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20 sticky top-8">
                        <SectionTitle icon={Target} title="Pipeline Priority" />
                        <div className="grid grid-cols-3 gap-2 mt-6">
                            {["LOW", "MEDIUM", "HIGH"].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={cn(
                                        "py-3 text-[10px] font-black rounded-xl transition-all border-2",
                                        formData.priority === p ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" : "bg-zinc-50 border-zinc-50 text-zinc-400"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="mt-10">
                            <SectionTitle icon={Building2} title="Inquiry Source" />
                            <select
                                disabled={isReadOnly}
                                value={formData.source || ""}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                                className="w-full mt-4 bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold text-sm appearance-none"
                            >
                                <option value="WALK_IN">Walk-in</option>
                                <option value="SOCIAL_MEDIA">Social Media</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="ADVERTISEMENT">Advertisement</option>
                            </select>
                        </div>

                        <div className="mt-10">
                            <SectionTitle icon={ShieldCheck} title="Official Purpose" />
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {[
                                    { id: "INTERESTED", label: "Interested" },
                                    { id: "NOT_INTERESTED", label: "Not Interested" },
                                    { id: "FAKE", label: "Fake/Spam" },
                                    { id: "DUPLICATE", label: "Duplicate" }
                                ].map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        disabled={isReadOnly}
                                        onClick={() => setFormData({ ...formData, officialStatus: s.id })}
                                        className={cn(
                                            "py-3 px-2 text-[9px] font-black rounded-xl transition-all border-2 text-center",
                                            formData.officialStatus === s.id
                                                ? "bg-blue-600 border-zinc-900 text-white shadow-lg"
                                                : "bg-zinc-50 border-zinc-50 text-zinc-400"
                                        )}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10">
                            <SectionTitle icon={FileText} title="Administrative Notes" />
                            <textarea
                                readOnly={isReadOnly}
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full mt-4 bg-zinc-50 border-0 rounded-2xl p-6 text-sm font-bold min-h-[150px] resize-none focus:ring-2 focus:ring-brand outline-none"
                                placeholder="Internal observations..."
                            />
                        </div>

                        {!isReadOnly && (
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full mt-10 h-16 bg-brand text-white rounded-[24px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-brand/30 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                Save Changes
                            </button>
                        )}

                        {/* Conversion Section */}
                        {isReadOnly && formData.stage === "INQUIRY" && (
                            <div className="mt-10 p-8 rounded-[32px] bg-blue-600 text-white shadow-2xl shadow-blue-200">
                                <h4 className="text-sm font-black uppercase tracking-widest mb-4">Admission Workflow</h4>
                                <p className="text-[11px] font-bold leading-relaxed mb-6">
                                    Convert this inquiry into a formal admission process. This will notify the parent to fill the comprehensive enrollment form.
                                </p>
                                <button
                                    onClick={handleInitiateAdmission}
                                    disabled={isSaving}
                                    className="w-full h-14 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                                    Initiate Admission
                                </button>
                            </div>
                        )}

                        {formData.stage === "APPLICATION" && (
                            <div className="mt-10 p-8 rounded-[32px] bg-emerald-600 text-white shadow-2xl shadow-emerald-200">
                                <h4 className="text-sm font-black uppercase tracking-widest mb-4">Portal Active</h4>
                                <p className="text-[11px] font-bold leading-relaxed mb-6">
                                    The comprehensive admission form is active. Link sent to parent.
                                </p>
                                <div className="p-3 bg-emerald-500/30 rounded-xl font-mono text-[9px] break-all border border-emerald-400/30 mb-4 select-all">
                                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/admission-portal/${formData.accessToken}`}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const link = `${window.location.origin}/admission-portal/${formData.accessToken}`;
                                            navigator.clipboard.writeText(link);
                                            toast.success("Link copied to clipboard");
                                        }}
                                        className="flex-1 h-12 bg-emerald-800/30 hover:bg-emerald-800/50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => window.open(`/admission-portal/${formData.accessToken}`, '_blank')}
                                        className="flex-1 h-12 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Open
                                    </button>
                                </div>
                            </div>
                        )}

                        {formData.stage === "INTERVIEW" && (
                            <div className="mt-10 p-8 rounded-[32px] bg-indigo-600 text-white shadow-2xl shadow-indigo-200">
                                <h4 className="text-sm font-black uppercase tracking-widest mb-4">Submission Review</h4>
                                <p className="text-[11px] font-bold leading-relaxed mb-6">
                                    The parent has completed the comprehensive form. Review all profile sections and documents before final approval.
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-indigo-200 uppercase tracking-widest px-1">Assign Grade</label>
                                        <select
                                            value={selectedGrade}
                                            onChange={e => setSelectedGrade(e.target.value)}
                                            className="w-full bg-white/10 border-white/20 rounded-2xl py-4 px-6 font-bold text-white transition-all outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                                        >
                                            <option value="" className="text-zinc-900">Select Grade</option>
                                            {grades.map(g => (
                                                <option key={g.id} value={g.name} className="text-zinc-900">{g.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <label className="text-[10px] font-black text-indigo-200 uppercase tracking-widest px-1">Assign Section</label>
                                    <div className="space-y-1">
                                        <select
                                            value={selectedSection}
                                            onChange={e => setSelectedSection(e.target.value)}
                                            className="w-full bg-white/10 border-white/20 rounded-2xl py-4 px-6 font-bold text-white transition-all outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                                        >
                                            <option value="" className="text-zinc-900">Select Section</option>
                                            {filteredSections && filteredSections.length > 0 ? (
                                                filteredSections.map(s => (
                                                    <option key={s.id} value={s.name} className="text-zinc-900">{s.name}</option>
                                                ))
                                            ) : (
                                                <option value="" disabled className="text-zinc-400">
                                                    {selectedGrade ? "No Sections Found" : "Select Grade First"}
                                                </option>
                                            )}
                                        </select>
                                        {selectedSection && selectedGrade && (
                                            (() => {
                                                // Don't show error if data isn't loaded yet
                                                if (allClassrooms.length === 0) return null;

                                                const match = findMatchingClassroom(selectedGrade, selectedSection, allClassrooms);
                                                const targetName = `${selectedGrade} - ${selectedSection}`;

                                                if (!match) {
                                                    return (
                                                        <p className="text-[10px] font-bold text-red-200 bg-red-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                            <X className="h-3 w-3" />
                                                            Classroom "{targetName}" not found. Create it in Registry first.
                                                        </p>
                                                    );
                                                }
                                                // Success indicator (Optional but helpful)
                                                return (
                                                    <p className="text-[10px] font-bold text-emerald-200 bg-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Linked to classroom: {match.name}
                                                    </p>
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleApproveAdmission}
                                    disabled={isSaving}
                                    className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/10"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                    Approve & Enroll
                                </button>
                            </div>
                        )}

                        {formData.stage === "ENROLLED" && (
                            <div className="mt-10 p-8 rounded-[32px] bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-zinc-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">Enrolled</h4>
                                </div>
                                <p className="text-[11px] font-bold leading-relaxed mb-6">
                                    This student has been successfully enrolled. A student record has been provisioned in the school directory.
                                </p>
                                <button
                                    onClick={() => router.push(`/s/${slug}/students`)}
                                    className="w-full h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 transition-all"
                                >
                                    View Student Directory
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form >

            {/* Hidden File Input */}
            < input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
            />
        </div >
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

function InputField({ label, value, readOnly, type = "text", onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{label}</label>
            <input
                type={type}
                value={value || ""}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
                className={cn(
                    "w-full h-14 px-6 rounded-2xl text-sm font-bold border-0 focus:ring-2 focus:ring-brand outline-none transition-all",
                    readOnly ? "bg-zinc-50 text-zinc-500 shadow-inner" : "bg-white border-2 border-zinc-100 text-zinc-900 shadow-sm"
                )}
            />
        </div>
    );
}

function SelectField({ label, value, options, onChange, readOnly, placeholder = "Select" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">{label}</label>
            <div className="relative">
                <select
                    value={value || ""}
                    disabled={readOnly}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={cn(
                        "w-full h-14 px-6 rounded-2xl text-sm font-bold border-0 focus:ring-2 focus:ring-brand outline-none transition-all appearance-none",
                        readOnly ? "bg-zinc-50 text-zinc-500 shadow-inner" : "bg-white border-2 border-zinc-100 text-zinc-900 shadow-sm"
                    )}
                >
                    <option value="">{placeholder}</option>
                    {options?.map((opt: any) => (
                        <option key={opt.id} value={opt.name}>{opt.name}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );
}
