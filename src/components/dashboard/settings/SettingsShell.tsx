"use client";

import { usePathname } from "next/navigation";

export function SettingsShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // ID Card Designer needs full-screen treatment
    if (pathname?.includes("/id-cards/designer")) {
        return <div style={{ margin: "-32px" }}>{children}</div>;
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
                @keyframes bounceIn{0%{transform:scale(0.85)}55%{transform:scale(1.05)}100%{transform:scale(1)}}
                @keyframes slideRight{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
                @keyframes scaleIn{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
                @keyframes ripple{to{transform:scale(4);opacity:0}}
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes spinReverse{to{transform:rotate(-360deg)}}
                @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
                ::-webkit-scrollbar{width:4px}
                ::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:4px}
                ::-webkit-scrollbar-thumb:hover{background:#F59E0B}
            `}</style>
            {children}
        </>
    );
}
