
import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aaryan', 'Dhruv', 'Kabir', 'Ritvik', 'Gautam',
    'Ananya', 'Diya', 'Gauri', 'Ira', 'Ishita', 'Jhanvi', 'Kavya', 'Meera', 'Neha', 'Pari',
    'Prisha', 'Riya', 'Saanvi', 'Samaira', 'Sara', 'Shanaya', 'Sneha', 'Tanvi', 'Trisha', 'Zara'
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Menon',
    'Chopra', 'Malhotra', 'Kapoor', 'Mehta', 'Jain', 'Agarwal', 'Bhatia', 'Saxena', 'Tiwari', 'Mishra'
];

async function main() {
    const slug = 'gggggggggg';

    console.log(`Finding school with slug: ${slug}...`);
    const school = await prisma.school.findUnique({
        where: { slug },
        include: { classrooms: true }
    });

    if (!school) {
        console.error(`School with slug "${slug}" not found.`);
        return;
    }

    console.log(`Found school: ${school.name} (${school.id})`);

    let classrooms = school.classrooms;

    // If no classrooms exist, create some for testing
    if (classrooms.length === 0) {
        console.log("No classrooms found. Creating default classrooms...");
        const newClassrooms = [
            { name: "Grade 1 - A", capacity: 30 },
            { name: "Grade 1 - B", capacity: 30 },
            { name: "Grade 2 - A", capacity: 30 },
            { name: "Grade 2 - B", capacity: 30 },
            { name: "Nursery - A", capacity: 20 },
            { name: "KG - A", capacity: 25 },
        ];

        for (const cls of newClassrooms) {
            await prisma.classroom.create({
                data: {
                    name: cls.name,
                    schoolId: school.id,
                    capacity: cls.capacity,
                    // If your schema requires other fields, add them here
                    // e.g. section if it existed separately
                }
            });
        }

        // Refresh classrooms
        const updatedSchool = await prisma.school.findUnique({
            where: { id: school.id },
            include: { classrooms: true }
        });
        classrooms = updatedSchool?.classrooms || [];
    }

    console.log(`Processing ${classrooms.length} classrooms...`);

    for (const classroom of classrooms) {
        console.log(`Adding 10 students to ${classroom.name}...`);

        const studentsData = [];
        for (let i = 0; i < 10; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';

            // Random DOB between 3 and 10 years ago
            const age = Math.floor(Math.random() * 7) + 3;
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - age);
            dob.setMonth(Math.floor(Math.random() * 12));
            dob.setDate(Math.floor(Math.random() * 28));

            const parentFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
            const parentLast = lastName; // Same family name

            studentsData.push({
                firstName,
                lastName,
                gender,
                dateOfBirth: dob,
                age,
                grade: classroom.name.split(' - ')[0] || "Grade 1", // Extract grade part
                parentName: `${parentFirst} ${parentLast}`,
                parentMobile: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`, // Random 10 digit
                parentEmail: `${parentFirst.toLowerCase()}.${parentLast.toLowerCase()}@example.com`,
                admissionNumber: `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                schoolId: school.id,
                classroomId: classroom.id,
                status: 'ACTIVE',
                joiningDate: new Date(),
                // Add default address
                // address: "123 Random St, City",
            });
        }

        // Using createMany might be faster but create allows us to handle related updates if needed
        // createMany is supported in SQLite per schema
        await prisma.student.createMany({
            data: studentsData
        });
    }

    console.log("Transformation Complete: Added students to all classrooms.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
