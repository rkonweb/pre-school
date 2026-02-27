"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { subscribeStudentToPackageAction, cancelCanteenSubscriptionAction } from "@/app/actions/canteen-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    Search, Plus, Users, CalendarDays, Package2,
    CheckCircle, XCircle, Building2, RefreshCw, Loader2, Filter
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

type Subscription = {
    id: string;
    studentId: string;
    student: { firstName: string; lastName: string; admissionNumber: string };
    package: { name: string; packageType: string; includedMeals: string };
    billingCycle: string;
    feeAmount: number;
    status: string;
    startDate: string;
};
type Package = { id: string; name: string; packageType: string; includedMeals: string; monthlyFee: number; yearlyFee: number; isActive: boolean };
type Student = { id: string; firstName: string; lastName: string; admissionNumber: string; classroom?: { name: string } };

export default function CanteenBillingClient({
    slug,
    subscriptions: initialSubscriptions,
    packages,
    students,
}: {
    slug: string;
    subscriptions: Subscription[];
    packages: Package[];
    students: Student[];
}) {
    const { currency } = useSidebar();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "ALL">("ACTIVE");
    const [showAssign, setShowAssign] = useState(false);
    const [assignForm, setAssignForm] = useState({ studentSearch: "", studentId: "", packageId: "", billingCycle: "MONTHLY" });
    const [studentResults, setStudentResults] = useState<Student[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);

    const refresh = useCallback(() => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    }, [router]);

    const filteredSubs = subscriptions.filter(s => {
        const matchesSearch = search === "" ||
            `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
            s.student.admissionNumber.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStudentSearchChange = (val: string) => {
        setAssignForm(f => ({ ...f, studentSearch: val, studentId: "" }));
        setStudentResults(val.length > 1 ? students.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(val.toLowerCase()) ||
            s.admissionNumber.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 8) : []);
    };

    const selectStudent = (s: Student) => {
        setAssignForm(f => ({ ...f, studentId: s.id, studentSearch: `${s.firstName} ${s.lastName} (${s.admissionNumber})` }));
        setStudentResults([]);
    };

    const openAssignDialog = () => {
        setAssignForm({ studentSearch: "", studentId: "", packageId: "", billingCycle: "MONTHLY" });
        setStudentResults([]);
        setShowAssign(true);
    };

    const handleAssign = () => {
        if (!assignForm.studentId) { toast.error("Please select a student from the dropdown."); return; }
        if (!assignForm.packageId) { toast.error("Please select a package."); return; }

        startTransition(async () => {
            const res = await subscribeStudentToPackageAction(slug, {
                studentId: assignForm.studentId,
                packageId: assignForm.packageId,
                billingCycle: assignForm.billingCycle as "MONTHLY" | "YEARLY",
            });
            if (res.success && res.data) {
                toast.success("✅ Subscription assigned and fee invoice created!");
                setShowAssign(false);
                setAssignForm({ studentSearch: "", studentId: "", packageId: "", billingCycle: "MONTHLY" });

                // Optimistic: add to local state immediately
                const pkg = packages.find(p => p.id === assignForm.packageId);
                const student = students.find(s => s.id === assignForm.studentId);
                if (pkg && student) {
                    const feeAmount = assignForm.billingCycle === "YEARLY" ? pkg.yearlyFee : pkg.monthlyFee;
                    const newSub: Subscription = {
                        id: (res.data as any).id,
                        studentId: assignForm.studentId,
                        student: { firstName: student.firstName, lastName: student.lastName, admissionNumber: student.admissionNumber },
                        package: { name: pkg.name, packageType: pkg.packageType, includedMeals: pkg.includedMeals },
                        billingCycle: assignForm.billingCycle,
                        feeAmount,
                        status: "ACTIVE",
                        startDate: new Date().toISOString(),
                    };
                    setSubscriptions(prev => [
                        ...prev.map(s => s.studentId === assignForm.studentId && s.status === "ACTIVE"
                            ? { ...s, status: "CANCELLED" } : s),
                        newSub,
                    ]);
                    setStatusFilter("ACTIVE"); // switch to Active tab to show the new sub
                }
                refresh();
            } else {
                toast.error(res.error ?? "Failed to assign package.");
            }
        });
    };

    const handleCancel = (id: string) => {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: "CANCELLED" } : s));
        startTransition(async () => {
            const res = await cancelCanteenSubscriptionAction(slug, id);
            if (res.success) {
                toast.success("Subscription cancelled.");
                refresh();
            } else {
                toast.error(res.error ?? "Failed to cancel.");
                setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: "ACTIVE" } : s));
            }
        });
    };

    const pkgTypeIcon = (type: string) =>
        type === "HOSTEL_PACKAGE"
            ? <Building2 className="h-3.5 w-3.5 text-purple-500" />
            : <Users className="h-3.5 w-3.5 text-blue-500" />;

    const activeCount = subscriptions.filter(s => s.status === "ACTIVE").length;
    const hostelCount = subscriptions.filter(s => s.status === "ACTIVE" && s.package?.packageType === "HOSTEL_PACKAGE").length;
    const dayCount = subscriptions.filter(s => s.status === "ACTIVE" && s.package?.packageType === "DAY_SCHOLAR").length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Canteen Subscriptions</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage student meal plan subscriptions and invoicing.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing} className="gap-2">
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button onClick={openAssignDialog} className="gap-2">
                        <Plus className="h-4 w-4" />Assign Package
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Subscribers</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{activeCount}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Hostel Packages</p>
                    <p className="text-3xl font-black text-orange-700 mt-1">{hostelCount}</p>
                </div>
                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Day Scholar Plans</p>
                    <p className="text-3xl font-black text-blue-700 mt-1">{dayCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search student..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setStatusFilter("ACTIVE")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${statusFilter === "ACTIVE" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${statusFilter === "ALL" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        All History
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {isRefreshing && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200 text-xs font-semibold text-orange-700">
                        <Loader2 className="h-3 w-3 animate-spin" /> Syncing latest data...
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Student</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Package</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Meals</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Cycle</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Fee</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Action</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSubs.map(sub => (
                                <tr key={sub.id} className={`hover:bg-slate-50/60 transition-all ${sub.status !== "ACTIVE" ? "opacity-60" : ""}`}>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800">{sub.student.firstName} {sub.student.lastName}</p>
                                        <p className="text-xs text-slate-500">{sub.student.admissionNumber}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {pkgTypeIcon(sub.package?.packageType)}
                                            <span className="font-medium text-slate-700">{sub.package?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {sub.package?.includedMeals?.split(",").map((m: string) => (
                                                <span key={m} className="text-[10px] bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full capitalize">{m.toLowerCase()}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <CalendarDays className="h-3.5 w-3.5" />{sub.billingCycle}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-slate-900">{currency}{sub.feeAmount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {sub.status === "ACTIVE" ? (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full w-fit">
                                                <CheckCircle className="h-3 w-3" />Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                                                <XCircle className="h-3 w-3" />{sub.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {sub.status === "ACTIVE" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                                                onClick={() => handleCancel(sub.id)}
                                                disabled={isPending}
                                            >
                                                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredSubs.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                                    <Package2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm font-medium">
                                        {statusFilter === "ACTIVE" ? "No active subscriptions. Click \"Assign Package\" to get started." : "No subscriptions found."}
                                    </p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Dialog */}
            <Dialog open={showAssign} onOpenChange={(open) => { setShowAssign(open); if (!open) setStudentResults([]); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Canteen Package</DialogTitle>
                        <DialogDescription>Subscribe a student to a meal plan. A fee invoice will be auto-generated.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">

                        {/* Student Search */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">Student *</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                                <Input
                                    id="billing-student-search"
                                    placeholder="Type student name or admission no..."
                                    className="pl-9"
                                    value={assignForm.studentSearch}
                                    onChange={e => handleStudentSearchChange(e.target.value)}
                                    autoComplete="off"
                                />
                                {studentResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {studentResults.map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => selectStudent(s)}
                                                className="w-full text-left px-3 py-2.5 hover:bg-orange-50 flex items-center gap-3 text-sm border-b border-slate-100 last:border-0"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {s.firstName[0]}{s.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{s.firstName} {s.lastName}</p>
                                                    <p className="text-xs text-slate-500">{s.admissionNumber}{s.classroom?.name ? ` · ${s.classroom.name}` : ""}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {assignForm.studentId && (
                                <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Student selected
                                </p>
                            )}
                        </div>

                        {/* Package Select */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">Package *</label>
                            <Select value={assignForm.packageId} onValueChange={v => setAssignForm(f => ({ ...f, packageId: v }))}>
                                <SelectTrigger id="billing-package-select" title="Select Package">
                                    <SelectValue placeholder="Select a meal package..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {packages.length === 0 && (
                                        <div className="px-4 py-3 text-sm text-slate-400">
                                            No packages found. Create one first at Canteen → Packages.
                                        </div>
                                    )}
                                    {packages.filter(p => p.isActive).map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            <div className="flex items-center gap-2">
                                                {pkgTypeIcon(p.packageType)}
                                                <span>{p.name}</span>
                                                <span className="text-xs text-slate-400">
                                                    {currency}{p.monthlyFee}/mo · {currency}{p.yearlyFee}/yr
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Billing Cycle */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1 block">Billing Cycle *</label>
                            <Select value={assignForm.billingCycle} onValueChange={v => setAssignForm(f => ({ ...f, billingCycle: v }))}>
                                <SelectTrigger id="billing-cycle-select" title="Billing Cycle"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="YEARLY">Yearly (Save more!)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fee Preview */}
                        {assignForm.packageId && (() => {
                            const pkg = packages.find(p => p.id === assignForm.packageId);
                            if (!pkg) return null;
                            const fee = assignForm.billingCycle === "YEARLY" ? pkg.yearlyFee : pkg.monthlyFee;
                            return (
                                <div className="bg-orange-50 rounded-xl p-3 border border-orange-200 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Invoice to be created</p>
                                        <p className="text-sm font-medium text-orange-800 mt-0.5">{pkg.name} · {assignForm.billingCycle}</p>
                                    </div>
                                    <span className="text-2xl font-black text-orange-700">{currency}{fee.toLocaleString()}</span>
                                </div>
                            );
                        })()}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
                            <Button
                                id="billing-assign-submit"
                                onClick={handleAssign}
                                disabled={isPending || !assignForm.studentId || !assignForm.packageId}
                            >
                                {isPending
                                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Assigning...</>
                                    : "Assign & Create Invoice"
                                }
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
