import { prisma } from "@/lib/prisma";

export async function getStudentContext(studentId: string) {
    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                classroom: true,
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 5
                },
                fees: {
                    where: {
                        status: { not: "PAID" }
                    }
                },
            }
        });

        if (!student) return null;

        // Fetch pending homework (Published, for student's classroom, not submitted)
        const pendingHomework = student.classroomId ? await prisma.homework.findMany({
            where: {
                classroomId: student.classroomId,
                isPublished: true,
                submissions: {
                    none: {
                        studentId: student.id
                    }
                }
            },
            take: 5
        }) : [];

        // Fetch recent diary entries
        const diaryEntries = await prisma.diaryEntry.findMany({
            where: {
                OR: [
                    { recipients: { some: { studentId: student.id } } }, // Personal
                    { classroomId: student.classroomId || "" }, // Class-wide
                    {
                        type: "ANNOUNCEMENT",
                        schoolId: student.schoolId
                    }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Construct Context String
        const context = `
Student Name: ${student.firstName} ${student.lastName}
Class: ${student.classroom?.name || "N/A"}

Recent Attendance:
${student.attendance.length > 0 ? student.attendance.map(a => `- ${new Date(a.date).toLocaleDateString()}: ${a.status}`).join('\n') : "No recent attendance records."}

Pending Homework:
${pendingHomework.length > 0 ? pendingHomework.map(h => `- ${h.title} (Due: ${h.dueDate ? new Date(h.dueDate).toLocaleDateString() : 'No due date'})`).join('\n') : "No pending homework."}

Outstanding Fees:
${student.fees.length > 0 ? student.fees.map(f => `- ${f.title}: ${f.amount} (Due: ${new Date(f.dueDate).toLocaleDateString()})`).join('\n') : "All fees paid."}

Recent Updates/Diary:
${diaryEntries.length > 0 ? diaryEntries.map(d => `- [${d.type}] ${d.title}: ${d.content?.slice(0, 100)}...`).join('\n') : "No recent updates."}
        `.trim();

        return context;

    } catch (error) {
        console.error("Error fetching student context for Jarvis:", error);
        return "";
    }
}
