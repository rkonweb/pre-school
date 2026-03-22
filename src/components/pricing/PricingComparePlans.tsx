import React from "react";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { ALL_MODULES, MODULE_CATEGORIES } from "@/config/modules";
import type { SubscriptionPlan } from "@/types/subscription";

const CAT_ORDER = ["core", "academic", "administrative", "facilities", "communication"] as const;

function GreenCheck() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="10" fill="#22C55E" />
                <polyline points="5.5,10 8.5,13 14.5,7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

function GreyCross() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="9" fill="#E2E8F0" />
                <line x1="5.5" y1="5.5" x2="12.5" y2="12.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="12.5" y1="5.5" x2="5.5" y2="12.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        </div>
    );
}

function formatPrice(plan: SubscriptionPlan): string {
    if (plan.price === 0) return "Free";
    return `₹${plan.price.toLocaleString("en-IN")}/mo`;
}

function supportLabel(lvl: string | null | undefined): string {
    const labels: Record<string, string> = {
        email: "Email",
        priority: "Email + WhatsApp",
        dedicated: "Dedicated Manager",
    };
    return labels[lvl ?? "email"] ?? (lvl ?? "Email");
}

function planTagline(plan: SubscriptionPlan): string {
    if (plan.description) return plan.description;
    const map: Record<string, string> = {
        free: "Get started at no cost",
        basic: "Ideal for growing schools",
        premium: "Everything your school needs",
        enterprise: "Custom for large institutions",
    };
    return map[plan.tier ?? "basic"] ?? "Built for every school";
}

