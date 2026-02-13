"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    searchStudentsAction
} from "@/app/actions/student-actions";
import {
    getStaffAction // Using this to fetch all staff for now
} from "@/app/actions/staff-actions";
import {
    getBooksAction,
    issueBookAction
} from "@/app/actions/library-actions";
import {
    User,
    Book,
    Search,
    Check,
    Loader2,
    Calendar,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function IssueBookPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState<"student" | "staff">("student");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [dueDate, setDueDate] = useState<string>(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [submitting, setSubmitting] = useState(false);

    // Search States
    const [userQuery, setUserQuery] = useState("");
    const [bookQuery, setBookQuery] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [bookResults, setBookResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Handlers
    async function handleUserSearch(q: string) {
        setUserQuery(q);
        if (q.length < 2) return;

        setSearching(true);
        if (userType === "student") {
            const res = await searchStudentsAction(slug, q);
            if (res.success) setUserResults(res.students || []);
        } else {
            // For staff, we filter client side from a full fetch if not optimized, 
            // but let's assume we fetch all for now or optimize later.
            // Actually getStaffAction returns all.
            const res = await getStaffAction(slug);
            if (res.success && res.data) {
                const filtered = res.data.filter((s: any) =>
                    s.firstName?.toLowerCase().includes(q.toLowerCase()) ||
                    s.lastName?.toLowerCase().includes(q.toLowerCase())
                );
                setUserResults(filtered);
            }
        }
        setSearching(false);
    }

    async function handleBookSearch(q: string) {
        setBookQuery(q);
        if (q.length < 2) return;

        setSearching(true);
        const res = await getBooksAction(slug, q);
        if (res.success) {
            setBookResults(res.data || []);
        }
        setSearching(false);
    }

    async function handleSubmit() {
        if (!selectedUser || !selectedBook) return;
        setSubmitting(true);

        try {
            const res = await issueBookAction({
                bookId: selectedBook.id,
                studentId: userType === "student" ? selectedUser.id : undefined,
                staffId: userType === "staff" ? selectedUser.id : undefined,
                dueDate: new Date(dueDate)
            }, slug);

            if (res.success) {
                toast.success("Book issued successfully");
                router.push(`/s/${slug}/library`);
            } else {
                toast.error(res.error || "Failed to issue book");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-8">
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Issue Book</h1>
                <p className="text-zinc-500">Assign a book to a student or staff member.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                            step >= s ? "bg-brand text-white" : "bg-zinc-100 text-zinc-400"
                        )}>
                            {s}
                        </div>
                        {s < 3 && <div className="h-1 w-12 bg-zinc-100" />}
                    </div>
                ))}
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-100 transition-all">
                {/* Step 1: Select Borrower */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h2 className="text-xl font-bold text-zinc-900">Select Borrower</h2>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setUserType("student"); setUserQuery(""); setUserResults([]); }}
                                className={cn(
                                    "flex-1 rounded-xl border-2 p-4 font-bold transition-all",
                                    userType === "student" ? "border-brand bg-brand/5 text-brand" : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200"
                                )}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => { setUserType("staff"); setUserQuery(""); setUserResults([]); }}
                                className={cn(
                                    "flex-1 rounded-xl border-2 p-4 font-bold transition-all",
                                    userType === "staff" ? "border-brand bg-brand/5 text-brand" : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-200"
                                )}
                            >
                                Staff
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder={`Search ${userType}...`}
                                className="w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-zinc-900 shadow-sm ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-brand transition-all"
                                value={userQuery}
                                onChange={(e) => handleUserSearch(e.target.value)}
                            />
                            {searching && <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-zinc-400" />}
                        </div>

                        {/* User Results */}
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {userResults.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => { setSelectedUser(user); setStep(2); }}
                                    className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-zinc-50 transition-colors"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-zinc-500">{user.admissionNumber || user.designation}</p>
                                    </div>
                                    <ArrowRight className="ml-auto h-4 w-4 text-zinc-300" />
                                </button>
                            ))}
                            {userQuery.length > 1 && userResults.length === 0 && !searching && (
                                <div className="text-center text-sm text-zinc-400">No users found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Book */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900">Select Book</h2>
                            <button onClick={() => setStep(1)} className="text-sm font-medium text-zinc-500 hover:text-zinc-900">Change User</button>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl bg-brand/5 p-4 text-brand">
                            <User className="h-5 w-5 text-brand" />
                            <span className="font-medium">Issuing to: <b>{selectedUser?.firstName} {selectedUser?.lastName}</b></span>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search book by title or ISBN..."
                                className="w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-zinc-900 shadow-sm ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-brand transition-all"
                                value={bookQuery}
                                onChange={(e) => handleBookSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {bookResults.map((book) => (
                                <button
                                    key={book.id}
                                    onClick={() => { setSelectedBook(book); setStep(3); }}
                                    disabled={book.available <= 0}
                                    className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                        <Book className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-zinc-900">{book.title}</p>
                                        <p className="text-xs text-zinc-500">{book.author} • {book.isbn}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-full",
                                            book.available > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {book.available} Available
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h2 className="text-xl font-bold text-zinc-900">Confirm Issue</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-zinc-100 p-4">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Borrower</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                                        <p className="text-xs text-zinc-500 capitalize">{userType}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-zinc-100 p-4">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Book</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                                        <Book className="h-5 w-5 text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{selectedBook?.title}</p>
                                        <p className="text-xs text-zinc-500">{selectedBook?.author}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-zinc-900">Due Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="date"
                                    className="w-full rounded-2xl border-0 bg-zinc-50 py-4 pl-12 pr-4 text-zinc-900 shadow-sm ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-brand transition-all font-medium"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 rounded-xl px-4 py-3 font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:brightness-110 hover:scale-[1.02] disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                Confirm Issue
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
