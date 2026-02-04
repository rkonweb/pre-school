const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ensureGeneralJob() {
    console.log('🔍 Checking for General Application job...');

    let job = await prisma.jobPosting.findFirst({
        where: { title: 'General Application' }
    });

    if (!job) {
        job = await prisma.jobPosting.create({
            data: {
                title: 'General Application',
                department: 'Talent Network',
                location: 'Remote / Global',
                type: 'Future Opportunities',
                description: "Don't see a role that fits? We're always looking for exceptional talent.\n\nTell us about yourself, what you're passionate about, and how you think you can contribute to our mission. We'll keep your details on file and reach out when a suitable position opens up.",
                requirements: "- Passion for education\n- Growth mindset\n- Collaborative spirit",
                isOpen: true
            }
        });
        console.log('✅ Created "General Application" job.');
    } else {
        console.log('ℹ️ "General Application" job found.');
    }
}

ensureGeneralJob()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
