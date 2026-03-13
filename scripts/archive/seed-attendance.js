
import { PrismaClient } from './src/generated/prisma_v2/index.js';

const prisma = new PrismaClient();

async function main() {
    const schoolSlug = 'test4';
    const staff = await prisma.user.findMany({
        where: {
            school: { slug: schoolSlug },
            role: { in: ['STAFF', 'ADMIN'] }
        }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Clear existing attendance for these days to avoid duplicates
    await prisma.staffAttendance.deleteMany({
        where: {
            date: { in: [today, yesterday] },
            user: { school: { slug: schoolSlug } }
        }
    });

    for (const person of staff) {
        // Mark attendance for yesterday
        const attYesterday = await prisma.staffAttendance.create({
            data: {
                userId: person.id,
                date: yesterday,
                status: 'PRESENT',
                totalHours: 9,
                punches: {
                    create: [
                        { type: 'IN', timestamp: new Date(yesterday.setHours(9, 0, 0, 0)) },
                        { type: 'OUT', timestamp: new Date(yesterday.setHours(18, 0, 0, 0)) }
                    ]
                }
            }
        });

        // Reset yesterday date for next person (Date objects are mutable)
        yesterday.setHours(0, 0, 0, 0);

        // Some attendance for today (only check-in for some)
        if (person.firstName !== 'Lisa') {
            await prisma.staffAttendance.create({
                data: {
                    userId: person.id,
                    date: today,
                    status: person.firstName === 'James' ? 'LATE' : 'PRESENT',
                    punches: {
                        create: [
                            { type: 'IN', timestamp: new Date(new Date(today).setHours(9, 15, 0, 0)) }
                        ]
                    }
                }
            });
        }
    }

    console.log("Seeded multi-punch attendance data successfully.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
