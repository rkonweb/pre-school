"use client";

import { useEffect, useState } from "react";
import {
    getCareersPageContentAction,
    upsertCareersSectionAction,
    getJobPostingsAction,
    createJobPostingAction,
    updateJobPostingAction,
    deleteJobPostingAction
} from "@/app/actions/cms-actions";
import {
    Eye, EyeOff, Edit2, Save, X, Plus, Trash2,
    Sparkles, Heart, Building2, Briefcase, MapPin,
    CheckCircle, AlertCircle, LayoutTemplate, ListTodo
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
interface CareersSection {
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    content: string;
    isEnabled: boolean;
    sortOrder: number;
}

interface JobPost {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements?: string | null;
    isOpen: boolean;
}

// --- Constants ---
const TABS = [
    { id: 'jobs', label: 'Job Postings', icon: ListTodo },
    { id: 'cms', label: 'Page Content', icon: LayoutTemplate },
];

const SECTION_TEMPLATES = [
    {
        key: "hero",
        name: "Hero Section",
        icon: Sparkles,
        defaultTitle: "Careers Hero",
        defaultSubtitle: "Main headline and intro",
        defaultContent: JSON.stringify({
            badge: "We are hiring",
            headline: "Build the <span class='text-blue-600'>future</span> of education.",
            description: "Join a team of educators and engineers redefining how preschools operate globally."
        }, null, 2)
    },
    {
        key: "culture",
        name: "Culture Grid",
        icon: Heart,
        defaultTitle: "Culture & Values",
        defaultSubtitle: "Highlights of company culture",
        defaultContent: JSON.stringify({
            hqCard: { title: "London HQ", description: "Based in the heart of London with satellite hubs in Oxford and Cambridge." },
            statCard: { value: "4.8", label: "Glassdoor Score" }
        }, null, 2)
    }
];

export default function CareersPageCMS() {
    const [activeTab, setActiveTab] = useState<'jobs' | 'cms'>('jobs');
    const [loading, setLoading] = useState(true);

    // CMS State
    const [sections, setSections] = useState<CareersSection[]>([]);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [cmsFormData, setCmsFormData] = useState({
        sectionKey: "", title: "", subtitle: "", content: "", sortOrder: 0
    });

    // Jobs State
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPost | null>(null);
    const [jobFormData, setJobFormData] = useState({
        title: "", department: "", location: "", type: "Full-time",
        description: "", requirements: "", isOpen: true
    });

    useEffect(() => { loadAllData(); }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [cmsData, jobsData] = await Promise.all([
                getCareersPageContentAction(),
                getJobPostingsAction()
            ]);
            setSections(cmsData);
            setJobs(jobsData as unknown as JobPost[]);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Failed to load data. Please try refreshing.");
        } finally {
            setLoading(false);
        }
    };

    // --- CMS Handlers ---
    const handleCmsEdit = (section: CareersSection) => {
        setEditingSection(section.id);
        setCmsFormData({
            sectionKey: section.sectionKey,
            title: section.title || "",
            subtitle: section.subtitle || "",
            content: section.content,
            sortOrder: section.sortOrder
        });
    };

    const handleCmsAddNew = (template: typeof SECTION_TEMPLATES[0]) => {
        setEditingSection("new");
        setCmsFormData({
            sectionKey: template.key,
            title: template.defaultTitle,
            subtitle: template.defaultSubtitle,
            content: template.defaultContent,
            sortOrder: sections.length
        });
    };

    const handleCmsSave = async () => {
        const result = await upsertCareersSectionAction(cmsFormData);
        if (result.success) {
            toast.success("Section saved!");
            setEditingSection(null);
            loadAllData();
        } else {
            toast.error("Failed to save section");
        }
    };

    // --- Job Handlers ---
    const openJobModal = (job?: JobPost) => {
        if (job) {
            setEditingJob(job);
            setJobFormData({
                title: job.title, department: job.department, location: job.location,
                type: job.type, description: job.description, requirements: job.requirements || "",
                isOpen: job.isOpen
            });
        } else {
            setEditingJob(null);
            setJobFormData({
                title: "", department: "Engineering", location: "Remote", type: "Full-time",
                description: "", requirements: "", isOpen: true
            });
        }
        setIsJobModalOpen(true);
    };

    const handleJobSave = async () => {
        if (!jobFormData.title || !jobFormData.department) {
            toast.error("Please fill in required fields");
            return;
        }

        let result;
        if (editingJob) {
            result = await updateJobPostingAction(editingJob.id, jobFormData);
        } else {
            result = await createJobPostingAction(jobFormData);
        }

        if (result.success) {
            toast.success(editingJob ? "Job updated!" : "Job created!");
            setIsJobModalOpen(false);
            loadAllData();
        } else {
            toast.error("Failed to save job");
        }
    };

    const handleJobDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this job?")) {
            await deleteJobPostingAction(id);
            toast.success("Job deleted");
            loadAllData();
        }
    };

    const toggleJobStatus = async (job: JobPost) => {
        await updateJobPostingAction(job.id, { isOpen: !job.isOpen });
        toast.success(job.isOpen ? "Job closed" : "Job opened");
        loadAllData();
    };

    if (loading) return <div className="p-12 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Careers Management</h1>
                    <p className="text-slate-500 font-medium">Manage job postings and page content.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'jobs' | 'cms')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- JOBS TAB --- */}
            {activeTab === 'jobs' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="flex justify-end">
                        <button onClick={() => openJobModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                            <Plus className="h-5 w-5" /> Post New Job
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {jobs.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No jobs posted yet</h3>
                                <p className="text-slate-500">Create your first job posting to get started.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={cn("w-2.5 h-2.5 rounded-full", job.isOpen ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                                            <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase">{job.type}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {job.department}</span>
                                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleJobStatus(job)}
                                            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                                                job.isOpen ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                                            )}
                                        >
                                            {job.isOpen ? "Close Job" : "Re-open Job"}
                                        </button>
                                        <button onClick={() => openJobModal(job)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleJobDelete(job.id)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* --- CMS TAB --- */}
            {activeTab === 'cms' && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Add Content Section
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {SECTION_TEMPLATES.map(template => {
                                const exists = sections.some(s => s.sectionKey === template.key);
                                const Icon = template.icon;
                                return (
                                    <button
                                        key={template.key}
                                        onClick={() => !exists && handleCmsAddNew(template)}
                                        disabled={exists}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center",
                                            exists ? "opacity-50 cursor-not-allowed bg-slate-50 border-transparent" : "bg-white border-transparent hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                                        )}
                                    >
                                        <Icon className="h-8 w-8 mb-2 text-blue-600" />
                                        <span className="font-bold text-sm text-slate-900">{template.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sections.map(section => (
                            <div key={section.id} className={cn("bg-white rounded-2xl border-2 transition-all", section.isEnabled ? "border-slate-200" : "border-slate-100 opacity-60")}>
                                <div className="p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{section.title || section.sectionKey}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase">{section.sectionKey}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCmsEdit(section)} className="p-2 hover:bg-slate-100 rounded-lg text-blue-600">
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- MODALS --- */}

            {/* Job Modal */}
            {isJobModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900">{editingJob ? "Edit Job" : "Post New Job"}</h3>
                            <button onClick={() => setIsJobModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="h-6 w-6" /></button>
                        </div>
                        <div className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Job Title</label>
                                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={jobFormData.title} onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })} placeholder="e.g. Senior Teacher" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Department</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={jobFormData.department} onChange={e => setJobFormData({ ...jobFormData, department: e.target.value })}>
                                        <option>Engineering</option>
                                        <option>Education</option>
                                        <option>Operations</option>
                                        <option>Marketing</option>
                                        <option>Talent Network</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Location</label>
                                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={jobFormData.location} onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })} placeholder="e.g. London, UK" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Type</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={jobFormData.type} onChange={e => setJobFormData({ ...jobFormData, type: e.target.value })}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                                    value={jobFormData.description} onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })} placeholder="Describe the role..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Requirements (Optional)</label>
                                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                                    value={jobFormData.requirements} onChange={e => setJobFormData({ ...jobFormData, requirements: e.target.value })} placeholder="- Requirement 1&#10;- Requirement 2" />
                            </div>
                            <button onClick={handleJobSave} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-600/20 transition-all">
                                {editingJob ? "Update Job Posting" : "Publish Job Posting"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CMS Edit Section Modal */}
            {editingSection && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900">{editingSection === "new" ? "New Section" : "Edit Section"}</h3>
                            <button onClick={() => setEditingSection(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="h-6 w-6" /></button>
                        </div>
                        <div className="space-y-4">
                            <input className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl font-mono text-sm text-slate-500" value={cmsFormData.sectionKey} disabled />
                            <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={cmsFormData.title} onChange={e => setCmsFormData({ ...cmsFormData, title: e.target.value })} placeholder="Section Title" />

                            <div className="relative">
                                <label className="absolute top-2 right-4 text-xs font-bold text-slate-400">JSON Content</label>
                                <textarea className="w-full p-4 bg-slate-900 text-slate-50 rounded-xl font-mono text-sm h-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={cmsFormData.content} onChange={e => setCmsFormData({ ...cmsFormData, content: e.target.value })} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={handleCmsSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20">Save Changes</button>
                                <button onClick={() => setEditingSection(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-bold">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
