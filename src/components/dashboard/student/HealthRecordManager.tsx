"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Activity, Plus, Edit, Trash2, Heart, Scale, Ruler, Eye, Smile,
    TrendingUp, Calendar, User, Stethoscope, AlertCircle, Check, X, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    createHealthRecordAction,
    getHealthRecordsAction,
    updateHealthRecordAction,
    deleteHealthRecordAction
} from "@/app/actions/health-record-actions";
import { useConfirm } from "@/contexts/ConfirmContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface HealthRecord {
    id: string;
    height: number;
    heightUnit: string;
    weight: number;
    weightUnit: string;
    bmi: number | null;
    bmiStatus?: string;
    bloodGroup: string | null;
    vision: string | null;
    visionLeft: string | null;
    visionRight: string | null;
    dental: string | null;
    dentalNotes: string | null;
    hearing: string | null;
    bloodPressure: string | null;
    temperature: number | null;
    pulseRate: number | null;
    allergies: string | null;
    medications: string | null;
    chronicConditions: string | null;
    observations: string | null;
    doctorName: string | null;
    nextCheckupDate: Date | null;
    recordedAt: Date;
    recordedByUser: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface Props {
    studentId: string;
    slug: string;
}

export default function HealthRecordManager({ studentId, slug }: Props) {
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
    const { confirm: confirmDialog } = useConfirm();

    const [formData, setFormData] = useState({
        height: "",
        heightUnit: "cm",
        weight: "",
        weightUnit: "kg",
        bloodGroup: "",
        vision: "",
        visionLeft: "",
        visionRight: "",
        dental: "",
        dentalNotes: "",
        hearing: "",
        bloodPressure: "",
        temperature: "",
        pulseRate: "",
        allergies: "",
        medications: "",
        chronicConditions: "",
        observations: "",
        doctorName: "",
        nextCheckupDate: "",
        recordedAt: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        setIsLoading(true);
        const res = await getHealthRecordsAction(slug, studentId);
        if (res.success && res.data) {
            setRecords(res.data);
        } else {
            toast.error(res.error || "Failed to load health records");
        }
        setIsLoading(false);
    };

    const calculateBMI = (weight: number, height: number, weightUnit: string, heightUnit: string) => {
        let weightKg = weight;
        let heightCm = height;

        if (weightUnit === "lbs") weightKg = weight * 0.453592;
        if (heightUnit === "ft") heightCm = height * 30.48;

        const heightM = heightCm / 100;
        return heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : "0";
    };

    const getBMIClass = (bmi: number) => {
        if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600 bg-blue-50" };
        if (bmi < 25) return { label: "Normal", color: "text-green-600 bg-green-50" };
        if (bmi < 30) return { label: "Overweight", color: "text-yellow-600 bg-yellow-50" };
        return { label: "Obese", color: "text-red-600 bg-red-50" };
    };

    const currentBMI = formData.height && formData.weight
        ? parseFloat(calculateBMI(
            parseFloat(formData.weight),
            parseFloat(formData.height),
            formData.weightUnit,
            formData.heightUnit
        ))
        : 0;

    const bmiInfo = getBMIClass(currentBMI);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const data = {
            height: parseFloat(formData.height),
            heightUnit: formData.heightUnit,
            weight: parseFloat(formData.weight),
            weightUnit: formData.weightUnit,
            bloodGroup: formData.bloodGroup || undefined,
            vision: formData.vision || undefined,
            visionLeft: formData.visionLeft || undefined,
            visionRight: formData.visionRight || undefined,
            dental: formData.dental || undefined,
            dentalNotes: formData.dentalNotes || undefined,
            hearing: formData.hearing || undefined,
            bloodPressure: formData.bloodPressure || undefined,
            temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
            pulseRate: formData.pulseRate ? parseInt(formData.pulseRate) : undefined,
            allergies: formData.allergies || undefined,
            medications: formData.medications || undefined,
            chronicConditions: formData.chronicConditions || undefined,
            observations: formData.observations || undefined,
            doctorName: formData.doctorName || undefined,
            nextCheckupDate: formData.nextCheckupDate ? new Date(formData.nextCheckupDate) : undefined,
            recordedAt: new Date(formData.recordedAt)
        };

        let res;
        if (editingRecord) {
            res = await updateHealthRecordAction(slug, editingRecord.id, data);
        } else {
            res = await createHealthRecordAction(slug, studentId, data);
        }

        setIsSaving(false);

        if (res.success) {
            toast.success(editingRecord ? "Health record updated" : "Health record added");
            setShowForm(false);
            setEditingRecord(null);
            resetForm();
            loadRecords();
        } else {
            toast.error(res.error || "Failed to save health record");
        }
    };

    const handleEdit = (record: HealthRecord) => {
        setEditingRecord(record);
        setFormData({
            height: record.height.toString(),
            heightUnit: record.heightUnit,
            weight: record.weight.toString(),
            weightUnit: record.weightUnit,
            bloodGroup: record.bloodGroup || "",
            vision: record.vision || "",
            visionLeft: record.visionLeft || "",
            visionRight: record.visionRight || "",
            dental: record.dental || "",
            dentalNotes: record.dentalNotes || "",
            hearing: record.hearing || "",
            bloodPressure: record.bloodPressure || "",
            temperature: record.temperature?.toString() || "",
            pulseRate: record.pulseRate?.toString() || "",
            allergies: record.allergies || "",
            medications: record.medications || "",
            chronicConditions: record.chronicConditions || "",
            observations: record.observations || "",
            doctorName: record.doctorName || "",
            nextCheckupDate: record.nextCheckupDate ? format(new Date(record.nextCheckupDate), "yyyy-MM-dd") : "",
            recordedAt: format(new Date(record.recordedAt), "yyyy-MM-dd")
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Delete Health Record",
            message: "Are you sure you want to delete this health record? This action cannot be undone.",
            variant: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        const res = await deleteHealthRecordAction(slug, id);
        if (res.success) {
            toast.success("Health record deleted");
            loadRecords();
        } else {
            toast.error(res.error || "Failed to delete record");
        }
    };

    const resetForm = () => {
        setFormData({
            height: "",
            heightUnit: "cm",
            weight: "",
            weightUnit: "kg",
            bloodGroup: "",
            vision: "",
            visionLeft: "",
            visionRight: "",
            dental: "",
            dentalNotes: "",
            hearing: "",
            bloodPressure: "",
            temperature: "",
            pulseRate: "",
            allergies: "",
            medications: "",
            chronicConditions: "",
            observations: "",
            doctorName: "",
            nextCheckupDate: "",
            recordedAt: new Date().toISOString().split('T')[0]
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingRecord(null);
        resetForm();
    };

    // Prepare growth chart data
    const growthData = records.slice().reverse().map(r => ({
        date: format(new Date(r.recordedAt), "MMM yy"),
        height: r.height,
        weight: r.weight,
        bmi: r.bmi || 0
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Heart className="h-6 w-6 text-red-500" />
                        Health Records
                    </h2>
                    <p className="text-muted-foreground text-sm">Track physical measurements, medical history, and health checks</p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="bg-brand hover:brightness-110 text-[var(--secondary-color)] gap-2">
                        <Plus className="h-4 w-4" />
                        Add Health Record
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <Card className="border-2 border-brand/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-brand" />
                            {editingRecord ? "Edit Health Record" : "New Health Record"}
                        </CardTitle>
                        <CardDescription>Record student's physical measurements and medical information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Physical Measurements */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Physical Measurements
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Height *</label>
                                        <div className="flex gap-2 w-full">
                                            <Input
                                                type="number"
                                                step="0.1"
                                                required
                                                placeholder="Enter height"
                                                value={formData.height}
                                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                                                className="flex-1 min-w-[120px]"
                                            />
                                            <Select value={formData.heightUnit} onValueChange={v => setFormData({ ...formData, heightUnit: v })}>
                                                <SelectTrigger className="w-24">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cm">cm</SelectItem>
                                                    <SelectItem value="ft">ft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Weight *</label>
                                        <div className="flex gap-2 w-full">
                                            <Input
                                                type="number"
                                                step="0.1"
                                                required
                                                placeholder="Enter weight"
                                                value={formData.weight}
                                                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                                className="flex-1 min-w-[120px]"
                                            />
                                            <Select value={formData.weightUnit} onValueChange={v => setFormData({ ...formData, weightUnit: v })}>
                                                <SelectTrigger className="w-24">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kg">kg</SelectItem>
                                                    <SelectItem value="lbs">lbs</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* BMI Calculator */}
                                {currentBMI > 0 && (
                                    <div className={`p-4 rounded-lg border-2 ${bmiInfo.color} border-current/20`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider opacity-70">Calculated BMI</p>
                                                <p className="text-2xl font-bold">{currentBMI}</p>
                                            </div>
                                            <Badge className={`${bmiInfo.color} border-current text-base px-3 py-1`}>
                                                {bmiInfo.label}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Blood Group</label>
                                        <Select value={formData.bloodGroup} onValueChange={v => setFormData({ ...formData, bloodGroup: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A+">A+</SelectItem>
                                                <SelectItem value="A-">A-</SelectItem>
                                                <SelectItem value="B+">B+</SelectItem>
                                                <SelectItem value="B-">B-</SelectItem>
                                                <SelectItem value="AB+">AB+</SelectItem>
                                                <SelectItem value="AB-">AB-</SelectItem>
                                                <SelectItem value="O+">O+</SelectItem>
                                                <SelectItem value="O-">O-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Blood Pressure</label>
                                        <Input
                                            placeholder="e.g., 120/80"
                                            value={formData.bloodPressure}
                                            onChange={e => setFormData({ ...formData, bloodPressure: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Temperature (°F)</label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g., 98.6"
                                            value={formData.temperature}
                                            onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Pulse Rate (bpm)</label>
                                        <Input
                                            type="number"
                                            placeholder="e.g., 72"
                                            value={formData.pulseRate}
                                            onChange={e => setFormData({ ...formData, pulseRate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Diagnostics */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Diagnostics
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Vision (Left)</label>
                                        <Input
                                            placeholder="e.g., 20/20"
                                            value={formData.visionLeft}
                                            onChange={e => setFormData({ ...formData, visionLeft: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Vision (Right)</label>
                                        <Input
                                            placeholder="e.g., 20/20"
                                            value={formData.visionRight}
                                            onChange={e => setFormData({ ...formData, visionRight: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Hearing</label>
                                        <Select value={formData.hearing} onValueChange={v => setFormData({ ...formData, hearing: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="Impaired">Impaired</SelectItem>
                                                <SelectItem value="Requires Testing">Requires Testing</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Dental Status</label>
                                        <Select value={formData.dental} onValueChange={v => setFormData({ ...formData, dental: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Excellent">Excellent</SelectItem>
                                                <SelectItem value="Good">Good</SelectItem>
                                                <SelectItem value="Fair">Fair</SelectItem>
                                                <SelectItem value="Poor">Poor</SelectItem>
                                                <SelectItem value="Requires Attention">Requires Attention</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Dental Notes</label>
                                        <Input
                                            placeholder="Additional dental observations"
                                            value={formData.dentalNotes}
                                            onChange={e => setFormData({ ...formData, dentalNotes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Medical Information */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Medical Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Allergies</label>
                                        <Textarea
                                            placeholder="List any known allergies (e.g., peanuts, penicillin)"
                                            value={formData.allergies}
                                            onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Current Medications</label>
                                        <Textarea
                                            placeholder="List current medications and dosages"
                                            value={formData.medications}
                                            onChange={e => setFormData({ ...formData, medications: e.target.value })}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Chronic Conditions</label>
                                        <Textarea
                                            placeholder="List any chronic health conditions (e.g., asthma, diabetes)"
                                            value={formData.chronicConditions}
                                            onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">General Observations</label>
                                        <Textarea
                                            placeholder="Doctor's notes and general health observations"
                                            value={formData.observations}
                                            onChange={e => setFormData({ ...formData, observations: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Checkup Details */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Checkup Details
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Doctor's Name</label>
                                        <Input
                                            placeholder="e.g., Dr. John Smith"
                                            value={formData.doctorName}
                                            onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Checkup Date *</label>
                                        <Input
                                            type="date"
                                            required
                                            value={formData.recordedAt}
                                            onChange={e => setFormData({ ...formData, recordedAt: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase">Next Checkup</label>
                                        <Input
                                            type="date"
                                            value={formData.nextCheckupDate}
                                            onChange={e => setFormData({ ...formData, nextCheckupDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button type="submit" disabled={isSaving} className="bg-brand hover:brightness-110 text-[var(--secondary-color)]">
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            {editingRecord ? "Update Record" : "Save Record"}
                                        </>
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Growth Charts */}
            {records.length > 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-brand" />
                                Height & Weight Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                                    <YAxis yAxisId="left" style={{ fontSize: '12px' }} />
                                    <YAxis yAxisId="right" orientation="right" style={{ fontSize: '12px' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="height" stroke="#8b5cf6" name="Height (cm)" strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#10b981" name="Weight (kg)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Scale className="h-4 w-4 text-brand" />
                                BMI Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                                    <YAxis domain={[0, 40]} style={{ fontSize: '12px' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="bmi" stroke="#f59e0b" name="BMI" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Health Records History */}
            <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand" />
                    Health History ({records.length})
                </h3>

                {records.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No health records yet</p>
                            <p className="text-sm text-slate-400 mt-1">Click "Add Health Record" to create the first checkup entry</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {records.map(record => (
                            <Card key={record.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
                                                <Stethoscope className="h-6 w-6 text-brand" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{format(new Date(record.recordedAt), "MMMM d, yyyy")}</p>
                                                <p className="text-xs text-slate-500">
                                                    Recorded by {record.recordedByUser.firstName} {record.recordedByUser.lastName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Physical Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <p className="text-[10px] font-bold uppercase text-purple-600 mb-1 flex items-center gap-1">
                                                <Ruler className="h-3 w-3" /> Height
                                            </p>
                                            <p className="font-bold text-lg text-purple-900">{record.height.toFixed(1)} cm</p>
                                        </div>

                                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-[10px] font-bold uppercase text-green-600 mb-1 flex items-center gap-1">
                                                <Scale className="h-3 w-3" /> Weight
                                            </p>
                                            <p className="font-bold text-lg text-green-900">{record.weight.toFixed(1)} kg</p>
                                        </div>

                                        {record.bmi && (
                                            <div className={`p-3 rounded-lg border ${getBMIClass(record.bmi).color} border-current/20`}>
                                                <p className="text-[10px] font-bold uppercase opacity-70 mb-1">BMI</p>
                                                <p className="font-bold text-lg">{record.bmi.toFixed(1)}</p>
                                                <p className="text-[10px] font-bold uppercase mt-0.5">{record.bmiStatus}</p>
                                            </div>
                                        )}

                                        {record.bloodGroup && (
                                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                                <p className="text-[10px] font-bold uppercase text-red-600 mb-1 flex items-center gap-1">
                                                    <Heart className="h-3 w-3" /> Blood
                                                </p>
                                                <p className="font-bold text-lg text-red-900">{record.bloodGroup}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Detailed Information */}
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        {(record.visionLeft || record.visionRight) && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> Vision
                                                </p>
                                                <p className="text-slate-700">
                                                    L: {record.visionLeft || "N/A"} | R: {record.visionRight || "N/A"}
                                                </p>
                                            </div>
                                        )}

                                        {record.dental && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                    <Smile className="h-3 w-3" /> Dental
                                                </p>
                                                <p className="text-slate-700">
                                                    {record.dental}
                                                    {record.dentalNotes && ` - ${record.dentalNotes}`}
                                                </p>
                                            </div>
                                        )}

                                        {record.bloodPressure && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Blood Pressure</p>
                                                <p className="text-slate-700">{record.bloodPressure} mmHg</p>
                                            </div>
                                        )}

                                        {record.temperature && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Temperature</p>
                                                <p className="text-slate-700">{record.temperature}°F</p>
                                            </div>
                                        )}

                                        {record.allergies && (
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3 text-red-500" /> Allergies
                                                </p>
                                                <p className="text-slate-700">{record.allergies}</p>
                                            </div>
                                        )}

                                        {record.medications && (
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Medications</p>
                                                <p className="text-slate-700">{record.medications}</p>
                                            </div>
                                        )}

                                        {record.observations && (
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Observations</p>
                                                <p className="text-slate-700">{record.observations}</p>
                                            </div>
                                        )}

                                        {record.doctorName && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                    <User className="h-3 w-3" /> Doctor
                                                </p>
                                                <p className="text-slate-700">{record.doctorName}</p>
                                            </div>
                                        )}

                                        {record.nextCheckupDate && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Next Checkup</p>
                                                <p className="text-slate-700">{format(new Date(record.nextCheckupDate), "MMM d, yyyy")}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
