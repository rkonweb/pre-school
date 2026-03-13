import { prisma } from "./src/lib/prisma";

async function main() {
    const students = await prisma.student.findMany({ include: { school: true } });
    if (students.length === 0) {
        console.log("No students found to seed fees for.");
        return;
    }

    // Seed fees for ALL students for robust testing
    for (const student of students) {
        console.log(`Seeding fees for student: ${student.firstName} ${student.lastName} (${student.id})`);

        // Clear existing fees for this student to ensure a clean state
        await prisma.feePayment.deleteMany({ where: { fee: { studentId: student.id } } });
        await prisma.fee.deleteMany({ where: { studentId: student.id } });

        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setDate(now.getDate() + 15);

        const lastMonth = new Date(now);
        lastMonth.setDate(now.getDate() - 30);

        // 1. Create a Pending Fee (Due in future)
        await prisma.fee.create({
            data: {
                studentId: student.id,
                title: "Tuition Fee - Term 2",
                amount: 15000,
                dueDate: nextMonth,
                status: "PENDING",
            }
        });

        // 2. Create another Pending Fee (Overdue)
        await prisma.fee.create({
            data: {
                studentId: student.id,
                title: "Transport Fee - March",
                amount: 4500,
                dueDate: lastMonth, // Actually overdue for testing
                status: "PENDING",
            }
        });

        // 3. Create a Paid Fee with History
        const paidFee = await prisma.fee.create({
            data: {
                studentId: student.id,
                title: "Tuition Fee - Term 1",
                amount: 15000,
                dueDate: lastMonth,
                status: "PAID",
            }
        });

        await prisma.feePayment.create({
            data: {
                feeId: paidFee.id,
                amount: 15000,
                date: lastMonth,
                method: "razorpay",
                reference: "TXN-A1B2C3D4",
            }
        });
    }

    console.log("Successfully seeded mock Fee and FeePayment data!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
