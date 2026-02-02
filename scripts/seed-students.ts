
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const students = [
    { firstName: "Aarav", lastName: "Sharma", gender: "MALE", dob: "2019-05-15" },
    { firstName: "Vivaan", lastName: "Gupta", gender: "MALE", dob: "2019-08-22" },
    { firstName: "Aditya", lastName: "Patel", gender: "MALE", dob: "2019-02-10" },
    { firstName: "Vihaan", lastName: "Singh", gender: "MALE", dob: "2019-11-05" },
    { firstName: "Arjun", lastName: "Kumar", gender: "MALE", dob: "2018-12-30" },
    { firstName: "Saanvi", lastName: "Reddy", gender: "FEMALE", dob: "2019-04-18" },
    { firstName: "Ananya", lastName: "Das", gender: "FEMALE", dob: "2019-09-12" },
    { firstName: "Diya", lastName: "Mehta", gender: "FEMALE", dob: "2019-01-25" },
    { firstName: "Ishita", lastName: "Chopra", gender: "FEMALE", dob: "2019-07-08" },
    { firstName: "Kavya", lastName: "Verma", gender: "FEMALE", dob: "2019-03-14" },
];

async function main() {
    const slug = "test4"; // Target school slug
    console.log(`\n--- Seeding Workflow: Admissions -> Students for school: ${slug} ---\n`);

    const school = await prisma.school.findUnique({
        where: { slug },
        include: { classrooms: true }
    });

    if (!school) {
        console.error(`School with slug '${slug}' not found.`);
        return;
    }

    console.log(`Found school: ${school.name} (${school.id})`);

    // 1. Get Classroom
    let classroomId = school.classrooms[0]?.id;
    if (!classroomId) {
        console.log("No classrooms found. Creating 'LKG - A'...");
        const newClass = await prisma.classroom.create({
            data: {
                name: "LKG - A",
                schoolId: school.id
            }
        });
        classroomId = newClass.id;
    }
    console.log(`Target Classroom ID: ${classroomId}`);

    // 2. Cleanup (Delete previous entries to avoid duplicates)
    console.log("Cleaning up previous data...");
    const names = students.map(s => s.firstName);
    // Delete Students
    await prisma.student.deleteMany({
        where: {
            schoolId: school.id,
            firstName: { in: names }
        }
    });
    // Delete Admissions
    const fullNames = students.map(s => `${s.firstName} ${s.lastName}`);
    await prisma.admission.deleteMany({
        where: {
            schoolId: school.id,
            studentName: { in: fullNames }
        }
    });
    console.log("Cleanup complete.");

    // 3. Process Workflow
    console.log("\nStarting Enrollment Workflow...");

    for (const s of students) {
        // A. Create Admission (Inquiry/Application Stage)
        const admission = await prisma.admission.create({
            data: {
                schoolId: school.id,
                studentName: `${s.firstName} ${s.lastName}`,
                studentGender: s.gender,
                dateOfBirth: new Date(s.dob),
                parentName: `${s.lastName} Parent`,
                parentPhone: "9876543210",
                parentEmail: `parent.${s.firstName.toLowerCase()}@example.com`,
                address: "123 School Lane, City",
                stage: "INTERVIEW", // Simulating they are in the final stage before enrollment
                officialStatus: "INTERESTED",
                priority: "HIGH",
                studentAge: new Date().getFullYear() - new Date(s.dob).getFullYear()
            }
        });

        console.log(`[Admission Created]: ${admission.studentName} (ID: ${admission.id})`);

        // B. Approve & Enroll (Simulating the Approve Action)
        // 1. Update Admission to ENROLLED
        await prisma.admission.update({
            where: { id: admission.id },
            data: { stage: "ENROLLED" }
        });

        // 2. Create Student Record
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}`;

        // Note: In a real scenario, we might default these fields or map them from admission.
        // Since our Admission model doesn't store 'grade', we'll just use 'LKG' hardcoded or from logic.
        await prisma.student.create({
            data: {
                firstName: s.firstName,
                lastName: s.lastName,
                age: admission.studentAge,
                gender: s.studentGender,
                dateOfBirth: new Date(s.dob),
                avatar: avatarUrl,
                grade: "LKG",
                classroomId: classroomId,
                schoolId: school.id,
                status: "ACTIVE",

                // Parent Info mapped from Admission
                parentName: admission.parentName,
                parentMobile: admission.parentPhone,
                parentEmail: admission.parentEmail,

                // Address from Admission (Student model has address field in schema? I better check schema again)
                // Checking schema... Student has 'parentName', 'parentMobile', 'parentEmail'. 
                // Student DOES NOT have a top-level 'address' field in the schema I viewed earlier (Step 4980 user view).
                // Wait, User model has 'address', Admission has 'address'. Student has... 
                // Looking at Step 4835 (getStudentsAction), Student has... 
                // Looking at Step 4980 (Schema): Student model lines 185-220. 
                // It has `parentName`, `parentMobile`, `parentEmail`. 
                // It DOES NOT have `address`. 
                // So I will NOT add address to Student creation.
            }
        });

        console.log(` -> [Student Enrolled]: ${s.firstName} ${s.lastName}`);
    }

    console.log("\n--- Workflow Completed Successfully ---");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
