"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { verifyOtpAction, sendOtpAction } from "@/app/actions/auth-actions";

export function OTPVerification() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerified, setIsVerified] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("phoneNumber") : "";

    if (!stored) {
      router.push("/signup");
    } else {
      setPhoneNumber(stored);
    }
  }, [router]);

  useEffect(() => {
    if (isMounted && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer, isMounted]);

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1); // Only take the last character
    if (!/^\d*$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (char && index === 5) {
      void handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join("");
    if (codeToVerify.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOtpAction(phoneNumber, codeToVerify, "signup");

      if (result.success) {
        setIsVerified(true);

        // Determine where to route based on signup step
        const stepRouteMap: Record<string, string> = {
          "SELECT_PLAN": "/signup/select-plan",
          "FREE_TRIAL": "/signup/free-trial",
          "SCHOOL_SETUP": "/signup/setup",
          "LOADING": "/signup/setup", // Don't re-trigger loading, go back to setup
          "COMPLETED": "/school-login" // Already registered, go to login
        };

        const signupStep = (result as any).signupStep || "SELECT_PLAN";
        const targetRoute = stepRouteMap[signupStep] || "/signup/select-plan";

        setTimeout(() => {
          router.push(targetRoute);
        }, 800);
      } else {
        setError(result.error || "Invalid verification code.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sendOtpAction(phoneNumber, "signup");
      if (result.success) {
        setResendTimer(30);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || "Failed to resend code.");
      }
    } catch (err) {
      setError("Error resending code.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  const maskedPhone = phoneNumber.startsWith("+91")
    ? phoneNumber.slice(0, 7) + "XXXX" + phoneNumber.slice(-2)
    : phoneNumber.slice(0, 3) + "XXXX" + phoneNumber.slice(-2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Back button */}
        <button
          onClick={() => router.push("/signup")}
          className="group flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors font-medium ml-1"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Edit Number
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-teal-400/20 to-cyan-500/20 border border-teal-500/30 shadow-2xl shadow-teal-500/10 mx-auto mb-6 relative">
            {isVerified ? (
              <CheckCircle2 className="h-10 w-10 text-teal-400 animate-in zoom-in" />
            ) : (
              <span className="text-4xl text-teal-400">🔐</span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Verify Identity
          </h1>
          <p className="text-slate-400 mt-3">
            Enter the 6-digit code sent to <br />
            <span className="font-semibold text-teal-300 tracking-wider font-mono">{maskedPhone}</span>
          </p>
        </div>

        {/* OTP Input Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading || isVerified}
                autoFocus={index === 0}
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-3xl font-bold bg-slate-900/80 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all text-white ${isVerified
                  ? 'border-teal-400 text-teal-400'
                  : error
                    ? 'border-red-500/50 text-red-400'
                    : 'border-white/10 focus:border-teal-400'
                  }`}
              />
            ))}
          </div>

          <Button
            onClick={() => void handleVerify()}
            disabled={otp.some(digit => !digit) || isVerified || isLoading}
            className={`w-full h-14 text-lg rounded-2xl font-bold transition-all shadow-lg active:scale-[0.97] ${isVerified
              ? 'bg-teal-500 text-slate-900'
              : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:shadow-teal-500/30'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : isVerified ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                <span>Verified Successfully</span>
              </div>
            ) : (
              "Complete Verification"
            )}
          </Button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Resend Logic */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <div className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-600" />
                Resend code in <span className="text-slate-300 font-bold">{resendTimer}s</span>
              </div>
            ) : (
              <button
                onClick={() => void handleResend()}
                className="text-teal-400 hover:text-teal-300 font-bold text-sm underline-offset-4 hover:underline transition-all"
              >
                Resend verification code
              </button>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-3 text-slate-500 text-xs">
          <ShieldCheck className="h-4 w-4 text-teal-500/50" />
          Secure 256-bit encryption for OTP transmission
        </div>
      </div>
    </div>
  );
}
