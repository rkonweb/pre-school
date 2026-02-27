"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitPublicApplicationAction } from "@/app/actions/public-admission-actions";

export default function ApplicationFormPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: 3,
        program: "PRE-K",
        primaryParentName: "",
        primaryParentPhone: "",
        primaryParentEmail: "",
        address: "",
        city: "",
        zipCode: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // In a real app with strict security, this would be a server-checked HttpOnly cookie.
        // For this prototype, we rely on session storage set by the OTP page.
        const phone = sessionStorage.getItem("verified_application_phone");
        if (!phone) {
            toast.error("Please verify your phone number first.");
            router.push(`/s/${params.slug}/apply`);
        } else {
            setVerifiedPhone(phone);
            setFormData(prev => ({ ...prev, primaryParentPhone: phone }));
        }
    }, [params.slug, router]);

    const validateStep = (currentStep: number) => {
        let stepErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.primaryParentName.trim()) {
                stepErrors.primaryParentName = "Name is required";
                isValid = false;
            }
            if (formData.primaryParentEmail && !z.string().email().safeParse(formData.primaryParentEmail).success) {
                stepErrors.primaryParentEmail = "Invalid email format";
                isValid = false;
            }
        } else if (currentStep === 2) {
            if (!formData.firstName.trim()) {
                stepErrors.firstName = "First name is required";
                isValid = false;
            }
            if (!formData.lastName.trim()) {
                stepErrors.lastName = "Last name is required";
                isValid = false;
            }
            if (formData.age < 1 || formData.age > 18) {
                stepErrors.age = "Please enter a valid age";
                isValid = false;
            }
        }

        setErrors(stepErrors);
        return isValid;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep((s) => s + 1);
        }
    };

    const prevStep = () => setStep((s) => s - 1);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (step < 3) return; // Prevent accidental early submission

        setIsLoading(true);
        try {
            const result = await submitPublicApplicationAction(params.slug, formData);

            if (result.success) {
                toast.success("Application submitted successfully!");
                router.push(`/s/${params.slug}/apply/status`);
            } else {
                toast.error(result.error || "Submission failed");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    if (!verifiedPhone) return null; // Avoid flashing the form before redirect

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admissions Application</h1>
                    <p className="mt-2 text-slate-500">Fill out the details below to complete your child's application.</p>
                </div>

                {/* Progress Tracker */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col items-center relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors
                            ${step > i ? 'bg-brand text-white border-brand' :
                                        step === i ? 'border-brand text-brand bg-white dark:bg-slate-900' :
                                            'border-slate-300 text-slate-400 bg-white dark:bg-slate-900'}`}>
                                    {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                                </div>
                                <span className={`mt-2 text-xs font-medium ${step >= i ? 'text-brand' : 'text-slate-400'}`}>
                                    {i === 1 ? 'Parent Info' : i === 2 ? 'Child Details' : 'Finalize'}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Connecting lines */}
                    <div className="relative -mt-10 h-1 bg-slate-200 dark:bg-slate-800 rounded mx-5 z-0">
                        <div
                            className="absolute top-0 left-0 h-full bg-brand transition-all duration-300 rounded"
                            style={{ width: `${(step - 1) * 50}%` }}
                        />
                    </div>
                </div>

                <Card className="shadow-lg border-none ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 rounded-t-xl border-b border-slate-100 dark:border-slate-800">
                        <CardTitle>
                            {step === 1 && "Parent / Guardian Details"}
                            {step === 2 && "Child Information"}
                            {step === 3 && "Address & Review"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Start by telling us about yourself."}
                            {step === 2 && "Let us know about the student applying."}
                            {step === 3 && "Almost done! Provide your location to finalize."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={onSubmit} className="space-y-6">
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                                        <Input
                                            placeholder="E.g. Jane Doe"
                                            value={formData.primaryParentName}
                                            onChange={e => setFormData({ ...formData, primaryParentName: e.target.value })}
                                            className={errors.primaryParentName ? "border-red-500" : ""}
                                        />
                                        {errors.primaryParentName && <p className="text-xs text-red-500">{errors.primaryParentName}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Mobile Number</label>
                                            <Input
                                                value={formData.primaryParentPhone}
                                                readOnly
                                                className="bg-slate-100 dark:bg-slate-800 text-slate-500"
                                            />
                                            <p className="text-[10px] text-muted-foreground mt-1">Verified via OTP</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="jane@example.com"
                                                value={formData.primaryParentEmail}
                                                onChange={e => setFormData({ ...formData, primaryParentEmail: e.target.value })}
                                                className={errors.primaryParentEmail ? "border-red-500" : ""}
                                            />
                                            {errors.primaryParentEmail && <p className="text-xs text-red-500">{errors.primaryParentEmail}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Child's First Name <span className="text-red-500">*</span></label>
                                            <Input
                                                placeholder="John"
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className={errors.firstName ? "border-red-500" : ""}
                                            />
                                            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name <span className="text-red-500">*</span></label>
                                            <Input
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                className={errors.lastName ? "border-red-500" : ""}
                                            />
                                            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Age (Years) <span className="text-red-500">*</span></label>
                                            <Input
                                                type="number"
                                                value={formData.age}
                                                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                                className={errors.age ? "border-red-500" : ""}
                                            />
                                            {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Applying For <span className="text-red-500">*</span></label>
                                            <Select
                                                value={formData.program}
                                                onValueChange={(v: string) => setFormData({ ...formData, program: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Program" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DAYCARE">Daycare</SelectItem>
                                                    <SelectItem value="PLAYGROUP">Playgroup</SelectItem>
                                                    <SelectItem value="NURSERY">Nursery</SelectItem>
                                                    <SelectItem value="PRE-K">Pre-K / LKG</SelectItem>
                                                    <SelectItem value="KINDERGARTEN">Kindergarten / UKG</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Street Address</label>
                                        <Input
                                            placeholder="123 Education Lane"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">City</label>
                                            <Input
                                                placeholder="City"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Zip/Postal Code</label>
                                            <Input
                                                placeholder="10001"
                                                value={formData.zipCode}
                                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-6 border-t mt-8">
                                {step > 1 ? (
                                    <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                ) : <div></div>} {/* Empty div to keep 'Next' aligned right */}

                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep} className="bg-brand hover:bg-brand-600 text-white">
                                        Next
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isLoading} className="bg-brand hover:bg-brand-600 text-white shadow-md">
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                        Submit Application
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
