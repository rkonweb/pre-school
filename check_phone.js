
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const phone = "9444777681";
    const cleanDigits = phone.replace(/\D/g, "");
    const searchFragment = cleanDigits.slice(-5);

    console.log("Searching for fragment:", searchFragment);

    const students = await prisma.student.findMany({
        where: {
            OR: [
                { parentMobile: { contains: searchFragment } },
                { emergencyContactPhone: { contains: searchFragment } }
            ]
        },
        select: { id: true, firstName: true, parentMobile: true, emergencyContactPhone: true }
    });

    console.log("Found Students:", students);

    const admissions = await prisma.admission.findMany({
        where: {
            OR: [
                { parentPhone: { contains: searchFragment } },
                { fatherPhone: { contains: searchFragment } },
                { motherPhone: { contains: searchFragment } }
            ]
        },
        select: { id: true, studentName: true, parentPhone: true, stage: true }
    });
    console.log("Found Admissions:", admissions);
}

check();
