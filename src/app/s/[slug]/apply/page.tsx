"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Phone, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { sendApplicationOTPAction, verifyApplicationOTPAction } from "@/app/actions/public-admission-actions";

export default function ApplyLandingPage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);
        try {
            const res = await sendApplicationOTPAction(params.slug, phoneNumber);
            if (res.success) {
                toast.success("Verification code sent!");
                setStep("otp");
            } else {
                toast.error(res.error || "Failed to send code");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 4) {
            toast.error("Please enter a valid OTP");
            return;
        }

        setIsLoading(true);
        try {
            const res = await verifyApplicationOTPAction(params.slug, phoneNumber, otp);
            if (res.success) {
                toast.success("Phone verified successfully!");

                // Save to session storage for the form/status pages to use
                sessionStorage.setItem("verified_application_phone", phoneNumber);

                if (res.hasExistingApplications) {
                    router.push(`/s/${params.slug}/apply/status`);
                } else {
                    router.push(`/s/${params.slug}/apply/form`);
                }
            } else {
                toast.error(res.error || "Invalid verification code");
            }
        } catch (error) {
            toast.error("Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-brand to-brand-700 bg-clip-text text-transparent">
                    Welcome to Our School
                </h1>
                <p className="text-muted-foreground mt-2">
                    Start your application journey or track your progress.
                </p>
            </div>

            <Card className="w-full max-w-md shadow-lg border-brand/20">
                <CardHeader className="space-y-1 bg-brand/5 border-b border-brand/10 p-6 rounded-t-xl">
                    <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                        {step === "phone" ? "Enter Mobile Number" : "Verify Number"}
                    </CardTitle>
                    <CardDescription>
                        {step === "phone"
                            ? "We use your phone number to keep your application secure."
                            : `We sent a code to ${phoneNumber}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {step === "phone" ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter 10-digit mobile number"
                                        type="tel"
                                        className="pl-10 h-12 text-lg"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 text-lg group" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Enter 4-digit OTP"
                                    type="text"
                                    maxLength={4}
                                    className="text-center h-12 text-2xl tracking-widest font-mono"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Proceed"}
                            </Button>
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep("phone")}
                                    className="text-sm text-brand hover:underline"
                                    disabled={isLoading}
                                >
                                    Change phone number
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                If you already have a parent account, <a href={`/s/${params.slug}/parent-login`} className="text-brand hover:underline">login here</a>.
            </div>
        </div>
    );
}
