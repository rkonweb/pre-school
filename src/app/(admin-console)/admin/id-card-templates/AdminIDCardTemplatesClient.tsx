
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IDCardRenderer } from "@/components/id-cards/IDCardRenderer";
import { IDZone } from "@/components/id-cards/IDCardKonvaCanvas";
import { deleteIDCardTemplateAction } from "@/app/actions/id-card-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MOCK_STUDENT = {
    firstName: "John",
    lastName: "Doe",
    admissionNumber: "2024001",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    classroom: { name: "Grade 1-A" }
};

const MOCK_SCHOOL = {
    name: "Antigravity Academy",
    logo: null
};

interface AdminIDCardTemplatesClientProps {
    initialTemplates: any[];
}

export default function AdminIDCardTemplatesClient({ initialTemplates }: AdminIDCardTemplatesClientProps) {
    const router = useRouter();
    const [templates, setTemplates] = useState(initialTemplates);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this system template?")) return;

        const result = await deleteIDCardTemplateAction(id, "admin"); // Slug doesn't matter much for admin area revalidation if we handle it
        if (result.success) {
            toast.success("Template deleted");
            setTemplates(prev => prev.filter(t => t.id !== id));
            router.refresh();
        } else {
            toast.error("Failed to delete template");
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen bg-zinc-50/50">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-3">
                        <Layout className="h-8 w-8 text-indigo-600" />
                        System Templates
                    </h2>
                    <p className="text-zinc-500 font-medium text-sm">Create and manage reusable ID card designs for all schools.</p>
                </div>
                <Link
                    href="/admin/id-card-templates/designer"
                    className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black uppercase text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all outline-none"
                >
                    <Plus className="h-5 w-5" />
                    Create System Template
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-zinc-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search system templates..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold transition-all outline-none"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredTemplates.map(t => (
                    <div key={t.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                        {/* Preview Area */}
                        <div className="aspect-[3/4] bg-zinc-100 flex items-center justify-center p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="scale-[1.1] transition-transform duration-500 group-hover:scale-[1.15]">
                                <IDCardRenderer
                                    template={t}
                                    student={MOCK_STUDENT}
                                    school={MOCK_SCHOOL}
                                    zoom={t.orientation === 'VERTICAL' ? 0.45 : 0.5}
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="font-black text-zinc-900 uppercase text-xs tracking-widest">{t.name}</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                                        {t.orientation} • {t.dimensions}mm
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Link
                                        href={`/admin/id-card-templates/designer/${t.id}`}
                                        className="p-2.5 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="p-2.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
                        <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center shadow-inner">
                            <Layout className="h-10 w-10 text-zinc-300" />
                        </div>
                        <div>
                            <p className="font-black text-zinc-900 uppercase tracking-widest text-sm">No Templates Found</p>
                            <p className="text-zinc-400 text-xs font-medium mt-1">Start by creating your first system-wide ID card template.</p>
                        </div>
                        <Link
                            href="/admin/id-card-templates/designer"
                            className="mt-4 flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3 text-sm font-black uppercase text-white hover:bg-black transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Launch Designer
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
