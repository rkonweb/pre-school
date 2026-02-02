
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    // 1. Add missing Designations
    const designations = [
        { code: 'LPT', name: 'Lead Preschool Teacher' },
        { code: 'CC', name: 'Curriculum Coordinator' },
        { code: 'PEC', name: 'Physical Education Coach' },
        { code: 'CAS', name: 'Creative Arts Specialist' },
        { code: 'MMI', name: 'Music & Movement Instructor' },
        { code: 'LLS', name: 'Literacy & Language Specialist' },
        { code: 'LSS', name: 'Learning Support specialist' },
        { code: 'OM', name: 'Operations Manager' },
        { code: 'FNL', name: 'Facility & Nutrition Lead' }
    ];

    for (const d of designations) {
        const existing = await prisma.masterData.findFirst({
            where: { type: 'DESIGNATION', name: d.name }
        });
        if (!existing) {
            await prisma.masterData.create({
                data: { ...d, type: 'DESIGNATION' }
            });
        } else {
            await prisma.masterData.update({
                where: { id: existing.id },
                data: { code: d.code }
            });
        }
    }

    // 2. Add missing Departments
    const departments = [
        { code: 'PREK', name: 'Pre-K Academics' },
        { code: 'SPORTS', name: 'Sports & Wellness' },
        { code: 'ARTS', name: 'Creative Arts' },
        { code: 'PERF', name: 'Performing Arts' },
        { code: 'STUDENT', name: 'Student Services' },
        { code: 'OPS', name: 'Operations' }
    ];

    for (const d of departments) {
        const existing = await prisma.masterData.findFirst({
            where: { type: 'DEPARTMENT', name: d.name }
        });
        if (!existing) {
            await prisma.masterData.create({
                data: { ...d, type: 'DEPARTMENT' }
            });
        } else {
            await prisma.masterData.update({
                where: { id: existing.id },
                data: { code: d.code }
            });
        }
    }

    console.log("Master Data updated successfully to match staff assignments.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
