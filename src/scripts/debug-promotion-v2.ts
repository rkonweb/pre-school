
import { prisma } from "../lib/prisma";

async function main() {
    console.log("Starting Debug V2...");
    try {

        const school = await prisma.school.findUnique({ where: { slug: "y" } });
        if (!school) throw new Error("School 'y' not found");
        console.log(`Using School: ${school.name} (${school.id})`);


        const allClasses = await prisma.classroom.findMany();
        console.log(`Total Classes in DB: ${allClasses.length}`);
        allClasses.forEach(c => console.log(` - ${c.name} (SchoolID: ${c.schoolId})`));

        const allClassrooms = allClasses.filter(c => c.schoolId === school.id);
        console.log(`Classrooms for ${school.name}: ${allClassrooms.length}`);

        console.log(`Total Classrooms: ${allClassrooms.length}`);

        let sourceClass = allClassrooms.find(c => c.name.includes("LKG") && c.name.includes("B"));
        let targetClass = allClassrooms.find(c => c.name.includes("UKG") && c.name.includes("A"));

        if (!sourceClass) sourceClass = allClassrooms[0];
        if (!targetClass) targetClass = allClassrooms[1];

        if (!sourceClass || !targetClass) throw new Error("Not enough classes");

        console.log(`Source: ${sourceClass.name} (${sourceClass.id})`);
        console.log(`Target: ${targetClass.name} (${targetClass.id})`);

        // Find a student
        let student = await prisma.student.findFirst({ where: { classroomId: sourceClass.id } });
        if (!student) {
            console.log("Creating temp student...");
            student = await prisma.student.create({
                data: {
                    firstName: "DebugV2",
                    lastName: "Test",
                    schoolId: school.id,
                    classroomId: sourceClass.id,
                    status: "ACTIVE"
                }
            });
        }
        console.log(`Student: ${student.firstName} (${student.id})`);

        // Target Year
        const targetYearName = "2026-2027";
        let targetAcademicYear = await prisma.academicYear.findFirst({
            where: { schoolId: school.id, name: targetYearName }
        });

        // Ensure year exists for test
        if (!targetAcademicYear) {
            console.log("Creating temp year...");
            targetAcademicYear = await prisma.academicYear.create({
                data: {
                    name: targetYearName,
                    startDate: new Date("2026-04-01"),
                    endDate: new Date("2027-03-31"),
                    schoolId: school.id,
                    isCurrent: false
                }
            });
        }
        console.log(`Target Year: ${targetAcademicYear.name} (${targetAcademicYear.id})`);

        // 2. Simulate Transaction Logic
        console.log("--- Simulating Transaction ---");
        await prisma.$transaction(async (tx) => {
            // A. Update Student
            console.log("Updating student...");
            await tx.student.updateMany({
                where: { id: student!.id },
                data: {
                    classroomId: targetClass!.id,
                    grade: targetClass!.name
                }
            });

            // B. Fees
            console.log("Fetching Academic Year...");
            const academicYear = await tx.academicYear.findUnique({
                where: { id: targetAcademicYear!.id }
            });
            const tYearName = academicYear?.name;
            console.log(`Resolved Year Name: ${tYearName}`);

            console.log("Fetching Fee Structures...");
            const feeStructures = await tx.feeStructure.findMany({
                where: { schoolId: school.id },
                include: { components: true }
            });
            console.log(`Total Structures: ${feeStructures.length}`);

            const applicableStructure = feeStructures.find(fs => {
                try {
                    console.log(`Checking FS: ${fs.name} (Year: ${fs.academicYear})`);

                    if (fs.academicYear !== tYearName) {
                        console.log(`  -> Year Mismatch (Expected: ${tYearName}, Found: ${fs.academicYear})`);
                        return false;
                    }

                    const ids = JSON.parse(fs.classIds || "[]");
                    const isMatch = Array.isArray(ids) && ids.includes(targetClass!.id);
                    console.log(`  -> Class Match: ${isMatch} (ClassIds: ${fs.classIds})`);
                    return isMatch;
                } catch (e) {
                    console.error("  -> Error parsing ids", e);
                    return false;
                }
            });

            if (applicableStructure) {
                console.log(`MATCHED Structure: ${applicableStructure.name}`);
                // Simulate Create
                console.log("  -> Would create fees.");
            } else {
                console.log("NO MATCHING Structure found.");
            }

        });
        console.log("Transaction Simulated Successfully.");

    } catch (e) {
        console.error("DEBUG ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
