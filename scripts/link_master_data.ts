import { prisma } from '../src/lib/prisma';

async function run() {
    try {
        const mappings = [
            { designation: 'Teacher', department: 'Academics' },
            { designation: 'Teaching Assistant', department: 'Academics' },
            { designation: 'Vice Principal', department: 'Academics' },
            { designation: 'Principal', department: 'Academics' },
            { designation: 'Accountant', department: 'Finance' },
            { designation: 'Admin Officer', department: 'Administration' },
            { designation: 'Driver', department: 'Transport' },
            { designation: 'Security Guard', department: 'Administration' }
        ];

        console.log('Linking designations to departments...');

        for (const mapping of mappings) {
            const dept = await prisma.masterData.findFirst({
                where: { type: 'DEPARTMENT', name: mapping.department }
            });

            if (dept) {
                const result = await (prisma as any).masterData.updateMany({
                    where: { type: 'DESIGNATION', name: mapping.designation },
                    data: { parentId: dept.id }
                });
                console.log(`Linked ${mapping.designation} to ${mapping.department} (${result.count} items)`);
            } else {
                console.warn(`Department ${mapping.department} not found`);
            }
        }

        console.log('Done linking MasterData.');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
