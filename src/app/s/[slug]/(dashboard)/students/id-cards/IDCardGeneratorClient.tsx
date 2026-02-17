"use client";

import { useState, useRef, useEffect } from "react";
import { CreditCard, Printer, Users, Check, ChevronRight, Layout, Search, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IDCardRenderer } from "@/components/id-cards/IDCardRenderer";
import { useReactToPrint } from "react-to-print";
import { getGoogleFontUrl } from "@/lib/fonts";
import { IDZone } from "@/components/id-cards/IDCardKonvaCanvas";

interface IDCardGeneratorClientProps {
    slug: string;
    templates: any[];
    students: any[];
    school: { name: string; logo: string | undefined | null };
}

const MOCK_STUDENT = {
    firstName: "Johnny",
    lastName: "Appleseed",
    admissionNumber: "2024-001",
    grade: "Grade 1-A",
    bloodGroup: "O+",
    avatar: "https://images.unsplash.com/photo-1597524419828-976722243053?q=80&w=256&h=256&fit=crop"
};

export function IDCardGeneratorClient({ slug, templates, students, school }: IDCardGeneratorClientProps) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templates[0]?.id || null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClassroom, setSelectedClassroom] = useState<string>("all");

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "ID_Cards_Generation",
    });

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    // Filter templates to resolve inheritance: 
    // We only want 'Root' templates or their specific overrides for this school.
    // Logic: If it's a system template AND has an override, handle it via the override record later.
    // If it's a standalone school template (parent null), keep it.
    // If it's an override (parent exists), keep it (it replaces the system one).
    const resolvedTemplates = templates.filter(template => {
        const isSystem = template.isSystem && !template.schoolId;
        const hasOverride = template.childTemplates && template.childTemplates.length > 0;

        if (isSystem && hasOverride) {
            // Drop the system original, we'll use the child override instead
            return false;
        }

        // Keep everything else:
        // - System originals with no override
        // - School-specific templates (including the overrides themselves)
        return true;
    });

    const filteredTemplates = resolvedTemplates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filtering students
    const filteredStudents = students.filter(s => {
        const matchesSearch = `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = selectedClassroom === "all" || s.classroomId === selectedClassroom;
        return matchesSearch && matchesClass;
    });

    const toggleStudent = (id: string) => {
        setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedStudentIds.length === filteredStudents.length) setSelectedStudentIds([]);
        else setSelectedStudentIds(filteredStudents.map(s => s.id));
    };

    // Classrooms for filter - unique by ID
    const classrooms = students
        .map(s => s.classroom)
        .filter((c, index, self) => c && self.findIndex(t => t?.id === c.id) === index);

    // Dynamic Font Loading for Production Print
    useEffect(() => {
        if (!selectedTemplate) return;
        try {
            const zones: IDZone[] = JSON.parse(selectedTemplate.layout);
            const usedFonts = Array.from(new Set(zones.map(z => z.style?.fontFamily).filter(Boolean)));
            const filtered = usedFonts.filter(f => !['Outfit', 'Inter', 'Poppins', 'Roboto', 'Geist'].includes(f));

            if (filtered.length > 0) {
                const url = getGoogleFontUrl(filtered);
                let link = document.querySelector("link[id='google-fonts-generator']") as HTMLLinkElement;
                if (!link) {
                    link = document.createElement('link');
                    link.id = 'google-fonts-generator';
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                }
                link.href = url;
            }
        } catch (e) {
            console.error("Failed to load fonts for printing:", e);
        }
    }, [selectedTemplate]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Generate ID Cards</h1>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Select students and a template to create identification cards</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handlePrint}
                        disabled={selectedStudentIds.length === 0 || !selectedTemplateId}
                        className="rounded-2xl h-14 px-8 bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest gap-3 shadow-xl"
                    >
                        <Printer className="h-5 w-5" /> Print {selectedStudentIds.length} Cards
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Step 1: Template Selection */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200">1</div>
                        Select Template
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTemplates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTemplateId(t.id)}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4",
                                    selectedTemplateId === t.id
                                        ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-500/10"
                                        : "border-zinc-100 bg-white hover:border-zinc-200 group shadow-sm hover:shadow-md"
                                )}
                            >
                                <div className={cn(
                                    "aspect-[3/4] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-zinc-100 bg-zinc-50 transition-all w-full",
                                    selectedTemplateId === t.id ? "border-indigo-200 shadow-sm bg-white" : ""
                                )}>
                                    <IDCardRenderer
                                        template={t}
                                        student={MOCK_STUDENT}
                                        school={school}
                                        zoom={t.orientation === 'VERTICAL' ? 0.48 : 0.52}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{t.name}</p>
                                        {selectedTemplateId === t.id && <Check className="h-4 w-4 text-indigo-600" />}
                                    </div>
                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                                        {t.orientation} • {t.dimensions}mm
                                    </p>
                                    {t.isSystem && !t.schoolId && (
                                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-widest ring-1 ring-indigo-700/10">
                                            {t.childTemplates?.[0] ? "Customized" : "Inherited"}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Student Selection */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200">2</div>
                        Select Students
                    </h3>

                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                        <div className="p-6 border-b border-zinc-100 flex flex-wrap items-center gap-4 bg-zinc-50/30">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                                />
                            </div>
                            <select
                                value={selectedClassroom}
                                onChange={e => setSelectedClassroom(e.target.value)}
                                className="px-4 py-3 rounded-2xl border border-zinc-200 bg-white text-sm font-bold uppercase tracking-wide"
                            >
                                <option value="all">All Classes</option>
                                {classrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <Button variant="ghost" onClick={toggleAll} className="rounded-xl font-black uppercase text-[10px]">
                                {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>

                        <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => toggleStudent(student.id)}
                                    className={cn(
                                        "p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-zinc-50",
                                        selectedStudentIds.includes(student.id) ? "bg-indigo-50/20" : ""
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            selectedStudentIds.includes(student.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-200 bg-white"
                                        )}>
                                            {selectedStudentIds.includes(student.id) && <Check className="h-4 w-4" />}
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                                            {student.avatar && <img src={student.avatar} className="object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{student.firstName} {student.lastName}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{student.admissionNumber || 'No ID'} • {student.classroom?.name || 'No Class'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Print Section */}
            <div className="hidden">
                <div ref={printRef} className="print-page">
                    <style>{`
                        @page { 
                            size: A3 portrait; 
                            margin: 10mm; 
                        }
                        @media print {
                            body { margin: 0; background: white; }
                            .print-page { padding: 0; }
                        }
                        .print-page {
                            width: 277mm; /* A3 Portrait 297mm - 20mm margin */
                            background: white;
                            min-height: 400mm;
                            font-family: 'Inter', sans-serif;
                            color: black;
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                            padding-top: 10mm;
                        }

                        .print-grid {
                            display: grid;
                            /* 4 columns: 2 students (Front/Back/Front/Back) per row */
                            grid-template-columns: repeat(4, calc(${selectedTemplate?.width || 86}${selectedTemplate?.unit || 'mm'} + (${(selectedTemplate?.bleed || 3) * 2}mm)));
                            gap: 25mm 8mm;
                            justify-content: center;
                        }

                        .print-item-group {
                            display: contents;
                        }

                        .print-item-wrapper {
                            position: relative;
                            /* Sized to Full Canvas (including bleed) */
                            width: calc(${selectedTemplate?.width || 86}${selectedTemplate?.unit || 'mm'} + (${(selectedTemplate?.bleed || 3) * 2}mm));
                            height: calc(${selectedTemplate?.height || 54}${selectedTemplate?.unit || 'mm'} + (${(selectedTemplate?.bleed || 3) * 2}mm));
                            page-break-inside: avoid;
                        }

                        /* Advanced Cut Marks (Registration) */
                        .mark {
                            position: absolute;
                            width: 15mm; /* Bridge the gaps */
                            height: 15mm;
                            pointer-events: none;
                            z-index: 999; /* Ensure marks are ALWAYS on top */
                            opacity: 0.1; /* Minimal opacity as requested */
                        }
                        .mark::before, .mark::after {
                            content: '';
                            position: absolute;
                            background: #000; /* Solid Black */
                        }
                        /* Crosshair part - Thickened for maximum visibility */
                        .mark::before { width: 100%; height: 0.3mm; top: 50%; left: 0; }
                        .mark::after { height: 100%; width: 0.3mm; left: 50%; top: 0; }

                        /* Marks aligned to BLEED offset - Centered on trim line */
                        /* (half of 15mm is 7.5mm) */
                        .mark-tl { top: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); left: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); }
                        .mark-tr { top: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); right: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); }
                        .mark-bl { bottom: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); left: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); }
                        .mark-br { bottom: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); right: calc(${(selectedTemplate?.bleed || 3)}mm - 7.5mm); }
                        
                        .print-item-container {
                            width: 100%;
                            height: 100%;
                            position: relative;
                            overflow: hidden; /* This clips the final output to the wrapper size */
                            z-index: 1; /* Sink below marks */
                        }

                        .print-item {
                            /* Expand width/height to hold the unscaled 150 DPI stage (150/96 = 1.5625) */
                            width: 156.25%; 
                            height: 156.25%;
                            position: relative;
                            background: white;
                            /* Scale back down so 156.25% becomes 100% of the wrapper */
                            transform: scale(0.64);
                            transform-origin: top left;
                        }
                    `}</style>


                    <div className="print-grid">
                        {selectedStudentIds.map(id => {
                            const student = students.find(s => s.id === id);
                            if (!selectedTemplate || !student) return null;

                            return (
                                <div key={id} className="print-item-group">
                                    {/* Front Side */}
                                    <div className="print-item-wrapper">
                                        <div className="mark mark-tl" /><div className="mark mark-tr" />
                                        <div className="mark mark-bl" /><div className="mark mark-br" />


                                        <div className="print-item-container">
                                            <div className="print-item">
                                                <IDCardRenderer
                                                    template={selectedTemplate}
                                                    student={student}
                                                    school={school}
                                                    zoom={0.7381}
                                                    side="FRONT"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="print-item-wrapper">
                                        <div className="mark mark-tl" /><div className="mark mark-tr" />
                                        <div className="mark mark-bl" /><div className="mark mark-br" />


                                        <div className="print-item-container">
                                            <div className="print-item">
                                                <IDCardRenderer
                                                    template={selectedTemplate}
                                                    student={student}
                                                    school={school}
                                                    zoom={0.7381}
                                                    side="BACK"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
}
