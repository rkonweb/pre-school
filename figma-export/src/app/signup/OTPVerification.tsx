import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export function OTPVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneNumber = sessionStorage.getItem("phoneNumber") || "";

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Mock verification
    setIsVerified(true);
    setTimeout(() => {
      navigate("/signup/select-plan");
    }, 1000);
  };

  const handleResend = () => {
    setResendTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const maskedPhone = phoneNumber.slice(0, -3).replace(/\d/g, "X") + phoneNumber.slice(-3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/signup")}
          className="flex items-center gap-2 text-teal-200 hover:text-teal-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-teal-400/30 mx-auto mb-4">
            {isVerified ? (
              <CheckCircle2 className="h-8 w-8 text-slate-900" />
            ) : (
              <span className="text-3xl">🔐</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">
            Verify Your Number
          </h1>
          <p className="text-slate-300 mt-2">
            Enter the 6-digit code sent to <br />
            <span className="font-semibold text-teal-300">{maskedPhone}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-semibold bg-slate-800 border-2 border-teal-400/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.some(digit => !digit) || isVerified}
            className="w-full h-12 text-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-semibold shadow-lg shadow-teal-400/30 disabled:opacity-50"
          >
            {isVerified ? "Verified ✓" : "Verify & Continue"}
          </Button>

          {/* Resend OTP */}
          <div className="text-center space-y-2">
            {resendTimer > 0 ? (
              <p className="text-sm text-slate-400">
                Resend code in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-teal-300 hover:text-teal-200 font-medium"
              >
                Resend OTP
              </button>
            )}
            <button
              onClick={() => navigate("/signup")}
              className="block w-full text-sm text-slate-400 hover:text-slate-300"
            >
              Change Number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
