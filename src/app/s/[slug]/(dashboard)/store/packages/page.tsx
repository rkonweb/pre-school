"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Plus, Layers, Users, Package, BookOpen, Shirt, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
    getStorePackagesAction,
    assignPackageToGradeAction,
} from "@/app/actions/store-actions";

const ITEM_TYPE_ICON: Record<string, any> = {
    BOOK: BookOpen,
    UNIFORM: Shirt,
    STATIONERY: Pencil,
    OTHER: Package,
};

const GRADE_OPTIONS = [
    "Nursery", "LKG", "UKG",
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
];

function PackageCard({ pkg, slug, onAssign }: { pkg: any; slug: string; onAssign: (pkg: any) => void }) {
    const effectivePrice = pkg.discountedPrice ?? pkg.totalPrice;
    const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.totalPrice;

    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <Layers className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-sm leading-snug">{pkg.name}</h3>
                            {pkg.gradeLevel && (
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 inline-block">{pkg.gradeLevel}</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        {hasDiscount && (
                            <p className="text-xs text-slate-400 line-through">₹{pkg.totalPrice.toFixed(2)}</p>
                        )}
                        <p className="text-lg font-bold text-slate-900">₹{effectivePrice.toFixed(2)}</p>
                        {pkg.isMandatory && (
                            <span className="inline-block text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mt-0.5">
                                MANDATORY
                            </span>
                        )}
                    </div>
                </div>

                {pkg.description && (
                    <p className="mt-1 mb-3 text-xs text-slate-500 leading-relaxed">{pkg.description}</p>
                )}

                {/* Items List */}
                <div className="space-y-1.5">
                    {pkg.items?.map((pi: any) => {
                        const Icon = ITEM_TYPE_ICON[pi.item?.type] || Package;
                        const hasStock = (pi.item?.inventories?.[0]?.quantity ?? 0) > 0;
                        return (
                            <div key={pi.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{pi.item?.name}</span>
                                    <span className="text-slate-400">×{pi.quantity}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">₹{(pi.item?.price * pi.quantity).toFixed(2)}</span>
                                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${hasStock ? "bg-emerald-400" : "bg-rose-400"}`} title={hasStock ? "In stock" : "Out of stock"} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{pkg._count?.orders ?? 0} assignments</span>
                </div>
                <button
                    onClick={() => onAssign(pkg)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand hover:brightness-110 px-3 py-1.5 rounded-lg transition-all"
                >
                    <Users className="h-3.5 w-3.5" />
                    Assign to Grade
                </button>
            </div>
        </div>
    );
}

function AssignModal({ pkg, onClose, slug }: { pkg: any; onClose: () => void; slug: string }) {
    const [isPending, startTransition] = useTransition();
    const [grade, setGrade] = useState(pkg.gradeLevel || "");

    const handleAssign = () => {
        if (!grade) { toast.error("Select a grade to assign"); return; }
        startTransition(async () => {
            const yearRes = await (await import("@/app/actions/academic-year-actions")).getAcademicYearsAction(slug);
            const activeYear = (yearRes as any)?.data?.find((y: any) => y.isCurrent) || (yearRes as any)?.data?.[0];
            if (!activeYear) { toast.error("No active academic year found"); return; }

            const res = await assignPackageToGradeAction({
                slug,
                packageId: pkg.id,
                academicYearId: activeYear.id,
                grade,
            });

            if (res.success && res.data) {
                toast.success(`Assigned to ${res.data.created} students (${res.data.skipped} already had this package)`);
                onClose();
            } else {
                toast.error(res.error || "Failed to assign package");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Assign Package to Grade</h3>
                <p className="text-sm text-slate-500 mb-5">
                    This will create a mandatory fee for all active students in the selected grade for <strong>{pkg.name}</strong>.
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Grade</label>
                    <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        title="Select Grade"
                        className="w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm bg-slate-50"
                    >
                        <option value="">-- Select Grade --</option>
                        {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 mb-5">
                    ⚠️ Students who already have this package assigned will be automatically skipped.
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={isPending}
                        className="flex-1 rounded-xl bg-brand text-[var(--secondary-color)] py-2.5 text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                        {isPending ? "Assigning..." : "Assign Package"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StorePackagesPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [packages, setPackages] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [assigningPkg, setAssigningPkg] = useState<any>(null);
    const [filterYear, setFilterYear] = useState("");

    const loadData = async () => {
        setIsLoading(true);
        const [pkgRes, yearsRes] = await Promise.all([
            getStorePackagesAction(slug, filterYear || undefined),
            (await import("@/app/actions/academic-year-actions")).getAcademicYearsAction(slug),
        ]);

        if (pkgRes.success) setPackages(pkgRes.data);
        if ((yearsRes as any)?.data) setAcademicYears((yearsRes as any).data);
        setIsLoading(false);
    };

    useEffect(() => { loadData(); }, [slug, filterYear]);

    return (
        <>
            {assigningPkg && (
                <AssignModal pkg={assigningPkg} onClose={() => { setAssigningPkg(null); loadData(); }} slug={slug} />
            )}

            <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Academic Packages</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Grade-wise mandatory bundles — assign to an entire class in one click.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)}
                            title="Filter by Academic Year"
                            className="rounded-xl border-0 py-2.5 px-4 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand bg-white"
                        >
                            <option value="">All Years</option>
                            {academicYears.map((y: any) => (
                                <option key={y.id} value={y.id}>{y.name}</option>
                            ))}
                        </select>
                        <Link
                            href={`/s/${slug}/store/packages/new`}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand text-[var(--secondary-color)] px-5 py-2.5 text-sm font-semibold shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            New Package
                        </Link>
                    </div>
                </div>

                {/* Info banner */}
                <div className="mb-6 rounded-2xl bg-violet-50 border border-violet-100 px-5 py-4 flex gap-4 items-start">
                    <Layers className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-violet-900">How Academic Packages Work</p>
                        <p className="text-xs text-violet-700 mt-0.5 leading-relaxed">
                            Create a package with books, uniforms, shoes etc. Mark it as <strong>Mandatory</strong> and click <strong>Assign to Grade</strong> to automatically generate pending fees for all students in that grade. When a parent pays the fee, inventory is automatically deducted and the sale is recorded in Accounts.
                        </p>
                    </div>
                </div>

                {/* Packages Grid */}
                {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                    </div>
                ) : packages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                            <Layers className="h-8 w-8 text-violet-300" />
                        </div>
                        <h3 className="font-semibold text-slate-700">No packages yet</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-sm">
                            Create your first academic package to bundle required items for a grade.
                        </p>
                        <Link
                            href={`/s/${slug}/store/packages/new`}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand text-[var(--secondary-color)] px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Create First Package
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {packages.map((pkg) => (
                            <PackageCard key={pkg.id} pkg={pkg} slug={slug} onAssign={setAssigningPkg} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
