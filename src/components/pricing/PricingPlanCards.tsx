import React from "react";
import { getSubscriptionPlansAction } from "@/app/actions/subscription-actions";
import { ALL_MODULES } from "@/config/modules";
import type { SubscriptionPlan } from "@/types/subscription";

// ─── Selling highlights per module id ─────────────────────────────────────────
const MODULE_SELL: Record<string, string> = {
    dashboard:       "Real-time school KPIs at a glance",
    students:        "Student profiles, enrollment & records",
    staff:           "Staff directory & role management",
    hr:              "HR, recruitment & payroll workflows",
    roles:           "Granular access control & permissions",
    settings:        "Complete school configuration",
    academics:       "Timetable, exams & scheduling",
    curriculum:      "Curriculum planning & lesson maps",
    classroom:       "Classroom logs & daily activities",
    homework:        "Assignments, submissions & grading",
    diary:           "Digital student diary & updates",
    ptm:             "Parent-Teacher Meeting scheduler",
    extracurricular: "Clubs, sports & activities tracker",
    events:          "School events & calendar",
    calendar:        "Academic calendar & holiday planner",
    admissions:      "Admissions CRM — inquiry to enrollment",
    attendance:      "One-tap attendance for staff & students",
    billing:         "Automated fee collection & invoices",
    accounts:        "Ledgers, expenses & finance reports",
    payroll:         "Payroll processing & payslips",
    inventory:       "Assets, books & resource tracking",
    store:           "School store & merchandise management",
    transport:       "Bus routes, driver app & GPS tracking",
    library:         "Book catalog & student circulation",
    training:        "Staff training & professional development",
    documents:       "Certificates, files & document vault",
    ai_features:     "AI-powered insights & smart automation",
    reports:         "Advanced analytics & custom reports",
    health:          "Student health records & monitoring",
    "parent-requests": "Parent request & support ticketing",
    canteen:         "Canteen POS, menu & meal subscriptions",
    hostel:          "Hostel rooms, billing & management",
    communication:   "WhatsApp, SMS & in-app messaging",
    marketing:       "Lead generation & WhatsApp campaigns",
};

// Per-tier selling pitch highlights (shown even for unknown tiers)
const TIER_PITCH: Record<string, { tagline: string; note: string; highlights: string[] }> = {
    free: {
        tagline: "Get started at no cost",
        note: "Perfect for small preschools just getting digital",
        highlights: [
            "Up to 25 students & 5 staff",
            "Core attendance & daily diary",
            "Parent app access",
            "Basic student records",
        ],
    },
    basic: {
        tagline: "Everything a growing school needs",
        note: "Most schools start seeing ROI within 2 weeks",
        highlights: [
            "Admissions CRM with lead pipeline",
            "Automated fee collection & reminders",
            "Parent communication & digital diary",
            "Attendance + curriculum planning",
        ],
    },
    premium: {
        tagline: "The complete school operating system",
        note: "Automate everything. Impress every parent.",
        highlights: [
            "Everything in Starter, plus:",
            "AI admissions dashboard & lead scoring",
            "WhatsApp campaigns & growth tools",
            "Transport & driver app with GPS",
            "Advanced analytics & custom reports",
        ],
    },
    enterprise: {
        tagline: "Built for chains, franchises & large institutions",
        note: "Central control across all branches",
        highlights: [
            "Everything in Growth, plus:",
            "Multi-branch management dashboard",
            "Central curriculum control",
            "Franchise-ready SOPs & playbooks",
            "Dedicated success manager + SLA",
        ],
    },
};

function formatPrice(plan: SubscriptionPlan): string {
    if (plan.price === 0) return "Free";
    return `₹${plan.price.toLocaleString("en-IN")}`;
}

