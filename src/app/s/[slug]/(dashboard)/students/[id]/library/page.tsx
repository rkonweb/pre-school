"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import { cn, getCurrencySymbol } from "@/lib/utils";
import { getStudentLibraryHistoryAction } from "@/app/actions/library-actions";
import { getStudentAction } from "@/app/actions/student-actions";
import { toast } from "sonner";

export default function LibraryTab() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [libraryTransactions, setLibraryTransactions] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        setIsLoading(true);
        const [studentRes, libraryRes] = await Promise.all([
            getStudentAction(slug, id),
            getStudentLibraryHistoryAction(slug, id)
        ]);

        if (studentRes.success) setStudent(studentRes.student);
        if (libraryRes.success) setLibraryTransactions(libraryRes.data || []);

        setIsLoading(false);
    }

    if (isLoading || !student) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-2xl font-black text-zinc-900">Library History</h3>
                <p className="text-sm font-medium text-zinc-500 mt-1">Book borrowing and return records.</p>
            </div>

            <div className="bg-white rounded-[40px] border border-zinc-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50/50 border-b border-zinc-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Book Information</th>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Issued Date</th>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Fine</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {libraryTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-zinc-50/50 transition-all">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-zinc-900">{tx.book?.title || "Unknown Title"}</div>
                                    <div className="text-xs text-zinc-500">{tx.book?.author || "Unknown Author"}</div>
                                </td>
                                <td className="px-8 py-6 text-sm font-medium text-zinc-700">
                                    {new Date(tx.issuedDate).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        tx.status === "ISSUED" ? "bg-amber-100 text-amber-600" :
                                            tx.status === "RETURNED" ? "bg-emerald-100 text-emerald-600" :
                                                "bg-zinc-100 text-zinc-500"
                                    )}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-red-600">
                                    {tx.fineAmount > 0 ? getCurrencySymbol(student.school?.currency) + tx.fineAmount : "-"}
                                </td>
                            </tr>
                        ))}
                        {libraryTransactions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <BookOpen className="h-10 w-10 text-zinc-200 mx-auto mb-4" />
                                    <p className="text-zinc-400 font-bold">No library history found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
