
"use client";
import React from 'react';

export function StaffBottomNav() {
  return (
    <div style={{zIndex: 50, position: 'relative'}} dangerouslySetInnerHTML={{ __html: `ml lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>EduSphere Staff App ✦ Light</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;600;700;800;900&family=Cabinet+Grotesk:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* ─────────────────────────────────────
   DESIGN SYSTEM
───────────────────────────────────── */
:root{
  /* Surfaces */
  --bg:#F2F0EB;
  --white:#FFFFFF;
  --card:#FFFFFF;
  --mist:#F8F7F3;
  --line:rgba(20,14,40,.07);

  /* Ink */
  --ink:#140E28;
  --ink2:#3D3553;
  --ink3:#7B7291;
  --ink4:#B5B0C4;

  /* Teacher — Tangerine + Hot Pink */
  --t-a:#FF5733;--t-b:#FF006E;--t-c:#FFBE0B;
  --t-soft:#FFF1EE;--t-mid:#FFDDD6;
  --t-grad:linear-gradient(135deg,#FF5733 0%,#FF006E 60%,#C77DFF 100%);

  /* Driver — Electric Blue + Mint */
  --d-a:#006BFF;--d-b:#00D4AA;--d-c:#4DFFEF;
  --d-soft:#EAF3FF;--d-mid:#C5E0FF;
  --d-grad:linear-gradient(135deg,#FF5733 0%,#FF006E 60%,#C77DFF 100%);

  /* Admin — Amber + Emerald */
  --a-a:#FF9500;--a-b:#2ECC71;--a-c:#FFD700;
  --a-soft:#FFF5E6;--a-mid:#FFE0B2;
  --a-grad:linear-gradient(135deg,#FF5733 0%,#FF006E 60%,#C77DFF 100%);

  /* Account Manager — Indigo + Violet */
  --ac-a:#4F46E5;--ac-b:#7C3AED;--ac-c:#06B6D4;
  --ac-soft:#EEF2FF;--ac-mid:#C7D2FE;
  --ac-grad:linear-gradient(135deg,#FF5733 0%,#FF006E 60%,#C77DFF 100%);

  /* HR Manager — Teal + Emerald */
  --hr-a:#0D9488;--hr-b:#059669;--hr-c:#F59E0B;
  --hr-soft:#F0FDFA;--hr-mid:#99F6E4;
  --hr-grad:linear-gradient(135deg,#FF5733 0%,#FF006E 60%,#C77DFF 100%);

  /* Security Officer — Deep Navy + Crimson */
  --sc-a:#1E3A5F;--sc-b:#DC2626;--sc-c:#F59E0B;
  --sc-soft:#EFF3FA;--sc-mid:#C7D8F0;
  --sc-grad:linear-gradient(135deg,#FF5733 0%,#FF006E 60%,#C77DFF 100%);

  /* Transport Manager — Forest Green + Amber */
  --tm-a:#047857;--tm-b:#D97706;--tm-c:#10B981;
  --tm-soft:#ECFDF5;--tm-mid:#A7F3D0;
  --tm-grad:linear-gradient(135deg,#FF5733 0%,#FF006E 60%,#C77DFF 100%);

  /* Radii */
  --r3:28px;--r2:20px;--r1:14px;--r0:10px;

  /* Shadows */
  --s1:0 2px 8px rgba(20,14,40,.06),0 1px 3px rgba(20,14,40,.04);
  --s2:0 8px 28px rgba(20,14,40,.1),0 2px 8px rgba(20,14,40,.05);
  --s3:0 20px 60px rgba(20,14,40,.14),0 6px 20px rgba(20,14,40,.07);
  --s4:0 40px 100px rgba(20,14,40,.2);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Satoshi',sans-serif;overflow:hidden}

/* ── ANIMATED CANVAS BG ── */
body{
  background:var(--bg);
  background-image:
    radial-gradient(ellipse 70% 60% at 5% 10%,rgba(255,87,51,.1),transparent 60%),
    radial-gradient(ellipse 50% 40% at 95% 90%,rgba(0,107,255,.1),transparent 60%),
    radial-gradient(ellipse 60% 50% at 50% 50%,rgba(255,149,0,.07),transparent 60%);
}

/* Dot grid */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(20,14,40,.08) 1px,transparent 1px);
  background-size:28px 28px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%);
  z-index:0;
}

/* Floating geometric shapes */
.geo{position:fixed;pointer-events:none;z-index:0;border-radius:30% 70% 70% 30%/30% 30% 70% 70%}
.g1{width:360px;height:360px;background:linear-gradient(135deg,rgba(255,87,51,.12),rgba(255,0,110,.08));top:-80px;left:-80px;animation:morphFloat1 18s ease-in-out infinite}
.g2{width:280px;height:280px;background:linear-gradient(135deg,rgba(0,107,255,.1),rgba(0,212,170,.07));bottom:-60px;right:-60px;animation:morphFloat2 22s ease-in-out infinite}
.g3{width:180px;height:180px;background:linear-gradient(135deg,rgba(255,149,0,.1),rgba(255,215,0,.07));top:35%;left:25%;animation:morphFloat3 15s ease-in-out infinite;border-radius:50%}
@keyframes morphFloat1{
  0%,100%{transform:translate(0,0) rotate(0deg);border-radius:30% 70% 70% 30%/30% 30% 70% 70%}
  33%{transform:translate(20px,-30px) rotate(120deg);border-radius:70% 30% 30% 70%/70% 70% 30% 30%}
  66%{transform:translate(-20px,20px) rotate(240deg);border-radius:50% 50% 30% 70%/50% 70% 30% 50%}
}
@keyframes morphFloat2{
  0%,100%{transform:translate(0,0) rotate(0deg)}
  50%{transform:translate(-25px,20px) rotate(180deg);border-radius:70% 30% 50% 50%/50% 50% 70% 30%}
}
@keyframes morphFloat3{
  0%,100%{transform:translate(0,0) scale(1)}
  50%{transform:translate(15px,-25px) scale(1.1)}
}

/* ── SHELL ── */
.shell{
  position:relative;z-index:1;
  display:flex;align-items:center;justify-content:center;
  min-height:100vh;padding:28px;gap:36px;flex-wrap:wrap;
}

/* ── SIDE PANEL ── */
.side{
  width:230px;flex-shrink:0;
  display:flex;flex-direction:column;gap:16px;
}

.side-logo{
  background:var(--white);border-radius:var(--r2);
  padding:18px;box-shadow:var(--s2);
  display:flex;align-items:center;gap:12px;
  border:1.5px solid var(--line);
  position:relative;overflow:hidden;
}
.side-logo::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,87,51,.04),rgba(0,107,255,.04));
  pointer-events:none;
}
.logo-mark{
  width:44px;height:44px;border-radius:15px;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;flex-shrink:0;
  position:relative;
}
.logo-mark::after{
  content:'';position:absolute;inset:-2px;border-radius:17px;
  background:var(--t-grad);z-index:-1;
  animation:logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse{0%,100%{opacity:.5;filter:blur(4px)}50%{opacity:.9;filter:blur(6px)}}
.logo-name{font-family:'Clash Display',sans-serif;font-size:17px;font-weight:700;color:var(--ink);letter-spacing:-.3px}
.logo-tag{font-size:9.5px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.7px}

/* Role cards */
.role-card{
  background:var(--white);border-radius:var(--r2);
  padding:16px;box-shadow:var(--s2);
  border:2px solid var(--line);
  transition:all .4s cubic-bezier(.34,1.56,.64,1);
  overflow:hidden;position:relative;cursor:pointer;
}
.role-card::after{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  opacity:0;transition:opacity .3s;
}
.role-card.t-card::after{background:var(--t-grad)}
.role-card.d-card::after{background:var(--d-grad)}
.role-card.a-card::after{background:var(--a-grad)}
.role-card.active{border-color:transparent;transform:translateX(5px)}
.role-card.active.t-card{border-color:rgba(255,87,51,.25);background:var(--t-soft)}
.role-card.active.d-card{border-color:rgba(0,107,255,.2);background:var(--d-soft)}
.role-card.active.a-card{border-color:rgba(255,149,0,.25);background:var(--a-soft)}
.role-card.ac-card::after{background:var(--ac-grad)}
.role-card.active.ac-card{border-color:rgba(79,70,229,.25);background:var(--ac-soft)}
.role-card.hr-card::after{background:var(--hr-grad)}
.role-card.active.hr-card{border-color:rgba(13,148,136,.25);background:var(--hr-soft)}
.role-card.sc-card::after{background:var(--sc-grad)}
.role-card.active.sc-card{border-color:rgba(30,58,95,.25);background:var(--sc-soft)}
.role-card.active::after{opacity:1}
.role-card:hover:not(.active){transform:translateX(3px);box-shadow:var(--s3)}

.rc-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.rc-ico{width:40px;height:40px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.role-card:hover .rc-ico,.role-card.active .rc-ico{transform:scale(1.15) rotate(-6deg)}
.rc-name{font-family:'Cabinet Grotesk',sans-serif;font-size:14px;font-weight:800;color:var(--ink)}
.rc-sub{font-size:10.5px;color:var(--ink3);font-weight:500}
.rc-indicator{
  width:10px;height:10px;border-radius:50%;margin-left:auto;flex-shrink:0;
  background:var(--line);transition:all .35s cubic-bezier(.34,1.56,.64,1);
}
.role-card.active.t-card .rc-indicator{background:var(--t-a);box-shadow:0 0 0 4px rgba(255,87,51,.2),0 0 12px rgba(255,87,51,.4)}
.role-card.active.d-card .rc-indicator{background:var(--d-a);box-shadow:0 0 0 4px rgba(0,107,255,.2),0 0 12px rgba(0,107,255,.4)}
.role-card.active.a-card .rc-indicator{background:var(--a-a);box-shadow:0 0 0 4px rgba(255,149,0,.2),0 0 12px rgba(255,149,0,.4)}
.role-card.active.ac-card .rc-indicator{background:var(--ac-a);box-shadow:0 0 0 4px rgba(79,70,229,.2),0 0 12px rgba(79,70,229,.4)}
.role-card.active.hr-card .rc-indicator{background:var(--hr-a);box-shadow:0 0 0 4px rgba(13,148,136,.2),0 0 12px rgba(13,148,136,.4)}
.role-card.active.sc-card .rc-indicator{background:var(--sc-a);box-shadow:0 0 0 4px rgba(30,58,95,.2),0 0 12px rgba(37,99,235,.4)}

/* Perms box */
.perms-box{
  background:var(--white);border-radius:var(--r2);
  padding:16px;box-shadow:var(--s1);
  border:1.5px solid var(--line);
}
.pb-title{font-size:9.5px;font-weight:800;color:var(--ink4);text-transform:uppercase;letter-spacing:.9px;margin-bottom:10px}
.perm{display:flex;align-items:center;gap:7px;padding:4px 0;font-size:11px;font-weight:600;color:var(--ink2);animation:permIn .4s cubic-bezier(.34,1.56,.64,1) both}
@keyframes permIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.pcheck{width:18px;height:18px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0}

/* ── PHONE FRAME ── */
.phone-outer{position:relative;flex-shrink:0}

/* Decorative halos */
.halo{
  position:absolute;border-radius:50%;pointer-events:none;
  animation:haloBreath 5s ease-in-out infinite;
}
.h1{width:500px;height:500px;top:50%;left:50%;transform:translate(-50%,-50%);
  background:conic-gradient(from 0deg,rgba(255,87,51,.08),rgba(255,0,110,.06),rgba(199,125,255,.08),rgba(255,87,51,.08));
  animation-duration:6s}
.h2{width:600px;height:600px;top:50%;left:50%;transform:translate(-50%,-50%);
  background:conic-gradient(from 90deg,rgba(0,107,255,.06),rgba(0,212,170,.05),rgba(0,107,255,.06));
  animation-duration:9s;animation-delay:1s}
@keyframes haloBreath{
  0%,100%{transform:translate(-50%,-50%) scale(1) rotate(0deg)}
  50%{transform:translate(-50%,-50%) scale(1.04) rotate(6deg)}
}

/* The phone */
.phone{
  width:393px;height:852px;position:relative;z-index:2;
  background:#FAFBFE;
  border-radius:55px;
  border:9px solid #FFFFFF;
  outline:1.5px solid rgba(20,14,40,.08);
  box-shadow:
    var(--s4),
    0 0 0 1px rgba(255,255,255,.8) inset,
    0 80px 160px rgba(20,14,40,.25);
  display:flex;flex-direction:column;
  overflow:hidden;
}

/* Dynamic island */
.island{
  position:absolute;top:10px;left:50%;transform:translateX(-50%);
  width:120px;height:34px;
  background:#0E0E1A;border-radius:20px;z-index:100;
  display:flex;align-items:center;justify-content:center;gap:10px;
  box-shadow:0 2px 12px rgba(14,14,26,.3);
  transition:all .4s cubic-bezier(.34,1.56,.64,1);
}
.island:hover{width:200px}
.island-dot{width:9px;height:9px;background:#1C1C2E;border-radius:50%;border:1px solid rgba(255,255,255,.1)}
.island-cam{width:11px;height:11px;background:radial-gradient(circle at 35% 35%,#3a3a5c,#1a1a2e);border-radius:50%;box-shadow:0 0 0 1.5px rgba(255,255,255,.06)}

/* Status bar */
.status{
  height:52px;padding:16px 24px 0;
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
}
.s-time{font-family:'DM Mono',monospace;font-size:14px;font-weight:500;color:var(--ink);letter-spacing:.5px}
.s-icons{display:flex;align-items:center;gap:6px}
.s-sig{display:flex;gap:1.5px;align-items:flex-end}
.s-bar{background:var(--ink);border-radius:1.5px}
.s-batt{width:24px;height:12px;border:1.5px solid var(--ink);border-radius:4px;position:relative;display:flex;align-items:center;padding:1.5px}
.s-batt::after{content:'';position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:2.5px;height:6px;background:var(--ink);border-radius:0 2px 2px 0}
.s-batt-f{height:100%;width:72%;border-radius:2px;background:var(--ink)}

/* Screen */
.screen{flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;position:relative;background:#FAFBFE}
.screen::-webkit-scrollbar{display:none}



/* ══════════════════════════════════════════════════════════════
   COMPREHENSIVE FOOTER NAV  v6
   ─ 5-tab persistent bar
   ─ Center FAB "All" button
   ─ Full-screen sectioned menu overlay
   ─ Search, recent activity, role profile header
   ─ Notification badges, status dots
══════════════════════════════════════════════════════════════ */

/* ── Bar shell ─────────────────────────────────────────────── */
.bnav{
  height:72px;padding:0 4px 10px;
  display:flex;flex-shrink:0;position:relative;z-index:50;
  background:rgba(252,252,254,.97);
  backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);
  border-top:1px solid rgba(0,0,0,.055);
  box-shadow:0 -4px 24px rgba(0,0,0,.06);
}
.bnav-row{display:flex;width:100%;align-items:flex-end;justify-content:space-around}

/* gradient accent line at top of bar */
.bnav::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,
    transparent 0%,
    var(--role-a) 25%,var(--role-b,var(--role-a)) 75%,
    transparent 100%);
  opacity:.4;transition:opacity .4s;
}

/* ── Standard tab button ─────────────────────────────────── */
.nb{
  display:flex;flex-direction:column;align-items:center;
  flex:1;padding:8px 2px 0;border:none;background:none;cursor:pointer;
  position:relative;transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}
.nb:hover{transform:translateY(-2px)}
.nb.sel{transform:translateY(-3px)}

/* Icon container */
.nb-i{
  width:34px;height:34px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 3px;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  position:relative;
}
.nb.sel .nb-i{
  background:linear-gradient(145deg,rgba(255,255,255,.55),rgba(255,255,255,.15));
  box-shadow:0 2px 10px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.6);
}
.nb-i .ic svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1),filter .25s}
.nb.sel .nb-i .ic svg{transform:scale(1.15);filter:drop-shadow(0 2px 4px rgba(0,0,0,.15))}
.nb:hover .nb-i .ic svg{transform:scale(1.08)}

/* Tab label */
.nb-t{
  font-size:9px;font-weight:800;letter-spacing:.4px;
  text-transform:uppercase;white-space:nowrap;
  color:var(--ink4);transition:color .25s;
}
.nb.sel .nb-t{color:var(--role-a)}

/* Active indicator pill */
.nb-dot{
  width:16px;height:3px;border-radius:100px;
  background:var(--role-a);
  position:absolute;bottom:-6px;left:50%;transform:translateX(-50%) scaleX(0);
  transition:transform .35s cubic-bezier(.34,1.56,.64,1);
}
.nb.sel .nb-dot{transform:translateX(-50%) scaleX(1)}

/* Notification badge */
.nb-badge{
  position:absolute;top:-1px;right:-2px;
  min-width:16px;height:16px;padding:0 4px;
  border-radius:100px;
  background:linear-gradient(135deg,#FF5050,#FF2070);
  border:2px solid rgba(252,252,254,.95);
  font-size:8px;font-weight:900;color:#fff;
  display:flex;align-items:center;justify-content:center;
  animation:badgePop .4s cubic-bezier(.34,1.56,.64,1) both;
  box-shadow:0 2px 6px rgba(255,50,100,.35);
}
@keyframes badgePop{from{transform:scale(0) rotate(-15deg)}to{transform:scale(1) rotate(0)}}

/* ── Center FAB "All" button ──────────────────────────────── */
.nb-all{
  display:flex;flex-direction:column;align-items:center;
  flex:0 0 56px;border:none;background:none;cursor:pointer;
  position:relative;padding-bottom:0;margin-bottom:0;
  transform:translateY(-6px);/* lift above bar */
}
.nb-all-fab{
  width:48px;height:48px;border-radius:18px;
  display:flex;align-items:center;justify-content:center;
  background:var(--role-grad);
  box-shadow:0 6px 20px var(--role-shadow,rgba(0,0,0,.2)),
             0 2px 6px rgba(0,0,0,.1),
             inset 0 1px 0 rgba(255,255,255,.25);
  transition:all .4s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
}
.nb-all-fab::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(145deg,rgba(255,255,255,.25),transparent 60%);
  border-radius:18px;pointer-events:none;
}
.nb-all-fab:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 10px 28px var(--role-shadow,rgba(0,0,0,.25))}
.nb-all.open .nb-all-fab{
  transform:rotate(45deg);border-radius:50%;
  box-shadow:0 4px 16px rgba(0,0,0,.2);
}
.nb-all-ico{
  display:flex;flex-direction:column;gap:3.5px;align-items:center;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
}
.nb-all.open .nb-all-ico{opacity:0;transform:scale(0)}
.nb-all-close{
  position:absolute;opacity:0;transform:scale(0) rotate(-45deg);
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  color:#fff;font-size:22px;font-weight:300;line-height:1;
}
.nb-all.open .nb-all-close{opacity:1;transform:scale(1) rotate(0)}
.nb-all-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.9)}
.nb-all-dot:nth-child(2){opacity:.7}
.nb-all-dot:nth-child(3){opacity:.4}
.nb-all-t{
  font-size:8.5px;font-weight:800;letter-spacing:.5px;
  text-transform:uppercase;color:var(--ink4);margin-top:3px;
  transition:color .25s;
}
.nb-all.open .nb-all-t{color:var(--role-a)}

/* ══════════════════════════════════════════════════════════════
   FULL-SCREEN ALL-MENU OVERLAY
══════════════════════════════════════════════════════════════ */

/* Backdrop */
.allnav-backdrop{
  /* Positioned to overlay .phone from inside */
  position:absolute;
  top:0;left:0;
  width:100%;height:100%;
  border-radius:47px;/* match inner phone radius */
  background:linear-gradient(180deg,rgba(0,0,0,.48) 0%,rgba(0,0,0,.62) 100%);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  z-index:100;opacity:0;pointer-events:none;
  transition:opacity .4s;
}
.allnav-backdrop.open{opacity:1;pointer-events:all}

/* Panel */
.allnav-panel{
  position:absolute;
  left:0;right:0;
  transform:translateY(110%);
  bottom:82px;/* bnav height */
  max-height:calc(100% - 82px - 52px);/* phone - bnav - statusbar */
  background:rgba(250,250,253,.99);
  border-radius:26px 26px 0 0;
  border:1px solid rgba(255,255,255,.8);
  border-bottom:none;
  box-shadow:0 -8px 40px rgba(0,0,0,.14);
  z-index:101;
  display:flex;flex-direction:column;
  transition:transform .5s cubic-bezier(.32,1.2,.5,1);
  overflow:hidden;
}
.allnav-panel.open{transform:translateY(0)}

/* Drag handle */
.allnav-handle{
  width:40px;height:4px;border-radius:100px;
  background:rgba(0,0,0,.1);
  margin:10px auto 0;flex-shrink:0;
}

/* ── Profile header ──────────────────────────────────────── */
.allnav-profile{
  display:flex;align-items:center;gap:12px;
  padding:12px 18px 10px;flex-shrink:0;
}
.anp-ava{
  width:44px;height:44px;border-radius:15px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Clash Display',sans-serif;font-size:16px;font-weight:700;color:#fff;
  flex-shrink:0;
  box-shadow:0 4px 16px rgba(0,0,0,.18);
  position:relative;
}
.anp-ava::after{
  content:'';position:absolute;inset:0;border-radius:15px;
  background:linear-gradient(145deg,rgba(255,255,255,.3),transparent);
}
.anp-meta{flex:1}
.anp-name{font-size:15px;font-weight:800;color:var(--ink);letter-spacing:-.3px;font-family:'Clash Display',sans-serif}
.anp-role{font-size:10.5px;font-weight:600;color:var(--ink3);margin-top:1px}
.anp-status{
  display:flex;align-items:center;gap:5px;
  padding:5px 11px;border-radius:100px;
  background:rgba(34,197,94,.08);
  border:1.5px solid rgba(34,197,94,.18);
}
.anp-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:lp 1.2s infinite}
.anp-stxt{font-size:10px;font-weight:800;color:#16a34a}

/* ── Search bar ──────────────────────────────────────────── */
.allnav-search{
  padding:0 18px 10px;flex-shrink:0;
}
.ans-bar{
  display:flex;align-items:center;gap:10px;
  background:rgba(0,0,0,.04);
  border:1.5px solid rgba(0,0,0,.06);
  border-radius:14px;padding:9px 14px;
  transition:all .3s;
}
.ans-bar:focus-within{
  background:rgba(255,255,255,.9);
  border-color:var(--role-a);
  box-shadow:0 0 0 3px var(--role-mist);
}
.ans-ico{flex-shrink:0;opacity:.4}
.ans-input{
  flex:1;border:none;background:transparent;
  font-size:13px;font-weight:500;color:var(--ink);
  font-family:inherit;outline:none;
}
.ans-input::placeholder{color:var(--ink4)}
.ans-clear{
  width:18px;height:18px;border-radius:50%;
  background:rgba(0,0,0,.12);border:none;cursor:pointer;
  display:none;align-items:center;justify-content:center;
  font-size:10px;color:var(--ink3);
}
.ans-input:not(:placeholder-shown) ~ .ans-clear{display:flex}

/* ── Scrollable content ──────────────────────────────────── */
.allnav-scroll{
  flex:1;overflow-y:auto;padding:0 0 16px;
}
.allnav-scroll::-webkit-scrollbar{display:none}

/* ── Section heading ─────────────────────────────────────── */
.ans-sec{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 18px 6px;
}
.ans-sec-lbl{
  font-size:10px;font-weight:900;color:var(--ink4);
  text-transform:uppercase;letter-spacing:.9px;
}
.ans-sec-more{
  font-size:10.5px;font-weight:700;color:var(--role-a);cursor:pointer;
}

/* ── Horizontal quick-scroll tiles ──────────────────────── */
.ans-hscroll{
  display:flex;gap:10px;padding:0 18px 4px;
  overflow-x:auto;scrollbar-width:none;
}
.ans-hscroll::-webkit-scrollbar{display:none}

.ans-htile{
  flex:0 0 68px;display:flex;flex-direction:column;align-items:center;
  gap:6px;padding:12px 8px 10px;
  background:var(--white);border:1.5px solid var(--line);
  border-radius:18px;cursor:pointer;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
  animation:htileIn .4s cubic-bezier(.34,1.56,.64,1) both;
}
.ans-htile::before{
  content:'';position:absolute;inset:0;
  background:var(--ht-bg,transparent);
  opacity:0;transition:opacity .3s;border-radius:18px;
}
.ans-htile:hover{transform:translateY(-4px);box-shadow:0 8px 20px rgba(0,0,0,.08)}
.ans-htile:hover::before{opacity:1}
.ans-htile:active{transform:scale(.95)}
.aht-ico{
  width:40px;height:40px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;position:relative;z-index:1;
  box-shadow:0 2px 8px rgba(0,0,0,.08);
}
.aht-ico .ic svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.ans-htile:hover .aht-ico .ic svg{transform:scale(1.18) rotate(-8deg)}
.aht-lbl{font-size:9.5px;font-weight:800;color:var(--ink2);text-align:center;line-height:1.3;position:relative;z-index:1}
.aht-badge{
  position:absolute;top:6px;right:5px;
  min-width:17px;height:17px;padding:0 4px;border-radius:100px;
  background:linear-gradient(135deg,#FF5050,#FF2070);
  font-size:8px;font-weight:900;color:#fff;
  display:flex;align-items:center;justify-content:center;
  border:1.5px solid var(--white);
  box-shadow:0 2px 5px rgba(255,50,100,.3);
}
@keyframes htileIn{from{opacity:0;transform:scale(.7) translateY(14px)}to{opacity:1;transform:none}}

/* ── Full list items ─────────────────────────────────────── */
.ans-list-item{
  display:flex;align-items:center;gap:13px;
  padding:9px 18px;cursor:pointer;
  transition:background .18s;
  position:relative;animation:aliIn .3s cubic-bezier(.34,1.56,.64,1) both;
}
.ans-list-item:hover{background:rgba(0,0,0,.025)}
.ans-list-item:active{background:rgba(0,0,0,.05)}
.ali-ico{
  width:40px;height:40px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 2px 8px rgba(0,0,0,.07);
}
.ali-body{flex:1;min-width:0}
.ali-name{font-size:13px;font-weight:700;color:var(--ink);letter-spacing:-.1px}
.ali-sub{font-size:10.5px;font-weight:500;color:var(--ink3);margin-top:1px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ali-right{display:flex;align-items:center;gap:7px;flex-shrink:0}
.ali-badge{
  min-width:20px;height:20px;padding:0 5px;border-radius:100px;
  font-size:9.5px;font-weight:900;color:#fff;
  background:linear-gradient(135deg,var(--role-a),var(--role-b,var(--role-a)));
  display:flex;align-items:center;justify-content:center;
}
.ali-tag{
  padding:2px 8px;border-radius:100px;
  font-size:9px;font-weight:800;letter-spacing:.3px;
  text-transform:uppercase;
}
.ali-tag.new{background:rgba(34,197,94,.1);color:#16a34a;border:1px solid rgba(34,197,94,.2)}
.ali-tag.hot{background:rgba(239,68,68,.1);color:#dc2626;border:1px solid rgba(239,68,68,.2)}
.ali-tag.beta{background:rgba(139,92,246,.1);color:#7c3aed;border:1px solid rgba(139,92,246,.2)}
.ali-chevron{opacity:.35;flex-shrink:0;display:flex}
@keyframes aliIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}

/* Divider */
.ans-div{height:1px;margin:4px 18px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.06),transparent)}

/* ── 3-col module grid ───────────────────────────────────── */
.ans-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:8px;padding:0 18px 4px;
}
.ans-grid-item{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:14px 8px 10px;
  background:var(--white);border:1.5px solid var(--line);
  border-radius:18px;cursor:pointer;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
  animation:gridIn .4s cubic-bezier(.34,1.56,.64,1) both;
}
.ans-grid-item:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 8px 20px rgba(0,0,0,.08)}
.ans-grid-item:active{transform:scale(.96)}
.agi-ico{
  width:42px;height:42px;border-radius:15px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(0,0,0,.08);
}
.agi-ico .ic svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.ans-grid-item:hover .agi-ico .ic svg{transform:scale(1.2) rotate(-10deg)}
.agi-lbl{font-size:10px;font-weight:800;color:var(--ink2);text-align:center;line-height:1.3}
.agi-sub{font-size:8.5px;font-weight:500;color:var(--ink4);text-align:center;line-height:1.3}
.agi-badge{
  position:absolute;top:7px;right:7px;
  min-width:16px;height:16px;padding:0 4px;border-radius:100px;
  background:linear-gradient(135deg,#FF5050,#FF2070);
  font-size:7.5px;font-weight:900;color:#fff;
  display:flex;align-items:center;justify-content:center;
  border:1.5px solid var(--white);
}
@keyframes gridIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}

/* ── Recent activity strip ───────────────────────────────── */
.ans-activity{
  display:flex;gap:8px;padding:0 18px 4px;
  overflow-x:auto;scrollbar-width:none;
}
.ans-activity::-webkit-scrollbar{display:none}
.ana-card{
  flex:0 0 140px;padding:10px 12px;
  background:var(--white);border:1.5px solid var(--line);
  border-radius:16px;cursor:pointer;
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  animation:htileIn .35s cubic-bezier(.34,1.56,.64,1) both;
}
.ana-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.07)}
.ana-head{display:flex;align-items:center;gap:7px;margin-bottom:5px}
.ana-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ana-type{font-size:9px;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:.4px}
.ana-title{font-size:11.5px;font-weight:700;color:var(--ink);letter-spacing:-.1px;line-height:1.3}
.ana-time{font-size:9px;font-weight:500;color:var(--ink4);margin-top:3px}

/* ── Bottom action row ───────────────────────────────────── */
.allnav-bottom{
  flex-shrink:0;padding:8px 18px 12px;
  border-top:1px solid rgba(0,0,0,.05);
  display:flex;gap:8px;
}
.anb-btn{
  flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
  padding:10px 12px;border-radius:14px;cursor:pointer;border:none;
  font-family:inherit;font-size:12px;font-weight:700;
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
}
.anb-btn:hover{transform:translateY(-2px)}
.anb-btn.secondary{
  background:rgba(0,0,0,.04);border:1.5px solid rgba(0,0,0,.07);color:var(--ink2);
}
.anb-btn.secondary:hover{background:rgba(0,0,0,.07)}
.anb-btn.primary{
  background:var(--role-grad);color:#fff;
  box-shadow:0 4px 14px var(--role-shadow,rgba(0,0,0,.15));
}
.anb-btn.primary:hover{box-shadow:0 6px 20px var(--role-shadow,rgba(0,0,0,.2))}

/* Bottom nav (legacy override) */
.bnav{
  height:82px;padding:6px 8px 18px;
  display:flex;flex-shrink:0;position:relative;z-index:50;
  background:rgba(250,251,254,.96);
  backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
}
.bnav::before{
  content:'';position:absolute;top:0;left:16px;right:16px;height:1.5px;
  background:linear-gradient(90deg,transparent,var(--line) 30%,var(--line) 70%,transparent);
}
.bnav-row{display:flex;width:100%;align-items:center;justify-content:space-around}
.nb{
  display:flex;flex-direction:column;align-items:center;gap:3px;
  flex:1;padding:7px 4px;border-radius:18px;
  cursor:pointer;border:none;background:none;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
}
.nb:hover{transform:translateY(-3px)}
.nb.sel{background:var(--role-mist)}
.nb-i{
  font-size:22px;line-height:1;
  transition:transform .4s cubic-bezier(.34,1.56,.64,1);
  filter:grayscale(.3);
}
.nb.sel .nb-i{transform:scale(1.2);filter:none}
.nb-t{font-size:9.5px;font-weight:800;color:var(--ink4);text-transform:uppercase;letter-spacing:.4px;transition:color .25s}
.nb.sel .nb-t{color:var(--role-a)}
.nb-dot{width:5px;height:5px;border-radius:50%;background:var(--role-a);margin:1px auto 0;opacity:0;transform:scale(0);transition:all .35s cubic-bezier(.34,1.56,.64,1)}
.nb.sel .nb-dot{opacity:1;transform:scale(1)}

/* ────────────────────────────
   SHARED COMPONENTS
──────────────────────────── */

/* Top bar */
.tbar{
  padding:12px 20px 14px;
  display:flex;align-items:center;justify-content:space-between;
  position:sticky;top:0;z-index:40;
  background:rgba(250,251,254,.92);
  backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
  border-bottom:1.5px solid rgba(20,14,40,.04);
}
.tbar-hi{font-size:11px;font-weight:600;color:var(--ink3);margin-bottom:1px;letter-spacing:.1px}
.tbar-name{font-family:'Clash Display',sans-serif;font-size:19px;font-weight:700;color:var(--ink);letter-spacing:-.4px;line-height:1.1}
.tbar-name b{
  background:var(--role-grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  font-weight:700;
}
.tbar-r{display:flex;align-items:center;gap:8px}
.tbar-btn{
  width:38px;height:38px;border-radius:13px;
  background:var(--white);border:1.5px solid var(--line);
  display:flex;align-items:center;justify-content:center;
  font-size:18px;cursor:pointer;position:relative;
  box-shadow:var(--s1);
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
}
.tbar-btn:hover{transform:scale(1.1) rotate(-5deg);box-shadow:var(--s2)}
.tbar-badge{
  position:absolute;top:-4px;right:-4px;
  width:18px;height:18px;border-radius:50%;
  font-size:9px;font-weight:800;color:#fff;
  display:flex;align-items:center;justify-content:center;
  border:2.5px solid #FAFBFE;
  animation:badgePop .5s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes badgePop{from{transform:scale(0)}to{transform:scale(1)}}
.tbar-av{
  width:38px;height:38px;border-radius:13px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Clash Display',sans-serif;font-size:14px;font-weight:700;color:#fff;
  box-shadow:var(--s2);position:relative;overflow:hidden;
}
.tbar-av::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.25),transparent);
  pointer-events:none;
}

/* Gradient hero */
.ghero{
  margin:14px 16px;border-radius:var(--r3);padding:22px;
  position:relative;overflow:hidden;
  box-shadow:var(--s3),0 0 0 1px rgba(255,255,255,.3) inset;
}
.gh-mesh{
  position:absolute;inset:0;
  background:repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0px,rgba(255,255,255,.04) 1px,transparent 1px,transparent 12px),
             repeating-linear-gradient(-45deg,rgba(255,255,255,.04) 0px,rgba(255,255,255,.04) 1px,transparent 1px,transparent 12px);
  pointer-events:none;
}
.gh-blob{position:absolute;border-radius:50%;pointer-events:none;animation:blobPulse 6s ease-in-out infinite}
@keyframes blobPulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.15);opacity:.9}}
.gh-c{position:relative;z-index:1}
.gh-pill{
  display:inline-flex;align-items:center;gap:7px;
  background:rgba(255,255,255,.22);backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.4);
  padding:5px 13px;border-radius:100px;
  font-size:10px;font-weight:700;color:#fff;letter-spacing:.5px;text-transform:uppercase;
  margin-bottom:12px;
}
.gh-num{
  font-family:'Clash Display',sans-serif;font-size:48px;font-weight:700;
  color:#fff;letter-spacing:-3px;line-height:.9;
  animation:numIn .8s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes numIn{from{opacity:0;transform:translateY(20px) scale(.8)}to{opacity:1;transform:none}}
.gh-num sub{font-size:18px;opacity:.7;font-weight:400;letter-spacing:0;vertical-align:middle}
.gh-sub{font-size:12.5px;color:rgba(255,255,255,.75);margin-top:8px;font-weight:500}
.gh-bar{margin-top:18px}
.gh-track{height:8px;background:rgba(255,255,255,.2);border-radius:100px;overflow:visible;position:relative}
.gh-fill{
  height:100%;border-radius:100px;
  background:rgba(255,255,255,.9);
  box-shadow:0 0 0 2px rgba(255,255,255,.3),0 0 16px rgba(255,255,255,.5);
  transition:width 1.6s cubic-bezier(.34,1.56,.64,1);
  position:relative;
}
.gh-fill::after{
  content:'';position:absolute;right:-5px;top:50%;transform:translateY(-50%);
  width:16px;height:16px;border-radius:50%;
  background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.3),0 0 12px rgba(255,255,255,.8);
  animation:dotPop .6s cubic-bezier(.34,1.56,.64,1) .8s both;
}
@keyframes dotPop{from{opacity:0;transform:translateY(-50%) scale(0)}to{opacity:1;transform:translateY(-50%) scale(1)}}
.gh-blabels{display:flex;justify-content:space-between;margin-top:8px}
.gh-blabel{font-size:10.5px;color:rgba(255,255,255,.6);font-weight:600}

/* Section header */
.sh{padding:16px 18px 8px;display:flex;align-items:center;justify-content:space-between}
.sh-t{font-family:'Cabinet Grotesk',sans-serif;font-size:15px;font-weight:800;color:var(--ink);letter-spacing:-.3px}
.sh-more{
  font-size:11.5px;font-weight:700;padding:4px 12px;border-radius:100px;
  cursor:pointer;transition:all .2s;
  color:var(--role-a);background:var(--role-mist);border:none;
  font-family:'Satoshi',sans-serif;
}
.sh-more:hover{opacity:.8;transform:scale(.97)}

/* Stat tiles */
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;padding:0 16px 14px}
.tile{
  padding:14px 10px;border-radius:22px;
  background:var(--white);border:1.5px solid var(--line);
  box-shadow:var(--s1);cursor:pointer;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
}
.tile::before{
  content:'';position:absolute;bottom:0;left:0;right:0;height:3px;
  background:var(--role-grad);border-radius:0 0 22px 22px;
  opacity:0;transition:opacity .25s;
}
.tile:hover{transform:translateY(-4px) scale(1.03);box-shadow:var(--s2)}
.tile:hover::before{opacity:1}
.t-ico{font-size:24px;margin-bottom:7px;display:block;
  animation:tileFloat 3s ease-in-out infinite}
@keyframes tileFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-4px) rotate(-5deg)}}
.t-num{font-family:'Clash Display',sans-serif;font-size:23px;font-weight:700;color:var(--ink);letter-spacing:-1px;line-height:1}
.t-lbl{font-size:9.5px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.5px;margin-top:5px}
.t-ch{font-size:10px;font-weight:700;margin-top:5px}

/* Card */
.card{
  margin:0 16px 12px;background:var(--white);
  border-radius:var(--r2);border:1.5px solid var(--line);
  box-shadow:var(--s2);overflow:hidden;
  transition:box-shadow .3s,transform .3s;
}
.card:hover{box-shadow:var(--s3);transform:translateY(-2px)}

/* Quick action grid */
.acts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 16px 14px}
.act{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:14px 6px;border-radius:20px;
  background:var(--white);border:1.5px solid var(--line);
  cursor:pointer;box-shadow:var(--s1);
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
}
.act:hover{transform:translateY(-5px) scale(1.05);box-shadow:var(--s3)}
.act:active{transform:scale(.93)}
.a-ico{font-size:26px;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.act:hover .a-ico{transform:scale(1.25) rotate(-8deg)}
.a-lbl{font-size:9px;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:.3px;text-align:center;line-height:1.3}

/* Scroll track (periods) */
.hrow{display:flex;gap:10px;padding:0 16px 14px;overflow-x:auto;scrollbar-width:none}
.hrow::-webkit-scrollbar{display:none}

/* Period chip */
.pchip{
  flex-shrink:0;width:126px;padding:14px;border-radius:22px;
  background:var(--white);border:2px solid var(--line);
  box-shadow:var(--s1);cursor:pointer;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
}
.pchip:hover{transform:translateY(-4px);box-shadow:var(--s2)}
.pchip.active{
  background:var(--role-mist);
  border-color:var(--role-a);
  box-shadow:0 0 0 4px var(--role-glow),var(--s2);
  animation:chipPulse 3s ease-in-out infinite;
}
@keyframes chipPulse{0%,100%{box-shadow:0 0 0 4px var(--role-glow),var(--s2)}50%{box-shadow:0 0 0 8px var(--role-glow),var(--s3)}}
.pchip.done{opacity:.45;filter:saturate(.3)}
.pc-sub{font-size:9.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;margin-bottom:5px;color:var(--role-a)}
.pc-cl{font-family:'Clash Display',sans-serif;font-size:19px;font-weight:700;color:var(--ink);letter-spacing:-.5px;margin:2px 0}
.pc-time{font-size:10.5px;color:var(--ink3);margin-bottom:8px;font-weight:500}
.pc-tag{display:inline-flex;align-items:center;gap:4px;font-size:9.5px;font-weight:800;padding:3px 9px;border-radius:100px}

/* List row */
.lr{
  display:flex;align-items:center;gap:12px;padding:13px 16px;
  border-bottom:1.5px solid rgba(20,14,40,.04);cursor:pointer;
  transition:background .15s;
}
.lr:last-child{border-bottom:none}
.lr:hover{background:var(--mist)}
.lr-ico{
  width:42px;height:42px;border-radius:15px;
  display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}
.lr:hover .lr-ico{transform:scale(1.12) rotate(-6deg)}
.lr-main{flex:1;min-width:0}
.lr-name{font-size:13.5px;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lr-sub{font-size:11px;color:var(--ink3);margin-top:2px;font-weight:500}
.lr-r{text-align:right;flex-shrink:0}
.tag{font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:100px;display:inline-block;letter-spacing:.2px}
.tg{background:#F0FDF4;color:#166534}
.tr{background:#FEF2F2;color:#991B1B}
.ty{background:#FFFBEB;color:#92400E}
.tb{background:#EFF6FF;color:#1E40AF}
.tv{background:#F5F3FF;color:#5B21B6}

/* Attendance */
.ar{
  display:flex;align-items:center;gap:10px;
  padding:11px 16px;border-bottom:1.5px solid rgba(20,14,40,.04);
  transition:background .15s;
}
.ar:hover{background:var(--mist)}
.ar-av{width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0}
.ar-n{font-size:13px;font-weight:700;color:var(--ink);flex:1}
.ar-r{font-size:10px;color:var(--ink3)}
.ar-btns{display:flex;gap:5px}
.ap,.aa,.al{
  width:32px;height:32px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800;cursor:pointer;
  border:2px solid;transition:all .25s cubic-bezier(.34,1.56,.64,1);
  font-family:'Satoshi',sans-serif;
}
.ap{border-color:rgba(22,163,74,.2);color:rgba(22,163,74,.5);background:rgba(22,163,74,.04)}
.ap.on{background:#DCFCE7;border-color:#16a34a;color:#166534;transform:scale(1.1)}
.aa{border-color:rgba(220,38,38,.2);color:rgba(220,38,38,.5);background:rgba(220,38,38,.04)}
.aa.on{background:#FEE2E2;border-color:#dc2626;color:#991B1B;transform:scale(1.1)}
.al{border-color:rgba(217,119,6,.2);color:rgba(217,119,6,.5);background:rgba(217,119,6,.04)}
.al.on{background:#FEF3C7;border-color:#d97706;color:#92400E;transform:scale(1.1)}

/* Route stop */
.rs{display:flex;align-items:flex-start;gap:14px;padding:11px 16px;position:relative}
.rs::after{content:'';position:absolute;left:29px;top:37px;bottom:-10px;width:2px;background:linear-gradient(to bottom,rgba(20,14,40,.1),transparent)}
.rs:last-child::after{display:none}
.rs-dot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;margin-top:2px;position:relative;z-index:1}
.rs-body{flex:1}
.rs-n{font-size:13px;font-weight:700;color:var(--ink)}
.rs-s{font-size:11px;color:var(--ink3);margin-top:1px;font-weight:500}
.rs-t{font-size:11px;font-weight:800;flex-shrink:0;margin-top:2px}
.rs-done .rs-n,.rs-done .rs-s{opacity:.4;text-decoration:line-through}

/* Pickup row */
.pr{display:flex;align-items:center;gap:11px;padding:11px 14px;border-bottom:1.5px solid rgba(20,14,40,.04);cursor:pointer;transition:background .15s}
.pr:last-child{border-bottom:none}
.pr:hover{background:var(--mist)}
.pchk{width:26px;height:26px;border-radius:9px;border:2.5px solid rgba(20,14,40,.15);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;transition:all .3s cubic-bezier(.34,1.56,.64,1);flex-shrink:0;background:var(--white)}
.pchk.on{border-color:#16a34a;background:#DCFCE7;color:#16a34a;transform:scale(1.12)}
.pr-n{font-size:13px;font-weight:700;color:var(--ink);flex:1}
.pr-s{font-size:11px;color:var(--ink3)}

/* Module grid */
.mods{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;padding:0 16px 14px}
.mod{
  padding:16px 8px;border-radius:20px;border:2px solid var(--line);
  display:flex;flex-direction:column;align-items:center;gap:6px;
  background:var(--white);box-shadow:var(--s1);cursor:pointer;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
}
.mod::after{content:'';position:absolute;inset:0;opacity:0;transition:opacity .25s}
.mod:hover{transform:translateY(-5px) scale(1.04);box-shadow:var(--s3)}
.mod:hover::after{opacity:1}
.mod-ico{font-size:27px;position:relative;z-index:1;transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.mod:hover .mod-ico{transform:scale(1.3) rotate(-10deg)}
.mod-n{font-size:9.5px;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:.4px;text-align:center;line-height:1.3;position:relative;z-index:1}
.mod-badge{position:absolute;top:7px;right:7px;width:17px;height:17px;border-radius:50%;font-size:9px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;z-index:2;animation:badgePop .5s cubic-bezier(.34,1.56,.64,1) both}

/* Approvals */
.appr{
  margin:0 16px 10px;padding:15px;
  background:var(--white);border-radius:var(--r2);
  border:1.5px solid var(--line);box-shadow:var(--s2);
  transition:all .3s;
}
.appr:hover{box-shadow:var(--s3);transform:translateY(-2px)}
.apr-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.apr-ic{width:40px;height:40px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:21px;flex-shrink:0}
.apr-n{font-size:13px;font-weight:800;color:var(--ink);font-family:'Cabinet Grotesk',sans-serif}
.apr-type{font-size:10.5px;color:var(--ink3);margin-top:1px;font-weight:500}
.apr-body{font-size:11.5px;color:var(--ink2);line-height:1.55;padding-left:50px;margin-bottom:11px;font-weight:500}
.apr-btns{display:flex;gap:7px;padding-left:0}
.abtn-ok{flex:1;padding:10px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:13px;color:#fff;font-size:12px;font-weight:800;cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 4px 14px rgba(22,163,74,.3)}
.abtn-ok:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 20px rgba(22,163,74,.4)}
.abtn-no{flex:1;padding:10px;background:#FEF2F2;border:none;border-radius:13px;color:#991B1B;font-size:12px;font-weight:800;cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .25s cubic-bezier(.34,1.56,.64,1)}
.abtn-no:hover{background:#FEE2E2;transform:translateY(-2px)}

/* Alert rows */
.alrt{display:flex;align-items:flex-start;gap:11px;padding:12px 16px;border-bottom:1.5px solid rgba(20,14,40,.04)}
.alrt:last-child{border-bottom:none}
.adot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:4px}
.atxt{font-size:12.5px;color:var(--ink2);line-height:1.5;flex:1;font-weight:500}
.atime{font-size:10px;color:var(--ink4);flex-shrink:0;font-weight:700}

/* Notice */
.notice{
  margin:0 16px 10px;padding:15px;
  border-radius:var(--r2);background:var(--white);
  border:1.5px solid var(--line);
  border-left:4px solid var(--role-a);
  box-shadow:var(--s1);
  transition:all .25s;
}
.notice:hover{transform:translateX(4px);box-shadow:var(--s2)}
.nt{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
.nn{font-size:13px;font-weight:800;color:var(--ink);font-family:'Cabinet Grotesk',sans-serif}
.nd{font-size:10px;color:var(--ink4);font-weight:600}
.nb-{font-size:12px;color:var(--ink3);line-height:1.55}

/* Vehicle card */
.veh{
  margin:0 16px 12px;padding:18px;border-radius:var(--r3);
  box-shadow:var(--s3);overflow:hidden;position:relative;
}
.veh::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.12);pointer-events:none}
.veh::after{content:'';position:absolute;bottom:-30px;left:-20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none}
.veh-c{position:relative;z-index:1}
.veh-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.veh-num{font-family:'DM Mono',monospace;font-size:16px;font-weight:500;color:#fff;letter-spacing:1px}
.veh-st{font-size:10px;font-weight:800;padding:5px 12px;border-radius:100px;background:rgba(255,255,255,.25);color:#fff;backdrop-filter:blur(8px)}
.veh-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.vg-val{font-family:'Clash Display',sans-serif;font-size:20px;font-weight:700;color:#fff;letter-spacing:-.5px}
.vg-lbl{font-size:9.5px;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;font-weight:600}
.vg-bar{height:5px;background:rgba(255,255,255,.2);border-radius:100px;overflow:hidden;margin-top:6px}
.vg-fill{height:100%;background:rgba(255,255,255,.85);border-radius:100px;box-shadow:0 0 8px rgba(255,255,255,.5)}

/* SOS */
.sos{
  margin:10px 16px;padding:18px;border-radius:var(--r2);
  background:linear-gradient(135deg,#FFF1F2,#FFE4E6);
  border:2px solid rgba(220,38,38,.25);
  display:flex;align-items:center;gap:14px;cursor:pointer;
  box-shadow:0 4px 20px rgba(220,38,38,.1),var(--s1);
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
}
.sos:hover{transform:scale(1.03);box-shadow:0 10px 36px rgba(220,38,38,.22)}
.sos:active{transform:scale(.97)}
.sos-ico{font-size:38px;animation:sosBounce 2s ease-in-out infinite}
@keyframes sosBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.1) rotate(-5deg)}}
.sos-t{font-family:'Clash Display',sans-serif;font-size:17px;font-weight:700;color:#DC2626;letter-spacing:-.3px}
.sos-s{font-size:11.5px;color:rgba(220,38,38,.55);margin-top:2px;font-weight:500}

/* Progress track */
.pbar{height:8px;background:rgba(20,14,40,.06);border-radius:100px;overflow:hidden}
.pbar-f{height:100%;border-radius:100px;transition:width 1.4s cubic-bezier(.34,1.56,.64,1)}

/* Fee bar chart */
.fbars{display:flex;align-items:flex-end;gap:7px;height:90px;padding:0 16px}
.fbar{flex:1;border-radius:8px 8px 0 0;cursor:pointer;position:relative;transition:opacity .2s}
.fbar:hover{opacity:.8}
.fbar::after{content:attr(data-v);position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:8px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s}
.fbar:hover::after{opacity:1}
.flabels{display:flex;gap:7px;padding:7px 16px 0}
.flabel{flex:1;text-align:center;font-size:9.5px;color:var(--ink4);font-weight:700}

/* ══════════════════════════════════════
   ADMIN DASHBOARD — CARD DESIGN FIXES
══════════════════════════════════════ */

/* Fee hero card — fix pill and layout */
.ghero{
  margin:0 16px 14px;border-radius:24px;
  padding:20px 20px 22px;position:relative;overflow:hidden;
}
.gh-pill{
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(255,255,255,.2);backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,.3);
  border-radius:100px;padding:5px 13px;
  font-size:11px;font-weight:700;color:rgba(255,255,255,.95);
  margin-bottom:14px;
}
.gh-num{
  font-family:'Clash Display',sans-serif;
  font-size:38px;font-weight:800;color:#fff;
  letter-spacing:-1.5px;line-height:1.1;
  margin-bottom:6px;
  animation:numIn .6s cubic-bezier(.34,1.56,.64,1) both;
}

/* Stats tiles — clean 3-col grid */
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;padding:0 16px 14px}
.tile{
  padding:16px 10px 14px;border-radius:22px;
  background:var(--white);border:1.5px solid var(--line);
  box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:pointer;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
  display:flex;flex-direction:column;align-items:center;text-align:center;
}
.tile:hover{transform:translateY(-4px) scale(1.03);box-shadow:0 8px 24px rgba(0,0,0,.1)}
.tile::before{
  content:'';position:absolute;inset:0;
  background:var(--role-grad);opacity:0;
  transition:opacity .3s;border-radius:22px;
}
.tile:hover::before{opacity:.06}
.t-ico{
  width:44px;height:44px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 8px;
  background:var(--role-mist);
  animation:tileFloat 3s ease-in-out infinite;
}
.t-num{
  font-family:'Clash Display',sans-serif;
  font-size:22px;font-weight:800;color:var(--ink);
  letter-spacing:-0.8px;line-height:1;
}
.t-lbl{font-size:9.5px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.5px;margin-top:4px}
.t-ch{font-size:10px;font-weight:800;margin-top:4px}

/* Fee bar chart card */
.fbars{display:flex;align-items:flex-end;gap:7px;height:90px;padding:0 16px}
.fbar{flex:1;border-radius:8px 8px 0 0;cursor:pointer;position:relative;transition:opacity .2s}

/* Approval cards — consistent clean design */
.appr{
  margin:0 16px 10px;padding:16px;
  background:var(--white);border-radius:20px;
  border:1.5px solid var(--line);
  box-shadow:0 2px 8px rgba(0,0,0,.05);
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
}
.appr:hover{box-shadow:0 6px 20px rgba(0,0,0,.08);transform:translateY(-2px)}
.apr-top{
  display:flex;align-items:center;gap:12px;margin-bottom:10px;
}
.apr-ic{
  width:42px;height:42px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 2px 6px rgba(0,0,0,.07);
}
.apr-n{font-size:13.5px;font-weight:800;color:var(--ink);font-family:'Cabinet Grotesk',sans-serif;letter-spacing:-.2px}
.apr-type{
  display:inline-flex;align-items:center;
  font-size:10px;font-weight:700;color:var(--ink3);margin-top:3px;
  background:rgba(0,0,0,.04);border-radius:100px;padding:2px 8px;
}
.apr-body{
  font-size:12px;color:var(--ink2);line-height:1.6;
  margin-bottom:12px;padding:10px 12px;
  background:rgba(0,0,0,.03);border-radius:12px;
  border-left:3px solid var(--role-a);
}
.apr-btns{display:flex;gap:8px}
.abtn-ok{
  flex:1;padding:10px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;border-radius:12px;color:#fff;
  font-size:12px;font-weight:800;cursor:pointer;
  font-family:'Satoshi',sans-serif;
  transition:all .25s cubic-bezier(.34,1.56,.64,1);
  box-shadow:0 3px 10px rgba(22,163,74,.3);
}
.abtn-ok:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 6px 16px rgba(22,163,74,.4)}
.abtn-no{
  flex:1;padding:10px;
  background:#FEF2F2;border:1.5px solid rgba(220,38,38,.12);
  border-radius:12px;color:#991B1B;
  font-size:12px;font-weight:800;cursor:pointer;
  font-family:'Satoshi',sans-serif;
  transition:all .25s cubic-bezier(.34,1.56,.64,1);
}
.abtn-no:hover{background:#FEE2E2;transform:translateY(-2px)}

/* 12 module grid — clean even layout */
.mods{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 16px 14px}
.mod{
  padding:14px 6px 12px;border-radius:18px;
  border:1.5px solid var(--line);
  display:flex;flex-direction:column;align-items:center;gap:5px;
  background:var(--white);cursor:pointer;
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
}
.mod:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 6px 18px rgba(0,0,0,.09)}
.mod-ico{
  width:38px;height:38px;border-radius:13px;
  display:flex;align-items:center;justify-content:center;
  background:var(--role-mist);
  box-shadow:0 2px 6px rgba(0,0,0,.07);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}
.mod:hover .mod-ico{transform:scale(1.12) rotate(-5deg)}
.mod-n{font-size:9px;font-weight:800;color:var(--ink2);text-align:center;text-transform:uppercase;letter-spacing:.3px;line-height:1.3}
.mod-badge{
  position:absolute;top:6px;right:6px;
  min-width:16px;height:16px;padding:0 4px;border-radius:100px;
  font-size:8px;font-weight:900;color:#fff;
  display:flex;align-items:center;justify-content:center;
  border:1.5px solid var(--white);
  box-shadow:0 2px 4px rgba(0,0,0,.15);
}

/* Alerts card */
.alrt{display:flex;align-items:flex-start;gap:11px;padding:12px 16px;border-bottom:1px solid var(--line)}
.alrt:last-child{border-bottom:none}
.adot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.atxt{font-size:12px;color:var(--ink2);line-height:1.55;flex:1;font-weight:500}
.atime{font-size:10px;color:var(--ink4);font-weight:700;white-space:nowrap;margin-top:2px}

/* Attendance mini stat boxes */
.att-stat-box{
  text-align:center;padding:13px 6px;border-radius:16px;border:1.5px solid transparent;
}

/* Section header consistency */
.sh{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 6px;flex-shrink:0}
.sh-t{font-size:13px;font-weight:800;color:var(--ink);letter-spacing:-.2px}
.sh-more{font-size:10.5px;font-weight:700;padding:5px 12px;border-radius:100px;border:none;cursor:pointer;transition:all .2s}


/* Perf bars */
.prow{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.pname{font-size:12px;font-weight:700;color:var(--ink);width:70px;flex-shrink:0}
.ptrack{flex:1;height:8px;background:rgba(20,14,40,.06);border-radius:100px;overflow:hidden}
.pfill{height:100%;border-radius:100px;transition:width 1.6s cubic-bezier(.34,1.56,.64,1)}
.pval{font-size:12px;font-weight:800;width:34px;text-align:right;flex-shrink:0}

/* Live pill */
.live-pill{display:flex;align-items:center;gap:6px;background:#F0FDF4;border:1.5px solid rgba(22,163,74,.3);padding:4px 12px;border-radius:100px}
.live-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:lp 1.2s infinite}
@keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
.live-t{font-size:10px;font-weight:800;color:#166534}

/* Notif btns */
.nbtns{display:flex;gap:8px;padding:0 16px 12px}
.nbtn{flex:1;padding:12px;border:none;border-radius:16px;font-size:12px;font-weight:800;cursor:pointer;font-family:'Satoshi',sans-serif;box-shadow:var(--s1);transition:all .3s cubic-bezier(.34,1.56,.64,1)}
.nbtn:hover{transform:translateY(-3px);box-shadow:var(--s2)}

/* Submit btn */
.submit-btn{
  width:100%;padding:17px;border:none;border-radius:20px;
  font-family:'Cabinet Grotesk',sans-serif;font-size:16px;font-weight:800;
  color:#fff;cursor:pointer;position:relative;overflow:hidden;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  box-shadow:var(--s3);
}
.submit-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.2),transparent);pointer-events:none}
.submit-btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 14px 36px rgba(255,87,51,.4)}
.submit-btn:active{transform:scale(.97)}

/* Scroll reveal */
.sr{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease}
.sr.in{opacity:1;transform:none}
.sr.d1{transition-delay:.04s}.sr.d2{transition-delay:.08s}.sr.d3{transition-delay:.12s}
.sr.d4{transition-delay:.16s}.sr.d5{transition-delay:.2s}.sr.d6{transition-delay:.24s}
.sr.d7{transition-delay:.28s}.sr.d8{transition-delay:.32s}

/* Dash visibility */
.dash{display:none}
.dash.on{display:block}

/* Sparkline */
.sparkline{display:flex;align-items:flex-end;gap:3px;height:44px}
.sbar{flex:1;border-radius:4px 4px 0 0;opacity:.7;transition:opacity .2s,height .8s cubic-bezier(.34,1.56,.64,1)}
.sbar:hover{opacity:1}

/* Toast */
.toast{
  position:absolute;bottom:95px;left:50%;transform:translateX(-50%);
  background:var(--ink);color:#fff;
  padding:11px 20px;border-radius:100px;
  font-size:12.5px;font-weight:700;white-space:nowrap;
  z-index:999;pointer-events:none;
  animation:toastIn .4s cubic-bezier(.34,1.56,.64,1) both;
  box-shadow:0 10px 30px rgba(20,14,40,.3);
  font-family:'Cabinet Grotesk',sans-serif;
  letter-spacing:.2px;
}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px) scale(.85)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}

/* ── Role theming on phone ── */
.t-phone{--role-a:var(--t-a);--role-b:var(--t-b);--role-mist:var(--t-soft);--role-grad:var(--t-grad);--role-glow:rgba(255,87,51,.15)}
.d-phone{--role-a:var(--d-a);--role-b:var(--d-b);--role-mist:var(--d-soft);--role-grad:var(--d-grad);--role-glow:rgba(0,107,255,.15)}
.a-phone{--role-a:var(--a-a);--role-b:var(--a-b);--role-mist:var(--a-soft);--role-grad:var(--a-grad);--role-glow:rgba(255,149,0,.15)}
.ac-phone{--role-a:var(--ac-a);--role-b:var(--ac-b);--role-mist:var(--ac-soft);--role-grad:var(--ac-grad);--role-glow:rgba(79,70,229,.15)}
.hr-phone{--role-a:var(--hr-a);--role-b:var(--hr-b);--role-mist:var(--hr-soft);--role-grad:var(--hr-grad);--role-glow:rgba(13,148,136,.15)}
.sc-phone{--role-a:var(--sc-a);--role-b:var(--sc-b);--role-mist:var(--sc-soft);--role-grad:var(--sc-grad);--role-glow:rgba(30,58,95,.15)}
.tm-phone{--role-a:var(--tm-a);--role-b:var(--tm-b);--role-mist:var(--tm-soft);--role-grad:var(--tm-grad);--role-glow:rgba(4,120,87,.15)}

/* Staggered icon animations */
.ico-spin{animation:icoSpin 8s linear infinite}
@keyframes icoSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.ico-bob{animation:icoBob 2.5s ease-in-out infinite}
@keyframes icoBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.ico-shake{animation:icoShake 3s ease-in-out infinite}
@keyframes icoShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}

/* ══════════════════════════════════════════
   FACE RECOGNITION MODULE STYLES
══════════════════════════════════════════ */

/* Mode toggle */
.fr-mode-bar{
  display:flex;gap:0;margin:14px 16px 0;
  background:rgba(0,107,255,.07);border-radius:18px;padding:4px;
  border:1.5px solid rgba(0,107,255,.12);
}
.fr-mode-btn{
  flex:1;padding:10px 6px;border-radius:14px;
  border:none;cursor:pointer;
  font-family:'Cabinet Grotesk',sans-serif;font-size:13px;font-weight:800;
  letter-spacing:.2px;transition:all .35s cubic-bezier(.34,1.56,.64,1);
  color:var(--ink3);background:none;
}
.fr-mode-btn.active{
  background:var(--white);
  box-shadow:var(--s2);
  color:var(--d-a);
}
.fr-mode-btn.drop-active{
  background:var(--white);
  box-shadow:var(--s2);
  color:#7c3aed;
}

/* Camera viewfinder */
.fr-camera-wrap{
  margin:14px 16px 0;border-radius:26px;
  overflow:hidden;position:relative;
  background:linear-gradient(160deg,#0a0a1a 0%,#0d1528 40%,#0a1a0d 100%);
  height:280px;
  box-shadow:var(--s3),0 0 0 1.5px rgba(0,107,255,.2);
}

/* Animated corner brackets */
.fr-corner{position:absolute;width:32px;height:32px;z-index:10;transition:all .4s cubic-bezier(.34,1.56,.64,1)}
.fr-corner::before,.fr-corner::after{content:'';position:absolute;background:var(--fr-corner-color,#00B4D8);border-radius:2px}
.fr-corner.tl{top:16px;left:16px}
.fr-corner.tl::before{top:0;left:0;width:3px;height:22px}
.fr-corner.tl::after{top:0;left:0;width:22px;height:3px}
.fr-corner.tr{top:16px;right:16px}
.fr-corner.tr::before{top:0;right:0;width:3px;height:22px}
.fr-corner.tr::after{top:0;right:0;width:22px;height:3px}
.fr-corner.bl{bottom:16px;left:16px}
.fr-corner.bl::before{bottom:0;left:0;width:3px;height:22px}
.fr-corner.bl::after{bottom:0;left:0;width:22px;height:3px}
.fr-corner.br{bottom:16px;right:16px}
.fr-corner.br::before{bottom:0;right:0;width:3px;height:22px}
.fr-corner.br::after{bottom:0;right:0;width:22px;height:3px}

/* Scanning laser beam */
.fr-scan-line{
  position:absolute;left:12px;right:12px;height:2px;
  background:linear-gradient(90deg,transparent,var(--fr-scan-color,rgba(0,180,216,.8)),var(--fr-scan-color,rgba(0,212,170,1)),var(--fr-scan-color,rgba(0,180,216,.8)),transparent);
  border-radius:100px;z-index:8;
  box-shadow:0 0 12px var(--fr-scan-glow,rgba(0,212,170,.6)),0 0 24px var(--fr-scan-glow,rgba(0,212,170,.3));
  animation:scanDown 2.4s ease-in-out infinite;top:20px;
  display:none;
}
.fr-scan-line.scanning{display:block}
@keyframes scanDown{
  0%{top:20px;opacity:0}
  5%{opacity:1}
  95%{opacity:1}
  100%{top:calc(100% - 20px);opacity:0}
}

/* Grid overlay */
.fr-grid{
  position:absolute;inset:0;pointer-events:none;z-index:2;
  background-image:
    linear-gradient(rgba(0,180,216,.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,180,216,.06) 1px,transparent 1px);
  background-size:32px 32px;
  opacity:0;transition:opacity .5s;
}
.fr-grid.active{opacity:1}

/* Face detection box */
.fr-face-box{
  position:absolute;z-index:9;
  border:2.5px solid var(--fr-box-color,#00D4AA);
  border-radius:16px;
  box-shadow:0 0 0 1px rgba(0,212,170,.2),inset 0 0 20px rgba(0,212,170,.04);
  transition:all .5s cubic-bezier(.34,1.56,.64,1);
  display:none;
  overflow:hidden;
}
.fr-face-box::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(160deg,rgba(0,212,170,.08),transparent 60%);
  pointer-events:none;
}
.fr-face-box.visible{display:block}
/* Scanning shimmer inside the box */
.fr-face-box::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(to bottom,transparent 0%,rgba(0,212,170,.12) 50%,transparent 100%);
  animation:boxSweep 1.5s ease-in-out infinite;
}
@keyframes boxSweep{0%,100%{transform:translateY(-100%)}50%{transform:translateY(100%)}}

/* Face label */
.fr-face-label{
  position:absolute;bottom:-1px;left:0;right:0;
  background:var(--fr-box-color,#00D4AA);
  padding:3px 8px;
  font-size:9.5px;font-weight:800;color:#fff;letter-spacing:.4px;
  text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}

/* Dot map overlays (simulated facial landmarks) */
.fr-dots{position:absolute;inset:0;z-index:10;pointer-events:none;display:none}
.fr-dots.visible{display:block}
.fr-dot{
  position:absolute;width:4px;height:4px;border-radius:50%;
  background:rgba(0,212,170,.9);
  box-shadow:0 0 4px rgba(0,212,170,.8);
  animation:dotFade 2s ease-in-out infinite;
}
@keyframes dotFade{0%,100%{opacity:.4}50%{opacity:1}}

/* Confidence meter */
.fr-confidence{
  position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
  z-index:12;
  background:rgba(0,0,0,.75);backdrop-filter:blur(16px);
  border:1px solid rgba(0,212,170,.3);
  border-radius:100px;padding:5px 14px;
  display:none;white-space:nowrap;
}
.fr-confidence.visible{display:flex;align-items:center;gap:8px}
.frc-label{font-size:10px;font-weight:700;color:rgba(255,255,255,.6);letter-spacing:.4px;text-transform:uppercase}
.frc-bar-track{width:80px;height:5px;background:rgba(255,255,255,.15);border-radius:100px;overflow:hidden}
.frc-bar-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#00B4D8,#00D4AA);transition:width 1s cubic-bezier(.34,1.56,.64,1)}
.frc-pct{font-size:11px;font-weight:800;color:#00D4AA}

/* Camera placeholder person silhouette */
.fr-silhouette{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-52%);
  z-index:3;opacity:.08;pointer-events:none;
  transition:opacity .5s;
}
.fr-silhouette.hidden{opacity:0}

/* Status badge on camera */
.fr-status-badge{
  position:absolute;top:14px;left:50%;transform:translateX(-50%);
  z-index:15;display:flex;align-items:center;gap:6px;
  background:rgba(0,0,0,.65);backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.12);
  padding:5px 14px;border-radius:100px;
  font-size:10.5px;font-weight:800;color:#fff;letter-spacing:.3px;
  white-space:nowrap;
}
.frsb-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.frsb-dot.scanning{background:#00D4AA;animation:lp 1s infinite}
.frsb-dot.idle{background:rgba(255,255,255,.4)}
.frsb-dot.matched{background:#22c55e}
.frsb-dot.nomatch{background:#ef4444}

/* Scan button */
.fr-scan-btn{
  margin:14px 16px 0;
  width:calc(100% - 32px);
  padding:17px;border-radius:20px;border:none;
  font-family:'Cabinet Grotesk',sans-serif;font-size:16px;font-weight:800;
  cursor:pointer;position:relative;overflow:hidden;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
  display:flex;align-items:center;justify-content:center;gap:10px;
  box-shadow:var(--s3);
}
.fr-scan-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.2),transparent);pointer-events:none}
.fr-scan-btn:hover{transform:translateY(-3px) scale(1.02)}
.fr-scan-btn:active{transform:scale(.96)}
.fr-scan-btn-ico{font-size:20px;transition:transform .5s cubic-bezier(.34,1.56,.64,1)}
.fr-scan-btn.scanning .fr-scan-btn-ico{animation:icoSpin 2s linear infinite}
.fr-scan-btn.pickup{background:linear-gradient(135deg,#FF5733,#FF006E);color:#fff;box-shadow:0 8px 28px rgba(0,107,255,.35)}
.fr-scan-btn.drop{background:linear-gradient(135deg,#7c3aed,#c084fc);color:#fff;box-shadow:0 8px 28px rgba(124,58,237,.35)}
.fr-scan-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}

/* Match result card */
.fr-result{
  margin:12px 16px 0;border-radius:22px;padding:16px;
  background:var(--white);border:2px solid rgba(34,197,94,.25);
  box-shadow:var(--s2),0 0 0 4px rgba(34,197,94,.06);
  display:none;
  animation:resultSlide .5s cubic-bezier(.34,1.56,.64,1) both;
}
.fr-result.show{display:block}
@keyframes resultSlide{from{opacity:0;transform:translateY(16px) scale(.95)}to{opacity:1;transform:none}}
.fr-result.fail{border-color:rgba(239,68,68,.3);box-shadow:var(--s2),0 0 0 4px rgba(239,68,68,.06)}

.frr-top{display:flex;align-items:center;gap:14px;margin-bottom:12px}
.frr-avatar{
  width:60px;height:60px;border-radius:18px;
  display:flex;align-items:center;justify-content:center;
  font-size:24px;font-weight:900;color:#fff;
  font-family:'Clash Display',sans-serif;flex-shrink:0;
  box-shadow:var(--s2);position:relative;overflow:hidden;
}
.frr-avatar::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.2),transparent)}

.frr-info{flex:1}
.frr-name{font-family:'Clash Display',sans-serif;font-size:18px;font-weight:700;color:var(--ink);letter-spacing:-.4px}
.frr-meta{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap}
.frr-class{font-size:11px;font-weight:700;padding:3px 9px;border-radius:100px;background:#EFF6FF;color:#1D4ED8}
.frr-route{font-size:11px;font-weight:600;color:var(--ink3)}

.frr-status-row{
  display:flex;align-items:center;justify-content:space-between;
  background:var(--mist);border-radius:14px;padding:11px 14px;
  margin-bottom:10px;
}
.frr-status-lbl{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.5px}
.frr-status-val{font-size:12px;font-weight:800;padding:3px 10px;border-radius:100px}

.frr-confidence-row{display:flex;align-items:center;gap:10px}
.frr-conf-lbl{font-size:11px;font-weight:700;color:var(--ink3);width:80px}
.frr-conf-track{flex:1;height:7px;background:rgba(0,0,0,.06);border-radius:100px;overflow:hidden}
.frr-conf-fill{height:100%;border-radius:100px;transition:width 1.2s cubic-bezier(.34,1.56,.64,1)}
.frr-conf-pct{font-size:12px;font-weight:800;width:36px;text-align:right}

.frr-actions{display:flex;gap:8px;margin-top:12px}
.frr-confirm{
  flex:1;padding:11px;border:none;border-radius:14px;
  font-family:'Satoshi',sans-serif;font-size:13px;font-weight:800;
  cursor:pointer;transition:all .3s cubic-bezier(.34,1.56,.64,1);
  box-shadow:var(--s1);
}
.frr-confirm:hover{transform:translateY(-2px) scale(1.02);box-shadow:var(--s2)}
.frr-rescan{
  padding:11px 16px;border:2px solid var(--line);background:var(--white);
  border-radius:14px;font-family:'Satoshi',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;color:var(--ink2);transition:all .25s;
}
.frr-rescan:hover{background:var(--mist)}

/* No match state */
.fr-nomatch{
  margin:12px 16px 0;border-radius:22px;padding:16px;
  background:#FEF2F2;border:2px solid rgba(239,68,68,.2);
  display:none;
  animation:resultSlide .5s cubic-bezier(.34,1.56,.64,1) both;
  text-align:center;
}
.fr-nomatch.show{display:block}
.frnm-ico{font-size:36px;margin-bottom:8px}
.frnm-title{font-family:'Clash Display',sans-serif;font-size:16px;font-weight:700;color:#DC2626;margin-bottom:4px}
.frnm-sub{font-size:12px;color:rgba(220,38,38,.6);font-weight:500}
.frnm-retry{margin-top:12px;padding:11px 24px;border:none;border-radius:14px;background:#DC2626;color:#fff;font-family:'Cabinet Grotesk',sans-serif;font-size:13px;font-weight:800;cursor:pointer;transition:all .3s cubic-bezier(.34,1.56,.64,1);box-shadow:0 4px 14px rgba(220,38,38,.25)}
.frnm-retry:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(220,38,38,.35)}

/* Recognition history */
.fr-hist-item{
  display:flex;align-items:center;gap:11px;
  padding:10px 14px;border-bottom:1.5px solid rgba(20,14,40,.04);
  animation:histIn .4s cubic-bezier(.34,1.56,.64,1) both;
}
.fr-hist-item:last-child{border-bottom:none}
@keyframes histIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.fhi-av{
  width:36px;height:36px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:800;color:#fff;flex-shrink:0;
}
.fhi-name{font-size:13px;font-weight:700;color:var(--ink);flex:1}
.fhi-sub{font-size:10.5px;color:var(--ink3);margin-top:1px}
.fhi-badge{font-size:10px;font-weight:800;padding:3px 9px;border-radius:100px;flex-shrink:0}
.fhi-badge.pickup{background:#EFF6FF;color:#1D4ED8}
.fhi-badge.drop{background:#F5F3FF;color:#5B21B6}
.fhi-time{font-size:10px;color:var(--ink4);font-weight:600;margin-left:4px}

/* Stats bar inside face rec */
.fr-stats-row{display:flex;gap:8px;padding:0 16px 12px}
.fr-stat{
  flex:1;padding:12px 8px;border-radius:18px;
  background:var(--white);border:1.5px solid var(--line);
  box-shadow:var(--s1);text-align:center;
}
.fr-stat-num{font-family:'Clash Display',sans-serif;font-size:22px;font-weight:700;letter-spacing:-1px;line-height:1}
.fr-stat-lbl{font-size:9.5px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.4px;margin-top:4px}

/* Pulse ring animation for confirmed match */
.fr-match-ring{
  position:absolute;inset:-6px;border-radius:22px;
  border:3px solid rgba(34,197,94,.5);pointer-events:none;
  animation:matchRing 1.5s ease-out 3 both;
}
@keyframes matchRing{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.06)}}

/* Wave effect for scanning state */
@keyframes cameraWave{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}

/* Section label inside camera */
.fr-cam-label{
  position:absolute;bottom:52px;left:50%;transform:translateX(-50%);
  z-index:12;font-size:10.5px;font-weight:700;color:rgba(255,255,255,.55);
  letter-spacing:.4px;text-align:center;white-space:nowrap;
  pointer-events:none;
}

/* Animated face mesh lines */
.fr-mesh-line{
  position:absolute;background:rgba(0,212,170,.15);
  transform-origin:left center;
  pointer-events:none;display:none;
  animation:meshFade 2s ease-in-out infinite;
}
.fr-mesh-line.visible{display:block}
@keyframes meshFade{0%,100%{opacity:.3}50%{opacity:.7}}


/* ── Gradient icon glow system ── */
.ic svg{display:block;flex-shrink:0;transition:filter .35s,transform .4s cubic-bezier(.34,1.56,.64,1)}
.nb .nb-i .ic svg{transition:transform .4s cubic-bezier(.34,1.56,.64,1),filter .3s}
.nb.sel .nb-i .ic svg{transform:scale(1.18);filter:drop-shadow(0 0 6px rgba(255,255,255,.4))}
.nb:hover .nb-i .ic svg{transform:scale(1.1);filter:drop-shadow(0 0 4px rgba(255,255,255,.3))}
.act .a-ico .ic svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1),filter .3s}
.act:hover .a-ico .ic svg{transform:scale(1.28) rotate(-10deg);filter:drop-shadow(0 0 8px rgba(100,200,255,.4))}
.tile .t-ico .ic svg{animation:tileFloat 3s ease-in-out infinite;filter:drop-shadow(0 2px 6px rgba(0,0,0,.15))}
.mod .mod-ico .ic svg{transition:transform .4s cubic-bezier(.34,1.56,.64,1),filter .3s}
.mod:hover .mod-ico .ic svg{transform:scale(1.3) rotate(-12deg);filter:drop-shadow(0 0 10px rgba(150,100,255,.4))}
.tbar-btn .ic svg{transition:transform .3s cubic-bezier(.34,1.56,.64,1),filter .3s}
.tbar-btn:hover .ic svg{transform:scale(1.2) rotate(-8deg);filter:drop-shadow(0 0 6px rgba(255,180,100,.4))}
.rc-ico .ic svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1),filter .35s}
.role-card:hover .rc-ico .ic svg,.role-card.active .rc-ico .ic svg{transform:scale(1.18) rotate(-6deg);filter:drop-shadow(0 0 10px rgba(100,200,255,.5))}
.logo-mark .ic svg{filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))}
.sos-ico .ic svg{animation:sosBounce 2s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(255,68,68,.6))}
.fr-scan-btn .fr-scan-btn-ico .ic svg{filter:drop-shadow(0 0 8px rgba(0,212,170,.4))}
.fr-scan-btn.scanning .fr-scan-btn-ico .ic svg{animation:icoSpin 2s linear infinite;filter:drop-shadow(0 0 12px rgba(0,212,170,.7))}
/* Module grid background pads */
.mod-ico{border-radius:12px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;transition:all .4s cubic-bezier(.34,1.56,.64,1)}
.mod:hover .mod-ico{transform:scale(1.12)}
/* Tile icon glow on hover */
.tile:hover .t-ico .ic svg{filter:drop-shadow(0 0 8px rgba(100,200,255,.5))}
/* Action grid glow */
.act .a-ico{border-radius:14px;width:46px;height:46px;display:flex;align-items:center;justify-content:center;margin:0 auto 5px;transition:all .4s}
/* Nav icon container */
.nb-i{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;margin:0 auto 2px;transition:all .35s}
.nb.sel .nb-i{background:rgba(255,255,255,.12)}


/* ── Gradient icon background containers ── */
.a-ico{
  background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03));
  border:1px solid rgba(255,255,255,.08);
}
.act:nth-child(1) .a-ico{background:linear-gradient(135deg,rgba(78,205,196,.15),rgba(68,207,108,.08));border-color:rgba(78,205,196,.2)}
.act:nth-child(2) .a-ico{background:linear-gradient(135deg,rgba(167,139,250,.15),rgba(96,165,250,.08));border-color:rgba(167,139,250,.2)}
.act:nth-child(3) .a-ico{background:linear-gradient(135deg,rgba(251,146,60,.15),rgba(251,191,36,.08));border-color:rgba(251,146,60,.2)}
.act:nth-child(4) .a-ico{background:linear-gradient(135deg,rgba(56,189,248,.15),rgba(129,140,248,.08));border-color:rgba(56,189,248,.2)}
.act:nth-child(5) .a-ico{background:linear-gradient(135deg,rgba(244,114,182,.15),rgba(251,146,60,.08));border-color:rgba(244,114,182,.2)}
.act:nth-child(6) .a-ico{background:linear-gradient(135deg,rgba(78,205,196,.15),rgba(56,189,248,.08));border-color:rgba(56,189,248,.2)}
.act:nth-child(7) .a-ico{background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(249,115,22,.08));border-color:rgba(251,191,36,.2)}
.act:nth-child(8) .a-ico{background:linear-gradient(135deg,rgba(129,140,248,.15),rgba(192,132,252,.08));border-color:rgba(192,132,252,.2)}

/* Module icon background pads with per-module colors */
.mod:nth-child(1) .mod-ico{background:linear-gradient(135deg,rgba(248,113,113,.15),rgba(251,146,60,.08))}
.mod:nth-child(2) .mod-ico{background:linear-gradient(135deg,rgba(96,165,250,.15),rgba(129,140,248,.08))}
.mod:nth-child(3) .mod-ico{background:linear-gradient(135deg,rgba(74,222,128,.15),rgba(34,211,238,.08))}
.mod:nth-child(4) .mod-ico{background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(249,115,22,.08))}
.mod:nth-child(5) .mod-ico{background:linear-gradient(135deg,rgba(192,132,252,.15),rgba(129,140,248,.08))}
.mod:nth-child(6) .mod-ico{background:linear-gradient(135deg,rgba(56,189,248,.15),rgba(78,205,196,.08))}
.mod:nth-child(7) .mod-ico{background:linear-gradient(135deg,rgba(129,140,248,.15),rgba(192,132,252,.08))}
.mod:nth-child(8) .mod-ico{background:linear-gradient(135deg,rgba(244,114,182,.15),rgba(251,113,113,.08))}
.mod:nth-child(9) .mod-ico{background:linear-gradient(135deg,rgba(52,211,153,.15),rgba(5,150,105,.08))}
.mod:nth-child(10) .mod-ico{background:linear-gradient(135deg,rgba(251,146,60,.15),rgba(251,191,36,.08))}
.mod:nth-child(11) .mod-ico{background:linear-gradient(135deg,rgba(167,139,250,.15),rgba(96,165,250,.08))}
.mod:nth-child(12) .mod-ico{background:linear-gradient(135deg,rgba(56,189,248,.15),rgba(129,140,248,.08))}

/* Nav icon active glow rings */
.nb.sel .nb-i{
  background:linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.06));
  box-shadow:0 0 0 1px rgba(255,255,255,.12),0 2px 8px rgba(0,0,0,.15);
}

/* Stat tile icon backgrounds */
.tile .t-ico{
  display:flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:12px;margin:0 auto 6px;
  background:linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.04));
}

/* Tbar btn icons */
.tbar-btn{display:flex;align-items:center;justify-content:center}

/* SOS glow pulse */
.sos-ico{display:flex;align-items:center;justify-content:center}
.sos-ico .ic svg{
  filter:drop-shadow(0 0 8px rgba(255,68,68,.5));
  animation:sosBounce 2s ease-in-out infinite;
}

/* Face scan btn icon */
#fr-scan-btn .fr-scan-btn-ico{display:flex;align-items:center;justify-content:center}

/* Check mini icons */
.pchk.on{display:flex!important;align-items:center!important;justify-content:center!important}
.rs-dot{display:flex!important;align-items:center!important;justify-content:center!important}

/* ── Legacy override ── */
.ic svg{display:block;flex-shrink:0}
.nb-i .ic svg{transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.nb.sel .nb-i .ic svg{transform:scale(1.2)}
.act .a-ico .ic svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.act:hover .a-ico .ic svg{transform:scale(1.25) rotate(-8deg)}
.tile .t-ico .ic svg{animation:tileFloat 3s ease-in-out infinite}
.mod .mod-ico .ic svg{transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.mod:hover .mod-ico .ic svg{transform:scale(1.3) rotate(-10deg)}
.tbar-btn .ic svg{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.tbar-btn:hover .ic svg{transform:scale(1.15) rotate(-8deg)}
.rc-ico .ic svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.role-card:hover .rc-ico .ic svg,.role-card.active .rc-ico .ic svg{transform:scale(1.15) rotate(-6deg)}
.logo-mark .ic svg{filter:drop-shadow(0 1px 3px rgba(0,0,0,.3))}
.sos-ico .ic svg{animation:sosBounce 2s ease-in-out infinite}
.fr-scan-btn-ico .ic svg{transition:transform .5s}
.fr-scan-btn.scanning .fr-scan-btn-ico .ic svg{animation:icoSpin 2s linear infinite}

/* ── TRANSPORT MANAGER ROLE CARD ── */
.tm-card::after{background:var(--tm-grad)}
.role-card.active.tm-card{border-color:rgba(4,120,87,.25);background:linear-gradient(135deg,rgba(4,120,87,.06),rgba(217,119,6,.04))}
.role-card.active.tm-card .rc-indicator{background:var(--tm-a);box-shadow:0 0 0 4px rgba(4,120,87,.18),0 0 12px rgba(5,150,105,.35)}

/* ── TM SHELL ── */
#tm-shell{display:none;align-items:center;justify-content:center;min-height:100vh;padding:28px;gap:36px;flex-wrap:wrap;position:relative;z-index:1}
#tm-phone{--role-a:var(--tm-a);--role-b:var(--tm-b)}
.fleet-hero{margin:0 16px 14px;border-radius:20px;background:var(--tm-grad);padding:20px;position:relative;overflow:hidden;color:#fff}
.fh-row{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1}
.fh-badge{background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.3);border-radius:100px;padding:4px 12px;font-size:10px;font-weight:800;color:#fff;letter-spacing:.5px}
.fh-num{font-family:'Cabinet Grotesk',sans-serif;font-size:44px;font-weight:900;line-height:1;color:#fff;margin:10px 0 2px}
.fh-sub{font-size:12px;color:rgba(255,255,255,.75);font-weight:600}
.fh-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.2);position:relative;z-index:1}
.fh-stat{text-align:center}
.fh-stat-val{font-family:'Cabinet Grotesk',sans-serif;font-size:20px;font-weight:900;color:#fff}
.fh-stat-lbl{font-size:9.5px;color:rgba(255,255,255,.7);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
.vcard{background:var(--white);border-radius:16px;border:1.5px solid var(--line);padding:14px 16px;margin:0 16px 10px}
.vcard-row{display:flex;align-items:center;gap:10px}
.vcard-ico{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--tm-soft);flex-shrink:0}
.vcard-num{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:var(--ink);letter-spacing:.5px}
.vcard-route{font-size:11px;color:var(--ink3);font-weight:600;margin-top:1px}
.vstatus{display:flex;align-items:center;gap:5px;margin-left:auto;flex-shrink:0}
.vstatus-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.vstatus-dot.on-route{background:#10b981;box-shadow:0 0 5px rgba(16,185,129,.6);animation:lp 1.2s infinite}
.vstatus-dot.parked{background:#94a3b8}
.vstatus-dot.maintenance{background:#f59e0b;animation:lp 1.2s infinite}
.vstatus-label{font-size:11px;font-weight:700}
.vstatus-label.on-route{color:#047857}
.vstatus-label.parked{color:#64748b}
.vstatus-label.maintenance{color:#d97706}
.vcard-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.vchip{background:var(--mist);border-radius:100px;padding:3px 10px;font-size:11px;font-weight:600;color:var(--ink3)}
.vcard-fuel{margin-top:8px}
.vfuel-label{display:flex;justify-content:space-between;font-size:10.5px;font-weight:700;color:var(--ink3);margin-bottom:4px}
.vfuel-track{height:5px;background:var(--mist);border-radius:100px;overflow:hidden}
.vfuel-fill{height:100%;border-radius:100px;transition:width .8s cubic-bezier(.34,1.56,.64,1)}
.vcard-driver{display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}
.vdrv-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;flex-shrink:0}
.vdrv-info{flex:1}
.vdrv-name{font-size:12px;font-weight:700;color:var(--ink)}
.vdrv-role{font-size:10.5px;color:var(--ink3);font-weight:600}
.vdrv-btns{display:flex;gap:6px}
.vdrv-btn{background:var(--tm-soft);color:var(--tm-a);border:1.5px solid rgba(4,120,87,.2);border-radius:8px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .15s}
.vdrv-btn:active{background:rgba(4,120,87,.15)}
.drow{display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--line);cursor:pointer;transition:background .15s}
.drow:last-child{border-bottom:none}
.drow:active{background:var(--mist)}
.drow-av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cabinet Grotesk',sans-serif;font-size:13px;font-weight:800;color:#fff;flex-shrink:0}
.drow-name{font-size:13.5px;font-weight:700;color:var(--ink)}
.drow-sub{font-size:11px;color:var(--ink3);font-weight:600;margin-top:1px}
.drow-badge{margin-left:auto;font-size:10px;font-weight:800;padding:3px 9px;border-radius:100px;flex-shrink:0}
.drow-badge.driver-b{background:var(--tm-soft);color:var(--tm-a);border:1.5px solid rgba(4,120,87,.2)}
.drow-badge.asst-b{background:#FFFBEB;color:#92400E;border:1.5px solid rgba(217,119,6,.2)}
.drow-badge.off-b{background:var(--mist);color:var(--ink3);border:1.5px solid var(--line)}
.rtcard{background:var(--white);border-radius:16px;border:1.5px solid var(--line);padding:14px 16px;margin:0 16px 10px}
.rtcard-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.rtcard-ico{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rtcard-name{font-family:'Cabinet Grotesk',sans-serif;font-size:14px;font-weight:800;color:var(--ink)}
.rtcard-sub{font-size:11px;color:var(--ink3);font-weight:600;margin-top:1px}
.rtcard-stops{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.stop-pill{background:var(--mist);border-radius:100px;padding:3px 10px;font-size:11px;font-weight:600;color:var(--ink3)}
.stop-pill.current{background:rgba(4,120,87,.12);color:var(--tm-a);font-weight:700}
.rtcard-progress{margin-top:10px;display:flex;align-items:center;gap:8px}
.rt-pbar{flex:1;height:6px;background:var(--mist);border-radius:100px;overflow:hidden}
.rt-pbar-fill{height:100%;background:var(--tm-grad);border-radius:100px;transition:width .8s}
.rt-pct{font-size:11px;font-weight:800;color:var(--tm-a)}
.fee-row{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--line);cursor:pointer}
.fee-row:last-child{border-bottom:none}
.fee-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0}
.fee-name{font-size:13px;font-weight:700;color:var(--ink)}
.fee-sub{font-size:11px;color:var(--ink3);font-weight:600;margin-top:1px}
.fee-amount{margin-left:auto;text-align:right}
.fee-val{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:var(--ink)}
.fee-badge{font-size:10px;font-weight:800;padding:2px 7px;border-radius:100px;margin-top:2px;display:inline-block}
.fee-badge.paid{background:#DCFCE7;color:#166534}
.fee-badge.due{background:#FEF2F2;color:#991B1B}
.fee-badge.partial{background:#FFFBEB;color:#92400E}
.asst-hero{margin:14px 16px;border-radius:20px;background:var(--d-grad);padding:18px;color:#fff}
.asst-role-tag{background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.3);border-radius:100px;padding:4px 12px;font-size:10px;font-weight:800;display:inline-block;margin-bottom:10px}
.asst-busnum{font-family:'DM Mono',monospace;font-size:22px;font-weight:500;color:#fff}
.asst-route{font-size:12px;color:rgba(255,255,255,.75);font-weight:600;margin-top:2px}
.asst-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.2)}
.asst-stat-val{font-family:'Cabinet Grotesk',sans-serif;font-size:22px;font-weight:900;color:#fff}
.asst-stat-lbl{font-size:9.5px;color:rgba(255,255,255,.7);font-weight:700;text-transform:uppercase;letter-spacing:.4px}
.drole-toggle{display:flex;gap:4px;padding:8px 16px 0;flex-shrink:0}
.drole-btn{flex:1;padding:7px 4px;border-radius:10px;border:1.5px solid var(--line);background:var(--white);font-size:10.5px;font-weight:700;color:var(--ink3);cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .2s;text-align:center}
.drole-btn.dm-active{background:var(--d-soft);color:var(--d-a);border-color:rgba(0,107,255,.25)}
.drole-btn.am-active{background:#FFFBEB;color:#D97706;border-color:rgba(217,119,6,.25)}
.drole-btn.tm-active{background:var(--tm-soft);color:var(--tm-a);border-color:rgba(4,120,87,.25)}

/* Chat tab overrides the .screen scroll */
#d-t-chat.on{display:flex;flex-direction:column;height:100%;overflow:hidden}
#d-t-chat .chat-view.hidden{display:none!important}



/* ── Chat outer container ── */
#d-t-chat{flex-direction:column;padding:0;overflow:hidden}
.chat-view{display:flex;flex-direction:column;flex:1;overflow:hidden}
.chat-view.hidden{display:none!important}

/* ── Inbox list view ── */
.chat-inbox{display:flex;flex-direction:column;flex:1;overflow:hidden}
.chat-inbox-header{padding:14px 16px 8px;flex-shrink:0}
.chat-search-bar{display:flex;align-items:center;gap:8px;background:var(--mist);border:1.5px solid var(--line);border-radius:14px;padding:9px 14px;margin:0 16px 10px;flex-shrink:0}
.chat-search-bar input{flex:1;border:none;background:transparent;font-family:'Satoshi',sans-serif;font-size:13px;color:var(--ink);outline:none}
.chat-search-bar input::placeholder{color:var(--ink4)}

/* Tab filter row */
.chat-filter-row{display:flex;gap:6px;padding:0 16px 10px;flex-shrink:0;overflow-x:auto;scrollbar-width:none}
.chat-filter-row::-webkit-scrollbar{display:none}
.chat-filter-btn{white-space:nowrap;padding:6px 14px;border-radius:100px;border:1.5px solid var(--line);background:var(--white);font-size:11.5px;font-weight:700;color:var(--ink3);cursor:pointer;font-family:'Satoshi',sans-serif;transition:all .2s;flex-shrink:0}
.chat-filter-btn.active{background:var(--t-soft);color:var(--t-a);border-color:rgba(255,87,51,.25);box-shadow:0 2px 8px rgba(255,87,51,.12)}

/* Pinned section */
.chat-section-lbl{padding:6px 16px 4px;font-size:10px;font-weight:800;color:var(--ink4);text-transform:uppercase;letter-spacing:.7px;flex-shrink:0}

/* Conversation rows */
.chat-list{flex:1;overflow-y:auto;padding-bottom:8px}
.chat-list::-webkit-scrollbar{width:3px}
.chat-list::-webkit-scrollbar-thumb{background:var(--line);border-radius:10px}

.conv-row{display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;transition:background .15s;position:relative}
.conv-row:active{background:var(--mist)}
.conv-row::after{content:'';position:absolute;bottom:0;left:68px;right:16px;height:1px;background:var(--line)}
.conv-row:last-child::after{display:none}

.conv-av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cabinet Grotesk',sans-serif;font-size:14px;font-weight:800;color:#fff;flex-shrink:0;position:relative}
.conv-av-badge{position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-radius:50%;border:2px solid var(--white);display:flex;align-items:center;justify-content:center;font-size:7px}
.conv-av-group{border-radius:14px}

.conv-body{flex:1;min-width:0}
.conv-top-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
.conv-name{font-size:13.5px;font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.conv-time{font-size:10.5px;font-weight:600;color:var(--ink4);flex-shrink:0}
.conv-preview{font-size:12px;color:var(--ink3);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:4px}
.conv-preview.unread{color:var(--ink2);font-weight:700}
.conv-preview-you{font-size:11px;color:var(--t-a);font-weight:700;flex-shrink:0}
.conv-unread{background:var(--t-a);color:#fff;border-radius:100px;padding:2px 7px;font-size:10px;font-weight:800;flex-shrink:0;margin-left:4px;box-shadow:0 2px 6px rgba(255,87,51,.3)}
.conv-pinned-dot{width:6px;height:6px;border-radius:50%;background:var(--t-a);margin-left:4px;flex-shrink:0}

/* ── Thread / conversation detail view ── */
.chat-thread{display:flex;flex-direction:column;flex:1;overflow:hidden}

/* Thread header */
.thread-header{display:flex;align-items:center;gap:10px;padding:12px 14px 10px;border-bottom:1.5px solid var(--line);flex-shrink:0;background:var(--white)}
.thread-back{width:34px;height:34px;border-radius:12px;background:var(--mist);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s}
.thread-back:active{background:var(--t-soft);color:var(--t-a)}
.thread-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cabinet Grotesk',sans-serif;font-size:12px;font-weight:800;color:#fff;flex-shrink:0}
.thread-av-group{border-radius:12px}
.thread-name{font-size:14px;font-weight:800;color:var(--ink);flex:1}
.thread-sub{font-size:11px;color:var(--ink3);font-weight:600;margin-top:1px}
.thread-status{display:flex;align-items:center;gap:4px}
.thread-online-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 5px rgba(34,197,94,.5)}
.thread-status-txt{font-size:10.5px;font-weight:700;color:#16a34a}
.thread-actions{display:flex;gap:6px}
.thread-action-btn{width:32px;height:32px;border-radius:10px;background:var(--mist);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.thread-action-btn:active{background:var(--t-soft)}

/* Messages area */
.thread-messages{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:10px}
.thread-messages::-webkit-scrollbar{width:3px}
.thread-messages::-webkit-scrollbar-thumb{background:var(--line);border-radius:10px}

/* Date divider */
.msg-date-divider{text-align:center;margin:6px 0}
.msg-date-divider span{background:var(--mist);border:1.5px solid var(--line);color:var(--ink3);font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px}

/* Message bubbles */
.msg-row{display:flex;align-items:flex-end;gap:8px}
.msg-row.sent{flex-direction:row-reverse}
.msg-row.sent .msg-av{display:none}

.msg-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cabinet Grotesk',sans-serif;font-size:9px;font-weight:800;color:#fff;flex-shrink:0;align-self:flex-end}

.msg-bubble-group{display:flex;flex-direction:column;gap:2px;max-width:78%}
.msg-row.sent .msg-bubble-group{align-items:flex-end}

.msg-bubble{padding:10px 14px;border-radius:18px;font-size:13px;font-weight:500;line-height:1.45;color:var(--ink);background:var(--white);border:1.5px solid var(--line);position:relative}
.msg-row.sent .msg-bubble{background:var(--t-grad);color:#fff;border:none;box-shadow:0 4px 14px rgba(255,87,51,.25)}
.msg-bubble.first{border-top-left-radius:18px}
.msg-bubble.last-recv{border-bottom-left-radius:6px}
.msg-bubble.last-sent{border-bottom-right-radius:6px}

/* Bubble meta */
.msg-meta{display:flex;align-items:center;gap:5px;margin-top:3px}
.msg-row.sent .msg-meta{flex-direction:row-reverse}
.msg-time{font-size:10px;font-weight:600;color:var(--ink4)}
.msg-row.sent .msg-time{color:rgba(255,87,51,.6)}
.msg-read{display:flex;align-items:center}

/* Typing indicator */
.typing-indicator{display:flex;align-items:center;gap:8px;padding:4px 0}
.typing-av{width:26px;height:26px;border-radius:50%;font-family:'Cabinet Grotesk',sans-serif;font-size:9px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center}
.typing-bubble{background:var(--white);border:1.5px solid var(--line);border-radius:18px;padding:10px 14px;display:flex;align-items:center;gap:4px}
.typing-dot{width:7px;height:7px;border-radius:50%;background:var(--ink4);animation:typingBounce 1.2s infinite}
.typing-dot:nth-child(2){animation-delay:.2s}
.typing-dot:nth-child(3){animation-delay:.4s}
@keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

/* Quoted/reply preview */
.msg-reply-ref{background:rgba(255,87,51,.06);border-left:3px solid var(--t-a);border-radius:8px 8px 0 0;padding:6px 10px;margin-bottom:0;font-size:11px;font-weight:600;color:var(--t-a);border-bottom-left-radius:0;border-bottom-right-radius:0}
.msg-reply-ref + .msg-bubble{border-top-left-radius:0;border-top-right-radius:0;margin-top:-2px}

/* Announcement bubble */
.msg-announce{background:linear-gradient(135deg,rgba(255,87,51,.06),rgba(255,0,110,.04));border:1.5px solid rgba(255,87,51,.15);border-radius:16px;padding:12px 14px;margin:4px 0}
.msg-announce-label{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--t-a);margin-bottom:5px}
.msg-announce-text{font-size:12.5px;font-weight:600;color:var(--ink)}

/* Attachment bubble */
.msg-attach{display:flex;align-items:center;gap:10px;background:var(--mist);border:1.5px solid var(--line);border-radius:14px;padding:10px 14px}
.msg-attach-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.msg-attach-name{font-size:12px;font-weight:700;color:var(--ink)}
.msg-attach-size{font-size:10.5px;color:var(--ink3);font-weight:600;margin-top:1px}

/* Composer */
.thread-composer{background:var(--white);border-top:1.5px solid var(--line);padding:10px 12px;flex-shrink:0}
.composer-reply-bar{display:flex;align-items:center;gap:8px;background:rgba(255,87,51,.06);border:1.5px solid rgba(255,87,51,.15);border-radius:10px;padding:7px 12px;margin-bottom:8px}
.crb-text{flex:1;font-size:11.5px;font-weight:600;color:var(--ink2)}
.crb-close{width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink4)}
.composer-row{display:flex;align-items:flex-end;gap:8px}
.composer-attach-btn{width:36px;height:36px;border-radius:12px;background:var(--mist);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s}
.composer-attach-btn:active{background:var(--t-soft)}
.composer-input-wrap{flex:1;background:var(--mist);border:1.5px solid var(--line);border-radius:20px;padding:9px 14px;display:flex;align-items:center;gap:8px;transition:border-color .2s}
.composer-input-wrap:focus-within{border-color:rgba(255,87,51,.35);background:var(--white);box-shadow:0 0 0 3px rgba(255,87,51,.08)}
.composer-input{flex:1;border:none;background:transparent;font-family:'Satoshi',sans-serif;font-size:13px;color:var(--ink);outline:none;resize:none;line-height:1.4;max-height:80px;overflow-y:auto}
.composer-input::placeholder{color:var(--ink4)}
.composer-emoji-btn{color:var(--ink4);cursor:pointer;font-size:16px;flex-shrink:0;transition:transform .2s}
.composer-emoji-btn:hover{transform:scale(1.2)}
.composer-send-btn{width:38px;height:38px;border-radius:50%;background:var(--t-grad);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;box-shadow:0 4px 12px rgba(255,87,51,.3);transition:all .2s}
.composer-send-btn:active{transform:scale(.93)}
.composer-send-btn.empty{background:var(--mist);box-shadow:none}
.composer-send-btn.empty svg{opacity:.4}

/* Broadcast composer */
.broadcast-bar{background:linear-gradient(135deg,rgba(255,87,51,.06),rgba(255,0,110,.04));border:1.5px solid rgba(255,87,51,.15);border-radius:14px;padding:12px 14px;margin:0 14px 10px}
.bb-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--t-a);margin-bottom:6px}
.bb-input{width:100%;border:none;background:transparent;font-family:'Satoshi',sans-serif;font-size:13px;color:var(--ink);outline:none;resize:none;line-height:1.4}
.bb-input::placeholder{color:var(--ink4)}
.bb-footer{display:flex;align-items:center;justify-content:space-between;margin-top:8px}
.bb-target{font-size:11px;font-weight:700;color:var(--ink3)}
.bb-send-btn{background:var(--t-grad);color:#fff;border:none;border-radius:10px;padding:7px 16px;font-size:12px;font-weight:800;cursor:pointer;font-family:'Satoshi',sans-serif;box-shadow:0 3px 10px rgba(255,87,51,.25)}

/* ══════════════════════════════════════
   EMOJI PICKER
══════════════════════════════════════ */
#emoji-picker{
  position:absolute;
  bottom:68px;
  left:10px;
  right:10px;
  background:var(--white);
  border:1.5px solid var(--line);
  border-radius:20px;
  box-shadow:0 8px 32px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.08);
  z-index:999;
  display:none;
  flex-direction:column;
  overflow:hidden;
  max-height:260px;
  animation:epIn .18s cubic-bezier(.34,1.56,.64,1);
}
@keyframes epIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
#emoji-picker.open{display:flex}

.ep-tabs{display:flex;gap:0;border-bottom:1.5px solid var(--line);padding:0 4px;flex-shrink:0;overflow-x:auto;scrollbar-width:none}
.ep-tabs::-webkit-scrollbar{display:none}
.ep-tab{padding:9px 10px;font-size:17px;cursor:pointer;border-radius:10px 10px 0 0;transition:background .15s;flex-shrink:0;line-height:1}
.ep-tab.active{background:var(--t-soft)}
.ep-tab:active{background:var(--t-soft)}

.ep-search-wrap{padding:8px 10px 4px;flex-shrink:0}
.ep-search{width:100%;box-sizing:border-box;border:1.5px solid var(--line);border-radius:10px;padding:6px 12px;font-family:'Satoshi',sans-serif;font-size:12px;color:var(--ink);background:var(--mist);outline:none;transition:border-color .2s}
.ep-search:focus{border-color:rgba(255,87,51,.35);background:var(--white)}

.ep-grid-wrap{flex:1;overflow-y:auto;padding:4px 6px 8px}
.ep-grid-wrap::-webkit-scrollbar{width:3px}
.ep-grid-wrap::-webkit-scrollbar-thumb{background:var(--line);border-radius:10px}
.ep-category-lbl{font-size:9.5px;font-weight:800;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px;padding:4px 4px 2px;margin-top:2px}
.ep-grid{display:flex;flex-wrap:wrap;gap:2px}
.ep-emoji{width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;border-radius:10px;cursor:pointer;transition:background .12s,transform .12s;line-height:1;user-select:none}
.ep-emoji:hover{background:var(--t-soft);transform:scale(1.25)}
.ep-emoji:active{transform:scale(1.1);background:rgba(255,87,51,.2)}

/* Recent row */
.ep-recent-strip{display:flex;gap:2px;padding:6px 6px 2px;flex-shrink:0;flex-wrap:wrap}

/* ══════════════════════════════════════
   PROFILE PAGE — ALL ROLES
══════════════════════════════════════ */

/* Overlay sits inside .phone via JS append, uses absolute */
#profile-overlay{
  position:absolute;
  inset:0;
  border-radius:47px;
  z-index:500;
  display:none;
  align-items:flex-end;
  justify-content:center;
  background:rgba(0,0,0,.45);
  backdrop-filter:blur(4px);
  -webkit-backdrop-filter:blur(4px);
  overflow:hidden;
}
#profile-overlay.open{display:flex;animation:profFadeIn .22s ease}
@keyframes profFadeIn{from{opacity:0}to{opacity:1}}

#profile-sheet{
  width:100%;
  max-height:88%;
  background:var(--white);
  border-radius:26px 26px 0 0;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  animation:profSlideUp .32s cubic-bezier(.34,1.3,.64,1);
}
@keyframes profSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}

/* Handle */
.prof-handle{width:36px;height:4px;border-radius:100px;background:var(--line);margin:10px auto 0;flex-shrink:0}

/* Scrollable body */
.prof-scroll{flex:1;overflow-y:auto;padding-bottom:24px}
.prof-scroll::-webkit-scrollbar{width:3px}
.prof-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:10px}

/* Hero cover */
.prof-hero{
  position:relative;
  height:130px;
  flex-shrink:0;
  overflow:visible;
}
.prof-cover{
  position:absolute;
  inset:0;
  background:var(--prof-grad,linear-gradient(135deg,#FF5733,#FF006E));
}
.prof-cover-mesh{
  position:absolute;inset:0;
  background-image:radial-gradient(circle at 20% 50%,rgba(255,255,255,.12) 0%,transparent 60%),radial-gradient(circle at 80% 20%,rgba(255,255,255,.08) 0%,transparent 50%);
}
.prof-close-btn{
  position:absolute;top:14px;right:16px;
  width:32px;height:32px;border-radius:50%;
  background:rgba(255,255,255,.2);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:#fff;font-size:15px;font-weight:700;
  backdrop-filter:blur(6px);
  transition:background .15s;
  z-index:2;
}
.prof-close-btn:active{background:rgba(255,255,255,.35)}

/* Avatar */
.prof-av-wrap{
  position:absolute;
  bottom:-36px;
  left:22px;
  z-index:3;
}
.prof-av{
  width:74px;height:74px;border-radius:50%;
  border:3.5px solid var(--white);
  display:flex;align-items:center;justify-content:center;
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:26px;font-weight:900;color:#fff;
  box-shadow:0 6px 20px rgba(0,0,0,.18);
  background:var(--prof-grad);
  position:relative;
}
.prof-av-online{
  position:absolute;bottom:3px;right:3px;
  width:14px;height:14px;border-radius:50%;
  background:#22c55e;border:2.5px solid var(--white);
  box-shadow:0 0 6px rgba(34,197,94,.5);
}

/* Name row */
.prof-name-row{
  padding:48px 22px 0;
  display:flex;align-items:flex-end;justify-content:space-between;
}
.prof-name{
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:22px;font-weight:900;color:var(--ink);letter-spacing:-.6px;
}
.prof-role-badge{
  padding:5px 12px;border-radius:100px;
  font-size:11px;font-weight:800;
  color:var(--prof-a);
  background:var(--prof-soft,rgba(255,87,51,.08));
  border:1.5px solid var(--prof-border,rgba(255,87,51,.2));
  white-space:nowrap;
}

.prof-sub{
  padding:3px 22px 0;
  font-size:12.5px;font-weight:600;color:var(--ink3);
  display:flex;align-items:center;gap:6px;
}
.prof-online-pill{
  display:inline-flex;align-items:center;gap:4px;
  background:#DCFCE7;color:#16a34a;
  border-radius:100px;padding:2px 8px;
  font-size:10.5px;font-weight:800;
}
.prof-online-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:lp 1.2s infinite}

/* Stats row */
.prof-stats{
  display:flex;gap:0;margin:16px 22px 0;
  background:var(--mist);border:1.5px solid var(--line);
  border-radius:16px;overflow:hidden;
}
.prof-stat{
  flex:1;text-align:center;padding:12px 8px;
  border-right:1.5px solid var(--line);
}
.prof-stat:last-child{border-right:none}
.prof-stat-num{
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:20px;font-weight:900;color:#FF5733;
  letter-spacing:-.5px;
}
.prof-stat-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px;margin-top:1px}

/* Section headers */
.prof-sec{padding:18px 22px 8px;display:flex;align-items:center;gap:8px}
.prof-sec-ico{width:28px;height:28px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.prof-sec-lbl{font-family:'Cabinet Grotesk',sans-serif;font-size:14px;font-weight:800;color:var(--ink);letter-spacing:-.2px}

/* Info rows */
.prof-info-card{margin:0 16px;background:var(--white);border:1.5px solid var(--line);border-radius:18px;overflow:hidden}
.prof-info-row{display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1.5px solid var(--line)}
.prof-info-row:last-child{border-bottom:none}
.prof-info-ico{width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
.prof-info-body{flex:1}
.prof-info-label{font-size:10.5px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:1px}
.prof-info-val{font-size:13.5px;font-weight:700;color:var(--ink)}
.prof-info-copy{width:28px;height:28px;border-radius:9px;background:var(--mist);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s}
.prof-info-copy:active{background:var(--prof-soft);transform:scale(.93)}

/* Settings toggles */
.prof-toggle-card{margin:0 16px;background:var(--white);border:1.5px solid var(--line);border-radius:18px;overflow:hidden}
.prof-toggle-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1.5px solid var(--line);cursor:pointer}
.prof-toggle-row:last-child{border-bottom:none}
.prof-toggle-ico{width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
.prof-toggle-body{flex:1}
.prof-toggle-name{font-size:13.5px;font-weight:700;color:var(--ink)}
.prof-toggle-sub{font-size:11px;font-weight:600;color:var(--ink4);margin-top:1px}
/* Toggle switch */
.prof-switch{width:44px;height:24px;border-radius:100px;background:var(--line);position:relative;flex-shrink:0;transition:background .22s;cursor:pointer}
.prof-switch.on{background:var(--prof-a)}
.prof-switch::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.18);transition:transform .22s cubic-bezier(.34,1.56,.64,1)}
.prof-switch.on::after{transform:translateX(20px)}
/* Chevron link row */
.prof-link-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1.5px solid var(--line);cursor:pointer;transition:background .15s}
.prof-link-row:last-child{border-bottom:none}
.prof-link-row:active{background:var(--mist)}
.prof-link-ico{width:34px;height:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
.prof-link-body{flex:1}
.prof-link-name{font-size:13.5px;font-weight:700;color:var(--ink)}
.prof-link-sub{font-size:11px;font-weight:600;color:var(--ink4);margin-top:1px}
.prof-link-chevron{color:var(--ink4)}

/* Permissions chips */
.prof-perms{display:flex;flex-wrap:wrap;gap:6px;padding:0 22px 4px}
.prof-perm-chip{
  padding:5px 12px;border-radius:100px;
  font-size:11px;font-weight:700;
  background:var(--mist);color:var(--ink2);
  border:1.5px solid var(--line);
  display:flex;align-items:center;gap:5px;
}
.prof-perm-chip.active{
  background:var(--prof-soft);color:var(--prof-a);
  border-color:var(--prof-border);
}
.prof-perm-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}

/* Logout button */
.prof-logout-btn{
  margin:16px 16px 0;
  width:calc(100% - 32px);
  padding:14px;
  border-radius:16px;
  border:1.5px solid rgba(220,38,38,.25);
  background:#FEF2F2;
  color:#dc2626;
  font-family:'Satoshi',sans-serif;
  font-size:14px;font-weight:800;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:all .2s;
}
.prof-logout-btn:active{background:#FEE2E2;transform:scale(.98)}

/* Version tag */
.prof-version{text-align:center;padding:14px;font-size:10.5px;color:var(--ink4);font-weight:600}

</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style={{"position":"absolute","width":"0","height":"0","overflow":"hidden"}} aria-hidden="true">
<defs>
  <linearGradient id="nav-home" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FF6B6B"/><stop offset="100%" stop-color="#FF8E53"/></linearGradient>
  <filter id="glow-nav-home" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-attend" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ECDC4"/><stop offset="100%" stop-color="#44CF6C"/></linearGradient>
  <filter id="glow-nav-attend" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-marks" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient>
  <filter id="glow-nav-marks" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-msgs" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F472B6"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>
  <filter id="glow-nav-msgs" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-profile" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-nav-profile" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-route" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient>
  <filter id="glow-nav-route" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-log" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F472B6"/></linearGradient>
  <filter id="glow-nav-log" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-faceid" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient>
  <filter id="glow-nav-faceid" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-approve" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-nav-approve" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-finance" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-nav-finance" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-reports" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#818CF8"/><stop offset="100%" stop-color="#C084FC"/></linearGradient>
  <filter id="glow-nav-reports" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-settings" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient>
  <filter id="glow-nav-settings" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-attend" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ECDC4"/><stop offset="100%" stop-color="#44CF6C"/></linearGradient>
  <filter id="glow-act-attend" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-marks" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient>
  <filter id="glow-act-marks" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-book" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FB923C"/><stop offset="100%" stop-color="#FBBF24"/></linearGradient>
  <filter id="glow-act-book" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-leave" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-act-leave" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-broad" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F472B6"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>
  <filter id="glow-act-broad" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-chat" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ECDC4"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient>
  <filter id="glow-act-chat" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-cal" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-act-cal" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-chart" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#818CF8"/><stop offset="100%" stop-color="#C084FC"/></linearGradient>
  <filter id="glow-act-chart" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-clock" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F472B6"/><stop offset="100%" stop-color="#FB7185"/></linearGradient>
  <filter id="glow-tile-clock" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-warn" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-tile-warn" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-star" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient>
  <filter id="glow-tile-star" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-users" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#60A5FA"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-tile-users" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-staff" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F472B6"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient>
  <filter id="glow-tile-staff" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-bus" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
  <filter id="glow-tile-bus" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="att-present" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-att-present" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="att-absent" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F87171"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>
  <filter id="glow-att-absent" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="att-leave" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-att-leave" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-adm" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F87171"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>
  <filter id="glow-mod-adm" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-stu" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#60A5FA"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-mod-stu" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-att" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-mod-att" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-fee" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-mod-fee" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-exm" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#C084FC"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-mod-exm" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-par" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#4ECDC4"/></linearGradient>
  <filter id="glow-mod-par" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-ana" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#818CF8"/><stop offset="100%" stop-color="#C084FC"/></linearGradient>
  <filter id="glow-mod-ana" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-tim" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F472B6"/><stop offset="100%" stop-color="#FB7185"/></linearGradient>
  <filter id="glow-mod-tim" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-tra" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
  <filter id="glow-mod-tra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-lib" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FB923C"/><stop offset="100%" stop-color="#FBBF24"/></linearGradient>
  <filter id="glow-mod-lib" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-hr" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#60A5FA"/></linearGradient>
  <filter id="glow-mod-hr" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-hos" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-mod-hos" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-bell" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-drv-bell" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-map" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F87171"/><stop offset="100%" stop-color="#F472B6"/></linearGradient>
  <filter id="glow-drv-map" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-clock" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-drv-clock" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-sos" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FF4444"/><stop offset="100%" stop-color="#FF0080"/></linearGradient>
  <filter id="glow-drv-sos" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="role-teacher" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FF5733"/><stop offset="100%" stop-color="#FF8E53"/></linearGradient>
  <filter id="glow-role-teacher" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="role-driver" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#006BFF"/><stop offset="100%" stop-color="#00D4AA"/></linearGradient>
  <filter id="glow-role-driver" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="role-admin" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FF9500"/><stop offset="100%" stop-color="#FFCC02"/></linearGradient>
  <filter id="glow-role-admin" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="fr-scan" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#00D4AA"/><stop offset="100%" stop-color="#006BFF"/></linearGradient>
  <filter id="glow-fr-scan" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="fr-radar" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient>
  <filter id="glow-fr-radar" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="apr-teacher" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#818CF8"/></linearGradient>
  <filter id="glow-apr-teacher" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="apr-shield" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-apr-shield" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="apr-grad" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-apr-grad" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="logo" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#E0E7FF"/></linearGradient>
  <filter id="glow-logo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="notif" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-notif" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="refresh" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-refresh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="history" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#60A5FA"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient>
  <filter id="glow-history" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="save" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-save" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="sun" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <filter id="glow-sun" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="check-mini" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-check-mini" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="school-top" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#818CF8"/><stop offset="100%" stop-color="#C084FC"/></linearGradient>
  <filter id="glow-school-top" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="bus-top" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#22D3EE"/></linearGradient>
  <filter id="glow-bus-top" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="broadcast" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#F472B6"/><stop offset="100%" stop-color="#FB923C"/></linearGradient>
  <filter id="glow-broadcast" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  
  <linearGradient id="sc-shield" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#2563EB"/></linearGradient>
  <linearGradient id="sc-qr" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient>
  <linearGradient id="sc-face" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#F97316"/></linearGradient>
  <linearGradient id="sc-log" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#0D9488"/></linearGradient>
  <linearGradient id="sc-alert" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#B91C1C"/></linearGradient>
  
  <linearGradient id="tm-bus" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#047857"/><stop offset="100%" stop-color="#059669"/></linearGradient>
  <linearGradient id="tm-fleet" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#D97706"/></linearGradient>
  <linearGradient id="tm-route" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient>
  <linearGradient id="tm-fee" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#D97706"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient>
  <linearGradient id="tm-driver" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#047857"/><stop offset="100%" stop-color="#0D9488"/></linearGradient>
</defs>
</svg>
<div className="geo g1"></div>
<div className="geo g2"></div>
<div className="geo g3"></div>

<div className="shell">

  
  <div className="side">
    <div className="side-logo">
      <div className="logo-mark"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#fff"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#tile-bus)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/></svg></span></div>
      <div>
        <div className="logo-name">EduSphere</div>
        <div className="logo-tag">Staff App</div>
      </div>
    </div>

    <div id="rc-teacher" className="role-card t-card active" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico" style={{"background":"#FFF0EE"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#FF5733"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#logo)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M8 21l2-4M16 21l-2-4M5 17l7-3 7 3"/></svg></span></div>
        <div>
          <div className="rc-name">Priya Sharma</div>
          <div className="rc-sub">Mathematics · Grade 8</div>
        </div>
        <div className="rc-indicator" id="dot-t"></div>
      </div>
    </div>

    <div id="rc-driver" className="role-card d-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico" style={{"background":"#EAF4FF"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#006BFF"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-profile)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="3" width="20" height="16" rx="3"/><path d="M2 11h20"/><circle cx="7" cy="22" r="1.5" fill="currentColor"/><circle cx="17" cy="22" r="1.5" fill="currentColor"/><path d="M7 19v3M17 19v3M6 7h4M14 7h4"/></svg></span></div>
        <div>
          <div className="rc-name">Ravi Kumar</div>
          <div className="rc-sub">Route 3 · Morning</div>
        </div>
        <div className="rc-indicator" id="dot-d" style={{"background":"var(--line)"}}></div>
      </div>
    </div>

    <div id="rc-tm" className="role-card tm-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico" style={{"background":"#ECFDF5"}}><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#047857"}}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#tm-bus)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="3"/><path d="M2 11h20"/><circle cx="7" cy="20" r="1.5" fill="currentColor"/><circle cx="17" cy="20" r="1.5" fill="currentColor"/><path d="M7 17v3M17 17v3"/></svg></span></div>
        <div>
          <div className="rc-name">Suresh Nair</div>
          <div className="rc-sub">Transport Manager</div>
        </div>
        <div className="rc-indicator" id="dot-tm" style={{"background":"var(--line)"}}></div>
      </div>
    </div>

    <div id="rc-admin" className="role-card a-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico" style={{"background":"#FFF5E6"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#FF9500"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10M12 6v3M10.5 7.5h3"/></svg></span></div>
        <div>
          <div className="rc-name">Arjun Mehra</div>
          <div className="rc-sub">Principal · Full Access</div>
        </div>
        <div className="rc-indicator" id="dot-a" style={{"background":"var(--line)"}}></div>
      </div>
    </div>

    <div id="rc-acct" className="role-card ac-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico" style={{"background":"#EEF2FF"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#4F46E5"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-finance)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></span></div>
        <div>
          <div className="rc-name">Kavitha Iyer</div>
          <div className="rc-sub">Account Manager · Finance</div>
        </div>
        <div className="rc-indicator" id="dot-ac" style={{"background":"var(--line)"}}></div>
      </div>
    </div>

    <div id="rc-hr" className="role-card hr-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico" style={{"background":"#F0FDFA"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#0D9488"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#tile-users)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></span></div>
        <div>
          <div className="rc-name">Meera Pillai</div>
          <div className="rc-sub">HR Manager · People Ops</div>
        </div>
        <div className="rc-indicator" id="dot-hr" style={{"background":"var(--line)"}}></div>
      </div>
    </div>

    <div id="rc-security" className="role-card sc-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico" style={{"background":"#EFF3FA"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#1E3A5F"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#sc-shield)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span></div>
        <div>
          <div className="rc-name">Vikram Bose</div>
          <div className="rc-sub">Security Officer · Gate</div>
        </div>
        <div className="rc-indicator" id="dot-sc" style={{"background":"var(--line)"}}></div>
      </div>
    </div>

    <div className="perms-box">
      <div className="pb-title">Access Permissions</div>
      <div id="perms"></div>
    </div>
  </div>

  
  <div className="phone-outer">
    <div className="halo h1"></div>
    <div className="halo h2"></div>

    <div className="phone t-phone" id="phone">
      <div className="island"><div className="island-dot"></div><div className="island-cam"></div></div>

      
      <div className="status">
        <div className="s-time" id="clk">9:41</div>
        <div className="s-icons">
          <div className="s-sig">
            <div className="s-bar" style={{"width":"3px","height":"5px","borderRadius":"1px"}}></div>
            <div className="s-bar" style={{"width":"3px","height":"8px","borderRadius":"1px"}}></div>
            <div className="s-bar" style={{"width":"3px","height":"11px","borderRadius":"1px"}}></div>
            <div className="s-bar" style={{"width":"3px","height":"14px","borderRadius":"1px"}}></div>
          </div>
          <div className="s-batt"><div className="s-batt-f"></div></div>
        </div>
      </div>

      <div className="screen" id="scr">

        
        <div className="dash on" id="d-t-home">
          <div className="tbar">
            <div>
              <div className="tbar-hi" id="greet"><span style={{"display":"inline-flex","alignItems":"center","gap":"3px"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Good morning</span></div>
              <div className="tbar-name">Ms. <b>Priya Sharma</b></div>
            </div>
            <div className="tbar-r">
              <div className="tbar-btn" onClick={() => {}}>
                <span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 17H2a3 3 0 004-4V9a8 8 0 0116 0v4a3 3 0 004 4z"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></span><div className="tbar-badge" style={{"background":"var(--t-a)"}}>3</div>
              </div>
              <div className="tbar-av" style={{"background":"linear-gradient(135deg,var(--t-a),var(--t-b))"}}>PS</div>
            </div>
          </div>

          
          <div className="ghero sr d1" style={{"background":"var(--t-grad)"}}>
            <div className="gh-mesh"></div>
            <div className="gh-blob" style={{"width":"220px","height":"220px","background":"rgba(255,255,255,.1)","top":"-60px","right":"-40px","animationDelay":"0s"}}></div>
            <div className="gh-blob" style={{"width":"150px","height":"150px","background":"rgba(255,255,255,.08)","bottom":"-30px","left":"10px","animationDelay":"2s"}}></div>
            <div className="gh-c">
              <div className="gh-pill"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"rgba(255,255,255,.8)","marginRight":"4px","verticalAlign":"middle"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#notif)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><path d="M2 20h20"/></svg></span> Class 8-A · Today</div>
              <div className="gh-num">38 <sub>/ 42</sub></div>
              <div className="gh-sub">90.5% present &nbsp;·&nbsp; 4 students absent</div>
              <div className="gh-bar">
                <div className="gh-track"><div className="gh-fill" style={{"width":"90.5%"}}></div></div>
                <div className="gh-blabels"><div className="gh-blabel">0%</div><div className="gh-blabel" style={{"color":"#fff","fontWeight":"800"}}>90.5%</div><div className="gh-blabel">100%</div></div>
              </div>
            </div>
          </div>

          
          <div className="tiles sr d2">
            <div className="tile" onClick={() => {}}><span className="t-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-reports)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></span></span><div className="t-num">6</div><div className="t-lbl">Periods</div><div className="t-ch" style={{"color":"var(--t-a)"}}>Today</div></div>
            <div className="tile" onClick={() => {}}><span className="t-ico" style={{"animationDelay":".5s"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#tile-clock)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.4"/></svg></span></span><div className="t-num">3</div><div className="t-lbl">Pending</div><div className="t-ch" style={{"color":"#f59e0b"}}>Homework</div></div>
            <div className="tile" onClick={() => {}}><span className="t-ico" style={{"animationDelay":"1s"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></span></span><div className="t-num">74%</div><div className="t-lbl">Avg Score</div><div className="t-ch" style={{"color":"#16a34a"}}>↑ 3.1%</div></div>
          </div>

          
          <div className="sh sr d3"><div className="sh-t">Quick Actions</div></div>
          <div className="acts sr d3">
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18M9 15l2.5 2.5L16 13" stroke-width="1.8"/></svg></span></div><div className="a-lbl">Attend.</div></div>
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span></div><div className="a-lbl">Marks</div></div>
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg></span></div><div className="a-lbl">Homework</div></div>
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M23 12a11 11 0 00-22 0z"/><path d="M12 12v8a2 2 0 004 0"/></svg></span></div><div className="a-lbl">Leave</div></div>
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M20.07 4.93a10 10 0 010 14.14M3.93 19.07a10 10 0 010-14.14"/></svg></span></div><div className="a-lbl">Circular</div></div>
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#act-broad)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></span></div><div className="a-lbl">Parents</div></div>
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#act-chat)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="16" r="1.2" fill="currentColor"/></svg></span></div><div className="a-lbl">Schedule</div></div>
            <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></span></div><div className="a-lbl">Reports</div></div>
          </div>

          
          <div className="sh sr d4"><div className="sh-t">Today's Timetable</div><button className="sh-more">View all</button></div>
          <div className="hrow sr d4">
            <div className="pchip done"><div className="pc-sub" style={{"color":"#16a34a"}}>Maths</div><div className="pc-cl">7-B</div><div className="pc-time">8:00–8:45</div><div className="pc-tag" style={{"background":"#F0FDF4","color":"#166534"}}><span style={{"display":"inline-flex","alignItems":"center","gap":"3px"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#act-chart)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg> Done</span></div></div>
            <div className="pchip done"><div className="pc-sub" style={{"color":"#16a34a"}}>Maths</div><div className="pc-cl">6-A</div><div className="pc-time">8:45–9:30</div><div className="pc-tag" style={{"background":"#F0FDF4","color":"#166534"}}><span style={{"display":"inline-flex","alignItems":"center","gap":"3px"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg> Done</span></div></div>
            <div className="pchip active"><div className="pc-sub">Maths</div><div className="pc-cl">8-A</div><div className="pc-time">9:30–10:15</div><div className="pc-tag" style={{"background":"rgba(255,87,51,.15)","color":"var(--t-a)"}}>▶ Now</div></div>
            <div className="pchip"><div className="pc-sub" style={{"color":"#d97706"}}>Maths</div><div className="pc-cl">9-C</div><div className="pc-time">10:30–11:15</div><div className="pc-tag ty">⏳ Next</div></div>
            <div className="pchip"><div className="pc-sub" style={{"color":"var(--ink4)"}}>Maths</div><div className="pc-cl">10-A</div><div className="pc-time">11:15–12:00</div><div className="pc-tag" style={{"background":"#F3F4F6","color":"var(--ink3)"}}>Later</div></div>
          </div>

          
          <div className="sh sr d5"><div className="sh-t">Class Performance</div><button className="sh-more">Monthly</button></div>
          <div className="card sr d5" style={{"padding":"16px"}}>
            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start","marginBottom":"16px"}}>
              <div>
                <div style={{"fontSize":"11px","fontWeight":"600","color":"var(--ink3)","marginBottom":"3px"}}>Class 8-A Average</div>
                <div style={{"fontFamily":"'Clash Display',sans-serif","fontSize":"32px","fontWeight":"700","color":"var(--ink)","letterSpacing":"-1.5px"}}>74.2%</div>
              </div>
              <div style={{"textAlign":"right"}}>
                <div style={{"fontSize":"11px","color":"var(--ink3)","marginBottom":"3px"}}>vs Last Month</div>
                <div style={{"fontSize":"20px","fontWeight":"800","color":"#16a34a"}}>↑ 3.1%</div>
                <div className="sparkline" style={{"justifyContent":"flex-end","marginTop":"5px"}}>
                  <div className="sbar" style={{"height":"55%","background":"var(--t-a)"}}></div>
                  <div className="sbar" style={{"height":"65%","background":"var(--t-a)"}}></div>
                  <div className="sbar" style={{"height":"70%","background":"var(--t-a)"}}></div>
                  <div className="sbar" style={{"height":"68%","background":"var(--t-a)"}}></div>
                  <div className="sbar" style={{"height":"73%","background":"var(--t-a)"}}></div>
                  <div className="sbar" style={{"height":"82%","background":"var(--t-b)","opacity":"1"}}></div>
                </div>
              </div>
            </div>
            <div style={{"fontSize":"10px","fontWeight":"800","color":"var(--ink3)","textTransform":"uppercase","letterSpacing":".7px","marginBottom":"10px"}}>Top Performers</div>
            <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
              <div style={{"display":"flex","alignItems":"center","gap":"10px"}}><div style={{"width":"28px","height":"28px","borderRadius":"10px","background":"linear-gradient(135deg,#FFD700,#FFA500)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"11px","fontWeight":"900","color":"#fff","flexShrink":"0","letterSpacing":"-.5px","fontFamily":"'Clash Display',sans-serif"}}>#1</div><div style={{"flex":"1","fontSize":"13px","fontWeight":"700","color":"var(--ink)"}}>Ananya Krishnan</div><div style={{"fontSize":"13px","fontWeight":"800","color":"#16a34a"}}>96%</div></div>
              <div style={{"display":"flex","alignItems":"center","gap":"10px"}}><div style={{"width":"28px","height":"28px","borderRadius":"10px","background":"linear-gradient(135deg,#C0C0C0,#A0A0A0)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"11px","fontWeight":"900","color":"#fff","flexShrink":"0","letterSpacing":"-.5px","fontFamily":"'Clash Display',sans-serif"}}>#2</div><div style={{"flex":"1","fontSize":"13px","fontWeight":"700","color":"var(--ink)"}}>Rohan Mehta</div><div style={{"fontSize":"13px","fontWeight":"800","color":"#16a34a"}}>93%</div></div>
              <div style={{"display":"flex","alignItems":"center","gap":"10px"}}><div style={{"width":"28px","height":"28px","borderRadius":"10px","background":"linear-gradient(135deg,#CD7F32,#A05A20)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"11px","fontWeight":"900","color":"#fff","flexShrink":"0","letterSpacing":"-.5px","fontFamily":"'Clash Display',sans-serif"}}>#3</div><div style={{"flex":"1","fontSize":"13px","fontWeight":"700","color":"var(--ink)"}}>Sneha Patil</div><div style={{"fontSize":"13px","fontWeight":"800","color":"#16a34a"}}>91%</div></div>
            </div>
          </div>

          
          <div className="sh sr d6"><div className="sh-t">Pending Assignments</div><button className="sh-more">All 3</button></div>
          <div className="card sr d6">
            <div className="lr"><div className="lr-ico" style={{"background":"#FFFBEB","display":"flex","alignItems":"center","justifyContent":"center"}}><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#d97706"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg></span></div><div className="lr-main"><div className="lr-name">Chapter 7 Exercise — 8-A</div><div className="lr-sub">Due tomorrow · 28/42 submitted</div></div><div className="lr-r"><div className="tag ty">67%</div></div></div>
            <div className="lr"><div className="lr-ico" style={{"background":"#F0FDF4","display":"flex","alignItems":"center","justifyContent":"center"}}><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#16a34a"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#act-marks)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></svg></span></div><div className="lr-main"><div className="lr-name">Geometry Practice — 9-C</div><div className="lr-sub">Due Friday · 38/44 submitted</div></div><div className="lr-r"><div className="tag tg">86%</div></div></div>
            <div className="lr"><div className="lr-ico" style={{"background":"#F5F3FF","display":"flex","alignItems":"center","justifyContent":"center"}}><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#7c3aed"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><path d="M2 20h20"/></svg></span></div><div className="lr-main"><div className="lr-name">Statistics Project — 10-A</div><div className="lr-sub">Due Monday · 12/38 submitted</div></div><div className="lr-r"><div className="tag tr">32%</div></div></div>
          </div>

          
          <div className="sh sr d7"><div className="sh-t">Notices</div><button className="sh-more">View all</button></div>
          <div className="notice sr d7" style={{"marginBottom":"4px"}}>
            <div className="nt"><div className="nn"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"inherit","marginRight":"4px","verticalAlign":"middle"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="url(#nav-reports)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></span> Staff Meeting — Thu 4PM</div><div className="nd">Today</div></div>
            <div className="nb-">Mandatory meeting in Conference Hall B. Q4 exam schedule & PTM dates.</div>
          </div>
          <div className="notice sr d8" style={{"borderLeftColor":"#16a34a"}}>
            <div className="nt"><div className="nn"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"inherit","marginRight":"4px","verticalAlign":"middle"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="url(#tile-bus)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ><polyline points="9,11 12,14 22,4" stroke-width="2.2"/></svg></span> Leave Approved</div><div className="nd">Yesterday</div></div>
            <div className="nb-">Mar 15–16 leave approved by Principal Arjun Mehra.</div>
          </div>
        </div>

        
        <div className="dash" id="d-t-att">
          <div className="tbar">
            <div><div className="tbar-hi">Class 8-A · Period 3 · Now</div><div className="tbar-name"><b>Attendance</b></div></div>
            <div className="tbar-r">
              <div className="tbar-btn" onClick={() => {}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18M9 15l2.5 2.5L16 13" stroke-width="1.8"/></svg></span></div>
              <div className="tbar-btn" onClick={() => {}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg></span></div>
            </div>
          </div>
          <div className="tiles">
            <div className="tile" style={{"background":"#F0FDF4","borderColor":"rgba(22,163,74,.2)"}}><span className="t-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10" stroke-width="2"/></svg></span></span><div className="t-num" id="pc" style={{"color":"#166534"}}>38</div><div className="t-lbl">Present</div></div>
            <div className="tile" style={{"background":"#FEF2F2","borderColor":"rgba(220,38,38,.2)"}}><span className="t-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/></svg></span></span><div className="t-num" id="ac" style={{"color":"#991B1B"}}>4</div><div className="t-lbl">Absent</div></div>
            <div className="tile" style={{"background":"#FFFBEB","borderColor":"rgba(217,119,6,.2)"}}><span className="t-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h8M12 18v-8"/></svg></span></span><div className="t-num" id="lc" style={{"color":"#92400E"}}>0</div><div className="t-lbl">Leave</div></div>
          </div>
          <div className="card">
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>AK</div><div style={{"flex":"1"}}><div className="ar-n">Ananya Krishnan</div><div className="ar-r">Roll #01</div></div><div className="ar-btns"><div className="ap on" onClick={() => {}}>P</div><div className="aa" onClick={() => {}}>A</div><div className="al" onClick={() => {}}>L</div></div></div>
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#8b5cf6,#a78bfa)"}}>RM</div><div style={{"flex":"1"}}><div className="ar-n">Rohan Mehta</div><div className="ar-r">Roll #02</div></div><div className="ar-btns"><div className="ap on" onClick={() => {}}>P</div><div className="aa" onClick={() => {}}>A</div><div className="al" onClick={() => {}}>L</div></div></div>
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#ec4899,#f43f5e)"}}>SP</div><div style={{"flex":"1"}}><div className="ar-n">Sneha Patil</div><div className="ar-r">Roll #03</div></div><div className="ar-btns"><div className="ap" onClick={() => {}}>P</div><div className="aa on" onClick={() => {}}>A</div><div className="al" onClick={() => {}}>L</div></div></div>
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#14b8a6,#06b6d4)"}}>VJ</div><div style={{"flex":"1"}}><div className="ar-n">Vikram Joshi</div><div className="ar-r">Roll #04</div></div><div className="ar-btns"><div className="ap on" onClick={() => {}}>P</div><div className="aa" onClick={() => {}}>A</div><div className="al" onClick={() => {}}>L</div></div></div>
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#f59e0b,#f97316)"}}>NR</div><div style={{"flex":"1"}}><div className="ar-n">Nisha Rajan</div><div className="ar-r">Roll #05</div></div><div className="ar-btns"><div className="ap" onClick={() => {}}>P</div><div className="aa" onClick={() => {}}>A</div><div className="al on" onClick={() => {}}>L</div></div></div>
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#ef4444,#dc2626)"}}>DS</div><div style={{"flex":"1"}}><div className="ar-n">Dev Shah</div><div className="ar-r">Roll #06</div></div><div className="ar-btns"><div className="ap on" onClick={() => {}}>P</div><div className="aa" onClick={() => {}}>A</div><div className="al" onClick={() => {}}>L</div></div></div>
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#10b981,#059669)"}}>PM</div><div style={{"flex":"1"}}><div className="ar-n">Preethi Murugan</div><div className="ar-r">Roll #07</div></div><div className="ar-btns"><div className="ap on" onClick={() => {}}>P</div><div className="aa" onClick={() => {}}>A</div><div className="al" onClick={() => {}}>L</div></div></div>
            <div className="ar"><div className="ar-av" style={{"background":"linear-gradient(135deg,#a78bfa,#7c3aed)"}}>KN</div><div style={{"flex":"1"}}><div className="ar-n">Karan Nair</div><div className="ar-r">Roll #08</div></div><div className="ar-btns"><div className="ap" onClick={() => {}}>P</div><div className="aa on" onClick={() => {}}>A</div><div className="al" onClick={() => {}}>L</div></div></div>
          </div>
          <div style={{"padding":"10px 16px 6px"}}>
            <button className="submit-btn" style={{"background":"var(--t-grad)"}} onClick={() => {}}>Submit Attendance</button>
          </div>
        </div>

        
        <div className="dash" id="d-t-chat" style={{"padding":"0","flexDirection":"column","overflow":"hidden"}}>

          
          <div id="chat-inbox-view" className="chat-view" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="tbar" style={{"flexShrink":"0"}}>
              <div><div className="tbar-hi">EduSphere Messaging</div><div className="tbar-name"><b>Chat</b></div></div>
              <div className="tbar-r">
                <div className="tbar-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
                <div className="tbar-av" style={{"background":"linear-gradient(135deg,var(--t-a),var(--t-b))"}}>PS</div>
              </div>
            </div>
            <div className="chat-search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search messages, parents, staff…" onChange={() = /> {}}>
            </div>
            <div className="chat-filter-row" id="chat-filter-row">
              <button className="chat-filter-btn active" onClick={() => {}}>All</button>
              <button className="chat-filter-btn" onClick={() => {}}>Parents</button>
              <button className="chat-filter-btn" onClick={() => {}}>Staff</button>
              <button className="chat-filter-btn" onClick={() => {}}>Groups</button>
              <button className="chat-filter-btn" onClick={() => {}}>Unread <span style={{"background":"var(--t-a)","color":"#fff","borderRadius":"100px","padding":"1px 6px","fontSize":"10px","marginLeft":"3px"}}>5</span></button>
            </div>
            <div className="chat-list" id="chat-list-scroll">
              <div className="chat-section-lbl">📌 Pinned</div>
              <div className="conv-row" onClick={() => {}} data-cat="groups staff">
                <div className="conv-av conv-av-group" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">📚 Staff Lounge</div><div className="conv-time">9:41 AM</div></div><div className="conv-preview unread"><span className="conv-preview-you">Arjun:</span>&nbsp;<span>Staff meeting moved to 4:30 PM today</span><span className="conv-unread">3</span></div></div>
                <div className="conv-pinned-dot"></div>
              </div>
              <div className="conv-row" onClick={() => {}} data-cat="groups parents">
                <div className="conv-av conv-av-group" style={{"background":"linear-gradient(135deg,var(--t-a),var(--t-b))"}}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg></div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">🏫 Class 8-A Parents</div><div className="conv-time">8:15 AM</div></div><div className="conv-preview unread"><span className="conv-preview-you">You:</span>&nbsp;<span>Unit test results will be shared by Friday</span></div></div>
                <div className="conv-pinned-dot"></div>
              </div>
              <div className="chat-section-lbl" style={{"marginTop":"6px"}}>💬 Recent</div>
              <div className="conv-row" onClick={() => {}} data-cat="parents">
                <div className="conv-av" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>AK</div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">Meera Krishnan</div><div className="conv-time">Yesterday</div></div><div className="conv-preview unread"><span>Ananya was unwell last week. Can she redo the…</span><span className="conv-unread">1</span></div></div>
              </div>
              <div className="conv-row" onClick={() => {}} data-cat="staff">
                <div className="conv-av" style={{"background":"linear-gradient(135deg,#0d9488,#06b6d4)"}}>MP</div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">Meera Pillai</div><div className="conv-time">Yesterday</div></div><div className="conv-preview"><span className="conv-preview-you">You:</span>&nbsp;<span>Got it, will submit by EOD. Thanks!</span></div></div>
              </div>
              <div className="conv-row" onClick={() => {}} data-cat="parents">
                <div className="conv-av" style={{"background":"linear-gradient(135deg,#8b5cf6,#a78bfa)"}}>RM</div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">Suresh Mehta</div><div className="conv-time">Mon</div></div><div className="conv-preview unread"><span>Thank you for the detailed feedback, ma'am!</span><span className="conv-unread">1</span></div></div>
              </div>
              <div className="conv-row" onClick={() => {}} data-cat="staff">
                <div className="conv-av" style={{"background":"linear-gradient(135deg,#d97706,#f59e0b)"}}>AM</div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">Arjun Mehra</div><div className="conv-time">Mon</div></div><div className="conv-preview"><span>Leave for 15–16 Mar has been approved ✅</span></div></div>
              </div>
              <div className="conv-row" onClick={() => {}} data-cat="parents">
                <div className="conv-av" style={{"background":"linear-gradient(135deg,#ec4899,#f43f5e)"}}>SP</div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">Lata Patil</div><div className="conv-time">Sun</div></div><div className="conv-preview"><span className="conv-preview-you">You:</span>&nbsp;<span>Sneha did really well in the practicals 🌟</span></div></div>
              </div>
              <div className="conv-row" onClick={() => {}} data-cat="staff">
                <div className="conv-av" style={{"background":"linear-gradient(135deg,#FF5733,#FF006E)"}}>VB</div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">Vikram Bose</div><div className="conv-time">Fri</div></div><div className="conv-preview"><span>New ID card collection: Room 12, ground floor</span></div></div>
              </div>
              <div className="conv-row" onClick={() => {}} data-cat="parents">
                <div className="conv-av" style={{"background":"linear-gradient(135deg,#a78bfa,#7c3aed)"}}>KN</div>
                <div className="conv-body"><div className="conv-top-row"><div className="conv-name">Pradeep Nair</div><div className="conv-time">Thu</div></div><div className="conv-preview"><span className="conv-preview-you">You:</span>&nbsp;<span>Please ensure Karan submits his absent note</span></div></div>
              </div>
              <div style={{"height":"16px"}}></div>
            </div>
          </div>

          
          <div id="thread-staff-lounge" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av thread-av-group" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
              <div style={{"flex":"1"}}><div className="thread-name">📚 Staff Lounge</div><div className="thread-sub">8 members · 5 online</div></div>
              <div className="thread-actions"><div className="thread-action-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.4"/></svg></div></div>
            </div>
            <div className="thread-messages" id="msgs-staff-lounge">
              <div className="msg-date-divider"><span>Monday, 3 Mar</span></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#d97706,#f59e0b)"}}>AM</div><div className="msg-bubble-group"><div className="msg-bubble first">Reminder: PTM is on Saturday, March 15. Please update all student progress reports by Friday EOD.</div><div className="msg-meta"><span className="msg-time">10:02 AM</span></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#0d9488,#06b6d4)"}}>MP</div><div className="msg-bubble-group"><div className="msg-bubble first">Noted! Also, please collect signed leave forms from staff who applied for the 14th.</div><div className="msg-meta"><span className="msg-time">10:17 AM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Got it. I'll update 8-A progress reports today itself.</div><div className="msg-meta"><span className="msg-time">10:24 AM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-date-divider"><span>Today</span></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#d97706,#f59e0b)"}}>AM</div><div className="msg-bubble-group"><div className="msg-bubble first">Good morning everyone 👋 Staff meeting today has been moved to <b>4:30 PM</b> — Conference Hall B.</div><div className="msg-meta"><span className="msg-time">8:58 AM</span></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#7c3aed,#a78bfa)"}}>RG</div><div className="msg-bubble-group"><div className="msg-bubble first">Thanks for the heads up!</div><div className="msg-meta"><span className="msg-time">9:03 AM</span></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#0d9488,#06b6d4)"}}>MP</div><div className="msg-bubble-group"><div className="msg-bubble first">Will the Q4 exam schedule also be shared today?</div><div className="msg-meta"><span className="msg-time">9:15 AM</span></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#d97706,#f59e0b)"}}>AM</div><div className="msg-bubble-group"><div className="msg-bubble first">Yes — exam dates, PTM slots, and annual day committee assignments. Please come prepared.</div><div className="msg-meta"><span className="msg-time">9:41 AM</span></div></div></div>
              <div className="typing-indicator"><div className="typing-av" style={{"background":"linear-gradient(135deg,#7c3aed,#a78bfa)"}}>RG</div><div className="typing-bubble"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Message Staff Lounge…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-staff-lounge" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-class-parents" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av thread-av-group" style={{"background":"linear-gradient(135deg,var(--t-a),var(--t-b))"}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg></div>
              <div style={{"flex":"1"}}><div className="thread-name">🏫 Class 8-A Parents</div><div className="thread-sub">42 members</div></div>
              <div className="thread-actions">
                <div className="thread-action-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49"/></svg></div>
                <div className="thread-action-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.4"/></svg></div>
              </div>
            </div>
            <div className="broadcast-bar"><div className="bb-label">📢 Class Broadcast</div><textarea className="bb-input" placeholder="Send an announcement to all 42 parents…" rows="2"></textarea><div className="bb-footer"><span className="bb-target">→ Class 8-A · 42 parents</span><button className="bb-send-btn" onClick={() => {}}>Send All</button></div></div>
            <div className="thread-messages" id="msgs-class-parents">
              <div className="msg-date-divider"><span>Yesterday</span></div>
              <div className="msg-announce"><div className="msg-announce-label">📢 Announcement · Ms. Priya Sharma</div><div className="msg-announce-text">Dear parents, Unit Test 2 results will be shared by this Friday. Students who scored below 60% will receive individual feedback sessions. Please ensure your children are prepared for Chapters 8–10.</div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#ec4899,#f43f5e)"}}>LP</div><div className="msg-bubble-group"><div className="msg-bubble first">Thank you ma'am. Will the feedback sessions be during school hours?</div><div className="msg-meta"><span className="msg-time">3:22 PM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Yes, after 2:30 PM on Thursday and Friday. I'll send a detailed schedule soon.</div><div className="msg-meta"><span className="msg-time">3:45 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#8b5cf6,#a78bfa)"}}>SM</div><div className="msg-bubble-group"><div className="msg-bubble first">Ma'am, will there be a PTM before the final exams?</div><div className="msg-meta"><span className="msg-time">4:10 PM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Yes! PTM is on March 15 (Saturday). Details will be shared shortly 📅</div><div className="msg-meta"><span className="msg-time">4:20 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-date-divider"><span>Today</span></div>
              <div className="msg-announce"><div className="msg-announce-label">📢 Announcement · Ms. Priya Sharma</div><div className="msg-announce-text">Unit test results will be shared by Friday. Students who scored below passing will have a re-test on March 18.</div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Message parents…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-class-parents" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-ananya-parent" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>AK</div>
              <div style={{"flex":"1"}}><div className="thread-name">Meera Krishnan</div><div className="thread-sub">Parent of Ananya Krishnan · Roll #01</div></div>
              <div className="thread-actions"><div className="thread-action-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div></div>
            </div>
            <div className="thread-messages" id="msgs-ananya-parent">
              <div className="msg-date-divider"><span>Thursday, 6 Mar</span></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Dear Mrs. Krishnan, Ananya scored 96% in Unit Test 2! She is an exceptional student — keep up the encouragement at home. 🌟</div><div className="msg-meta"><span className="msg-time">4:30 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>AK</div><div className="msg-bubble-group"><div className="msg-bubble first">Thank you so much ma'am! She has been studying so hard 😊 We are very proud of her.</div><div className="msg-meta"><span className="msg-time">5:02 PM</span></div></div></div>
              <div className="msg-date-divider"><span>Yesterday</span></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>AK</div><div className="msg-bubble-group"><div className="msg-bubble first">Ma'am, Ananya was unwell last week with fever. Can she redo the lab practical she missed?</div><div className="msg-meta"><span className="msg-time">11:22 AM</span></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>AK</div><div className="msg-bubble-group"><div className="msg-bubble" style={{"borderTopLeftRadius":"4px"}}>She has a medical certificate from the doctor if needed.</div><div className="msg-meta"><span className="msg-time">11:23 AM</span></div></div></div>
              <div className="typing-indicator"><div className="typing-av" style={{"background":"linear-gradient(135deg,#6366f1,#8b5cf6)"}}>AK</div><div className="typing-bubble"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Reply to Meera…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-ananya" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-meera-hr" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av" style={{"background":"linear-gradient(135deg,#0d9488,#06b6d4)"}}>MP</div>
              <div style={{"flex":"1"}}><div className="thread-name">Meera Pillai</div><div className="thread-status"><div className="thread-online-dot"></div><div className="thread-status-txt">Online · HR Manager</div></div></div>
              <div className="thread-actions"><div className="thread-action-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div></div>
            </div>
            <div className="thread-messages" id="msgs-meera-hr">
              <div className="msg-date-divider"><span>Yesterday</span></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#0d9488,#06b6d4)"}}>MP</div><div className="msg-bubble-group"><div className="msg-bubble first">Hi Priya! Could you please submit your monthly class report and attendance summary by today evening? Principal Mehra needs it for the board meeting.</div><div className="msg-meta"><span className="msg-time">2:10 PM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Sure Meera, I'll compile it and send it across. Is the shared drive link still the same?</div><div className="msg-meta"><span className="msg-time">2:28 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#0d9488,#06b6d4)"}}>MP</div><div className="msg-bubble-group"><div className="msg-bubble first">Yes same link! Also attach last month's comparison if you have it.</div><div className="msg-meta"><span className="msg-time">2:33 PM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-attach"><div className="msg-attach-ico" style={{"background":"rgba(255,87,51,.1)"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg></div><div><div className="msg-attach-name">Class8A_Report_Feb.pdf</div><div className="msg-attach-size">245 KB · PDF</div></div></div><div className="msg-meta" style={{"justifyContent":"flex-end"}}><span className="msg-time">4:51 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Got it, will submit by EOD. Thanks!</div><div className="msg-meta"><span className="msg-time">5:03 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#0d9488,#06b6d4)"}}>MP</div><div className="msg-bubble-group"><div className="msg-bubble first">Perfect! Thank you 🙏</div><div className="msg-meta"><span className="msg-time">5:20 PM</span></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Message Meera…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-meera" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-rohan-parent" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av" style={{"background":"linear-gradient(135deg,#8b5cf6,#a78bfa)"}}>RM</div>
              <div style={{"flex":"1"}}><div className="thread-name">Suresh Mehta</div><div className="thread-sub">Parent of Rohan Mehta · Roll #02</div></div>
              <div className="thread-actions"><div className="thread-action-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div></div>
            </div>
            <div className="thread-messages" id="msgs-rohan-parent">
              <div className="msg-date-divider"><span>Monday</span></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Dear Mr. Mehta, Rohan has been showing excellent progress in Mathematics but needs to improve his written work consistency.</div><div className="msg-meta"><span className="msg-time">3:00 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first" style={{"borderTopRightRadius":"4px"}}>He scored 93% in Unit Test 2 — 2nd in class! 🎉 Please encourage him to be more careful with step-by-step working.</div><div className="msg-meta"><span className="msg-time">3:01 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#8b5cf6,#a78bfa)"}}>RM</div><div className="msg-bubble-group"><div className="msg-bubble first">Thank you for the detailed feedback, ma'am! We will definitely work on it. Rohan is very happy to hear about his rank! 😊</div><div className="msg-meta"><span className="msg-time">5:45 PM</span></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Reply to Suresh…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-rohan" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-principal" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av" style={{"background":"linear-gradient(135deg,#d97706,#f59e0b)"}}>AM</div>
              <div style={{"flex":"1"}}><div className="thread-name">Arjun Mehra</div><div className="thread-sub">Principal · Admin</div></div>
            </div>
            <div className="thread-messages" id="msgs-principal">
              <div className="msg-date-divider"><span>Monday</span></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Good morning sir. I had applied for leave on 15–16 March for a family function. Kindly consider my application.</div><div className="msg-meta"><span className="msg-time">8:30 AM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#d97706,#f59e0b)"}}>AM</div><div className="msg-bubble-group"><div className="msg-bubble first">Leave for 15–16 Mar has been approved ✅ Please ensure a substitute is arranged for your classes. Inform Meera from HR.</div><div className="msg-meta"><span className="msg-time">10:44 AM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Thank you sir! I'll coordinate with Mr. Raj for the substitute and inform HR.</div><div className="msg-meta"><span className="msg-time">11:02 AM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Message Principal…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-principal" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-sneha-parent" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av" style={{"background":"linear-gradient(135deg,#ec4899,#f43f5e)"}}>SP</div>
              <div style={{"flex":"1"}}><div className="thread-name">Lata Patil</div><div className="thread-sub">Parent of Sneha Patil · Roll #03</div></div>
            </div>
            <div className="thread-messages" id="msgs-sneha-parent">
              <div className="msg-date-divider"><span>Sunday</span></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Dear Mrs. Patil, Sneha did really well in the practicals 🌟 She demonstrated excellent lab skills and her diagrams were very neat.</div><div className="msg-meta"><span className="msg-time">11:30 AM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#ec4899,#f43f5e)"}}>LP</div><div className="msg-bubble-group"><div className="msg-bubble first">Thank you so much ma'am! Sneha was nervous before but she prepared very well. We are so happy! 🙏</div><div className="msg-meta"><span className="msg-time">12:15 PM</span></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Reply to Lata…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-sneha" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-vikram-sec" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av" style={{"background":"linear-gradient(135deg,#FF5733,#FF006E)"}}>VB</div>
              <div style={{"flex":"1"}}><div className="thread-name">Vikram Bose</div><div className="thread-sub">Security Officer</div></div>
            </div>
            <div className="thread-messages" id="msgs-vikram-sec">
              <div className="msg-date-divider"><span>Friday</span></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#FF5733,#FF006E)"}}>VB</div><div className="msg-bubble-group"><div className="msg-bubble first">Good afternoon. New staff ID cards are ready for collection. Please visit Room 12 on the ground floor before 5 PM today.</div><div className="msg-meta"><span className="msg-time">1:45 PM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Thanks Vikram! Will collect it after 3rd period.</div><div className="msg-meta"><span className="msg-time">2:10 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Message Vikram…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-vikram" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="thread-karan-parent" className="chat-view hidden" style={{"flex":"1","overflow":"hidden","display":"flex","flexDirection":"column"}}>
            <div className="thread-header">
              <div className="thread-back" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg></div>
              <div className="thread-av" style={{"background":"linear-gradient(135deg,#a78bfa,#7c3aed)"}}>KN</div>
              <div style={{"flex":"1"}}><div className="thread-name">Pradeep Nair</div><div className="thread-sub">Parent of Karan Nair · Roll #08 · Absent today</div></div>
            </div>
            <div className="thread-messages" id="msgs-karan-parent">
              <div className="msg-date-divider"><span>Thursday</span></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Dear Mr. Nair, Karan was absent today (2nd consecutive day). Please ensure he submits a leave note / medical certificate when he returns. Attendance is currently 78%.</div><div className="msg-meta"><span className="msg-time">4:00 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
              <div className="msg-row"><div className="msg-av" style={{"background":"linear-gradient(135deg,#a78bfa,#7c3aed)"}}>KN</div><div className="msg-bubble-group"><div className="msg-bubble first">Ma'am, Karan has viral fever. Doctor has advised 3 days rest. We will submit the certificate on Monday.</div><div className="msg-meta"><span className="msg-time">6:22 PM</span></div></div></div>
              <div className="msg-row sent"><div className="msg-bubble-group"><div className="msg-bubble first">Please ensure Karan submits his absent note and the doctor's certificate when he returns. Hope he recovers soon! 🙏</div><div className="msg-meta"><span className="msg-time">6:45 PM</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t-a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,16 10,10"/><polyline points="9,12 13,16 22,5" opacity=".5"/></svg></div></div></div>
            </div>
            <div className="thread-composer"><div className="composer-row"><div className="composer-attach-btn" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></div><div className="composer-input-wrap"><textarea className="composer-input" placeholder="Reply to Pradeep…" rows="1" onChange={() => {}}></textarea><span className="composer-emoji-btn" onClick={() => {}}>😊</span></div><div className="composer-send-btn empty" id="send-karan" onClick={() => {}}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg></div></div></div>
          </div>

          
          <div id="emoji-picker">
            
            <div className="ep-recent-strip" id="ep-recent-strip">
              
            </div>
            
            <div className="ep-tabs" id="ep-tabs">
              <div className="ep-tab active" onClick={() => {}} title="Smileys">😊</div>
              <div className="ep-tab" onClick={() => {}} title="Gestures">👋</div>
              <div className="ep-tab" onClick={() => {}} title="People">👩‍🏫</div>
              <div className="ep-tab" onClick={() => {}} title="Education">📚</div>
              <div className="ep-tab" onClick={() => {}} title="Nature">🌸</div>
              <div className="ep-tab" onClick={() => {}} title="Food">🍎</div>
              <div className="ep-tab" onClick={() => {}} title="Activities">⭐</div>
              <div className="ep-tab" onClick={() => {}} title="Symbols">❤️</div>
            </div>
            
            <div className="ep-search-wrap">
              <input className="ep-search" id="ep-search" type="text" placeholder="Search emoji…" onChange={() = /> {}}>
            </div>
            
            <div className="ep-grid-wrap">
              <div className="ep-grid" id="ep-grid"></div>
            </div>
          </div>

        </div>

        
        <div className="dash" id="d-d-home">
          <div className="tbar">
            <div><div className="tbar-hi"><span style={{"display":"inline-flex","alignItems":"center","gap":"4px","verticalAlign":"middle"}}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="3"/><path d="M2 11h20"/><circle cx="7" cy="20" r="1.2" fill="currentColor"/><circle cx="17" cy="20" r="1.2" fill="currentColor"/><path d="M7 17v3M17 17v3"/></svg> Route 3 · Morning Shift</span></div><div className="tbar-name" id="drv-tbar-name">Ravi <b>Kumar</b></div></div>
            <div className="tbar-r">
              <div className="live-pill"><div className="live-dot"></div><div className="live-t">LIVE</div></div>
              <div className="tbar-av" style={{"background":"var(--d-grad)"}} id="drv-tbar-av">RK</div>
            </div>
          </div>

          
          <div className="drole-toggle">
            <button className="drole-btn dm-active" id="drole-driver" onClick={() => {}}>🚌 Driver</button>
            <button className="drole-btn" id="drole-asst" onClick={() => {}}>👤 Bus Assistant</button>
          </div>

          
          <div id="drv-only-content">
          <div className="veh sr d1" style={{"background":"var(--d-grad)"}}>
            <div className="veh-c">
              <div className="veh-row">
                <div><div style={{"fontSize":"9px","color":"rgba(255,255,255,.6)","fontWeight":"700","textTransform":"uppercase","letterSpacing":".6px","marginBottom":"3px"}}>Vehicle No.</div><div className="veh-num">MH 12 AB 4567</div></div>
                <div className="veh-st" style={{"display":"flex","alignItems":"center","gap":"5px"}}><span style={{"width":"7px","height":"7px","borderRadius":"50%","background":"#80FFDB","boxShadow":"0 0 6px #80FFDB","display":"inline-block","animation":"lp 1.2s infinite"}}></span> On Route</div>
              </div>
              <div className="veh-grid">
                <div><div className="vg-val">78%</div><div className="vg-lbl">Fuel Level</div><div className="vg-bar"><div className="vg-fill" style={{"width":"78%"}}></div></div></div>
                <div><div className="vg-val">34</div><div className="vg-lbl">Students</div></div>
                <div><div className="vg-val">18 km</div><div className="vg-lbl">Route Length</div></div>
              </div>
            </div>
          </div>

          <div className="card sr d2" style={{"padding":"16px","marginBottom":"12px"}}>
            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"10px"}}>
              <div style={{"fontFamily":"'Cabinet Grotesk',sans-serif","fontSize":"15px","fontWeight":"800","color":"var(--ink)"}}>Pickup Progress</div>
              <div style={{"fontSize":"13px","fontWeight":"800","color":"var(--d-a)"}}>22 / 34</div>
            </div>
            <div className="pbar"><div className="pbar-f" style={{"width":"64.7%","background":"var(--d-grad)"}}></div></div>
            <div style={{"display":"flex","justifyContent":"space-between","marginTop":"7px"}}>
              <div style={{"fontSize":"10.5px","fontWeight":"600","color":"var(--ink3)"}}>12 students remaining</div>
              <div style={{"fontSize":"11px","fontWeight":"800","color":"var(--d-a)"}}>65% complete</div>
            </div>
          </div>

          <div className="sh sr d3"><div className="sh-t">Route Stops</div><div className="sh-more" style={{"background":"var(--d-soft)","color":"var(--d-a)"}}>3 ahead</div></div>
          <div className="card sr d3">
            <div className="rs rs-done"><div className="rs-dot" style={{"background":"#DCFCE7","color":"#166534","display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#tile-bus)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div className="rs-body"><div className="rs-n">Koregaon Park Gate</div><div className="rs-s">8 students picked up</div></div><div className="rs-t" style={{"color":"var(--ink4)"}}>7:15</div></div>
            <div className="rs rs-done"><div className="rs-dot" style={{"background":"#DCFCE7","color":"#166534","display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div className="rs-body"><div className="rs-n">Baner Phata Stop</div><div className="rs-s">6 students picked up</div></div><div className="rs-t" style={{"color":"var(--ink4)"}}>7:32</div></div>
            <div className="rs rs-done"><div className="rs-dot" style={{"background":"#DCFCE7","color":"#166534","display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div className="rs-body"><div className="rs-n">Aundh IT Park</div><div className="rs-s">8 students picked up</div></div><div className="rs-t" style={{"color":"var(--ink4)"}}>7:48</div></div>
            <div className="rs" style={{"background":"rgba(0,107,255,.04)"}}><div className="rs-dot" style={{"background":"var(--d-a)","color":"#fff","boxShadow":"0 0 0 4px rgba(0,107,255,.2)"}}>▶</div><div className="rs-body"><div className="rs-n" style={{"color":"var(--d-a)"}}>Wakad Square <span style={{"fontSize":"10px","opacity":".6"}}>(Now)</span></div><div className="rs-s">4 students waiting</div></div><div className="rs-t" style={{"color":"var(--d-a)"}}>9:05</div></div>
            <div className="rs"><div className="rs-dot" style={{"background":"#F3F4F6","color":"var(--ink3)"}}>5</div><div className="rs-body"><div className="rs-n">Hinjewadi Phase 1</div><div className="rs-s">5 students</div></div><div className="rs-t" style={{"color":"var(--ink3)"}}>9:18</div></div>
            <div className="rs"><div className="rs-dot" style={{"background":"#F5F3FF","color":"#6366f1","display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="url(#nav-approve)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><rect x="9" y="14" width="6" height="8"/></svg></div><div className="rs-body"><div className="rs-n">EduSphere School</div><div className="rs-s">Drop-off point</div></div><div className="rs-t" style={{"color":"var(--ink3)"}}>9:45</div></div>
          </div>

          <div className="sh sr d4"><div className="sh-t">Student Checklist</div><button className="sh-more" style={{"background":"var(--d-soft)","color":"var(--d-a)"}}>All 34</button></div>
          <div className="card sr d4">
            <div className="pr" onClick={() => {}}><div className="pchk on" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div style={{"flex":"1"}}><div className="pr-n">Aarav Sharma</div><div className="pr-s">Koregaon Park</div></div><div className="tag tg">8-A</div></div>
            <div className="pr" onClick={() => {}}><div className="pchk on" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div style={{"flex":"1"}}><div className="pr-n">Diya Iyer</div><div className="pr-s">Baner Phata</div></div><div className="tag tv">6-B</div></div>
            <div className="pr" onClick={() => {}}><div className="pchk"></div><div style={{"flex":"1"}}><div className="pr-n">Arnav Kulkarni</div><div className="pr-s" style={{"color":"var(--d-a)","fontWeight":"700"}}>Wakad Square ←</div></div><div className="tag tb">7-C</div></div>
            <div className="pr" onClick={() => {}}><div className="pchk"></div><div style={{"flex":"1"}}><div className="pr-n">Ishita Desai</div><div className="pr-s" style={{"color":"var(--d-a)","fontWeight":"700"}}>Wakad Square ←</div></div><div className="tag ty">9-A</div></div>
            <div className="pr" onClick={() => {}}><div className="pchk on" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div style={{"flex":"1"}}><div className="pr-n">Rudra Patel</div><div className="pr-s">Aundh IT Park</div></div><div className="tag tr">10-B</div></div>
          </div>

          <div className="sh sr d5"><div className="sh-t">Parent Alerts</div></div>
          <div className="nbtns sr d5">
            <button className="nbtn" style={{"background":"#F0FDF4","color":"#166534"}} onClick={() => {}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#166534","verticalAlign":"middle"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span> Share Location</button>
            <button className="nbtn" style={{"background":"#DCFCE7","color":"#166534"}} onClick={() => {}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#166534","verticalAlign":"middle"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 17H2a3 3 0 004-4V9a8 8 0 0116 0v4a3 3 0 004 4z"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></span> Arrival Alert</button>
          </div>
          <div style={{"padding":"0 16px 10px"}}><button className="nbtn" style={{"width":"100%","background":"#FFFBEB","color":"#92400E"}} onClick={() => {}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#92400E","verticalAlign":"middle"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#notif)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></span> Broadcast Delay Alert</button></div>

          <div className="sos sr d6" onClick={() => {}}>
            <div className="sos-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#DC2626"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5"/></svg></span></div>
            <div><div className="sos-t">Emergency SOS</div><div className="sos-s">Instantly alerts school & all emergency contacts</div></div>
          </div>
          </div>

          
          <div id="asst-only-content" style={{"display":"none"}}>
            <div className="asst-hero sr d1">
              <div className="asst-role-tag">🟡 Bus Assistant · Route 3</div>
              <div className="asst-busnum">MH 12 AB 4567</div>
              <div className="asst-route">Morning Shift · Driver: Ravi Kumar</div>
              <div className="asst-stats">
                <div><div className="asst-stat-val">22</div><div className="asst-stat-lbl">On Board</div></div>
                <div><div className="asst-stat-val">12</div><div className="asst-stat-lbl">Pending</div></div>
                <div><div className="asst-stat-val">3</div><div className="asst-stat-lbl">Next Stop</div></div>
              </div>
            </div>
            <div className="sh sr d2"><div className="sh-t">Onboard Checklist</div><div style={{"fontSize":"10px","fontWeight":"800","padding":"4px 10px","borderRadius":"100px","background":"var(--d-soft)","color":"var(--d-a)"}}>Tap to mark</div></div>
            <div className="card sr d2">
              <div className="pr" onClick={() => {}}><div className="pchk on" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div style={{"flex":"1"}}><div className="pr-n">Aarav Sharma</div><div className="pr-s">Boarded · Koregaon Park</div></div><div className="tag tg">8-A</div></div>
              <div className="pr" onClick={() => {}}><div className="pchk on" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div style={{"flex":"1"}}><div className="pr-n">Diya Iyer</div><div className="pr-s">Boarded · Baner Phata</div></div><div className="tag tv">6-B</div></div>
              <div className="pr" onClick={() => {}}><div className="pchk"></div><div style={{"flex":"1"}}><div className="pr-n">Arnav Kulkarni</div><div className="pr-s" style={{"color":"var(--d-a)","fontWeight":"700"}}>Waiting · Wakad Square</div></div><div className="tag tb">7-C</div></div>
              <div className="pr" onClick={() => {}}><div className="pchk"></div><div style={{"flex":"1"}}><div className="pr-n">Ishita Desai</div><div className="pr-s" style={{"color":"var(--d-a)","fontWeight":"700"}}>Waiting · Wakad Square</div></div><div className="tag ty">9-A</div></div>
              <div className="pr" onClick={() => {}}><div className="pchk on" style={{"display":"flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg></div><div style={{"flex":"1"}}><div className="pr-n">Rudra Patel</div><div className="pr-s">Boarded · Aundh IT Park</div></div><div className="tag tr">10-B</div></div>
            </div>
            <div className="sh sr d3"><div className="sh-t">Quick Actions</div></div>
            <div className="acts sr d3">
              <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#nav-faceid)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7V5a2 2 0 012-2h2M16 3h2a2 2 0 012 2v2M2 17v2a2 2 0 002 2h2M16 21h2a2 2 0 002-2v-2"/><circle cx="9" cy="10" r="1.5" fill="url(#nav-faceid)"/><circle cx="15" cy="10" r="1.5" fill="url(#nav-faceid)"/><path d="M9 16c1 1 5 1 6 0"/></svg></span></div><div className="a-lbl">Face Scan</div></div>
              <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#nav-msgs)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.82a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg></span></div><div className="a-lbl">Call Driver</div></div>
              <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#notif)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17H2a3 3 0 004-4V9a8 8 0 0116 0v4a3 3 0 004 4z"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></span></div><div className="a-lbl">Alert School</div></div>
              <div className="act" onClick={() => {}}><div className="a-ico"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#save)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/></svg></span></div><div className="a-lbl">Report</div></div>
            </div>
            <div className="sos sr d4" style={{"marginTop":"8px"}} onClick={() => {}}>
              <div className="sos-ico"><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#DC2626"}}><svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5"/></svg></span></div>
              <div><div className="sos-t">Emergency SOS</div><div className="sos-s">Alert driver &amp; school immediately</div></div>
            </div>
          </div>

        </div>


        
        <div className="dash" id="d-d-face">
          <div className="tbar">
            <div><div className="tbar-hi" id="fr-mode-label"><span style={{"display":"inline-flex","alignItems":"center","gap":"5px"}}><span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#22c55e","display":"inline-block","marginRight":"3px","verticalAlign":"middle","boxShadow":"0 0 5px rgba(34,197,94,.6)"}}></span>Pickup Scan Mode</span></div><div className="tbar-name">Face <b>Recognition</b></div></div>
            <div className="tbar-r">
              <div className="tbar-btn" onClick={() => {}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#drv-sos)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/><polyline points="12,7 12,12 15,15"/></svg></span></div>
              <div className="tbar-btn" onClick={() => {}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#refresh)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg></span></div>
            </div>
          </div>

          
          <div className="fr-mode-bar">
            <button className="fr-mode-btn active" id="fr-btn-pickup" onClick={() => {}}><span style={{"display":"inline-flex","alignItems":"center","gap":"5px"}}><span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#22c55e","display":"inline-block","marginRight":"3px","verticalAlign":"middle","boxShadow":"0 0 5px rgba(34,197,94,.6)"}}></span>Pickup Mode</span></button>
            <button className="fr-mode-btn" id="fr-btn-drop" onClick={() => {}}><span style={{"display":"inline-flex","alignItems":"center","gap":"5px"}}><span style={{"width":"8px","height":"8px","borderRadius":"50%","background":"#ef4444","display":"inline-block","marginRight":"3px","verticalAlign":"middle","boxShadow":"0 0 5px rgba(239,68,68,.6)"}}></span>Drop Mode</span></button>
          </div>

          
          <div className="fr-stats-row" style={{"marginTop":"12px"}}>
            <div className="fr-stat"><div className="fr-stat-num" id="fr-stat-scanned" style={{"color":"var(--d-a)"}}>0</div><div className="fr-stat-lbl">Scanned</div></div>
            <div className="fr-stat"><div className="fr-stat-num" id="fr-stat-pickup" style={{"color":"#16a34a"}}>22</div><div className="fr-stat-lbl">Picked Up</div></div>
            <div className="fr-stat"><div className="fr-stat-num" id="fr-stat-drop" style={{"color":"#7c3aed"}}>0</div><div className="fr-stat-lbl">Dropped</div></div>
            <div className="fr-stat"><div className="fr-stat-num" id="fr-stat-pending" style={{"color":"#d97706"}}>12</div><div className="fr-stat-lbl">Pending</div></div>
          </div>

          
          <div className="fr-camera-wrap" id="fr-camera">
            <div className="fr-grid" id="fr-grid"></div>
            <div className="fr-corner tl"></div>
            <div className="fr-corner tr"></div>
            <div className="fr-corner bl"></div>
            <div className="fr-corner br"></div>
            <div className="fr-scan-line" id="fr-scan-line"></div>
            <div className="fr-silhouette" id="fr-silhouette">
              <svg width="100" height="140" viewBox="0 0 100 140" fill="none">
                <ellipse cx="50" cy="35" rx="26" ry="30" fill="white"/>
                <path d="M5 140 C5 100 20 80 50 80 C80 80 95 100 95 140" fill="white"/>
              </svg>
            </div>
            <div className="fr-status-badge" id="fr-status-badge">
              <div className="frsb-dot idle" id="fr-status-dot"></div>
              <span id="fr-status-text">Position student in frame</span>
            </div>
            <div className="fr-face-box" id="fr-face-box">
              <div className="fr-face-label" id="fr-face-label">Detecting…</div>
            </div>
            <div className="fr-dots" id="fr-dots"></div>
            <div className="fr-confidence" id="fr-confidence">
              <div className="frc-label">Match</div>
              <div className="frc-bar-track"><div className="frc-bar-fill" id="fr-conf-bar" style={{"width":"0%"}}></div></div>
              <div className="frc-pct" id="fr-conf-pct">0%</div>
            </div>
            <div className="fr-cam-label" id="fr-cam-label">Tap SCAN to begin face recognition</div>
          </div>

          
          <button className="fr-scan-btn pickup" id="fr-scan-btn" onClick={() => {}}>
            <span className="fr-scan-btn-ico" id="fr-scan-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#fff"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M2 7V5a2 2 0 012-2h2M16 3h2a2 2 0 012 2v2M2 17v2a2 2 0 002 2h2M16 21h2a2 2 0 002-2v-2"/><circle cx="12" cy="12" r="4"/></svg></span></span>
            <span id="fr-scan-text">Scan Face</span>
          </button>

          
          <div className="fr-result" id="fr-result">
            <div className="frr-top">
              <div className="frr-avatar" id="frr-avatar">AK</div>
              <div className="frr-info">
                <div className="frr-name" id="frr-name">Ananya Krishnan</div>
                <div className="frr-meta">
                  <div className="frr-class" id="frr-class">Class 8-A</div>
                  <div className="frr-route" id="frr-route">Roll #01 · Koregaon Park</div>
                </div>
              </div>
            </div>
            <div className="frr-status-row">
              <div className="frr-status-lbl">Recognition Status</div>
              <div className="frr-status-val" id="frr-status-val" style={{"background":"#DCFCE7","color":"#166534"}}><span style={{"display":"inline-flex","alignItems":"center","gap":"4px"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-faceid)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg> Matched</span></div>
            </div>
            <div className="frr-confidence-row" style={{"marginBottom":"6px"}}>
              <div className="frr-conf-lbl">Confidence</div>
              <div className="frr-conf-track"><div className="frr-conf-fill" id="frr-conf-fill" style={{"width":"96%","background":"linear-gradient(90deg,#22c55e,#16a34a)"}}></div></div>
              <div className="frr-conf-pct" id="frr-conf-pct" style={{"color":"#16a34a"}}>96%</div>
            </div>
            <div className="frr-confidence-row">
              <div className="frr-conf-lbl">Liveness</div>
              <div className="frr-conf-track"><div className="frr-conf-fill" style={{"width":"99%","background":"linear-gradient(90deg,#06b6d4,#0e7490)"}}></div></div>
              <div className="frr-conf-pct" style={{"color":"#0e7490"}}>99%</div>
            </div>
            <div className="frr-actions">
              <button className="frr-confirm" id="frr-confirm-btn" onClick={() => {}} style={{"background":"linear-gradient(135deg,#22c55e,#16a34a)","color":"#fff","boxShadow":"0 4px 14px rgba(34,197,94,.3)"}}><span style={{"display":"inline-flex","alignItems":"center","gap":"5px"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="url(#nav-approve)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg> Confirm Pickup</span></button>
              <button className="frr-rescan" onClick={() => {}}>↩ Rescan</button>
            </div>
          </div>

          
          <div className="fr-nomatch" id="fr-nomatch">
            <div className="frnm-ico" style={{"display":"flex","justifyContent":"center","color":"#DC2626"}}><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="url(#nav-approve)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5"/></svg></div>
            <div className="frnm-title">Face Not Recognized</div>
            <div className="frnm-sub">No matching student found in the system.<br />Please verify manually or try again.</div>
            <button className="frnm-retry" onClick={() => {}}>Try Again</button>
          </div>

          
          <div id="fr-hist-section" style={{"display":"none"}}>
            <div className="sh" style={{"paddingTop":"16px"}}>
              <div className="sh-t">Recognition Log</div>
              <button className="sh-more" style={{"background":"var(--d-soft)","color":"var(--d-a)","border":"none","cursor":"pointer","fontFamily":"'Satoshi',sans-serif","borderRadius":"100px","padding":"4px 12px","fontSize":"11.5px","fontWeight":"700"}} onClick={() => {}}>Clear All</button>
            </div>
            <div className="card" id="fr-hist-list">
              <div style={{"padding":"20px","textAlign":"center","color":"var(--ink4)","fontSize":"12px","fontWeight":"600"}}>No records yet. Scan a student to begin.</div>
            </div>
          </div>

          <div style={{"height":"20px"}}></div>
        </div>

        
        <div className="dash" id="d-a-home">
          <div className="tbar">
            <div><div className="tbar-hi"><span style={{"display":"inline-flex","alignItems":"center","gap":"4px","verticalAlign":"middle"}}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><rect x="9" y="14" width="6" height="8"/></svg> Good morning, Principal</span></div><div className="tbar-name">Arjun <b>Mehra</b></div></div>
            <div className="tbar-r">
              <div className="tbar-btn" onClick={() => {}}><span className="ic" style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"inherit"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 17H2a3 3 0 004-4V9a8 8 0 0116 0v4a3 3 0 004 4z"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></span><div className="tbar-badge" style={{"background":"var(--a-a)"}}>12</div></div>
              <div className="tbar-av" style={{"background":"var(--a-grad)"}}>AM</div>
            </div>
          </div>

          
          <div className="ghero sr d1" style={{"background":"var(--a-grad)"}}>
            <div className="gh-mesh"></div>
            <div className="gh-blob" style={{"width":"200px","height":"200px","background":"rgba(255,255,255,.12)","top":"-50px","right":"-30px"}}></div>
            <div className="gh-blob" style={{"width":"130px","height":"130px","background":"rgba(255,255,255,.08)","bottom":"-20px","left":"20px","animationDelay":"3s"}}></div>
            <div className="gh-c">
              <div className="gh-pill"><span style={{"display":"inline-flex","alignItems":"center","gap":"5px"}}><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Fee Collection · March 2025</span></div>
              <div className="gh-num">₹42.6L <sub>/ ₹58L</sub></div>
              <div className="gh-sub">73.4% collected &nbsp;·&nbsp; ₹15.4L pending</div>
              <div className="gh-bar">
                <div className="gh-track"><div className="gh-fill" style={{"width":"73.4%"}}></div></div>
                <div className="gh-blabels"><div className="gh-blabel">0%</div><div className="gh-blabel" style={{"color":"#fff","fontWeight":"800"}}>73.4%</div><div className="gh-blabel">Target</div></div>
              </div>
            </div>
          </div>

          
          <div className="tiles sr d2">
            <div className="tile" onClick={() => {}}><span className="t-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-finance)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></span></span><div className="t-num">1,847</div><div className="t-lbl">Students</div><div className="t-ch" style={{"color":"#16a34a"}}>↑ 23</div></div>
            <div className="tile" onClick={() => {}}><span className="t-ico" style={{"animationDelay":".5s"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#tile-users)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11h2M16 15h2M16 19h2"/></svg></span></span><div className="t-num">92</div><div className="t-lbl">Staff</div><div className="t-ch" style={{"color":"#d97706"}}>4 leave</div></div>
            <div className="tile" onClick={() => {}}><span className="t-ico" style={{"animationDelay":"1s"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#nav-profile)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="3" width="20" height="16" rx="3"/><path d="M2 11h20"/><circle cx="7" cy="22" r="1.5" fill="currentColor"/><circle cx="17" cy="22" r="1.5" fill="currentColor"/><path d="M7 19v3M17 19v3M6 7h4M14 7h4"/></svg></span></span><div className="t-num">8</div><div className="t-lbl">Buses</div><div className="t-ch" style={{"color":"#16a34a"}}>All live</div></div>
          </div>

          
          <div className="sh sr d3"><div className="sh-t">Weekly Fee Collection</div><button className="sh-more" style={{"background":"var(--a-soft)","color":"var(--a-a)"}}>This Week</button></div>
          <div className="card sr d3" style={{"padding":"14px 0 14px"}}>
            <div className="fbars">
              <div className="fbar" style={{"height":"52%","background":"linear-gradient(to top,var(--a-a),rgba(255,149,0,.4))"}} data-v="₹6.2L"></div>
              <div className="fbar" style={{"height":"68%","background":"linear-gradient(to top,var(--a-a),rgba(255,149,0,.4))"}} data-v="₹8.1L"></div>
              <div className="fbar" style={{"height":"45%","background":"linear-gradient(to top,var(--a-a),rgba(255,149,0,.4))"}} data-v="₹5.4L"></div>
              <div className="fbar" style={{"height":"83%","background":"linear-gradient(to top,var(--a-a),rgba(255,149,0,.4))"}} data-v="₹9.7L"></div>
              <div className="fbar" style={{"height":"64%","background":"linear-gradient(to top,var(--a-a),rgba(255,149,0,.4))"}} data-v="₹7.4L"></div>
              <div className="fbar" style={{"height":"37%","background":"linear-gradient(to top,rgba(255,149,0,.3),rgba(255,149,0,.1))"}} data-v="₹4.2L"></div>
            </div>
            <div className="flabels">
              <div className="flabel">Mon</div><div className="flabel">Tue</div><div className="flabel">Wed</div>
              <div className="flabel">Thu</div><div className="flabel">Fri</div><div className="flabel" style={{"color":"var(--a-a)","fontWeight":"800"}}>Today</div>
            </div>
            <div style={{"margin":"12px 16px 0","paddingTop":"12px","borderTop":"1.5px solid var(--line)","display":"flex","justifyContent":"space-between"}}>
              <div><div style={{"fontSize":"11px","color":"var(--ink3)"}}>Weekly Total</div><div style={{"fontFamily":"'Clash Display',sans-serif","fontSize":"22px","fontWeight":"700","color":"var(--a-a)"}}>₹41.0L</div></div>
              <div style={{"textAlign":"right"}}><div style={{"fontSize":"11px","color":"var(--ink3)"}}>vs Last Week</div><div style={{"fontSize":"18px","fontWeight":"800","color":"#16a34a"}}>↑ 18.4%</div></div>
            </div>
          </div>

          
          <div className="sh sr d4"><div className="sh-t">Today's Attendance</div></div>
          <div className="card sr d4" style={{"padding":"14px"}}>
            <div style={{"display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"8px","marginBottom":"14px"}}>
              <div style={{"textAlign":"center","padding":"12px 6px","background":"#F0FDF4","borderRadius":"16px","border":"1.5px solid rgba(22,163,74,.2)"}}>
                <div style={{"fontFamily":"'Clash Display',sans-serif","fontSize":"22px","fontWeight":"700","color":"#166534"}}>1,692</div>
                <div style={{"fontSize":"9.5px","fontWeight":"800","color":"#16a34a","textTransform":"uppercase","letterSpacing":".4px","marginTop":"3px"}}>Present</div>
              </div>
              <div style={{"textAlign":"center","padding":"12px 6px","background":"#FEF2F2","borderRadius":"16px","border":"1.5px solid rgba(220,38,38,.2)"}}>
                <div style={{"fontFamily":"'Clash Display',sans-serif","fontSize":"22px","fontWeight":"700","color":"#991B1B"}}>155</div>
                <div style={{"fontSize":"9.5px","fontWeight":"800","color":"#dc2626","textTransform":"uppercase","letterSpacing":".4px","marginTop":"3px"}}>Absent</div>
              </div>
              <div style={{"textAlign":"center","padding":"12px 6px","background":"#FFFBEB","borderRadius":"16px","border":"1.5px solid rgba(217,119,6,.2)"}}>
                <div style={{"fontFamily":"'Clash Display',sans-serif","fontSize":"22px","fontWeight":"700","color":"#92400E"}}>91.6%</div>
                <div style={{"fontSize":"9.5px","fontWeight":"800","color":"#d97706","textTransform":"uppercase","letterSpacing":".4px","marginTop":"3px"}}>Rate</div>
              </div>
            </div>
            <div style={{"fontSize":"10px","fontWeight":"800","color":"var(--ink3)","textTransform":"uppercase","letterSpacing":".7px","marginBottom":"10px"}}>Staff Breakdown</div>
            <div className="prow"><div className="pname">Teachers</div><div className="ptrack"><div className="pfill" style={{"width":"95%","background":"linear-gradient(90deg,#22c55e,#16a34a)"}}></div></div><div className="pval" style={{"color":"#16a34a"}}>95%</div></div>
            <div className="prow"><div className="pname">Admin</div><div className="ptrack"><div className="pfill" style={{"width":"100%","background":"linear-gradient(90deg,#22c55e,#16a34a)"}}></div></div><div className="pval" style={{"color":"#16a34a"}}>100%</div></div>
            <div className="prow"><div className="pname">Support</div><div className="ptrack"><div className="pfill" style={{"width":"88%","background":"linear-gradient(90deg,#f59e0b,#d97706)"}}></div></div><div className="pval" style={{"color":"#d97706"}}>88%</div></div>
          </div>

          
          <div className="sh sr d5">
            <div className="sh-t">Pending Approvals</div>
            <div style={{"fontSize":"10.5px","fontWeight":"800","padding":"4px 11px","borderRadius":"100px","background":"#FEE2E2","color":"#991B1B","border":"1.5px solid rgba(220,38,38,.2)"}}>7 pending</div>
          </div>
          <div className="appr sr d5">
            <div className="apr-top"><div className="apr-ic" style={{"background":"#F5F3FF"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#7c3aed"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M8 21l2-4M16 21l-2-4M5 17l7-3 7 3"/></svg></span></div><div><div className="apr-n">Ms. Rekha Nair</div><div className="apr-type">Medical Leave Request · 2 days</div></div></div>
            <div className="apr-body">Mar 15–16 · "Routine surgery follow-up appointment"</div>
            <div className="apr-btns"><button className="abtn-ok" onClick={() => {}}>Approve</button><button className="abtn-no" onClick={() => {}}>Decline</button></div>
          </div>
          <div className="appr sr d6">
            <div className="apr-top"><div className="apr-ic" style={{"background":"#FFFBEB"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#d97706"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="url(#nav-profile)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span></div><div><div className="apr-n">Rahul Mehta (Parent)</div><div className="apr-type">50% Fee Waiver · Student in 7-B</div></div></div>
            <div className="apr-body">Aditya Mehta · Term 2 · Reason: financial hardship</div>
            <div className="apr-btns"><button className="abtn-ok" onClick={() => {}}>Approve</button><button className="abtn-no" onClick={() => {}}>Decline</button></div>
          </div>
          <div className="appr sr d7">
            <div className="apr-top"><div className="apr-ic" style={{"background":"#F0FDF4"}}><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","color":"#16a34a"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/></svg></span></div><div><div className="apr-n">New Admission</div><div className="apr-type">Priya Subramaniam · Class 4</div></div></div>
            <div className="apr-body">Docs verified · Fee paid · Transfer cert. received</div>
            <div className="apr-btns"><button className="abtn-ok" onClick={() => {}}>Confirm</button><button className="abtn-no" onClick={() => {}}>Hold</button></div>
          </div>

          
          <div className="sh sr d8"><div className="sh-t">All 12 Modules</div><button className="sh-more" style={{"background":"var(--a-soft)","color":"var(--a-a)"}}>Manage All</button></div>
          <div className="mods sr">
            <div className="mod" style={{"-Mb":"rgba(255,107,53,.08)"}} onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></span></div><div className="mod-n">Admissions</div><div className="mod-badge" style={{"background":"var(--a-a)"}}>3</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></span></div><div className="mod-n">Students</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2L16 12"/></svg></span></div><div className="mod-n">Attendance</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a2 2 0 010 4H9v4h6"/></svg></span></div><div className="mod-n">Fees</div><div className="mod-badge" style={{"background":"#f59e0b"}}>7</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><path d="M9 15l1.5 1.5L14 13"/></svg></span></div><div className="mod-n">Exams</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#mod-exm)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg></span></div><div className="mod-n">Parents</div><div className="mod-badge" style={{"background":"#3b82f6"}}>2</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></span></div><div className="mod-n">Analytics</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h2v4H8z" fill="currentColor" stroke="none"/><path d="M13 14h2v2h-2z" fill="currentColor" stroke="none"/></svg></span></div><div className="mod-n">Timetable</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="3" width="20" height="14" rx="3"/><path d="M2 11h20"/><circle cx="7" cy="20" r="1.5" fill="currentColor"/><circle cx="17" cy="20" r="1.5" fill="currentColor"/><path d="M7 17v3M17 17v3"/></svg></span></div><div className="mod-n">Transport</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg></span></div><div className="mod-n">Library</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg></span></div><div className="mod-n">HR Staff</div></div>
            <div className="mod" onClick={() => {}}><div className="mod-ico"><span className="ic " style={{"display":"inline-flex","alignItems":"center","justifyContent":"center"}} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><rect x="9" y="14" width="6" height="8"/></svg></span></div><div className="mod-n">Hostel</div></div>
          </div>

          
          <div className="sh sr"><div className="sh-t">Live Alerts</div><div style={{"display":"flex","alignItems":"center","gap":"6px","background":"#FEF2F2","border":"1.5px solid rgba(220,38,38,.2)","padding":"4px 11px","borderRadius":"100px"}}><div style={{"width":"7px","height":"7px","borderRadius":"50%","background":"#ef4444","animation":"lp 1.2s infinite"}}></div><div style={{"fontSize":"10px","fontWeight":"800","color":"#991B1B"}}>4 new</div></div></div>
          <div className="card sr" style={{"marginBottom":"20px"}}>
            <div className="alrt"><div className="adot" style={{"background":"#ef4444"}}></div><div className="atxt">Bus #3 delayed 15 min on Route 3 — parents notified via app</div><div className="atime">9:02</div></div>
            <div className="alrt"><div className="adot" style={{"background":"#f59e0b"}}></div><div className="atxt">23 students with fee dues exceeding 60 days — auto reminders queued</div><div className="atime">8:45</div></div>
            <div className="alrt"><div className="adot" style={{"background":"#16a34a"}}></div><div className="atxt">Term 2 exam timetable published — 1,847 students notified</div><div className="atime">8:30</div></div>
            <div className="alrt"><div className="adot" style={{"background":"#6366f1"}}></div><div className="atxt">New Grade 6 inquiry from Sanjay Pillai — assigned to admissions team</div><div className="atime">8:15</div></div>
          </div>
        </div>

      
      
      
      </div>

            
      ` }} />
  );
}
