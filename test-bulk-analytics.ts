
import { getBulkStudentAnalyticsAction } from "./src/app/actions/student-analytics-actions";
import { prisma } from "./src/lib/prisma";

async function main() {
    console.log("Starting Bulk Analytics Insight Verification...");
    try {
        // Find a school with students and exams
        const school = await prisma.school.findFirst({
            include: { students: { take: 1 } }
        });

        if (!school || school.students.length === 0) {
            console.log("No school or students found to test.");
            return;
        }

        const studentIds = school.students.map(s => s.id);
        console.log(`Testing for Student IDs: ${studentIds.join(', ')} in School: ${school.slug}`);

        const result = await getBulkStudentAnalyticsAction(school.slug, studentIds);

        if (result.success) {
            console.log("Success! Bulk Analytics Data Received.");
            const firstStudentId = studentIds[0];
            const analytics = result.data[firstStudentId];

            console.log(`Analysis for Student ${firstStudentId}:`);
            console.log(`- Exams: ${analytics.academics.totalExams}`);
            console.log(`- Avg: ${analytics.academics.overallPercentage.toFixed(1)}%`);
            console.log(`- Insights Count: ${analytics.insights.length}`);

            if (analytics.insights.length > 0) {
                console.log("Sample Insight:", analytics.insights[0].message);
            } else {
                console.log("No insights generated for this student (might need more data).");
            }
        } else {
            console.error("Action failed:", result.error);
        }

    } catch (error) {
        console.error("Test error:", error);
    }
}

main();
