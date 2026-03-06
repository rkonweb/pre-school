import { prisma } from "@/lib/prisma";
import { CircleDollarSign, Calendar, FileText, ArrowUpRight, TrendingUp, IndianRupee, Clock, Wallet, Receipt, Filter } from "lucide-react";
import { getTransportFeesAction } from "@/app/actions/transport-fee-actions";
import { getCurrencySymbol, cn } from "@/lib/utils";
import { SectionHeader, StatusChip, ErpCard, Btn, tableStyles, C } from "@/components/ui/erp-ui";
import Link from "next/link";

export default async function TransportFeesPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    const school = await prisma.school.findUnique({
        where: { slug },
        select: { id: true, currency: true }
    });
    const currencySymbol = getCurrencySymbol(school?.currency || 'INR');

    if (!school) return <div>School not found</div>;

    const feesRes = await getTransportFeesAction(slug);
    const fees = feesRes.success && feesRes.data ? feesRes.data : [];

    const totalRevenue = fees.reduce((acc: number, f: any) => acc + f.amount, 0);
    const pendingFees = fees.filter((f: any) => f.status !== 'PAID').reduce((acc: number, f: any) => acc + f.amount, 0);
    const collectedFees = fees.filter((f: any) => f.status === 'PAID').reduce((acc: number, f: any) => acc + f.amount, 0);

    return (
        <div className="p-8 space-y-10 w-full mb-20">
            <SectionHeader
                title="Revenue Matrix"
                subtitle="Consolidated financial telemetry and fleet economy analytics."
                icon={<CircleDollarSign size={18} color={C.amber} />}
                action={
                    <Link href={`/s/${slug}/transport/fees/generate`}>
                        <Btn
                            icon={<Receipt size={18} />}
                            className="!rounded-[20px] shadow-2xl shadow-brand/40"
                        >
                            GENERATE INVOICES
                        </Btn>
                    </Link>
                }
            />

            {/* Stats Ecosystem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ErpCard noPad className="!rounded-[40px] border-none shadow-2xl shadow-emerald-500/20 bg-gradient-to-br from-emerald-900 to-emerald-950 text-emerald-50 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <IndianRupee className="h-32 w-32" />
                    </div>
                    <div className="p-10 relative z-10">
                        <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Gross Revenue Matrix</p>
                        <h3 className="text-4xl font-black mt-4 tracking-tighter">
                            {currencySymbol}{totalRevenue.toLocaleString()}
                        </h3>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 text-emerald-400">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                100% Target Integrity
                            </div>
                        </div>
                    </div>
                </ErpCard>

                <ErpCard className="!rounded-[40px] border-zinc-200 p-10 shadow-xl shadow-zinc-200/50 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Realized Liquidity</p>
                            <h3 className="text-4xl font-black text-zinc-900 mt-4 tracking-tighter">
                                {currencySymbol}{collectedFees.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl text-indigo-500 shadow-inner">
                            <Wallet className="h-7 w-7" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Efficiency Sync</span>
                            <span className="text-[9px] font-black text-indigo-500 uppercase">
                                {totalRevenue > 0 ? ((collectedFees / totalRevenue) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-zinc-50 h-2 rounded-full overflow-hidden border border-zinc-100">
                            <div
                                className="bg-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)] w-[var(--p)]"
                                style={{ '--p': `${totalRevenue > 0 ? (collectedFees / totalRevenue) * 100 : 0}%` } as React.CSSProperties}
                            />
                        </div>
                    </div>
                </ErpCard>

                <ErpCard className="!rounded-[40px] border-zinc-200 p-10 shadow-xl shadow-zinc-200/50 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Pending Receivables</p>
                            <h3 className="text-4xl font-black text-zinc-900 mt-4 tracking-tighter">
                                {currencySymbol}{pendingFees.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-4 bg-zinc-50 rounded-2xl text-amber-500 shadow-inner">
                            <Clock className="h-7 w-7" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <StatusChip label="Pending" />
                    </div>
                </ErpCard>
            </div>

            {/* Invoices Ledger Table */}
            <ErpCard noPad className="!rounded-[40px] border-zinc-200 shadow-2xl shadow-zinc-200/50 overflow-hidden">
                <div className="p-8 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                    <div>
                        <h4 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Financial Ledger</h4>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Transaction history and invoice audit trail</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-[18px] shadow-sm border border-zinc-100 text-zinc-300">
                            <Filter className="h-6 w-6" />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={tableStyles.thead}>
                                <th style={tableStyles.th}>Passenger Profile</th>
                                <th style={tableStyles.th}>Invoice Specification</th>
                                <th style={tableStyles.th} className="text-center">Valuation</th>
                                <th style={tableStyles.th} className="text-center">Maturity Date</th>
                                <th style={tableStyles.th} className="text-right pr-10">Status Matrix</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {fees.length > 0 ? (
                                fees.map((fee: any) => (
                                    <tr key={fee.id} className="hover:bg-zinc-50/80 transition-all group">
                                        <td style={tableStyles.td} className="py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-sm shadow-lg ring-4 ring-zinc-50">
                                                    {fee.student.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{fee.student.firstName} {fee.student.lastName}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{fee.student.grade}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">{fee.title}</p>
                                                <p className="text-[9px] font-bold text-zinc-400 italic">#{fee.id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td} className="text-center">
                                            <span className="text-sm font-black text-zinc-900 tracking-tight">{currencySymbol}{fee.amount.toLocaleString()}</span>
                                        </td>
                                        <td style={tableStyles.td} className="text-center">
                                            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                                <Calendar className="h-3.5 w-3.5 text-zinc-300" />
                                                {new Date(fee.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={tableStyles.td} className="text-right pr-10">
                                            <StatusChip
                                                label={fee.status === 'PAID' ? 'Approved' : fee.status === 'OVERDUE' ? 'Rejected' : 'Draft'}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Receipt className="h-16 w-16 text-zinc-400" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Zero consolidated financial hits detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </ErpCard>
        </div>
    );
}
