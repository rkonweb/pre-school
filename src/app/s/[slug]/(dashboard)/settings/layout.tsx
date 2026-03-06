"use client";

import { SettingsShell } from "@/components/dashboard/settings/SettingsShell";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SettingsShell>{children}</SettingsShell>;
}
