# Little Chanakyas ERP — Usability & Accessibility Test Report
**Date:** Saturday, 7 March 2026
**App:** Bodhi Board | Premium Preschool ERP
**URL:** http://localhost:3000/littlechanakyas
**Tester:** Claude (AI)
**Academic Year shown:** 2025-2026

---

## 1. Login & Authentication

| Check | Result |
|---|---|
| Page loads correctly | ✅ Pass |
| School branding displayed (logo, name, tagline) | ✅ Pass |
| "All systems live" status badge | ✅ Pass |
| Mobile number input validation (green tick on valid number) | ✅ Pass |
| "Send Verification Code" button activates only after valid number | ✅ Pass |
| OTP screen renders (6-box input, resend timer, back link) | ✅ Pass |
| Resend timer countdown (30s) works correctly | ✅ Pass |
| "Resend verification code" link appears after timer expires | ✅ Pass |
| Successful login shows confetti + "Welcome back!" animation | ✅ Pass |
| Redirect to dashboard after login | ✅ Pass |
| "Sign in with Passkey" option present | ✅ Pass |
| "Change mobile number" link on OTP screen | ✅ Pass |

> ⚠️ **Note:** OTP input boxes do not auto-advance correctly when typing rapidly — digits were entered one at a time with the cursor not moving to the next box at normal typing speed. This is a usability issue.

---

## 2. Dashboard

| Check | Result |
|---|---|
| Loads without errors | ✅ Pass |
| Greets user by role ("Good Afternoon, System Admin") | ✅ Pass |
| Today's date displayed correctly | ✅ Pass |
| KPI cards: Total Students (89), Attendance Today (0%), Revenue Today (INR 0), Staff Active (21) | ✅ Pass |
| Module efficiency circles (Academics 98%, Finance 44%, Transport 100%, Admissions 82%) | ✅ Pass |
| Enrollment Pulse chart visible | ✅ Pass |
| "Aura has detected 1 high-priority status shifts" AI alert | ✅ Pass |
| "3 Admissions Bottlenecks" alert badge | ✅ Pass |
| Daily Report & Customise buttons present | ✅ Pass |
| Finance efficiency flagged as "ATTENTION -0.5%" | ✅ Pass (working as expected) |
| Admissions flagged as "WARNING +5.2%, 3 Stale Inquiries" | ✅ Pass |

> ⚠️ **Mock Data:** Dashboard shows 0% attendance today and INR 0 revenue — consistent with a test environment with no real daily data entered.

---

## 3. Navigation Structure

All sidebar modules tested for load and basic functionality:

| Module | Sub-sections | Status |
|---|---|---|
| Dashboard | — | ✅ Loads |
| Students | All Students, Attendance, Progress Reports, Development, Health Records, Promote Students, ID Cards | ✅ Loads |
| Classes | Classes & Sections | ✅ Loads |
| Classroom | (expandable) | ✅ Present |
| Timetable | — | ✅ Present |
| Diary | — | ✅ Present |
| Homework | — | ✅ Present |
| Curriculum | — | ✅ Present |
| Human Resources | Staff directory | ✅ Loads |
| Admissions CRM | Application Pipeline, Leads, Lead List, Follow-ups, Inquiry Dashboard, School Tours, AI Dashboard, WhatsApp Automation, Template Library, Reports, Inquiry Settings, AI Configuration | ✅ Loads |
| Extracurricular | (expandable) | ✅ Present |
| Accounts | Financial Dashboard, Fee Management, Transactions, Vendors & Payees, Bulk Fee Actions, Purchase Orders, Quotations, AI Insights, Account Settings | ✅ Loads |
| Communication | Communication Center, Chat History, Circulars & Notices, Events & Calendar, PTM Scheduler, Emergency Alerts | ✅ Loads |
| Transport | Transport Dashboard, Routes, Student List, Fleet–Vehicles, Fleet–Drivers, Fleet–Assignments, GPS Tracking, Applications, Transport Fees | ✅ Loads |
| Library | (expandable) | ✅ Present |
| Canteen | (expandable) | ✅ Present |
| Hostel Management | (expandable) | ✅ Present |
| School Store | (expandable) | ✅ Present |
| Training Center | — | ✅ Present |
| Documents | — | ✅ Present |
| Marketing Tools | — | ✅ Present |
| Parent Requests | — | ✅ Present |
| User Logs | — | ✅ Present |
| Settings | (expandable) | ✅ Present |

