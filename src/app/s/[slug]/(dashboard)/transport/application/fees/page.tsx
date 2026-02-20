
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CircleDollarSign, Calendar, FileText, ArrowUpRight } from "lucide-react";
import { getTransportFeesAction } from "@/app/actions/transport-fee-actions";

export default async function TransportFeesPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    // Fetch stats
    const school = await prisma.school.findUnique({
        where: { slug },
        select: { id: true }
    });

    if (!school) return <div>School not found</div>;

    // Fetch latest transport fees
    const feesRes = await getTransportFeesAction(slug);
    const fees = feesRes.success && feesRes.data ? feesRes.data : [];

    // Calculate stats
    const totalRevenue = fees.reduce((acc: number, f: any) => acc + f.amount, 0);
    const pendingFees = fees.filter((f: any) => f.status !== 'PAID').reduce((acc: number, f: any) => acc + f.amount, 0);
    const collectedFees = fees.filter((f: any) => f.status === 'PAID').reduce((acc: number, f: any) => acc + f.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Transport Fees</h1>
                    <p className="text-muted-foreground text-sm">Manage invoices and track transport revenue</p>
                </div>
                <Link
                    href={`/s/${slug}/transport/fees/generate`}
                    className="bg-brand text-[var(--secondary-color)] px-4 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 shadow-lg shadow-brand/20 transition-all font-medium"
                >
                    <FileText className="h-4 w-4" /> Generate Invoices
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <CircleDollarSign className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" /> +12%
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900">₹{totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500 mt-1">Total Billed Revenue</div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Calendar className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900">₹{collectedFees.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500 mt-1">Collected Amount</div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900">₹{pendingFees.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500 mt-1">Pending Collection</div>
                </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="font-semibold text-zinc-900">Recent Invoices</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Student</th>
                                <th className="px-6 py-3">Invoice</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-zinc-700">
                            {fees.length > 0 ? (
                                fees.map((fee: any) => (
                                    <tr key={fee.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-3 font-medium">
                                            {fee.student.firstName} {fee.student.lastName}
                                            <span className="block text-xs text-zinc-400 font-normal">{fee.student.grade}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-zinc-900">{fee.title}</div>
                                            <div className="text-xs text-zinc-500 truncate max-w-[200px]">{fee.description}</div>
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-zinc-900">₹{fee.amount.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-zinc-500">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-3">
                                            <StatusBadge status={fee.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-zinc-400">
                                        No invoices found. Generate new invoices to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        OVERDUE: "bg-red-100 text-red-700 border-red-200",
    } as any;

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {status}
        </span>
    );
}
