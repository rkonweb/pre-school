# Preschool SaaS ERP - Implementation Plan

## 1. Project Initialization
- [x] Initialize Next.js project with TypeScript & Tailwind CSS
- [ ] Clean up default boilerplate
- [ ] Set up project structure (route groups)

## 2. Design System & UI
- [x] Configure fonts (Outfit/Inter)
- [x] Define color palette (Preschool friendly: Soft pastels + Vibrant accents)
- [x] Create core UI components (Sidebar, Header, Layout)
- [x] Implement responsive layout (Sidebar, Header)

## 3. Core Features (Multi-tenant)
- [x] Authentication (Login/Register UI)
- [ ] Tenant onboarding (School registration)
- [x] Dashboard (Overview of enrollment, staff, finances)
- [x] Attendance Tracking

## 4. Modules
- **Admissions**: [Done] Inquiry Pipeline, Applicant tracking, Public-facing Enrollment Form.
- **Student Management**: [Done] Profiles (Table & Detail Views), Add Student Form (SlideOver), attendance, health records.
- **Staff Management**: [Done] Staff Directory (Card UI Done), Add Staff Form (Onboarding UI Done), roles, permissions, payroll.
- **Billing**: [Done] Invoicing, Student Ledger, Pro-rata calculations, Parent Payments, Bulk Generation.
- **Communication**: [Done] Messaging Center, Parent-School Chats, School-wide Broadcasts (Announcements).
- **Classroom**: [Done] Daily Log Board, Schedule, Alerts, Lesson Plans.
- **Inventory**: [Done] Stock tracking, Supply Requests, Unit management.
- **Parent Portal**: [Done] Mobile App Shell, Home Dashboard, Payments, Messaging, Profile.
- **Curriculum & Worksheets**: [Done] High-security PDF printing (Clean Print Mode), PrintScreen protection, Secure Viewer.
- **Lesson Architect**: [Done] Master Blueprints, Logistics, Teaching Flow, Outcomes, Observation Points.
- **Teacher Daily Guide**: [Done] Mobile-first guide, Teaching Mode cards, Material Checklist, Observational "Tick" System.
- **Super Admin Console**: [Done] Dedicated Login, Dark Mode Command Center, Global Metrics, Multi-tenant Management, System Config UI.

## 5. Technical Stack (Proposed)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **State**: React Context / Zustand
- **Database**: TBD (PostgreSQL via Supabase/Neon recommended)
- **Auth**: TBD (Clerk/Auth.js)

## Next Steps
1. Backend Integration (Connect UI to actual Database).
2. Authentication & Multi-tenancy (Clerk/Supabase Auth).
3. Student Onboarding & Documents (File Uploads).
4. Reporting & Analytics Dashboard.
