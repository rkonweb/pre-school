"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User, Mail, Phone, Shield, Calendar, Clock, MapPin,
    Briefcase, GraduationCap, Heart, Building2, CreditCard,
    Linkedin, Instagram, Facebook, Twitter, Save, Loader2,
    AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
    Users, BookOpen, FileText, BarChart3, ArrowLeft
} from "lucide-react";
import { getFullAdminProfileAction, updateAdminProfileAction } from "@/app/actions/profile-actions";
import { AvatarWithAdjustment } from "@/components/dashboard/staff/AvatarWithAdjustment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SectionProps {
    title: string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left group"
            >
                <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand/15 group-hover:scale-105 transition-transform">
                        <Icon className="h-5 w-5 text-[var(--secondary-color)]" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">{title}</h3>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-zinc-100 pt-6">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({
    label, value, onChange, type = "text", placeholder, disabled, icon: Icon
}: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; disabled?: boolean; icon?: any;
}) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <input
                    type={type}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || label}
                    disabled={disabled}
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm font-semibold text-zinc-900 placeholder-zinc-300",
                        "focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:bg-white transition-all",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        Icon && "pl-10"
                    )}
                />
            </div>
        </div>
    );
}

function SelectField({
    label, value, onChange, options, icon: Icon
}: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; icon?: any;
}) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 z-10">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        "w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm font-semibold text-zinc-900",
                        "focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:bg-white transition-all appearance-none cursor-pointer",
                        Icon && "pl-10"
                    )}
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
    return (
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg", color)}>
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <div className="text-xl font-black text-zinc-900">{value}</div>
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}

