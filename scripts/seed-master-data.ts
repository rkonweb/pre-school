
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedMasterData() {
    console.log("--- SEEDING MASTER DATA ---");

    // 1. Grades
    const grades = [
        "Playgroup", "Nursery", "LKG", "UKG",
        "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"
    ];

    console.log("Seeding Grades...");
    for (const g of grades) {
        const existing = await prisma.masterData.findFirst({
            where: { type: "GRADE", name: g }
        });
        if (!existing) {
            await prisma.masterData.create({
                data: { type: "GRADE", name: g }
            });
            console.log(`Created Grade: ${g}`);
        }
    }

    // 2. Sections (Linked to all Grades)
    console.log("Seeding Sections (A, B, C) for all Grades...");
    const sections = ["A", "B", "C"];
    const allGrades = await prisma.masterData.findMany({ where: { type: "GRADE" } });

    for (const grade of allGrades) {
        for (const s of sections) {
            const existing = await prisma.masterData.findFirst({
                where: { type: "SECTION", name: s, parentId: grade.id }
            });
            if (!existing) {
                await prisma.masterData.create({
                    data: { type: "SECTION", name: s, parentId: grade.id }
                });
            }
        }
    }

    // 3. Designations
    const designations = ["Principal", "Vice Principal", "Teacher", "Teaching Assistant", "Admin Officer", "Accountant", "Driver", "Security Guard"];
    console.log("Seeding Designations...");
    for (const d of designations) {
        const existing = await prisma.masterData.findFirst({
            where: { type: "DESIGNATION", name: d }
        });
        if (!existing) {
            await prisma.masterData.create({ data: { type: "DESIGNATION", name: d } });
        }
    }

    // 4. Departments
    const departments = ["Administration", "Academics", "Sports", "Transport", "Finance", "Maintenance"];
    console.log("Seeding Departments...");
    for (const d of departments) {
        const existing = await prisma.masterData.findFirst({
            where: { type: "DEPARTMENT", name: d }
        });
        if (!existing) {
            await prisma.masterData.create({ data: { type: "DEPARTMENT", name: d } });
        }
    }

    // 5. Employment Types
    const empTypes = ["Full Time", "Part Time", "Contractual", "Internship"];
    console.log("Seeding Employment Types...");
    for (const e of empTypes) {
        const existing = await prisma.masterData.findFirst({
            where: { type: "EMPLOYMENT_TYPE", name: e }
        });
        if (!existing) {
            await prisma.masterData.create({ data: { type: "EMPLOYMENT_TYPE", name: e } });
        }
    }

    // 6. Blood Groups
    const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    console.log("Seeding Blood Groups...");
    for (const b of bloodGroups) {
        const existing = await prisma.masterData.findFirst({
            where: { type: "BLOOD_GROUP", name: b }
        });
        if (!existing) {
            await prisma.masterData.create({ data: { type: "BLOOD_GROUP", name: b } });
        }
    }

    // 7. Subjects
    const subjects = ["Mathematics", "English", "Science", "Environmental Studies", "Hindi", "Arts", "Music", "Physical Education"];
    console.log("Seeding Subjects...");
    for (const s of subjects) {
        const existing = await prisma.masterData.findFirst({
            where: { type: "SUBJECT", name: s }
        });
        if (!existing) {
            await prisma.masterData.create({ data: { type: "SUBJECT", name: s } });
        }
    }

    console.log("--- MASTER DATA SEEDING COMPLETE ---");
}

seedMasterData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
