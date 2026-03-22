'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Clock, CheckCircle2, XCircle, Inbox,
    Phone, Mail, MapPin, Building2, Users, Globe,
    Tag, ExternalLink, RefreshCw, Filter, ArrowUpDown,
    ClipboardList, Star, MessageSquare, CheckCheck, X, AlertCircle,
    Zap, ChevronRight, Copy, Check
} from 'lucide-react';

interface Application {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    phoneCode: string;
    designation: string;
    schoolName: string;
    schoolTagline: string | null;
    schoolType: string;
    schoolCategory: string;
    board: string;
    schoolSize: string;
    city: string;
    state: string;
    pincode: string;
    yearEstd: string;
    website: string | null;
    schoolPhone: string | null;
    schoolAbout: string;
    features: string;
    referralSource: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: string;
}

interface Plan { id: string; name: string; price: number; tier: string; }

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
type SortKey = 'createdAt' | 'schoolName' | 'city';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: React.ElementType }> = {
    PENDING:  { label: 'Pending',  color: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-400',   icon: Clock },
    APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-400',     icon: XCircle },
};

function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function initials(first: string, last: string) {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
}

function avatarColor(name: string) {
    const colors = ['from-violet-500 to-purple-600','from-blue-500 to-indigo-600','from-emerald-500 to-teal-600','from-orange-500 to-amber-600','from-rose-500 to-pink-600','from-cyan-500 to-sky-600'];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
}

// ── Provisioning Modal ──────────────────────────────────────────────
function ProvisionModal({
    app, plans, onClose, onSuccess
}: {
    app: Application;
    plans: Plan[];
    onClose: () => void;
    onSuccess: (slug: string) => void;
}) {
    const [slug, setSlug] = useState(slugify(app.schoolName));
    const [planId, setPlanId] = useState(plans[0]?.id || '');
    const [adminNotes, setAdminNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [slugCopied, setSlugCopied] = useState(false);

    async function provision() {
        if (!slug.trim()) { setError('School slug is required'); return; }
        if (!planId) { setError('Please select a plan'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch(`/api/signup/submit/${app.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED', adminNotes, provisionTenant: true, slug: slug.trim(), planId })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Provisioning failed'); return; }
            onSuccess(slug.trim());
        } catch (e) {
            setError('Network error, please try again.');
        } finally {
            setLoading(false);
        }
    }

    function copySlug() {
        navigator.clipboard.writeText(slug);
        setSlugCopied(true);
        setTimeout(() => setSlugCopied(false), 2000);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="h-5 w-5 text-indigo-200" />
                                <span className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Provision Tenant</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{app.schoolName}</h2>
                            <p className="text-indigo-300 text-sm mt-0.5">{app.city}, {app.state} · {app.firstName} {app.lastName}</p>
                        </div>
                        <button onClick={onClose} aria-label="Close" title="Close" className="text-indigo-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-indigo-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Summary strip */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Admin Login</p>
                            <p className="text-sm font-semibold text-slate-800">{app.phoneCode}{app.mobile}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{app.email}</p>
                        </div>
                    </div>

                    {/* Slug field */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                            School Slug <span className="text-red-500">*</span>
                        </label>
                        <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 bg-white">
                            <input
                                value={slug}
                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                className="flex-1 px-3 py-2.5 text-sm font-mono font-semibold outline-none text-slate-800"
                                placeholder="school-slug"
                            />
                            <div className="bg-slate-100 px-3 flex items-center text-xs text-slate-500 font-medium border-l border-slate-200 whitespace-nowrap">.erp.com</div>
                            <button onClick={copySlug} title="Copy" className="px-3 border-l border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors">
                                {slugCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">Used for the school's URL. Only lowercase letters, numbers, and hyphens.</p>
                    </div>

                    {/* Plan selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                            Subscription Plan <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {plans.length === 0 && (
                                <p className="text-sm text-slate-400 col-span-2">No plans available</p>
                            )}
                            {plans.map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => setPlanId(plan.id)}
                                    className={`text-left p-3 rounded-xl border transition-all ${planId === plan.id ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                >
                                    <div className="font-bold text-sm text-slate-900">{plan.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {plan.price === 0 ? 'Free' : `₹${plan.price}/mo`} · {plan.tier}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Admin notes */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Admin Notes (optional)</label>
                        <textarea
                            value={adminNotes}
                            onChange={e => setAdminNotes(e.target.value)}
                            rows={2}
                            placeholder="e.g. Approved after verification call…"
                            className="w-full text-sm border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none bg-slate-50"
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={provision}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
                        >
                            {loading
                                ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                : <Zap className="h-4 w-4" />}
                            {loading ? 'Provisioning…' : 'Provision & Approve'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Success Banner ──────────────────────────────────────────────────
function SuccessBanner({ slug, onClose }: { slug: string; onClose: () => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-emerald-200 p-5 max-w-sm animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">Tenant Provisioned! 🎉</p>
                    <p className="text-xs text-slate-500 mt-0.5">School is live at <span className="font-mono font-semibold text-indigo-600">/{slug}</span></p>
                    <div className="flex gap-2 mt-3">
                        <a
                            href="/admin/tenants"
                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                        >
                            View Tenants <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                        <span className="text-slate-300">·</span>
                        <a
                            href={`/s/${slug}/dashboard`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline"
                        >
                            Open School <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
                <button onClick={onClose} aria-label="Close" title="Close" className="text-slate-400 hover:text-slate-700 shrink-0">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function SchoolApplicationsPage() {
    const router = useRouter();
    const [allApps, setAllApps] = useState<Application[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [filter, setFilter] = useState<StatusFilter>('PENDING');
    const [selected, setSelected] = useState<Application | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [rejectLoading, setRejectLoading] = useState(false);
    const [provisionModal, setProvisionModal] = useState<Application | null>(null);
    const [successSlug, setSuccessSlug] = useState('');

    async function loadAll() {
        setRefreshing(true);
        try {
            const [appsRes, plansRes] = await Promise.all([
                fetch('/api/signup/submit?status=ALL'),
                fetch('/api/subscriptions/plans')
            ]);
            const appsData = await appsRes.json();
            setAllApps(appsData.applications || []);
            if (plansRes.ok) {
                const plansData = await plansRes.json();
                setPlans(plansData.plans || plansData || []);
            }
        } finally {
            setRefreshing(false);
        }
    }

    useEffect(() => { loadAll(); }, []);

    const counts = useMemo(() => ({
        ALL: allApps.length,
        PENDING: allApps.filter(a => a.status === 'PENDING').length,
        APPROVED: allApps.filter(a => a.status === 'APPROVED').length,
        REJECTED: allApps.filter(a => a.status === 'REJECTED').length,
    }), [allApps]);

    const displayed = useMemo(() => {
        let list = filter === 'ALL' ? allApps : allApps.filter(a => a.status === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(a =>
                a.schoolName.toLowerCase().includes(q) ||
                `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
                a.city.toLowerCase().includes(q) ||
                a.mobile.includes(q) ||
                a.email.toLowerCase().includes(q)
            );
        }
        list = [...list].sort((a, b) => {
            const va = sortKey === 'createdAt' ? new Date(a.createdAt).getTime() : (a[sortKey] || '').toString().toLowerCase();
            const vb = sortKey === 'createdAt' ? new Date(b.createdAt).getTime() : (b[sortKey] || '').toString().toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [allApps, filter, search, sortKey, sortDir]);

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    }

    async function rejectApplication(id: string) {
        setRejectLoading(true);
        try {
            await fetch(`/api/signup/submit/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED', adminNotes: adminNote })
            });
            setSelected(null);
            setAdminNote('');
            loadAll();
        } finally {
            setRejectLoading(false);
        }
    }

    function handleProvisionSuccess(slug: string) {
        setProvisionModal(null);
        setSelected(null);
        setAdminNote('');
        setSuccessSlug(slug);
        loadAll();
    }

    const features = selected ? JSON.parse(selected.features || '[]') as string[] : [];

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Provisioning Modal */}
            {provisionModal && (
                <ProvisionModal
                    app={provisionModal}
                    plans={plans}
                    onClose={() => setProvisionModal(null)}
                    onSuccess={handleProvisionSuccess}
                />
            )}

            {/* Success Banner */}
            {successSlug && (
                <SuccessBanner slug={successSlug} onClose={() => setSuccessSlug('')} />
            )}

            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-indigo-600" />
                        <h1 className="text-lg font-bold text-slate-900">School Applications</h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Review and provision approved school applications as tenants</p>
                </div>
                <button
                    onClick={loadAll}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 shrink-0">
                {([
                    { key: 'ALL',      label: 'Total',    icon: Inbox,        bg: 'bg-slate-100', text: 'text-slate-700', num: 'text-slate-900' },
                    { key: 'PENDING',  label: 'Pending',  icon: Clock,        bg: 'bg-amber-50',  text: 'text-amber-600', num: 'text-amber-700' },
                    { key: 'APPROVED', label: 'Approved', icon: CheckCircle2, bg: 'bg-emerald-50',text: 'text-emerald-600', num: 'text-emerald-700' },
                    { key: 'REJECTED', label: 'Rejected', icon: XCircle,      bg: 'bg-red-50',    text: 'text-red-500',  num: 'text-red-600' },
                ] as const).map(({ key, label, icon: Icon, bg, text, num }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`${bg} rounded-xl p-4 text-left border transition-all ${filter === key ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-200'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${text}`}>{label}</span>
                            <Icon className={`h-4 w-4 ${text}`} />
                        </div>
                        <div className={`text-3xl font-bold ${num}`}>{counts[key]}</div>
                        {key === 'PENDING' && counts.PENDING > 0 && (
                            <div className="text-[11px] text-amber-500 font-medium mt-1">Needs review</div>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Main split pane ── */}
            <div className="flex flex-1 min-h-0 mx-6 mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                {/* List pane */}
                <div className="w-[420px] flex flex-col border-r border-slate-200 shrink-0">
                    <div className="p-3 border-b border-slate-100 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search school, name, city…"
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-xs text-slate-400 shrink-0">Sort by:</span>
                            {([
                                { k: 'createdAt' as SortKey, label: 'Date' },
                                { k: 'schoolName' as SortKey, label: 'School' },
                                { k: 'city' as SortKey, label: 'City' },
                            ]).map(({ k, label }) => (
                                <button key={k} onClick={() => toggleSort(k)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold transition-colors ${sortKey === k ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    {label}
                                    {sortKey === k && <ArrowUpDown className="h-3 w-3" />}
                                </button>
                            ))}
                            <span className="ml-auto text-xs text-slate-400">{displayed.length} result{displayed.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {displayed.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                    <Inbox className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">No applications found</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {search ? 'Try a different search term' : `No ${filter.toLowerCase()} applications yet`}
                                </p>
                            </div>
                        )}
                        {displayed.map(app => {
                            const cfg = STATUS_CONFIG[app.status];
                            return (
                                <button
                                    key={app.id}
                                    onClick={() => { setSelected(app); setAdminNote(app.adminNotes || ''); }}
                                    className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors group ${selected?.id === app.id ? 'bg-indigo-50 border-l-[3px] border-l-indigo-500' : 'border-l-[3px] border-l-transparent'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor(app.schoolName)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                                            {initials(app.firstName, app.lastName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-sm text-slate-900 truncate">{app.schoolName}</p>
                                                <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{app.firstName} {app.lastName} · {app.designation}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                    <MapPin className="h-3 w-3" />{app.city}, {app.state}
                                                </span>
                                                <span className="text-slate-200">·</span>
                                                <span className="text-[11px] text-slate-400">{timeAgo(app.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Detail pane */}
                {selected ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor(selected.schoolName)} flex items-center justify-center text-white text-base font-bold shadow-md shrink-0`}>
                                    {initials(selected.firstName, selected.lastName)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{selected.schoolName}</h2>
                                    {selected.schoolTagline && <p className="text-sm text-slate-500 mt-0.5 italic">"{selected.schoolTagline}"</p>}
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {(() => {
                                            const cfg = STATUS_CONFIG[selected.status];
                                            const Icon = cfg.icon;
                                            return (
                                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {cfg.label}
                                                </span>
                                            );
                                        })()}
                                        <span className="text-xs text-slate-400">
                                            Applied {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-w-3xl">
                            {/* Quick info strip */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: Phone,  label: 'Mobile',   value: `${selected.phoneCode} ${selected.mobile}` },
                                    { icon: Mail,   label: 'Email',    value: selected.email },
                                    { icon: MapPin, label: 'Location', value: `${selected.city}, ${selected.state} ${selected.pincode}` },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            <Icon className="h-3.5 w-3.5" />{label}
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 break-all">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <Section title="Applicant" icon={<Users className="h-4 w-4" />}>
                                <Grid2>
                                    <InfoCell label="Full Name" value={`${selected.firstName} ${selected.lastName}`} />
                                    <InfoCell label="Designation" value={selected.designation} />
                                </Grid2>
                            </Section>

                            <Section title="School Details" icon={<Building2 className="h-4 w-4" />}>
                                <Grid2>
                                    <InfoCell label="Type" value={selected.schoolType} />
                                    <InfoCell label="Category" value={selected.schoolCategory} />
                                    <InfoCell label="Board / Curriculum" value={selected.board} />
                                    <InfoCell label="School Size" value={`${selected.schoolSize} students`} />
                                    <InfoCell label="Year Established" value={selected.yearEstd} />
                                    {selected.schoolPhone && <InfoCell label="School Phone" value={selected.schoolPhone} />}
                                </Grid2>
                                {selected.website && (
                                    <a href={selected.website} target="_blank" rel="noopener noreferrer"
                                        className="mt-3 flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium">
                                        <Globe className="h-4 w-4" />
                                        {selected.website}
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </Section>

                            {selected.schoolAbout && (
                                <Section title="About the School" icon={<MessageSquare className="h-4 w-4" />}>
                                    <p className="text-sm text-slate-700 leading-relaxed">{selected.schoolAbout}</p>
                                </Section>
                            )}

                            {features.length > 0 && (
                                <Section title="Features of Interest" icon={<Star className="h-4 w-4" />}>
                                    <div className="flex flex-wrap gap-2">
                                        {features.map((f: string) => (
                                            <span key={f} className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full font-semibold">
                                                <Tag className="h-3 w-3" />{f}
                                            </span>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {selected.referralSource && (
                                <Section title="How They Found Us" icon={<AlertCircle className="h-4 w-4" />}>
                                    <p className="text-sm text-slate-700">{selected.referralSource}</p>
                                </Section>
                            )}

                            {/* ── PENDING: Provision + Reject ── */}
                            {selected.status === 'PENDING' && (
                                <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm font-bold text-slate-800">Admin Decision Required</span>
                                    </div>
                                    <textarea
                                        value={adminNote}
                                        onChange={e => setAdminNote(e.target.value)}
                                        placeholder="Add an internal note (optional)…"
                                        rows={2}
                                        className="w-full text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none mb-4"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setProvisionModal(selected)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-lg transition-colors"
                                        >
                                            <Zap className="h-4 w-4" />
                                            Approve & Provision
                                        </button>
                                        <button
                                            onClick={() => rejectApplication(selected.id)}
                                            disabled={rejectLoading}
                                            className="flex items-center justify-center gap-2 px-5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {rejectLoading
                                                ? <span className="h-4 w-4 rounded-full border-2 border-red-300 border-t-red-600 animate-spin" />
                                                : <X className="h-4 w-4" />}
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── APPROVED: show tenant link ── */}
                            {selected.status === 'APPROVED' && (
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800">Application Approved &amp; Tenant Provisioned</p>
                                        <a href="/admin/tenants" className="text-xs text-emerald-700 hover:underline flex items-center gap-1 mt-0.5">
                                            View in Tenant Management <ChevronRight className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* ── REJECTED ── */}
                            {selected.status === 'REJECTED' && selected.adminNotes && (
                                <Section title="Admin Notes" icon={<MessageSquare className="h-4 w-4" />}>
                                    <p className="text-sm text-slate-700 leading-relaxed">{selected.adminNotes}</p>
                                </Section>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-8">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <ClipboardList className="h-8 w-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Select an application</p>
                            <p className="text-xs text-slate-400 mt-0.5">Click a school from the list to review their details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2.5">
                <span className="text-slate-400">{icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">{children}</div>
        </div>
    );
}

function Grid2({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>;
}

function InfoCell({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
        </div>
    );
}
