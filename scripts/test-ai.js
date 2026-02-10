const { generatePageAction } = require('./src/app/actions/ai-page-actions');

async function test() {
    console.log("Testing generatePageAction...");
    try {
        const res = await generatePageAction("Test curriculum: 9:00 AM - Circle Time, 10:00 AM - Snack.");
        console.log("Result:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
