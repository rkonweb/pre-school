import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  Check, X, AlertCircle, Info, CheckCircle, AlertTriangle, Upload, Calendar,
  User, Users, Mail, Phone, Lock, Star, Trash2, Edit2, Plus, Minus,
  Filter, Download, ArrowUpDown, ArrowUp, ArrowDown, FileText, Bell,
  Settings, Zap, Shield, Layers, BarChart2, Sparkles, BookOpen,
  ToggleLeft, Grid, Hash, DollarSign, TrendingUp, TrendingDown,
  GraduationCap, Clock, Activity, MoreVertical, Copy, ExternalLink,
  PanelRight, MessageSquare, Award, Target, Flame, Heart, Smile,
  LayoutDashboard, Maximize2, RefreshCw, Send, AtSign
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

// ─── DESIGN TOKENS ────────────────────────────────────────
const C = {
  amber:"#F59E0B", amberD:"#D97706", amberL:"#FEF3C7", amberXL:"#FFFBEB",
  navy:"#1E1B4B", navyM:"#312E81", navyL:"#EDE9FE",
  green:"#10B981", greenD:"#059669", greenL:"#D1FAE5", greenXL:"#ECFDF5",
  red:"#EF4444", redL:"#FEE2E2", redXL:"#FEF2F2",
  blue:"#3B82F6", blueL:"#DBEAFE", blueXL:"#EFF6FF",
  orange:"#F97316", orangeL:"#FFEDD5",
  purple:"#8B5CF6", purpleL:"#EDE9FE",
  pink:"#EC4899", pinkL:"#FCE7F3",
  teal:"#14B8A6", tealL:"#CCFBF1",
  g50:"#F9FAFB", g100:"#F3F4F6", g200:"#E5E7EB",
  g300:"#D1D5DB", g400:"#9CA3AF", g500:"#6B7280",
  g600:"#4B5563", g700:"#374151", g800:"#1F2937",
  r:"14px", rS:"10px", rL:"20px", rXL:"28px",
  sh:"0 4px 24px rgba(0,0,0,0.07)",
  shM:"0 8px 32px rgba(0,0,0,0.12)",
  shL:"0 16px 48px rgba(0,0,0,0.18)",
  tr:"all 0.22s cubic-bezier(0.4,0,0.2,1)",
  bo:"all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  spring:"cubic-bezier(0.34,1.56,0.64,1)",
};

