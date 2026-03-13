
import React, { ReactNode } from 'react';
import './staff-app.css';

export function StaffAppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{minHeight: "100vh", position: "relative", overflow: "hidden", fontFamily: "'Satoshi', sans-serif"}}>
      <div dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute; width:0; height:0; overflow:hidden;" aria-hidden="true">
<defs>
  <linearGradient id="nav-home" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FF6B6B"/><stop offset="100%" stopColor="#FF8E53"/></linearGradient>
  <filter id="glow-nav-home" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-attend" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ECDC4"/><stop offset="100%" stopColor="#44CF6C"/></linearGradient>
  <filter id="glow-nav-attend" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-marks" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#60A5FA"/></linearGradient>
  <filter id="glow-nav-marks" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-msgs" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#FB923C"/></linearGradient>
  <filter id="glow-nav-msgs" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-profile" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-nav-profile" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-route" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#60A5FA"/></linearGradient>
  <filter id="glow-nav-route" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-log" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F472B6"/></linearGradient>
  <filter id="glow-nav-log" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-faceid" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#38BDF8"/></linearGradient>
  <filter id="glow-nav-faceid" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-approve" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-nav-approve" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-finance" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-nav-finance" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-reports" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#C084FC"/></linearGradient>
  <filter id="glow-nav-reports" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="nav-settings" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#38BDF8"/></linearGradient>
  <filter id="glow-nav-settings" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-attend" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ECDC4"/><stop offset="100%" stopColor="#44CF6C"/></linearGradient>
  <filter id="glow-act-attend" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-marks" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#60A5FA"/></linearGradient>
  <filter id="glow-act-marks" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-book" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FB923C"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient>
  <filter id="glow-act-book" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-leave" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-act-leave" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-broad" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#FB923C"/></linearGradient>
  <filter id="glow-act-broad" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-chat" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ECDC4"/><stop offset="100%" stopColor="#38BDF8"/></linearGradient>
  <filter id="glow-act-chat" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-cal" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-act-cal" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="act-chart" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#C084FC"/></linearGradient>
  <filter id="glow-act-chart" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-clock" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#FB7185"/></linearGradient>
  <filter id="glow-tile-clock" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-warn" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-tile-warn" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-star" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F59E0B"/></linearGradient>
  <filter id="glow-tile-star" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-users" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-tile-users" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-staff" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#A78BFA"/></linearGradient>
  <filter id="glow-tile-staff" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="tile-bus" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#059669"/></linearGradient>
  <filter id="glow-tile-bus" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="att-present" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-att-present" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="att-absent" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F87171"/><stop offset="100%" stopColor="#FB923C"/></linearGradient>
  <filter id="glow-att-absent" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="att-leave" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-att-leave" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-adm" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F87171"/><stop offset="100%" stopColor="#FB923C"/></linearGradient>
  <filter id="glow-mod-adm" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-stu" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-mod-stu" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-att" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-mod-att" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-fee" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-mod-fee" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-exm" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#C084FC"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-mod-exm" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-par" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#4ECDC4"/></linearGradient>
  <filter id="glow-mod-par" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-ana" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#C084FC"/></linearGradient>
  <filter id="glow-mod-ana" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-tim" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#FB7185"/></linearGradient>
  <filter id="glow-mod-tim" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-tra" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#059669"/></linearGradient>
  <filter id="glow-mod-tra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-lib" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FB923C"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient>
  <filter id="glow-mod-lib" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-hr" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#60A5FA"/></linearGradient>
  <filter id="glow-mod-hr" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="mod-hos" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-mod-hos" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-bell" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-drv-bell" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-map" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F87171"/><stop offset="100%" stopColor="#F472B6"/></linearGradient>
  <filter id="glow-drv-map" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-clock" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#38BDF8"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-drv-clock" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="drv-sos" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FF4444"/><stop offset="100%" stopColor="#FF0080"/></linearGradient>
  <filter id="glow-drv-sos" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="role-teacher" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FF5733"/><stop offset="100%" stopColor="#FF8E53"/></linearGradient>
  <filter id="glow-role-teacher" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="role-driver" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#006BFF"/><stop offset="100%" stopColor="#00D4AA"/></linearGradient>
  <filter id="glow-role-driver" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="role-admin" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FF9500"/><stop offset="100%" stopColor="#FFCC02"/></linearGradient>
  <filter id="glow-role-admin" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="fr-scan" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#00D4AA"/><stop offset="100%" stopColor="#006BFF"/></linearGradient>
  <filter id="glow-fr-scan" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="fr-radar" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#38BDF8"/></linearGradient>
  <filter id="glow-fr-radar" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="apr-teacher" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#818CF8"/></linearGradient>
  <filter id="glow-apr-teacher" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="apr-shield" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-apr-shield" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="apr-grad" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-apr-grad" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="logo" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="100%" stopColor="#E0E7FF"/></linearGradient>
  <filter id="glow-logo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="notif" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-notif" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="refresh" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-refresh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="history" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#A78BFA"/></linearGradient>
  <filter id="glow-history" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="save" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-save" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="sun" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <filter id="glow-sun" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="check-mini" x1="0.00" y1="0.50" x2="1.00" y2="0.50" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-check-mini" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="school-top" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#C084FC"/></linearGradient>
  <filter id="glow-school-top" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="bus-top" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#34D399"/><stop offset="100%" stopColor="#22D3EE"/></linearGradient>
  <filter id="glow-bus-top" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="broadcast" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#FB923C"/></linearGradient>
  <filter id="glow-broadcast" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  
  <linearGradient id="sc-shield" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#1E3A5F"/><stop offset="100%" stopColor="#2563EB"/></linearGradient>
  <linearGradient id="sc-qr" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient>
  <linearGradient id="sc-face" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#DC2626"/><stop offset="100%" stopColor="#F97316"/></linearGradient>
  <linearGradient id="sc-log" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#059669"/><stop offset="100%" stopColor="#0D9488"/></linearGradient>
  <linearGradient id="sc-alert" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#DC2626"/><stop offset="100%" stopColor="#B91C1C"/></linearGradient>
  
  <linearGradient id="tm-bus" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#047857"/><stop offset="100%" stopColor="#059669"/></linearGradient>
  <linearGradient id="tm-fleet" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#059669"/><stop offset="100%" stopColor="#D97706"/></linearGradient>
  <linearGradient id="tm-route" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient>
  <linearGradient id="tm-fee" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#D97706"/><stop offset="100%" stopColor="#F59E0B"/></linearGradient>
  <linearGradient id="tm-driver" x1="0.15" y1="0.15" x2="0.85" y2="0.85" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#047857"/><stop offset="100%" stopColor="#0D9488"/></linearGradient>
