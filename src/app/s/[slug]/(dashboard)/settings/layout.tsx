"use client";

import { usePathname } from "next/navigation";

export default function SettingsLayout({
    children
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isDesigner = pathname.includes('/id-cards/designer');

    // ID Card Designer needs special full-screen treatment
    if (isDesigner) {
        return <div className="-m-8">{children}</div>;
    }

    // All other settings pages use standard dashboard layout
    return <>{children}</>;
}