// ─── GLOBAL STYLES ─────────────────────────────────────────
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:#F3F4F6;border-radius:4px}
    ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px}
    ::-webkit-scrollbar-thumb:hover{background:#F59E0B}

    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
    @keyframes scaleUp{from{transform:scale(0.95)}to{transform:scale(1)}}
    @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}55%{transform:scale(1.1)}75%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideLeft{from{opacity:0;transform:translateX(100%)}to{opacity:0.97;transform:translateX(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes spinReverse{to{transform:rotate(-360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes pulseSc{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
    @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes wiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-6deg)}40%{transform:rotate(6deg)}60%{transform:rotate(-4deg)}80%{transform:rotate(4deg)}}
    @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.2)}28%{transform:scale(1)}42%{transform:scale(1.15)}70%{transform:scale(1)}}
    @keyframes rubberBand{0%{transform:scale3d(1,1,1)}30%{transform:scale3d(1.25,0.75,1)}40%{transform:scale3d(0.75,1.25,1)}50%{transform:scale3d(1.15,0.85,1)}65%{transform:scale3d(0.95,1.05,1)}75%{transform:scale3d(1.05,0.95,1)}100%{transform:scale3d(1,1,1)}}
    @keyframes jello{0%,100%{transform:skewX(0) skewY(0)}11%{transform:skewX(-12deg) skewY(-12deg)}22%{transform:skewX(6deg) skewY(6deg)}33%{transform:skewX(-3deg) skewY(-3deg)}44%{transform:skewX(1.5deg) skewY(1.5deg)}55%{transform:skewX(-0.75deg) skewY(-0.75deg)}}
    @keyframes tada{0%{transform:scale3d(1,1,1)}10%,20%{transform:scale3d(.9,.9,.9) rotate3d(0,0,1,-3deg)}30%,50%,70%,90%{transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)}40%,60%,80%{transform:scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)}100%{transform:scale3d(1,1,1)}}
    @keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes ripple{to{transform:scale(4);opacity:0}}
    @keyframes barGrow{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}
    @keyframes dashDraw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
    @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes orbitPulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.4)}70%{box-shadow:0 0 0 10px rgba(245,158,11,0)}}
    @keyframes tiltLeft{0%,100%{transform:rotate(0)}50%{transform:rotate(-2deg) scale(1.02)}}
    @keyframes progressFill{from{width:0%}to{width:var(--w)}}
    @keyframes typewriter{from{width:0}to{width:100%}}
    @keyframes blinkCaret{from,to{border-right-color:transparent}50%{border-right-color:#F59E0B}}

    .hover-lift{transition:transform 0.3s ${C.spring},box-shadow 0.3s ease}
    .hover-lift:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 12px 32px rgba(0,0,0,0.14)}
    .hover-tilt:hover{animation:tiltLeft 0.6s ease infinite}
    .wiggle-hover:hover{animation:wiggle 0.5s ease}
    .rubber-hover:hover{animation:rubberBand 0.6s ease}
    .jello-hover:hover{animation:jello 0.7s ease}
    .float-anim{animation:float 3.5s ease-in-out infinite}
    .pulse-anim{animation:pulse 2s ease-in-out infinite}
    .heartbeat-anim{animation:heartbeat 1.5s ease-in-out infinite}
    .spin-slow{animation:spin 8s linear infinite}
    .tada-anim{animation:tada 0.8s ease}
  `}</style>
);

// ─── SHARED HELPERS ───────────────────────────────────────
const Card = ({ children, id, style={}, className="" }) => (
  <div id={id} className={className} style={{ background:"white", borderRadius:24, padding:"30px 28px", boxShadow:C.sh, marginBottom:24, animation:"fadeUp 0.45s ease both", ...style }}>
    {children}
  </div>
);
const Divider = () => <div style={{ height:1, background:`linear-gradient(90deg,${C.amber}30,${C.g200},transparent)`, margin:"22px 0" }}/>;
const SL = ({ children }) => <div style={{ fontSize:11, fontWeight:700, color:C.g300, letterSpacing:1.1, textTransform:"uppercase", marginBottom:14 }}>{children}</div>;
const Lbl = ({ children, required }) => <label style={{ fontSize:12.5, fontWeight:700, color:C.g600, display:"block", marginBottom:6 }}>{children}{required && <span style={{ color:C.red }}> *</span>}</label>;
const Helper = ({ type="default", children }) => {
  const col = { default:C.g400, error:C.red, success:C.green, warning:C.amber }[type];
  const Ic = { error:AlertCircle, success:CheckCircle, warning:AlertTriangle }[type];
  return <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:5, fontSize:11.5, color:col, fontWeight:500 }}>{Ic&&<Ic size={11}/>}{children}</div>;
};
const SHdr = ({ icon:Icon, title, sub, color=C.amber, badge }) => (
  <div style={{ marginBottom:26 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
      <span style={{ background:`${color}20`, borderRadius:10, padding:"6px 8px", display:"flex" }}><Icon size={18} color={color}/></span>
      <span style={{ fontFamily:"'Sora',sans-serif", fontSize:19, fontWeight:800, color:C.navy }}>{title}</span>
      {badge && <span style={{ background:`linear-gradient(135deg,${C.amber},${C.orange})`, color:"white", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20, letterSpacing:0.5 }}>{badge}</span>}
    </div>
    <p style={{ fontSize:13, color:C.g400, marginLeft:44 }}>{sub}</p>
  </div>
);

// ─── RIPPLE BUTTON ────────────────────────────────────────
const BV = {
  primary:{ bg:`linear-gradient(135deg,#F59E0B,#F97316)`, color:"white", border:"none", sh:"0 4px 16px #F59E0B45" },
  secondary:{ bg:"white", color:"#1E1B4B", border:"1.5px solid #E5E7EB", sh:C.sh },
  ghost:{ bg:"transparent", color:"#6B7280", border:"none", sh:"none" },
  danger:{ bg:"linear-gradient(135deg,#EF4444,#DC2626)", color:"white", border:"none", sh:"0 4px 14px #EF444440" },
  success:{ bg:"linear-gradient(135deg,#10B981,#059669)", color:"white", border:"none", sh:"0 4px 14px #10B98140" },
  navy:{ bg:"linear-gradient(135deg,#1E1B4B,#312E81)", color:"white", border:"none", sh:"0 4px 14px #1E1B4B40" },
  outline:{ bg:"transparent", color:"#F59E0B", border:"1.5px solid #F59E0B", sh:"none" },
  soft:{ bg:"#FEF3C7", color:"#D97706", border:"none", sh:"none" },
};
const BS = { sm:{ p:"7px 14px", fs:12, r:9 }, md:{ p:"10px 20px", fs:13.5, r:12 }, lg:{ p:"13px 26px", fs:15, r:14 } };

const Btn = ({ variant="primary", size="md", icon:Icon, iconPos="left", loading, disabled, children, onClick, fullWidth, animate }) => {
  const [ripples, setRipples] = useState([]);
  const ref = useRef();
  const v=BV[variant]; const s=BS[size]; const dis=disabled||loading;

  const handleClick = e => {
    if(dis) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r=>[...r,{id,x,y}]);
    setTimeout(()=>setRipples(r=>r.filter(rp=>rp.id!==id)), 600);
    onClick?.();
  };

  return (
    <button ref={ref} disabled={dis} onClick={handleClick}
      onMouseEnter={e=>{ if(!dis){ e.currentTarget.style.filter="brightness(1.08)"; e.currentTarget.style.transform="translateY(-2px) scale(1.03)"; }}}
      onMouseLeave={e=>{ e.currentTarget.style.filter="none"; e.currentTarget.style.transform="scale(1)"; }}
      style={{ background:dis?"#F3F4F6":v.bg, color:dis?"#9CA3AF":v.color, border:v.border||"none", borderRadius:s.r, padding:s.p, fontSize:s.fs, fontWeight:700, cursor:dis?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:dis?"none":v.sh, fontFamily:"'Plus Jakarta Sans',sans-serif", width:fullWidth?"100%":"auto", transition:`${C.bo}, filter 0.15s`, opacity:dis?0.55:1, letterSpacing:0.2, position:"relative", overflow:"hidden" }}>
      {ripples.map(rp=>(
        <span key={rp.id} style={{ position:"absolute", left:rp.x, top:rp.y, width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,0.5)", transform:"scale(1)", animation:"ripple 0.6s ease forwards", marginLeft:-4, marginTop:-4, pointerEvents:"none" }}/>
      ))}
      {loading
        ? <div style={{ width:14, height:14, border:`2px solid ${v.color}40`, borderTop:`2px solid ${v.color}`, borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
        : (Icon && iconPos==="left" ? <Icon size={s.fs-1} strokeWidth={2.2}/> : null)}
      {children}
      {!loading && Icon && iconPos==="right" && <Icon size={s.fs-1} strokeWidth={2.2}/>}
    </button>
  );
};

// ─── INPUT ────────────────────────────────────────────────
const Input = ({ label, placeholder, type="text", icon:Icon, state, helperText, required, value, onChange, prefix, suffix, disabled, size="md" }) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const bColor = state==="error"?C.red:state==="success"?C.green:state==="warning"?C.amber:focused?C.amber:C.g200;
  const bg = state==="error"?C.redXL:state==="success"?C.greenXL:focused?C.amberXL:C.g50;
  const pMap = { sm:"8px 12px", md:"11px 14px", lg:"14px 16px" };
  const fsMap = { sm:12.5, md:13.5, lg:15 };
  return (
    <div style={{ width:"100%", maxWidth:300 }}>
      {label && <Lbl required={required}>{label}</Lbl>}
      <div style={{ position:"relative", display:"flex", alignItems:"center", background:disabled?C.g100:bg, border:`1.5px solid ${bColor}`, borderRadius:C.r, transition:`${C.tr}, box-shadow 0.25s`, boxShadow:focused?`0 0 0 4px ${C.amber}20, 0 2px 8px ${C.amber}15`:"none", opacity:disabled?0.6:1, transform:focused?"translateY(-1px)":"none" }}>
        {prefix && <span style={{ padding:"0 0 0 14px", fontSize:13, color:C.g400, fontWeight:600, whiteSpace:"nowrap" }}>{prefix}</span>}
        {Icon && <span style={{ padding:"0 0 0 12px", display:"flex" }}><Icon size={15} color={focused?C.amber:C.g400} style={{ transition:C.tr, transform:focused?"rotate(-5deg) scale(1.1)":"none" }}/></span>}
        <input type={type==="password"?(showPw?"text":"password"):type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{ flex:1, border:"none", background:"transparent", padding:pMap[size], fontSize:fsMap[size], color:C.g800, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif", paddingLeft:(Icon||prefix)?8:undefined, fontWeight:500, minWidth:0 }}/>
        {suffix && <span style={{ padding:"0 14px 0 0", fontSize:13, color:C.g400, fontWeight:600 }}>{suffix}</span>}
        {type==="password" && <button onClick={()=>setShowPw(v=>!v)} style={{ background:"none", border:"none", padding:"0 12px", cursor:"pointer", display:"flex", color:C.g400, transition:C.tr }}>{showPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>}
        {state==="error"   && <span style={{ padding:"0 10px 0 0", display:"flex", animation:"bounceIn 0.4s ease" }}><AlertCircle size={15} color={C.red}/></span>}
        {state==="success" && <span style={{ padding:"0 10px 0 0", display:"flex", animation:"bounceIn 0.4s ease" }}><CheckCircle size={15} color={C.green}/></span>}
      </div>
      {helperText && <Helper type={state||"default"}>{helperText}</Helper>}
    </div>
  );
};

// ─── TOGGLE ───────────────────────────────────────────────
const Toggle = ({ label, sub, size="md", colorOn=C.amber, disabled, defaultOn=false }) => {
  const [on, setOn] = useState(defaultOn);
  const dims = { sm:[36,20,14,3], md:[46,26,20,3], lg:[56,30,22,4] }[size];
  const [w,h,d,g] = dims;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, opacity:disabled?0.5:1 }}>
      {(label||sub) && <div>
        {label && <div style={{ fontSize:13.5, fontWeight:600, color:C.g800 }}>{label}</div>}
        {sub && <div style={{ fontSize:11.5, color:C.g400, marginTop:2 }}>{sub}</div>}
      </div>}
      <div onClick={()=>!disabled&&setOn(v=>!v)} style={{ width:w, height:h, borderRadius:h/2, background:on?colorOn:C.g200, position:"relative", cursor:disabled?"not-allowed":"pointer", transition:`background 0.4s ${C.spring}`, flexShrink:0, boxShadow:on?`0 3px 12px ${colorOn}55`:"inset 0 2px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ position:"absolute", top:g, left:on?w-d-g:g, width:d, height:d, borderRadius:"50%", background:"white", boxShadow:"0 2px 8px rgba(0,0,0,0.25)", transition:`left 0.4s ${C.spring}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {on && <Check size={d*0.45} color={colorOn} strokeWidth={3} style={{ animation:"bounceIn 0.3s ease" }}/>}
        </div>
      </div>
    </div>
  );
};

// ─── CHECKBOX ─────────────────────────────────────────────
const Checkbox = ({ label, sub, checked:init=false, indeterminate, disabled, color=C.amber }) => {
  const [checked, setChecked] = useState(init);
  return (
    <div onClick={()=>!disabled&&setChecked(v=>!v)} style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1, userSelect:"none" }}>
      <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${checked||indeterminate?color:C.g300}`, background:checked||indeterminate?color:"white", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:`all 0.3s ${C.spring}`, boxShadow:checked?`0 3px 10px ${color}45`:"none", marginTop:1, transform:checked?"scale(1.08)":"scale(1)" }}>
        {indeterminate?<Minus size={11} color="white" strokeWidth={3}/>:checked?<Check size={11} color="white" strokeWidth={3} style={{ animation:"bounceIn 0.3s ease" }}/>:null}
      </div>
      {(label||sub) && <div>
        {label && <div style={{ fontSize:13.5, fontWeight:500, color:C.g800, textDecoration:checked?"line-through":undefined, transition:C.tr, opacity:checked?0.6:1 }}>{label}</div>}
        {sub && <div style={{ fontSize:11.5, color:C.g400, marginTop:2 }}>{sub}</div>}
      </div>}
    </div>
  );
};

// ─── SELECT ───────────────────────────────────────────────
const Select = ({ label, options=[], placeholder="Select option", required, helperText, state, multi }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(multi?[]:"");
  const [q, setQ] = useState("");
  const ref = useRef();
  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  const filtered = options.filter(o=>o.label.toLowerCase().includes(q.toLowerCase()));
  const isObj = selected&&typeof selected==="object"&&!Array.isArray(selected);
  const toggle = o=>{ if(multi) setSelected(s=>s.find(x=>x.value===o.value)?s.filter(x=>x.value!==o.value):[...s,o]); else { setSelected(o); setOpen(false); }};
  const displayText = multi?(Array.isArray(selected)&&selected.length?`${selected.length} selected`:placeholder):(isObj?selected.label:placeholder);
  return (
    <div style={{ width:"100%", maxWidth:280, position:"relative" }} ref={ref}>
      {label && <Lbl required={required}>{label}</Lbl>}
      <div onClick={()=>setOpen(v=>!v)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", border:`1.5px solid ${open?C.amber:state==="error"?C.red:C.g200}`, borderRadius:C.r, padding:"11px 14px", cursor:"pointer", background:open?C.amberXL:C.g50, boxShadow:open?`0 0 0 4px ${C.amber}20`:"none", transition:C.tr, userSelect:"none", transform:open?"translateY(-1px)":"none" }}>
        <span style={{ fontSize:13.5, color:(multi?Array.isArray(selected)&&selected.length:isObj)?C.g800:C.g400 }}>{displayText}</span>
        <ChevronDown size={16} color={C.g400} style={{ transform:open?"rotate(180deg)":"none", transition:`transform 0.35s ${C.spring}`, flexShrink:0 }}/>
      </div>
      {multi&&Array.isArray(selected)&&selected.length>0&&(
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
          {selected.map(s=>(
            <span key={s.value} style={{ background:C.amberL, color:C.amberD, borderRadius:20, padding:"3px 10px", fontSize:11.5, fontWeight:700, display:"flex", alignItems:"center", gap:4, animation:"bounceIn 0.3s ease" }}>
              {s.label}<X size={10} style={{ cursor:"pointer" }} onClick={e=>{e.stopPropagation();toggle(s);}}/>
            </span>
          ))}
        </div>
      )}
      {open&&(
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"white", border:`1.5px solid ${C.g100}`, borderRadius:C.rL, boxShadow:C.shM, zIndex:999, overflow:"hidden", animation:"slideDown 0.2s ease" }}>
          <div style={{ padding:"8px 10px", borderBottom:`1px solid ${C.g100}`, position:"relative" }}>
            <Search size={13} color={C.g400} style={{ position:"absolute", left:20, top:"50%", transform:"translateY(-50%)" }}/>
            <input autoFocus placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} style={{ width:"100%", border:`1px solid ${C.g200}`, borderRadius:8, padding:"6px 8px 6px 28px", fontSize:12.5, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif", background:C.g50 }}/>
          </div>
          <div style={{ maxHeight:200, overflowY:"auto" }}>
            {filtered.length===0?<div style={{ padding:16, textAlign:"center", fontSize:13, color:C.g400 }}>No results</div>:filtered.map((o,idx)=>{
              const isSel=multi?(Array.isArray(selected)?selected.find(x=>x.value===o.value):false):(isObj&&selected.value===o.value);
              return (
                <div key={o.value} onClick={()=>toggle(o)} style={{ padding:"10px 14px", fontSize:13.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", background:isSel?C.amberXL:"white", color:isSel?C.amberD:C.g700, fontWeight:isSel?700:400, transition:C.tr, animation:`slideRight 0.2s ease ${idx*0.03}s both` }}
                  onMouseEnter={e=>{ if(!isSel)e.currentTarget.style.background=C.g50; }}
                  onMouseLeave={e=>{ if(!isSel)e.currentTarget.style.background="white"; }}>
                  {o.label}{isSel&&<Check size={14} color={C.amber}/>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {helperText&&<Helper type={state||"default"}>{helperText}</Helper>}
    </div>
  );
};

// ─── BADGE ────────────────────────────────────────────────
const bcMap = {
  amber:{bg:C.amberL,color:C.amberD,dot:"#F59E0B"}, green:{bg:C.greenL,color:"#065F46",dot:C.green},
  red:{bg:C.redL,color:"#991B1B",dot:C.red}, blue:{bg:C.blueL,color:"#1D4ED8",dot:C.blue},
  purple:{bg:C.purpleL,color:"#5B21B6",dot:C.purple}, gray:{bg:C.g100,color:C.g600,dot:C.g400},
  navy:{bg:C.navyL,color:C.navyM,dot:C.navy}, pink:{bg:C.pinkL,color:"#9D174D",dot:C.pink},
  teal:{bg:C.tealL,color:"#0F766E",dot:C.teal},
};
const Badge = ({ label, color="amber", icon:Icon, dot, removable, pulse:doPulse, size="sm" }) => {
  const [vis, setVis] = useState(true);
  if(!vis) return null;
  const bc = bcMap[color]||bcMap.amber;
  const fsSz = size==="lg" ? 13.5 : 11.5;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:bc.bg, color:bc.color, borderRadius:20, padding:size==="lg"?"6px 14px":"4px 11px", fontSize:fsSz, fontWeight:700, letterSpacing:0.2, position:"relative" }}>
      {dot && <span style={{ width:6, height:6, borderRadius:"50%", background:bc.dot, animation:doPulse?"orbitPulse 1.5s ease-in-out infinite":undefined }}/>}
      {Icon && <Icon size={11} strokeWidth={2.5}/>}
      {label}
      {removable && <X size={10} style={{ cursor:"pointer", marginLeft:2, transition:C.tr }} onClick={()=>setVis(false)}/>}
    </span>
  );
};

// ─── ALERT ────────────────────────────────────────────────
const Alert = ({ type="info", title, message, dismissible }) => {
  const [vis, setVis] = useState(true);
  const [exiting, setExiting] = useState(false);
  if(!vis) return null;
  const m = {
    info:{bg:C.blueXL,border:C.blue,color:"#1D4ED8",icon:Info,iconBg:C.blueL},
    success:{bg:C.greenXL,border:C.green,color:"#065F46",icon:CheckCircle,iconBg:C.greenL},
    warning:{bg:C.amberXL,border:C.amber,color:C.amberD,icon:AlertTriangle,iconBg:C.amberL},
    error:{bg:C.redXL,border:C.red,color:"#991B1B",icon:AlertCircle,iconBg:C.redL},
  }[type];
  const Ic = m.icon;
  const dismiss = ()=>{ setExiting(true); setTimeout(()=>setVis(false), 300); };
  return (
    <div style={{ background:m.bg, border:`1.5px solid ${m.border}30`, borderLeft:`4px solid ${m.border}`, borderRadius:C.r, padding:"13px 16px", display:"flex", alignItems:"flex-start", gap:12, animation:exiting?"fadeIn 0.3s ease reverse":"fadeUp 0.35s ease", transition:"all 0.3s ease" }}>
      <div style={{ background:m.iconBg, borderRadius:8, padding:6, flexShrink:0 }}><Ic size={15} color={m.border}/></div>
      <div style={{ flex:1 }}>
        {title && <div style={{ fontSize:13.5, fontWeight:700, color:m.color, marginBottom:2 }}>{title}</div>}
        <div style={{ fontSize:12.5, color:m.color, opacity:0.85 }}>{message}</div>
      </div>
      {dismissible && <X size={15} color={m.color} style={{ cursor:"pointer", opacity:0.6, flexShrink:0, transition:C.tr }} className="wiggle-hover" onClick={dismiss}/>}
    </div>
  );
};

// ─── PROGRESS BAR ─────────────────────────────────────────
const ProgressBar = ({ value, color=C.amber, label, animated, striped }) => {
  const [width, setWidth] = useState(0);
  useEffect(()=>{ setTimeout(()=>setWidth(value), 100); },[value]);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        {label && <span style={{ fontSize:12.5, fontWeight:600, color:C.g600 }}>{label}</span>}
        <span style={{ fontSize:12.5, fontWeight:800, color, animation:"countUp 0.5s ease" }}>{value}%</span>
      </div>
      <div style={{ height:10, background:C.g100, borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${width}%`, background:`linear-gradient(90deg,${color},${color}cc)`, borderRadius:99, transition:"width 1.4s cubic-bezier(0.34,1.56,0.64,1)", position:"relative", overflow:"hidden" }}>
          {animated && <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)", backgroundSize:"200% 100%", animation:"shimmer 2s infinite" }}/>}
          {striped && <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(255,255,255,0.15) 8px,rgba(255,255,255,0.15) 16px)" }}/>}
        </div>
      </div>
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────
const Skeleton = ({ width="100%", height=16, radius=8, circle }) => (
  <div style={{ width:circle?height:width, height, borderRadius:circle?"50%":radius, background:"linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)", backgroundSize:"600px 100%", animation:"shimmer 1.6s infinite", flexShrink:0 }}/>
);

const SkeletonCard = () => (
  <div style={{ background:"white", borderRadius:20, padding:20, boxShadow:C.sh }}>
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
      <Skeleton width={44} height={44} circle/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
        <Skeleton width="60%" height={14}/>
        <Skeleton width="40%" height={11}/>
      </div>
    </div>
    <Skeleton width="100%" height={10} radius={4}/>
    <div style={{ height:8 }}/>
    <Skeleton width="80%" height={10} radius={4}/>
    <div style={{ height:8 }}/>
    <Skeleton width="90%" height={10} radius={4}/>
  </div>
);

// ─── LOADING BAR ──────────────────────────────────────────
const LoadingBar = () => {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(()=>{
    setPct(0); setDone(false);
    const t1 = setTimeout(()=>setPct(30),100);
    const t2 = setTimeout(()=>setPct(65),600);
    const t3 = setTimeout(()=>setPct(85),1200);
    const t4 = setTimeout(()=>setPct(100),1800);
    const t5 = setTimeout(()=>setDone(true),2200);
    return ()=>[t1,t2,t3,t4,t5].forEach(clearTimeout);
  },[]);
  return (
    <div style={{ background:C.g50, borderRadius:C.r, padding:20 }}>
      <div style={{ fontSize:12.5, fontWeight:600, color:C.g500, marginBottom:10, display:"flex", justifyContent:"space-between" }}>
        <span>{done?"Complete!":"Loading resources..."}</span>
        <span style={{ color:done?C.green:C.amber, fontWeight:800 }}>{pct}%</span>
      </div>
      <div style={{ height:5, background:C.g200, borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:done?`linear-gradient(90deg,${C.green},${C.teal})`:`linear-gradient(90deg,${C.amber},${C.orange})`, borderRadius:99, transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)", position:"relative" }}>
          <div style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", width:10, height:10, borderRadius:"50%", background:"white", boxShadow:`0 0 6px ${done?C.green:C.amber}` }}/>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD LOADER ─────────────────────────────────────
const DashboardLoader = () => (
  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
      {[...Array(4)].map((_,i)=>(
        <div key={i} style={{ background:"white", borderRadius:18, padding:20, boxShadow:C.sh, animation:`fadeUp 0.5s ease ${i*0.1}s both` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
            <Skeleton width={40} height={40} circle/>
            <Skeleton width={60} height={20} radius={10}/>
          </div>
          <Skeleton width="80%" height={28} radius={6}/>
          <div style={{ height:8 }}/>
          <Skeleton width="50%" height={11} radius={4}/>
        </div>
      ))}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
      <div style={{ background:"white", borderRadius:18, padding:20, boxShadow:C.sh }}>
        <Skeleton width="40%" height={18} radius={6}/>
        <div style={{ height:16 }}/>
        <Skeleton width="100%" height={180} radius={10}/>
      </div>
      <div style={{ background:"white", borderRadius:18, padding:20, boxShadow:C.sh }}>
        <Skeleton width="50%" height={18} radius={6}/>
        <div style={{ height:16 }}/>
        {[...Array(5)].map((_,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <Skeleton width={32} height={32} circle/>
            <div style={{ flex:1 }}><Skeleton width="70%" height={12} radius={4}/><div style={{ height:6 }}/><Skeleton width="40%" height={10} radius={4}/></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── TOAST ────────────────────────────────────────────────
const TDEFS = [
  { type:"success", label:"Enrolled!", Ic:CheckCircle, color:C.green, msg:"Student saved successfully." },
  { type:"error",   label:"Error",     Ic:AlertCircle,  color:C.red,   msg:"Failed to save changes." },
  { type:"warning", label:"Warning",   Ic:AlertTriangle,color:C.amber, msg:"Unsaved changes detected." },
  { type:"info",    label:"Info",      Ic:Info,          color:C.blue,  msg:"Session expires in 5 min." },
];
const ToastDemo = () => {
  const [toasts, setToasts] = useState([]);
  const fire = type=>{ const id=Date.now(); setToasts(t=>[...t,{id,type}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500); };
  return (
    <div>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {TDEFS.map(t=><Btn key={t.type} variant={t.type==="success"?"success":t.type==="error"?"danger":t.type==="warning"?"primary":"navy"} icon={t.Ic} size="sm" onClick={()=>fire(t.type)}>{t.label}</Btn>)}
      </div>
      <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:10, zIndex:9999 }}>
        {toasts.map((t,i)=>{ const def=TDEFS.find(d=>d.type===t.type); const Ic=def.Ic; return (
          <div key={t.id} style={{ background:"white", borderRadius:C.rL, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:C.shL, animation:"bounceIn 0.45s ease", minWidth:270, borderLeft:`4px solid ${def.color}`, transform:`translateY(${i*2}px)` }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`${def.color}18`, display:"flex", alignItems:"center", justifyContent:"center", animation:"pulseSc 2s ease-in-out infinite" }}><Ic size={17} color={def.color}/></div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:700, color:C.g800 }}>{def.label}</div>
              <div style={{ fontSize:12, color:C.g400 }}>{def.msg}</div>
            </div>
            <X size={14} color={C.g400} style={{ cursor:"pointer", transition:C.tr }} onClick={()=>setToasts(ts=>ts.filter(x=>x.id!==t.id))}/>
          </div>
        );})}
      </div>
    </div>
  );
};

// ─── MODAL ────────────────────────────────────────────────
const ModalDemo = () => {
  const [form, setForm] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
      <Btn variant="primary" icon={Plus} onClick={()=>setForm(true)}>Form Modal</Btn>
      <Btn variant="danger" icon={Trash2} onClick={()=>setConfirm(true)}>Confirm Delete</Btn>
      {form&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(30,27,75,0.6)", zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", animation:"fadeIn 0.2s ease" }} onClick={()=>setForm(false)}>
          <div style={{ background:"white", borderRadius:24, padding:32, width:"90%", maxWidth:500, boxShadow:C.shL, animation:"scaleIn 0.3s ease" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:19, fontWeight:800, color:C.navy, marginBottom:4 }}>Add New Student</h2>
                <p style={{ fontSize:13, color:C.g400 }}>Fill in the details to enrol a student.</p>
              </div>
              <button onClick={()=>setForm(false)} className="rubber-hover" style={{ width:32, height:32, borderRadius:9, border:`1.5px solid ${C.g200}`, background:C.g50, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={15} color={C.g500}/></button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Input label="First Name" placeholder="Dhwani" icon={User} required/>
              <Input label="Last Name" placeholder="T" icon={User} required/>
              <Input label="Email" placeholder="parent@school.com" icon={Mail} type="email"/>
              <Input label="Phone" placeholder="9090909090" icon={Phone} prefix="+91"/>
            </div>
            <div style={{ marginTop:16 }}><Select label="Class" options={[{value:"ukg-a",label:"UKG-A"},{value:"ukg-b",label:"UKG-B"},{value:"g1a",label:"Grade 1-A"}]} required/></div>
            <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"flex-end" }}>
              <Btn variant="secondary" onClick={()=>setForm(false)}>Cancel</Btn>
              <Btn variant="primary" icon={Check} onClick={()=>setForm(false)}>Save Student</Btn>
            </div>
          </div>
        </div>
      )}
      {confirm&&(
        <div style={{ position:"fixed", inset:0, background:"rgba(30,27,75,0.6)", zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }} onClick={()=>setConfirm(false)}>
          <div style={{ background:"white", borderRadius:24, padding:32, width:"90%", maxWidth:360, boxShadow:C.shL, animation:"bounceIn 0.4s ease", textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:56, height:56, borderRadius:16, background:C.redXL, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center", animation:"heartbeat 1.5s ease-in-out 3" }}><Trash2 size={24} color={C.red}/></div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:C.navy, marginBottom:8 }}>Delete Student?</h2>
            <p style={{ fontSize:13.5, color:C.g400, marginBottom:24 }}>This will permanently remove the record. Cannot be undone.</p>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" fullWidth onClick={()=>setConfirm(false)}>Cancel</Btn>
              <Btn variant="danger" fullWidth onClick={()=>setConfirm(false)}>Yes, Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SLIDE-OVER ───────────────────────────────────────────
const SlideOver = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Btn variant="navy" icon={PanelRight} onClick={()=>setOpen(true)}>Open Slide-Over Panel</Btn>
      {open&&(
        <>
          <div style={{ position:"fixed", inset:0, background:"rgba(30,27,75,0.4)", zIndex:9990, animation:"fadeIn 0.25s ease", backdropFilter:"blur(3px)" }} onClick={()=>setOpen(false)}/>
          <div style={{ position:"fixed", top:0, right:0, bottom:0, width:420, background:"white", zIndex:9991, boxShadow:"-8px 0 48px rgba(0,0,0,0.18)", animation:"slideLeft 0.35s ease", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"24px 24px 18px", borderBottom:`1px solid ${C.g100}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${C.amber},${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center" }}><User size={18} color="white"/></div>
                  <div>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:C.navy }}>Student Profile</div>
                    <div style={{ fontSize:12, color:C.g400 }}>Edit and manage student details</div>
                  </div>
                </div>
              </div>
              <button onClick={()=>setOpen(false)} className="rubber-hover" style={{ width:30, height:30, borderRadius:8, border:`1.5px solid ${C.g200}`, background:C.g50, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={14} color={C.g500}/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
              {[{label:"Full Name",val:"Dhwani T",icon:User},{label:"Roll Number",val:"X4DYG8",icon:Hash},{label:"Class",val:"UKG-B",icon:BookOpen},{label:"Email",val:"parent@school.com",icon:Mail},{label:"Phone",val:"+91 9090909090",icon:Phone}].map((f,i)=>(
                <div key={i} style={{ marginBottom:16, animation:`slideRight 0.3s ease ${i*0.07}s both` }}>
                  <Lbl>{f.label}</Lbl>
                  <div style={{ display:"flex", alignItems:"center", gap:10, background:C.g50, border:`1.5px solid ${C.g200}`, borderRadius:C.r, padding:"11px 14px" }}>
                    <f.icon size={14} color={C.amber}/>
                    <span style={{ fontSize:13.5, color:C.g700, fontWeight:500 }}>{f.val}</span>
                  </div>
                </div>
              ))}
              <Divider/>
              <SL>Performance Summary</SL>
              {[["Attendance","94%",C.green],["Homework Score","87%",C.blue],["Test Average","91%",C.amber]].map(([l,v,c],i)=>(
                <div key={i} style={{ marginBottom:12, animation:`slideRight 0.3s ease ${i*0.08+0.4}s both` }}>
                  <ProgressBar value={parseInt(v)} color={c} label={l} animated/>
                </div>
              ))}
            </div>
            <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.g100}`, display:"flex", gap:10 }}>
              <Btn variant="secondary" fullWidth onClick={()=>setOpen(false)}>Cancel</Btn>
              <Btn variant="primary" icon={Check} fullWidth onClick={()=>setOpen(false)}>Save Changes</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── POPOVER ──────────────────────────────────────────────
const Popover = ({ trigger, children, width=260 }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div style={{ position:"relative", display:"inline-block" }} ref={ref}>
      <div onClick={()=>setOpen(v=>!v)}>{trigger}</div>
      {open&&(
        <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, width, background:"white", borderRadius:C.rL, boxShadow:C.shM, border:`1.5px solid ${C.g100}`, zIndex:998, animation:"scaleIn 0.2s ease", transformOrigin:"top left" }}>
          <div style={{ position:"absolute", top:-6, left:18, width:12, height:12, background:"white", border:`1.5px solid ${C.g100}`, borderBottom:"none", borderRight:"none", transform:"rotate(45deg)" }}/>
          <div style={{ padding:16 }}>{children}</div>
        </div>
      )}
    </div>
  );
};

// ─── DROPDOWN MENU ────────────────────────────────────────
const DropdownMenu = ({ items, align="left" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div style={{ position:"relative" }} ref={ref}>
      <button onClick={()=>setOpen(v=>!v)} className="rubber-hover" style={{ width:34, height:34, borderRadius:10, border:`1.5px solid ${C.g200}`, background:open?C.amberXL:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:C.tr }}>
        <MoreVertical size={15} color={open?C.amber:C.g500}/>
      </button>
      {open&&(
        <div style={{ position:"absolute", top:"calc(100% + 6px)", [align==="right"?"right":"left"]:0, width:190, background:"white", borderRadius:C.rL, boxShadow:C.shM, border:`1.5px solid ${C.g100}`, zIndex:997, overflow:"hidden", animation:"scaleIn 0.18s ease" }}>
          {items.map((item,i)=>(
            item.divider
              ? <div key={i} style={{ height:1, background:C.g100, margin:"4px 0" }}/>
              : <div key={i} onClick={()=>{ item.onClick?.(); setOpen(false); }}
                  style={{ padding:"10px 14px", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:9, color:item.danger?C.red:C.g700, fontWeight:500, transition:C.tr, animation:`slideRight 0.2s ease ${i*0.04}s both` }}
                  onMouseEnter={e=>e.currentTarget.style.background=item.danger?C.redXL:C.g50}
                  onMouseLeave={e=>e.currentTarget.style.background="white"}>
                  {item.icon && <item.icon size={14} color={item.danger?C.red:C.g400}/>}{item.label}
                </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── STEP WIZARD ──────────────────────────────────────────
const StepWizard = ({ steps }) => {
  const [cur, setCur] = useState(0);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", marginBottom:24 }}>
        {steps.map((s,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", flex:i<steps.length-1?1:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div onClick={()=>setCur(i)} style={{ width:38, height:38, borderRadius:"50%", background:i<=cur?`linear-gradient(135deg,${C.amber},${C.orange})`:C.g100, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:`all 0.4s ${C.spring}`, boxShadow:i===cur?`0 0 0 5px ${C.amber}25, 0 4px 14px ${C.amber}45`:"none", transform:i===cur?"scale(1.15)":"scale(1)" }}>
                {i<cur?<Check size={16} color="white" strokeWidth={3} style={{ animation:"bounceIn 0.3s ease" }}/>:<span style={{ fontSize:13, fontWeight:800, color:i<=cur?"white":C.g400 }}>{i+1}</span>}
              </div>
              <span style={{ fontSize:11, fontWeight:i===cur?700:500, color:i===cur?C.amber:i<cur?C.green:C.g400, whiteSpace:"nowrap", transition:C.tr }}>{s.label}</span>
            </div>
            {i<steps.length-1&&<div style={{ flex:1, height:2.5, margin:"0 8px", marginBottom:18, background:i<cur?`linear-gradient(90deg,${C.amber},${C.orange})`:C.g200, borderRadius:2, transition:"background 0.5s ease" }}/>}
          </div>
        ))}
      </div>
      <div style={{ padding:"18px 20px", background:`linear-gradient(135deg,${C.amberXL},${C.orangeL})`, borderRadius:C.r, fontSize:14, color:C.amberD, fontWeight:600, animation:"fadeUp 0.3s ease", borderLeft:`3px solid ${C.amber}` }}>
        <span style={{ fontSize:11, fontWeight:700, opacity:0.6, display:"block", marginBottom:4 }}>STEP {cur+1} OF {steps.length}</span>
        {steps[cur]?.content}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <Btn variant="secondary" disabled={cur===0} onClick={()=>setCur(c=>c-1)} icon={ChevronLeft}>Back</Btn>
        <Btn variant="primary" disabled={cur===steps.length-1} onClick={()=>setCur(c=>c+1)} icon={ChevronRight} iconPos="right">Next</Btn>
      </div>
    </div>
  );
};

// ─── TABS ─────────────────────────────────────────────────
const Tabs = ({ tabs, variant="pill" }) => {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display:"flex", gap:variant==="underline"?0:8, borderBottom:variant==="underline"?`2px solid ${C.g100}`:"none", background:variant==="pill"?C.g100:"transparent", borderRadius:variant==="pill"?12:0, width:"fit-content", padding:variant==="pill"?"4px":"0", marginBottom:18 }}>
        {tabs.map((t,i)=>(
          <button key={i} onClick={()=>setActive(i)} style={{ padding:variant==="underline"?"10px 18px":"8px 18px", fontSize:13.5, fontWeight:i===active?700:500, color:i===active?(variant==="underline"?C.amber:"white"):C.g500, background:i===active?(variant==="underline"?"transparent":`linear-gradient(135deg,${C.amber},${C.orange})`):"transparent", border:"none", cursor:"pointer", borderRadius:variant==="underline"?0:10, borderBottom:variant==="underline"?`2px solid ${i===active?C.amber:"transparent"}`:"none", marginBottom:variant==="underline"?-2:0, transition:`all 0.35s ${C.spring}`, boxShadow:i===active&&variant==="pill"?`0 3px 12px ${C.amber}40`:"none", transform:i===active&&variant==="pill"?"scale(1.03)":"scale(1)" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize:13.5, color:C.g600, animation:"fadeUp 0.25s ease" }}>{tabs[active]?.content}</div>
    </div>
  );
};

// ─── DATA TABLE ───────────────────────────────────────────
const ROWS = [
  { id:1, name:"Dhwani T",   code:"X4DYG8", cls:"UKG-B",  gender:"Female",  status:"Active",   score:98, fee:"Paid" },
  { id:2, name:"Adwaidh",    code:"J96SWH", cls:"UKG-B",  gender:"Male",    status:"Active",   score:91, fee:"Paid" },
  { id:3, name:"Student3",   code:"YIHREG", cls:"UKG-B",  gender:"Male",    status:"Inactive", score:78, fee:"Pending" },
  { id:4, name:"Riya Sharma",code:"RS2024", cls:"Gr.1-A", gender:"Female",  status:"Active",   score:93, fee:"Paid" },
  { id:5, name:"Aryan Kumar",code:"AK2025", cls:"Gr.2-A", gender:"Male",    status:"Active",   score:88, fee:"Partial" },
  { id:6, name:"Meera Nair", code:"MN2024", cls:"Gr.1-B", gender:"Female",  status:"Active",   score:95, fee:"Paid" },
];
const APLTS = [C.amber,C.green,C.purple,C.red,C.blue,C.pink];
const SChip = ({ label }) => {
  const m = { Active:{bg:C.greenL,color:"#065F46"}, Inactive:{bg:C.redL,color:"#991B1B"}, Paid:{bg:C.greenL,color:"#065F46"}, Pending:{bg:C.redL,color:"#991B1B"}, Partial:{bg:C.amberL,color:C.amberD} };
  const s = m[label]||{bg:C.g100,color:C.g600};
  return <span style={{ ...s, borderRadius:20, padding:"3px 11px", fontSize:12, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5 }}><span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor" }}/>{label}</span>;
};

const DataTable = () => {
  const [sortCol, setSortCol] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [sel, setSel] = useState([]);
  const sorted = [...ROWS].sort((a,b)=>sortDir==="asc"?String(a[sortCol]||"").localeCompare(String(b[sortCol]||"")):String(b[sortCol]||"").localeCompare(String(a[sortCol]||"")));
  const sortTgl = col=>{ setSortDir(d=>sortCol===col?(d==="asc"?"desc":"asc"):"asc"); setSortCol(col); };
  const tglRow = id=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const cols = [{k:"name",l:"Student"},{k:"cls",l:"Class"},{k:"gender",l:"Gender"},{k:"status",l:"Status"},{k:"score",l:"Score"},{k:"fee",l:"Fee"},{k:"actions",l:"",ns:true}];
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        {sel.length>0&&<span style={{ background:C.redL, color:C.red, borderRadius:10, padding:"7px 14px", fontSize:12.5, fontWeight:700, display:"flex", alignItems:"center", gap:6, animation:"bounceIn 0.35s ease" }}><Trash2 size={13}/> Delete {sel.length}</span>}
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <Btn variant="secondary" icon={Download} size="sm">Export</Btn>
          <Btn variant="primary" icon={Plus} size="sm">Add Student</Btn>
        </div>
      </div>
      <div style={{ borderRadius:C.rL, border:`1px solid ${C.g100}`, overflow:"hidden", boxShadow:C.sh }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:`linear-gradient(135deg,${C.navy},${C.navyM})` }}>
              <th style={{ padding:"12px 14px", width:40 }}>
                <div onClick={()=>setSel(s=>s.length===ROWS.length?[]:ROWS.map(r=>r.id))} style={{ width:18, height:18, borderRadius:5, border:"2px solid rgba(255,255,255,0.4)", background:sel.length===ROWS.length?"white":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:C.bo }}>
                  {sel.length===ROWS.length&&<Check size={11} color={C.navy} strokeWidth={3}/>}
                </div>
              </th>
              {cols.map(c=>(
                <th key={c.k} onClick={()=>!c.ns&&sortTgl(c.k)} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.8)", letterSpacing:0.6, textTransform:"uppercase", cursor:c.ns?"default":"pointer", userSelect:"none", whiteSpace:"nowrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>{c.l}{!c.ns&&(sortCol===c.k?(sortDir==="asc"?<ArrowUp size={11} color="white"/>:<ArrowDown size={11} color="white"/>):<ArrowUpDown size={10} color="rgba(255,255,255,0.3)"/>)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row,i)=>{
              const isSel=sel.includes(row.id); const ac=APLTS[i%APLTS.length];
              return (
                <tr key={row.id} style={{ background:isSel?C.amberXL:i%2===0?"white":C.g50, borderBottom:`1px solid ${C.g100}`, transition:C.tr, animation:`slideRight 0.3s ease ${i*0.05}s both` }}
                  onMouseEnter={e=>{ if(!isSel){e.currentTarget.style.background=C.amberXL; e.currentTarget.style.transform="translateX(3px)";} }}
                  onMouseLeave={e=>{ if(!isSel){e.currentTarget.style.background=i%2===0?"white":C.g50; e.currentTarget.style.transform="none";} }}>
                  <td style={{ padding:"11px 14px" }}>
                    <div onClick={()=>tglRow(row.id)} style={{ width:18, height:18, borderRadius:5, border:`2px solid ${isSel?C.amber:C.g300}`, background:isSel?C.amber:"white", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:`all 0.3s ${C.spring}`, transform:isSel?"scale(1.1)":"scale(1)" }}>
                      {isSel&&<Check size={11} color="white" strokeWidth={3} style={{ animation:"bounceIn 0.3s ease" }}/>}
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:33, height:33, borderRadius:10, background:`${ac}20`, color:ac, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0, transition:C.bo }} className="rubber-hover">
                        {row.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontSize:13.5, fontWeight:700, color:C.g800 }}>{row.name}</div>
                        <div style={{ fontSize:11, color:C.g400 }}>{row.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}><span style={{ background:C.amberL, color:C.amberD, borderRadius:8, padding:"3px 10px", fontSize:12, fontWeight:700 }}>{row.cls}</span></td>
                  <td style={{ padding:"11px 14px", fontSize:13, color:C.g600 }}>{row.gender}</td>
                  <td style={{ padding:"11px 14px" }}><SChip label={row.status}/></td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ flex:1, maxWidth:55, height:5, background:C.g100, borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:`${row.score}%`, height:"100%", background:`linear-gradient(90deg,${C.amber},${C.green})`, borderRadius:3, transition:"width 1s ease" }}/>
                      </div>
                      <span style={{ fontSize:12.5, fontWeight:800, color:row.score>=90?C.green:row.score>=75?C.amber:C.red }}>{row.score}</span>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px" }}><SChip label={row.fee}/></td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                      {[{Ic:Edit2,hBg:C.amberXL,hB:C.amber,c:C.amber},{Ic:Trash2,hBg:C.redXL,hB:C.red,c:C.red}].map(({Ic,hBg,hB,c},bi)=>(
                        <button key={bi} className="rubber-hover" style={{ width:30, height:30, borderRadius:9, border:`1.5px solid ${C.g200}`, background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:C.tr }}
                          onMouseEnter={e=>{ e.currentTarget.style.background=hBg; e.currentTarget.style.borderColor=hB; e.currentTarget.style.transform="scale(1.1)"; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background="white"; e.currentTarget.style.borderColor=C.g200; e.currentTarget.style.transform="scale(1)"; }}>
                          <Ic size={13} color={c}/>
                        </button>
                      ))}
                      <DropdownMenu align="right" items={[
                        {label:"View Profile",icon:User},{label:"Edit Student",icon:Edit2},{label:"Copy ID",icon:Copy},{divider:true},{label:"Delete",icon:Trash2,danger:true}
                      ]}/>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════
// ─── CHART DATA ──────────────────────────────────
// ════════════════════════════════════════════════
const attendanceData = [
  {day:"Mon",present:45,absent:3},{day:"Tue",present:42,absent:6},{day:"Wed",present:47,absent:1},
  {day:"Thu",present:44,absent:4},{day:"Fri",present:43,absent:5},{day:"Sat",present:38,absent:10},
];
const feeData = [
  {month:"Oct",collected:82,pending:18},{month:"Nov",collected:91,pending:9},
  {month:"Dec",collected:75,pending:25},{month:"Jan",collected:88,pending:12},
  {month:"Feb",collected:95,pending:5},{month:"Mar",collected:79,pending:21},
];
const performanceData = [
  {subject:"Math",avg:87,top:98},{subject:"Science",avg:82,top:95},{subject:"English",avg:79,top:92},
  {subject:"Hindi",avg:85,top:97},{subject:"SST",avg:77,top:90},
];
const pieData = [
  {name:"UKG-A",value:48,color:C.amber},{name:"UKG-B",value:52,color:C.orange},
  {name:"Gr.1-A",value:44,color:C.green},{name:"Gr.1-B",value:40,color:C.blue},
  {name:"Gr.2-A",value:38,color:C.purple},{name:"Gr.2-B",value:42,color:C.pink},
];
const trendData = [
  {week:"W1",students:320,attendance:91},{week:"W2",students:328,attendance:93},
  {week:"W3",students:335,attendance:89},{week:"W4",students:342,attendance:94},
  {week:"W5",students:338,attendance:92},{week:"W6",students:345,attendance:96},
];
const radialData = [
  {name:"Attendance",value:94,fill:C.green},{name:"Fee Collection",value:82,fill:C.amber},
  {name:"Homework",value:76,fill:C.blue},{name:"Participation",value:88,fill:C.purple},
];

const ChartTooltip = ({ active, payload, label }) => {
  if(!active||!payload||!payload.length) return null;
  return (
    <div style={{ background:"white", border:`1.5px solid ${C.g100}`, borderRadius:C.r, padding:"10px 14px", boxShadow:C.shM }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.g400, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700, color:C.g800, marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:p.color||p.fill, flexShrink:0 }}/>
          {p.name}: <span style={{ color:p.color||p.fill }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── BAR CHART COMPONENT ──────────────────────────────────
const BarChartCard = () => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy }}>Weekly Attendance</div>
        <div style={{ fontSize:12, color:C.g400 }}>Present vs Absent — this week</div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Badge label="Present" color="green" dot/>
        <Badge label="Absent" color="red" dot/>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={attendanceData} barGap={4} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke={C.g100} vertical={false}/>
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize:12, fill:C.g400, fontWeight:600 }}/>
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:C.g400 }}/>
        <Tooltip content={<ChartTooltip/>}/>
        <Bar dataKey="present" name="Present" fill={C.green} radius={[8,8,0,0]} maxBarSize={36}/>
        <Bar dataKey="absent" name="Absent" fill={C.redL} radius={[8,8,0,0]} maxBarSize={36}/>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ─── STACKED BAR CHART ────────────────────────────────────
const StackedBarCard = () => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy }}>Fee Collection</div>
        <div style={{ fontSize:12, color:C.g400 }}>Collected vs Pending (%)</div>
      </div>
      <Btn variant="soft" icon={Download} size="sm">Export</Btn>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={feeData} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={C.g100} vertical={false}/>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:12, fill:C.g400, fontWeight:600 }}/>
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:C.g400 }} domain={[0,100]}/>
        <Tooltip content={<ChartTooltip/>}/>
        <Bar dataKey="collected" name="Collected" stackId="a" fill={C.amber} radius={[0,0,0,0]}/>
        <Bar dataKey="pending" name="Pending" stackId="a" fill={C.redL} radius={[6,6,0,0]}/>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ─── LINE CHART ───────────────────────────────────────────
