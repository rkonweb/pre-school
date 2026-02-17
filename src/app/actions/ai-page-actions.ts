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


export async function generateBlogContentAction(rawText: string, images: string[] = [], provider: 'google' | 'openai' = 'openai') {
    console.log(`[AI Blog] Starting generation. Provider: ${provider}, Text Len: ${rawText.length}, Images: ${images.length}`);
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } });
        console.log(`[AI Blog] Settings found: ${!!settings}`);

        const configRes = (settings as any).integrationsConfig;
        if (!configRes) throw new Error("AI integrations not configured.");

        const config = JSON.parse(configRes);
        const apiKey = provider === 'google' ? config.googleAiKey : config.openAiKey;
        if (!apiKey) throw new Error(`API Key for ${provider} is missing.`);

        console.log(`[AI Blog] API Key found for ${provider}. Initializing model...`);

        const model = provider === 'google'
            ? createGoogleGenerativeAI({ apiKey })('gemini-flash-latest')
            : createOpenAI({ apiKey })('gpt-4o-mini');

        const prompt = `
            You are an expert Blog Editor and Content Strategist.
            Your task is to apply "Magic Formatting" to the provided raw blog content.

            CORE OBJECTIVE:
            Format the raw text into a highly readable, engaging, and SEO-friendly HTML blog post.
            **DO NOT REWRITE THE CORE MEANING, but you MAY enhance smooth transitions and fix grammar.**

            FORMATTING RULES:
            1. STRUCTURE:
               - Use <h2> for main topics (The H1 is handled by the post title).
               - Use <h3> for sub-points.
            2. ENGAGEMENT:
               - Use <blockquote> to highlight key quotes or takeaways.
               - Used bullet points <ul> or numbered lists <ol> for readability.
            3. EMPHASIS:
               - Use <strong> for important concepts.
               - Keep paragraphs short (3-4 lines max).
            4. TONE:
               - Professional yet accessible.
               - Educational and inspiring.

            CONSTRAINTS:
            - Return ONLY valid, semantic HTML.
            - Do NOT include the <h1> Title in the body.
            - Do not include markdown wrappers (like \`\`\`html).

            RAW CONTENT:
            ${rawText}
        `;

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
                                return { type: 'image' as const, image: base64, mimeType };
                            })
                        ]
                        : [{ type: 'text', text: prompt }]
                }
            ]
        });

        let cleanText = text.trim();
        if (cleanText.startsWith("```html")) {
            cleanText = cleanText.replace(/^```html/, "").replace(/```$/, "").trim();
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```/, "").replace(/```$/, "").trim();
        }

        return { success: true, data: cleanText };
    } catch (error: any) {
        console.error("generateBlogContentAction Error:", error);
        return { success: false, error: error.message };
    }
}

export async function generateImageAction(prompt: string, provider: 'openai' = 'openai') {
    console.log(`[AI Image] Generating image for: ${prompt.substring(0, 50)}...`);
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } });
        const configRes = (settings as any).integrationsConfig;
        if (!configRes) throw new Error("AI integrations not configured.");

        const config = JSON.parse(configRes);
        const apiKey = config.openAiKey;
        if (!apiKey) throw new Error("OpenAI API Key is missing for image generation.");

        // Call OpenAI DALL-E 3
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: `Educational blog cover image, professional, vibrant, high quality, theme: ${prompt}`,
                n: 1,
                size: "1024x1024",
                quality: "standard",
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || "Failed to generate image");
        }

        const imageUrl = result.data[0].url;

        // Download the image and upload to Google Drive/GCS
        const imgRes = await fetch(imageUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());

        const { uploadToGCS } = await import("@/lib/gcs-upload");
        const uploadRes = await uploadToGCS(
            buffer,
            `blog_gen_${Date.now()}.png`,
            "image/png",
            "homework" // Using homework as fallback or general folder
        );

        if (!uploadRes.success) {
            throw new Error(uploadRes.error || "Failed to upload generated image to storage");
        }

        return { success: true, url: uploadRes.url };
    } catch (error: any) {
        console.error("generateImageAction Error:", error);
        return { success: false, error: error.message };
    }
}
