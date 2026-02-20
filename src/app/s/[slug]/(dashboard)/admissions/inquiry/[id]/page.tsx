"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    History,
    Calendar,
    MapPin,
    Activity,
    ChevronLeft,
    User,
    Baby,
    School,
    CheckCircle2,
    XCircle,
    Pause,
    Plus,
    Loader2,
    Sparkles,
    PanelRightOpen,
    PanelRightClose
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadByIdAction, updateLeadAction, addLeadNoteAction } from "@/app/actions/lead-actions";
import { LeadStatusBadge, LeadScoreChip } from "@/components/dashboard/leads/LeadComponents";
import { FollowUpManager } from "@/components/dashboard/leads/FollowUpManager";
import { TourManager } from "@/components/dashboard/leads/TourManager";
import { LeadActionBar } from "@/components/dashboard/leads/LeadActionBar";
import { AICopilotPanel } from "@/components/dashboard/ai/AICopilotPanel";
import { AIProvider } from "@/context/AIContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const leadId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [lead, setLead] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("timeline");
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [noteContent, setNoteContent] = useState("");
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [isCopilotOpen, setIsCopilotOpen] = useState(true);

    useEffect(() => {
        loadLead();
    }, [leadId]);

    async function loadLead(silent = false) {
        if (!silent) setIsLoading(true);
        const res = await getLeadByIdAction(leadId);
        if (res.success) setLead(res.lead);
        setIsLoading(false);
    }

    async function handleStatusUpdate(newStatus: string) {
        if (!confirm("Are you sure you want to update the status?")) return;
        const res = await updateLeadAction(slug, leadId, { status: newStatus });
        if (res.success) {
            loadLead(true);
        } else {
            alert("Failed to update status");
        }
    }

    async function handleAddNote() {
        if (!noteContent.trim()) return;
        setIsSubmittingNote(true);
        const res = await addLeadNoteAction(slug, leadId, noteContent);
        if (res.success) {
            setIsNoteDialogOpen(false);
            setNoteContent("");
            loadLead(true);
        } else {
            alert("Failed to add note");
        }
        setIsSubmittingNote(false);
    }

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (!lead) return <div>Lead not found.</div>;

    const followUps = lead.followUps?.filter((f: any) => f.type !== 'VISIT') || [];
    const tours = lead.followUps?.filter((f: any) => f.type === 'VISIT') || [];

    const TABS = [
        { id: "timeline", label: "Timeline", icon: History },
        { id: "followups", label: "Follow-ups", icon: Calendar },
        { id: "tours", label: "School Tours", icon: MapPin },
        { id: "activity", label: "Activity Log", icon: Activity },
    ];

    return (
        <AIProvider>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-8 mt-0 bg-zinc-50/50">
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 pb-32">
                    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
                        {/* Header / Breadcrumb */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all bg-white">
                                    <ChevronLeft className="h-5 w-5 text-zinc-500" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-black text-zinc-900 leading-tight uppercase tracking-tight">{lead.parentName}</h1>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Lead ID: {lead.id.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <LeadScoreChip score={lead.score} />
                                <LeadStatusBadge status={lead.status} />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsCopilotOpen(!isCopilotOpen)}
                                    className={cn("gap-2 border-brand/20 text-brand bg-brand/5 hover:bg-brand/10", isCopilotOpen && "bg-brand text-[var(--secondary-color)] hover:bg-brand/90")}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {isCopilotOpen ? "Close Copilot" : "Open Copilot"}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left Panel: Profile */}
                            <div className="flex flex-col gap-6">
                                {/* Primary Info */}
                                <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40">
                                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100">
                                        <div className="h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                                            <User className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-zinc-900">{lead.parentName}</p>
                                            <p className="text-sm font-bold text-zinc-400">{lead.mobile}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                                <Baby className="h-4 w-4" />
                                                <span>{lead.childName}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{lead.childAge ? `${lead.childAge} yrs` : 'Age N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                                <School className="h-4 w-4" />
                                                <span>{lead.programInterested || "Any Program"}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Preference</span>
                                        </div>
                                        <div className="flex items-center justify-between font-bold text-xs">
                                            <span className="text-zinc-400">Source</span>
                                            <span className="text-zinc-800">{lead.source || "Direct"}</span>
                                        </div>
                                        <div className="flex items-center justify-between font-bold text-xs">
                                            <span className="text-zinc-400">Assigned To</span>
                                            <span className="text-brand">{lead.counsellor?.firstName || "Unassigned"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Conversion Actions */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate('ADMISSION_CONFIRMED')}
                                        className="h-14 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-green-600/20 hover:scale-[1.02] transition-all"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Convert to Admission
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('CLOSED_LOST')}
                                        className="h-14 bg-white border-2 border-zinc-200 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Mark as Lost
                                    </button>
                                </div>

                                <div className="rounded-[32px] bg-zinc-900 p-8 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-black uppercase tracking-tight text-brand">Automation</h3>
                                        <div className="h-6 w-11 bg-zinc-700 rounded-full flex items-center px-1">
                                            <div className="h-4 w-4 bg-brand rounded-full" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                        Lead is currently in <b>HOT</b> automation band. Next message scheduled for tomorrow at 10:00 AM.
                                    </p>
                                    <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-white/50 hover:text-white transition-colors">
                                        <Pause className="h-3 w-3" />
                                        Pause Automation
                                    </button>
                                </div>
                            </div>

                            {/* Right Panel: Content */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Tabs */}
                                <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-2xl overflow-x-auto no-scrollbar">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                                activeTab === tab.id ? "bg-brand text-[var(--secondary-color)] shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                            )}
                                        >
                                            <tab.icon className="h-3.5 w-3.5" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="flex-1 rounded-[32px] border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40 min-h-[500px]">
                                    {activeTab === "timeline" && (
                                        <div className="flex flex-col gap-8">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-black uppercase tracking-tight">Interaction Timeline</h3>
                                                <button
                                                    onClick={() => setIsNoteDialogOpen(true)}
                                                    className="text-[10px] font-black uppercase text-brand hover:brightness-90 flex items-center gap-1.5"
                                                >
                                                    <Plus className="h-3.5 w-3.5" /> Add Note
                                                </button>
                                            </div>

                                            <div className="relative flex flex-col gap-8 pl-8 border-l-2 border-zinc-100">
                                                {lead.interactions?.length === 0 && (
                                                    <p className="text-zinc-400 text-sm italic">No interactions recorded yet.</p>
                                                )}
                                                {lead.interactions?.map((item: any) => (
                                                    <div key={item.id} className="relative group">
                                                        <div className={cn(
                                                            "absolute -left-[41px] top-0 h-4 w-4 rounded-full border-4 border-white shadow-sm ring-1 ring-zinc-100",
                                                            item.type === 'WHATSAPP_MSG' ? 'bg-green-500' :
                                                                item.type === 'NOTE' ? 'bg-yellow-400' : 'bg-brand'
                                                        )} />
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-black uppercase text-zinc-400">{new Date(item.createdAt).toLocaleString()}</span>
                                                                <span className="h-1 w-1 rounded-full bg-zinc-200" />
                                                                <span className="text-[10px] font-black uppercase text-zinc-900">{item.staff?.firstName || "System"}</span>
                                                                {item.type === 'NOTE' && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-yellow-100 text-yellow-700 ml-2">Note</span>}
                                                            </div>
                                                            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 shadow-sm group-hover:bg-zinc-100/50 transition-colors">
                                                                <p className="text-sm font-bold text-zinc-700 whitespace-pre-wrap">{item.content}</p>
                                                                {item.type === 'WHATSAPP_MSG' && (
                                                                    <div className="mt-2 flex items-center gap-2">
                                                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-green-100 text-green-700">Delivered</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === "followups" && (
                                        <FollowUpManager
                                            slug={slug}
                                            leadId={leadId}
                                            followUps={followUps}
                                            onUpdate={() => loadLead(true)}
                                        />
                                    )}
                                    {activeTab === "tours" && (
                                        <TourManager
                                            slug={slug}
                                            leadId={leadId}
                                            tours={tours}
                                            onUpdate={() => loadLead(true)}
                                        />
                                    )}
                                    {activeTab === "activity" && (
                                        <div className="flex flex-col h-full items-center justify-center text-zinc-400 italic">
                                            <Activity className="h-12 w-12 mb-4 opacity-10" />
                                            <p className="font-bold">Activity logging coming soon</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Dock */}
                        <LeadActionBar
                            mobile={lead.mobile}
                            onSchedule={() => setActiveTab('followups')}
                        />

                        {/* Note Dialog */}
                        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                            <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden">
                                <DialogHeader className="p-6 bg-zinc-50 border-b border-zinc-100">
                                    <DialogTitle className="text-lg font-black uppercase tracking-tight text-zinc-900">
                                        Add Note
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="p-6 flex flex-col gap-4">
                                    <Textarea
                                        placeholder="Enter note content..."
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        className="rounded-xl resize-none min-h-[120px]"
                                    />
                                    <Button
                                        onClick={handleAddNote}
                                        disabled={isSubmittingNote}
                                        className="w-full h-12 rounded-xl bg-brand font-black uppercase tracking-widest"
                                    >
                                        {isSubmittingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* AI Copilot Sidebar */}
                {isCopilotOpen && (
                    <div className="w-[400px] bg-white border-l border-zinc-200 shrink-0 h-full overflow-hidden transition-all duration-300">
                        <AICopilotPanel lead={lead} onClose={() => setIsCopilotOpen(false)} />
                    </div>
                )}
            </div>
        </AIProvider>
    );
}