const LineChartCard = () => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy }}>Growth Trends</div>
        <div style={{ fontSize:12, color:C.g400 }}>Students enrolled & attendance %</div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Badge label="Students" color="navy" dot/>
        <Badge label="Attendance %" color="amber" dot/>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.g100} vertical={false}/>
        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize:12, fill:C.g400, fontWeight:600 }}/>
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:C.g400 }}/>
        <Tooltip content={<ChartTooltip/>}/>
        <Line type="monotone" dataKey="students" name="Students" stroke={C.navy} strokeWidth={3} dot={{ r:5, fill:"white", stroke:C.navy, strokeWidth:2.5 }} activeDot={{ r:7, fill:C.navy }}/>
        <Line type="monotone" dataKey="attendance" name="Attendance %" stroke={C.amber} strokeWidth={3} strokeDasharray="6 2" dot={{ r:5, fill:"white", stroke:C.amber, strokeWidth:2.5 }} activeDot={{ r:7, fill:C.amber }}/>
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ─── AREA CHART ───────────────────────────────────────────
const AreaChartCard = () => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
      <div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy }}>Subject Performance</div>
        <div style={{ fontSize:12, color:C.g400 }}>Class average vs top scorer</div>
      </div>
      <Badge label="6 months" color="gray"/>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={performanceData}>
        <defs>
          <linearGradient id="gradTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.amber} stopOpacity={0.25}/>
            <stop offset="95%" stopColor={C.amber} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.blue} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.g100} vertical={false}/>
        <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize:12, fill:C.g400, fontWeight:600 }}/>
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:C.g400 }} domain={[60,100]}/>
        <Tooltip content={<ChartTooltip/>}/>
        <Area type="monotone" dataKey="top" name="Top Score" stroke={C.amber} strokeWidth={2.5} fill="url(#gradTop)" dot={{ r:4, fill:C.amber }}/>
        <Area type="monotone" dataKey="avg" name="Class Avg" stroke={C.blue} strokeWidth={2.5} fill="url(#gradAvg)" dot={{ r:4, fill:C.blue }}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ─── PIE CHART ────────────────────────────────────────────
