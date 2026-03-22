"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { searchStudentsAction } from "@/app/actions/student-actions";
import { getStaffAction } from "@/app/actions/staff-actions";
import {
  getBooksAction,
  issueBookAction,
  getStudentLibraryHistoryAction,
  getStaffLibraryHistoryAction,
} from "@/app/actions/library-actions";
import {
  User, BookOpen, Search, Check, Loader2, Calendar,
  ArrowLeft, AlertTriangle, ChevronRight, BookCopy,
  GraduationCap, Briefcase, Clock, RefreshCw, CheckCircle2,
  ShieldAlert, Hash, Layers,
} from "lucide-react";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isOverdue(dueDate: string | Date) {
  return new Date(dueDate) < new Date();
}

// ─── Tiny components ─────────────────────────────────────────────────────────

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  const palettes: Record<string, string> = {
    green:  "background:#D1FAE5;color:#065F46",
    red:    "background:#FEE2E2;color:#991B1B",
    amber:  "background:#FEF3C7;color:#92400E",
    blue:   "background:#DBEAFE;color:#1E40AF",
    violet: "background:#EDE9FE;color:#5B21B6",
    gray:   "background:#F3F4F6;color:#374151",
  };
  return (
    <span style={{ ...(palettes[color] ? Object.fromEntries(palettes[color].split(";").map(s => s.split(":"))) : {}), padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Pill({ icon: Icon, label, value, color = "#6366F1" }: { icon: any; label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 18px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}20` }}>
      <Icon size={16} style={{ color }} />
      <span style={{ fontWeight: 900, fontSize: 18, color, fontFamily: "'Cabinet Grotesk',sans-serif" }}>{value}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IssueBookPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Wizard
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Borrower
  const [userType, setUserType] = useState<"student" | "staff">("student");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearching, setUserSearching] = useState(false);
  const [borrowerHistory, setBorrowerHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Book
  const [bookQuery, setBookQuery] = useState("");
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [bookSearching, setBookSearching] = useState(false);

  // Due date
  const [dueDate, setDueDate] = useState(addDays(14));

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // ── User search debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (userQuery.length < 2) { setUserResults([]); return; }
    const t = setTimeout(async () => {
      setUserSearching(true);
      if (userType === "student") {
        const res = await searchStudentsAction(slug, userQuery);
        if (res.success) setUserResults(res.students || []);
      } else {
        const res = await getStaffAction(slug);
        if (res.success && res.data) {
          setUserResults(res.data.filter((s: any) =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(userQuery.toLowerCase())
          ));
        }
      }
      setUserSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [userQuery, userType, slug]);

  // ── Book search debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (bookQuery.length < 2) { setBookResults([]); return; }
    const t = setTimeout(async () => {
      setBookSearching(true);
      const res = await getBooksAction(slug, bookQuery);
      if (res.success) setBookResults(res.data || []);
      setBookSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [bookQuery, slug]);

  // ── Load borrower history after selection ───────────────────────────────
  const loadBorrowerHistory = useCallback(async (user: any, type: "student" | "staff") => {
    setLoadingHistory(true);
    const res = type === "student"
      ? await getStudentLibraryHistoryAction(slug, user.id)
      : await getStaffLibraryHistoryAction(slug, user.id);
    if (res.success) setBorrowerHistory(res.data || []);
    setLoadingHistory(false);
  }, [slug]);

  // ── Computed ─────────────────────────────────────────────────────────────
  const activeLoans = borrowerHistory.filter((tx) => tx.status === "ISSUED");
  const overdueLoans = activeLoans.filter((tx) => isOverdue(tx.dueDate));
  const hasWarning = overdueLoans.length > 0;

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selectedUser || !selectedBook || !dueDate) return;
    setSubmitting(true);
    setError("");
    const res = await issueBookAction({
      bookId: selectedBook.id,
      studentId: userType === "student" ? selectedUser.id : undefined,
      staffId: userType === "staff" ? selectedUser.id : undefined,
      dueDate: new Date(dueDate),
    }, slug);
    if (res.success) {
      setDone(true);
    } else {
      setError(res.error || "Failed to issue book");
    }
    setSubmitting(false);
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: "60px 24px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#059669,#10B981)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(16,185,129,0.3)" }}>
          <CheckCircle2 size={40} color="white" />
        </div>
        <div>
          <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 28, fontWeight: 900, color: "#1E1B4B", margin: 0 }}>Book Issued Successfully!</h2>
          <p style={{ color: "#6B7280", margin: "8px 0 0", fontSize: 15 }}>
            <b>{selectedBook?.title}</b> issued to <b>{selectedUser?.firstName} {selectedUser?.lastName}</b><br />
            Due on <b>{formatDate(dueDate)}</b>
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => { setStep(1); setSelectedUser(null); setSelectedBook(null); setDone(false); setBorrowerHistory([]); setUserQuery(""); setBookQuery(""); setDueDate(addDays(14)); }}
            style={{ height: 44, padding: "0 22px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Issue Another Book
          </button>
          <Link href={`/s/${slug}/library`}
            style={{ height: 44, padding: "0 22px", borderRadius: 12, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", textDecoration: "none" }}>
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  // ─── Step labels ──────────────────────────────────────────────────────────
  const steps = [
    { num: 1, label: "Borrower" },
    { num: 2, label: "Book" },
    { num: 3, label: "Confirm" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 0 80px" }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <Link href={`/s/${slug}/library`}
          style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", textDecoration: "none" }}>
          <ArrowLeft size={18} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 22, fontWeight: 900, color: "#1E1B4B", margin: 0 }}>Issue Book</h1>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: "2px 0 0" }}>Assign a book to a student or staff member</p>
        </div>
        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div onClick={() => { if (s.num < step) setStep(s.num as any); }}
                style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, cursor: s.num < step ? "pointer" : "default",
                  background: step > s.num ? "linear-gradient(135deg,#059669,#10B981)" : step === s.num ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "#F3F4F6",
                  color: step >= s.num ? "white" : "#9CA3AF", boxShadow: step === s.num ? "0 4px 12px rgba(99,102,241,0.25)" : "none" }}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: step === s.num ? "#6366F1" : step > s.num ? "#059669" : "#9CA3AF" }}>{s.label}</span>
              {i < steps.length - 1 && <div style={{ width: 28, height: 2, borderRadius: 2, background: step > s.num ? "#D1FAE5" : "#F3F4F6" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* ── LEFT: Main wizard ──────────────────────────────────────────── */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #F3F4F6", padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* ════ STEP 1: Borrower ════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: "#1E1B4B", margin: "0 0 20px" }}>Select Borrower</h2>

              {/* Type toggle */}
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                {(["student", "staff"] as const).map((t) => (
                  <button key={t} onClick={() => { setUserType(t); setUserQuery(""); setUserResults([]); setSelectedUser(null); setBorrowerHistory([]); }}
                    style={{ flex: 1, height: 44, borderRadius: 12, border: `2px solid ${userType === t ? "#6366F1" : "#E5E7EB"}`, background: userType === t ? "#EDE9FE" : "white",
                      color: userType === t ? "#4F46E5" : "#6B7280", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {t === "student" ? <GraduationCap size={16} /> : <Briefcase size={16} />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input autoFocus type="text" value={userQuery} onChange={(e) => setUserQuery(e.target.value)}
                  placeholder={`Search ${userType} by name…`}
                  style={{ width: "100%", height: 48, borderRadius: 12, border: "1.5px solid #E5E7EB", paddingLeft: 42, paddingRight: 14, fontSize: 14, fontWeight: 500, color: "#1E1B4B", outline: "none", boxSizing: "border-box", background: "#FAFAFA" }} />
                {userSearching && <Loader2 size={15} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", animation: "spin 1s linear infinite" }} />}
              </div>

              {/* Results */}
              {userResults.length > 0 && (
                <div style={{ border: "1px solid #F3F4F6", borderRadius: 14, overflow: "hidden" }}>
                  {userResults.slice(0, 8).map((u, i) => (
                    <button key={u.id} onClick={async () => { setSelectedUser(u); await loadBorrowerHistory(u, userType); setStep(2); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "white", border: "none", borderBottom: i < userResults.length - 1 ? "1px solid #F9FAFB" : "none", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: userType === "student" ? "#EDE9FE" : "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {userType === "student" ? <GraduationCap size={18} color="#7C3AED" /> : <Briefcase size={18} color="#2563EB" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1E1B4B" }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {userType === "student" ? u.admissionNumber || u.grade || "Student" : u.designation || u.role || "Staff"}
                        </div>
                      </div>
                      <ChevronRight size={16} color="#D1D5DB" />
                    </button>
                  ))}
                </div>
              )}
              {userQuery.length >= 2 && userResults.length === 0 && !userSearching && (
                <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13, padding: "24px 0" }}>No {userType}s found matching "{userQuery}"</p>
              )}
              {userQuery.length === 0 && (
                <p style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Type at least 2 characters to search…</p>
              )}
            </div>
          )}

          {/* ════ STEP 2: Book ════════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: "#1E1B4B", margin: 0 }}>Select Book</h2>
                <button onClick={() => setStep(1)} style={{ fontSize: 12, color: "#6366F1", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>← Change Borrower</button>
              </div>

              {/* Overdue warning */}
              {hasWarning && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#FEF3C7", border: "1px solid #FDE68A", marginBottom: 16 }}>
                  <ShieldAlert size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#92400E" }}>Borrower has {overdueLoans.length} overdue book{overdueLoans.length > 1 ? "s" : ""}</div>
                    <div style={{ fontSize: 11, color: "#B45309", marginTop: 2 }}>
                      {overdueLoans.map((tx) => tx.book?.title).join(", ")} — overdue by {overdueLoans.map((tx) => {
                        const days = Math.ceil((Date.now() - new Date(tx.dueDate).getTime()) / 86400000);
                        return `${days}d`;
                      }).join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input autoFocus type="text" value={bookQuery} onChange={(e) => setBookQuery(e.target.value)}
                  placeholder="Search by title, author or ISBN…"
                  style={{ width: "100%", height: 48, borderRadius: 12, border: "1.5px solid #E5E7EB", paddingLeft: 42, paddingRight: 14, fontSize: 14, fontWeight: 500, color: "#1E1B4B", outline: "none", boxSizing: "border-box", background: "#FAFAFA" }} />
                {bookSearching && <Loader2 size={15} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", animation: "spin 1s linear infinite" }} />}
              </div>

              {/* Book results */}
              {bookResults.length > 0 && (
                <div style={{ border: "1px solid #F3F4F6", borderRadius: 14, overflow: "hidden" }}>
                  {bookResults.slice(0, 8).map((book, i) => {
                    const isAvail = book.available > 0;
                    return (
                      <button key={book.id} onClick={() => { if (!isAvail) return; setSelectedBook(book); setStep(3); }}
                        disabled={!isAvail}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "white", border: "none",
                          borderBottom: i < bookResults.length - 1 ? "1px solid #F9FAFB" : "none", cursor: isAvail ? "pointer" : "not-allowed", textAlign: "left", opacity: isAvail ? 1 : 0.5 }}>
                        {book.coverUrl
                          ? <img src={book.coverUrl} alt="" style={{ width: 38, height: 50, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                          : <div style={{ width: 38, height: 50, borderRadius: 8, background: isAvail ? "#D1FAE5" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <BookOpen size={18} color={isAvail ? "#059669" : "#DC2626"} />
                            </div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#1E1B4B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{book.author}{book.isbn ? ` · ${book.isbn}` : ""}</div>
                          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                            {book.category && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "#EDE9FE", color: "#5B21B6" }}>{book.category}</span>}
                            {book.shelfNo && <span style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF" }}>Shelf {book.shelfNo}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8, background: isAvail ? "#D1FAE5" : "#FEE2E2", color: isAvail ? "#065F46" : "#991B1B" }}>
                            {book.available}/{book.copies}
                          </span>
                          <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 2 }}>Available</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {bookQuery.length >= 2 && bookResults.length === 0 && !bookSearching && (
                <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13, padding: "24px 0" }}>No books found matching "{bookQuery}"</p>
              )}
              {bookQuery.length === 0 && (
                <p style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Type at least 2 characters to search books…</p>
              )}
            </div>
          )}

          {/* ════ STEP 3: Confirm ═════════════════════════════════════════ */}
          {step === 3 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: "#1E1B4B", margin: 0 }}>Confirm Issue</h2>
                <button onClick={() => setStep(2)} style={{ fontSize: 12, color: "#6366F1", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>← Change Book</button>
              </div>

              {/* Borrower + Book summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #E5E7EB", background: "#FAFAFA" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Borrower</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: userType === "student" ? "#EDE9FE" : "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {userType === "student" ? <GraduationCap size={16} color="#7C3AED" /> : <Briefcase size={16} color="#2563EB" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1E1B4B" }}>{selectedUser?.firstName} {selectedUser?.lastName}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "capitalize" }}>{userType}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #E5E7EB", background: "#FAFAFA" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Book</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={16} color="#059669" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1E1B4B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedBook?.title}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF" }}>{selectedBook?.author}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Due date with presets */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 10 }}>
                  <Calendar size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
                  Due Date
                </label>
                {/* Quick presets */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {[
                    { label: "7 days", days: 7 },
                    { label: "14 days", days: 14 },
                    { label: "30 days", days: 30 },
                    { label: "60 days", days: 60 },
                  ].map((p) => {
                    const val = addDays(p.days);
                    return (
                      <button key={p.days} onClick={() => setDueDate(val)}
                        style={{ height: 32, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${dueDate === val ? "#6366F1" : "#E5E7EB"}`,
                          background: dueDate === val ? "#EDE9FE" : "white", color: dueDate === val ? "#4F46E5" : "#6B7280",
                          fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ position: "relative" }}>
                  <Calendar size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input type="date" value={dueDate} min={addDays(1)} onChange={(e) => setDueDate(e.target.value)}
                    style={{ width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #E5E7EB", paddingLeft: 36, fontSize: 14, fontWeight: 600, color: "#1E1B4B", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "#FEE2E2", marginBottom: 16 }}>
                  <AlertTriangle size={14} color="#DC2626" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#DC2626" }}>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)}
                  style={{ height: 46, padding: "0 20px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", fontWeight: 700, fontSize: 13, color: "#6B7280", cursor: "pointer" }}>
                  Back
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ flex: 1, height: 46, borderRadius: 12, border: "none", background: submitting ? "#A5B4FC" : "linear-gradient(135deg,#6366F1,#8B5CF6)",
                    color: "white", fontWeight: 800, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
                  {submitting ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Issuing…</> : <><Check size={16} /> Confirm & Issue Book</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Context panel ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Borrower panel */}
          {selectedUser ? (
            <div style={{ background: "white", borderRadius: 18, border: "1px solid #F3F4F6", padding: 20, boxShadow: "0 2px 14px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: userType === "student" ? "linear-gradient(135deg,#7C3AED,#8B5CF6)" : "linear-gradient(135deg,#2563EB,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {userType === "student" ? <GraduationCap size={20} color="white" /> : <Briefcase size={20} color="white" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#1E1B4B" }}>{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "capitalize" }}>{selectedUser.admissionNumber || selectedUser.designation || userType}</div>
                </div>
              </div>

              {/* Loan stats */}
              {loadingHistory ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9CA3AF", fontSize: 12 }}>
                  <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Loading history…
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    <Pill icon={BookCopy} label="Active" value={activeLoans.length} color="#6366F1" />
                    <Pill icon={AlertTriangle} label="Overdue" value={overdueLoans.length} color={overdueLoans.length > 0 ? "#DC2626" : "#059669"} />
                    <Pill icon={Clock} label="Total" value={borrowerHistory.length} color="#F59E0B" />
                  </div>

                  {/* Active loans list */}
                  {activeLoans.length > 0 && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Currently Holding</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {activeLoans.slice(0, 3).map((tx) => {
                          const over = isOverdue(tx.dueDate);
                          return (
                            <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: over ? "#FEF3C7" : "#F8FAFC", border: `1px solid ${over ? "#FDE68A" : "#F3F4F6"}` }}>
                              <BookOpen size={13} color={over ? "#D97706" : "#6366F1"} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.book?.title}</div>
                                <div style={{ fontSize: 10, color: over ? "#D97706" : "#9CA3AF" }}>Due {formatDate(tx.dueDate)}</div>
                              </div>
                              {over && <AlertTriangle size={11} color="#D97706" />}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,#EDE9FE,#E0E7FF)", borderRadius: 18, padding: 20, textAlign: "center" }}>
              <User size={32} color="#7C3AED" style={{ marginBottom: 10 }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: "#1E1B4B", margin: 0 }}>No borrower selected</p>
              <p style={{ fontSize: 11, color: "#6B7280", margin: "6px 0 0" }}>Search and select a student or staff member in Step 1</p>
            </div>
          )}

          {/* Selected book panel */}
          {selectedBook ? (
            <div style={{ background: "white", borderRadius: 18, border: "1px solid #F3F4F6", padding: 20, boxShadow: "0 2px 14px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Selected Book</div>
              {selectedBook.coverUrl
                ? <img src={selectedBook.coverUrl} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} />
                : <div style={{ width: "100%", height: 100, borderRadius: 12, background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <BookOpen size={36} color="#059669" />
                  </div>
              }
              <div style={{ fontWeight: 800, fontSize: 14, color: "#1E1B4B", marginBottom: 4 }}>{selectedBook.title}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>{selectedBook.author}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedBook.isbn && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9CA3AF" }}><Hash size={12} /> {selectedBook.isbn}</div>}
                {selectedBook.category && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9CA3AF" }}><Layers size={12} /> {selectedBook.category}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <BookCopy size={12} color="#059669" />
                  <span style={{ color: "#059669", fontWeight: 700 }}>{selectedBook.available} available</span>
                  <span style={{ color: "#9CA3AF" }}>/ {selectedBook.copies} copies</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,#D1FAE5,#ECFDF5)", borderRadius: 18, padding: 20, textAlign: "center" }}>
              <BookOpen size={32} color="#059669" style={{ marginBottom: 10 }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: "#1E1B4B", margin: 0 }}>No book selected</p>
              <p style={{ fontSize: 11, color: "#6B7280", margin: "6px 0 0" }}>Search and select a book in Step 2</p>
            </div>
          )}

          {/* Due date preview */}
          {step === 3 && (
            <div style={{ background: "linear-gradient(135deg,#1E1B4B,#312E81)", borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Return Due</div>
              <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 22, fontWeight: 900, color: "white" }}>{formatDate(dueDate)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                {Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)} days from today
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
