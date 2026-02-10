
// @ts-ignore
import { PrismaClient } from '../src/generated/training-client';

const trainingPrisma = new PrismaClient();

const DATA = [
    {
        title: "Pre-Joining Onboarding Pack",
        pages: [
            "Welcome kit (vision, values, culture, expectations)",
            "Appointment documentation, staff file & verification checklist",
            "Code of conduct, confidentiality & data privacy agreement",
            "Role clarity: class teacher vs assistant vs floater vs coordinator",
            "Induction timeline (Day 1 / Week 1 / Month 1 / Probation reviews)",
            "Mentor allocation & buddy system",
            "Tour checklist: campus, classrooms, storage, staff areas, exits"
        ]
    },
    {
        title: "Preschool Philosophy & Early Childhood Foundations",
        pages: [
            "Core principles of Early Childhood Education",
            "Play-based learning & why it works",
            "Whole-child development (social, emotional, cognitive, physical)",
            "Developmentally Appropriate Practice (DAP) fundamentals",
            "Child rights, dignity, and respectful care",
            "Understanding statutory/quality frameworks (as applicable: EYFS/NAEYC etc.)"
        ]
    },
    {
        title: "Child Development & Age-Wise Expectations",
        pages: [
            "Child development domains & how they connect",
            "Age bands: toddlers / playgroup / nursery / LKG / UKG (or equivalents)",
            "Typical developmental milestones vs individual variation",
            "School readiness & foundational skills",
            "Red flags & early concern indicators (observe, document, refer)",
            "Development support strategies inside classroom routines"
        ]
    },
    {
        title: "Child Psychology for Classroom Teachers",
        pages: [
            "How young children think, feel, and learn",
            "Behavior as communication (needs behind actions)",
            "Attachment & separation anxiety handling",
            "Emotional regulation: helping children calm & cope",
            "Motivation, encouragement, praise vs rewards",
            "Temperament types & individual differences",
            "Building confidence, autonomy, and resilience"
        ]
    },
    {
        title: "Safeguarding & Child Protection (Mandatory)",
        pages: [
            "Safeguarding culture: “everyone’s responsibility”",
            "Recognizing abuse/neglect indicators (physical, emotional, sexual, online)",
            "Reporting procedures, documentation, escalation chain (DSL/lead)",
            "Whistleblowing & professional boundaries",
            "Safer working practices (touch policy, toileting, changing, photography)",
            "Online safety & device/media rules",
            "Attendance/absence risks & follow-up procedures",
            "Preventing bullying, discrimination & harmful behavior",
            "Safeguarding induction checklist & sign-off"
        ]
    },
    {
        title: "Health, Safety, Hygiene & First Aid",
        pages: [
            "Health & safety orientation: hazards by zone (classroom/play area/toilets)",
            "Daily hygiene protocols (handwashing, cleaning schedules, nappy/toilet)",
            "Food safety basics (allergies, choking hazards, meal supervision)",
            "Medication policy & incident reporting",
            "First-aid awareness, emergency response, AED awareness (if available)",
            "Sick child policy & infection control",
            "Safe outdoor play supervision & ratios (as per policy)"
        ]
    },
    {
        title: "Classroom Setup & Learning Environment",
        pages: [
            "Classroom zones/learning corners & traffic flow",
            "Safe, inclusive classroom design (visual cues, calm corner, sensory needs)",
            "Material management: labeling, storage, rotation, sanitization",
            "Display standards (child work, learning focus walls, parent boards)",
            "Daily setup/close-down checklists"
        ]
    },
    {
        title: "Daily Routine Mastery",
        pages: [
            "Arrival & settling-in routines",
            "Circle time structure & engagement techniques",
            "Transitions (songs, cues, routines to reduce chaos)",
            "Snack/lunch routines & manners education",
            "Toilet routines & dignity-first support",
            "Rest/quiet time management",
            "Departure, handover to parents/authorized pickup"
        ]
    },
    {
        title: "Curriculum Delivery & Pedagogy",
        pages: [
            "Curriculum overview (year/month/week/day planning)",
            "Theme-based planning & integrated learning",
            "Play-based lesson delivery (teacher role: observe, scaffold, extend)",
            "Phonics readiness, pre-literacy & language enrichment",
            "Numeracy readiness & math through play",
            "Art, music, movement, story, dramatic play",
            "STEM exploration for early years (simple experiments, curiosity stations)",
            "Social-emotional learning (SEL) embedded into routines",
            "Differentiation for mixed-ability classrooms"
        ]
    },
    {
        title: "Classroom Management & Positive Guidance",
        pages: [
            "Setting expectations: rules as visuals + routines",
            "Positive discipline vs punishment",
            "Handling tantrums, hitting/biting, refusal, hyperactivity",
            "De-escalation steps & calm-down strategies",
            "Conflict resolution between children",
            "Behavior tracking (ABC model basics) & action plans",
            "Working with parents on behavior concerns"
        ]
    },
    {
        title: "Observation, Assessment & Documentation",
        pages: [
            "Why assessment is different in preschool",
            "Observation methods (anecdotal, checklist, photo evidence rules)",
            "Portfolios & learning stories",
            "Progress tracking cycles (baseline → review → support)",
            "Report writing: strengths-first, non-comparative language",
            "Confidential records & data protection practices"
        ]
    },
    {
        title: "Inclusion & Special Education Needs Basics",
        pages: [
            "Inclusive mindset & classroom adaptations",
            "Early indicators: speech delay, sensory needs, attention concerns",
            "Strategies: visual schedules, short instructions, sensory supports",
            "Working with shadow teachers/support staff (if applicable)",
            "Referral pathway & meeting etiquette",
            "Partnering with therapists/special educators"
        ]
    },
    {
        title: "Parent Communication & Relationship Building",
        pages: [
            "Parent partnership principles",
            "Daily communication (handover notes, diaries, apps—if used)",
            "Parent meetings: structure, language, sensitivity",
            "Handling complaints and difficult conversations professionally",
            "Confidentiality boundaries with parents",
            "Parent engagement ideas (home extension, events, volunteering norms)"
        ]
    },
    {
        title: "Key Person / Primary Caregiving Approach",
        pages: [
            "Purpose of key person approach and attachment-based care",
            "Responsibilities: bonding, observation, parent liaison",
            "Settling plans for new children",
            "Continuity of care during staff absence",
            "Documentation responsibilities of key person"
        ]
    },
    {
        title: "Professionalism, Ethics & Teacher Conduct",
        pages: [
            "Professional boundaries with children, parents, colleagues",
            "Ethical dilemmas and decision-making framework",
            "Communication etiquette & respectful language",
            "Dress code & workplace behavior standards",
            "Social media policy & media consent",
            "Confidentiality & information sharing protocols"
        ]
    },
    {
        title: "Internal Systems & Operational SOPs",
        pages: [
            "Attendance, registers, late pickups, custody notes",
            "Incident/accident reporting workflow",
            "Inventory requests, material tracking, classroom budgets (if any)",
            "Event execution SOP (celebrations, birthdays, annual day)",
            "Staff duty roster, breaks, supervision handovers",
            "Transport/bus duty basics (if applicable)"
        ]
    },
    {
        title: "Technology, Tools & Teaching Aids",
        pages: [
            "Approved tools (apps, projector, music system) & access rules",
            "Photo/video documentation: what’s allowed, what’s not",
            "Digital communication with parents (tone, timing, escalation)",
            "Data privacy basics in school operations"
        ]
    },
    {
        title: "Emergency Preparedness & Crisis Management",
        pages: [
            "Fire safety & evacuation procedures",
            "Lockdown/secure campus procedures (if applicable)",
            "Missing child protocol",
            "Medical emergency protocol",
            "Disaster management drills & roles",
            "Post-incident reporting and communication chain"
        ]
    },
    {
        title: "Teacher Performance, Coaching & Growth Path",
        pages: [
            "Classroom observation rubric (what “good” looks like)",
            "Feedback cycles (daily check-ins, weekly review, monthly appraisal)",
            "Training assignments & competency checklists",
            "Professional development plan (skills ladder)",
            "Reflective practice journal & improvement targets"
        ]
    },
    {
        title: "Teacher Wellbeing & Burnout Prevention",
        pages: [
            "Emotional resilience for early years teachers",
            "Stress management & time management",
            "Voice care, energy management, posture safety",
            "Seeking help: mentor, coordinator, counselor (if available)",
            "Building a supportive staff culture"
        ]
    }
];