const PieChartCard = () => {
  const [activeIdx, setActiveIdx] = useState(null);
  const total = pieData.reduce((a,b)=>a+b.value, 0);
  return (
    <div>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy, marginBottom:4 }}>Class Distribution</div>
      <div style={{ fontSize:12, color:C.g400, marginBottom:16 }}>Students per class • {total} total</div>
      <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={3} dataKey="value"
              onMouseEnter={(_,i)=>setActiveIdx(i)} onMouseLeave={()=>setActiveIdx(null)}>
              {pieData.map((e,i)=>(
                <Cell key={i} fill={e.color} opacity={activeIdx===null||activeIdx===i?1:0.4}
                  style={{ transition:"all 0.3s ease", filter:activeIdx===i?`drop-shadow(0 4px 12px ${e.color}60)`:undefined }}/>
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex:1, minWidth:140 }}>
          {pieData.map((d,i)=>(
            <div key={i} onMouseEnter={()=>setActiveIdx(i)} onMouseLeave={()=>setActiveIdx(null)}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, padding:"6px 10px", borderRadius:10, background:activeIdx===i?`${d.color}12`:"transparent", transition:C.tr, cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:d.color, transition:`transform 0.3s ${C.spring}`, transform:activeIdx===i?"scale(1.4)":"scale(1)" }}/>
                <span style={{ fontSize:13, fontWeight:activeIdx===i?700:500, color:C.g700 }}>{d.name}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:13.5, fontWeight:800, color:d.color }}>{d.value}</span>
                <span style={{ fontSize:11, color:C.g400 }}>{Math.round(d.value/total*100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── DONUT GAUGE ──────────────────────────────────────────
const DonutGauge = ({ value, max=100, color=C.amber, label, sub }) => {
  const r = 42; const circ = 2*Math.PI*r;
  const pct = value/max; const offset = circ*(1-pct*0.75);
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ position:"relative", display:"inline-block" }}>
        <svg width={110} height={110} viewBox="0 0 110 110">
          <circle cx={55} cy={55} r={r} fill="none" stroke={C.g100} strokeWidth={10} strokeDasharray={`${circ*0.75} ${circ*0.25}`} strokeDashoffset={`${-circ*0.125}`} strokeLinecap="round"/>
          <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={`${circ*0.75} ${circ*0.25}`} strokeDashoffset={`${-circ*0.125+circ*0.75*(1-pct)}`}
            strokeLinecap="round" style={{ transition:"stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)", filter:`drop-shadow(0 2px 8px ${color}50)` }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:C.navy, animation:"countUp 0.8s ease" }}>{value}%</div>
        </div>
      </div>
      <div style={{ fontSize:13.5, fontWeight:700, color:C.g700, marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11.5, color:C.g400 }}>{sub}</div>}
    </div>
  );
};

