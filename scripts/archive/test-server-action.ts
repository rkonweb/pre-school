
import { generateBlogContentAction } from "./src/app/actions/ai-page-actions";
import { prisma } from "./src/lib/prisma";

async function main() {
    console.log("Testing generateBlogContentAction...");
    try {
        const rawText = "This is a test blog post about AI in education. It should be formatted nicely.";
        const result = await generateBlogContentAction(rawText, [], 'openai');
        console.log("Result:", result);
    } catch (error) {
        console.error("Test Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
