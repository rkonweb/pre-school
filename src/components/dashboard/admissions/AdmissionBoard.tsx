"use client";

import { useState } from "react";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdmissionBoardCard } from "./AdmissionBoardCard";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

const STAGES = [
    { id: "INQUIRY", label: "Inquiries", color: "text-brand bg-brand/10" },
    { id: "APPLICATION", label: "Applications", color: "text-purple-600 bg-purple-50" },
    { id: "INTERVIEW", label: "Interviews", color: "text-orange-600 bg-orange-50" },
    { id: "ENROLLED", label: "Enrolled", color: "text-green-600 bg-green-50" },
];

interface AdmissionBoardProps {
    admissions: any[];
    slug: string;
    onStageUpdate: (id: string, newStage: string) => Promise<void>;
}

export function AdmissionBoard({ admissions, slug, onStageUpdate }: AdmissionBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const admissionId = active.id;
        const overId = over.id;

        // Find which column it was dropped into
        const newStage = STAGES.find(s => s.id === overId)?.id ||
            admissions.find(a => a.id === overId)?.stage;

        const currentAdmission = admissions.find(a => a.id === admissionId);

        if (newStage && currentAdmission && currentAdmission.stage !== newStage) {
            await onStageUpdate(admissionId, newStage);
        }
    };

    const getAdmissionsByStage = (stageId: string) => {
        return admissions.filter(a => a.stage === stageId);
    };

    const activeAdmission = activeId ? admissions.find(a => a.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full min-h-[600px]">
                {STAGES.map((stage) => (
                    <BoardColumn
                        key={stage.id}
                        stage={stage}
                        admissions={getAdmissionsByStage(stage.id)}
                        slug={slug}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: "0.5",
                        },
                    },
                }),
            }}>
                {activeId && activeAdmission ? (
                    <div className="rotate-2 scale-105 opacity-90 shadow-2xl pointer-events-none">
                        <AdmissionBoardCard admission={activeAdmission} slug={slug} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function BoardColumn({ stage, admissions, slug }: { stage: any, admissions: any[], slug: string }) {
    const { setNodeRef, isOver } = useSortable({
        id: stage.id,
        data: {
            type: "column",
            stageId: stage.id,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col gap-4 p-4 rounded-[32px] bg-zinc-50/50 border-2 border-transparent transition-all min-h-[400px]",
                isOver && "bg-brand/5 border-dashed border-brand/20"
            )}
        >
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stage.color.split(' ')[1].replace('bg-', 'bg-'))} />
                    <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900">{stage.label}</h3>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-500 shadow-sm">
                    {admissions.length}
                </span>
            </div>

            <SortableContext
                items={admissions.map(a => a.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-3">
                    {admissions.map((admission) => (
                        <SortableItem key={admission.id} id={admission.id} admission={admission} slug={slug} />
                    ))}

                    {admissions.length === 0 && (
                        <div className="aspect-[3/1] rounded-2xl border-2 border-dashed border-zinc-100 flex items-center justify-center">
                            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No Leads</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

function SortableItem({ id, admission, slug }: { id: string, admission: any, slug: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            type: "item",
            admission,
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <AdmissionBoardCard admission={admission} slug={slug} />
        </div>
    );
}
