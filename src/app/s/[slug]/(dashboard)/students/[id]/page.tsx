"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    Users,
    MapPin,
    Heart,
    Building2,
    Phone,
    X,
    Plus,
    ChevronDown,
    Activity,
    CheckCircle2,
    Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudentAction, updateStudentAction, disconnectSiblingAction } from "@/app/actions/student-actions";
import { getFamilyStudentsAction } from "@/app/actions/parent-actions";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { StandardActionButton } from "@/components/ui/StandardActionButton";
import { validateEmail, validatePhone } from "@/lib/validators";
import { toast } from "sonner";
import { useConfirm } from "@/contexts/ConfirmContext";
import { Loader2 } from "lucide-react";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import dynamic from "next/dynamic";

const ConnectSiblingDialog = dynamic(() => import("@/components/dashboard/students/ConnectSiblingDialog").then(m => m.ConnectSiblingDialog), { ssr: false });

const SectionTitle = ({ icon: Icon, title, light = false }: any) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", light ? "bg-white/10 text-[var(--secondary-color)]" : "bg-zinc-100 text-zinc-900")}>
            <Icon className="h-5 w-5" />
        </div>
        <h3 className={cn("text-lg font-black", light ? "text-[var(--secondary-color)]" : "text-zinc-900")}>{title}</h3>
    </div>
);

const InputField = ({ label, value, onChange, readOnly, type = "text", error }: any) => (
    <div className="space-y-2">
        {label ? <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", error ? "text-red-500" : "text-zinc-400")}>{label}{error ? " *" : ""}</label> : null}
        {readOnly && !value ? (
            <div className="w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 text-zinc-300 text-lg font-light select-none">
                —
            </div>
        ) : (
            <input
                type={type}
                value={value || ""}
                disabled={readOnly}
                onChange={e => onChange(e.target.value)}
                title={label}
                className={cn(
                    "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all outline-none focus:ring-2",
                    readOnly ? "text-zinc-500 cursor-not-allowed opacity-75" : "text-zinc-900 border-2 bg-white",
                    error && !readOnly ? "border-red-400 ring-2 ring-red-100 focus:ring-red-200" : "border-zinc-100 focus:ring-zinc-200"
                )}
            />
        )}
        {error && !readOnly && <p className="text-[10px] font-bold text-red-500 px-1">{error}</p>}
    </div>
);

const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
};

