"use client";

import { useState, useTransition, useEffect } from "react";
import { useParams } from "next/navigation";
import { Package, Sparkles, CheckCircle, BookOpen, Plus } from "lucide-react";
import { getStorePackagesAction, createStoreOrderAction } from "@/app/actions/store-actions";
import { toast } from "sonner";

export default function ParentStore() {
    const params = useParams();
    const schoolId = params.slug as string;
    const parentId = params.parentId as string;
    const studentId = params.studentId as string;

    const [isPending, startTransition] = useTransition();
    const [packages, setPackages] = useState<any[]>([]);

    useEffect(() => {
        const loadPackages = async () => {
            // Passing classId here would be ideal in a real app to filter correct packages.
            // Using a mock classId to demonstrate loading generic packages via the action.
            const res = await getStorePackagesAction(schoolId, "mock-class-id");
            if (res.success && res.data) {
                setPackages(res.data);
            }
        };
        loadPackages();
    }, [schoolId]);

    const handleOrderPackage = (packageId: string) => {
        startTransition(async () => {
            const res = await createStoreOrderAction(studentId, schoolId, packageId);
            if (res.success) {
                toast.success("Standard package ordered successfully! Payment added to upcoming fees.");
                // Optionally disable the button or show status.
            } else {
                toast.error(res.error || "Failed to order package");
            }
        });
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in pb-20">
            {/* Header section with brand colored background */}
            <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-10 shadow-2xl sm:px-12 sm:py-16">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="relative z-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl mb-6 ring-1 ring-white/30 shadow-lg">
                        <Package className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                    <h1 className="text-3xl font-black text-white sm:text-4xl drop-shadow-sm mb-4">
                        School Store & Issuance
                    </h1>
                    <p className="mx-auto max-w-xl text-brand-100 sm:text-lg">
                        View required standard items for the academic year, or request extra supplies securely via your profile.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                {packages.length === 0 ? (
                    <div className="col-span-full rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
                        <Sparkles className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No Standard Packages</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            There are currently no standard issue packages assigned for this academic period.
                        </p>
                    </div>
                ) : (
                    packages.map((pkg) => (
                        <div key={pkg.id} className="flex flex-col rounded-3xl bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-200 overflow-hidden relative group transition-transform hover:-translate-y-1 duration-300">
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 sm:p-8 flex-1 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                                <p className="text-sm text-slate-500">{pkg.description || "Standard issue package."}</p>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <BookOpen className="h-5 w-5 text-brand-500" />
                                        Package Contents:
                                    </div>
                                    <ul className="space-y-3 pl-7">
                                        {pkg.items.map((pkgItem: any) => (
                                            <li key={pkgItem.id} className="flex items-start gap-2 text-sm text-slate-600 relative">
                                                <div className="absolute -left-6 top-1 h-1.5 w-1.5 rounded-full bg-brand-400"></div>
                                                <span className="font-medium mr-1 text-slate-800">{pkgItem.quantity}x</span>
                                                <span>{pkgItem.item.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white p-6 sm:p-8 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Total Cost</p>
                                    <p className="text-2xl font-bold text-slate-900">${pkg.items.reduce((acc: number, item: any) => acc + (item.item.price * item.quantity), 0).toFixed(2)}</p>
                                </div>
                                <button
                                    disabled={isPending}
                                    onClick={() => handleOrderPackage(pkg.id)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-500 hover:shadow-brand-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {isPending ? "Processing..." : "Request Issue"}
                                    <CheckCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Future Placeholder for individual piecemeal ordering */}
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <Plus className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                <h3 className="text-sm font-semibold text-slate-900">Need Extra Supplies?</h3>
                <p className="mt-1 text-sm text-slate-500">Contact the front desk to order individual stationary and uniform items manually at this time.</p>
            </div>
        </div>
    );
}