</defs>
</svg>` }} />
      <div className="geo g1"></div>
<div className="geo g2"></div>
<div className="geo g3"></div>
      <div className="shell">
        <div className="side">
          
    <div className="side-logo">
      <div className="logo-mark"><span className="ic " aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#tile-bus)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/></svg></span></div>
      <div>
        <div className="logo-name">EduSphere</div>
        <div className="logo-tag">Staff App</div>
      </div>
    </div>

    <div id="rc-teacher" className="role-card t-card active" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico"><span className="ic " aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#logo)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M8 21l2-4M16 21l-2-4M5 17l7-3 7 3"/></svg></span></div>
        <div>
          <div className="rc-name">Priya Sharma</div>
          <div className="rc-sub">Mathematics · Grade 8</div>
        </div>
        <div className="rc-indicator" id="dot-t"></div>
      </div>
    </div>

    <div id="rc-driver" className="role-card d-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico"><span className="ic " aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-profile)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="3" width="20" height="16" rx="3"/><path d="M2 11h20"/><circle cx="7" cy="22" r="1.5" fill="currentColor"/><circle cx="17" cy="22" r="1.5" fill="currentColor"/><path d="M7 19v3M17 19v3M6 7h4M14 7h4"/></svg></span></div>
        <div>
          <div className="rc-name">Ravi Kumar</div>
          <div className="rc-sub">Route 3 · Morning</div>
        </div>
        <div className="rc-indicator" id="dot-d"></div>
      </div>
    </div>

    <div id="rc-tm" className="role-card tm-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico"><span className="ic"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#tm-bus)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="3"/><path d="M2 11h20"/><circle cx="7" cy="20" r="1.5" fill="currentColor"/><circle cx="17" cy="20" r="1.5" fill="currentColor"/><path d="M7 17v3M17 17v3"/></svg></span></div>
        <div>
          <div className="rc-name">Suresh Nair</div>
          <div className="rc-sub">Transport Manager</div>
        </div>
        <div className="rc-indicator" id="dot-tm"></div>
      </div>
    </div>

    <div id="rc-admin" className="role-card a-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico"><span className="ic " aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-home)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10M12 6v3M10.5 7.5h3"/></svg></span></div>
        <div>
          <div className="rc-name">Arjun Mehra</div>
          <div className="rc-sub">Principal · Full Access</div>
        </div>
        <div className="rc-indicator" id="dot-a"></div>
      </div>
    </div>

    <div id="rc-acct" className="role-card ac-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico"><span className="ic " aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#nav-finance)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></span></div>
        <div>
          <div className="rc-name">Kavitha Iyer</div>
          <div className="rc-sub">Account Manager · Finance</div>
        </div>
        <div className="rc-indicator" id="dot-ac"></div>
      </div>
    </div>

    <div id="rc-hr" className="role-card hr-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico"><span className="ic " aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#tile-users)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></span></div>
        <div>
          <div className="rc-name">Meera Pillai</div>
          <div className="rc-sub">HR Manager · People Ops</div>
        </div>
        <div className="rc-indicator" id="dot-hr"></div>
      </div>
    </div>

    <div id="rc-security" className="role-card sc-card" onClick={() => {}}>
      <div className="rc-top">
        <div className="rc-ico"><span className="ic " aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#sc-shield)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span></div>
        <div>
          <div className="rc-name">Vikram Bose</div>
          <div className="rc-sub">Security Officer · Gate</div>
        </div>
        <div className="rc-indicator" id="dot-sc"></div>
      </div>
    </div>

    <div className="perms-box"><div className="pb-title">Access Permissions</div><div id="perms"></div></div>
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
                  <div className="s-bar" style={{width:"3px",height:"5px",borderRadius:"1px"}}></div>
                  <div className="s-bar" style={{width:"3px",height:"8px",borderRadius:"1px"}}></div>
                  <div className="s-bar" style={{width:"3px",height:"11px",borderRadius:"1px"}}></div>
                  <div className="s-bar" style={{width:"3px",height:"14px",borderRadius:"1px"}}></div>
                </div>
                <div className="s-batt"><div className="s-batt-f"></div></div>
              </div>
            </div>
            <div className="screen" id="scr">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
