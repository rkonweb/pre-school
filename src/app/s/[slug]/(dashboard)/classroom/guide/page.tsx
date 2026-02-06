"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ClipboardCheck,
    PlayCircle,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Printer,
    Info,
    Layers,
    Sparkles,
    BookOpen,
    Eye,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonWatermark } from "@/components/curriculum/LessonWatermark";
import { PrintProtection } from "@/components/curriculum/PrintProtection";

type Tab = "preparation" | "teaching" | "outcomes";

const MOCK_LESSON = {
    id: "L-102",
    theme: "Ocean Wonders: The Giant Whale",
    day: "Day 12",
    prep_notes: "Ensure the audio clip of whale songs is pre-loaded on the classroom speakers. Have blue chart paper ready for 'Core Instruction'.",
    materials: [
        { id: 1, name: "Blue Chart Paper", needed: "1 sheet" },
        { id: 2, name: "Whale Song Audio", needed: "Digital" },
        { id: 3, name: "Large Paintbrushes", needed: "6 units" },
        { id: 4, name: "Silver Glitter", needed: "1 bottle" }
    ],
    steps: [
        {
            type: "Introduction",
            title: "The Whale's Call",
            content: "Start the class by dimming the lights. Play the whale song recording. Ask kids: 'What animal do you think makes this huge, deep sound?' Share the story of 'Wally the Whale'.",
            icon: PlayCircle,
            color: "blue"
        },
        {
            type: "Core Instruction",
            title: "How Big is a Blue Whale?",
            content: "Explain that a Blue Whale is longer than 3 classroom buses parked in a row! Use the blue chart paper to draw a rough scale of a whale's tail.",
            icon: BookOpen,
            color: "indigo"
        },
        {
            type: "Reinforcement",
            title: "Sprinkle the Spray",
            content: "Kids use silver glitter on blue paper to mimic the whale's blowhole spray. Focus on pincer grip while holding the glitter bottles.",
            icon: Sparkles,
            color: "purple"
        },
        {
            type: "Revision",
            title: "Recap: Ocean Friends",
            content: "Quickly ask: 'Is the whale a fish or a mammal?' (Recap from Day 10). Let kids mimic the blowhole sound.",
            icon: Layers,
            color: "zinc"
        }
    ],
    outcomes: [
        "Identify a Blue Whale as the largest mammal.",
        "Show control over fine motor movements (glitter art).",
        "Active participation in story-telling."
    ],
    observation: [
        { id: "O1", skill: "Pincer Grip during Glitter Sprinkling" },
        { id: "O2", skill: "Recall of Day 10 Mammal Definition" }
    ]
};

