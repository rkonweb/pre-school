"use client";

import { Hand } from "lucide-react";

interface FingerProps {
    id: string;
    name: string;
    d: string;
    selected: boolean;
    onSelect: (id: string, name: string) => void;
}

function SVGPath({ id, name, d, selected, onSelect }: FingerProps) {
    return (
        <path
            d={d}
            onClick={() => onSelect(id, name)}
            className={`cursor-pointer transition-all duration-200 stroke-2 hover:stroke-[--brand-color] hover:fill-[rgba(var(--brand-color-rgb),0.1)] 
                ${selected 
                    ? "stroke-[--brand-color] fill-[rgba(var(--brand-color-rgb),0.15)] drop-shadow-[0_0_8px_rgba(var(--brand-color-rgb),0.3)]" 
                    : "stroke-zinc-300 dark:stroke-zinc-700 fill-transparent"}`}
            role="button"
            aria-label={name}
        >
            <title>{name}</title>
        </path>
    );
}

interface FingerSelectionUIProps {
    selectedFinger: string | null;
    onSelect: (id: string, name: string) => void;
}

export function FingerSelectionUI({ selectedFinger, onSelect }: FingerSelectionUIProps) {
    return (
        <div className="flex flex-col items-center gap-6 p-6">
            <div className="flex gap-12 sm:gap-24">
                
                {/* LEFT HAND */}
                <div className="relative group">
                    <p className="absolute -top-8 w-full text-center text-sm font-semibold text-zinc-400 uppercase tracking-widest hidden sm:block">Left Hand</p>
                    <svg viewBox="0 0 200 240" className="w-40 sm:w-56 h-auto overflow-visible select-none drop-shadow-sm">
                        {/* Palm left */}
                        <path d="M54.1,123.7 c-2.9,9.8-5,21.6-4.6,35.7c0.8,24.6,7.6,44.2,16.5,57.1c9.7,14,21.8,17.4,32.4,18c15.2,0.9,32.7-7.9,41.4-23.7 c7.7-14.1,12.2-34.8,12.5-56.1c0.1-10.6-1.1-19.1-2.9-25.2C130,123,98.6,117.7,54.1,123.7z" className="stroke-zinc-300 dark:stroke-zinc-700 stroke-2 fill-zinc-50 dark:fill-zinc-900/50 pointer-events-none" />
                        
                        <SVGPath id="left-pinky" name="Left Pinky" d="M56.4,124.7 c-5.6-11.4-18.7-41.2-18.1-55.6c0.5-12,12.3-15.1,17.6-10.2c6.2,5.8,14.7,35.5,18.4,52.2" selected={selectedFinger === "left-pinky"} onSelect={onSelect} />
                        <SVGPath id="left-ring" name="Left Ring Finger" d="M74.4,111.4 c-4.6-15.6-13.8-55.9-10.9-72c2.1-11.9,15.6-13.9,21.1-7.1c6.5,8,13.2,46.5,15.3,64.3" selected={selectedFinger === "left-ring"} onSelect={onSelect} />
                        <SVGPath id="left-middle" name="Left Middle Finger" d="M99.9,96.6 c-2.5-14.3-5-60.8-0.9-74.9c3.2-11,18-10.5,22.2-3c4.9,8.7,8.3,51.8,8.2,71" selected={selectedFinger === "left-middle"} onSelect={onSelect} />
                        <SVGPath id="left-index" name="Left Index Finger" d="M129.5,90 c0.8-13.4,4.2-50.6,10.6-61.6c5.2-9,20.1-5.1,21.5,4.3c1.6,11-6.1,45.3-11.4,62.1" selected={selectedFinger === "left-index"} onSelect={onSelect} />
                        <SVGPath id="left-thumb" name="Left Thumb" d="M150.3,129 c12.9-4.8,32.4-7.8,40.1-4.1c11.6,5.6,12.5,20.1,5.1,26.7c-9.1,8.1-29.6,10.4-44.1,10.1" selected={selectedFinger === "left-thumb"} onSelect={onSelect} />
                    </svg>
                </div>

                {/* RIGHT HAND */}
                <div className="relative group">
                    <p className="absolute -top-8 w-full text-center text-sm font-semibold text-zinc-400 uppercase tracking-widest hidden sm:block">Right Hand</p>
                    <svg viewBox="0 0 200 240" className="w-40 sm:w-56 h-auto overflow-visible select-none drop-shadow-sm">
                        {/* Palm right */}
                        <path d="M145.9,123.7 c2.9,9.8,5,21.6,4.6,35.7c-0.8,24.6-7.6,44.2-16.5,57.1c-9.7,14-21.8,17.4-32.4,18c-15.2,0.9-32.7-7.9-41.4-23.7 c-7.7-14.1-12.2-34.8-12.5-56.1c-0.1-10.6,1.1-19.1,2.9-25.2C70,123,101.4,117.7,145.9,123.7z" className="stroke-zinc-300 dark:stroke-zinc-700 stroke-2 fill-zinc-50 dark:fill-zinc-900/50 pointer-events-none" />
                        
                        <SVGPath id="right-thumb" name="Right Thumb" d="M49.7,129 c-12.9-4.8-32.4-7.8-40.1-4.1C-2,130.5-2.9,145,4.5,151.6c9.1,8.1,29.6,10.4,44.1,10.1" selected={selectedFinger === "right-thumb"} onSelect={onSelect} />
                        <SVGPath id="right-index" name="Right Index Finger" d="M70.5,90 c-0.8-13.4-4.2-50.6-10.6-61.6c-5.2-9-20.1-5.1-21.5,4.3c-1.6,11,6.1,45.3,11.4,62.1" selected={selectedFinger === "right-index"} onSelect={onSelect} />
                        <SVGPath id="right-middle" name="Right Middle Finger" d="M100.1,96.6 c2.5-14.3,5-60.8,0.9-74.9c-3.2-11-18-10.5-22.2-3c-4.9,8.7-8.3,51.8-8.2,71" selected={selectedFinger === "right-middle"} onSelect={onSelect} />
                        <SVGPath id="right-ring" name="Right Ring Finger" d="M125.6,111.4 c4.6-15.6,13.8-55.9,10.9-72c-2.1-11.9-15.6-13.9-21.1-7.1c-6.5,8-13.2,46.5-15.3,64.3" selected={selectedFinger === "right-ring"} onSelect={onSelect} />
                        <SVGPath id="right-pinky" name="Right Pinky" d="M143.6,124.7 c5.6-11.4,18.7-41.2,18.1-55.6c-0.5-12-12.3-15.1-17.6-10.2c-6.2,5.8-14.7,35.5-18.4,52.2" selected={selectedFinger === "right-pinky"} onSelect={onSelect} />
                    </svg>
                </div>

            </div>

            <div className={`mt-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${selectedFinger ? 'bg-[rgba(var(--brand-color-rgb),0.1)] text-[--brand-color] border-[rgba(var(--brand-color-rgb),0.2)]' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}>
                {selectedFinger ? `Selected: ${selectedFinger.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}` : "No finger selected (Optional)"}
            </div>
        </div>
    );
}