async function main() {
    console.log('Seeding Teacher Training Data...');

    try {
        // 1. Find or Create "Teacher" Category
        let teacherCategory = await trainingPrisma.trainingCategory.findFirst({
            where: { name: { in: ['Teacher', 'TEACHER', 'teacher'] } }
        });

        if (!teacherCategory) {
            console.log('Creating Teacher Category...');
            teacherCategory = await trainingPrisma.trainingCategory.create({
                data: {
                    name: 'Teacher',
                    slug: 'teacher-' + Date.now()
                }
            });
        }

        console.log(`Using Category: ${teacherCategory.name} (${teacherCategory.id})`);

        // 2. Create the Main Module
        const moduleTitle = "Comprehensive Teacher Training";
        const moduleSlug = "teacher-training-comprehensive-" + Date.now();

        console.log(`Creating Module: ${moduleTitle}`);
        const trainingModule = await trainingPrisma.trainingModule.create({
            data: {
                title: moduleTitle,
                description: "A complete guide for preschool teachers covering philosophy, safety, pedagogy, and daily operations.",
                role: "TEACHER",
                categoryId: teacherCategory.id,
                slug: moduleSlug,
                isPublished: true,
                order: 1
            }
        });

        // 3. Create Topics and Pages
        let topicOrder = 1;
        for (const topicData of DATA) {
            console.log(`  Creating Topic ${topicOrder}: ${topicData.title}`);

            const topic = await trainingPrisma.trainingTopic.create({
                data: {
                    moduleId: trainingModule.id,
                    title: topicData.title,
                    order: topicOrder++
                }
            });

            let pageOrder = 1;
            for (const pageTitle of topicData.pages) {
                await trainingPrisma.trainingPage.create({
                    data: {
                        topicId: topic.id,
                        title: pageTitle,
                        content: `<h1>${pageTitle}</h1><p>Content to be added.</p>`,
                        order: pageOrder++,
                        isPublished: true
                    }
                });
            }
        }

        console.log('Seeding Complete! Created 1 Module, ' + DATA.length + ' Topics, and relevant Pages.');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await trainingPrisma.$disconnect();
    }
}

main();