export default function ProfileTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;
    const { confirm: confirmDialog } = useConfirm();
    const { can } = useRolePermissions();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [student, setStudent] = useState<any>(null);
    const [siblings, setSiblings] = useState<any[]>([]);
    const [isConnectSiblingOpen, setIsConnectSiblingOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Master Data for Geography
    const [masterCountries, setMasterCountries] = useState<any[]>([]);
    const [masterStates, setMasterStates] = useState<any[]>([]);
    const [masterCities, setMasterCities] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        if (mode === "edit") {
            fetchCountries();
        }
    }, [mode]);

    async function loadData() {
        setIsLoading(true);
        const res = await getStudentAction(slug, id);
        if (res.success && res.student) {
            setStudent(res.student);
            if (res.student.parentMobile) {
                const sibRes = await getFamilyStudentsAction(slug, res.student.parentMobile);
                if (sibRes.success) setSiblings(sibRes.students || []);
            }
        }
        setIsLoading(false);
    }

    const fetchCountries = async () => {
        const res = await getMasterDataAction("COUNTRY", null);
        if (res.success) setMasterCountries(res.data || []);
    };

    const fetchStates = async (countryId: string) => {
        const res = await getMasterDataAction("STATE", countryId);
        if (res.success) setMasterStates(res.data || []);
    };

    const fetchCities = async (stateId: string) => {
        const res = await getMasterDataAction("CITY", stateId);
        if (res.success) setMasterCities(res.data || []);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        const required = (val: any) => !val || String(val).trim() === "";

        if (required(student.firstName)) errors.firstName = "Required";
        if (required(student.lastName)) errors.lastName = "Required";
        if (required(student.gender)) errors.gender = "Required";
        if (required(student.dateOfBirth)) errors.dateOfBirth = "Required";

        // Email/Phone validation
        const eErr = (v: any) => validateEmail(v);
        const pErr = (v: any) => validatePhone(v);

        if (student.fatherEmail && eErr(student.fatherEmail)) errors.fatherEmail = eErr(student.fatherEmail)!;
        if (student.motherEmail && eErr(student.motherEmail)) errors.motherEmail = eErr(student.motherEmail)!;
        if (student.parentEmail && eErr(student.parentEmail)) errors.parentEmail = eErr(student.parentEmail)!;

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }
        setIsSaving(true);
        const res = await updateStudentAction(slug, id, student);
        if (res.success) {
            toast.success("Profile updated");
            setMode("view");
            loadData();
        } else {
            toast.error(res.error || "Update failed");
        }
        setIsSaving(false);
    };

    const handleDisconnect = async (siblingId: string) => {
        const confirmed = await confirmDialog({
            title: "Disconnect Sibling",
            message: "Are you sure you want to remove this sibling linkage?",
            variant: "warning",
            confirmText: "Disconnect",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await disconnectSiblingAction(slug, siblingId);
        if (res.success) {
            toast.success("Sibling disconnected");
            loadData();
        } else {
            toast.error(res.error || "Failed to disconnect");
        }
    };

    if (isLoading || !student) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    const isReadOnly = mode === "view";

    return (
        <Fragment>
            <div className="flex justify-end mb-8">
                <StandardActionButton
                    onClick={() => setMode(mode === "view" ? "edit" : "view")}
                    variant={mode === "view" ? "primary" : "ghost"}
                    icon={mode === "view" ? Edit3 : X}
                    label={mode === "view" ? "Edit Profile" : "Cancel"}
                    permission={{ module: 'students.profiles', action: 'edit' }}
                />
            </div>

            <form id="student-profile-form" onSubmit={handleUpdate} className="grid lg:grid-cols-12 gap-10 pb-28">
                <div className="lg:col-span-8 space-y-10">
                    {/* Identity Section */}
                    <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={User} title="Student Identity" />
                        <div className="grid md:grid-cols-2 gap-8 mt-10">
                            <InputField label="First Name" value={student.firstName} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, firstName: v })} error={formErrors.firstName} />
                            <InputField label="Last Name" value={student.lastName} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, lastName: v })} error={formErrors.lastName} />
                            <div className="space-y-2">
                                <label className={cn("text-[10px] font-black uppercase tracking-widest px-1", formErrors.gender ? "text-red-500" : "text-zinc-400")}>Gender{formErrors.gender ? " *" : ""}</label>
                                <select
                                    disabled={isReadOnly}
                                    value={student.gender || ""}
                                    onChange={e => setStudent({ ...student, gender: e.target.value })}
                                    title="Gender"
                                    className={cn(
                                        "w-full bg-zinc-50 border-0 rounded-2xl py-4 px-6 font-bold transition-all disabled:opacity-75 disabled:cursor-not-allowed",
                                        isReadOnly ? "text-zinc-500" : "text-zinc-900 border-2 bg-white border-zinc-100",
                                        formErrors.gender && !isReadOnly && "border-red-400"
                                    )}
                                >
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <InputField
                                label="Date of Birth"
                                type="date"
                                value={formatDateForInput(student.dateOfBirth)}
                                readOnly={isReadOnly}
                                onChange={(v: any) => setStudent({ ...student, dateOfBirth: v })}
                                error={formErrors.dateOfBirth}
                            />
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
                                    <InputField label="Father's Name" value={student.fatherName} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, fatherName: v })} />
                                    <InputField label="Occupation" value={student.fatherOccupation} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, fatherOccupation: v })} />
                                    <PhoneInput label="Phone" value={student.fatherPhone} readOnly={isReadOnly} onChange={(v) => setStudent({ ...student, fatherPhone: v })} />
                                    <InputField label="Email" value={student.fatherEmail} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, fatherEmail: v })} error={formErrors.fatherEmail} />
                                </div>
                            </div>

                            {/* Mother */}
                            <div className="space-y-8 p-8 bg-zinc-50 rounded-[32px] border border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-pink-500" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Mother's Information</h4>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <InputField label="Mother's Name" value={student.motherName} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, motherName: v })} />
                                    <InputField label="Occupation" value={student.motherOccupation} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, motherOccupation: v })} />
                                    <PhoneInput label="Phone" value={student.motherPhone} readOnly={isReadOnly} onChange={(v) => setStudent({ ...student, motherPhone: v })} />
                                    <InputField label="Email" value={student.motherEmail} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, motherEmail: v })} error={formErrors.motherEmail} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <SectionTitle icon={MapPin} title="Residential Address" />
                        <div className="grid md:grid-cols-1 gap-8 mt-10">
                            <InputField label="Full Address" value={student.address} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, address: v })} />
                            <div className="grid md:grid-cols-3 gap-8">
                                <InputField label="Country" value={student.country} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, country: v })} />
                                <InputField label="State" value={student.state} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, state: v })} />
                                <InputField label="City" value={student.city} readOnly={isReadOnly} onChange={(v: any) => setStudent({ ...student, city: v })} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    {/* Enrollment Card */}
                    <div className="bg-zinc-900 rounded-[40px] p-10 text-white shadow-2xl shadow-zinc-900/40 relative overflow-hidden">
                        <SectionTitle icon={Building2} title="Enrollment" light />
                        <div className="space-y-8 mt-10 relative z-10">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Classroom</p>
                                <p className="text-xl font-bold">{student.classroom?.name || "Not Assigned"}</p>
                            </div>
                            <div className="grid gap-6">
                                <InputField label="Admission #" value={student.admissionNumber} readOnly={isReadOnly} light onChange={(v: any) => setStudent({ ...student, admissionNumber: v })} />
                                <InputField label="Roll #" value={student.rollNumber} readOnly={isReadOnly} light onChange={(v: any) => setStudent({ ...student, rollNumber: v })} />
                            </div>
                        </div>
                    </div>

                    {/* Sibling Card */}
                    <div className="bg-white rounded-[40px] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/20">
                        <div className="flex items-center justify-between mb-8">
                            <SectionTitle icon={Activity} title="Siblings" />
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => setIsConnectSiblingOpen(true)}
                                    className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-all"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {siblings.filter((s: any) => s.id !== student.id).map((sib: any) => (
                                <div key={sib.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl group transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center font-bold text-brand">
                                            {sib.firstName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{sib.firstName}</p>
                                            <p className="text-[10px] text-zinc-400 font-black uppercase">{sib.classroom?.name || "Alumni"}</p>
                                        </div>
                                    </div>
                                    {!isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => handleDisconnect(sib.id)}
                                            className="h-8 w-8 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {siblings.filter((s: any) => s.id !== student.id).length === 0 && (
                                <p className="text-xs text-zinc-400 font-medium italic">No siblings connected.</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Fixed bottom action bar */}
            {!isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/90 px-8 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 shadow-2xl">
                    <div className="flex items-center justify-end gap-4 max-w-screen-xl mx-auto">
                        <button
                            type="button"
                            onClick={() => setMode("view")}
                            className="rounded-2xl border border-zinc-200 px-8 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                        >
                            Cancel
                        </button>
                        <StandardActionButton
                            type="submit"
                            form="student-profile-form"
                            loading={isSaving}
                            variant="primary"
                            icon={CheckCircle2}
                            label="Save Profile changes"
                            className="h-12 px-10 rounded-2xl"
                        />
                    </div>
                </div>
            )}

            {isConnectSiblingOpen && (
                <ConnectSiblingDialog
                    isOpen={isConnectSiblingOpen}
                    onClose={() => {
                        setIsConnectSiblingOpen(false);
                        loadData();
                    }}
                    studentId={id}
                    schoolSlug={slug}
                    currentParentPhone={student.parentMobile}
                />
            )}
        </Fragment>
    );
}