> ⚠️ **Navigation Bug:** The Transport Dashboard sidebar link did not respond to a regular click in some instances — required a fallback interaction method. This may be a z-index/overlay issue with nested sidebar items.

---

## 4. Mock / Test Data Found 🔴

The following test/placeholder data was found throughout the app and should be removed before going live:

### HR — Staff Management
| Name | Email | Issue |
|---|---|---|
| Test DRIVER 1 | test.d1.3723@demo.com | Fake test entry |
| Test DRIVER 2 | test.d2.4094@demo.com | Fake test entry |
| Test DRIVER 3 | test.d3.4244@demo.com | Fake test entry |
| Test DRIVER 10 | test.d10.5141@demo.com | Fake test entry |
| Admin User | N/A (no email set) | Missing email |

> ⚠️ All driver test entries use `@demo.com` domain and sequential naming. These must be replaced with real staff records.

### Admissions CRM — AI Dashboard
| Name | Child | Issue |
|---|---|---|
| Auto Test Parent | AutoTest Child | Clearly automated test entry |
| Test Parent | Test Student (phone: 1772266941553) | Test entry; also **invalid phone number** (13 digits — Indian numbers are 10 digits) |
| Parent Test | — | Test entry |

### Students Directory
- "Student2" and "Student3" appear as student names — likely seed/test data

### Academic Year Mismatch
- App header (top bar) shows **2025-2026**
- Admissions Overview page shows **ACADEMIC YEAR 2026-27**
- These must be aligned to avoid confusion

---

## 5. Module-Specific Findings

### Students (89 enrolled)
- ✅ Search, filter by status/class/gender, column customisation all present
- ✅ Edit and delete actions per student
- ✅ "Active Students" and "Alumni" tabs work
- ⚠️ 0% attendance today — no attendance recorded for the day (expected in test env)

### Classes (18 total)
- ✅ Classes listed with Grade 1-A through UKG sections
- ⚠️ 0 teachers assigned to any class — all show "Not Assigned"
- ⚠️ Capacity shows "N/A" for all classes

### Admissions CRM
- ✅ AI Command Center is functional and shows live/online status
- ✅ AI Forecast predicts "8 Admissions this week (High Confidence)"
- ⚠️ 0% Enrollment Rate — no conversions yet
- ⚠️ WhatsApp Automation and Template Library present but not tested for actual send functionality

### Human Resources
- ✅ Staff directory loads with filters (Designation, Department, Emp. Type, Status)
- ⚠️ All test driver entries have no designation set ("-")
- ⚠️ Admin User has no email and no designation

### Financial Dashboard
- ✅ Charts render correctly (Revenue vs Expenses, Top Expenses by Category)
- ⚠️ Total Income: ₹17,500 | Total Expenses: ₹1,000 | Net Balance: ₹16,500 — very low values typical of a test environment
- ⚠️ Finance efficiency on main dashboard is at 44% with "Outstanding dues" warning

### Communication Centre
- ✅ Blast Tool, Broadcasts, Moderation, Automations, Chat History tabs present
- ✅ System Readiness: Gateway Status **ACTIVE**, Latency ~42ms
- ✅ Recent Activity log visible

### Transport Dashboard
- ✅ "Logistics Command Center" loads with fleet telemetry
- ✅ 1/1 active asset, 100% revenue realised vs target
- ✅ AI Risk Analysis: LOW THREAT
- ⚠️ GPS map shows **"For development purposes only"** watermarks — Google Maps API key is not configured
- ⚠️ "Pilot Absence: 9 PLT" — 9 drivers absent (may be test data)
- 🔴 **Console Warning:** `Google Maps JavaScript API: NoApiKeys` — a valid API key must be provided before production deployment

