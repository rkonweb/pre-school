-- Figma Home Page CMS Data Seeding Script
-- Run this with: npx prisma db execute --file scripts/seed-homepage.sql --schema prisma/schema.prisma

-- Clear existing homepage content
DELETE FROM HomepageContent;

-- 1. Hero Section
INSERT INTO HomepageContent (id, sectionKey, title, subtitle, content, isEnabled, sortOrder, createdAt, updatedAt)
VALUES (
    'hero-section-001',
    'hero',
    'Hero Section',
    'Main headline and CTA',
    '{"badge":"Trusted by Educators. Built by School Founders.","headline":"The Operating System for Modern Schools","subheadline":"Bodhi Board is a complete education platform that combines ERP, curriculum, staff training, marketing, and parent communication — so schools don''t just run, they grow.","primaryCTA":{"text":"Start Free 30-Day Trial","link":"/signup"},"secondaryCTA":{"text":"Watch Product Demo","link":"#"},"stats":[{"value":"500+","label":"Schools"},{"value":"12,000+","label":"Students"},{"value":"850+","label":"Teachers"},{"value":"15+","label":"Countries"}]}',
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 2. Comparison Section
INSERT INTO HomepageContent (id, sectionKey, title, subtitle, content, isEnabled, sortOrder, createdAt, updatedAt)
VALUES (
    'comparison-section-001',
    'comparison',
    'Problem/Solution Comparison',
    'Transformation stories',
    '{"badge":"The Transformation","headline":"Stop Struggling. <span class=''bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent''>Start Growing.</span>","subheadline":"See how every challenge transforms into an opportunity","transformations":[{"problem":{"title":"Admissions scattered across calls, WhatsApp, and paper","icon":"Phone","stat":"40%","statLabel":"Lost Leads"},"solution":{"title":"Smart lead management with automated follow-ups","icon":"Target","stat":"2x","statLabel":"Conversion"}},{"problem":{"title":"Manual follow-ups eating staff hours every day","icon":"Clock","stat":"15hr","statLabel":"Wasted Weekly"},"solution":{"title":"AI-powered automation handles repetitive tasks","icon":"Zap","stat":"95%","statLabel":"Time Saved"}},{"problem":{"title":"Untrained staff creating inconsistent experiences","icon":"Users","stat":"60%","statLabel":"Quality Issues"},"solution":{"title":"Built-in training with performance tracking","icon":"GraduationCap","stat":"4.8★","statLabel":"Parent Rating"}},{"problem":{"title":"Curriculum chaos with scattered documents","icon":"BookOpen","stat":"3hr","statLabel":"Daily Search"},"solution":{"title":"Ready-to-use curriculum with lesson plans","icon":"Book","stat":"1 week","statLabel":"To Launch"}},{"problem":{"title":"Parents calling constantly for updates","icon":"MessageSquare","stat":"50+","statLabel":"Daily Calls"},"solution":{"title":"Real-time updates keep parents informed","icon":"User","stat":"90%","statLabel":"Fewer Calls"}},{"problem":{"title":"Multiple tools that don''t talk to each other","icon":"Wrench","stat":"5+","statLabel":"Separate Apps"},"solution":{"title":"One unified platform for everything","icon":"PieChart","stat":"100%","statLabel":"Connected"}}]}',
    1,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Note: This SQL approach has limitations with complex JSON. 
-- It's better to stop the dev server and run: node scripts/seed-homepage.js
