import { PrismaClient } from '../src/generated/client_final/index.js';

const prisma = new PrismaClient();

async function createStaffWithSalary(schoolId: string, baseIndex: number, isTeacher: boolean) {
    const roleId = isTeacher ? 'role_teacher' : 'role_driver';
    const roleName = isTeacher ? 'TEACHER' : 'DRIVER';
    const prefix = isTeacher ? 'T' : 'D';
    
    // Add unique timestamp prefix to ensure uniqueness across multiple seed runs
    const timestamp = Date.now().toString().slice(-4);
    
    const email = `test.${prefix.toLowerCase()}${baseIndex}.${timestamp}@demo.com`;
    const firstName = `Test ${roleName}`;
    const lastName = `${baseIndex}`;
    const phone = `${isTeacher ? "98" : "97"}${timestamp}${baseIndex.toString().padStart(4, '0')}`;
    
    // Create user 
    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            mobile: phone,
            role: roleName,
            status: "ACTIVE",
            department: isTeacher ? "dept_academics" : "dept_transport",
            designation: isTeacher ? "Senior Teacher" : "Bus Driver",
            joiningDate: new Date(),
            schoolId,
        }
    });

    // We also need to add them to staffAccess, since they are teachers/drivers
    await prisma.staffAccess.create({
        data: {
            staffId: user.id,
            managerId: user.id // themselves just for basic setup
        }
    });

    // Create salary revision
    const basic = isTeacher ? 40000 : 20000;
    const hra = isTeacher ? 10000 : 5000;
    const allowance = isTeacher ? 5000 : 2000;
    const pf = isTeacher ? 2000 : 1000;
    const tax = isTeacher ? 1000 : 0;
    const gross = basic + hra + allowance + 1000; // adding joining bonus
    const net = gross - pf - tax;

    await prisma.salaryRevision.create({
        data: {
            userId: user.id,
            amount: gross,
            effectiveDate: new Date(),
            revisionDate: new Date(),
            type: "INITIAL",
            reason: "Initial Onboarding Package",
            currency: "INR",
            basic,
            hra,
            allowance,
            tax,
            pf,
            insurance: 0,
            netSalary: net,
            customAdditions: JSON.stringify([{ id: 'b1', label: 'Joining Bonus', amount: 1000 }]),
            customDeductions: JSON.stringify([])
        }
    });

    return user;
}

async function main() {
    try {
        console.log("Seeding test staff members...");
        // Assuming "school_bodhi" or similar exists, fetch the first active school
        const school = await prisma.school.findFirst();
        if (!school) {
            console.error("No school found in the database. Cannot seed staff.");
            return;
        }

        // Add 10 Teachers
        for (let i = 1; i <= 10; i++) {
            await createStaffWithSalary(school.id, i, true);
        }
        console.log("✅ 10 Teachers created with complete salary packages.");

        // Add 10 Drivers
        for (let i = 1; i <= 10; i++) {
            await createStaffWithSalary(school.id, i, false);
        }
        console.log("✅ 10 Drivers created with complete salary packages.");

    } catch (error) {
        console.error("Error seeding staff:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