export async function PricingComparePlans() {
    const plans = await getSubscriptionPlansAction();
    const sorted = [...plans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    if (sorted.length === 0) return null;

    const popularIdx = (() => {
        const pi = sorted.findIndex(p => p.isPopular);
        return pi >= 0 ? pi : Math.min(1, sorted.length - 1);
    })();

    const modulesByCategory = CAT_ORDER.map(cat => ({
        cat,
        label: MODULE_CATEGORIES[cat] ?? cat,
        modules: ALL_MODULES.filter(m => m.category === cat),
    })).filter(g => g.modules.length > 0);

    const N = sorted.length;
    // 30% for feature column, rest split equally
    const planColPct = Math.floor(70 / N);

    return (
        <section style={{ padding: "80px 0 100px", background: "#F1F5F9" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>

                {/* ── Section header ─────────────────────────────── */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "10px",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px", fontWeight: 700, letterSpacing: ".12em",
                        textTransform: "uppercase", color: "#4F46E5", marginBottom: "14px",
                    }}>
                        <span style={{ width: "28px", height: "2px", background: "#A5B4FC", borderRadius: "2px", display: "inline-block" }} />
                        Compare Plans
                        <span style={{ width: "28px", height: "2px", background: "#A5B4FC", borderRadius: "2px", display: "inline-block" }} />
                    </div>
                    <h2 style={{
                        fontFamily: "'Instrument Serif', Georgia, serif",
                        fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400,
                        color: "#0F172A", lineHeight: 1.15, margin: "0 0 10px",
                    }}>
                        See <em style={{ fontStyle: "italic", color: "#4F46E5" }}>exactly</em> what you get
                    </h2>
                    <p style={{
                        fontFamily: "'Inter', sans-serif", fontSize: "15px",
                        color: "#64748B", lineHeight: 1.7, margin: 0,
                    }}>
                        No small print. Every module listed, updated in real time.
                    </p>
                </div>

                {/* ── Table card ─────────────────────────────────── */}
                {/* Override global globals.css thead th color rule */}
                <style dangerouslySetInnerHTML={{ __html: `
                    table.pct, table.pct thead, table.pct thead tr, table.pct thead tr th {
                        background: #fff !important;
                        background-image: none !important;
                        color: #0F172A !important;
                        font-weight: normal !important;
                        border-color: #E2E8F0 !important;
                    }
                    table.pct thead tr th.pct-feat-header {
                        background: #fff !important;
                        color: #0F172A !important;
                    }
                    table.pct thead tr th.pct-popular {
                        background: #4F46E5 !important;
                        color: #fff !important;
                    }
                    table.pct thead tr th.pct-popular * {
                        color: #fff !important;
                    }
                    table.pct thead tr th:not(.pct-popular) * {
                        color: #0F172A !important;
                    }
                    /* CTA buttons must keep their own text color */
                    table.pct thead tr th a.pct-cta {
                        color: #ffffff !important;
                    }
                    table.pct thead tr th.pct-popular a.pct-cta {
                        color: #4F46E5 !important;
                    }
                    table.pct thead tr th.pct-popular .pct-popular-badge,
                    table.pct thead tr th .pct-popular-badge {
                        background: #818CF8 !important;
                        color: #fff !important;
                    }
                `}} />
                <div style={{ overflowX: "auto" }}>
                    <table className="pct" style={{
                        width: "100%", minWidth: "600px",
                        borderCollapse: "collapse",
                        background: "#fff",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 4px 32px rgba(15,23,42,.12)",
                        border: "1px solid #E2E8F0",
                    }}>

                        {/* ════════════════════════════════════════════
                            PLAN HEADER ROW
                        ════════════════════════════════════════════ */}
                        <thead>
                            <tr>
                                {/* Feature label cell */}
                                <th className="pct-feat-header" style={{
                                    width: "30%",
                                    padding: "28px 28px 24px",
                                    textAlign: "left",
                                    verticalAlign: "bottom",
                                    background: "#fff",
                                    borderRight: "1px solid #E2E8F0",
                                    borderBottom: "2px solid #E2E8F0",
                                }}>
                                    <div style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: "20px", fontWeight: 700,
                                        color: "#0F172A", marginBottom: "4px",
                                    }}>
                                        Module Comparison
                                    </div>
                                    <div style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: "13px", color: "#94A3B8",
                                    }}>
                                        See what&apos;s included in each plan
                                    </div>
                                </th>

                                {/* One column per plan */}
                                {sorted.map((plan, idx) => {
                                    const isPop = idx === popularIdx;
                                    return (
                                        <th
                                            key={plan.id}
                                            className={isPop ? "pct-popular" : ""}
                                            style={{
                                                width: `${planColPct}%`,
                                                padding: "20px 16px 20px",
                                                textAlign: "center",
                                                verticalAlign: "top",
                                                background: isPop ? "#4F46E5" : "#FAFAFA",
                                                borderRight: idx < N - 1 ? "1px solid #E2E8F0" : "none",
                                                borderBottom: "2px solid #E2E8F0",
                                            }}
                                        >
                                            {/* Popular badge */}
                                            {isPop && (
                                                <div className="pct-popular-badge" style={{
                                                    display: "inline-block",
                                                    background: "#818CF8",
                                                    color: "#fff",
                                                    fontSize: "9px", fontWeight: 700,
                                                    letterSpacing: ".1em", textTransform: "uppercase",
                                                    padding: "3px 10px", borderRadius: "20px",
                                                    marginBottom: "10px",
                                                    fontFamily: "'Inter', sans-serif",
                                                }}>
                                                    Most Popular
                                                </div>
                                            )}

                                            {/* Plan name */}
                                            <div style={{
                                                fontFamily: "'DM Sans', sans-serif",
                                                fontSize: "18px", fontWeight: 800,
                                                color: isPop ? "#fff" : "#0F172A",
                                                marginBottom: "4px",
                                            }}>
                                                {plan.name}
                                            </div>

                                            {/* Tagline */}
                                            <div style={{
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: "11px",
                                                color: isPop ? "rgba(255,255,255,.7)" : "#64748B",
                                                lineHeight: 1.5,
                                                marginBottom: "12px",
                                                padding: "0 4px",
                                                minHeight: "32px",
                                            }}>
                                                {planTagline(plan)}
                                            </div>

                                            {/* Price */}
                                            <div style={{
                                                fontFamily: "'DM Sans', sans-serif",
                                                fontSize: "22px", fontWeight: 800,
                                                color: isPop ? "#fff" : "#1E293B",
                                                marginBottom: "14px",
                                                letterSpacing: "-.5px",
                                            }}>
                                                {formatPrice(plan)}
                                            </div>

                                            {/* CTA button */}
                                            <a
                                                className="pct-cta"
                                                href={plan.price === 0 ? "/signup" : `/signup?plan=${plan.slug}`}
                                                style={{
                                                    display: "block",
                                                    padding: "9px 12px",
                                                    borderRadius: "8px",
                                                    textDecoration: "none",
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: "13px", fontWeight: 700,
                                                    background: isPop ? "#fff" : "#4F46E5",
                                                    color: isPop ? "#4F46E5" : "#fff",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                <span style={{
                                                    all: "initial" as const,
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    color: isPop ? "#4F46E5" : "#ffffff",
                                                    display: "inline",
                                                }}>
                                                    {plan.price === 0 ? "Start Free" : "Get Started →"}
                                                </span>
                                            </a>

                                            {/* Learn more */}
                                            <a
                                                href={`/contact?plan=${plan.slug}`}
                                                style={{
                                                    display: "block",
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: "11px", fontWeight: 500,
                                                    color: isPop ? "rgba(255,255,255,.65)" : "#64748B",
                                                    textDecoration: "underline",
                                                    textUnderlineOffset: "2px",
                                                }}
                                            >
                                                Learn more
                                            </a>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* ════════════════════════════════════════════
                            BODY
                        ════════════════════════════════════════════ */}
                        <tbody>

                            {/* ── PRICING & LIMITS ─────────────────────── */}
                            <tr>
                                <td colSpan={N + 1} style={{
                                    padding: "8px 28px",
                                    background: "#F8FAFC",
                                    borderTop: "1px solid #E2E8F0",
                                    borderBottom: "1px solid #E2E8F0",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "10px", fontWeight: 700,
                                    letterSpacing: ".1em", textTransform: "uppercase",
                                    color: "#64748B",
                                }}>
                                    Pricing &amp; Limits
                                </td>
                            </tr>

                            {/* Max students row */}
                            <tr>
                                <td style={{
                                    padding: "14px 28px",
                                    borderBottom: "1px solid #F1F5F9",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "14px", color: "#334155", fontWeight: 500,
                                    textAlign: "left",
                                }}>
                                    Max Students
                                </td>
                                {sorted.map((plan, idx) => (
                                    <td key={plan.id} style={{
                                        padding: "14px 16px",
                                        borderBottom: "1px solid #F1F5F9",
                                        borderRight: idx < N - 1 ? "1px solid #F8FAFC" : "none",
                                        textAlign: "center",
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: "14px", fontWeight: 700,
                                        color: idx === popularIdx ? "#4F46E5" : "#334155",
                                        background: idx === popularIdx ? "rgba(99,102,241,.04)" : "transparent",
                                    }}>
                                        {(!plan.limits?.maxStudents || plan.limits.maxStudents >= 99999)
                                            ? "Unlimited"
                                            : plan.limits.maxStudents.toLocaleString("en-IN")}
                                    </td>
                                ))}
                            </tr>

                            {/* Max staff row */}
                            <tr>
                                <td style={{
                                    padding: "14px 28px",
                                    borderBottom: "1px solid #F1F5F9",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "14px", color: "#334155", fontWeight: 500,
                                    textAlign: "left",
                                }}>
                                    Max Staff
                                </td>
                                {sorted.map((plan, idx) => (
                                    <td key={plan.id} style={{
                                        padding: "14px 16px",
                                        borderBottom: "1px solid #F1F5F9",
                                        borderRight: idx < N - 1 ? "1px solid #F8FAFC" : "none",
                                        textAlign: "center",
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: "14px", fontWeight: 700,
                                        color: idx === popularIdx ? "#4F46E5" : "#334155",
                                        background: idx === popularIdx ? "rgba(99,102,241,.04)" : "transparent",
                                    }}>
                                        {(!plan.limits?.maxStaff || plan.limits.maxStaff >= 99999)
                                            ? "Unlimited"
                                            : plan.limits.maxStaff}
                                    </td>
                                ))}
                            </tr>

                            {/* Storage row */}
                            <tr>
                                <td style={{
                                    padding: "14px 28px",
                                    borderBottom: "1px solid #F1F5F9",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "14px", color: "#334155", fontWeight: 500,
                                    textAlign: "left",
                                }}>
                                    Cloud Storage
                                </td>
                                {sorted.map((plan, idx) => (
                                    <td key={plan.id} style={{
                                        padding: "14px 16px",
                                        borderBottom: "1px solid #F1F5F9",
                                        borderRight: idx < N - 1 ? "1px solid #F8FAFC" : "none",
                                        textAlign: "center",
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: "14px", fontWeight: 700,
                                        color: idx === popularIdx ? "#4F46E5" : "#334155",
                                        background: idx === popularIdx ? "rgba(99,102,241,.04)" : "transparent",
                                    }}>
                                        {plan.limits?.maxStorageGB ?? 10} GB
                                    </td>
                                ))}
                            </tr>

                            {/* Support row */}
                            <tr>
                                <td style={{
                                    padding: "14px 28px",
                                    borderBottom: "1px solid #F1F5F9",
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: "14px", color: "#334155", fontWeight: 500,
                                    textAlign: "left",
                                }}>
                                    Support
                                </td>
                                {sorted.map((plan, idx) => (
                                    <td key={plan.id} style={{
                                        padding: "14px 16px",
                                        borderBottom: "1px solid #F1F5F9",
                                        borderRight: idx < N - 1 ? "1px solid #F8FAFC" : "none",
                                        textAlign: "center",
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: "13px", fontWeight: 500,
                                        color: idx === popularIdx ? "#4F46E5" : "#475569",
                                        background: idx === popularIdx ? "rgba(99,102,241,.04)" : "transparent",
                                    }}>
                                        {supportLabel(plan.supportLevel)}
                                    </td>
                                ))}
                            </tr>

                            {/* ── MODULE CATEGORY SECTIONS ─────────────────
                                IMPORTANT: use React.Fragment with key, not <>
                            ─────────────────────────────────────────────── */}
                            {modulesByCategory.map(group => (
                                <React.Fragment key={`group-${group.cat}`}>
                                    {/* Category header */}
                                    <tr>
                                        <td colSpan={N + 1} style={{
                                            padding: "8px 28px",
                                            background: "#F8FAFC",
                                            borderTop: "1px solid #E2E8F0",
                                            borderBottom: "1px solid #E2E8F0",
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: "10px", fontWeight: 700,
                                            letterSpacing: ".1em", textTransform: "uppercase",
                                            color: "#64748B",
                                        }}>
                                            {group.label}
                                        </td>
                                    </tr>

                                    {/* Module rows */}
                                    {group.modules.map(mod => (
                                        <tr key={mod.id}>
                                            <td style={{
                                                padding: "12px 28px",
                                                borderBottom: "1px solid #F1F5F9",
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: "13px", color: "#334155",
                                                fontWeight: 500, textAlign: "left",
                                                verticalAlign: "middle",
                                            }}>
                                                {mod.label}
                                            </td>
                                            {sorted.map((plan, idx) => {
                                                const included = Array.isArray(plan.includedModules)
                                                    && plan.includedModules.includes(mod.id);
                                                return (
                                                    <td key={plan.id} style={{
                                                        padding: "12px 16px",
                                                        borderBottom: "1px solid #F1F5F9",
                                                        borderRight: idx < N - 1 ? "1px solid #F8FAFC" : "none",
                                                        textAlign: "center",
                                                        verticalAlign: "middle",
                                                        background: idx === popularIdx
                                                            ? "rgba(99,102,241,.04)"
                                                            : "transparent",
                                                    }}>
                                                        {included ? <GreenCheck /> : <GreyCross />}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* ── BOTTOM CTA ROW ───────────────────────── */}
                            <tr style={{ borderTop: "2px solid #E2E8F0" }}>
                                <td style={{ padding: "20px 28px", background: "#FAFAFA" }} />
                                {sorted.map((plan, idx) => {
                                    const isPop = idx === popularIdx;
                                    return (
                                        <td key={plan.id} style={{
                                            padding: "20px 16px",
                                            textAlign: "center",
                                            background: isPop ? "rgba(99,102,241,.06)" : "#FAFAFA",
                                            borderRight: idx < N - 1 ? "1px solid #E2E8F0" : "none",
                                        }}>
                                            <a
                                                href={plan.price === 0 ? "/signup" : `/signup?plan=${plan.slug}`}
                                                style={{
                                                    display: "inline-block",
                                                    padding: "10px 26px",
                                                    borderRadius: "8px",
                                                    textDecoration: "none",
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: "13px", fontWeight: 700,
                                                    background: isPop ? "#4F46E5" : "#fff",
                                                    color: isPop ? "#fff" : "#334155",
                                                    border: isPop ? "none" : "1.5px solid #CBD5E1",
                                                    boxShadow: isPop ? "0 4px 14px rgba(79,70,229,.3)" : "none",
                                                }}
                                            >
                                                {plan.price === 0 ? "Start Free" : "Get Started"}
                                            </a>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
