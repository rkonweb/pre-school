
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "./src/lib/prisma";

async function main() {
    console.log("Starting AI Test...");
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } });
        const config = JSON.parse((settings as any).integrationsConfig);
        const apiKey = config.openAiKey;

        console.log("API Key found:", apiKey ? "Yes (starts with " + apiKey.substring(0, 7) + ")" : "No");

        const openai = createOpenAI({ apiKey });
        const model = openai('gpt-4o');

        console.log("Calling generateText...");
        const { text } = await generateText({
            model,
            messages: [{ role: 'user', content: 'Say hello in 5 words.' }]
        });

        console.log("AI Response:", text);
    } catch (error) {
        console.error("AI Test Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
