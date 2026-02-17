"use client";

import { IDCardDesigner } from "@/components/id-cards/IDCardDesigner";
import { IDZone } from "@/components/id-cards/IDCardKonvaCanvas";
import { useRouter } from "next/navigation";
import { createIDCardTemplateAction, updateIDCardTemplateAction } from "@/app/actions/id-card-actions";
import { toast } from "sonner";
import { useState } from "react";

interface DesignerPageClientProps {
    slug: string;
    schoolId: string;
    initialTemplate?: any;
}

export function DesignerPageClient({ slug, schoolId, initialTemplate }: DesignerPageClientProps) {
    const router = useRouter();
    const [name, setName] = useState(initialTemplate?.name || "");

    const handleSave = async (zones: IDZone[], orientation: 'VERTICAL' | 'HORIZONTAL', canvasSettings: any) => {
        if (!name) {
            toast.error("Please enter a template name");
            return;
        }

        const data = {
            name,
            layout: JSON.stringify(zones),
            orientation,
            dimensions: orientation === 'HORIZONTAL' ? `${canvasSettings.width}x${canvasSettings.height}` : `${canvasSettings.width}x${canvasSettings.height}`,
            width: canvasSettings.width,
            height: canvasSettings.height,
            unit: canvasSettings.unit,
            bleed: canvasSettings.bleed,
            safeMargin: canvasSettings.safeMargin,
            schoolId
        };

        let result;
        if (initialTemplate?.id) {
            result = await updateIDCardTemplateAction(initialTemplate.id, data, slug);
        } else {
            result = await createIDCardTemplateAction(data, slug);
        }

        if (result.success) {
            toast.success("Template saved successfully");
            router.push(`/s/${slug}/settings/id-cards`);
            router.refresh();
        } else {
            toast.error("Failed to save template");
        }
    };

    return (
        <div className="h-full bg-zinc-50/30">
            <IDCardDesigner
                name={name}
                onNameChange={setName}
                initialZones={initialTemplate?.layout ? JSON.parse(initialTemplate.layout) : []}
                initialOrientation={initialTemplate?.orientation || 'VERTICAL'}
                initialCanvasSettings={{
                    width: initialTemplate?.width,
                    height: initialTemplate?.height,
                    unit: initialTemplate?.unit,
                    bleed: initialTemplate?.bleed,
                    safeMargin: initialTemplate?.safeMargin
                }}
                onSave={handleSave}
                onBack={() => router.push(`/s/${slug}/settings/id-cards`)}
            />
        </div>
    );
}
