"use client";

import { useParams } from "next/navigation";
import { Bell } from "lucide-react";
import { SectionHeader } from "@/components/ui/erp-ui";
import { CircularForm } from "@/components/dashboard/circulars/CircularForm";
import { createCircularAction } from "@/app/actions/circular-actions";

export default function NewCircularPage() {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="flex flex-col gap-6 pb-20">
            <SectionHeader
                title="Create New Circular"
                subtitle="Draft and broadcast a new announcement to your school community."
                icon={Bell}
            />

            <CircularForm 
                slug={slug} 
                onSubmit={createCircularAction} 
            />
        </div>
    );
}
