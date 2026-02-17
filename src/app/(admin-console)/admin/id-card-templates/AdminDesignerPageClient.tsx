
"use client";

import { IDCardDesigner } from "@/components/id-cards/IDCardDesigner";
import { IDZone } from "@/components/id-cards/IDCardKonvaCanvas";
import { useRouter } from "next/navigation";
import { createIDCardTemplateAction, updateIDCardTemplateAction } from "@/app/actions/id-card-actions";
import { toast } from "sonner";
import { useState } from "react";

interface AdminDesignerPageClientProps {
    initialTemplate?: any;
}

export function AdminDesignerPageClient({ initialTemplate }: AdminDesignerPageClientProps) {
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
            isSystem: true,
            schoolId: undefined // Admin templates have no specific schoolId
        };

        let result;
        if (initialTemplate?.id) {
            result = await updateIDCardTemplateAction(initialTemplate.id, data, "admin");
        } else {
            result = await createIDCardTemplateAction(data, "admin");
        }

        if (result.success) {
            toast.success("System template saved successfully");
            router.push(`/admin/id-card-templates`);
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
                onBack={() => router.push(`/admin/id-card-templates`)}
            />
        </div>
    );
}
