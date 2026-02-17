import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Phone } from "lucide-react";

export function PhoneSignup() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      // Store phone number in session storage for next steps
      sessionStorage.setItem("phoneNumber", countryCode + phoneNumber);
      navigate("/signup/verify-otp");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-teal-400/30 mx-auto mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-4">
            Get Started with Bodhi Board
          </h1>
          <p className="text-slate-300 mt-2">
            Start your school journey in under 60 seconds
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-teal-50">Phone Number</Label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 px-3 py-2 bg-slate-800 border border-teal-400/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="flex-1 h-12 text-lg bg-slate-800 border-teal-400/30 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400"
              />
            </div>
            <p className="text-sm text-slate-400 mt-2">
              We'll send a one-time password to verify your number.
            </p>
          </div>

          <Button
            onClick={handleContinue}
            disabled={phoneNumber.length !== 10}
            className="w-full h-12 text-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-semibold shadow-lg shadow-teal-400/30"
          >
            <Phone className="mr-2 h-5 w-5" />
            Continue
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 text-sm text-teal-100/80 pt-4">
          <span className="flex items-center gap-1">
            ✓ Secure
          </span>
          <span className="flex items-center gap-1">
            ✓ No spam
          </span>
          <span className="flex items-center gap-1">
            ✓ India-first
          </span>
        </div>
      </div>
    </div>
  );
}