---

## 6. Accessibility Audit

Tests run via automated DOM inspection across multiple pages.

### Passed ✅
| Check | Result |
|---|---|
| `<main>` landmark present | ✅ |
| `<nav>` landmark present | ✅ |
| `<header>` landmark present | ✅ |
| All form inputs have labels or placeholders | ✅ |
| No empty anchor links | ✅ |
| No `div[role="button"]` misuse | ✅ |
| 73 focusable elements (good interactivity coverage) | ✅ |

### Issues Found ⚠️

| Severity | Issue | Detail |
|---|---|---|
| 🔴 High | **No skip navigation link** | There is no "Skip to main content" link. Keyboard-only users must tab through the entire sidebar (20+ items) on every page to reach main content. |
| 🔴 High | **Missing `<h1>` on multiple pages** | Transport Dashboard has no `<h1>` — heading hierarchy starts at `<h3>`. Screen readers rely on `<h1>` to identify the page topic. |
| 🟡 Medium | **11 SVG images without `alt` attributes** | SVG images embedded as `<img>` elements have empty or missing `alt` text. These should have descriptive alt text or `alt=""` if purely decorative. |
| 🟡 Medium | **2 unlabelled buttons** | Two `<button>` elements have no visible text, no `aria-label`, and no `title`. Screen reader users cannot determine their purpose. |
| 🟡 Medium | **OTP input auto-advance failure** | The 6-digit OTP input boxes do not reliably auto-advance on keystroke — users may not notice they are still on box 1. Especially problematic for users with motor difficulties. |
| 🟡 Medium | **No `<h1>` on login page** | Login page uses styled text for the heading but not a semantic `<h1>` element. |
| 🟢 Low | **Colour contrast (visual)** | The light pink (#FFF0F3) background with pink primary (#E91E8C) buttons and red accents appears visually clear, but formal WCAG 2.1 AA contrast ratio measurement is recommended for all text/background combinations — especially the muted grey label text. |
| 🟢 Low | **No `lang` attribute verified** | Ensure `<html lang="en">` (or appropriate locale) is set for screen reader pronunciation. |

---

## 7. Console Errors & Warnings

| Type | Message | Impact |
|---|---|---|
| 🔴 WARNING | `Google Maps JavaScript API: NoApiKeys` | GPS/Transport map renders with "For development purposes only" watermarks. Map functionality is degraded. Must add a valid API key before production. |

No JavaScript errors were detected across tested pages — the app is stable.

---

## 8. Summary & Recommendations

### Critical (fix before go-live)
1. **Add Google Maps API key** — Transport GPS map is currently watermarked and restricted
2. **Remove all test/mock data** — HR drivers, test parents/students, demo emails
3. **Assign teachers to classes** — All 18 classes currently show "Not Assigned"
4. **Fix academic year mismatch** — App header says 2025-26, Admissions says 2026-27
5. **Add `<h1>` headings** to all pages for screen reader and SEO correctness

### High Priority
6. **Add a "Skip to main content" link** for keyboard/screen reader accessibility
7. **Add `aria-label`** to the 2 unlabelled icon buttons
8. **Add `alt` text** to the 11 SVG `<img>` elements
9. **Fix OTP auto-advance** — ensure each box passes focus to the next on input
10. **Set Admin User email** in HR — currently shows "N/A"

### Medium Priority
11. **Set class capacities** — all show "N/A"
12. **Review Finance module** — 44% efficiency with outstanding dues needs attention
13. **Validate phone numbers** — test entry shows 13-digit number (should be 10 digits for India)

### Low Priority / Polish
14. Verify WCAG 2.1 AA colour contrast ratios formally (especially grey label text)
15. Confirm `<html lang>` attribute is correctly set
16. Consider adding keyboard shortcut hints for power users navigating a large sidebar

---

*Report generated by automated browser testing on localhost. Tested as Admin (System Admin role).*