// ─── RADIAL BAR CHART ─────────────────────────────────────
const RadialChartCard = () => (
  <div>
    <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy, marginBottom:4 }}>Performance Rings</div>
    <div style={{ fontSize:12, color:C.g400, marginBottom:16 }}>Key metrics at a glance</div>
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart innerRadius={20} outerRadius={88} data={radialData} startAngle={180} endAngle={-180}>
        <RadialBar minAngle={15} dataKey="value" cornerRadius={6} background={{ fill:C.g100 }}>
          {radialData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
        </RadialBar>
        <Tooltip content={({ active, payload })=>{
          if(!active||!payload?.length) return null;
          const d=payload[0];
          return <div style={{ background:"white", border:`1.5px solid ${C.g100}`, borderRadius:10, padding:"8px 12px", boxShadow:C.shM, fontSize:13, fontWeight:700, color:C.g800 }}>{d.payload.name}: <span style={{ color:d.payload.fill }}>{d.value}%</span></div>;
        }}/>
      </RadialBarChart>
    </ResponsiveContainer>
    <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginTop:4 }}>
      {radialData.map((d,i)=><Badge key={i} label={`${d.name} ${d.value}%`} color={i===0?"green":i===1?"amber":i===2?"blue":"purple"} dot/>)}
    </div>
  </div>
);

// ─── MINI STAT CARD WITH SPARKLINE ────────────────────────
const MiniSparkline = ({ data, color }) => (
  <ResponsiveContainer width={70} height={32}>
    <LineChart data={data.map((v,i)=>({i,v}))}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false}/>
    </LineChart>
  </ResponsiveContainer>
);

const StatCard = ({ icon:Icon, label, value, delta, color, bg, spark }) => {
  const isUp = delta >= 0;
  return (
    <div className="hover-lift" style={{ background:"white", borderRadius:20, padding:"20px 22px", boxShadow:C.sh, border:`1px solid ${C.g100}`, cursor:"pointer" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:bg, display:"flex", alignItems:"center", justifyContent:"center" }} className="wiggle-hover">
          <Icon size={20} color={color}/>
        </div>
        <span style={{ fontSize:11.5, fontWeight:700, color:isUp?C.green:C.red, background:isUp?C.greenXL:C.redXL, borderRadius:20, padding:"3px 9px", display:"flex", alignItems:"center", gap:3 }}>
          {isUp?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{isUp?"+":""}{delta}%
        </span>
      </div>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, color:C.navy, letterSpacing:-1, marginBottom:2, animation:"countUp 0.6s ease" }}>{value}</div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12.5, color:C.g400, fontWeight:500 }}>{label}</span>
        {spark && <MiniSparkline data={spark} color={color}/>}
      </div>
    </div>
  );
};

