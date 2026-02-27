"use client";

import { PhoneLogin } from "@/components/figma/login/PhoneLogin";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PhoneLogin type="school" />
        </Suspense>
    );
}
