"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

interface CreateTemplateButtonProps {
    slug: string;
}

export function CreateTemplateButton({ slug }: CreateTemplateButtonProps) {
    return (
        <Link 
            href={`/s/${slug}/settings/id-cards/designer/new`}
            style={{ padding: "10px 22px", borderRadius: 12, background: "var(--school-gradient, linear-gradient(135deg,#F59E0B,#F97316))", color: "var(--secondary-color, white)", textDecoration: "none", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 4px 16px rgba(var(--brand-color-rgb, 245, 158, 11), 0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
        >
            <Plus className="h-4 w-4" /> Create Template
        </Link>
    );
}
