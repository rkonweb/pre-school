import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   MULTI-SCHOOL ERP  ·  LIGHT MODE WEB LOGIN  v2
   Aesthetic: "Warm Institutional Luxury" — premium light panel,
              elegant typography, rich school identity, inviting form
   Fonts: Cormorant Garamond (serif display) + Nunito Sans (body) + DM Mono
   Auth:  Phone → OTP → Done  (2 steps, no role selection)
═══════════════════════════════════════════════════════════════════════════ */

/* ─── SCHOOL REGISTRY ──────────────────────────────────────────────────────
   logoUrl → image URL or "" for auto-monogram
   Set the active school from subdomain / route at runtime.
────────────────────────────────────────────────────────────────────────── */
const SCHOOLS = {
  lcgp: {
    id: "lcgp",
    name: "Little Chanakya's Global Preschool",
    short: "LCGP",
    tagline: "Where Every Child's Spark Becomes a Flame",
    logoUrl: "",
    accent:    "#C47E00",
    accentRgb: "196,126,0",
    accentBg:  "#FDF6E8",
    accentMid: "#FDE8B0",
    accentSoft:"#FEF3D0",
    panelBg:   "#FBF7EE",
    founded: "2018", affiliation: "Kerala State Board", type: "Private · Co-Ed",
    address: "Chevayur, Kozhikode", state: "Kerala, India — 673017",
    phone: "+91 495 278 4400", email: "info@lcgp.edu.in", website: "lcgp.edu.in",
    students: "342", staff: "48",
    programs: ["Pre-KG", "LKG", "UKG", "Grade I–V"],
    accreditations: ["ISO 9001:2015", "CBSE Affiliated", "NAAC Grade A"],
    vision: "Holistic education rooted in Indian values, preparing global citizens.",
    awards: ["Best Preschool 2023 — Kerala", "Green Campus Award 2022"],
  },
  dps: {
    id: "dps",
    name: "Delhi Public School",
    short: "DPS",
    tagline: "Service Before Self",
    logoUrl: "",
    accent:    "#1A5CB8",
    accentRgb: "26,92,184",
    accentBg:  "#EDF3FC",
    accentMid: "#C3D7F7",
    accentSoft:"#EEF4FD",
    panelBg:   "#EFF4FB",
    founded: "1949", affiliation: "CBSE, New Delhi", type: "Public · Co-Ed",
    address: "Mathura Road, New Delhi", state: "Delhi, India — 110019",
    phone: "+91 11 2699 1144", email: "office@dpsdelhi.in", website: "dpsdelhi.in",
    students: "3,200", staff: "210",
    programs: ["Primary", "Middle", "Secondary", "Senior Sec."],
    accreditations: ["CBSE Affiliated", "ISO 9001:2015", "Cambridge IGCSE"],
    vision: "Empowering students to excel academically and contribute to society.",
    awards: ["Times School Award 2023", "CBSE Award of Excellence"],
  },
  bvb: {
    id: "bvb",
    name: "Bharatiya Vidya Bhavan",
    short: "BVB",
    tagline: "Let Noble Thoughts Come to Us from All Sides",
    logoUrl: "",
    accent:    "#B82020",
    accentRgb: "184,32,32",
    accentBg:  "#FBF0F0",
    accentMid: "#F5C8C8",
    accentSoft:"#FDF3F3",
    panelBg:   "#FBF1F1",
    founded: "1938", affiliation: "ICSE / ISC Board", type: "Private Trust · Co-Ed",
    address: "Munshi Nagar, Mumbai", state: "Maharashtra, India — 400007",
    phone: "+91 22 2363 1261", email: "contact@bvbmumbai.edu.in", website: "bvbmumbai.edu.in",
    students: "1,850", staff: "130",
    programs: ["Primary", "Middle", "Secondary", "Senior Sec.", "Vocational"],
    accreditations: ["ICSE Affiliated", "ISO 9001:2015", "NAAC Grade A+"],
    vision: "Cultivating wisdom, character, and cultural pride in every student.",
    awards: ["National Heritage School Award", "NAAC Outstanding Grade 2022"],
  },
};
const DEMO_IDS = ["lcgp", "dps", "bvb"];

/* ─── COUNTRIES ─────────────────────────────────────────────────────────── */
const COUNTRIES = [
  { code: "+91",  flag: "🇮🇳", name: "India",     len: 10 },
  { code: "+1",   flag: "🇺🇸", name: "USA",        len: 10 },
  { code: "+44",  flag: "🇬🇧", name: "UK",         len: 10 },
  { code: "+971", flag: "🇦🇪", name: "UAE",        len: 9  },
  { code: "+65",  flag: "🇸🇬", name: "Singapore",  len: 8  },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia",   len: 9  },
  { code: "+61",  flag: "🇦🇺", name: "Australia",  len: 9  },
  { code: "+49",  flag: "🇩🇪", name: "Germany",    len: 10 },
];