// ─── BENTO GRID ───────────────────────────────────────────
const BentoGrid = () => {
  const [live, setLive] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setLive(true),200); return()=>clearTimeout(t); },[]);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gridTemplateRows:"auto", gap:16 }}>

      {/* Row 1: 4 stat cards */}
      {[
        { icon:Users,    label:"Total Students",  value:"342",    delta:4.2,  color:C.purple, bg:C.purpleL, spark:[320,325,318,328,335,342,338,345] },
        { icon:Activity, label:"Attendance Today", value:"94%",   delta:2.1,  color:C.green,  bg:C.greenL,  spark:[88,91,93,89,92,94,91,94] },
        { icon:DollarSign,label:"Fee Collected",  value:"₹10.2L", delta:12.5, color:C.amber,  bg:C.amberL,  spark:[7.5,8.2,7.9,9.1,9.8,10.2,10.0,10.2] },
        { icon:BookOpen, label:"Active Classes",  value:"18",     delta:-0.5, color:C.blue,   bg:C.blueL,   spark:[18,18,19,18,17,18,18,18] },
      ].map((s,i)=>(
        <div key={i} style={{ animation:`bounceIn 0.5s ease ${i*0.1}s both` }}>
          <StatCard {...s}/>
        </div>
      ))}

      {/* Row 2: Bar chart (2 cols) + Pie (1 col) + Gauges (1 col) */}
      <div style={{ gridColumn:"span 2", background:"white", borderRadius:24, padding:24, boxShadow:C.sh, animation:"fadeUp 0.5s ease 0.4s both" }}>
        <BarChartCard/>
      </div>
      <div style={{ background:"white", borderRadius:24, padding:24, boxShadow:C.sh, animation:"fadeUp 0.5s ease 0.5s both" }}>
        <PieChartCard/>
      </div>
      <div style={{ background:"white", borderRadius:24, padding:24, boxShadow:C.sh, display:"flex", flexDirection:"column", justifyContent:"space-between", animation:"fadeUp 0.5s ease 0.6s both" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy, marginBottom:4 }}>Goal Meters</div>
        <div style={{ fontSize:12, color:C.g400, marginBottom:16 }}>Live KPI tracking</div>
        <div style={{ display:"flex", justifyContent:"space-around" }}>
          <DonutGauge value={94} color={C.green} label="Attendance"/>
          <DonutGauge value={82} color={C.amber} label="Fees"/>
        </div>
      </div>

      {/* Row 3: Area chart (2 cols) + Line chart (2 cols) */}
      <div style={{ gridColumn:"span 2", background:"white", borderRadius:24, padding:24, boxShadow:C.sh, animation:"fadeUp 0.5s ease 0.7s both" }}>
        <AreaChartCard/>
      </div>
      <div style={{ gridColumn:"span 2", background:"white", borderRadius:24, padding:24, boxShadow:C.sh, animation:"fadeUp 0.5s ease 0.8s both" }}>
        <LineChartCard/>
      </div>

      {/* Row 4: Stacked bar (2 cols) + Radial (1 col) + Activity feed (1 col) */}
      <div style={{ gridColumn:"span 2", background:"white", borderRadius:24, padding:24, boxShadow:C.sh, animation:"fadeUp 0.5s ease 0.9s both" }}>
        <StackedBarCard/>
      </div>
      <div style={{ background:"white", borderRadius:24, padding:24, boxShadow:C.sh, animation:"fadeUp 0.5s ease 1.0s both" }}>
        <RadialChartCard/>
      </div>
      <div style={{ background:"white", borderRadius:24, padding:24, boxShadow:C.sh, animation:"fadeUp 0.5s ease 1.1s both", overflow:"hidden" }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy, marginBottom:4 }}>Live Feed</div>
        <div style={{ fontSize:12, color:C.g400, marginBottom:16 }}>Recent activity</div>
        {[
          { icon:CheckCircle, msg:"Dhwani marked present", time:"2m ago", color:C.green },
          { icon:DollarSign, msg:"Fee received — Riya", time:"8m ago", color:C.amber },
          { icon:Plus, msg:"New student enrolled", time:"15m ago", color:C.blue },
          { icon:AlertTriangle, msg:"Aryan absent today", time:"22m ago", color:C.red },
          { icon:BookOpen, msg:"Homework uploaded — Gr.2", time:"1h ago", color:C.purple },
        ].map((a,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, animation:`slideRight 0.3s ease ${i*0.08}s both` }}>
            <div style={{ width:30, height:30, borderRadius:9, background:`${a.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><a.icon size={13} color={a.color}/></div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, fontWeight:600, color:C.g700, lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.msg}</div>
              <div style={{ fontSize:11, color:C.g400 }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ACCORDION ────────────────────────────────────────────
const AccItem = ({ title, content, open:initOpen=false, icon:Icon }) => {
  const [open, setOpen] = useState(initOpen);
  return (
    <div style={{ border:`1.5px solid ${open?C.amber+"40":C.g100}`, borderRadius:C.rS, overflow:"hidden", marginBottom:8, transition:`border-color 0.3s`, boxShadow:open?`0 4px 16px ${C.amber}15`:"none" }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", background:open?`linear-gradient(135deg,${C.amberXL},white)`:"white", transition:C.tr }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {Icon && <div style={{ width:28, height:28, borderRadius:8, background:open?C.amberL:C.g100, display:"flex", alignItems:"center", justifyContent:"center", transition:C.bo }}><Icon size={13} color={open?C.amber:C.g400}/></div>}
          <span style={{ fontSize:14, fontWeight:700, color:open?C.amberD:C.g800 }}>{title}</span>
        </div>
        <ChevronDown size={16} color={open?C.amber:C.g400} style={{ transform:open?"rotate(180deg)":"none", transition:`transform 0.4s ${C.spring}`, flexShrink:0 }}/>
      </div>
      {open&&<div style={{ padding:"13px 16px", fontSize:13.5, color:C.g600, borderTop:`1px solid ${C.amberL}`, lineHeight:1.7, animation:"slideDown 0.25s ease" }}>{content}</div>}
    </div>
  );
};

// ─── FILE UPLOAD ──────────────────────────────────────────
const FileUpload = () => {
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const ref = useRef();
  const addFiles = fs=>{
    const newFiles = Array.from(fs).map(f=>({ name:f.name, size:`${(f.size/1024).toFixed(1)} KB`, id:Date.now()+Math.random(), done:false }));
    setFiles(v=>[...v,...newFiles]);
    newFiles.forEach(f=>{
      let p=0; const t=setInterval(()=>{ p+=Math.random()*20+5; if(p>=100){ clearInterval(t); setProgress(pr=>({...pr,[f.id]:100})); setFiles(fs=>fs.map(x=>x.id===f.id?{...x,done:true}:x)); } else setProgress(pr=>({...pr,[f.id]:Math.round(p)})); }, 150);
    });
  };
  return (
    <div style={{ maxWidth:420 }}>
      <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files);}}
        style={{ border:`2px dashed ${drag?C.amber:C.g200}`, borderRadius:C.rL, padding:"28px 24px", textAlign:"center", cursor:"pointer", background:drag?C.amberXL:C.g50, transition:C.tr, transform:drag?"scale(1.02)":"scale(1)", boxShadow:drag?`0 8px 32px ${C.amber}25`:"none" }}>
        <input ref={ref} type="file" multiple style={{ display:"none" }} onChange={e=>addFiles(e.target.files)}/>
        <div className="float-anim" style={{ width:50, height:50, borderRadius:14, background:drag?C.amber:C.amberL, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", transition:C.bo }}>
          <Upload size={22} color={drag?"white":C.amber}/>
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:C.g700, marginBottom:4 }}>Drop files or <span style={{ color:C.amber }}>browse</span></div>
        <div style={{ fontSize:12, color:C.g400 }}>PDF, JPG, PNG — max 10 MB</div>
      </div>
      {files.length>0&&<div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
        {files.map((f,i)=>{
          const p = f.done ? 100 : (progress[f.id]||0);
          return (
            <div key={f.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"white", borderRadius:C.rS, border:`1.5px solid ${f.done?C.greenL:C.g100}`, animation:`bounceIn 0.4s ease ${i*0.08}s both`, transition:"border-color 0.5s" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:f.done?C.greenXL:C.amberL, display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.4s" }}>
                {f.done?<CheckCircle size={16} color={C.green} style={{ animation:"bounceIn 0.4s ease" }}/>:<FileText size={15} color={C.amber}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:C.g700 }}>{f.name}</span>
                  <span style={{ fontSize:11, color:C.g400 }}>{f.size}</span>
                </div>
                <div style={{ height:4, background:C.g100, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${p}%`, background:f.done?`linear-gradient(90deg,${C.green},${C.teal})`:`linear-gradient(90deg,${C.amber},${C.orange})`, borderRadius:99, transition:"width 0.2s ease, background 0.5s" }}/>
                </div>
              </div>
              <X size={13} color={C.g400} style={{ cursor:"pointer", flexShrink:0, transition:C.tr }} onClick={()=>setFiles(v=>v.filter(x=>x.id!==f.id))}/>
            </div>
          );
        })}
      </div>}
    </div>
  );
};

// ─── FORM VALIDATION ──────────────────────────────────────
const ValForm = () => {
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"" });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const validate = ()=>{ const e={};
    if(!form.name.trim()) e.name="Full name is required"; else if(form.name.length<3) e.name="At least 3 characters";
    if(!form.email.trim()) e.email="Email is required"; else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Enter a valid email";
    if(!form.phone.trim()) e.phone="Phone is required"; else if(form.phone.replace(/\D/g,"").length!==10) e.phone="10-digit number";
    if(!form.password) e.password="Password is required"; else if(form.password.length<8) e.password="Min 8 characters";
    return e;
  };
  const strength = !form.password?0:form.password.length>=12&&/[A-Z]/.test(form.password)&&/[0-9]/.test(form.password)&&/[^a-zA-Z0-9]/.test(form.password)?4:form.password.length>=8&&/[A-Z]/.test(form.password)?3:form.password.length>=6?2:1;
  const sCols = ["",C.red,C.orange,C.amber,C.green]; const sLbls = ["","Weak","Fair","Good","Strong"];
  const submit = ()=>{ const e=validate(); setErrors(e); if(!Object.keys(e).length) setDone(true); else { document.getElementById("val-form")?.classList?.add?.("jello-hover"); }};
  if(done) return (
    <div style={{ textAlign:"center", padding:"32px 16px", animation:"bounceIn 0.5s ease" }}>
      <div style={{ width:68, height:68, borderRadius:22, background:C.greenXL, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }} className="heartbeat-anim"><CheckCircle size={34} color={C.green}/></div>
      <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:C.navy, marginBottom:8 }}>All Validated! 🎉</h3>
      <p style={{ fontSize:13.5, color:C.g400, marginBottom:20 }}>Form submitted successfully.</p>
      <Btn variant="primary" onClick={()=>{setDone(false);setForm({name:"",email:"",phone:"",password:""});setErrors({});}}>Reset</Btn>
    </div>
  );
  return (
    <div id="val-form" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, maxWidth:580 }}>
      <Input label="Full Name" placeholder="Dhwani T" icon={User} required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} state={errors.name?"error":form.name.length>2?"success":"default"} helperText={errors.name}/>
      <Input label="Email" placeholder="you@school.com" icon={Mail} type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} state={errors.email?"error":form.email.includes("@")&&form.email.includes(".")?"success":"default"} helperText={errors.email}/>
      <Input label="Phone" placeholder="9090909090" icon={Phone} required value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} state={errors.phone?"error":form.phone.replace(/\D/g,"").length===10?"success":"default"} helperText={errors.phone}/>
      <div>
        <Input label="Password" type="password" placeholder="Min 8 characters" icon={Lock} required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} state={errors.password?"error":form.password.length>=8?"success":"default"} helperText={errors.password}/>
        {form.password&&<div style={{ marginTop:8 }}>
          <div style={{ display:"flex", gap:4, marginBottom:3 }}>{[1,2,3,4].map(i=><div key={i} style={{ flex:1, height:4, borderRadius:2, background:strength>=i?sCols[strength]:C.g100, transition:`background 0.4s ease ${i*0.08}s` }}/>)}</div>
          <span style={{ fontSize:11.5, fontWeight:700, color:sCols[strength] }}>{sLbls[strength]}</span>
        </div>}
      </div>
      <div style={{ gridColumn:"1/-1", display:"flex", gap:10, justifyContent:"flex-end" }}>
        <Btn variant="secondary" onClick={()=>{setForm({name:"",email:"",phone:"",password:""});setErrors({});}}>Clear</Btn>
        <Btn variant="primary" icon={Check} onClick={submit}>Validate & Submit</Btn>
      </div>
    </div>
  );
};

