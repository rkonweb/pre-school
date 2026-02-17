import { PrismaClient } from "./src/generated/client";
import { sendOtpAction, verifyOtpAction, loginParentGlobalAction } from "./src/app/actions/auth-actions";

const prisma = new PrismaClient();

async function testFlow() {
    const mobile = "+919755560721";
    console.log(`Testing flow for ${mobile}...`);

    // 1. Cleanup: Ensure user doesn't exist for test
    await prisma.user.deleteMany({ where: { mobile } });
    console.log("Cleaned up existing user record.");

    // 2. Request OTP
    console.log("Calling sendOtpAction...");
    const sendRes = await sendOtpAction(mobile, "login");
    console.log("Send OTP Result:", JSON.stringify(sendRes, null, 2));

    if (!sendRes.success) {
        throw new Error("sendOtpAction failed");
    }

    // 3. Verify OTP (Backdoor code)
    console.log("Calling verifyOtpAction...");
    const verifyRes = await verifyOtpAction(mobile, "123456", "login");
    console.log("Verify OTP Result:", JSON.stringify(verifyRes, null, 2));

    if (!verifyRes.success) {
        throw new Error("verifyOtpAction failed");
    }

    // 4. Check if User record was created
    const createdUser = await prisma.user.findUnique({ where: { mobile } });
    console.log("Created User:", JSON.stringify(createdUser, null, 2));

    if (!createdUser || createdUser.role !== "PARENT") {
        throw new Error("User record not created correctly");
    }

    // 5. Final Login Action
    console.log("Calling loginParentGlobalAction...");
    const loginRes = await loginParentGlobalAction(mobile);
    console.log("Login Result:", JSON.stringify(loginRes, null, 2));

    if (!loginRes.success) {
        throw new Error("loginParentGlobalAction failed");
    }

    console.log("\n✅ ALL TESTS PASSED!");
}

testFlow().catch(err => {
    console.error("\n❌ TEST FAILED:", err.message);
}).finally(() => prisma.$disconnect());
