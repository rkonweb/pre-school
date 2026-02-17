"use client";

import { motion } from "framer-motion";
import { IDCardRenderer } from "./IDCardRenderer";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div as any;

interface IDCardMockupProps {
    template: {
        layout: string;
        orientation: 'VERTICAL' | 'HORIZONTAL';
        width?: number;
        height?: number;
    };
    student: any;
    school: any;
    className?: string;
    useDesignContent?: boolean;
    side?: 'FRONT' | 'BACK';
}

/**
 * Premium ID Card Mockup with Lanyard and Metal Clip
 */
export function IDCardMockup({ template, student, school, className, useDesignContent = false, side }: IDCardMockupProps) {
    const isVertical = template.orientation === 'VERTICAL';

    return (
        <div className={cn(
            "relative w-full h-full flex flex-col items-center justify-center overflow-hidden",
            "bg-[#f8fafc] rounded-[inherit]",
            className
        )}>
            {/* 1. Lanyard Strap (Static at the top) */}
            <div className="absolute top-0 w-6 h-[45%] bg-[#1a1a1a] shadow-inner z-0 rounded-b-sm" />
            <div className="absolute top-0 w-6 h-[45%] border-x-[1px] border-white/5 z-0" />

            {/* 3. The card in motion */}
            <MotionDiv
                initial={{ rotateY: 8, rotateX: 5, y: 30 } as any}
                animate={{
                    rotateY: -3,
                    rotateX: -2,
                    y: 20
                } as any}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }}
                className={cn(
                    "relative z-10 transition-all duration-500 flex flex-col items-center",
                    isVertical ? "w-[240px] h-[360px]" : "w-[360px] h-[240px]",
                )}
                style={{
                    perspective: "1200px"
                }}
            >
                <div className={cn(
                    "relative w-full h-full rounded-[1.25rem] overflow-hidden bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/40",
                )}>
                    {/* The design content */}
                    <div className="absolute inset-0 flex items-center justify-center transform scale-[1.02]">
                        <IDCardRenderer
                            template={template}
                            student={student}
                            school={school}
                            zoom={isVertical ? 0.42 : 0.52}
                            useDesignContent={useDesignContent}
                            side={side}
                        />
                    </div>

                    {/* Refined Glass Effects */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1/4 bg-white/10 pointer-events-none" />
                </div>
            </MotionDiv>

            {/* Studio floor shadow */}
            <div className="absolute bottom-6 w-1/2 h-10 bg-zinc-900/5 blur-[50px] rounded-[100%] -z-10" />
        </div>
    );
}
