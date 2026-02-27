"use client";

import { OTPLogin } from "@/components/figma/login/OTPLogin";
import { Suspense } from "react";

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <OTPLogin type="parent" />
        </Suspense>
    );
}
