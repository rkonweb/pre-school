"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/erp-ui";
import { CircularForm } from "@/components/dashboard/circulars/CircularForm";
import { updateCircularAction, getCircularAction } from "@/app/actions/circular-actions";
import { toast } from "sonner";

export default function EditCircularPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const id = params.id as string;

    const [circular, setCircular] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCircular() {
            const res = await getCircularAction(id, slug);
            if (res.success) {
                setCircular(res.data);
            } else {
                toast.error(res.error || "Failed to load circular");
                router.push(`/s/${slug}/circulars`);
            }
            setIsLoading(false);
        }
        loadCircular();
    }, [id, slug, router]);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-20">
            <SectionHeader
                title="Edit Circular"
                subtitle={`Modify circular: ${circular?.title}`}
                icon={Bell}
            />

            <CircularForm 
                slug={slug} 
                initialData={circular}
                onSubmit={(data) => updateCircularAction(id, slug, data)} 
            />
        </div>
    );
}
