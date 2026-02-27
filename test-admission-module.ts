import { PrismaClient } from "./src/generated/client_final";
import {
    sendApplicationOTPAction,
    verifyApplicationOTPAction,
    submitPublicApplicationAction,
    getPublicApplicationStatusAction
} from "./src/app/actions/public-admission-actions";
import {
    getAdmissionsAction,
    updateAdmissionStageAction,
    getSiblingsAction,
    approveAdmissionAction,
    checkParentByPhoneAction
} from "./src/app/actions/admission-actions";

const prisma = new PrismaClient();

async function testAdmissionFlow() {
    console.log("🚀 Starting Admission Module Workflow Test...\n");

    const schoolSlug = "bodhi-board";
    const testPhone = "+15551234567";
    const testEmail = "testparent@example.com";

    // 1. Resolve school ID or fail fast
    const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
    if (!school) throw new Error("School 'bodhi-board' not found in database.");

    console.log("✅ School found:", school.id);

    // Cleanup previous runs
    await prisma.admission.deleteMany({ where: { parentPhone: testPhone } });
    await prisma.otp.deleteMany({ where: { mobile: testPhone } });
    await prisma.student.deleteMany({ where: { parentMobile: testPhone } });

    console.log("🧹 Cleaned up existing test records.\n");

    // --- PHASE 1: PUBLIC PORTAL ---
    console.log("--- PHASE 1: PUBLIC PORTAL ---");

    console.log("1. Requesting OTP...");
    const otpRes = await sendApplicationOTPAction(schoolSlug, testPhone);
    if (!otpRes.success) throw new Error(`OTP Request failed: ${otpRes.error}`);
    console.log("✅ OTP Sent successfully.");

    // Retrieve OTP directly from DB for test
    const otpRecord = await prisma.otp.findFirst({ where: { mobile: testPhone }, orderBy: { createdAt: 'desc' } });
    if (!otpRecord) throw new Error("Could not find OTP record in DB.");

    console.log("2. Verifying OTP...");
    const verifyRes = await verifyApplicationOTPAction(schoolSlug, testPhone, otpRecord.code);
    if (!verifyRes.success) throw new Error(`OTP Verification failed: ${verifyRes.error}`);
    console.log("✅ OTP Verified successfully.");

    console.log("3. Submitting Public Application...");
    const applicationData = {
        firstName: "TestChild",
        lastName: "Alpha",
        age: 4,
        program: "NURSERY",
        primaryParentName: "Parent Test",
        primaryParentPhone: testPhone,
        primaryParentEmail: testEmail,
        city: "Test City"
    };

    const submitRes = await submitPublicApplicationAction(schoolSlug, applicationData);
    if (!submitRes.success) throw new Error(`Application Submission failed: ${submitRes.error}`);
    const newAdmissionId = submitRes.admissionId;
    console.log(`✅ Application Submitted! ID: ${newAdmissionId}`);

    console.log("4. Fetching Public Application Status...");
    const statusRes = await getPublicApplicationStatusAction(schoolSlug, testPhone);
    if (!statusRes.success || statusRes.admissions.length === 0) throw new Error("Failed to fetch public status.");
    console.log("✅ Public Status retrieved successfully:\n", JSON.stringify(statusRes.admissions[0], null, 2));


    // --- PHASE 2: ADMIN DASHBOARD ---
    console.log("\n--- PHASE 2: ADMIN DASHBOARD ---");

    console.log("1. Fetching Admin Lead List...");
    const adminLeadsRes = await getAdmissionsAction(schoolSlug, { searchTerm: testPhone });
    if (!adminLeadsRes.success) throw new Error(`Failed to fetch admin leads: ${adminLeadsRes.error}`);
    console.log(`✅ Found ${adminLeadsRes.leads.length} leads matching phone.`);

    console.log("2. Updating Admission Stage (INTERESTED -> TOUR_SCHEDULED)...");
    const updateRes = await updateAdmissionStageAction(schoolSlug, newAdmissionId, "TOUR_SCHEDULED");
    if (!updateRes.success) throw new Error(`Failed to update stage: ${updateRes.error}`);
    console.log("✅ Stage updated successfully.");

    console.log("3. Checking for Siblings...");
    const siblingRes = await getSiblingsAction(schoolSlug, testPhone, newAdmissionId);
    if (!siblingRes.success) throw new Error(`Sibling check failed: ${siblingRes.error}`);
    console.log(`✅ Sibling check complete. Found: ${siblingRes.siblings.length}`);

    console.log("4. Checking Parent By Phone (User Table)...");
    const parentCheck = await checkParentByPhoneAction(schoolSlug, testPhone);
    if (!parentCheck.success) throw new Error(`Parent DB check failed: ${parentCheck.error}`);
    console.log(`✅ Parent DB check complete. Exists in user table: ${parentCheck.parent ? 'YES' : 'NO'}`);

    console.log("5. Approving Admission (Enrollment)...");

    // Find a valid classroom to enroll to.
    const classroom = await prisma.classroom.findFirst({ where: { schoolId: school.id } });
    const classIdToEnroll = classroom?.id || "temp-class";

    if (!classroom) {
        console.warn("⚠️ No classroom found, enrollment might fail due to FK constraints if 'temp-class' is used.");
    }

    // We expect this to fail or succeed depending on logic.
    // If it throws an unhandled error inside, we will catch it here.
    try {
        const enrollRes = await approveAdmissionAction(schoolSlug, newAdmissionId, classIdToEnroll, "NURSERY");
        if (!enrollRes.success) {
            console.error(`❌ Enrollment Failed (Internal Logic Error): ${enrollRes.error}`);
        } else {
            console.log("✅ Enrollment completed successfully! Student Record created.");
            // Verify student record
            const newStudent = await prisma.student.findFirst({ where: { parentMobile: testPhone } });
            console.log("🎓 Student Record:\n", JSON.stringify(newStudent, null, 2));
        }
    } catch (err: any) {
        console.error(`❌ Enrollment Exception Thrown:`, err.message);
    }

    console.log("\n🎉 Workflow Testing Complete!");
}

testAdmissionFlow().catch(e => {
    console.error("\n💥 FATAL TEST ERROR:");
    console.error(e.message || e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
