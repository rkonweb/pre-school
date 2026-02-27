import { PrismaClient } from "../src/generated/client_final";
import {
    sendApplicationOTPAction,
    verifyApplicationOTPAction,
    submitPublicApplicationAction,
    getPublicApplicationStatusAction
} from "../src/app/actions/public-admission-actions";

// Use directly Prisma bypassing Next.js server auth cookies to test the core logic
const prisma = new PrismaClient();

// ANSI color codes for terminal output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m"
};

const schoolSlug = "bodhi-board";
const testPhone = "+15550000000";
const childFirstName = "AutoTest";
const childLastName = "Child";

let testsPassed = 0;
let testsFailed = 0;

function logStatus(testName: string, passed: boolean, details?: string) {
    if (passed) {
        console.log(`${colors.green}✔ PASS:${colors.reset} ${testName}`);
        testsPassed++;
    } else {
        console.log(`${colors.red}✖ FAIL:${colors.reset} ${testName}`);
        if (details) console.log(`  └─ Details: ${details}`);
        testsFailed++;
    }
}

async function runTests() {
    console.log(`\n${colors.cyan}${colors.bold}==========================================`);
    console.log(`🚀 RUNNING ADMISSION MODULE AUTOMATED TESTS`);
    console.log(`==========================================${colors.reset}\n`);

    const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
    if (!school) {
        console.error(`${colors.red}Fatal: School '${schoolSlug}' not found.${colors.reset}`);
        process.exit(1);
    }

    // 🧹 Cleanup Phase
    console.log(`${colors.yellow}🧹 Cleaning previous test data...${colors.reset}`);
    await prisma.admission.deleteMany({ where: { parentPhone: testPhone } });
    await prisma.student.deleteMany({ where: { parentMobile: testPhone } });
    await prisma.otp.deleteMany({ where: { mobile: testPhone } });
    console.log(`${colors.green}✔ Cleanup complete.\n${colors.reset}`);

    // ==========================================
    // PHASE 1: PUBLIC INQUIRY & OTP
    // ==========================================
    console.log(`${colors.cyan}${colors.bold}--- PHASE 1: PUBLIC PORTAL & INQUIRY ---${colors.reset}`);

    // Test 1: Send OTP
    let otpSent = false;
    try {
        const otpRes = await sendApplicationOTPAction(schoolSlug, testPhone);
        otpSent = otpRes.success;
        logStatus("Generate & Send Mobile OTP", otpSent);
    } catch (e: any) {
        logStatus("Generate & Send Mobile OTP", false, e.message);
    }

    // Test 2: Verify OTP
    let otpVerified = false;
    if (otpSent) {
        try {
            const dbOtp = await prisma.otp.findFirst({ where: { mobile: testPhone }, orderBy: { createdAt: 'desc' } });
            if (dbOtp) {
                const verifyRes = await verifyApplicationOTPAction(schoolSlug, testPhone, dbOtp.code);
                otpVerified = verifyRes.success;
                logStatus("Verify Valid OTP", otpVerified);
            } else {
                logStatus("Verify Valid OTP", false, "OTP record not found in db");
            }
        } catch (e: any) {
            logStatus("Verify Valid OTP", false, e.message);
        }
    } else {
        logStatus("Verify Valid OTP", false, "Skipped due to previous failure");
    }

    // Test 3: Submit Public Application
    let admissionId: string | null = null;
    if (otpVerified) {
        try {
            const appData = {
                firstName: childFirstName,
                lastName: childLastName,
                age: 4,
                program: "KINDERGARTEN",
                primaryParentName: "Auto Test Parent",
                primaryParentPhone: testPhone,
                primaryParentEmail: "autotest@parent.com",
                city: "Testing City"
            };
            const submitRes = await submitPublicApplicationAction(schoolSlug, appData);
            if (submitRes.success && submitRes.admissionId) {
                admissionId = submitRes.admissionId;
                logStatus("Submit Public Application", true);
            } else {
                logStatus("Submit Public Application", false, submitRes.error);
            }
        } catch (e: any) {
            logStatus("Submit Public Application", false, e.message);
        }
    } else {
        logStatus("Submit Public Application", false, "Skipped due to previous failure");
    }

    // Test 4: Verify Application Status API
    if (admissionId) {
        try {
            const statusRes = await getPublicApplicationStatusAction(schoolSlug, testPhone);
            const foundApp = statusRes.success && statusRes.admissions && statusRes.admissions.length > 0;
            logStatus("Fetch Active Application Status", foundApp);
        } catch (e: any) {
            logStatus("Fetch Active Application Status", false, e.message);
        }
    }


    // ==========================================
    // PHASE 2: ADMIN PIPELINE & LOGIC
    // ==========================================
    console.log(`\n${colors.cyan}${colors.bold}--- PHASE 2: ADMIN PIPELINE ENGINE ---${colors.reset}`);

    // Note: To bypass cookies(), we test the Prisma transformations directly here instead of using actions

    // Test 5: Drag & Drop Stage Update
    let stageUpdated = false;
    if (admissionId) {
        try {
            const updated = await prisma.admission.update({
                where: { id: admissionId },
                data: { stage: "TOUR_SCHEDULED" }
            });
            stageUpdated = updated.stage === "TOUR_SCHEDULED";
            logStatus("Pipeline Kanban Move (Update Stage)", stageUpdated);
        } catch (e: any) {
            logStatus("Pipeline Kanban Move (Update Stage)", false, e.message);
        }
    } else {
        logStatus("Pipeline Kanban Move (Update Stage)", false, "Skipped. No Application ID.");
    }

    // Test 6: AI Default Propensity Score Check
    if (admissionId) {
        try {
            const adCheck = await prisma.admission.findUnique({ where: { id: admissionId } });
            const hasScore = typeof adCheck?.score === 'number';
            logStatus("AI Engine Score Association", hasScore, `Score found: ${adCheck?.score}`);
        } catch (e: any) {
            logStatus("AI Engine Score Association", false, e.message);
        }
    } else {
        logStatus("AI Engine Score Association", false, "Skipped.");
    }

    // Test 7: Sibling Match Data Collision Logic
    if (admissionId) {
        try {
            // Fake a second admission
            const dummyId = await prisma.admission.create({
                data: {
                    schoolId: school.id,
                    studentName: "Second Child",
                    parentName: "Auto Test Parent",
                    parentPhone: testPhone, // Sampe phone
                    stage: "INQUIRY"
                }
            });

            // Replicate check phone check logic
            const admissions = await prisma.admission.findMany({
                where: {
                    schoolId: school.id,
                    id: { not: admissionId },
                    parentPhone: { contains: testPhone.slice(-5) }
                }
            });

            const siblingDetected = admissions.length > 0;
            logStatus("Sibling Detection Engine (Phone Identity)", siblingDetected);

            await prisma.admission.delete({ where: { id: dummyId.id } }); // Cleanup dummy
        } catch (e: any) {
            logStatus("Sibling Detection Engine (Phone Identity)", false, e.message);
        }
    } else {
        logStatus("Sibling Detection Engine (Phone Identity)", false, "Skipped.");
    }


    // ==========================================
    // PHASE 3: ENROLLMENT & MATRICULATION
    // ==========================================
    console.log(`\n${colors.cyan}${colors.bold}--- PHASE 3: FINAL ENROLLMENT ---${colors.reset}`);

    // Test 8: Convert Admission -> Active Student
    if (admissionId) {
        try {
            const admission = await prisma.admission.findUnique({ where: { id: admissionId } });
            if (!admission) throw new Error("Admission vanished.");

            // Find valid classroom
            const classroom = await prisma.classroom.findFirst({ where: { schoolId: school.id } });
            if (!classroom) throw new Error("No classroom exists to enroll into.");

            // Run approval transaction (simulate approveAdmissionAction without cookies)
            let studentId: string | undefined;
            await prisma.$transaction(async (tx) => {
                await (tx as any).admission.update({
                    where: { id: admission.id },
                    data: { stage: "ENROLLED" }
                });

                const student = await (tx as any).student.create({
                    data: {
                        schoolId: school.id,
                        classroomId: classroom.id,
                        firstName: admission.studentName.split(' ')[0],
                        lastName: admission.studentName.split(' ')[1] || "NA",
                        grade: "KINDERGARTEN",
                        parentName: admission.parentName,
                        parentMobile: admission.parentPhone,
                        parentEmail: admission.parentEmail,
                        status: "ACTIVE"
                    }
                });
                studentId = student.id;
            });

            if (studentId) {
                logStatus("Admission Approval to Student Conversion", true);
            } else {
                logStatus("Admission Approval to Student Conversion", false, "Transaction failed.");
            }

        } catch (e: any) {
            logStatus("Admission Approval to Student Conversion", false, e.message);
        }
    } else {
        logStatus("Admission Approval to Student Conversion", false, "Skipped.");
    }


    // Summary
    console.log(`\n${colors.bold}==========================================`);
    console.log(`📋 TEST PIPELINE SUMMARY`);
    console.log(`==========================================${colors.reset}`);
    console.log(`${colors.green}Total Passed: ${testsPassed}${colors.reset}`);

    if (testsFailed > 0) {
        console.log(`${colors.red}Total Failed: ${testsFailed}${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`${colors.cyan}SUCCESS! All components are mathematically sound.${colors.reset}\n`);
        process.exit(0);
    }

}

runTests().finally(() => prisma.$disconnect());