export default function DailyGuidePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [activeTab, setActiveTab] = useState<Tab>("preparation");
    const [currentStep, setCurrentStep] = useState(0);
    const [checkedMaterials, setCheckedMaterials] = useState<number[]>([]);
    const [observations, setObservations] = useState<Record<string, boolean>>({});

    const toggleMaterial = (id: number) => {
        setCheckedMaterials(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const toggleObservation = (id: string, val: boolean) => {
        setObservations(prev => ({ ...prev, [id]: val }));
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 pb-20">
            <PrintProtection />

            {/* Top Navigation */}
            <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-4 shadow-sm dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/s/${slug}/classroom`)}
                        className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold">{MOCK_LESSON.theme}</h1>
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">{MOCK_LESSON.day}</p>
                    </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                    <Info className="h-4 w-4" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {(["preparation", "teaching", "outcomes"] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                            activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-zinc-400"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
                {activeTab === "preparation" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="rounded-3xl bg-blue-600 p-6 text-white shadow-xl shadow-blue-500/20">
                            <h3 className="flex items-center gap-2 font-bold">
                                <ClipboardCheck className="h-5 w-5" />
                                Teacher Preparation
                            </h3>
                            <p className="mt-3 text-sm text-blue-100 leading-relaxed italic">
                                "{MOCK_LESSON.prep_notes}"
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="px-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Material Checklist</h4>
                            <div className="grid gap-3">
                                {MOCK_LESSON.materials.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => toggleMaterial(m.id)}
                                        className={cn(
                                            "flex items-center justify-between rounded-2xl border p-4 transition-all text-left",
                                            checkedMaterials.includes(m.id)
                                                ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                                                : "bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                                        )}
                                    >
                                        <div>
                                            <p className={cn("font-bold text-sm", checkedMaterials.includes(m.id) && "text-green-700 dark:text-green-400 line-through")}>{m.name}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase">{m.needed}</p>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            checkedMaterials.includes(m.id)
                                                ? "bg-green-600 border-green-600 text-white"
                                                : "border-zinc-200 dark:border-zinc-700"
                                        )}>
                                            {checkedMaterials.includes(m.id) && <CheckCircle2 className="h-4 w-4" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveTab("teaching")}
                            className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition-active dark:bg-zinc-50 dark:text-zinc-900 flex items-center justify-center gap-2"
                        >
                            Start Class Now <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {activeTab === "teaching" && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Teaching Flow: {currentStep + 1}/4</span>
                            <div className="flex gap-1">
                                {MOCK_LESSON.steps.map((_, i) => (
                                    <div key={i} className={cn("h-1 w-6 rounded-full", i === currentStep ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800")} />
                                ))}
                            </div>
                        </div>

                        <LessonWatermark>
                            <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 min-h-[400px] flex flex-col">
                                <div className={cn(
                                    "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl",
                                    MOCK_LESSON.steps[currentStep].color === "blue" ? "bg-blue-50 text-blue-600" :
                                        MOCK_LESSON.steps[currentStep].color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                                            MOCK_LESSON.steps[currentStep].color === "purple" ? "bg-purple-50 text-purple-600" :
                                                "bg-zinc-100 text-zinc-600"
                                )}>
                                    {(() => {
                                        const Icon = MOCK_LESSON.steps[currentStep].icon;
                                        return <Icon className="h-6 w-6" />;
                                    })()}
                                </div>

                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                    {MOCK_LESSON.steps[currentStep].type}
                                </span>
                                <h2 className="mt-1 text-2xl font-black text-zinc-900 dark:text-zinc-50">
                                    {MOCK_LESSON.steps[currentStep].title}
                                </h2>

                                <div className="mt-6 flex-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                    {MOCK_LESSON.steps[currentStep].content}
                                </div>

                                {currentStep === 3 && (
                                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3 font-bold text-white shadow-lg shadow-orange-600/20 active:scale-95 transition-all">
                                            <Printer className="h-4 w-4" />
                                            Secure Print Worksheet
                                        </button>
                                        <p className="mt-2 text-center text-[10px] text-zinc-400">Valid only for today's session.</p>
                                    </div>
                                )}
                            </div>
                        </LessonWatermark>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                disabled={currentStep === 0}
                                className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 font-bold text-zinc-600 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => currentStep === 3 ? setActiveTab("outcomes") : setCurrentStep(currentStep + 1)}
                                className="flex-[2] rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                            >
                                {currentStep === 3 ? "Complete Lesson" : "Next Step"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "outcomes" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center gap-2 text-green-600 mb-4">
                                <Sparkles className="h-5 w-5" />
                                <h3 className="font-bold">Expected Outcomes</h3>
                            </div>
                            <ul className="space-y-3">
                                {MOCK_LESSON.outcomes.map((o, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                                        {o}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="px-2 text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <Eye className="h-3 w-3" /> Observational Checklist
                            </h4>
                            <div className="grid gap-3">
                                {MOCK_LESSON.observation.map((obs) => (
                                    <div key={obs.id} className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4">{obs.skill}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleObservation(obs.id, true)}
                                                className={cn(
                                                    "flex-1 rounded-xl py-2 text-xs font-bold transition-all",
                                                    observations[obs.id] === true ? "bg-green-600 text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                                )}
                                            >
                                                Yes, Achieved
                                            </button>
                                            <button
                                                onClick={() => toggleObservation(obs.id, false)}
                                                className={cn(
                                                    "flex-1 rounded-xl py-2 text-xs font-bold transition-all",
                                                    observations[obs.id] === false ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                                )}
                                            >
                                                Not Yet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white dark:bg-zinc-50 dark:text-zinc-900">
                            Submit Report & End Day
                        </button>
                    </div>
                )}
            </div>

            {/* Persistence / Success Bar if relevant */}
        </div>
    );
}
