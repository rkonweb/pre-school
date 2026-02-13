"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    ChevronDown,
    Type,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
    zone: any;
    style: any;
    onUpdateStyle: (update: any) => void;
    isVisible: boolean;
}

export function FloatingToolbar({ zone, style, onUpdateStyle, isVisible }: FloatingToolbarProps) {
    if (!isVisible || !zone) return null;

    // Determine position - simplified for now, usually needs a ref to the selected node
    // For this implementation, we'll place it at the top of the canvas or floating above the element if possible

    return (
        <AnimatePresence>
            {/* @ts-ignore */}
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute z-50 bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            >
                {/* Font Size */}
                <div className="flex items-center gap-2 px-3 border-r border-white/10">
                    <Type className="h-3 w-3 text-zinc-400" />
                    <input
                        type="number"
                        value={style.fontSize || 5}
                        onChange={(e) => onUpdateStyle({ fontSize: parseInt(e.target.value) })}
                        className="w-8 bg-transparent text-[10px] font-black text-white outline-none"
                    />
                    <span className="text-[8px] text-zinc-500 font-bold">%</span>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-1 px-2 border-r border-white/10">
                    <ToolbarButton
                        active={style.textAlign === 'left'}
                        onClick={() => onUpdateStyle({ textAlign: 'left' })}
                    >
                        <AlignLeft className="h-3 w-3" />
                    </ToolbarButton>
                    <ToolbarButton
                        active={style.textAlign === 'center'}
                        onClick={() => onUpdateStyle({ textAlign: 'center' })}
                    >
                        <AlignCenter className="h-3 w-3" />
                    </ToolbarButton>
                    <ToolbarButton
                        active={style.textAlign === 'right'}
                        onClick={() => onUpdateStyle({ textAlign: 'right' })}
                    >
                        <AlignRight className="h-3 w-3" />
                    </ToolbarButton>
                </div>

                {/* Weight */}
                <div className="flex items-center gap-1 px-2 border-r border-white/10">
                    <ToolbarButton
                        active={style.weight === 'bold' || style.weight === '700'}
                        onClick={() => onUpdateStyle({ weight: style.weight === 'bold' ? 'normal' : 'bold' })}
                    >
                        <Bold className="h-3 w-3" />
                    </ToolbarButton>
                </div>

                {/* Color Mini-Grid */}
                <div className="flex items-center gap-1.5 px-3">
                    {['#000000', '#ffffff', '#4F46E5', '#EF4444', '#10B981'].map(color => (
                        <button
                            key={color}
                            onClick={() => onUpdateStyle({ color })}
                            className={cn(
                                "h-4 w-4 rounded-full border border-white/20 transition-transform active:scale-90",
                                style.color === color && "ring-2 ring-brand ring-offset-2 ring-offset-zinc-900 scale-110"
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function ToolbarButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "h-8 w-8 flex items-center justify-center rounded-xl transition-all",
                active ? "bg-brand text-white" : "text-zinc-400 hover:text-white hover:bg-white/10"
            )}
        >
            {children}
        </button>
    );
}