/* ─── PALETTE ───────────────────────────────────────────────────────────── */
const T = {
  ink:   "#1A1612",
  ink80: "#3D3730",
  ink60: "#6B6258",
  ink40: "#9B9088",
  ink20: "#C8C0B8",
  ink10: "#E8E2DC",
  ink05: "#F4F1ED",
  paper: "#FDFCFA",
  white: "#FFFFFF",
  green:  "#16A34A",
  greenL: "#DCFCE7",
  greenD: "#14532D",
  red:    "#DC2626",
  redL:   "#FEE2E2",
};

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Nunito+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; overflow: hidden; }
  body { font-family: 'Nunito Sans', sans-serif; -webkit-font-smoothing: antialiased; color: ${T.ink}; }
  input, button, select { font-family: inherit; }
  input { outline: none; border: none; background: transparent; }
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  button { cursor: pointer; border: none; background: none; }
  ::selection { background: rgba(var(--ac-rgb, 196,126,0), 0.18); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #D8D0C8; border-radius: 4px; }

  /* ── Animations ── */
  @keyframes panelIn    { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
  @keyframes formIn     { from{opacity:0;transform:translateX(40px) scale(.98)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn    { from{opacity:0;transform:scale(.82)} to{opacity:1;transform:scale(1)} }
  @keyframes popIn      { 0%{transform:scale(.1);opacity:0} 55%{transform:scale(1.09)} 80%{transform:scale(.97)} 100%{transform:scale(1);opacity:1} }
  @keyframes logoIn     { 0%{opacity:0;transform:scale(.55) translateY(18px)} 60%{transform:scale(1.06) translateY(-3px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes shake      { 0%,100%{transform:translateX(0)} 16%{transform:translateX(-7px)} 33%{transform:translateX(7px)} 50%{transform:translateX(-4px)} 66%{transform:translateX(4px)} 83%{transform:translateX(-2px)} }
  @keyframes ripple     { to{transform:scale(5.5);opacity:0} }
  @keyframes checkDraw  { from{stroke-dashoffset:80} to{stroke-dashoffset:0} }
  @keyframes otpPop     { 0%{transform:scale(.6)} 60%{transform:scale(1.12)} 100%{transform:scale(1)} }
  @keyframes dotBounce  { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @keyframes ping       { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.6);opacity:0} }
  @keyframes barGrow    { from{width:0;transform-origin:left} to{width:100%;transform-origin:left} }
  @keyframes confetti   { 0%{transform:translateY(-16px) rotate(0);opacity:1} 100%{transform:translateY(110vh) rotate(700deg);opacity:0} }
  @keyframes drawH      { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
  @keyframes drawV      { from{transform:scaleY(0);transform-origin:top} to{transform:scaleY(1);transform-origin:top} }
  @keyframes floatBlob  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(12px,-10px) scale(1.04)} 66%{transform:translate(-8px,8px) scale(.97)} }
  @keyframes floatBlob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-14px,8px) scale(1.03)} 66%{transform:translate(10px,-6px) scale(.98)} }
  @keyframes spinSlow   { to{transform:rotate(360deg)} }
  @keyframes spinSlowR  { to{transform:rotate(-360deg)} }
  @keyframes blink      { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes rowIn      { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes tagIn      { from{opacity:0;transform:translateY(6px) scale(.9)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes shimmer    { 0%{opacity:.6} 50%{opacity:1} 100%{opacity:.6} }
  @keyframes successIn  { 0%{opacity:0;transform:scale(.3) rotate(-12deg)} 60%{transform:scale(1.1) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
`;

/* ─── CONFETTI ─────────────────────────────────────────────────────────── */
function Confetti({ show, accent }) {
  if (!show) return null;
  const pieces = Array.from({ length: 65 }, (_, i) => ({
    id: i,
    color: [accent, T.green, "#8B5CF6", "#EC4899", "#F97316", "#3B82F6", "#FBBF24"][i % 7],
    left: `${Math.random() * 100}%`,
    delay: `${(Math.random() * 1.2).toFixed(2)}s`,
    dur: `${(1.1 + Math.random() * 0.9).toFixed(2)}s`,
    w: 5 + Math.random() * 8,
    h: Math.random() > .45 ? 5 + Math.random() * 8 : 3 + Math.random() * 4,
    r: Math.random() > .4 ? "50%" : "2px",
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:9999, overflow:"hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position:"absolute", top:-16, left:p.left, width:p.w, height:p.h, borderRadius:p.r, background:p.color, animation:`confetti ${p.dur} ease ${p.delay} forwards` }} />
      ))}
    </div>
  );
}

/* ─── LEFT PANEL BACKGROUND ────────────────────────────────────────────── */
function PanelBg({ school }) {
  const a = school.accent;
  return (
    <>
      {/* Warm base gradient */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 90% 70% at 50% -5%, ${school.accentMid}70, transparent 55%), radial-gradient(ellipse 60% 55% at 100% 100%, ${school.accentMid}50, transparent 55%), ${school.panelBg}`, pointerEvents:"none" }} />
      {/* Floating blobs */}
      <div style={{ position:"absolute", top:"8%", right:"-8%", width:280, height:280, borderRadius:"55% 45% 60% 40% / 50% 55% 45% 50%", background:`${a}12`, animation:"floatBlob 14s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"12%", left:"-10%", width:220, height:220, borderRadius:"45% 55% 40% 60% / 60% 40% 55% 45%", background:`${a}0d`, animation:"floatBlob2 18s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"42%", right:"-5%", width:140, height:140, borderRadius:"60% 40%", background:`${a}09`, animation:"floatBlob 22s ease-in-out 4s infinite", pointerEvents:"none" }} />
      {/* Fine linen texture overlay */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${a.replace('#','')}' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents:"none" }} />
      {/* Architectural SVG grid — very light */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.1, pointerEvents:"none" }} viewBox="0 0 520 900" preserveAspectRatio="xMidYMid slice">
        {[140, 280, 420, 600, 760].map((y,i) => <line key={i} x1="0" y1={y} x2="520" y2={y} stroke={a} strokeWidth=".5" strokeDasharray={i%2===0?"none":"3 10"} />)}
        {[44, 476].map((x,i) => <line key={i} x1={x} y1="0" x2={x} y2="900" stroke={a} strokeWidth=".5" />)}
        <circle cx="520" cy="0" r="160" fill="none" stroke={a} strokeWidth=".8" />
        <circle cx="520" cy="0" r="100" fill="none" stroke={a} strokeWidth=".5" />
        <circle cx="0"   cy="900" r="140" fill="none" stroke={a} strokeWidth=".7" />
        <polyline points="36,36 36,62 62,62" fill="none" stroke={a} strokeWidth="1.4" />
        <polyline points="484,36 484,62 458,62" fill="none" stroke={a} strokeWidth="1.4" />
        <polyline points="36,864 36,838 62,838" fill="none" stroke={a} strokeWidth="1.4" />
        <polyline points="484,864 484,838 458,838" fill="none" stroke={a} strokeWidth="1.4" />
      </svg>
      {/* Spinning rings */}
      <div style={{ position:"absolute", bottom:-80, right:-80, width:320, height:320, borderRadius:"50%", border:`1.5px solid ${a}18`, animation:"spinSlow 90s linear infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-45, right:-45, width:210, height:210, borderRadius:"50%", border:`1px solid ${a}12`, animation:"spinSlowR 60s linear infinite", pointerEvents:"none" }} />
      {/* Top border */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2.5px", background:`linear-gradient(90deg, transparent 5%, ${a}90 35%, ${a} 50%, ${a}90 65%, transparent 95%)`, pointerEvents:"none" }} />
      {/* Left border */}
      <div style={{ position:"absolute", top:0, bottom:0, left:0, width:"2px", background:`linear-gradient(180deg,${a}80,${a}40 30%,transparent 75%)`, pointerEvents:"none" }} />
    </>
  );
}

/* ─── SCHOOL LOGO (left panel, centered) ───────────────────────────────── */
function LogoMark({ school, size = 118 }) {
  const [imgErr, setImgErr] = useState(false);
  const hasImg = school.logoUrl && !imgErr;
  const mono = (school.short || school.name).split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 3).join("").toUpperCase();

  return (
    <div style={{ position:"relative", width:size, height:size, animation:"logoIn .8s cubic-bezier(.34,1.56,.64,1) .1s both" }}>
      {/* Outer glow ring */}
      <div style={{ position:"absolute", inset:-12, borderRadius:"50%", background:`radial-gradient(circle, ${school.accent}18, transparent 70%)`, animation:"shimmer 3.5s ease-in-out infinite" }} />
      {/* Double border rings */}
      <div style={{ position:"absolute", inset:-6, borderRadius:"50%", border:`1.5px solid ${school.accent}30` }} />
      <div style={{ position:"absolute", inset:-2, borderRadius:"50%", border:`1px solid ${school.accent}20` }} />
      {/* Main circle */}
      <div style={{
        position:"relative", width:"100%", height:"100%", borderRadius:"50%",
        background: hasImg ? T.white : `radial-gradient(circle at 38% 32%, ${school.accentMid}AA 0%, ${school.accentSoft} 60%, ${school.accentBg} 100%)`,
        border:`2.5px solid ${school.accent}45`,
        display:"flex", alignItems:"center", justifyContent:"center",
        overflow:"hidden",
        boxShadow:`0 12px 48px ${school.accent}25, 0 4px 16px ${school.accent}18, inset 0 1.5px 0 rgba(255,255,255,.9), inset 0 -1px 0 ${school.accent}18`,
      }}>
        {/* Inner ring decoration */}
        <div style={{ position:"absolute", inset:10, borderRadius:"50%", border:`1px solid ${school.accent}18` }} />
        {hasImg
          ? <img src={school.logoUrl} onError={() => setImgErr(true)} alt={school.name} style={{ width:"72%", height:"72%", objectFit:"contain", position:"relative", zIndex:1 }} />
          : <>
              <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.18 }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke={school.accent} strokeWidth="1.2"/>
                <polygon points="50,12 88,34 88,66 50,88 12,66 12,34" fill="none" stroke={school.accent} strokeWidth=".7"/>
                <line x1="10" y1="50" x2="90" y2="50" stroke={school.accent} strokeWidth=".6"/>
                <line x1="50" y1="10" x2="50" y2="90" stroke={school.accent} strokeWidth=".6"/>
              </svg>
              <span style={{
                fontFamily:"'Cormorant Garamond', Georgia, serif",
                fontSize: size * (mono.length > 2 ? 0.28 : 0.36),
                fontWeight:600, color:school.accent,
                letterSpacing: mono.length > 2 ? "-2px" : "-0.5px",
                lineHeight:1, zIndex:1, position:"relative",
                textShadow:`0 2px 16px ${school.accent}40`,
                userSelect:"none",
              }}>
                {mono}
              </span>
            </>
        }
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════════════════ */
export default function LightLogin() {
  const [demoIdx, setDemoIdx] = useState(0);
  const school = SCHOOLS[DEMO_IDS[demoIdx]];

  const [step,      setStep]      = useState("phone");
  const [phone,     setPhone]     = useState("");
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

  const otpRefs  = useRef([]);
  const ccRef    = useRef();
  const timerRef = useRef();

  useEffect(() => {
    setStep("phone"); setPhone(""); setOtp(["","","","","",""]);
    setOtpErr(false); setPhoneErr(""); setCanResend(false);
    clearInterval(timerRef.current);
  }, [demoIdx]);

  useEffect(() => {
    if (step !== "otp") return;
    setResend(30); setCanResend(false); clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResend(v => { if (v <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; } return v - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  useEffect(() => {
    const h = e => { if (ccRef.current && !ccRef.current.contains(e.target)) setShowCC(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (step === "otp" && otp.every(d => d !== "")) setTimeout(() => doVerify(otp.join("")), 300);
  }, [otp]);

  function sendOtp() {
    if (phone.length < country.len) { setPhoneErr(`Enter a valid ${country.len}-digit number`); return; }
    setPhoneErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 1500);
  }

  function doVerify(code) {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code.length === 6) {
        setStep("success");
        setTimeout(() => setConfetti(true), 100);
        setTimeout(() => setConfetti(false), 3800);
      } else {
        setOtpErr(true); setOtp(["","","","","",""]);
        setTimeout(() => { otpRefs.current[0]?.focus(); setOtpFocus(0); }, 80);
      }
    }, 1200);
  }

  function handleOtpInput(i, val) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next); setOtpErr(false);
    if (val && i < 5) setTimeout(() => { otpRefs.current[i + 1]?.focus(); setOtpFocus(i + 1); }, 0);
  }

  function handleOtpKey(i, e) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const n = [...otp]; n[i - 1] = ""; setOtp(n);
      setTimeout(() => { otpRefs.current[i - 1]?.focus(); setOtpFocus(i - 1); }, 0);
    }
    if (e.key === "ArrowLeft"  && i > 0) { otpRefs.current[i - 1]?.focus(); setOtpFocus(i - 1); }
    if (e.key === "ArrowRight" && i < 5) { otpRefs.current[i + 1]?.focus(); setOtpFocus(i + 1); }
    if (e.key === "Enter" && otp.every(d => d !== "")) doVerify(otp.join(""));
  }

  function handlePaste(e) {
    e.preventDefault();
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const n = [...otp]; d.split("").forEach((c, i) => { if (i < 6) n[i] = c; }); setOtp(n);
    setTimeout(() => { const fi = Math.min(d.length, 5); otpRefs.current[fi]?.focus(); setOtpFocus(fi); }, 0);
  }

  function doResend() {
    if (!canResend) return;
    setOtp(["","","","","",""]); setOtpErr(false);
    setResend(30); setCanResend(false); clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResend(v => { if (v <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; } return v - 1; });
    }, 1000);
  }

  const R = 15, CIRC = 2 * Math.PI * R;
  const otpFull = otp.every(d => d !== "");

  return (
    <div style={{ height:"100vh", display:"flex", overflow:"hidden", fontFamily:"'Nunito Sans',sans-serif", "--ac-rgb":school.accentRgb }}>
      <style>{CSS}</style>
      <Confetti show={confetti} accent={school.accent} />

      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL  —  Warm Institutional
      ══════════════════════════════════════════════════════════ */}
      <div style={{ flex:"0 0 46%", position:"relative", overflow:"hidden", background:school.panelBg, display:"flex", flexDirection:"column", animation:"panelIn .65s cubic-bezier(.86,0,.07,1)" }}>
        <PanelBg school={school} />

        {/* ── Top bar ── */}
        <div style={{ padding:"26px 34px 0", position:"relative", zIndex:2, display:"flex", alignItems:"center", justifyContent:"space-between", animation:"fadeIn .5s ease .18s both" }}>
          {/* ERP wordmark */}
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:school.accentBg, border:`1.5px solid ${school.accentMid}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 2px 8px ${school.accent}20` }}>
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="4.5" height="4.5" rx="1.2" fill={school.accent} opacity=".9"/>
                <rect x="7.5" y="1" width="4.5" height="4.5" rx="1.2" fill={school.accent} opacity=".55"/>
                <rect x="1" y="7.5" width="4.5" height="4.5" rx="1.2" fill={school.accent} opacity=".55"/>
                <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1.2" fill={school.accent} opacity=".3"/>
              </svg>
            </div>
            <span style={{ fontSize:11, fontWeight:800, letterSpacing:"2px", textTransform:"uppercase", color:school.accent }}>ERP Portal</span>
          </div>
          {/* School switcher */}
          <div style={{ display:"flex", gap:5 }}>
            {DEMO_IDS.map((id, i) => {
              const s = SCHOOLS[id];
              return (
                <button key={id} onClick={() => setDemoIdx(i)}
                  style={{ fontSize:10.5, fontWeight:700, padding:"4px 12px", borderRadius:20, border:`1.5px solid ${i===demoIdx ? s.accent+"70" : T.ink10}`, background: i===demoIdx ? s.accentBg : "transparent", color: i===demoIdx ? s.accent : T.ink40, transition:"all .22s ease", cursor:"pointer", boxShadow: i===demoIdx ? `0 2px 8px ${s.accent}20` : "none" }}>
                  {s.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════
            CENTERED IDENTITY BLOCK
        ══════════════════════════════════════ */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 40px 0", position:"relative", zIndex:2 }}>
          <LogoMark school={school} size={112} />

          {/* Name */}
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:23, fontWeight:600, lineHeight:1.22, color:T.ink, letterSpacing:"-.2px", marginTop:18, maxWidth:290, animation:"fadeUp .5s ease .38s both" }}>
            {school.name}
          </h1>

          {/* Attribute pills */}
          <div style={{ display:"flex", gap:7, marginTop:10, flexWrap:"wrap", justifyContent:"center", animation:"fadeUp .5s ease .46s both" }}>
            {[school.type, `Est. ${school.founded}`, school.affiliation].map((t,i) => (
              <span key={i} style={{ fontSize:10.5, fontWeight:700, letterSpacing:".3px", color:school.accent, background:school.accentBg, border:`1.5px solid ${school.accentMid}`, borderRadius:20, padding:"3px 11px", boxShadow:`0 1px 4px ${school.accent}14`, animation:`tagIn .4s ease ${.5+i*.07}s both` }}>
                {t}
              </span>
            ))}
          </div>

          {/* Tagline */}
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:14, fontWeight:400, color:T.ink60, lineHeight:1.7, marginTop:13, maxWidth:275, animation:"fadeUp .5s ease .56s both" }}>
            "{school.tagline}"
          </p>

          {/* Ornamental divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:20, width:"100%", maxWidth:320, animation:"fadeIn .6s ease .62s both" }}>
            <div style={{ flex:1, height:"1px", background:`linear-gradient(90deg, transparent, ${school.accentMid})` }} />
            <div style={{ width:6, height:6, borderRadius:"50%", background:school.accent, opacity:.5 }} />
            <div style={{ flex:1, height:"1px", background:`linear-gradient(90deg, ${school.accentMid}, transparent)` }} />
          </div>
        </div>

        {/* ══════════════════════════════════════
            SCHOOL INFO SECTIONS
        ══════════════════════════════════════ */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 34px 0", position:"relative", zIndex:2 }}>

          {/* Contact + Location */}
          <Section label="Contact & Address" delay=".65s">
            {[
              { Icon: IconPin,  label:"Address", val:`${school.address}, ${school.state}` },
              { Icon: IconPhone,label:"Phone",   val:school.phone },
              { Icon: IconMail, label:"Email",   val:school.email },
              { Icon: IconGlobe,label:"Website", val:school.website },
            ].map(({ Icon, label, val }, i) => (
              <InfoRow key={i} icon={<Icon c={school.accent}/>} label={label} val={val} school={school} delay={.7+i*.055} />
            ))}
          </Section>

          <SectionDivider school={school} delay=".9s" />

          {/* Accreditations */}
          <Section label="Accreditations" delay=".92s">
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:2 }}>
              {school.accreditations.map((a, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:school.accentBg, border:`1.5px solid ${school.accentMid}`, borderRadius:20, padding:"4px 12px", animation:`tagIn .35s ease ${.95+i*.07}s both`, boxShadow:`0 1px 4px ${school.accent}10` }}>
                  <svg width={7} height={7} viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3" fill={school.accent}/></svg>
                  <span style={{ fontSize:11, fontWeight:700, color:school.accent }}>{a}</span>
                </div>
              ))}
            </div>
          </Section>

          <SectionDivider school={school} delay="1.08s" />

          {/* Programmes */}
          <Section label="Programmes Offered" delay="1.1s">
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:2 }}>
              {school.programs.map((p, i) => (
                <span key={i} style={{ fontSize:11, fontWeight:600, color:T.ink60, background:T.ink05, border:`1px solid ${T.ink10}`, borderRadius:7, padding:"4px 10px", animation:`tagIn .35s ease ${1.12+i*.06}s both` }}>{p}</span>
              ))}
            </div>
          </Section>

          <SectionDivider school={school} delay="1.25s" />

          {/* Awards */}
          <Section label="Awards & Recognition" delay="1.28s">
            <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:2 }}>
              {school.awards.map((aw, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:9, animation:`rowIn .4s ease ${1.3+i*.08}s both` }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:school.accentBg, border:`1.5px solid ${school.accentMid}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 1px 4px ${school.accent}14` }}>
                    <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1L6.8 4.2H10L7.4 6.1l1 3.2L5.5 7.5 3.1 9.3l1-3.2L1.5 4.2H4.7z" fill={school.accent} opacity=".85"/>
                    </svg>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:T.ink60, lineHeight:1.5 }}>{aw}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Vision */}
          <div style={{ margin:"14px 0 0", padding:"14px 16px", background:school.accentBg, border:`1.5px solid ${school.accentMid}`, borderRadius:14, animation:"fadeIn .5s ease 1.42s both" }}>
            <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:"1.4px", textTransform:"uppercase", color:school.accent, marginBottom:7, opacity:.8 }}>Our Vision</p>
            <p style={{ fontSize:12.5, color:T.ink60, lineHeight:1.75, fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:500, fontSize:13.5 }}>{school.vision}</p>
          </div>
        </div>

        {/* ── Footer stats ── */}
        <div style={{ padding:"16px 34px 20px", borderTop:`1px solid ${school.accentMid}60`, position:"relative", zIndex:2, background:`${school.accentBg}90`, animation:"fadeIn .5s ease 1.5s both" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:28 }}>
              {[{ label:"Students", val:school.students },{ label:"Staff Members", val:school.staff }].map((s,i) => (
                <div key={i}>
                  <p style={{ fontSize:20, fontWeight:800, color:T.ink, lineHeight:1, fontFamily:"'DM Mono',monospace", letterSpacing:"-1px" }}>{s.val}</p>
                  <p style={{ fontSize:10, fontWeight:700, color:school.accent, letterSpacing:".8px", textTransform:"uppercase", marginTop:3, opacity:.85 }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, background:T.greenL, borderRadius:20, padding:"5px 12px", border:"1px solid rgba(22,163,74,.18)" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, animation:"blink 2s ease-in-out infinite" }} />
              <span style={{ fontSize:11.5, fontWeight:700, color:T.greenD }}>All systems live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL  —  Clean Auth
      ══════════════════════════════════════════════════════════ */}
      <div style={{ flex:1, background:T.white, overflowY:"auto", display:"flex", flexDirection:"column", position:"relative" }}>
        {/* Subtle bg texture */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(${school.accent}14 1px, transparent 1px)`, backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, right:0, width:"50%", height:"45%", background:`radial-gradient(ellipse at top right, ${school.accentSoft}, transparent 65%)`, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:0, left:0, width:"40%", height:"30%", background:`radial-gradient(ellipse at bottom left, ${T.ink05}, transparent 65%)`, pointerEvents:"none" }} />
        {/* Top accent line */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2.5px", background:`linear-gradient(90deg, ${school.accent}90 0%, ${school.accent} 50%, transparent 100%)`, pointerEvents:"none" }} />

        {/* Top bar */}
        <div style={{ padding:"26px 48px 0", display:"flex", alignItems:"center", justifyContent:"flex-end", position:"relative", zIndex:2, animation:"fadeIn .5s ease .3s both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:T.greenL, border:"1px solid rgba(22,163,74,.2)", borderRadius:20, padding:"7px 16px" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, animation:"shimmer 2s ease-in-out infinite" }} />
            <span style={{ fontSize:12.5, fontWeight:700, color:T.greenD }}>256-bit TLS Secured</span>
          </div>
        </div>

        {/* Centred form */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 48px 52px", position:"relative", zIndex:2 }}>
          <div style={{ width:"100%", maxWidth:440 }}>

            {/* ── STEP: PHONE ── */}
            {step === "phone" && (
              <div key="phone" style={{ animation:"formIn .5s cubic-bezier(.34,1.56,.64,1)" }}>
                {/* Greeting chip */}
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:school.accentBg, border:`1.5px solid ${school.accentMid}`, borderRadius:20, padding:"7px 16px", marginBottom:22, boxShadow:`0 2px 10px ${school.accent}1a` }}>
                  <span style={{ fontSize:14 }}>👋</span>
                  <span style={{ fontSize:12.5, fontWeight:700, color:school.accent }}>Welcome back</span>
                </div>

                <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:38, fontWeight:600, color:T.ink, lineHeight:1.18, letterSpacing:"-.4px", marginBottom:10 }}>
                  Sign in to your<br />
                  <span style={{ color:school.accent }}>school portal</span>
                </h2>
                <p style={{ fontSize:15, color:T.ink60, lineHeight:1.7, marginBottom:32 }}>
                  Enter your registered mobile number. A one-time verification code will be sent to you.
                </p>

                <label style={{ display:"block", fontSize:11, fontWeight:800, letterSpacing:".9px", textTransform:"uppercase", color:T.ink60, marginBottom:10 }}>Mobile Number</label>

                <PhoneInput phone={phone} setPhone={setPhone} country={country} setCountry={setCountry} showCC={showCC} setShowCC={setShowCC} ccRef={ccRef} phoneErr={phoneErr} setPhoneErr={setPhoneErr} onEnter={sendOtp} school={school} />

                {phoneErr && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, animation:"fadeUp .22s ease" }}>
                    <div style={{ width:17, height:17, borderRadius:"50%", background:T.red, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:9, color:T.white, fontWeight:900 }}>!</span>
                    </div>
                    <span style={{ fontSize:13, color:T.red, fontWeight:700 }}>{phoneErr}</span>
                  </div>
                )}

                {/* Info pill */}
                <div style={{ display:"flex", gap:12, margin:"22px 0 28px", background:school.accentBg, border:`1.5px solid ${school.accentMid}`, borderRadius:14, padding:"14px 18px", alignItems:"flex-start", boxShadow:`0 2px 12px ${school.accent}10` }}>
                  <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>🔒</span>
                  <p style={{ fontSize:13.5, color:T.ink60, lineHeight:1.65 }}>
                    Your OTP will be sent to{" "}
                    <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:T.ink }}>
                      {country.flag} {country.code} {phone || "your number"}
                    </span>
                    . Valid for 10 minutes.
                  </p>
                </div>

                <ActionBtn loading={loading} disabled={phone.length < country.len} onClick={sendOtp} school={school}>
                  Send Verification Code
                  <ArrowRight c={T.white} />
                </ActionBtn>

                <p style={{ textAlign:"center", fontSize:13, color:T.ink40, marginTop:26, lineHeight:1.7 }}>
                  Need help?{" "}
                  <span style={{ color:school.accent, fontWeight:700, cursor:"pointer" }}
                    onMouseEnter={e => e.target.style.textDecoration="underline"}
                    onMouseLeave={e => e.target.style.textDecoration="none"}>
                    Contact your school admin
                  </span>
                </p>
              </div>
            )}

            {/* ── STEP: OTP ── */}
            {step === "otp" && (
              <div key="otp" style={{ animation:"formIn .5s cubic-bezier(.34,1.56,.64,1)" }}>
                <BackButton onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setOtpErr(false); }} school={school} />

                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:school.accentBg, border:`1.5px solid ${school.accentMid}`, borderRadius:20, padding:"7px 16px", marginBottom:22, boxShadow:`0 2px 10px ${school.accent}1a` }}>
                  <span style={{ fontSize:14 }}>🔐</span>
                  <span style={{ fontSize:12.5, fontWeight:700, color:school.accent }}>Verify your number</span>
                </div>

                <h2 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:38, fontWeight:600, color:T.ink, lineHeight:1.18, letterSpacing:"-.4px", marginBottom:10 }}>
                  Enter the<br />
                  <span style={{ color:school.accent }}>6-digit code</span>
                </h2>
                <p style={{ fontSize:15, color:T.ink60, lineHeight:1.7, marginBottom:30 }}>
                  We sent a verification code to{" "}
                  <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:T.ink }}>
                    {country.flag} {country.code} ••••{phone.slice(-4)}
                  </span>
                </p>

                {/* OTP boxes */}
                <div onPaste={handlePaste} style={{ display:"flex", gap:10, marginBottom:14, animation: otpErr ? "shake .45s ease" : "none" }}>
                  {otp.map((digit, i) => {
                    const isFoc  = otpFocus === i;
                    const filled = digit !== "";
                    const bc = otpErr ? T.red : isFoc ? school.accent : filled ? `${school.accent}60` : T.ink10;
                    const bg = otpErr ? T.redL  : isFoc ? school.accentBg : filled ? school.accentSoft : T.white;
                    return (
                      <div key={i} style={{ flex:1, position:"relative" }}>
                        <input
                          ref={el => otpRefs.current[i] = el}
                          type="text" inputMode="numeric" maxLength={1}
                          value={digit}
                          onChange={e => handleOtpInput(i, e.target.value)}
                          onKeyDown={e => handleOtpKey(i, e)}
                          onFocus={() => setOtpFocus(i)}
                          style={{
                            width:"100%", height:70, borderRadius:16, textAlign:"center",
                            fontSize:28, fontWeight:700, fontFamily:"'DM Mono',monospace",
                            color: otpErr ? T.red : T.ink, background:bg,
                            border:`2px solid ${bc}`,
                            transition:"all .22s cubic-bezier(.34,1.56,.64,1)",
                            transform: isFoc ? "scale(1.07) translateY(-3px)" : filled ? "scale(1.02)" : "scale(1)",
                            boxShadow: isFoc ? `0 10px 30px ${school.accent}25, 0 0 0 5px ${school.accent}14` : filled ? `0 4px 16px ${school.accent}18` : "0 2px 8px rgba(0,0,0,.04)",
                            caretColor:"transparent", cursor:"pointer",
                            animation: filled && !isFoc ? "otpPop .22s ease" : "none",
                            outline:"none", display:"block",
                          }}
                        />
                        {filled && !isFoc && (
                          <div style={{ position:"absolute", bottom:9, left:"50%", transform:"translateX(-50%)", height:"2.5px", width:"38%", background:school.accent, borderRadius:99, animation:"barGrow .2s ease" }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {otpErr && (
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:T.redL, border:`1.5px solid ${T.red}22`, borderRadius:12, marginBottom:16, animation:"fadeUp .25s ease" }}>
                    <span style={{ fontSize:16 }}>❌</span>
                    <span style={{ fontSize:13.5, color:T.red, fontWeight:700 }}>Incorrect code. Please try again.</span>
                  </div>
                )}

                {/* Resend row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"18px 0 22px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                    {!canResend ? (
                      <>
                        <div style={{ position:"relative", width:38, height:38 }}>
                          <svg width={38} height={38} viewBox="0 0 38 38">
                            <circle cx={19} cy={19} r={R} fill="none" stroke={T.ink10} strokeWidth={2.5} />
                            <circle cx={19} cy={19} r={R} fill="none" stroke={school.accent} strokeWidth={2.5}
                              strokeDasharray={`${(resend/30)*CIRC} ${CIRC}`} strokeLinecap="round"
                              style={{ transform:"rotate(-90deg)", transformOrigin:"center", transition:"stroke-dasharray 1s linear" }}
                            />
                          </svg>
                          <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:school.accent, fontFamily:"'DM Mono',monospace" }}>{resend}</span>
                        </div>
                        <div>
                          <p style={{ fontSize:13.5, color:T.ink60, fontWeight:500 }}>Resend in <span style={{ fontWeight:800, color:T.ink, fontFamily:"'DM Mono',monospace" }}>{resend}s</span></p>
                          <p style={{ fontSize:11.5, color:T.ink40 }}>Didn't receive it? Check spam</p>
                        </div>
                      </>
                    ) : (
                      <div style={{ animation:"popIn .4s ease" }}>
                        <p style={{ fontSize:13, color:T.ink60, marginBottom:3 }}>Didn't receive the code?</p>
                        <button onClick={doResend}
                          style={{ fontSize:14, fontWeight:800, color:school.accent, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration="underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration="none"}>
                          <svg width={13} height={13} viewBox="0 0 13 13" fill="none"><path d="M1 6.5a5.5 5.5 0 1 0 1.7-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"/><path d="M1 2v4h4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Resend verification code
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:11.5, color:T.ink40 }}>Auto-submits when</p>
                    <p style={{ fontSize:11.5, color:T.ink40 }}>all 6 digits entered</p>
                  </div>
                </div>

                {/* Demo hint */}
                <div style={{ display:"flex", gap:11, marginBottom:24, background:school.accentBg, border:`1.5px solid ${school.accentMid}`, borderRadius:14, padding:"14px 18px", alignItems:"center" }}>
                  <span style={{ fontSize:15, flexShrink:0 }}>💡</span>
                  <p style={{ fontSize:13.5, color:T.ink60, lineHeight:1.6 }}>
                    <span style={{ fontWeight:800, color:T.ink }}>Demo:</span> Enter any 6 digits to continue. In production, a real SMS is dispatched.
                  </p>
                </div>

                <ActionBtn loading={loading} disabled={!otpFull || loading} onClick={() => doVerify(otp.join(""))} school={school}>
                  Verify &amp; Sign In
                  <ArrowRight c={T.white} />
                </ActionBtn>

                <p style={{ textAlign:"center", fontSize:13, color:T.ink40, marginTop:24, lineHeight:1.7 }}>
                  Wrong number?{" "}
                  <span style={{ color:school.accent, fontWeight:700, cursor:"pointer" }}
                    onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setOtpErr(false); }}
                    onMouseEnter={e => e.target.style.textDecoration="underline"}
                    onMouseLeave={e => e.target.style.textDecoration="none"}>
                    Change mobile number
                  </span>
                </p>
              </div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === "success" && (
              <div key="success" style={{ animation:"formIn .5s cubic-bezier(.34,1.56,.64,1)" }}>
                <div style={{ textAlign:"center", marginBottom:36 }}>
                  <div style={{ position:"relative", display:"inline-flex", marginBottom:24 }}>
                    <div style={{
                      width:96, height:96, borderRadius:"50%",
                      background:`linear-gradient(135deg, ${T.green}, #15803D)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:`0 20px 60px ${T.green}45`,
                      animation:"successIn .65s cubic-bezier(.34,1.56,.64,1)",
                    }}>
                      <svg width={44} height={44} viewBox="0 0 44 44">
                        <path d="M8 23l10 10 18-18" stroke={T.white} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} style={{ animation:"checkDraw .6s ease .2s both" }} />
                      </svg>
                    </div>
                    <div style={{ position:"absolute", inset:-10, borderRadius:"50%", border:`2px solid ${T.green}30`, animation:"ping 2s ease-in-out infinite" }} />
                    <div style={{ position:"absolute", inset:-22, borderRadius:"50%", border:`1px solid ${T.green}15`, animation:"ping 2s ease-in-out .6s infinite" }} />
                  </div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:600, color:T.ink, letterSpacing:"-.4px", marginBottom:10 }}>
                    Welcome back! 🎉
                  </h2>
                  <p style={{ fontSize:15, color:T.ink60, lineHeight:1.7, maxWidth:350, margin:"0 auto" }}>
                    You're now signed in to{" "}
                    <span style={{ fontWeight:800, color:school.accent }}>{school.name}</span>.
                  </p>
                </div>

                {/* Sign-in summary card */}
                <div style={{ background:T.white, border:`1.5px solid ${T.ink10}`, borderRadius:20, padding:"22px 26px", marginBottom:24, boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>
                  <p style={{ fontSize:10.5, fontWeight:800, letterSpacing:"1px", textTransform:"uppercase", color:T.ink40, marginBottom:16 }}>Sign-in Summary</p>
                  {[
                    { label:"Mobile",  val:`${country.flag} ${country.code} ${"•".repeat(6)}${phone.slice(-4)}`, mono:true },
                    { label:"School",  val:school.name, mono:false },
                    { label:"Portal",  val:"ERP Dashboard", mono:false },
                    { label:"Session", val:"Active · Expires in 24h", mono:false },
                  ].map((row, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom: i < 3 ? `1px solid ${T.ink05}` : "none" }}>
                      <span style={{ fontSize:13.5, color:T.ink40, fontWeight:500 }}>{row.label}</span>
                      <span style={{ fontSize:13.5, fontWeight:800, color:T.ink, fontFamily: row.mono ? "'DM Mono',monospace" : "inherit", letterSpacing: row.mono ? ".3px" : "normal" }}>{row.val}</span>
                    </div>
                  ))}
                </div>

                {/* Trust badges */}
                <div style={{ display:"flex", justifyContent:"center", gap:22, marginBottom:24 }}>
                  {[["🛡️","SOC 2 Compliant"],["🔐","GDPR Secure"],["⚡","256-bit TLS"]].map(([e,t],i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:14 }}>{e}</span>
                      <span style={{ fontSize:12, color:T.ink60, fontWeight:700 }}>{t}</span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ height:4, background:T.ink05, borderRadius:99, overflow:"hidden", marginBottom:10 }}>
                  <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg, ${school.accent}, ${T.green})`, animation:"barGrow 2.5s cubic-bezier(.4,0,.2,1) .3s forwards", width:0 }} />
                </div>
                <p style={{ textAlign:"center", fontSize:12.5, color:T.ink40 }}>Loading your dashboard…</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel footer */}
        <div style={{ padding:"18px 48px", borderTop:`1px solid ${T.ink10}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:T.paper, position:"relative", zIndex:2, animation:"fadeIn .5s ease .8s both" }}>
          <p style={{ fontSize:12.5, color:T.ink40, fontWeight:500 }}>
            © 2026 <span style={{ fontWeight:800, color:school.accent }}>Little Chanakya's ERP</span>
          </p>
          <div style={{ display:"flex", gap:20 }}>
            {["Privacy Policy","Terms of Use","Help Center"].map((l,i) => (
              <span key={i} style={{ fontSize:12, color:T.ink40, cursor:"pointer", fontWeight:600 }}
                onMouseEnter={e => { e.target.style.color = school.accent; }}
                onMouseLeave={e => { e.target.style.color = T.ink40; }}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SMALL HELPERS ───────────────────────────────────────────────────── */
function Section({ label, delay, children }) {
  return (
    <div style={{ marginBottom:14, animation:`fadeIn .45s ease ${delay} both` }}>
      <p style={{ fontSize:9.5, fontWeight:800, letterSpacing:"1.8px", textTransform:"uppercase", color:T.ink40, marginBottom:10 }}>{label}</p>
      {children}
    </div>
  );
}
function SectionDivider({ school, delay }) {
  return <div style={{ height:"1px", background:`linear-gradient(90deg,${school.accentMid}80,transparent)`, margin:"14px 0", animation:`drawH .6s ease ${delay} both` }} />;
}
function InfoRow({ icon, label, val, school, delay }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:9, animation:`rowIn .4s ease ${delay}s both` }}>
      <div style={{ width:27, height:27, borderRadius:8, background:school.accentBg, border:`1.5px solid ${school.accentMid}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, boxShadow:`0 1px 5px ${school.accent}14` }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize:9.5, fontWeight:800, letterSpacing:".5px", textTransform:"uppercase", color:T.ink40, marginBottom:1 }}>{label}</p>
        <p style={{ fontSize:12.5, fontWeight:600, color:T.ink60, lineHeight:1.5 }}>{val}</p>
      </div>
    </div>
  );
}
function ArrowRight({ c }) {
  return <svg width={16} height={16} viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

/* ── Inline SVG icons ── */
const IconPin   = ({c}) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M6 1C4.1 1 2.5 2.6 2.5 4.5c0 2.7 3.5 6.5 3.5 6.5s3.5-3.8 3.5-6.5C9.5 2.6 7.9 1 6 1Z" stroke={c} strokeWidth="1.3"/><circle cx="6" cy="4.5" r="1.3" stroke={c} strokeWidth="1.1"/></svg>;
const IconPhone = ({c}) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M2 2.3c0 0 .9 1.9 2.2 2.7L5.5 4c.5.9 1.4 2.3 2.7 2.8l-.9 1.4c.9 1.4 2.7 2.2 2.7 2.2l.9-1.4c0 0-2.7-4.6-4.5-6.4L2 2.3Z" stroke={c} strokeWidth="1.1"/></svg>;
const IconMail  = ({c}) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none"><rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke={c} strokeWidth="1.2"/><path d="M1 4l5 3.5L11 4" stroke={c} strokeWidth="1.1"/></svg>;
const IconGlobe = ({c}) => <svg width={12} height={12} viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke={c} strokeWidth="1.2"/><path d="M6 1C4.7 2.8 4 4.3 4 6s.7 3.2 2 5M6 1c1.3 1.8 2 3.3 2 5s-.7 3.2-2 5M1 6h10" stroke={c} strokeWidth=".9"/></svg>;

/* ─── PHONE INPUT ─────────────────────────────────────────────────────── */
function PhoneInput({ phone, setPhone, country, setCountry, showCC, setShowCC, ccRef, phoneErr, setPhoneErr, onEnter, school }) {
  const [foc, setFoc] = useState(false);
  const bc = phoneErr ? T.red : foc ? school.accent : T.ink10;
  const sh = phoneErr ? `0 0 0 4px ${T.red}12` : foc ? `0 0 0 5px ${school.accent}14` : `0 2px 12px rgba(0,0,0,.05)`;
  return (
    <div style={{ display:"flex", borderRadius:16, border:`2px solid ${bc}`, background:T.white, transition:"border-color .2s, box-shadow .2s", boxShadow:sh, animation:phoneErr?"shake .45s ease":"none", marginBottom:4 }}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}>
      {/* Country picker */}
      <div ref={ccRef} style={{ position:"relative", flexShrink:0 }}>
        <button onClick={() => setShowCC(v => !v)}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"0 18px", height:62, background:T.ink05, borderRight:`1.5px solid ${T.ink10}`, borderRadius:"14px 0 0 14px", minWidth:118, transition:"background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = T.ink10}
          onMouseLeave={e => e.currentTarget.style.background = T.ink05}
        >
          <span style={{ fontSize:22 }}>{country.flag}</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:500, color:T.ink }}>{country.code}</span>
          <svg width={10} height={10} viewBox="0 0 10 10" style={{ transform:showCC?"rotate(180deg)":"none", transition:"transform .28s cubic-bezier(.34,1.56,.64,1)", color:T.ink40, flexShrink:0 }}>
            <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {showCC && (
          <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, zIndex:999, background:T.white, borderRadius:16, boxShadow:"0 24px 56px rgba(0,0,0,.13)", border:`1.5px solid ${T.ink10}`, overflow:"hidden", minWidth:248, animation:"scaleIn .18s cubic-bezier(.34,1.56,.64,1)", transformOrigin:"top left" }}>
            {COUNTRIES.map((c, i) => (
              <div key={i} onClick={() => { setCountry(c); setShowCC(false); }}
                style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 18px", cursor:"pointer", transition:"background .12s", background:c.code===country.code?school.accentBg:"transparent", borderLeft:c.code===country.code?`3px solid ${school.accent}`:"3px solid transparent" }}
                onMouseEnter={e => { if(c.code!==country.code) e.currentTarget.style.background=T.ink05; }}
                onMouseLeave={e => { if(c.code!==country.code) e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ fontSize:22 }}>{c.flag}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:T.ink }}>{c.name}</div>
                  <div style={{ fontSize:11.5, color:T.ink40, fontFamily:"'DM Mono',monospace" }}>{c.code} · {c.len} digits</div>
                </div>
                {c.code===country.code && (
                  <div style={{ width:20, height:20, borderRadius:"50%", background:school.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width={10} height={10} viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke={T.white} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Number */}
      <input type="tel" autoFocus
        placeholder={country.code==="+91" ? "98765 43210" : "Mobile number"}
        value={phone}
        onChange={e => { const v=e.target.value.replace(/\D/g,"").slice(0,country.len); setPhone(v); if(phoneErr) setPhoneErr(""); }}
        onKeyDown={e => e.key==="Enter" && onEnter()}
        style={{ flex:1, padding:"0 20px", height:62, fontSize:21, fontWeight:700, color:T.ink, letterSpacing:"2.5px", fontFamily:"'DM Mono',monospace", caretColor:school.accent }}
      />
      {phone.length===country.len && (
        <div style={{ display:"flex", alignItems:"center", paddingRight:18, animation:"scaleIn .25s cubic-bezier(.34,1.56,.64,1)" }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:T.green, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 12px ${T.green}35` }}>
            <svg width={12} height={12} viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={T.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ACTION BUTTON ────────────────────────────────────────────────────── */
function ActionBtn({ loading, disabled, onClick, children, school }) {
  const [ripples, setRipples] = useState([]);
  const ref = useRef();
  const dis = disabled || loading;
  const fire = e => {
    if (dis) return;
    const r = ref.current.getBoundingClientRect(); const id = Date.now();
    setRipples(p => [...p, { id, x:e.clientX-r.left, y:e.clientY-r.top }]);
    setTimeout(() => setRipples(p => p.filter(x => x.id!==id)), 800);
    onClick?.();
  };
  return (
    <button ref={ref} onClick={fire} disabled={dis}
      style={{
        width:"100%", padding:"17px 28px", borderRadius:16,
        background: dis ? T.ink05 : `linear-gradient(135deg, ${school.accent} 0%, ${school.accent}CC 100%)`,
        color: dis ? T.ink40 : T.white, fontSize:15.5, fontWeight:800,
        cursor: dis ? "not-allowed" : "pointer", border: dis ? `1.5px solid ${T.ink10}` : "none",
        position:"relative", overflow:"hidden",
        transition:"all .28s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: dis ? "none" : `0 8px 28px ${school.accent}40, 0 2px 8px ${school.accent}25`,
        display:"flex", alignItems:"center", justifyContent:"center", gap:12,
        letterSpacing:".1px",
      }}
      onMouseEnter={e => { if(!dis) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 16px 40px ${school.accent}50, 0 4px 12px ${school.accent}30`; } }}
      onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow=dis?"none":`0 8px 28px ${school.accent}40, 0 2px 8px ${school.accent}25`; }}
    >
      {ripples.map(r => <span key={r.id} style={{ position:"absolute", left:r.x-4, top:r.y-4, width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,.5)", animation:"ripple .8s ease forwards", pointerEvents:"none" }} />)}
      {loading ? (
        <><span style={{ display:"flex", gap:5 }}>{[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:T.white, display:"inline-block", animation:`dotBounce 1s ease ${i*.18}s infinite` }} />)}</span><span>Please wait…</span></>
      ) : children}
    </button>
  );
}

/* ─── BACK BUTTON ──────────────────────────────────────────────────────── */
function BackButton({ onClick, school }) {
  return (
    <button onClick={onClick}
      style={{ display:"flex", alignItems:"center", gap:7, fontSize:13.5, fontWeight:700, color:T.ink60, marginBottom:24, marginLeft:-10, padding:"6px 10px", borderRadius:10, transition:"all .18s ease" }}
      onMouseEnter={e => { e.currentTarget.style.background=T.ink05; e.currentTarget.style.transform="translateX(-3px)"; e.currentTarget.style.color=school.accent; }}
      onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.transform="none"; e.currentTarget.style.color=T.ink60; }}
    >
      <svg width={16} height={16} viewBox="0 0 16 16"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Back
    </button>
  );
}
