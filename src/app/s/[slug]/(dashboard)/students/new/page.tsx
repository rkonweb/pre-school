"use client";

import { useState, useEffect } from "react";
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
    Heart,
    PhoneCall,
    Loader2,
    CheckCircle2,
    Briefcase,
    ClipboardList,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createStudentAction } from "@/app/actions/student-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { getClassroomsAction } from "@/app/actions/classroom-actions";
import { toast } from "sonner";

const SectionTitle = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-zinc-100 text-zinc-900">
            <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-black text-zinc-900">{title}</h3>
    </div>
);

const InputField = ({ label, value, onChange, type = "text", placeholder, required }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
            {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <input
            type={type}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full bg-white border-2 border-zinc-100 rounded-2xl py-4 px-6 font-bold text-zinc-900 transition-all outline-none focus:ring-2 focus:ring-zinc-200"
        />
    </div>
);

const SelectField = ({ label, value, onChange, children, required }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
            {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="relative">
            <select
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                required={required}
                className="w-full bg-white border-2 border-zinc-100 rounded-2xl py-4 px-6 font-bold text-zinc-900 appearance-none transition-all outline-none focus:ring-2 focus:ring-zinc-200"
            >
                {children}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        </div>
    </div>
);

export default function NewStudentPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [isSaving, setIsSaving] = useState(false);
    const [grades, setGrades] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);

    const [student, setStudent] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        admissionNumber: "",
        joiningDate: new Date().toISOString().split("T")[0],
        grade: "",
        classroomId: "",
        // Health
        bloodGroup: "",
        allergies: "",
        medicalConditions: "",
        // Emergency
        emergencyContactName: "",
        emergencyContactPhone: "",
        // Parent / Guardian
        parentName: "",
        relationship: "",
        parentMobile: "",
        parentEmail: "",
        secondaryPhone: "",
        // Father
        fatherName: "",
        fatherOccupation: "",
        fatherPhone: "",
        fatherEmail: "",
        // Mother
        motherName: "",
        motherOccupation: "",
        motherPhone: "",
        motherEmail: "",
        // Address
        address: "",
        city: "",
        state: "",
        country: "India",
        zip: "",
    });

    const set = (key: string, val: string) => setStudent(s => ({ ...s, [key]: val }));

    useEffect(() => {
        async function load() {
            const [gradesRes, classroomsRes, sectionsRes] = await Promise.all([
                getMasterDataAction("GRADE", null),
                getClassroomsAction(slug),
                getMasterDataAction("SECTION", null),
            ]);
            if (gradesRes.success) setGrades(gradesRes.data || []);
            if (classroomsRes.success) setClassrooms(classroomsRes.data || []);
            if (sectionsRes.success) setSections(sectionsRes.data || []);
        }
        load();
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student.firstName || !student.lastName) { toast.error("Full name is required"); return; }
        if (!student.gender) { toast.error("Gender is required"); return; }
        if (!student.grade) { toast.error("Grade is required"); return; }
        if (!student.classroomId) { toast.error("Section is required"); return; }
        if (!student.parentMobile) { toast.error("Parent mobile is required"); return; }

        setIsSaving(true);
        try {
            const res = await createStudentAction(slug, {
                firstName: student.firstName,
                lastName: student.lastName,
                gender: student.gender,
                dateOfBirth: student.dateOfBirth || undefined,
                admissionNumber: student.admissionNumber || undefined,
                joiningDate: student.joiningDate || undefined,
                classroomId: student.classroomId || undefined,
                bloodGroup: student.bloodGroup || undefined,
                allergies: student.allergies || undefined,
                medicalConditions: student.medicalConditions || undefined,
                emergencyContactName: student.emergencyContactName || undefined,
                emergencyContactPhone: student.emergencyContactPhone || undefined,
                parentName: student.parentName || undefined,
                relationship: student.relationship || undefined,
                parentMobile: student.parentMobile,
                parentEmail: student.parentEmail || undefined,
                secondaryPhone: student.secondaryPhone || undefined,
                fatherName: student.fatherName || undefined,
                fatherOccupation: student.fatherOccupation || undefined,
                fatherPhone: student.fatherPhone || undefined,
                fatherEmail: student.fatherEmail || undefined,
                motherName: student.motherName || undefined,
                motherOccupation: student.motherOccupation || undefined,
                motherPhone: student.motherPhone || undefined,
                motherEmail: student.motherEmail || undefined,
                address: student.address || undefined,
                city: student.city || undefined,
                state: student.state || undefined,
                country: student.country || undefined,
                zip: student.zip || undefined,
            } as any);

            if (res.success) {
                toast.success("Student profile created!");
                router.push(`/s/${slug}/students`);
            } else {
                toast.error(res.error || "Failed to create student");
            }
        } catch (err: any) {
            toast.error("Failed to create student profile due to an unexpected error");
        }
        setIsSaving(false);
    };

    // Derive section select value from classroomId
    const sectionValue = (() => {
        if (!student.classroomId) return "";
        const c = classrooms.find(c => c.id === student.classroomId);
        if (!c?.name) return "";
        const parts = c.name.split(" - ");
        return parts.length > 1 ? parts[parts.length - 1] : "";
    })();

    return (
        <div className="w-full max-w-full mx-auto pb-20 px-4 md:px-8">
            {/* Header */}
            <div className="flex items-center gap-6 py-8">
                <button
                    type="button"
                    onClick={() => router.push(`/s/${slug}/students`)}
                    className="h-12 w-12 rounded-2xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">New Student</h1>
                    <p className="text-sm text-zinc-500 mt-1">Fill in the details below to create a new student profile.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Student Identity */}
                        <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={User} title="Student Identity" />
                            <div className="grid md:grid-cols-2 gap-8 mt-10">
                                <InputField label="First Name" value={student.firstName} onChange={(v: string) => set("firstName", v)} required placeholder="e.g. Aarav" />
                                <InputField label="Last Name" value={student.lastName} onChange={(v: string) => set("lastName", v)} placeholder="e.g. Sharma" />
                                <SelectField label="Gender" value={student.gender} onChange={(v: string) => set("gender", v)}>
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </SelectField>
                                <InputField label="Date of Birth" type="date" value={student.dateOfBirth} onChange={(v: string) => set("dateOfBirth", v)} />
                            </div>
                        </div>

                        {/* Health Profile */}
                        <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Heart} title="Health Profile" />
                            <div className="grid md:grid-cols-3 gap-8 mt-10">
                                <SelectField label="Blood Group" value={student.bloodGroup} onChange={(v: string) => set("bloodGroup", v)}>
                                    <option value="">Select</option>
                                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </SelectField>
                                <InputField label="Allergies" value={student.allergies} onChange={(v: string) => set("allergies", v)} placeholder="e.g. Peanuts, Dust" />
                                <InputField label="Medical Conditions" value={student.medicalConditions} onChange={(v: string) => set("medicalConditions", v)} placeholder="e.g. Asthma" />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={PhoneCall} title="Emergency Contact" />
                            <div className="grid md:grid-cols-2 gap-8 mt-10">
                                <InputField label="Name" value={student.emergencyContactName} onChange={(v: string) => set("emergencyContactName", v)} placeholder="Contact person name" />
                                <InputField label="Phone" type="tel" value={student.emergencyContactPhone} onChange={(v: string) => set("emergencyContactPhone", v)} placeholder="Emergency phone number" />
                            </div>
                        </div>

                        {/* Parent Details */}
                        <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Users} title="Parent Details" />
                            <div className="space-y-12 mt-10">
                                {/* Father */}
                                <div className="space-y-8 p-8 bg-zinc-50 rounded-[32px] border border-zinc-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Father's Information</h4>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <InputField label="Father's Name" value={student.fatherName} onChange={(v: string) => set("fatherName", v)} placeholder="Father's full name" />
                                        <InputField label="Occupation" value={student.fatherOccupation} onChange={(v: string) => set("fatherOccupation", v)} placeholder="e.g. Engineer" />
                                        <InputField label="Phone" type="tel" value={student.fatherPhone} onChange={(v: string) => set("fatherPhone", v)} placeholder="Father's phone" />
                                        <InputField label="Email" type="email" value={student.fatherEmail} onChange={(v: string) => set("fatherEmail", v)} placeholder="father@example.com" />
                                    </div>
                                </div>

                                {/* Mother */}
                                <div className="space-y-8 p-8 bg-zinc-50 rounded-[32px] border border-zinc-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-pink-500" />
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Mother's Information</h4>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <InputField label="Mother's Name" value={student.motherName} onChange={(v: string) => set("motherName", v)} placeholder="Mother's full name" />
                                        <InputField label="Occupation" value={student.motherOccupation} onChange={(v: string) => set("motherOccupation", v)} placeholder="e.g. Teacher" />
                                        <InputField label="Phone" type="tel" value={student.motherPhone} onChange={(v: string) => set("motherPhone", v)} placeholder="Mother's phone" />
                                        <InputField label="Email" type="email" value={student.motherEmail} onChange={(v: string) => set("motherEmail", v)} placeholder="mother@example.com" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={MapPin} title="Residential Address" />
                            <div className="grid gap-8 mt-10">
                                <InputField label="Full Address" value={student.address} onChange={(v: string) => set("address", v)} placeholder="Street / Area / Apartment" />
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <InputField label="City" value={student.city} onChange={(v: string) => set("city", v)} placeholder="City" />
                                    <InputField label="State" value={student.state} onChange={(v: string) => set("state", v)} placeholder="State" />
                                    <InputField label="Country" value={student.country} onChange={(v: string) => set("country", v)} placeholder="Country" />
                                    <InputField label="ZIP Code" value={student.zip} onChange={(v: string) => set("zip", v)} placeholder="PIN Code" />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex gap-4">
                            <button type="button" onClick={() => router.back()}
                                className="flex-1 h-16 rounded-[24px] border-2 border-zinc-200 text-zinc-600 font-black text-sm hover:bg-zinc-50 transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSaving}
                                className="flex-[3] h-16 rounded-[24px] bg-brand text-white font-black text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                {isSaving ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating Student...</> : <><CheckCircle2 className="h-5 w-5" /> Create Student Profile</>}
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Enrollment Details */}
                        <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={ClipboardList} title="Enrollment Details" />
                            <div className="mt-8 space-y-6">
                                <InputField label="Admission Number" value={student.admissionNumber} onChange={(v: string) => set("admissionNumber", v)} placeholder="e.g. ADM-2025-001" />
                                <InputField label="Joining Date" type="date" value={student.joiningDate} onChange={(v: string) => set("joiningDate", v)} />
                            </div>
                        </div>

                        {/* Academic Alignment */}
                        <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Target} title="Academic Alignment" />
                            <div className="mt-8 space-y-6">
                                <SelectField label="Grade" value={student.grade} onChange={(v: string) => { set("grade", v); set("classroomId", ""); }}>
                                    <option value="">Select Grade</option>
                                    {grades.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                                </SelectField>
                                <SelectField label="Section" value={sectionValue} onChange={(v: string) => {
                                    const target = classrooms.find(c => c.name === `${student.grade} - ${v}`);
                                    if (target) { set("classroomId", target.id); }
                                    else if (!v) { set("classroomId", ""); }
                                    else { toast.error(`Class "${student.grade} - ${v}" not found`); }
                                }}>
                                    <option value="">Select Section</option>
                                    {sections.length > 0
                                        ? sections.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)
                                        : ["A", "B", "C", "D"].map(s => <option key={s} value={s}>{s}</option>)}
                                </SelectField>
                            </div>
                        </div>

                        {/* Guardian Connectivity */}
                        <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                            <SectionTitle icon={Users} title="Guardian Connectivity" />
                            <div className="mt-8 space-y-6">
                                <InputField label="Primary Guardian Name" value={student.parentName} onChange={(v: string) => set("parentName", v)} placeholder="Parent / Guardian name" required />
                                <SelectField label="Relationship" value={student.relationship} onChange={(v: string) => set("relationship", v)}>
                                    <option value="">Select</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Grandparent">Grandparent</option>
                                </SelectField>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Phone className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <InputField label="Primary Mobile" type="tel" value={student.parentMobile}
                                            onChange={(v: string) => set("parentMobile", v.replace(/\D/g, "").slice(0, 10))}
                                            placeholder="10-digit mobile" required />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <PhoneCall className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <InputField label="Secondary Phone" type="tel" value={student.secondaryPhone}
                                            onChange={(v: string) => set("secondaryPhone", v)} placeholder="Alternate number" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4 text-brand" />
                                    </div>
                                    <div className="flex-1">
                                        <InputField label="Email Address" type="email" value={student.parentEmail}
                                            onChange={(v: string) => set("parentEmail", v)} placeholder="parent@example.com" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