// ─── POPOVER DEMO ─────────────────────────────────────────
const PopoverDemo = () => (
  <div style={{ display:"flex", flexWrap:"wrap", gap:24, alignItems:"flex-start" }}>
    <div>
      <SL>Info Popover</SL>
      <Popover trigger={<Btn variant="soft" icon={Info}>Student Info</Btn>} width={280}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:C.amberL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><User size={20} color={C.amber}/></div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:C.navy, marginBottom:2 }}>Dhwani T</div>
            <Badge label="UKG-B" color="blue" size="sm"/><span style={{ margin:"0 5px" }}/><Badge label="Active" color="green" dot/>
            <div style={{ fontSize:12.5, color:C.g500, marginTop:8, lineHeight:1.6 }}>ADM-UKG-B-1095677 • Joined Aug 2024 • Fee: Paid</div>
          </div>
        </div>
      </Popover>
    </div>
    <div>
      <SL>Quick Actions Popover</SL>
      <Popover trigger={<Btn variant="outline" icon={Settings}>Quick Actions</Btn>}>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {[{icon:Edit2,label:"Edit Profile"},{icon:Mail,label:"Send Message"},{icon:DollarSign,label:"View Fees"},{icon:BookOpen,label:"View Grades"}].map((a,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:9, cursor:"pointer", fontSize:13, color:C.g700, fontWeight:500, transition:C.tr }}
              onMouseEnter={e=>{ e.currentTarget.style.background=C.amberXL; e.currentTarget.style.color=C.amberD; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.g700; }}>
              <a.icon size={14} color={C.amber}/>{a.label}
            </div>
          ))}
        </div>
      </Popover>
    </div>
    <div>
      <SL>Dropdown Menu</SL>
      <DropdownMenu items={[{label:"View Profile",icon:User},{label:"Edit Student",icon:Edit2},{label:"Copy ID",icon:Copy},{label:"Send Email",icon:Send},{divider:true},{label:"Archive",icon:Minus},{label:"Delete",icon:Trash2,danger:true}]}/>
    </div>
  </div>
);

// ─── NAV SECTIONS ─────────────────────────────────────────
const NAV = [
  { id:"bento",      label:"Bento Dashboard",    Icon:LayoutDashboard },
  { id:"charts",     label:"Charts & Data Viz",  Icon:BarChart2 },
  { id:"btns",       label:"Buttons",            Icon:Zap },
  { id:"inputs",     label:"Inputs & Fields",    Icon:Hash },
  { id:"select",     label:"Dropdowns",          Icon:ChevronDown },
  { id:"toggles",    label:"Toggles & Checks",   Icon:ToggleLeft },
  { id:"table",      label:"Data Table",         Icon:Grid },
  { id:"alerts",     label:"Alerts & Badges",    Icon:Bell },
  { id:"toasts",     label:"Toast Notifications",Icon:Sparkles },
  { id:"modals",     label:"Modals",             Icon:Layers },
  { id:"slideover",  label:"Slide-Over Panel",   Icon:PanelRight },
  { id:"popovers",   label:"Popovers & Menus",   Icon:MessageSquare },
  { id:"loaders",    label:"Loaders & Skeletons",Icon:RefreshCw },
  { id:"misc",       label:"Misc Components",    Icon:Settings },
  { id:"validation", label:"Form Validation",    Icon:Shield },
  { id:"wizard",     label:"Step Wizard",        Icon:ChevronRight },
];

