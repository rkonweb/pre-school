"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    CheckCircle2,
    Loader2,
    Heart,
    PhoneCall,
    History,
    FileUp,
    ShieldCheck,
    Building2,
    User,
    ChevronRight,
    ArrowRight,
    MapPin,
    Calendar,
    Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdmissionByTokenAction, updateComprehensiveAdmissionAction } from "@/app/actions/admission-actions";
import { SchoolTheme } from "@/components/dashboard/SchoolTheme";

export default function ParentAdmissionPortal() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [admission, setAdmission] = useState<any>(null);
    const [formData, setFormData] = useState({
        bloodGroup: "",
        medicalConditions: "",
        allergies: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        previousSchool: "",
        notes: ""
    });

    useEffect(() => {
        loadData();
    }, [token]);

    async function loadData() {
        setIsLoading(true);
        const res = await getAdmissionByTokenAction(token);
        if (res.success && res.admission) {
            setAdmission(res.admission);

            // LOCK IF SUBMITTED: If stage is not APPLICATION, assume submitted/expired
            if (res.admission.stage !== "APPLICATION") {
                setSuccess(true); // Show "Submission Received" view
                setIsLoading(false);
                return;
            }

            // Pre-fill if already exists
            setFormData({
                bloodGroup: res.admission.bloodGroup || "",
                medicalConditions: res.admission.medicalConditions || "",
                allergies: res.admission.allergies || "",
                emergencyContactName: res.admission.emergencyContactName || "",
                emergencyContactPhone: res.admission.emergencyContactPhone || "",
                previousSchool: res.admission.previousSchool || "",
                notes: res.admission.notes || ""
            });
        } else {
            router.push('/404');
        }
        setIsLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await updateComprehensiveAdmissionAction(token, formData);
        if (res.success) {
            setSuccess(true);
        } else {
            alert(res.error || "Failed to submit form");
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand mx-auto" />
                    <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Securing Connection...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
                <SchoolTheme brandColor={admission?.school?.brandColor || "#2563eb"} />
                <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-brand rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-brand/20">
                        <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Submission Received</h2>
                        <p className="text-zinc-500 font-medium mt-3 leading-relaxed">
                            Thank you for completing the comprehensive admission form for <span className="text-brand font-bold">{admission.studentName}</span>.
                            Our admissions team will review the documents and contact you shortly for the next steps.
                        </p>
                    </div>
                    <div className="pt-4">
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-3 text-left">
                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <ShieldCheck className="h-5 w-5 text-brand" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Application Status</p>
                                <p className="text-sm font-bold text-zinc-900">Under Review</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <SchoolTheme brandColor={admission?.school?.brandColor || "#2563eb"} />
            {/* Navigation Header */}
            <header className="bg-white border-b border-zinc-100 px-6 py-6 sticky top-0 z-50 backdrop-blur-md bg-white/80">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-zinc-900 leading-none">{admission.school.name}</h1>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Enrollment Portal</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand/5 rounded-full border border-brand/20">
                        <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                        <span className="text-[10px] font-black text-brand uppercase tracking-widest">Secure Link Active</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 pt-12 pb-24">
                <div className="mb-12">
                    <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Finalize Enrollment</h2>
                    <p className="text-zinc-500 font-medium mt-2">Complete the comprehensive profile for your child to finalize the admission process.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Section 1: Identity Confirmation */}
                    <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <div className="flex items-center justify-between mb-10">
                            <SectionTitle icon={User} title="Primary Record" />
                            <span className="px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest">Read Only</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-8 ring-1 ring-zinc-50 p-6 rounded-2xl">
                            <SummaryItem icon={User} label="Student Name" value={admission.studentName} />
                            <SummaryItem icon={Calendar} label="Date of Birth" value={new Date(admission.dateOfBirth).toLocaleDateString()} />
                            <SummaryItem icon={MapPin} label="Home Address" value={`${admission.address}, ${admission.city}`} />
                            <SummaryItem icon={ShieldCheck} label="Grade Requested" value={admission.enrolledGrade} />
                        </div>
                    </div>

                    {/* Section 2: Medical & Safety */}
                    <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={Heart} title="Health & Medical profile" />
                        <div className="grid sm:grid-cols-3 gap-8 mt-10">
                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-4 mb-2 block">Blood Group</label>
                                <select
                                    required
                                    value={formData.bloodGroup}
                                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    className="w-full bg-zinc-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-xl py-4 px-6 font-bold transition-all outline-none"
                                >
                                    <option value="">Select Group</option>
                                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <InputField
                                    label="Known Allergies"
                                    placeholder="Food, medicine, etc."
                                    value={formData.allergies}
                                    onChange={v => setFormData({ ...formData, allergies: v })}
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <InputField
                                    label="Medical Conditions"
                                    placeholder="Asthma, etc."
                                    value={formData.medicalConditions}
                                    onChange={v => setFormData({ ...formData, medicalConditions: v })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Emergency Contacts */}
                    <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={PhoneCall} title="Emergency contingency" />
                        <div className="grid sm:grid-cols-2 gap-8 mt-10">
                            <InputField
                                label="Emergency Contact Name"
                                placeholder="Relationship (e.g. Aunt)"
                                value={formData.emergencyContactName}
                                onChange={v => setFormData({ ...formData, emergencyContactName: v })}
                            />
                            <InputField
                                label="Emergency Contact Phone"
                                placeholder="98765 43210"
                                type="tel"
                                value={formData.emergencyContactPhone}
                                onChange={v => {
                                    const val = v.replace(/\D/g, "").slice(0, 10);
                                    setFormData({ ...formData, emergencyContactPhone: val });
                                }}
                            />
                        </div>
                    </div>

                    {/* Section 4: Academic History */}
                    <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={History} title="Previous Schooling" />
                        <div className="mt-10">
                            <InputField
                                label="Previous Institution Attended"
                                placeholder="School Name and City"
                                value={formData.previousSchool}
                                onChange={v => setFormData({ ...formData, previousSchool: v })}
                            />
                        </div>
                    </div>

                    {/* Section 5: Document Repository */}
                    <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={FileUp} title="Required Documents" />
                        <p className="text-xs font-medium text-zinc-400 mt-2 mb-8">Please upload high-resolution scans of the following credentials.</p>

                        <div className="grid gap-4">
                            {[
                                { label: "Child's Birth Certificate", required: true },
                                { label: "Parent Identification (ID Proof)", required: true },
                                { label: "Previous Academic Transcript", required: false },
                                { label: "Immunization Records", required: true }
                            ].map((doc, idx) => (
                                <div key={idx} className="group p-6 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-100 hover:border-brand/30 hover:bg-brand/5 transition-all flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <FileUp className="h-5 w-5 text-zinc-400 group-hover:text-brand" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-zinc-700">{doc.label}</p>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{doc.required ? "Mandatory" : "Optional"}</p>
                                        </div>
                                    </div>
                                    <button type="button" className="h-10 px-5 rounded-xl bg-white border border-zinc-100 text-[10px] font-black uppercase text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
                                        Choose File
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Area */}
                    <div className="flex flex-col items-center gap-6 pt-10">
                        <div className="flex items-center gap-2 p-4 bg-zinc-100 border border-zinc-200 rounded-3xl max-w-lg">
                            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                            <p className="text-[10px] font-bold text-zinc-500 leading-relaxed">
                                By submitting this form, you verify that all provided information is accurate and legally binding according to our institution's enrollment policy.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full max-w-sm h-16 bg-brand text-white rounded-2xl font-black text-lg flex items-center justify-center gap-4 shadow-xl shadow-brand/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
                            Complete Enrollment
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
}

function SectionTitle({ icon: Icon, title }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <Icon className="h-5 w-5 text-brand" />
            </div>
            <h3 className="text-zinc-900 font-extrabold text-sm uppercase tracking-widest">{title}</h3>
        </div>
    );
}

function SummaryItem({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1 h-5 w-5 flex items-center justify-center text-zinc-300">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-zinc-700">{value}</p>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: any, onChange: (v: string) => void, placeholder?: string, type?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 ml-4 block">{label}</label>
            <input
                type={type}
                value={value}
                maxLength={type === "tel" ? 10 : undefined}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-16 bg-zinc-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl px-8 font-bold transition-all outline-none text-sm placeholder:text-zinc-300 shadow-sm"
            />
        </div>
    );
}
