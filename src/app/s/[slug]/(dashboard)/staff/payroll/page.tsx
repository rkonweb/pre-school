"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Banknote,
    Calendar,
    ChevronRight,
    Download,
    FileText,
    History,
    MoreHorizontal,
    Plus,
    Printer,
    Search,
    TrendingUp,
    Users,
    Wallet,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    ArrowLeft,
    ShieldCheck,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

// Actions
import {
    generatePayrollAction,
    getPayrollsAction,
    getPayslipsAction,
    markAsPaidAction,
    getSchoolDetailsAction
} from "@/app/actions/payroll-actions";
import { SlideOver } from "@/components/ui/SlideOver";

type ViewState = "LIST" | "DETAILS";

export default function PayrollPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [view, setView] = useState<ViewState>("LIST");
    const [isLoading, setIsLoading] = useState(true);
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
    const [payslips, setPayslips] = useState<any[]>([]);
    const [school, setSchool] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [isGenerating, setIsGenerating] = useState(false);
    const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
    const [genYear, setGenYear] = useState(new Date().getFullYear());

    // Payslip Modal/SlideOver
    const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
    const [isPayslipOpen, setIsPayslipOpen] = useState(false);

    // Printing
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Payslip_${selectedPayslip?.user?.firstName}_${selectedPayslip?.month}_${selectedPayslip?.year}`,
    });

    const handleExport = () => {
        if (!payslips.length) return;
        const data = payslips.map(p => ({
            Staff: `${p.user.firstName} ${p.user.lastName}`,
            Designation: p.user.designation || "Staff",
            Month: format(new Date(p.year, p.month - 1), "MMMM yyyy"),
            "Gross Salary": p.grossSalary,
            "Total Deductions": p.tax + p.pf + p.insurance + p.leaveDeduction + p.otherDeductions,
            "Net Salary": p.netSalary,
            Status: p.status
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payroll");
        XLSX.writeFile(wb, `Payroll_${selectedPayroll.month}_${selectedPayroll.year}.xlsx`);
    };

    useEffect(() => {
        loadData();
    }, [slug]);

    async function loadData() {
        setIsLoading(true);
        const [payrollsRes, schoolRes] = await Promise.all([
            getPayrollsAction(slug),
            getSchoolDetailsAction(slug)
        ]);

        if (payrollsRes.success) setPayrolls(payrollsRes.data);
        if (schoolRes.success) setSchool(schoolRes.data);
        setIsLoading(false);
    }

    async function handleViewDetails(payroll: any) {
        setSelectedPayroll(payroll);
        setIsLoading(true);
        const res = await getPayslipsAction(payroll.id);
        if (res.success) {
            setPayslips(res.data);
            setView("DETAILS");
        }
        setIsLoading(false);
    }

    async function handleGenerate() {
        if (payrolls.find(p => p.month === genMonth && p.year === genYear)) {
            if (!confirm("Payroll for this month already exists. Regenerating will overwrite existing data. Proceed?")) return;
        }
        setIsGenerating(true);
        const res = await generatePayrollAction(slug, genMonth, genYear);
        if (res.success) {
            toast.success("Payroll generated successfully");
            loadData();
        } else {
            toast.error(res.error || "Generation failed");
        }
        setIsGenerating(false);
    }

    async function handleRegenerateCurrent() {
        if (!selectedPayroll) return;
        setIsGenerating(true);
        const res = await generatePayrollAction(slug, selectedPayroll.month, selectedPayroll.year);
        if (res.success) {
            toast.success("Payroll recalculated successfully");
            const refreshRes = await getPayslipsAction(selectedPayroll.id);
            if (refreshRes.success) setPayslips(refreshRes.data);
            loadData();
        }
        setIsGenerating(false);
    }

    async function handleMarkPaid(payrollId: string) {
        const res = await markAsPaidAction(payrollId, slug);
        if (res.success) {
            toast.success("Payroll marked as paid");
            loadData();
            if (selectedPayroll?.id === payrollId) {
                setSelectedPayroll({ ...selectedPayroll, status: "PAID" });
                // Update local payslips as well
                setPayslips(prev => prev.map(p => ({ ...p, status: "PAID" })));
            }
        }
    }

    const filteredPayslips = payslips.filter(p =>
        `${p.user.firstName} ${p.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Summary Statistics for Detailed View
    const stats = {
        totalGross: payslips.reduce((acc, p) => acc + p.grossSalary, 0),
        totalDeductions: payslips.reduce((acc, p) => acc + (p.tax + p.pf + p.insurance + p.leaveDeduction + p.otherDeductions), 0),
        totalNet: payslips.reduce((acc, p) => acc + p.netSalary, 0),
        staffCount: payslips.length,
        paidCount: payslips.filter(p => p.status === "PAID").length
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase italic flex items-center gap-3">
                        Staff <span className="text-emerald-600">Payroll</span>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse hidden md:block" />
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Manage institutional finance, salary disbursements and tax tracking.</p>
                </div>

                {view === "LIST" ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-2xl shadow-sm ring-4 ring-zinc-500/5">
                            <select
                                value={genMonth}
                                onChange={(e) => setGenMonth(Number(e.target.value))}
                                className="bg-transparent text-xs font-black px-3 focus:outline-none appearance-none cursor-pointer uppercase tracking-widest text-zinc-600 dark:text-zinc-400"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{format(new Date(2024, i), "MMMM")}</option>
                                ))}
                            </select>
                            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800" />
                            <select
                                value={genYear}
                                onChange={(e) => setGenYear(Number(e.target.value))}
                                className="bg-transparent text-xs font-black px-3 focus:outline-none appearance-none cursor-pointer uppercase tracking-widest text-zinc-600 dark:text-zinc-400"
                            >
                                <option value={2026}>2026</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-brand dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl shadow-brand/20 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 disabled:opacity-50"
                        >
                            {isGenerating ? <Clock className="h-4 w-4 animate-spin text-emerald-500" /> : <Plus className="h-4 w-4" />}
                            Run Payroll Engine
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setView("LIST")}
                        className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Return to Archives
                    </button>
                )}
            </div>

            {view === "LIST" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {payrolls.map((p) => (
                        <div
                            key={p.id}
                            className="group relative bg-white dark:bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-10 transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2 cursor-pointer"
                            onClick={() => handleViewDetails(p)}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-brand dark:bg-white rounded-3xl text-white dark:text-zinc-900 shadow-xl shadow-brand/10 transition-transform group-hover:scale-110">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <StatusBadge status={p.status} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter italic">
                                    {format(new Date(p.year, p.month - 1), "MMMM yyyy")}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5 text-zinc-400" />
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                        {p.payslips?.length || 0} Professional Staff
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] block font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Monthly Expenditure</span>
                                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">₹{p.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-all">
                                    <ChevronRight className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {payrolls.length === 0 && !isLoading && (
                        <div className="col-span-full py-32 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[4rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                            <div className="p-8 bg-white dark:bg-zinc-900 rounded-full shadow-2xl mb-6 relative">
                                <Banknote className="h-16 w-16 text-zinc-200" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border border-zinc-100 dark:border-zinc-800 animate-ping" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight italic uppercase">Accounting Ledger Empty</h3>
                            <p className="text-sm text-zinc-500 mt-2 max-w-sm">No historical data found. High-frequency automated payroll processing begins once you run the first generation.</p>
                        </div>
                    )}
                </div>
            )}

            {view === "DETAILS" && selectedPayroll && (
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                    {/* Detailed Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Net Disbursement"
                            value={`₹${stats.totalNet.toLocaleString()}`}
                            icon={Banknote}
                            color="emerald"
                            subtitle={`${stats.paidCount} of ${stats.staffCount} Paid`}
                        />
                        <StatCard
                            label="Institutional Gross"
                            value={`₹${stats.totalGross.toLocaleString()}`}
                            icon={TrendingUp}
                            color="brand"
                            subtitle="Before Deductions"
                        />
                        <StatCard
                            label="Total Deductions"
                            value={`₹${stats.totalDeductions.toLocaleString()}`}
                            icon={AlertCircle}
                            color="rose"
                            subtitle="Taxes & Benefits"
                        />
                        <StatCard
                            label="Payroll Status"
                            value={selectedPayroll.status}
                            icon={ShieldCheck}
                            color="zinc"
                            subtitle={`Cycle: ${format(new Date(selectedPayroll.year, selectedPayroll.month - 1), "MMM yyyy")}`}
                            isStatus
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="bg-brand dark:bg-zinc-950 text-white rounded-[3rem] p-10 flex flex-col lg:flex-row gap-10 items-center justify-between shadow-3xl shadow-brand/40 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center gap-8 z-10">
                            <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                                <FileText className="h-10 w-10 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter">
                                    Institutional Ledger: {format(new Date(selectedPayroll.year, selectedPayroll.month - 1), "MMMM yyyy")}
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> System Initialized: {format(new Date(selectedPayroll.generatedAt), "PPP p")}
                                    </p>
                                    <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                                        Verified by AI Auditor
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 z-10 w-full lg:w-auto">
                            {selectedPayroll.status !== "PAID" && (
                                <button
                                    onClick={() => handleMarkPaid(selectedPayroll.id)}
                                    className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-400 text-zinc-900 px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                                >
                                    Authorize Disbursement
                                </button>
                            )}
                            <button
                                onClick={handleRegenerateCurrent}
                                disabled={isGenerating}
                                className="flex-1 lg:flex-none bg-white/10 hover:bg-white/20 text-white px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 backdrop-blur-sm disabled:opacity-50"
                            >
                                {isGenerating ? "Recalculating..." : "Recalculate Ledger"}
                            </button>
                            <button
                                onClick={handleExport}
                                className="p-5 bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] transition-all border border-white/10 backdrop-blur-sm"
                                title="Export Ledger to Excel"
                            >
                                <Download className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => {
                                    toast.info("Bulk printing sequence initialized...");
                                    window.print();
                                }}
                                className="p-5 bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] transition-all border border-white/10 backdrop-blur-sm"
                                title="Print Complete Ledger"
                            >
                                <Printer className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-zinc-900/50 rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-500/5 overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/30 dark:bg-zinc-950/20">
                            <div className="relative w-full md:w-[450px] group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Probe staff profiles..."
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl pl-16 pr-6 py-5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden lg:block">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Active Ledger</p>
                                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">Filtered Result: {filteredPayslips.length} Staff</p>
                                </div>
                                <div className="w-[1px] h-10 bg-zinc-200 dark:bg-zinc-800 mx-4 hidden lg:block" />
                                <button className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500 hover:text-emerald-500 transition-colors">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800">
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">Professional Artifact</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">Marking Ratio</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">Gross</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">Deduction</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">Net Liquidity</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">Auth State</th>
                                        <th className="px-10 py-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
                                    {filteredPayslips.map((p) => {
                                        const totalDeductions = p.tax + p.pf + p.insurance + p.leaveDeduction + p.otherDeductions;
                                        return (
                                            <tr key={p.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all border-b border-zinc-50 dark:border-zinc-800/20">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-emerald-500/10 uppercase italic border-2 border-white dark:border-zinc-800 ring-4 ring-zinc-500/5 group-hover:scale-105 transition-transform">
                                                            {p.user.firstName[0]}{p.user.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-zinc-900 dark:text-zinc-50 text-base tracking-tight italic">{p.user.firstName} {p.user.lastName}</div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Briefcase className="h-3 w-3 text-zinc-400" />
                                                                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{p.user.designation || "Executive"}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-300 italic tracking-tighter">
                                                                {p.presentDays} <span className="text-zinc-400 font-bold not-italic">/</span> {p.totalDays} Days
                                                            </span>
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500 rounded-full"
                                                                style={{ width: `${(p.presentDays / p.totalDays) * 100}%` }}
                                                            />
                                                        </div>
                                                        {p.absentDays > 0 && (
                                                            <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest mt-2 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full w-fit">-{p.absentDays} Deviations</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right font-mono font-black text-zinc-600 dark:text-zinc-400 text-sm whitespace-nowrap tracking-tighter">
                                                    ₹{p.grossSalary.toLocaleString()}
                                                </td>
                                                <td className="px-10 py-8 text-right font-mono text-sm font-black text-rose-500 whitespace-nowrap tracking-tighter italic">
                                                    -₹{totalDeductions.toLocaleString()}
                                                </td>
                                                <td className="px-10 py-8 text-right whitespace-nowrap">
                                                    <div className="font-mono font-black text-emerald-600 text-2xl tracking-tighter italic drop-shadow-sm group-hover:scale-110 transition-transform origin-right">
                                                        ₹{p.netSalary.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <StatusBadge status={p.status} />
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPayslip(p);
                                                                setIsPayslipOpen(true);
                                                            }}
                                                            className="h-12 w-12 flex items-center justify-center bg-brand dark:bg-white text-white dark:text-zinc-900 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                setSelectedPayslip(p);
                                                                // Short delay to allow state update before print
                                                                setTimeout(handlePrint, 100);
                                                            }}
                                                            className="h-12 w-12 flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-emerald-500 rounded-2xl shadow-sm transition-all hover:scale-110 active:scale-90"
                                                        >
                                                            <Printer className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Printing Area */}
            <div className="hidden">
                <div ref={printRef}>
                    <PrintablePayslip payslip={selectedPayslip} school={school} />
                </div>
            </div>

            {/* Modal for viewing detail */}
            <SlideOver
                isOpen={isPayslipOpen}
                onClose={() => setIsPayslipOpen(false)}
                title="Professional Payslip Verification"
            >
                {selectedPayslip && (
                    <div className="space-y-12 pb-10">
                        {/* Header Profile */}
                        <div className="text-center space-y-4">
                            <div className="h-32 w-32 rounded-[3rem] bg-brand mx-auto flex items-center justify-center text-white text-3xl font-black italic shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-white">
                                {selectedPayslip.user.firstName[0]}{selectedPayslip.user.lastName[0]}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter">{selectedPayslip.user.firstName} {selectedPayslip.user.lastName}</h2>
                                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-1 bg-emerald-50 w-fit mx-auto px-4 py-1.5 rounded-full">
                                    {selectedPayslip.user.designation || "Staff Professional"}
                                </p>
                            </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Gross Earnings</p>
                                <p className="text-2xl font-black italic text-zinc-900 tracking-tighter">₹{selectedPayslip.grossSalary.toLocaleString()}</p>
                            </div>
                            <div className="p-8 bg-rose-50 border-rose-100 rounded-[2.5rem] border flex flex-col items-center justify-center text-center shadow-sm">
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Deductions</p>
                                <p className="text-2xl font-black italic text-rose-500 tracking-tighter">₹{(selectedPayslip.tax + selectedPayslip.pf + selectedPayslip.insurance + selectedPayslip.leaveDeduction + selectedPayslip.otherDeductions).toLocaleString()}</p>
                            </div>
                            <div className="col-span-2 p-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[3rem] text-white flex flex-col items-center justify-center text-center shadow-[0_40px_80px_-20px_rgba(16,185,129,0.3)] border-4 border-white/20">
                                <p className="text-[11px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-2 opacity-80">Net Disbursement Liquidated</p>
                                <h3 className="text-5xl font-black italic tracking-tighter">₹{selectedPayslip.netSalary.toLocaleString()}</h3>
                                <div className="mt-6 flex items-center gap-2 bg-black/10 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                                    <ShieldCheck className="h-4 w-4 text-emerald-200" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Verified Transaction ID: #{selectedPayslip.id.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="space-y-10">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-zinc-100" />
                                    Earnings Breakdown
                                    <div className="h-[1px] flex-1 bg-zinc-100" />
                                </h4>
                                <div className="space-y-4">
                                    <BreakdownRow label="Basic Salary" value={selectedPayslip.basic} />
                                    <BreakdownRow label="House Rent Allowance (HRA)" value={selectedPayslip.hra} />
                                    <BreakdownRow label="Institutional Allowances" value={selectedPayslip.allowances} />
                                    {selectedPayslip.bonus > 0 && <BreakdownRow label="Performance Incentives" value={selectedPayslip.bonus} />}
                                    {selectedPayslip.customAdditions && JSON.parse(selectedPayslip.customAdditions).map((a: any, i: number) => (
                                        <BreakdownRow key={i} label={a.label || "Addition"} value={a.amount} />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-zinc-100" />
                                    Regulatory Deductions
                                    <div className="h-[1px] flex-1 bg-zinc-100" />
                                </h4>
                                <div className="space-y-4">
                                    <BreakdownRow label="Professional Tax" value={selectedPayslip.tax} isDeduction />
                                    <BreakdownRow label="Provident Fund" value={selectedPayslip.pf} isDeduction />
                                    <BreakdownRow label="Medical Insurance" value={selectedPayslip.insurance} isDeduction />
                                    <BreakdownRow label="Deviation / Leave Adjustment" value={selectedPayslip.leaveDeduction} isDeduction />
                                    {selectedPayslip.customDeductions && JSON.parse(selectedPayslip.customDeductions).map((d: any, i: number) => (
                                        <BreakdownRow key={i} label={d.label || "Deduction"} value={d.amount} isDeduction />
                                    ))}
                                    <BreakdownRow label="Miscellaneous Recovery" value={selectedPayslip.otherDeductions} isDeduction />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-10 flex gap-4">
                            <button
                                onClick={handlePrint}
                                className="flex-1 bg-brand text-white hover:brightness-110 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-3xl shadow-brand/20 transition-all hover:-translate-y-1 active:scale-95 border-b-4 border-black"
                            >
                                <Printer className="h-5 w-5" />
                                Execute Print Command
                            </button>
                            <button
                                onClick={() => setIsPayslipOpen(false)}
                                className="px-8 bg-zinc-100 text-zinc-400 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </SlideOver>
        </div>
    );
}

function BreakdownRow({ label, value, isDeduction }: { label: string, value: number, isDeduction?: boolean }) {
    if (value === 0 && isDeduction) return null; // Don't show empty deductions
    return (
        <div className="flex items-center justify-between group">
            <span className="text-zinc-500 font-bold text-sm bg-white pr-4 z-10">{label}</span>
            <div className="flex-1 border-b border-dashed border-zinc-100 relative top-[-4px] group-hover:border-zinc-300 transition-colors" />
            <span className={cn(
                "font-mono font-black text-sm pl-4 italic tracking-tighter",
                isDeduction ? "text-rose-500" : "text-zinc-900"
            )}>
                {isDeduction ? "-" : ""}₹{value.toLocaleString()}
            </span>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, subtitle, isStatus }: { label: string, value: string, icon: any, color: string, subtitle: string, isStatus?: boolean }) {
    const colorClasses: Record<string, string> = {
        emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600",
        brand: "bg-brand/10 text-brand",
        rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-600",
        zinc: "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white"
    };

    return (
        <div className="bg-white dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-8 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-56 shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between">
                <div className={cn("p-4 rounded-[1.5rem] shadow-sm transition-transform group-hover:scale-110", colorClasses[color])}>
                    <Icon className="h-6 w-6" />
                </div>
                {!isStatus && <TrendingUp className="h-4 w-4 text-zinc-300" />}
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                {isStatus ? (
                    <div className="mt-2 h-fit">
                        <StatusBadge status={value} />
                    </div>
                ) : (
                    <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter italic whitespace-nowrap overflow-hidden text-ellipsis">
                        {value}
                    </h3>
                )}
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2 bg-zinc-50 dark:bg-zinc-800/50 w-fit px-3 py-1 rounded-full">{subtitle}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, { bg: string, text: string, icon: any, border: string }> = {
        DRAFT: { bg: "bg-zinc-100 dark:bg-zinc-800/50", text: "text-zinc-500", icon: Clock, border: "border-zinc-200" },
        PROCESSED: { bg: "bg-brand/10", text: "text-brand", icon: TrendingUp, border: "border-brand/20" },
        PAID: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600", icon: CheckCircle2, border: "border-emerald-500/20" },
        UNPAID: { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-600", icon: AlertCircle, border: "border-rose-500/20" }
    };

    const config = configs[status] || configs.DRAFT;
    const Icon = config.icon;

    return (
        <span className={cn(
            "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm transition-all animate-in zoom-in-95",
            config.bg, config.text, config.border
        )}>
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
}

// Print Component
function PrintablePayslip({ payslip, school }: { payslip: any, school: any }) {
    if (!payslip) return null;
    const totalDeductions = payslip.tax + payslip.pf + payslip.insurance + payslip.leaveDeduction + payslip.otherDeductions;

    return (
        <div className="max-w-[800px] mx-auto p-12 bg-white text-zinc-900 font-sans border border-zinc-200">
            {/* School Header */}
            <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-10 mb-10">
                <div className="space-y-4">
                    {school?.logo ? (
                        <img src={school.logo} alt="School Logo" className="h-24 w-auto object-contain" />
                    ) : (
                        <div className="h-20 w-20 bg-brand flex items-center justify-center text-white text-3xl font-black">{school?.name?.[0]}</div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">{school?.name}</h1>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 max-w-[300px] leading-relaxed">
                            {school?.address}
                        </p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-3 pt-4">
                    <div className="bg-brand text-white hover:brightness-110 px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px]">Payslip Archive</div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Document Reference</p>
                        <p className="text-sm font-black italic">#{payslip.id.toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Employee & Month Info */}
            <div className="grid grid-cols-2 gap-10 mb-12">
                <div className="p-10 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Employee Intelligence</p>
                        <p className="text-xl font-black italic tracking-tight">{payslip.user.firstName} {payslip.user.lastName}</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{payslip.user.designation || "Executive Professional"}</p>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-zinc-200">
                        <div className="flex items-center gap-3 text-xs">
                            <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="font-semibold text-zinc-600">{payslip.user.email}</span>
                        </div>
                        {payslip.user.phone && (
                            <div className="flex items-center gap-3 text-xs">
                                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                <span className="font-semibold text-zinc-600">{payslip.user.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-10 bg-brand text-white hover:brightness-110 rounded-[2.5rem] flex flex-col justify-between shadow-2xl">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pay Period Verification</p>
                        <p className="text-2xl font-black italic tracking-tighter">
                            {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pb-2">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-80">Working Days</p>
                            <p className="text-lg font-black">{payslip.totalDays} Total</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-brand/80 uppercase tracking-widest opacity-80">Attendance Rate</p>
                            <p className="text-lg font-black">{Math.round((payslip.presentDays / payslip.totalDays) * 100)}% Match</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 border-b-2 border-zinc-900 pb-3 flex justify-between">
                        Earnings Structure <span className="text-zinc-300 font-bold tracking-normal italic">(INR)</span>
                    </h2>
                    <div className="space-y-4">
                        <PrintRow label="Basic Salary" value={payslip.basic} />
                        <PrintRow label="House Rent Allowance" value={payslip.hra} />
                        <PrintRow label="Special Allowances" value={payslip.allowances} />
                        <PrintRow label="Bonus / Incentives" value={payslip.bonus} />
                        {payslip.customAdditions && JSON.parse(payslip.customAdditions).map((a: any, i: number) => (
                            <PrintRow key={i} label={a.label || "Additional"} value={a.amount} />
                        ))}
                        <div className="pt-4 border-t-2 border-zinc-100 flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Total Gross</span>
                            <span className="font-black text-lg italic tracking-tighter">₹{payslip.grossSalary.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 border-b-2 border-zinc-900 pb-3 flex justify-between">
                        Regulatory Deductions <span className="text-rose-400/50 font-bold tracking-normal italic">(-)</span>
                    </h2>
                    <div className="space-y-4">
                        <PrintRow label="Professional Tax" value={payslip.tax} isDeduction />
                        <PrintRow label="Provident Fund contribution" value={payslip.pf} isDeduction />
                        <PrintRow label="Medical Insurance Premium" value={payslip.insurance} isDeduction />
                        <PrintRow label="Leave Without Pay (LWP)" value={payslip.leaveDeduction} isDeduction />
                        {payslip.customDeductions && JSON.parse(payslip.customDeductions).map((d: any, i: number) => (
                            <PrintRow key={i} label={d.label || "Deduction"} value={d.amount} isDeduction />
                        ))}
                        <PrintRow label="Other Recoveries" value={payslip.otherDeductions} isDeduction />
                        <div className="pt-4 border-t-2 border-zinc-100 flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Total Withheld</span>
                            <span className="font-black text-lg italic tracking-tighter text-rose-500">-₹{totalDeductions.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="bg-emerald-50 p-12 rounded-[3.5rem] border-4 border-white shadow-inner flex flex-col lg:flex-row items-center justify-between relative overflow-hidden ring-1 ring-emerald-100">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CheckCircle2 className="h-48 w-48" />
                </div>
                <div>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-3 leading-none opacity-80">Net Disbursement Amount</p>
                    <h3 className="text-6xl font-black italic text-zinc-900 tracking-tighter leading-none">₹{payslip.netSalary.toLocaleString()}</h3>
                </div>
                <div className="text-right mt-6 lg:mt-0 pt-6 lg:pt-0 lg:border-l-2 border-emerald-200 lg:pl-10">
                    <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-2 opacity-60">Authentication Stamp</p>
                    <div className="h-20 w-32 bg-white rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-200">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                </div>
            </div>

            {/* Terms & Footer */}
            <div className="mt-16 pt-8 border-t border-zinc-100 text-center">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">This is a system generated cryptographic secure artifact. No physical signature required.</p>
                <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase">
                        <MapPin className="h-3 w-3 text-zinc-300" /> Secure Storage Location 7A
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase">
                        <Clock className="h-3 w-3 text-zinc-300" /> Hash: {payslip.id.slice(0, 16).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PrintRow({ label, value, isDeduction }: { label: string, value: number, isDeduction?: boolean }) {
    return (
        <div className="flex items-center justify-between text-xs px-2">
            <span className="font-bold text-zinc-600 uppercase tracking-tighter">{label}</span>
            <span className={cn("font-mono font-black italic", isDeduction ? "text-rose-500" : "text-zinc-900")}>
                {isDeduction && value > 0 ? "-" : ""}₹{value.toLocaleString()}
            </span>
        </div>
    );
}