// ═══════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [active, setActive] = useState("bento");
  const scrollTo = id=>{ setActive(id); setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}),50); };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"linear-gradient(160deg,#F0EFF8 0%,#FAFAFA 60%,#FFF8F0 100%)", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <GS/>

      {/* ── SIDEBAR ────────────────────────────── */}
      <div style={{ width:224, background:"white", borderRight:`1px solid ${C.g100}`, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0, boxShadow:"3px 0 20px rgba(0,0,0,0.05)", overflowY:"auto" }}>
        <div style={{ padding:"22px 18px 16px", borderBottom:`1px solid ${C.g100}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="float-anim" style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${C.amber},${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <GraduationCap size={20} color="white"/>
            </div>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:C.navy }}>ERP UI Kit v3</div>
              <div style={{ fontSize:10.5, color:C.g400 }}>School Portal Components</div>
            </div>
          </div>
        </div>
        <div style={{ padding:"10px 8px", flex:1 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.g300, letterSpacing:1.2, padding:"8px 6px 6px", textTransform:"uppercase" }}>Sections</div>
          {NAV.map((s,i)=>{
            const isA=active===s.id;
            return (
              <div key={s.id} onClick={()=>scrollTo(s.id)}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:10, cursor:"pointer", marginBottom:2, background:isA?`linear-gradient(135deg,${C.amber},${C.orange})`:"transparent", transition:`all 0.4s ${C.spring}`, transform:isA?"translateX(4px) scale(1.02)":"none", boxShadow:isA?`0 3px 14px ${C.amber}40`:"none", animation:`slideRight 0.3s ease ${i*0.04}s both` }}
                onMouseEnter={e=>{ if(!isA){ e.currentTarget.style.background=C.amberXL; e.currentTarget.style.transform="translateX(5px)"; }}}
                onMouseLeave={e=>{ if(!isA){ e.currentTarget.style.background="transparent"; e.currentTarget.style.transform="none"; }}}>
                <s.Icon size={13} color={isA?"white":C.g400} strokeWidth={2.2}/>
                <span style={{ fontSize:12.5, fontWeight:isA?700:500, color:isA?"white":C.g600 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
        {/* bottom badge */}
        <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.g100}`, background:C.amberXL }}>
          <div style={{ fontSize:11.5, fontWeight:700, color:C.amberD, textAlign:"center" }}>Little Chanakya's Global Preschool</div>
          <div style={{ fontSize:10.5, color:C.g400, textAlign:"center", marginTop:2 }}>Design System 2026</div>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────── */}
      <div style={{ flex:1, padding:"32px 32px 60px", overflowY:"auto" }}>

        {/* Hero */}
        <div style={{ marginBottom:36 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12.5, color:C.g400, marginBottom:16 }}>
            <span style={{ color:C.amber, fontWeight:600 }}>Dashboard</span><ChevronRight size={13}/><span>Components</span><ChevronRight size={13}/><span style={{ color:C.navy, fontWeight:600 }}>UI Kit v3</span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:34, fontWeight:800, color:C.navy, letterSpacing:-1.5, marginBottom:6, lineHeight:1.1 }}>ERP Component<br/>Library <span style={{ background:`linear-gradient(135deg,${C.amber},${C.orange})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>v3</span></h1>
              <p style={{ fontSize:14.5, color:C.g400, maxWidth:540, lineHeight:1.65 }}>Production-ready components for Little Chanakya's School ERP. Charts, Bento layouts, animations, overlays and more.</p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[["55+","Components"],["Charts","6 Types"],["Playful","Animations"],["v3","New!"]].map(([v,l],i)=>(
                <div key={i} className="hover-lift" style={{ background:"white", borderRadius:14, padding:"10px 18px", display:"flex", alignItems:"center", gap:8, boxShadow:C.sh, animation:`bounceIn 0.5s ease ${i*0.1}s both` }}>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:C.amber }}>{v}</span>
                  <span style={{ fontSize:12.5, color:C.g400 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BENTO DASHBOARD ── */}
        <Card id="bento">
          <SHdr icon={LayoutDashboard} title="Bento Dashboard Grid" sub="Live stats, sparklines, charts and activity feed in a masonry-style responsive layout." badge="NEW"/>
          <BentoGrid/>
        </Card>

        {/* ── CHARTS ── */}
        <Card id="charts">
          <SHdr icon={BarChart2} title="Charts & Data Visualization" sub="Bar, Stacked Bar, Line, Area, Pie/Donut, Radial/Gauge — all with animated entrances and interactive tooltips." badge="NEW"/>
          <SL>Bar Charts — Side by Side & Stacked</SL>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
            <div style={{ background:C.g50, borderRadius:20, padding:24 }}><BarChartCard/></div>
            <div style={{ background:C.g50, borderRadius:20, padding:24 }}><StackedBarCard/></div>
          </div>
          <Divider/>
          <SL>Line & Area Charts</SL>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
            <div style={{ background:C.g50, borderRadius:20, padding:24 }}><LineChartCard/></div>
            <div style={{ background:C.g50, borderRadius:20, padding:24 }}><AreaChartCard/></div>
          </div>
          <Divider/>
          <SL>Pie, Donut Gauges & Radial Bars</SL>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
            <div style={{ background:C.g50, borderRadius:20, padding:24 }}><PieChartCard/></div>
            <div style={{ background:C.g50, borderRadius:20, padding:24 }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:C.navy, marginBottom:4 }}>Donut Gauges</div>
              <div style={{ fontSize:12, color:C.g400, marginBottom:20 }}>KPI dials with animated fill</div>
              <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:16 }}>
                <DonutGauge value={94} color={C.green} label="Attendance" sub="Target: 90%"/>
                <DonutGauge value={82} color={C.amber} label="Fee Paid" sub="Target: 95%"/>
                <DonutGauge value={76} color={C.blue} label="Homework" sub="Target: 85%"/>
              </div>
            </div>
            <div style={{ background:C.g50, borderRadius:20, padding:24 }}><RadialChartCard/></div>
          </div>
        </Card>

        {/* ── BUTTONS ── */}
        <Card id="btns">
          <SHdr icon={Zap} title="Buttons" sub="8 variants with ripple effects on click, spring hover lifts, and animated icon entrances."/>
          <SL>Variants</SL>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:20 }}>
            {["primary","secondary","ghost","danger","success","navy","outline","soft"].map((v,i)=>(
              <Btn key={v} variant={v} style={{ animation:`bounceIn 0.4s ease ${i*0.06}s both` }}>{v.charAt(0).toUpperCase()+v.slice(1)}</Btn>
            ))}
          </div>
          <Divider/>
          <SL>Sizes & States</SL>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
            <Btn variant="primary" size="sm" icon={Plus}>Small</Btn>
            <Btn variant="primary" size="md" icon={Plus}>Medium</Btn>
            <Btn variant="primary" size="lg" icon={Plus}>Large</Btn>
            <Btn variant="primary" loading>Saving...</Btn>
            <Btn variant="secondary" disabled>Disabled</Btn>
            <Btn variant="primary" icon={Download} iconPos="right">Export CSV</Btn>
          </div>
        </Card>

        {/* ── INPUTS ── */}
        <Card id="inputs">
          <SHdr icon={Hash} title="Input Fields" sub="Focus lifts, icon rotates on focus, state-specific glow rings, animated validation icons."/>
          <SL>Standard & Validation States</SL>
          <div style={{ display:"flex", flexWrap:"wrap", gap:20, marginBottom:20 }}>
            <Input label="Student Name" placeholder="Dhwani T" icon={User} required helperText="Enter full legal name"/>
            <Input label="Email" placeholder="parent@school.com" icon={Mail} type="email" helperText="Parent contact"/>
            <Input label="Success State" state="success" icon={User} value="Dhwani T" helperText="Name available!"/>
            <Input label="Error State" state="error" icon={Mail} value="invalid@" helperText="Invalid email"/>
            <Input label="Warning" state="warning" icon={DollarSign} prefix="₹" helperText="Exceeds limit"/>
            <Input label="Password" type="password" placeholder="Min 8 chars" icon={Lock} required helperText="Use uppercase+number"/>
          </div>
        </Card>

        {/* ── SELECT ── */}
        <Card id="select">
          <SHdr icon={ChevronDown} title="Dropdowns & Select" sub="Animated option stagger on open, chevron spring rotation, hover glow."/>
          <div style={{ display:"flex", flexWrap:"wrap", gap:24 }}>
            <Select label="Select Class" options={[{value:"nursery",label:"Nursery"},{value:"lkg",label:"LKG"},{value:"ukg-a",label:"UKG-A"},{value:"ukg-b",label:"UKG-B"},{value:"g1a",label:"Grade 1-A"}]} required placeholder="Choose a class" helperText="Required for enrollment"/>
            <Select label="Fee Status" options={[{value:"paid",label:"Paid"},{value:"pending",label:"Pending"},{value:"partial",label:"Partial"}]} placeholder="All statuses" helperText="Filter by payment"/>
            <Select label="Subjects (Multi)" multi options={[{value:"math",label:"Mathematics"},{value:"sci",label:"Science"},{value:"eng",label:"English"},{value:"hin",label:"Hindi"},{value:"ss",label:"Social Studies"}]} placeholder="Choose subjects" helperText="Select multiple"/>
          </div>
        </Card>

        {/* ── TOGGLES ── */}
        <Card id="toggles">
          <SHdr icon={ToggleLeft} title="Toggles, Checkboxes & Radios" sub="Spring-physics thumb slide, scale bounce on check, strikethrough on checkbox complete."/>
          <div style={{ display:"flex", flexWrap:"wrap", gap:36 }}>
            <div style={{ flex:1, minWidth:240 }}>
              <SL>Toggles</SL>
              <div style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:280 }}>
                <Toggle label="Email Notifications" sub="Fee & event emails" colorOn={C.amber}/>
                <Toggle label="SMS Alerts" sub="Attendance SMS" colorOn={C.green} defaultOn/>
                <Toggle label="Dark Mode" colorOn={C.navy}/>
                <Toggle label="Auto Attendance" colorOn={C.purple}/>
                <Toggle label="Disabled" disabled/>
              </div>
            </div>
            <div style={{ flex:1, minWidth:220 }}>
              <SL>Checkboxes</SL>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Checkbox label="Active Student" sub="Currently enrolled"/>
                <Checkbox label="Fee Paid" checked={true} color={C.green}/>
                <Checkbox label="Attendance Regular" color={C.blue}/>
                <Checkbox label="Indeterminate" indeterminate color={C.orange}/>
                <Checkbox label="Disabled" disabled/>
              </div>
            </div>
          </div>
        </Card>

        {/* ── TABLE ── */}
        <Card id="table">
          <SHdr icon={Grid} title="Data Table" sub="Row slide-in stagger, animated checkbox scale, rubber-band avatar hover, dropdown menu with animations."/>
          <DataTable/>
        </Card>

        {/* ── ALERTS ── */}
        <Card id="alerts">
          <SHdr icon={Bell} title="Alerts & Badges" sub="Slide-up entrance, animated dismiss exit, pulse dot option on badges."/>
          <SL>Alert Types</SL>
          <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:560, marginBottom:24 }}>
            <Alert type="success" title="Student Enrolled" message="Dhwani T added to UKG-B with ADM-UKG-B-1095677." dismissible/>
            <Alert type="error" title="Failed to Save" message="Connection error. Please try again. Error code: 500." dismissible/>
            <Alert type="warning" title="Fee Overdue" message="3 students have pending payments for March 2026." dismissible/>
            <Alert type="info" title="Timetable Updated" message="UKG-B timetable has been refreshed for next week." dismissible/>
          </div>
          <Divider/>
          <SL>Badges — all variants + pulse option</SL>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
            <Badge label="Active" color="green" dot pulse/>
            <Badge label="Pending" color="amber" dot/>
            <Badge label="Inactive" color="red" dot/>
            <Badge label="UKG-B" color="blue"/>
            <Badge label="Grade 1" color="purple"/>
            <Badge label="Premium" color="pink" icon={Star}/>
            <Badge label="New Admission" color="navy" icon={Sparkles}/>
            <Badge label="Fee Paid" color="teal" icon={CheckCircle}/>
            <Badge label="Remove me" color="amber" removable size="lg"/>
            <Badge label="Large Active" color="green" dot pulse size="lg"/>
          </div>
        </Card>

        {/* ── TOASTS ── */}
        <Card id="toasts">
          <SHdr icon={Sparkles} title="Toast Notifications" sub="Bounce-in entrance, pulsing icon, stacked positioning."/>
          <ToastDemo/>
        </Card>

        {/* ── MODALS ── */}
        <Card id="modals">
          <SHdr icon={Layers} title="Modals & Dialogs" sub="Scale-in backdrop blur, heartbeat warning icon on destructive action."/>
          <ModalDemo/>
        </Card>

        {/* ── SLIDE-OVER ── */}
        <Card id="slideover">
          <SHdr icon={PanelRight} title="Slide-Over Panel" sub="Slides in from the right edge. Perfect for edit forms without losing page context." badge="NEW"/>
          <p style={{ fontSize:13.5, color:C.g500, marginBottom:20, lineHeight:1.65 }}>Slide-overs are ideal for complex forms or detailed views — the background page stays visible, keeping context clear.</p>
          <SlideOver/>
        </Card>

        {/* ── POPOVERS ── */}
        <Card id="popovers">
          <SHdr icon={MessageSquare} title="Popovers & Dropdown Menus" sub="Context-aware floating panels with animated arrow, plus ellipsis dropdown menus." badge="NEW"/>
          <PopoverDemo/>
        </Card>

        {/* ── LOADERS ── */}
        <Card id="loaders">
          <SHdr icon={RefreshCw} title="Loaders & Skeletons" sub="Loading bar, dashboard skeleton, spinner variants, and progress-aware file upload." badge="NEW"/>
          <SL>Loading Bar (top-of-page style)</SL>
          <div style={{ maxWidth:500, marginBottom:28 }}>
            <LoadingBar/>
            <div style={{ marginTop:10, display:"flex", justifyContent:"flex-end" }}><Btn variant="outline" size="sm" icon={RefreshCw} onClick={()=>{ const el=document.querySelector("#loaders"); el?.scrollIntoView({behavior:"smooth"}); }}>Replay</Btn></div>
          </div>
          <Divider/>
          <SL>Dashboard Skeleton Loader</SL>
          <DashboardLoader/>
          <Divider/>
          <SL>Skeleton Variants</SL>
          <div style={{ display:"flex", flexWrap:"wrap", gap:20, marginBottom:20 }}>
            <SkeletonCard/>
            <SkeletonCard/>
            <SkeletonCard/>
          </div>
          <Divider/>
          <SL>Spinner Variants</SL>
          <div style={{ display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
            {[[16,2],[24,2.5],[36,3.5],[48,4]].map(([s,b],i)=>(
              <div key={i} style={{ width:s, height:s, border:`${b}px solid ${C.amberL}`, borderTop:`${b}px solid ${C.amber}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
            ))}
            {/* dual ring */}
            <div style={{ width:36, height:36, position:"relative" }}>
              <div style={{ position:"absolute", inset:0, border:"3px solid transparent", borderTopColor:C.amber, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
              <div style={{ position:"absolute", inset:5, border:"2px solid transparent", borderTopColor:C.orange, borderRadius:"50%", animation:"spinReverse 0.6s linear infinite" }}/>
            </div>
            {/* dot pulse */}
            <div style={{ display:"flex", gap:5 }}>
              {[0,1,2].map(i=><div key={i} style={{ width:10, height:10, borderRadius:"50%", background:C.amber, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
            </div>
            {/* orbit */}
            <div style={{ width:40, height:40, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:`linear-gradient(135deg,${C.amber},${C.orange})`, animation:"orbitPulse 1.5s ease-in-out infinite" }}/>
              <div style={{ position:"absolute", inset:0, border:`2px dashed ${C.amber}40`, borderRadius:"50%", animation:"spin 4s linear infinite" }}/>
            </div>
            {/* bar bounce */}
            <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:28 }}>
              {[0.4,0.7,1.0,0.7,0.4].map((h,i)=>(
                <div key={i} style={{ width:5, height:28*h, borderRadius:3, background:`linear-gradient(180deg,${C.amber},${C.orange})`, animation:`pulse 1s ease-in-out ${i*0.15}s infinite` }}/>
              ))}
            </div>
          </div>
        </Card>

        {/* ── MISC ── */}
        <Card id="misc">
          <SHdr icon={Settings} title="Misc Components" sub="Tabs, accordion with icons, file upload with upload progress, rating stars, avatars, progress bars."/>
          <SL>Tabs</SL>
          <Tabs variant="pill" tabs={[{label:"Overview",content:"342 students across 18 classes this year."},{label:"Attendance",content:"94% average attendance this week."},{label:"Fees",content:"₹10.2L collected, ₹0.3L pending."},{label:"Reports",content:"12 reports generated this term."}]}/>
          <Divider/>
          <SL>Accordion with Icons</SL>
          <div style={{ maxWidth:560 }}>
            <AccItem title="Admission Requirements" content="Birth certificate, vaccination card, previous school TC, and 2 passport-size photos." open icon={FileText}/>
            <AccItem title="Fee Structure" content="Fees are based on class and transport route. Annual fees include tuition, activity, and development charges." icon={DollarSign}/>
            <AccItem title="Attendance Tracking" content="Attendance is marked daily by class teachers and visible in the Attendance module with detailed reports." icon={CheckCircle}/>
          </div>
          <Divider/>
          <SL>File Upload with Progress</SL>
          <FileUpload/>
          <Divider/>
          <SL>Progress Bars</SL>
          <div style={{ maxWidth:500, display:"flex", flexDirection:"column", gap:16 }}>
            <ProgressBar value={94} color={C.green} label="Attendance Rate" animated/>
            <ProgressBar value={78} color={C.amber} label="Fee Collection" animated striped/>
            <ProgressBar value={62} color={C.blue} label="Homework Done" animated/>
            <ProgressBar value={45} color={C.red} label="Overdue Tasks"/>
          </div>
          <Divider/>
          <SL>Star Rating</SL>
          {(() => {
            const [rating, setRating] = useState(0);
            const [hover, setHover] = useState(0);
            return (
              <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                {[1,2,3,4,5].map(i=>(
                  <Star key={i} size={28} fill={(hover||rating)>=i?C.amber:"none"} color={(hover||rating)>=i?C.amber:C.g300} strokeWidth={1.5}
                    style={{ cursor:"pointer", transition:`all 0.3s ${C.spring}`, transform:(hover||rating)>=i?"scale(1.25) rotate(-5deg)":"scale(1)" }}
                    onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(i)}/>
                ))}
                {rating>0&&<span style={{ fontSize:13, fontWeight:700, color:C.amber, marginLeft:6, animation:"bounceIn 0.3s ease" }}>{rating}/5</span>}
              </div>
            );
          })()}
          <Divider/>
          <SL>Avatar Groups</SL>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {[32,42,52].map((sz,si)=>(
              <div key={si} style={{ display:"flex" }}>
                {[{n:"DT",c:C.amber},{n:"AR",c:C.green},{n:"RS",c:C.purple},{n:"MN",c:C.pink}].map((a,i)=>(
                  <div key={i} className="rubber-hover" style={{ width:sz, height:sz, borderRadius:"50%", background:`${a.c}20`, border:"2.5px solid white", marginLeft:i?-sz*0.32:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*0.28, fontWeight:800, color:a.c, boxShadow:"0 2px 8px rgba(0,0,0,0.1)", cursor:"pointer", transition:C.bo, zIndex:4-i }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-5px) scale(1.12)"; e.currentTarget.style.zIndex="10"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.zIndex=String(4-i); }}>
                    {a.n}
                  </div>
                ))}
                <div style={{ width:sz, height:sz, borderRadius:"50%", background:C.g100, border:"2.5px solid white", marginLeft:-sz*0.32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*0.27, fontWeight:800, color:C.g500 }}>+3</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── VALIDATION ── */}
        <Card id="validation">
          <SHdr icon={Shield} title="Form Validation" sub="Real-time field glow, staggered password strength bars, jello shake on invalid submit, bounced success."/>
          <ValForm/>
        </Card>

        {/* ── WIZARD ── */}
        <Card id="wizard">
          <SHdr icon={ChevronRight} title="Step Wizard" sub="Active step pulses with halo glow, connector fills on completion, animated content swap."/>
          <StepWizard steps={[{label:"Personal",content:"Enter student name, DOB, gender and parent information."},{label:"Class",content:"Select class, section, and academic year for enrollment."},{label:"Fees",content:"Choose fee plan: monthly, quarterly, or annual with discounts."},{label:"Documents",content:"Upload birth certificate, photos, TC from previous school."},{label:"Confirm",content:"Review all information and confirm to complete enrollment."}]}/>
        </Card>

      </div>
    </div>
  );
}
