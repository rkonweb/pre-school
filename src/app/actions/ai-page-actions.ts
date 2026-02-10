"use server";

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "@/lib/prisma";


export async function generatePageAction(rawText: string, images: string[] = [], provider: 'google' | 'openai' = 'openai') {
    console.log(`[AI] Generating page with ${provider}. Text length: ${rawText.length}, Images: ${images.length}`);
    try {

        // 1. Get API Key from System Settings
        const settings = await prisma.systemSettings.findUnique({
            where: { id: 'global' }
        });

        const configRes = (settings as any).integrationsConfig;
        if (!configRes) {
            throw new Error("AI integrations are not configured in Admin Settings.");
        }

        const config = JSON.parse(configRes);
        const apiKey = provider === 'google' ? config.googleAiKey : config.openAiKey;

        if (!apiKey) {
            throw new Error(`API Key for ${provider} is missing. Please configure it in Settings.`);
        }

        // 2. Select Model
        const model = provider === 'google'
            ? createGoogleGenerativeAI({ apiKey })('gemini-flash-latest')
            : createOpenAI({ apiKey })('gpt-4o');

        // 3. Define the Prompt

        const prompt = `
            You are an expert Document Layout Specialist and Educational Content Designer.
            Your task is to apply "Magic Formatting" to the provided raw text.

            CORE OBJECTIVE:
            Systematically organize the raw content into a beautiful, structured HTML document using headings, lists, and tables. 
            **DO NOT REWRITE OR CHANGE THE MEANING OF THE CONTENT.** 
            Your job is strictly formatting and layout improvement.

            FORMATTING RULES:
            1. HIERARCHY:
               - Use <h1> for the main title (add a relevant emoji if missing).
               - Use <h2> for major sections.
               - Use <h3> for sub-sections.
            2. LISTS & TABLES:
               - Convert lists of items into <ul> or <ol>.
               - Detect schedules, pricing, or comparative data and format them into clean <table> structures.
            3. EMPHASIS:
               - Use <strong> to bold key terms or instructions.
               - Use <mark style="background-color: #FCC11A; color: #0C3449">...</mark> to highlight critical warnings or "Pro-Tips".
            4. READABILITY:
               - Break long paragraphs into shorter chunks.
               - Ensure ample spacing (use <br> or separate <p> tags).
            
            CONSTRAINTS:
            - Keep the original text as close as possible (only fix obvious typo/grammar errors).
            - Do not invent new content.
            - Do not summarize.
            - Return ONLY valid, semantic HTML within the response. No markdown wrappers.

            RAW CONTENT TO FORMAT:
                ${rawText}
        `;

        // 4. Generate Content
        const { text } = await generateText({
            model,
            messages: [
                {
                    role: 'user',
                    content: images.length > 0
                        ? [
                            { type: 'text', text: prompt },
                            ...images.map(img => {
                                const [header, base64] = img.split(',');
                                const mimeType = header.split(':')[1].split(';')[0];
                                return {
                                    type: 'image' as const,
                                    image: base64,
                                    mimeType
                                };
                            })
                        ]
                        : [{ type: 'text', text: prompt }]
                }
            ]
        });


        console.log("[AI] Generation successful!");

        // Clean up markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith("```html")) {
            cleanText = cleanText.replace(/^```html/, "").replace(/```$/, "").trim();
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```/, "").replace(/```$/, "").trim();
        }

        return { success: true, data: cleanText };
    } catch (error: any) {
        console.error("generatePageAction Error:", error);
        return { success: false, error: error.message };
    }
}
