"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtpAction, verifyOtpAction, loginWithMobileAction } from "@/app/actions/auth-actions";
import { generateBiometricAuthenticationOptions, verifyBiometricAuthentication } from "@/app/actions/webauthn-actions";
import { startAuthentication } from "@simplewebauthn/browser";

/* ─── TYPES ─────────────────────────────────────────────────────────────── */
export interface SchoolLoginProps {
  tenantName: string;
  tenantSlug: string;
  brandColor?: string;
  logoUrl?: string;
  tagline?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  foundingYear?: string;
  studentCount?: string;
  staffCount?: string;
}

/* ─── COLOR PALETTE DERIVATION ──────────────────────────────────────────── */
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function blendWithWhite(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const rr = Math.round(r * alpha + 255 * (1 - alpha));
  const gg = Math.round(g * alpha + 255 * (1 - alpha));
  const bb = Math.round(b * alpha + 255 * (1 - alpha));
  return `#${rr.toString(16).padStart(2, "0")}${gg.toString(16).padStart(2, "0")}${bb.toString(16).padStart(2, "0")}`;
}

function buildPalette(accent: string) {
  return {
    accent,
    accentRgb: hexToRgb(accent),
    accentBg: blendWithWhite(accent, 0.1),
    accentMid: blendWithWhite(accent, 0.25),
    accentSoft: blendWithWhite(accent, 0.15),
    panelBg: blendWithWhite(accent, 0.07),
  };
}

/* ─── STATIC PALETTE ─────────────────────────────────────────────────────── */
const T = {
  ink:   "#1A1612", ink80: "#3D3730", ink60: "#6B6258",
  ink40: "#9B9088", ink20: "#C8C0B8", ink10: "#E8E2DC",
  ink05: "#F4F1ED", paper: "#FDFCFA", white: "#FFFFFF",
  green: "#16A34A", greenL: "#DCFCE7", greenD: "#14532D",
  red:   "#DC2626", redL:   "#FEE2E2",
};

/* ─── COUNTRIES ──────────────────────────────────────────────────────────── */
const COUNTRIES = [
  { code: "+91",  flag: "🇮🇳", name: "India",     len: 10 },
  { code: "+1",   flag: "🇺🇸", name: "USA",        len: 10 },
  { code: "+44",  flag: "🇬🇧", name: "UK",         len: 10 },
  { code: "+971", flag: "🇦🇪", name: "UAE",        len: 9  },
  { code: "+65",  flag: "🇸🇬", name: "Singapore",  len: 8  },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia",   len: 9  },
  { code: "+61",  flag: "🇦🇺", name: "Australia",  len: 9  },
];

