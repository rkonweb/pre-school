"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCanteenPackageAction, updateCanteenPackageAction, deleteCanteenPackageAction } from "@/app/actions/canteen-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Utensils, Plus, Pencil, Trash2, Building2, Users, CheckCircle2, Coffee, CupSoda } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const MEAL_OPTIONS = [
    { id: "BREAKFAST", label: "Breakfast", icon: Coffee },
    { id: "LUNCH", label: "Lunch", icon: Utensils },
    { id: "SNACKS", label: "Snacks", icon: CupSoda },
    { id: "DINNER", label: "Dinner", icon: Utensils },
];

type Pkg = { id: string; name: string; description?: string; includedMeals: string; monthlyFee: number; yearlyFee: number; packageType: string; isActive: boolean };

export default function CanteenPackagesClient({ slug, packages }: { slug: string; packages: Pkg[]; items: any[] }) {
    const { currency } = useSidebar();
    const [isPending, startTransition] = useTransition();
    const [showForm, setShowForm] = useState(false);
    const [editPkg, setEditPkg] = useState<Pkg | null>(null);
    const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
    const [form, setForm] = useState({ name: "", description: "", monthlyFee: "", yearlyFee: "", packageType: "DAY_SCHOLAR" });

    const openCreate = () => {
        setEditPkg(null);
        setForm({ name: "", description: "", monthlyFee: "", yearlyFee: "", packageType: "DAY_SCHOLAR" });
        setSelectedMeals([]);
        setShowForm(true);
    };

    const openEdit = (pkg: Pkg) => {
        setEditPkg(pkg);
        setForm({ name: pkg.name, description: pkg.description ?? "", monthlyFee: String(pkg.monthlyFee), yearlyFee: String(pkg.yearlyFee), packageType: pkg.packageType });
        setSelectedMeals(pkg.includedMeals.split(","));
        setShowForm(true);
    };

    const toggleMeal = (meal: string) => {
        setSelectedMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]);
    };

    const handleSave = () => {
        if (!form.name || selectedMeals.length === 0) { toast.error("Package name and at least one meal type are required."); return; }
        startTransition(async () => {
            const payload = { name: form.name, description: form.description, includedMeals: selectedMeals.join(","), monthlyFee: parseFloat(form.monthlyFee) || 0, yearlyFee: parseFloat(form.yearlyFee) || 0, packageType: form.packageType };
            const res = editPkg ? await updateCanteenPackageAction(slug, editPkg.id, payload) : await createCanteenPackageAction(slug, payload);
            if (res.success) { toast.success(editPkg ? "Package updated" : "Package created"); setShowForm(false); }
            else toast.error(res.error ?? "Failed to save package");
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const res = await deleteCanteenPackageAction(slug, id);
            if (res.success) toast.success("Package deleted");
            else toast.error(res.error ?? "Failed to delete");
        });
    };

    const typeIcon = (type: string) => type === "HOSTEL_PACKAGE" ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />;
    const typeLabel = (type: string) => type === "HOSTEL_PACKAGE" ? "Hostel Package" : "Day Scholar";
    const typeColor = (type: string) => type === "HOSTEL_PACKAGE" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Canteen Packages</h1>
                    <p className="text-sm text-slate-500 mt-1">Define pre-paid meal plans for Hostel residents and Day Scholars.</p>
                </div>
                <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />New Package</Button>
            </div>

            {packages.length === 0 && (
                <Card className="shadow-sm text-center py-16">
                    <CardContent>
                        <Utensils className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="font-semibold text-slate-600">No Packages Yet</p>
                        <p className="text-sm text-slate-400 mt-1">Create your first canteen package to get started.</p>
                        <Button onClick={openCreate} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create Package</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {packages.map(pkg => (
                    <Card key={pkg.id} className={`shadow-sm border-2 ${pkg.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60'}`}>
                        <CardHeader className="pb-3 flex-row items-center justify-between gap-4">
                            <CardTitle className="text-base font-bold text-slate-800 leading-tight">{pkg.name}</CardTitle>
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor(pkg.packageType)}`}>
                                {typeIcon(pkg.packageType)} {typeLabel(pkg.packageType)}
                            </span>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pkg.description && <p className="text-xs text-slate-500">{pkg.description}</p>}
                            <div className="flex flex-wrap gap-1.5">
                                {pkg.includedMeals.split(",").map(m => (
                                    <span key={m} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 font-medium px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="h-3 w-3" />{m.charAt(0) + m.slice(1).toLowerCase()}
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-4 pt-2">
                                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-500 font-medium">Monthly</p>
                                    <p className="text-lg font-black text-slate-800">{currency}{pkg.monthlyFee.toLocaleString()}</p>
                                </div>
                                <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-green-600 font-medium">Yearly</p>
                                    <p className="text-lg font-black text-green-800">{currency}{pkg.yearlyFee.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => openEdit(pkg)}><Pencil className="h-3 w-3" />Edit</Button>
                                <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(pkg.id)}><Trash2 className="h-3 w-3" />Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editPkg ? "Edit Package" : "Create New Package"}</DialogTitle>
                        <DialogDescription>Define a meal plan including pricing and which meals are covered.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div><label className="text-sm font-medium text-slate-700 mb-1 block">Package Name *</label>
                            <Input placeholder="e.g. Hostel Full Board" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} /></div>
                        <div><label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                            <Textarea placeholder="Short description..." value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} rows={2} /></div>
                        <div><label className="text-sm font-medium text-slate-700 mb-1 block">Package Type *</label>
                            <Select value={form.packageType} onValueChange={v => setForm(s => ({ ...s, packageType: v }))}>
                                <SelectTrigger title="Package Type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HOSTEL_PACKAGE">Hostel Package</SelectItem>
                                    <SelectItem value="DAY_SCHOLAR">Day Scholar</SelectItem>
                                </SelectContent>
                            </Select></div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Included Meals *</label>
                            <div className="flex flex-wrap gap-2">
                                {MEAL_OPTIONS.map(m => (
                                    <button key={m.id} type="button" onClick={() => toggleMeal(m.id)}
                                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium border transition-all ${selectedMeals.includes(m.id) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-300'}`}>
                                        {selectedMeals.includes(m.id) && <CheckCircle2 className="h-3.5 w-3.5" />}{m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Monthly Fee ({currency})</label>
                                <Input type="number" placeholder="0.00" value={form.monthlyFee} onChange={e => setForm(s => ({ ...s, monthlyFee: e.target.value }))} /></div>
                            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Yearly Fee ({currency})</label>
                                <Input type="number" placeholder="0.00" value={form.yearlyFee} onChange={e => setForm(s => ({ ...s, yearlyFee: e.target.value }))} /></div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : (editPkg ? "Update Package" : "Create Package")}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