function CheckIcon({ dark }: { dark?: boolean }) {
    const color = dark ? "rgba(255,255,255,0.85)" : "#6366F1";
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color}
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function PlanCard({ plan, isPop, isLast }: { plan: SubscriptionPlan; isPop: boolean; isLast: boolean }) {
    const tier = (plan.tier ?? "basic") as string;
    const pitch = TIER_PITCH[tier] ?? TIER_PITCH.basic;
    const isCustom = plan.price === 0 && (tier === "enterprise" || (plan.limits?.maxStudents ?? 0) >= 99999);
    const isFree = plan.price === 0 && !isCustom;
    const isEnterprise = tier === "enterprise" || isCustom;

    // Build selling feature list from included modules
    const includedModules = Array.isArray(plan.includedModules) ? plan.includedModules : [];
    const moduleLabels = ALL_MODULES
        .filter(m => includedModules.includes(m.id))
        .map(m => ({ id: m.id, label: MODULE_SELL[m.id] ?? m.label }));

    // For enterprise / custom pricing plans: show pitch highlights instead of modules
    const featureList = isEnterprise
        ? pitch.highlights
        : moduleLabels.length > 0
            ? moduleLabels.map(m => m.label)
            : pitch.highlights;

    const ctaHref = isEnterprise
        ? `/contact?plan=${plan.slug}`
        : plan.price === 0
            ? "/signup"
            : `/signup?plan=${plan.slug}`;

    const ctaLabel = isEnterprise ? "Talk to our team" : "Start free trial →";
    const ctaNote = isEnterprise ? "Responds within 4 hours" : "30-day free trial · No credit card";

    // Styles
    const cardBg = isPop ? "linear-gradient(160deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%)" : "#ffffff";
    const textMain = isPop ? "#ffffff" : "#0F172A";
    const textSub = isPop ? "rgba(255,255,255,0.65)" : "#64748B";
    const dividerColor = isPop ? "rgba(255,255,255,0.12)" : "#F1F5F9";
    const checkBg = isPop ? "rgba(255,255,255,0.12)" : "rgba(99,102,241,0.08)";
    const priceColor = isPop ? "#ffffff" : "#0F172A";
    const ctaBg = isPop ? "#ffffff" : "#4F46E5";
    const ctaColor = isPop ? "#4F46E5" : "#ffffff";

    const maxStu = plan.limits?.maxStudents;
    const maxStaff = plan.limits?.maxStaff;
    const limitLabel = isEnterprise
        ? "Unlimited students · All branches"
        : maxStu && maxStu < 99999
            ? `Up to ${maxStu.toLocaleString("en-IN")} students`
            : "Unlimited students";

    return (
        <div style={{
            position: "relative",
            background: cardBg,
            borderRadius: "20px",
            padding: "32px 28px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            boxShadow: isPop
                ? "0 24px 80px rgba(79,70,229,0.35), 0 4px 24px rgba(0,0,0,0.2)"
                : "0 2px 16px rgba(15,23,42,0.07), 0 0 0 1px rgba(15,23,42,0.06)",
            transform: isPop ? "scale(1.04)" : "scale(1)",
            zIndex: isPop ? 2 : 1,
            border: isPop ? "none" : "1px solid #E8ECF4",
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Popular badge */}
            {isPop && (
                <div style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #818CF8, #6366F1)",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    padding: "5px 16px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Most Popular
                </div>
            )}

            {/* Plan name */}
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "22px", fontWeight: 800, color: textMain, marginBottom: "6px" }}>
                {plan.name}
            </div>

            {/* Tagline */}
            <div style={{ fontSize: "13px", color: textSub, lineHeight: 1.55, marginBottom: "20px", minHeight: "38px" }}>
                {pitch.tagline}
            </div>

            {/* Price block */}
            {isEnterprise ? (
                <div style={{ marginBottom: "6px" }}>
                    <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "36px",
                        fontWeight: 800,
                        color: priceColor,
                        letterSpacing: "-1px",
                    }}>Custom</span>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", fontWeight: 700, color: textSub, paddingBottom: "6px" }}>₹</span>
                    <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "42px",
                        fontWeight: 900,
                        color: priceColor,
                        letterSpacing: "-2px",
                        lineHeight: 1,
                    }}>
                        {isFree ? "0" : plan.price.toLocaleString("en-IN")}
                    </span>
                    {!isFree && (
                        <span style={{ fontSize: "13px", color: textSub, paddingBottom: "8px", marginLeft: "2px" }}>/ month</span>
                    )}
                </div>
            )}

            {/* Limit caption */}
            <div style={{ fontSize: "12px", color: isPop ? "rgba(165,180,252,0.9)" : "#94A3B8", marginBottom: "20px" }}>
                {limitLabel}
                {maxStaff && maxStaff < 99999 ? ` · ${maxStaff} staff` : ""}
            </div>

            {/* CTA Button */}
            <a
                href={ctaHref}
                style={{
                    display: "block",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    textAlign: "center",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    background: ctaBg,
                    color: ctaColor,
                    marginBottom: "8px",
                    boxShadow: isPop ? "none" : "0 2px 8px rgba(99,102,241,0.25)",
                    transition: "opacity 0.15s",
                }}
            >
                <span style={{ all: "initial" as const, fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, color: ctaColor }}>
                    {ctaLabel}
                </span>
            </a>

            {/* CTA note */}
            <div style={{ textAlign: "center", fontSize: "11px", color: textSub, marginBottom: "20px" }}>
                {ctaNote}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: dividerColor, marginBottom: "20px" }} />

            {/* Note */}
            <div style={{ fontSize: "11px", color: textSub, marginBottom: "14px", fontStyle: "italic" }}>
                {pitch.note}
            </div>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {featureList.map((feat, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{
                            width: "18px", height: "18px", borderRadius: "50%",
                            background: checkBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginTop: "1px",
                        }}>
                            <CheckIcon dark={isPop} />
                        </div>
                        <div style={{
                            fontSize: "13px",
                            color: isPop ? "rgba(255,255,255,0.85)" : "#334155",
                            lineHeight: 1.4,
                            fontWeight: i === 0 && isEnterprise ? 600 : 400,
                        }}>
                            {feat}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export async function PricingPlanCards() {
    const plans = await getSubscriptionPlansAction();
    const sorted = [...plans].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    if (sorted.length === 0) return null;

    const popularIdx = (() => {
        const pi = sorted.findIndex(p => p.isPopular);
        return pi >= 0 ? pi : Math.min(1, sorted.length - 1);
    })();

    return (
        <section style={{ padding: "20px 0 80px", background: "#F8FAFF", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${sorted.length}, 1fr)`,
                    gap: "20px",
                    alignItems: "start",
                    paddingTop: "20px",
                }}>
                    {sorted.map((plan, idx) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            isPop={idx === popularIdx}
                            isLast={idx === sorted.length - 1}
                        />
                    ))}
                </div>

                {/* Trust row */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "32px",
                    marginTop: "44px",
                    flexWrap: "wrap",
                }}>
                    {[
                        { icon: "🔒", text: "SOC 2 compliant infrastructure" },
                        { icon: "📄", text: "GST invoices automatically issued" },
                        { icon: "🔄", text: "Switch or cancel anytime" },
                        { icon: "🤝", text: "Onboarding support on every plan" },
                        { icon: "⚡", text: "Live within 24 hours" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            fontSize: "12px",
                            color: "#64748B",
                            fontWeight: 500,
                        }}>
                            <span style={{ fontSize: "14px" }}>{item.icon}</span>
                            {item.text}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