/* ─── ANIMATIONS CSS ─────────────────────────────────────────────────────── */
const loginCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Nunito+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  .sl-root *, .sl-root *::before, .sl-root *::after { box-sizing: border-box; }
  .sl-root { font-family: 'Nunito Sans', sans-serif; height: 100vh; overflow: hidden; }
  @keyframes slPanelIn   { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
  @keyframes slFormIn    { from{opacity:0;transform:translateX(40px) scale(.98)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes slFadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slFadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slScaleIn   { from{opacity:0;transform:scale(.82)} to{opacity:1;transform:scale(1)} }
  @keyframes slPopIn     { 0%{transform:scale(.1);opacity:0} 55%{transform:scale(1.09)} 80%{transform:scale(.97)} 100%{transform:scale(1);opacity:1} }
  @keyframes slLogoIn    { 0%{opacity:0;transform:scale(.55) translateY(18px)} 60%{transform:scale(1.06) translateY(-3px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes slShake     { 0%,100%{transform:translateX(0)} 16%{transform:translateX(-7px)} 33%{transform:translateX(7px)} 50%{transform:translateX(-4px)} 66%{transform:translateX(4px)} 83%{transform:translateX(-2px)} }
  @keyframes slRipple    { to{transform:scale(5.5);opacity:0} }
  @keyframes slCheckDraw { from{stroke-dashoffset:80} to{stroke-dashoffset:0} }
  @keyframes slOtpPop    { 0%{transform:scale(.6)} 60%{transform:scale(1.12)} 100%{transform:scale(1)} }
  @keyframes slDotBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @keyframes slPing      { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.6);opacity:0} }
  @keyframes slBarGrow   { from{width:0} to{width:100%} }
  @keyframes slConfetti  { 0%{transform:translateY(-16px) rotate(0);opacity:1} 100%{transform:translateY(110vh) rotate(700deg);opacity:0} }
  @keyframes slFloatBlob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(12px,-10px) scale(1.04)} 66%{transform:translate(-8px,8px) scale(.97)} }
  @keyframes slSpinSlow  { to{transform:rotate(360deg)} }
  @keyframes slSpinSlowR { to{transform:rotate(-360deg)} }
  @keyframes slBlink     { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes slShimmer   { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }
  @keyframes slSuccessIn { 0%{opacity:0;transform:scale(.3) rotate(-12deg)} 60%{transform:scale(1.1) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
  @keyframes slTagIn     { from{opacity:0;transform:translateY(6px) scale(.9)} to{opacity:1;transform:translateY(0) scale(1)} }
  .sl-root ::-webkit-scrollbar { width: 4px; }
  .sl-root ::-webkit-scrollbar-thumb { background: #D8D0C8; border-radius: 4px; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
`;

export const GlobalLoginStyles = React.memo(() => (
  <style dangerouslySetInnerHTML={{ __html: loginCSS }} />
));

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export function SchoolLogin({
  tenantName, tenantSlug, brandColor = "#AE7B64",
  logoUrl, tagline, address, city, state, zip, phone, email, website, foundingYear,
  studentCount, staffCount,
}: SchoolLoginProps) {
  const C = buildPalette(brandColor);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step,      setStep]      = useState<"phone" | "otp" | "success">("phone");
  const [phone_,    setPhone_]    = useState("");
  const [country,   setCountry]   = useState(COUNTRIES[0]);
  const [showCC,    setShowCC]    = useState(false);
  const [otp,       setOtp]       = useState(["","","","","",""]);
  const [otpFocus,  setOtpFocus]  = useState(0);
  const [otpErr,    setOtpErr]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [phoneErr,  setPhoneErr]  = useState("");
  const [resend,    setResend]    = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [confetti,  setConfetti]  = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const ccRef   = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    if (step !== "otp") return;
    setResend(30); setCanResend(false); if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResend(v => { if (v <= 1) { if (timerRef.current) clearInterval(timerRef.current); setCanResend(true); return 0; } return v - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  // Focus first OTP box when arriving at OTP step
  useEffect(() => {
    if (step === "otp") {
      const timer = setTimeout(() => {
        otpRefs.current[0]?.focus();
        setOtpFocus(0);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Close country dropdown
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ccRef.current && !ccRef.current.contains(e.target as Node)) setShowCC(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Auto submit OTP
  useEffect(() => {
    if (step === "otp" && otp.every(d => d !== "")) {
      setTimeout(() => doVerify(otp.join("")), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  async function sendOtp() {
    if (phone_.length < country.len) { setPhoneErr(`Enter a valid ${country.len}-digit number`); return; }
    setPhoneErr(""); setLoading(true);
    try {
      const result = await sendOtpAction(country.code + phone_, "school-login");
      if (result?.success) {
        if (typeof window !== "undefined") sessionStorage.setItem("phoneNumber", country.code + phone_);
        setLoading(false); setStep("otp");
      } else {
        setPhoneErr(result?.error || "Could not send OTP. Please try again.");
        setLoading(false);
      }
    } catch { setPhoneErr("Connection error. Please try again."); setLoading(false); }
  }

  async function doBiometricLogin() {
    if (phone_.length < country.len) { setPhoneErr(`Enter a valid ${country.len}-digit number`); return; }
    setPhoneErr(""); setLoading(true);
    try {
      const fullMobile = country.code + phone_;
      // 1. Get Authentication Options
      const optionsRes = await generateBiometricAuthenticationOptions(fullMobile);
      if (!optionsRes.success || !optionsRes.options) {
        setPhoneErr(optionsRes.error || "Biometric login unavailable.");
        setLoading(false);
        return;
      }

      // 2. Prompt fingerprint/FaceID
      let authResp;
      try {
        authResp = await startAuthentication({ optionsJSON: optionsRes.options });
      } catch (err: any) {
        console.error("Browser Auth Error:", err);
        if (err.name === "NotAllowedError") {
          setPhoneErr("Authentication was cancelled.");
        } else if (err.name === "SecurityError" || err.message?.includes("secure context")) {
          setPhoneErr("WebAuthn requires HTTPS or localhost.");
        } else {
          setPhoneErr(`Biometric Error: ${err.message || err.name || "Access denied."}`);
        }
        setLoading(false);
        return;
      }
      
      // 3. Verify server-side
      const verifyRes = await verifyBiometricAuthentication(fullMobile, authResp);
      if (!verifyRes.success) {
        setPhoneErr(verifyRes.error || "Biometric verification failed.");
        setLoading(false);
        return;
      }

      // 4. Create Active Session
      const loginRes = await loginWithMobileAction(fullMobile);
      setLoading(false);
      if (loginRes.success && loginRes.redirectUrl) {
        setStep("success");
        setTimeout(() => setConfetti(true), 100);
        setTimeout(() => setConfetti(false), 3800);
        const callbackUrl = searchParams.get("callbackUrl");
        setTimeout(() => {
          router.push(callbackUrl && !(loginRes as any).signupPending
            ? decodeURIComponent(callbackUrl)
            : loginRes.redirectUrl!);
        }, 2400);
      } else {
        setPhoneErr(loginRes.error || "Found biometrics, but session failed.");
      }
    } catch (err: any) {
      setPhoneErr("Connection error. Please try again.");
      setLoading(false);
    }
  }

  async function doVerify(code: string) {
    setLoading(true);
    try {
      const verifyResult = await verifyOtpAction(country.code + phone_, code, "login");
      if (!verifyResult?.success) {
        setLoading(false);
        setOtpErr(true); setOtp(["","","","","",""]);
        setTimeout(() => { otpRefs.current[0]?.focus(); setOtpFocus(0); }, 80);
        return;
      }
      // OTP verified ✓ — now create an authenticated session
      const loginRes = await loginWithMobileAction(country.code + phone_);
      setLoading(false);
      if (loginRes.success && loginRes.redirectUrl) {
        setStep("success");
        setTimeout(() => setConfetti(true), 100);
        setTimeout(() => setConfetti(false), 3800);
        const callbackUrl = searchParams.get("callbackUrl");
        setTimeout(() => {
          router.push(callbackUrl && !(loginRes as any).signupPending
            ? decodeURIComponent(callbackUrl)
            : loginRes.redirectUrl!);
        }, 2400);
      } else {
        setOtpErr(true); setOtp(["","","","","",""]);
        setTimeout(() => { otpRefs.current[0]?.focus(); setOtpFocus(0); }, 80);
      }
    } catch { setLoading(false); setOtpErr(true); }
  }

  function handleOtpInput(i: number, val: string) {
    const cleanVal = val.replace(/\D/g, "");
    if (cleanVal.length === 0) {
      const next = [...otp];
      next[i] = "";
      setOtp(next);
      return;
    }

    // Handle multiple digits (rapid typing or hidden paste)
    const digits = cleanVal.split("").slice(0, 6 - i);
    const next = [...otp];
    
    digits.forEach((d, idx) => {
      if (i + idx < 6) next[i + idx] = d;
    });
    
    setOtp(next);
    setOtpErr(false);
    
    // Auto-advance
    const nextIdx = Math.min(i + digits.length, 5);
    if (nextIdx > i) {
      const nextInput = otpRefs.current[nextIdx];
      if (nextInput) {
        nextInput.focus();
        setOtpFocus(nextIdx);
      }
    }
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const n = [...otp]; n[i-1] = ""; setOtp(n);
      setTimeout(() => { otpRefs.current[i-1]?.focus(); setOtpFocus(i-1); }, 0);
    }
    if (e.key === "ArrowLeft"  && i > 0) { otpRefs.current[i-1]?.focus(); setOtpFocus(i-1); }
    if (e.key === "ArrowRight" && i < 5) { otpRefs.current[i+1]?.focus(); setOtpFocus(i+1); }
    if (e.key === "Enter" && otp.every(d => d !== "")) doVerify(otp.join(""));
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const n = [...otp]; d.split("").forEach((c, i) => { if (i < 6) n[i] = c; }); setOtp(n);
    setTimeout(() => { const fi = Math.min(d.length, 5); otpRefs.current[fi]?.focus(); setOtpFocus(fi); }, 0);
  }

  function doResend() {
    if (!canResend) return;
    setOtp(["","","","","",""]); setOtpErr(false);
    setResend(30); setCanResend(false); if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResend(v => { if (v <= 1) { if (timerRef.current) clearInterval(timerRef.current); setCanResend(true); return 0; } return v - 1; });
    }, 1000);
  }

  const R = 15, CIRC = 2 * Math.PI * R;
  const otpFull = otp.every(d => d !== "");
  const mono = tenantName.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 3).join("").toUpperCase();
  const locationStr = [address, city, state, zip].filter(Boolean).join(", ");

  return (
    <div className="sl-root" style={{ height: "100vh", display: "flex", overflow: "hidden", fontFamily: "'Nunito Sans',sans-serif" }}>
      <GlobalLoginStyles />

      {/* Accessibility: Skip to main content link */}
      <a 
        href="#login-form" 
        className="absolute left-[-9999px] top-4 z-[10000] rounded-lg bg-white px-4 py-2 text-[#AE7B64] font-bold focus:left-4 focus:outline-none focus:ring-4 focus:ring-[#AE7B64]/20 shadow-xl border border-zinc-100"
      >
        Skip to login form
      </a>

      {/* Confetti */}
      {confetti && <ConfettiPieces accent={C.accent} />}

      {/* ════════════ LEFT PANEL ════════════ */}
      <div style={{ flex: "0 0 44%", position: "relative", overflow: "hidden", background: C.panelBg, display: "flex", flexDirection: "column", animation: "slPanelIn .65s cubic-bezier(.86,0,.07,1)" }}>
        {/* Animated background */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% -5%, ${C.accentMid}70, transparent 55%), radial-gradient(ellipse 60% 55% at 100% 100%, ${C.accentMid}50, transparent 55%), ${C.panelBg}`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "8%",  right: "-8%",  width: 280, height: 280, borderRadius: "55% 45% 60% 40% / 50% 55% 45% 50%", background: `${C.accent}12`, animation: "slFloatBlob 14s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "12%", left: "-10%", width: 220, height: 220, borderRadius: "45% 55% 40% 60% / 60% 40% 55% 45%", background: `${C.accent}0d`, animation: "slFloatBlob 18s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: `1.5px solid ${C.accent}18`, animation: "slSpinSlow 90s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -45, right: -45, width: 210, height: 210, borderRadius: "50%", border: `1px solid ${C.accent}12`, animation: "slSpinSlowR 60s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2.5px", background: `linear-gradient(90deg, transparent 5%, ${C.accent}90 35%, ${C.accent} 50%, ${C.accent}90 65%, transparent 95%)`, pointerEvents: "none" }} />

        {/* Top bar */}
        <div style={{ padding: "22px 30px 0", position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 9, animation: "slFadeIn .5s ease .18s both" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accentBg, border: `1.5px solid ${C.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg aria-hidden="true" width={12} height={12} viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="4.5" height="4.5" rx="1.2" fill={C.accent} opacity=".9"/>
              <rect x="7.5" y="1" width="4.5" height="4.5" rx="1.2" fill={C.accent} opacity=".55"/>
              <rect x="1" y="7.5" width="4.5" height="4.5" rx="1.2" fill={C.accent} opacity=".55"/>
              <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1.2" fill={C.accent} opacity=".3"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", color: C.accent }}>ERP Portal</span>
        </div>

        {/* Logo + Identity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px 36px 0", position: "relative", zIndex: 2 }}>
          {/* Logo circle */}
          <div style={{ position: "relative", width: 108, height: 108, animation: "slLogoIn .8s cubic-bezier(.34,1.56,.64,1) .1s both" }}>
            <div style={{ position: "absolute", inset: -12, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}18, transparent 70%)`, animation: "slShimmer 3.5s ease-in-out infinite" }} />
            <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1.5px solid ${C.accent}30` }} />
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: logoUrl ? T.white : `radial-gradient(circle at 38% 32%, ${C.accentMid}AA 0%, ${C.accentSoft} 60%, ${C.accentBg} 100%)`, border: `2.5px solid ${C.accent}45`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: `0 12px 48px ${C.accent}25, 0 4px 16px ${C.accent}18, inset 0 1.5px 0 rgba(255,255,255,.9)` }}>
              {logoUrl
                ? <img src={logoUrl} alt={tenantName} style={{ width: "72%", height: "72%", objectFit: "contain" }} />
                : <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: mono.length > 2 ? 30 : 38, fontWeight: 600, color: C.accent, letterSpacing: mono.length > 2 ? "-2px" : "-0.5px", textShadow: `0 2px 16px ${C.accent}40` }}>{mono}</span>
              }
            </div>
          </div>

          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 21, fontWeight: 600, lineHeight: 1.22, color: T.ink, marginTop: 14, maxWidth: 260, animation: "slFadeUp .5s ease .38s both" }}>{tenantName}</div>

          {foundingYear && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", justifyContent: "center", animation: "slFadeUp .5s ease .44s both" }}>
              {[`Est. ${foundingYear}`].map((t, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".3px", color: C.accent, background: C.accentBg, border: `1.5px solid ${C.accentMid}`, borderRadius: 20, padding: "3px 10px", animation: `slTagIn .4s ease ${.5+i*.07}s both` }}>{t}</span>
              ))}
            </div>
          )}

          {tagline && (
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 13, fontWeight: 400, color: T.ink60, lineHeight: 1.7, marginTop: 10, maxWidth: 255, animation: "slFadeUp .5s ease .52s both" }}>"{tagline}"</p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, width: "100%", maxWidth: 300, animation: "slFadeIn .6s ease .58s both" }}>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, transparent, ${C.accentMid})` }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, opacity: .5 }} />
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${C.accentMid}, transparent)` }} />
          </div>
        </div>

        {/* Info rows */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 28px 0", position: "relative", zIndex: 2 }}>
          {(locationStr || phone || email || website) && (
            <div style={{ marginBottom: 12, animation: "slFadeIn .45s ease .65s both" }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.8px", textTransform: "uppercase", color: T.ink40, marginBottom: 8 }}>Contact &amp; Location</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {locationStr && <InfoRow icon="📍" label="Address" val={locationStr} accent={C.accent} accentBg={C.accentBg} accentMid={C.accentMid} />}
                {phone      && <InfoRow icon="📞" label="Phone"   val={phone}       accent={C.accent} accentBg={C.accentBg} accentMid={C.accentMid} />}
                {email      && <InfoRow icon="✉️" label="Email"   val={email}       accent={C.accent} accentBg={C.accentBg} accentMid={C.accentMid} />}
                {website    && <InfoRow icon="🌐" label="Website" val={website}     accent={C.accent} accentBg={C.accentBg} accentMid={C.accentMid} />}
              </div>
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div style={{ padding: "12px 28px 18px", borderTop: `1px solid ${C.accentMid}60`, position: "relative", zIndex: 2, background: `${C.accentBg}90`, animation: "slFadeIn .5s ease 1.2s both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 24 }}>
              {(studentCount || staffCount) && [
                studentCount && { label: "Students", val: studentCount },
                staffCount   && { label: "Staff",    val: staffCount },
              ].filter(Boolean).map((s: any, i) => (
                <div key={i}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: T.ink, lineHeight: 1, fontFamily: "'DM Mono',monospace", letterSpacing: "-1px" }}>{s.val}</p>
                  <p style={{ fontSize: 9, fontWeight: 700, color: C.accent, letterSpacing: ".8px", textTransform: "uppercase", marginTop: 2, opacity: .85 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.greenL, borderRadius: 20, padding: "4px 11px", border: "1px solid rgba(22,163,74,.18)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "slBlink 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.greenD }}>All systems live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ RIGHT PANEL ════════════ */}
      <div style={{ flex: 1, background: T.white, overflowY: "auto", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Subtle bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.accent}14 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "45%", background: `radial-gradient(ellipse at top right, ${C.accentSoft}, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2.5px", background: `linear-gradient(90deg, ${C.accent}90 0%, ${C.accent} 50%, transparent 100%)`, pointerEvents: "none" }} />

        {/* TLS badge top-right */}
        <div style={{ padding: "22px 44px 0", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "relative", zIndex: 2, animation: "slFadeIn .5s ease .3s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.greenL, border: "1px solid rgba(22,163,74,.2)", borderRadius: 20, padding: "6px 14px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "slShimmer 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.greenD }}>256-bit TLS Secured</span>
          </div>
        </div>

        {/* Form area */}
        <div id="login-form" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 44px 48px", position: "relative", zIndex: 2 }}>
          <div style={{ width: "100%", maxWidth: 430 }}>

            {/* ── STEP: PHONE ── */}
            {step === "phone" && (
              <div key="phone" style={{ animation: "slFormIn .5s cubic-bezier(.34,1.56,.64,1)" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentBg, border: `1.5px solid ${C.accentMid}`, borderRadius: 20, padding: "6px 14px", marginBottom: 20 }}>
                  <span style={{ fontSize: 14 }}>👋</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>Welcome back</span>
                </div>

                <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 36, fontWeight: 600, color: T.ink, lineHeight: 1.18, letterSpacing: "-.4px", marginBottom: 8 }}>
                  Sign in to your<br />
                  <span style={{ color: C.accent }}>school portal</span>
                </h1>
                <p style={{ fontSize: 14.5, color: T.ink60, lineHeight: 1.7, marginBottom: 28 }}>
                  Enter your registered mobile number. A one-time verification code will be sent to you.
                </p>

                <label htmlFor="school-phone" style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: ".9px", textTransform: "uppercase", color: T.ink60, marginBottom: 8 }}>Mobile Number</label>

                <PhoneInputField phone={phone_} setPhone={setPhone_} country={country} setCountry={setCountry} showCC={showCC} setShowCC={setShowCC} ccRef={ccRef} phoneErr={phoneErr} setPhoneErr={setPhoneErr} onEnter={sendOtp} C={C} />

                {phoneErr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, animation: "slFadeUp .22s ease" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: T.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 8, color: T.white, fontWeight: 900 }}>!</span>
                    </div>
                    <span style={{ fontSize: 12.5, color: T.red, fontWeight: 700 }}>{phoneErr}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, margin: "20px 0 26px", background: C.accentBg, border: `1.5px solid ${C.accentMid}`, borderRadius: 14, padding: "12px 16px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>🔒</span>
                  <p style={{ fontSize: 13, color: T.ink60, lineHeight: 1.65 }}>
                    Your OTP will be sent to{" "}
                    <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: T.ink }}>
                      {country.flag} {country.code} {phone_ || "your number"}
                    </span>
                    . Valid for 10 minutes.
                  </p>
                </div>

                <ActionButton loading={loading} disabled={phone_.length < country.len} onClick={sendOtp} C={C}>
                  Send Verification Code
                  <ArrowRight />
                </ActionButton>

                <div style={{ display: "flex", alignItems: "center", margin: "22px 0", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: T.ink10 }} />
                  <span style={{ fontSize: 13, color: T.ink40, fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: T.ink10 }} />
                </div>

                <ActionButton 
                  loading={false} 
                  disabled={loading || phone_.length < country.len} 
                  onClick={doBiometricLogin} 
                  C={C}
                  style={{
                    background: "transparent",
                    color: C.accent,
                    border: `2px solid ${C.accent}`,
                  }}
                >
                  <svg aria-hidden="true" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    {/* Add a generic biometric icon or use a generic lock/fingerprint SVG here */}
                    <path d="M16 11V7a4 4 0 0 0-8 0v4M5 11h14v10H5z" />
                  </svg>
                  Sign in with Passkey
                </ActionButton>

                <p style={{ textAlign: "center", fontSize: 12.5, color: T.ink40, marginTop: 22, lineHeight: 1.7 }}>
                  Need help?{" "}
                  <span style={{ color: C.accent, fontWeight: 700, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
                    Contact your school admin
                  </span>
                </p>
              </div>
            )}

            {/* ── STEP: OTP ── */}
            {step === "otp" && (
              <div key="otp" style={{ animation: "slFormIn .5s cubic-bezier(.34,1.56,.64,1)" }}>
                <button onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setOtpErr(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: T.ink60, marginBottom: 22, marginLeft: -8, padding: "5px 8px", borderRadius: 8, border: "none", background: "none", cursor: "pointer", transition: "all .18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.ink05; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.ink60; }}>
                  <svg aria-hidden="true" width={14} height={14} viewBox="0 0 16 16"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Back
                </button>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentBg, border: `1.5px solid ${C.accentMid}`, borderRadius: 20, padding: "6px 14px", marginBottom: 20 }}>
                  <span style={{ fontSize: 14 }}>🔐</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>Verify your number</span>
                </div>

                <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 36, fontWeight: 600, color: T.ink, lineHeight: 1.18, letterSpacing: "-.4px", marginBottom: 8 }}>
                  Enter the<br />
                  <span style={{ color: C.accent }}>6-digit code</span>
                </h2>
                <p style={{ fontSize: 14.5, color: T.ink60, lineHeight: 1.7, marginBottom: 26 }}>
                  We sent a code to{" "}
                  <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: T.ink }}>
                    {country.flag} {country.code} ••••{phone_.slice(-4)}
                  </span>
                </p>

                {/* OTP boxes */}
                <div onPaste={handlePaste} style={{ display: "flex", gap: 9, marginBottom: 12, animation: otpErr ? "slShake .45s ease" : "none" }}>
                  {otp.map((digit, i) => {
                    const isFoc  = otpFocus === i;
                    const filled = digit !== "";
                    const bc = otpErr ? T.red : isFoc ? C.accent : filled ? `${C.accent}60` : T.ink10;
                    const bg = otpErr ? T.redL : isFoc ? C.accentBg : filled ? C.accentSoft : T.white;
                    return (
                      <div key={i} style={{ flex: 1, position: "relative" }}>
                        <input
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text" maxLength={1} value={digit}
                          aria-label={`OTP digit ${i + 1}`}
                          onChange={e => handleOtpInput(i, e.target.value)}
                          onKeyDown={e => handleOtpKey(i, e)}
                          onFocus={() => setOtpFocus(i)}
                          autoComplete="one-time-code"
                          inputMode="numeric"
                          pattern="\d*"
                          style={{ width: "100%", height: 66, borderRadius: 14, textAlign: "center", fontSize: 26, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: otpErr ? T.red : T.ink, background: bg, border: `2px solid ${bc}`, outline: "none", display: "block", transition: "all .22s cubic-bezier(.34,1.56,.64,1)", transform: isFoc ? "scale(1.07) translateY(-3px)" : filled ? "scale(1.02)" : "scale(1)", boxShadow: isFoc ? `0 10px 30px ${C.accent}25, 0 0 0 5px ${C.accent}14` : filled ? `0 4px 16px ${C.accent}18` : "0 2px 8px rgba(0,0,0,.05)", caretColor: "transparent", cursor: "pointer", animation: filled && !isFoc ? "slOtpPop .22s ease" : "none" }}
                        />
                        {filled && !isFoc && (
                          <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", height: "2.5px", width: "38%", background: C.accent, borderRadius: 99, animation: "slBarGrow .2s ease" }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {otpErr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: T.redL, border: `1.5px solid ${T.red}22`, borderRadius: 12, marginBottom: 14, animation: "slFadeUp .25s ease" }}>
                    <span style={{ fontSize: 15 }}>❌</span>
                    <span style={{ fontSize: 13, color: T.red, fontWeight: 700 }}>Incorrect code. Please try again.</span>
                  </div>
                )}

                {/* Resend */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {!canResend ? (
                      <>
                        <div style={{ position: "relative", width: 36, height: 36 }}>
                          <svg aria-hidden="true" width={36} height={36} viewBox="0 0 38 38">
                            <circle cx={19} cy={19} r={R} fill="none" stroke={T.ink10} strokeWidth={2.5} />
                            <circle cx={19} cy={19} r={R} fill="none" stroke={C.accent} strokeWidth={2.5} strokeDasharray={`${(resend/30)*CIRC} ${CIRC}`} strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 1s linear" }} />
                          </svg>
                          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: C.accent, fontFamily: "'DM Mono',monospace" }}>{resend}</span>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, color: T.ink60, fontWeight: 500 }}>Resend in <span style={{ fontWeight: 800, color: T.ink }}>{resend}s</span></p>
                          <p style={{ fontSize: 11, color: T.ink40 }}>Didn't receive it? Check spam</p>
                        </div>
                      </>
                    ) : (
                      <div style={{ animation: "slPopIn .4s ease" }}>
                        <p style={{ fontSize: 12.5, color: T.ink60, marginBottom: 2 }}>Didn't receive the code?</p>
                        <button onClick={doResend} style={{ fontSize: 13.5, fontWeight: 800, color: C.accent, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, background: "none", border: "none" }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                          ↺ Resend verification code
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: T.ink40 }}>Auto-submits when<br />all 6 digits entered</p>
                  </div>
                </div>

                <ActionButton loading={loading} disabled={!otpFull || loading} onClick={() => doVerify(otp.join(""))} C={C}>
                  Verify &amp; Sign In
                  <ArrowRight />
                </ActionButton>

                <p style={{ textAlign: "center", fontSize: 12.5, color: T.ink40, marginTop: 20, lineHeight: 1.7 }}>
                  Wrong number?{" "}
                  <span style={{ color: C.accent, fontWeight: 700, cursor: "pointer" }}
                    onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setOtpErr(false); }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
                    Change mobile number
                  </span>
                </p>
              </div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === "success" && (
              <div key="success" style={{ animation: "slFormIn .5s cubic-bezier(.34,1.56,.64,1)", textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-flex", marginBottom: 22 }}>
                  <div style={{ width: 90, height: 90, borderRadius: "50%", background: `linear-gradient(135deg, ${T.green}, #15803D)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 20px 60px ${T.green}45`, animation: "slSuccessIn .65s cubic-bezier(.34,1.56,.64,1)" }}>
                    <svg aria-hidden="true" width={40} height={40} viewBox="0 0 44 44">
                      <path d="M8 23l10 10 18-18" stroke={T.white} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} style={{ animation: "slCheckDraw .6s ease .2s both" }} />
                    </svg>
                  </div>
                  <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `2px solid ${T.green}30`, animation: "slPing 2s ease-in-out infinite" }} />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 600, color: T.ink, letterSpacing: "-.4px", marginBottom: 8 }}>Welcome back! 🎉</h2>
                <p style={{ fontSize: 14.5, color: T.ink60, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 24px" }}>
                  You're now signed in to <span style={{ fontWeight: 800, color: C.accent }}>{tenantName}</span>. Redirecting to your dashboard…
                </p>
                <div style={{ height: 4, background: T.ink05, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${C.accent}, ${T.green})`, animation: "slBarGrow 2.5s cubic-bezier(.4,0,.2,1) .3s forwards", width: 0 }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 44px", borderTop: `1px solid ${T.ink10}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.paper, position: "relative", zIndex: 2, animation: "slFadeIn .5s ease .8s both" }}>
          <p style={{ fontSize: 11.5, color: T.ink40, fontWeight: 500 }}>
            © 2026 <span style={{ fontWeight: 800, color: C.accent }}>{tenantName} ERP</span>
          </p>
          <div style={{ display: "flex", gap: 18 }}>
            {["Privacy Policy", "Terms of Use", "Help Center"].map((l, i) => (
              <span key={i} style={{ fontSize: 11.5, color: T.ink40, cursor: "pointer", fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = T.ink40)}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
function InfoRow({ icon, label, val, accent, accentBg, accentMid }: { icon: string; label: string; val: string; accent: string; accentBg: string; accentMid: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
      <div style={{ width: 25, height: 25, borderRadius: 7, background: accentBg, border: `1.5px solid ${accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".5px", textTransform: "uppercase", color: T.ink40, marginBottom: 1 }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.ink60, lineHeight: 1.5 }}>{val}</p>
      </div>
    </div>
  );
}

function ArrowRight() {
  return <svg aria-hidden="true" width={15} height={15} viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ActionButton({ loading, disabled, onClick, children, C, style }: { loading: boolean; disabled: boolean; onClick: () => void; children: React.ReactNode; C: ReturnType<typeof buildPalette>; style?: React.CSSProperties }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref = useRef<HTMLButtonElement>(null);
  const dis = disabled || loading;
  const fire = (e: React.MouseEvent) => {
    if (dis) return;
    const r = ref.current!.getBoundingClientRect(); const id = Date.now();
    setRipples(p => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples(p => p.filter(x => x.id !== id)), 800);
    onClick?.();
  };
  return (
    <button ref={ref} onClick={fire} disabled={dis}
      style={{ width: "100%", padding: "16px 26px", borderRadius: 14, background: dis ? T.ink05 : `linear-gradient(135deg, ${C.accent} 0%, ${C.accent}CC 100%)`, color: dis ? T.ink40 : T.white, fontSize: 15, fontWeight: 800, cursor: dis ? "not-allowed" : "pointer", border: dis ? `1.5px solid ${T.ink10}` : "none", position: "relative", overflow: "hidden", transition: "all .28s cubic-bezier(.34,1.56,.64,1)", boxShadow: dis ? "none" : `0 8px 28px ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, letterSpacing: ".1px", ...style }}
      onMouseEnter={e => { if (!dis) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${C.accent}50`; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = dis ? "none" : `0 8px 28px ${C.accent}40`; }}
    >
      {ripples.map(r => <span key={r.id} style={{ position: "absolute", left: r.x - 4, top: r.y - 4, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,.5)", animation: "slRipple .8s ease forwards", pointerEvents: "none" }} />)}
      {loading ? (
        <><span style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.white, display: "inline-block", animation: `slDotBounce 1s ease ${i*.18}s infinite` }} />)}</span><span>Please wait…</span></>
      ) : children}
    </button>
  );
}

function PhoneInputField({ phone, setPhone, country, setCountry, showCC, setShowCC, ccRef, phoneErr, setPhoneErr, onEnter, C }: {
  phone: string; setPhone: (v: string) => void; country: typeof COUNTRIES[0]; setCountry: (c: typeof COUNTRIES[0]) => void;
  showCC: boolean; setShowCC: (v: boolean | ((p: boolean) => boolean)) => void; ccRef: React.RefObject<HTMLDivElement | null>; phoneErr: string; setPhoneErr: (v: string) => void; onEnter: () => void; C: ReturnType<typeof buildPalette>;
}) {
  const [foc, setFoc] = useState(false);
  const bc = phoneErr ? T.red : foc ? C.accent : T.ink10;
  return (
    <div style={{ display: "flex", borderRadius: 14, border: `2px solid ${bc}`, background: T.white, transition: "border-color .2s, box-shadow .2s", boxShadow: phoneErr ? `0 0 0 4px ${T.red}12` : foc ? `0 0 0 5px ${C.accent}14` : "0 2px 12px rgba(0,0,0,.05)", animation: phoneErr ? "slShake .45s ease" : "none", marginBottom: 4 }} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}>
      <div ref={ccRef} style={{ position: "relative", flexShrink: 0 }}>
        <button type="button" title="Select country code" onClick={() => setShowCC(v => !v)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 16px", height: 58, background: T.ink05, borderRight: `1.5px solid ${T.ink10}`, borderRadius: "12px 0 0 12px", minWidth: 112, transition: "background .15s", border: "none", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = T.ink10}
          onMouseLeave={e => e.currentTarget.style.background = T.ink05}>
          <span style={{ fontSize: 20 }}>{country.flag}</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 500, color: T.ink }}>{country.code}</span>
          <svg aria-hidden="true" width={9} height={9} viewBox="0 0 10 10" style={{ transform: showCC ? "rotate(180deg)" : "none", transition: "transform .28s", color: T.ink40 }}>
            <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {showCC && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 999, background: T.white, borderRadius: 14, boxShadow: "0 24px 56px rgba(0,0,0,.13)", border: `1.5px solid ${T.ink10}`, overflow: "hidden", minWidth: 240, animation: "slScaleIn .18s cubic-bezier(.34,1.56,.64,1)", transformOrigin: "top left" }}>
            {COUNTRIES.map((c, i) => (
              <div key={i} onClick={() => { setCountry(c); setShowCC(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", cursor: "pointer", background: c.code === country.code ? C.accentBg : "transparent", borderLeft: c.code === country.code ? `3px solid ${C.accent}` : "3px solid transparent", transition: "background .12s" }}
                onMouseEnter={e => { if (c.code !== country.code) e.currentTarget.style.background = T.ink05; }}
                onMouseLeave={e => { if (c.code !== country.code) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 20 }}>{c.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.ink40, fontFamily: "'DM Mono',monospace" }}>{c.code} · {c.len} digits</div>
                </div>
                {c.code === country.code && (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg aria-hidden="true" width={9} height={9} viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke={T.white} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <input id="school-phone" type="tel" autoFocus aria-label="Mobile number" placeholder={country.code === "+91" ? "98765 43210" : "Mobile number"} value={phone}
        onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, country.len); setPhone(v); if (phoneErr) setPhoneErr(""); }}
        onKeyDown={e => e.key === "Enter" && onEnter()}
        style={{ flex: 1, padding: "0 18px", height: 58, fontSize: 20, fontWeight: 700, color: T.ink, letterSpacing: "2.5px", fontFamily: "'DM Mono',monospace", caretColor: C.accent, background: "transparent", border: "none", outline: "none" }}
      />
      {phone.length === country.len && (
        <div style={{ display: "flex", alignItems: "center", paddingRight: 16, animation: "slScaleIn .25s cubic-bezier(.34,1.56,.64,1)" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg aria-hidden="true" width={11} height={11} viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={T.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfettiPieces({ accent }: { accent: string }) {
  const pieces = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    color: [accent, T.green, "#8B5CF6", "#EC4899", "#F97316", "#3B82F6", "#FBBF24"][i % 7],
    left: `${Math.random() * 100}%`,
    delay: `${(Math.random() * 1.2).toFixed(2)}s`,
    dur: `${(1.1 + Math.random() * 0.9).toFixed(2)}s`,
    w: 5 + Math.random() * 8, h: Math.random() > .45 ? 5 + Math.random() * 8 : 3 + Math.random() * 4,
    r: Math.random() > .4 ? "50%" : "2px",
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {pieces.map(p => <div key={p.id} style={{ position: "absolute", top: -16, left: p.left, width: p.w, height: p.h, borderRadius: p.r, background: p.color, animation: `slConfetti ${p.dur} ease ${p.delay} forwards` }} />)}
    </div>
  );
}
