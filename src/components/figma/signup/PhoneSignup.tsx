"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { sendOtpAction } from "@/app/actions/auth-actions";

export function PhoneSignup() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("PhoneSignup Debug: Component Mounted");
  }, []);

  const currentDigits = phoneNumber.replace(/\D/g, "");
  const isValid = currentDigits.length === 10;

  const handleContinue = async () => {
    if (!isValid) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const fullNumber = countryCode + currentDigits;
      console.log("DEBUG: Calling sendOtpAction with:", fullNumber);

      const result = await sendOtpAction(fullNumber, "signup");
      console.log("DEBUG: sendOtpAction result:", result);

      if (result && result.success) {
        console.log("DEBUG: OTP Success, storing and redirecting...");
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.setItem("phoneNumber", fullNumber);
        }

        // Use a small delay to ensure state is clear
        setTimeout(() => {
          router.push("/signup/verify-otp");
        }, 100);
      } else {
        const msg = result?.error || "OTP service error. Please try again.";
        console.error("DEBUG: OTP Failed:", msg);
        setError(msg);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("DEBUG: Catch error:", err);
      setError("Connection error. Could not reach server.");
      setIsLoading(false);
    }
  };

  // Prevent flicker
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl mx-auto mb-6">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Bodhi Board</h1>
          <p className="text-slate-400 mt-2">Start your journey in seconds</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-2xl">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-slate-300">Phone Number</Label>
              <span className={`text-[10px] font-mono ${isValid ? 'text-teal-400' : 'text-slate-500'}`}>
                {currentDigits.length}/10
              </span>
            </div>

            <div className="flex gap-3">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-2 py-3 bg-slate-900 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-teal-500/30 outline-none"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
              </select>
              <div className="flex-1 relative">
                <Input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phoneNumber}
                  autoComplete="off"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhoneNumber(val);
                    if (val.length === 10) setError(null);
                  }}
                  className="h-14 text-xl bg-slate-900 border-white/10 text-white placeholder:text-slate-700 rounded-xl focus:ring-teal-500/30 pr-12"
                />
                {isValid && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-teal-400" />
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className={`w-full h-14 text-lg rounded-xl font-bold transition-all ${isValid && !isLoading
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-900 hover:scale-[1.01]'
                : 'bg-slate-700 text-slate-500 opacity-50'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Working...</span>
              </div>
            ) : (
              "Continue"
            )}
          </Button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