export function AdminProfileClient() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Form state
    const [form, setForm] = useState<Record<string, any>>({});

    const updateField = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const res = await getFullAdminProfileAction(slug);
            if (res.success && res.data) {
                setProfile(res.data);
                setForm({
                    firstName: res.data.firstName || "",
                    lastName: res.data.lastName || "",
                    email: res.data.email || "",
                    gender: res.data.gender || "",
                    dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : "",
                    bloodGroup: res.data.bloodGroup || "",
                    designation: res.data.designation || "",
                    department: res.data.department || "",
                    employmentType: res.data.employmentType || "",
                    qualifications: res.data.qualifications || "",
                    experience: res.data.experience || "",
                    subjects: res.data.subjects || "",
                    address: res.data.address || "",
                    addressCity: res.data.addressCity || "",
                    addressState: res.data.addressState || "",
                    addressZip: res.data.addressZip || "",
                    addressCountry: res.data.addressCountry || "",
                    emergencyContactName: res.data.emergencyContactName || "",
                    emergencyContactPhone: res.data.emergencyContactPhone || "",
                    emergencyContactRelation: res.data.emergencyContactRelation || "",
                    bankName: res.data.bankName || "",
                    bankAccountNo: res.data.bankAccountNo || "",
                    bankIfsc: res.data.bankIfsc || "",
                    facebook: res.data.facebook || "",
                    linkedin: res.data.linkedin || "",
                    twitter: res.data.twitter || "",
                    instagram: res.data.instagram || "",
                });
                setError(null);
            } else {
                setError(res.error || "Failed to load profile");
            }
            setIsLoading(false);
        };
        load();
    }, [slug]);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateAdminProfileAction(slug, form);
        if (res.success) {
            toast.success("Profile updated successfully!");
            setHasChanges(false);
            // Reload profile to get fresh data
            const refreshRes = await getFullAdminProfileAction(slug);
            if (refreshRes.success && refreshRes.data) {
                setProfile(refreshRes.data);
            }
        } else {
            toast.error(res.error || "Failed to update profile");
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand mx-auto" />
                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
                    <h3 className="text-lg font-bold text-zinc-900">Could not load profile</h3>
                    <p className="text-sm text-zinc-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-brand text-[var(--secondary-color)] rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const stats = profile.stats;
    const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long", year: "numeric"
    });
    const joiningDateStr = profile.joiningDate
        ? new Date(profile.joiningDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "Not Set";

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── HEADER HERO ── */}
            <div className="relative overflow-hidden rounded-[28px] bg-brand-gradient p-8 text-[var(--secondary-color)]">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <AvatarWithAdjustment
                            src={profile.avatar}
                            adjustment={profile.avatarAdjustment}
                            className="h-24 w-24 rounded-3xl shadow-2xl border-4 border-white/20 object-cover overflow-hidden"
                        />
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-xl flex items-center justify-center border-3 border-white shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                    </div>

                    {/* Name & Info */}
                    <div className="flex-1 space-y-2">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                            {profile.firstName} {profile.lastName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold opacity-80">
                            {profile.designation && (
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    {profile.designation}
                                </span>
                            )}
                            {profile.department && (
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {profile.department}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5" />
                                {profile.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold opacity-60 pt-1">
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />{profile.mobile}
                            </span>
                            {profile.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />{profile.email}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />Joined {joiningDateStr}
                            </span>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/s/${slug}/settings/identity`)}
                            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors font-bold text-sm flex items-center gap-2 border border-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Settings
                        </button>
                        {hasChanges && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-3 rounded-2xl bg-white text-brand font-black text-sm flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── STATS GRID ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Attendance" value={`${stats.attendanceRate}%`} icon={BarChart3} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
                <StatCard label="Classes" value={stats.classroomsManaged} icon={BookOpen} color="bg-gradient-to-br from-blue-500 to-blue-600" />
                <StatCard label="Students" value={stats.totalStudents} icon={Users} color="bg-gradient-to-br from-violet-500 to-violet-600" />
                <StatCard label="Leaves" value={stats.leavesTaken} icon={Calendar} color="bg-gradient-to-br from-amber-500 to-amber-600" />
                <StatCard label="Exams" value={stats.examsCreated} icon={FileText} color="bg-gradient-to-br from-rose-500 to-rose-600" />
                <StatCard label="Diary" value={stats.diaryEntries} icon={BookOpen} color="bg-gradient-to-br from-cyan-500 to-cyan-600" />
            </div>

            {/* ── FORM SECTIONS ── */}
            <div className="space-y-5">
                {/* Personal Information */}
                <Section title="Personal Information" icon={User}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Field label="First Name" value={form.firstName} onChange={v => updateField('firstName', v)} icon={User} />
                        <Field label="Last Name" value={form.lastName} onChange={v => updateField('lastName', v)} />
                        <Field label="Email" value={form.email} onChange={v => updateField('email', v)} type="email" icon={Mail} />
                        <Field label="Mobile" value={profile.mobile} onChange={() => {}} disabled icon={Phone} />
                        <SelectField
                            label="Gender"
                            value={form.gender}
                            onChange={v => updateField('gender', v)}
                            options={[
                                { value: "MALE", label: "Male" },
                                { value: "FEMALE", label: "Female" },
                                { value: "OTHER", label: "Other" }
                            ]}
                        />
                        <Field label="Date of Birth" value={form.dateOfBirth} onChange={v => updateField('dateOfBirth', v)} type="date" icon={Calendar} />
                        <SelectField
                            label="Blood Group"
                            value={form.bloodGroup}
                            onChange={v => updateField('bloodGroup', v)}
                            options={[
                                { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
                                { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
                                { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
                                { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
                            ]}
                            icon={Heart}
                        />
                    </div>
                </Section>

                {/* Professional Information */}
                <Section title="Professional Information" icon={Briefcase}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Field label="Designation" value={form.designation} onChange={v => updateField('designation', v)} icon={Briefcase} />
                        <Field label="Department" value={form.department} onChange={v => updateField('department', v)} icon={Building2} />
                        <SelectField
                            label="Employment Type"
                            value={form.employmentType}
                            onChange={v => updateField('employmentType', v)}
                            options={[
                                { value: "FULL_TIME", label: "Full Time" },
                                { value: "PART_TIME", label: "Part Time" },
                                { value: "CONTRACT", label: "Contract" },
                                { value: "INTERN", label: "Intern" },
                            ]}
                            icon={Briefcase}
                        />
                        <Field label="Qualifications" value={form.qualifications} onChange={v => updateField('qualifications', v)} icon={GraduationCap} placeholder="e.g. M.Ed, B.Ed" />
                        <Field label="Experience" value={form.experience} onChange={v => updateField('experience', v)} placeholder="e.g. 5 years" />
                        <Field label="Subjects" value={form.subjects} onChange={v => updateField('subjects', v)} placeholder="e.g. Math, Science" />
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</label>
                            <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-100 text-sm font-bold text-zinc-600 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-brand" />
                                {profile.role}
                                {profile.customRole && <span className="text-zinc-400 ml-1">({profile.customRole.name})</span>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Branch</label>
                            <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-100 text-sm font-bold text-zinc-600 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-brand" />
                                {profile.branch?.name || "Default"}
                            </div>
                        </div>
                        {profile.joiningDate && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Joining Date</label>
                                <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-100 text-sm font-bold text-zinc-600 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-brand" />
                                    {joiningDateStr}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Managed Classrooms */}
                    {profile.managedClassrooms && profile.managedClassrooms.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-zinc-100">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Managed Classrooms</h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.managedClassrooms.map((cls: any) => (
                                    <span key={cls.id} className="px-4 py-2 bg-brand/5 border border-brand/15 text-brand rounded-xl text-sm font-bold flex items-center gap-2">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {cls.name}
                                        <span className="text-zinc-400 text-xs">({cls._count.students} students)</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>

                {/* Contact & Address */}
                <Section title="Contact & Address" icon={MapPin}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="md:col-span-2 lg:col-span-3">
                            <Field label="Address" value={form.address} onChange={v => updateField('address', v)} icon={MapPin} placeholder="Full street address" />
                        </div>
                        <Field label="City" value={form.addressCity} onChange={v => updateField('addressCity', v)} />
                        <Field label="State" value={form.addressState} onChange={v => updateField('addressState', v)} />
                        <Field label="ZIP Code" value={form.addressZip} onChange={v => updateField('addressZip', v)} />
                        <Field label="Country" value={form.addressCountry} onChange={v => updateField('addressCountry', v)} />
                    </div>
                </Section>

                {/* Emergency Contact */}
                <Section title="Emergency Contact" icon={Heart} defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Field label="Contact Name" value={form.emergencyContactName} onChange={v => updateField('emergencyContactName', v)} icon={User} />
                        <Field label="Contact Phone" value={form.emergencyContactPhone} onChange={v => updateField('emergencyContactPhone', v)} icon={Phone} />
                        <SelectField
                            label="Relationship"
                            value={form.emergencyContactRelation}
                            onChange={v => updateField('emergencyContactRelation', v)}
                            options={[
                                { value: "SPOUSE", label: "Spouse" },
                                { value: "PARENT", label: "Parent" },
                                { value: "SIBLING", label: "Sibling" },
                                { value: "FRIEND", label: "Friend" },
                                { value: "OTHER", label: "Other" },
                            ]}
                        />
                    </div>
                </Section>

                {/* Banking Details */}
                <Section title="Banking Details" icon={CreditCard} defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Field label="Bank Name" value={form.bankName} onChange={v => updateField('bankName', v)} icon={Building2} />
                        <Field label="Account Number" value={form.bankAccountNo} onChange={v => updateField('bankAccountNo', v)} icon={CreditCard} />
                        <Field label="IFSC Code" value={form.bankIfsc} onChange={v => updateField('bankIfsc', v)} />
                    </div>
                </Section>

                {/* Social Links */}
                <Section title="Social Links" icon={Linkedin} defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="LinkedIn" value={form.linkedin} onChange={v => updateField('linkedin', v)} icon={Linkedin} placeholder="https://linkedin.com/in/..." />
                        <Field label="Instagram" value={form.instagram} onChange={v => updateField('instagram', v)} icon={Instagram} placeholder="https://instagram.com/..." />
                        <Field label="Facebook" value={form.facebook} onChange={v => updateField('facebook', v)} icon={Facebook} placeholder="https://facebook.com/..." />
                        <Field label="Twitter" value={form.twitter} onChange={v => updateField('twitter', v)} icon={Twitter} placeholder="https://twitter.com/..." />
                    </div>
                </Section>

                {/* Account Information (Read-only) */}
                <Section title="Account Information" icon={Shield} defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                            <div className="px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {profile.status}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Member Since</label>
                            <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-100 text-sm font-bold text-zinc-600 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-brand" />
                                {memberSince}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">School</label>
                            <div className="px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-100 text-sm font-bold text-zinc-600 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-brand" />
                                {profile.school?.name || "N/A"}
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            {/* ── FLOATING SAVE BAR ── */}
            {hasChanges && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-6 duration-500">
                    <div className="flex items-center gap-4 px-6 py-4 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
                        <span className="text-sm font-bold text-zinc-300">You have unsaved changes</span>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-brand text-[var(--secondary-color)] rounded-xl font-black text-sm flex items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
