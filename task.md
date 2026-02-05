# Task Checklist - Marketing Frontend Redesign

- [x] **Design System & Global Layout**
    - [x] Update `globals.css` with new color variables (Dark/Modern theme).
    - [x] Create `LayoutWrapper` or update `layout.tsx` for sticky glassmorphic navbar.
    - [x] Redesign `components/Navbar` and `components/Footer`. (Need to check if they exist or create them).

- [x] **Homepage Redesign (`/`)**
    - [x] **Hero Section**: New gradient/3D aesthetic, clear CTA.
    - [x] **Social Proof**: "Trusted by" section.
    - [x] **Features Grid**: Modern cards with hover effects.
    - [x] **Testimonials**: Carousel or grid.
    - [x] **CTA Section**: Final push.

- [x] **Features Page (`/features`)**
    - [x] **Hero**: Distinct from Homepage.
    - [x] **Detail Sections**: Deep dive into modules (Admissions, Academics, etc.).
    - [x] **Interactive Elements**: Tabs or scroll-triggered animations.

- [x] **Pricing Page (`/pricing`)**
    - [x] **Plan Cards**: Clean, comparing Free/Pro/Enterprise.
    - [x] **Comparison Table**: Comprehensive feature list.
    - [x] **FAQ Section**: Accordion style.

- [x] **About / Pages (`/about`, etc.)**
    - [x] Standardize layout for text-heavy pages.
    - [x] **Mission/Values**: Visual representation.

- [x] **Careers Page (`/careers`)**
    - [x] **Hero**: "Join us" vibe.
    - [x] **Culture**: Visual grid.
    - [x] **Job List**: Clean list with filters.
    - [x] **Detail Page**: Ensure it inherits new theme.
    - [x] **Enhancements**: Add Perks, Values, Testimonials sections.
    - [x] **Admin CMS**: UI for managing Job Postings (`/admin/cms/careers`).

- [x] **Blog Page (`/blog`)**
    - [x] **Grid Layout**: Magazine style for posts.
    - [x] **Post View**: Clean typography.

- [x] **Contact Page (`/contact`)**
    - [x] **Layout**: Split screen (Info + Form).
    - [x] **Form Styling**: Floating labels or clean inputs.

- [x] **CMS Integration Checks**
    - [x] Ensure all new designs still pull data from `cms-actions.ts`.

- [x] **SEO Implementation**
    - [x] CMS: Add "SEO Meta Tags" to Homepage, Features, Pricing, Contact.
    - [x] Public: Refactor all pages to Server Components with `generateMetadata`.
