"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { verifyApplicationOTPAction } from "@/app/actions/public-admission-actions";
import { Loader2, CheckCircle2, Circle, ArrowRight, LogOut } from "lucide-react";

export default function ApplicationStatusPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [admissions, setAdmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            const phone = sessionStorage.getItem("verified_application_phone");
            if (!phone) {
                router.push(`/s/${params.slug}/apply`);
                return;
            }

            // We re-verify strictly with the phone (in a real app this would use a session token)
            // For now, we fetch existing applications based on the stored phone
            try {
                // We use a dummy OTP "0000" here because we don't want to re-send one. 
                // But since verifyApplicationOTPAction deletes verified OTPs, we should create a dedicated fetch method.
                // For this prototype, we'll build a simple fetcher in the action:
                const { getPublicApplicationStatusAction } = await import("@/app/actions/public-admission-actions");
                const res = await getPublicApplicationStatusAction(params.slug, phone);

                if (res.success) {
                    setAdmissions(res.admissions || []);
                } else {
                    router.push(`/s/${params.slug}/apply`);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [params.slug, router]);

    const handleLogout = () => {
        sessionStorage.removeItem("verified_application_phone");
        router.push(`/s/${params.slug}/apply`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (admissions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <Card className="w-full max-w-md text-center shadow-lg">
                    <CardHeader>
                        <CardTitle>No Applications Found</CardTitle>
                        <CardDescription>We couldn't find any active applications for your number.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <button
                            onClick={() => router.push(`/s/${params.slug}/apply/form`)}
                            className="bg-brand text-white px-4 py-2 rounded-md font-medium hover:bg-brand-600 transition-colors inline-flex items-center"
                        >
                            Start New Application
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const STAGES = ["INQUIRY", "APPLICATION", "INTERVIEW", "ENROLLED"];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Application Tracker</h1>
                        <p className="mt-2 text-slate-500">Track the status of your child's enrollment.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Exit
                    </button>
                </div>

                <div className="space-y-6">
                    {admissions.map((adm, idx) => {
                        const currentStageIndex = STAGES.indexOf(adm.stage);
                        const isLost = adm.stage === "LOST" || adm.stage === "REJECTED";

                        return (
                            <Card key={idx} className="shadow-md border-transparent hover:border-brand/20 transition-colors">
                                <CardHeader className="bg-white dark:bg-slate-900 pb-4 border-b">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{adm.studentName}</CardTitle>
                                            <CardDescription>Applying for: {adm.enrolledGrade}</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isLost ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {adm.stage}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                ID: #{adm.id.slice(-6).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8 pb-6">
                                    {isLost ? (
                                        <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg">
                                            This application is no longer active. Contact admissions for more details.
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10 rounded"></div>
                                            <div className="absolute top-1/2 left-0 h-1 bg-brand -translate-y-1/2 -z-10 rounded transition-all duration-500"
                                                style={{ width: `${(Math.max(0, currentStageIndex) / Math.max(1, STAGES.length - 1)) * 100}%` }}></div>

                                            <div className="flex justify-between">
                                                {STAGES.map((stage, sIdx) => {
                                                    const isCompleted = currentStageIndex >= sIdx;
                                                    const isCurrent = currentStageIndex === sIdx;
                                                    return (
                                                        <div key={stage} className="flex flex-col items-center group">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${isCompleted ? 'border-brand text-brand' : 'border-slate-300 text-slate-300'
                                                                }`}>
                                                                {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-brand/10" /> : <Circle className="w-3 h-3 fill-slate-200" />}
                                                            </div>
                                                            <span className={`mt-3 text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-brand' :
                                                                    isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                                                                }`}>
                                                                {stage}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {!isLost && STAGES[currentStageIndex + 1] && (
                                        <div className="mt-8 pt-4 border-t text-sm text-slate-500 text-center">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">Next Step:</span> Waiting to progress to <span className="uppercase">{STAGES[currentStageIndex + 1]}</span>. We will notify you of updates.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Have questions? Chat with our Admissions team via WhatsApp.
                </div>
            </div>
        </div>
    );
}
