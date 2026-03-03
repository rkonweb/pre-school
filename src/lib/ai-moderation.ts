import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export type ModerationResult = {
    flagged: boolean;
    reason?: string;
    maskedContent: string;
};

// ─── Regex-based primary filter (always runs, no API key needed) ──────────────

const PHONE_REGEX = /\b(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3,5}\)?[\s\-.]?\d{3,5}[\s\-.]?\d{2,5}\b|\b\d{10,}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]{2,}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi;

const ABUSIVE_WORDS = [
    "idiot", "stupid", "fool", "moron", "dumb", "bastard", "bitch", "shit", "ass", "damn", "crap",
    "piss", "slut", "whore", "fuck", "cunt", "dick", "cock", "pussy", "retard", "loser", "pig",
    "chutiya", "madarchod", "bhenchod", "harami", "sala", "saali", "gandu", "randi", "bhosdike",
    "mc", "bc", "bkl", "lodu", "lawde", "gaandu", "katwe", "maderchod"
];

function regexFilter(text: string): ModerationResult {
    let flagged = false;
    const reasons: string[] = [];

    if (PHONE_REGEX.test(text)) { flagged = true; reasons.push("contains phone number"); }
    PHONE_REGEX.lastIndex = 0;

    if (EMAIL_REGEX.test(text)) { flagged = true; reasons.push("contains email address"); }
    EMAIL_REGEX.lastIndex = 0;

    for (const word of ABUSIVE_WORDS) {
        const wordRegex = new RegExp(`\\b${word}\\b`, "gi");
        if (wordRegex.test(text)) {
            flagged = true;
            if (!reasons.includes("contains abusive language")) reasons.push("contains abusive language");
        }
    }

    // Return original content unchanged — flagging only
    return {
        flagged,
        reason: reasons.length > 0 ? reasons.join(", ") : undefined,
        maskedContent: text  // content is preserved as-is
    };
}

// ─── Resolve AI API key from school's integration config ──────────────────────

export async function resolveAIKey(): Promise<{ apiKey: string; provider: 'openai' | 'google' } | null> {
    try {
        // Fetch from School record (bodhi-board school slug)
        const school = await (prisma as any).school.findFirst({
            select: { integrationsConfig: true }
        });

        if (school?.integrationsConfig) {
            const config = JSON.parse(school.integrationsConfig);
            const openaiKey = config?.ai?.openaiKey;
            const geminiKey = config?.ai?.geminiKey;

            if (openaiKey) return { apiKey: openaiKey, provider: 'openai' };
            if (geminiKey) return { apiKey: geminiKey, provider: 'google' };
        }
    } catch (e) {
        console.error("resolveAIKey error:", e);
    }

    // Fallback to environment variables
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) return { apiKey: openaiKey, provider: 'openai' };
    if (geminiKey) return { apiKey: geminiKey, provider: 'google' };

    return null;
}

// ─── Main moderation function ─────────────────────────────────────────────────

export async function moderateContent(text: string): Promise<ModerationResult> {
    // Step 1: Always run regex filter — works without any API key
    const regexResult = regexFilter(text);

    // Step 2: Try enhanced AI moderation on top
    try {
        const ai = await resolveAIKey();

        if (!ai) {
            console.log("AI Moderation: No API key found. Using regex filter only. flagged:", regexResult.flagged);
            return regexResult;
        }

        const moderationPrompt = `
You are a strict content moderator for a Pre-School Parent-Teacher communication app.
Identify:
1. Abuse, harassment, profanity, or hate speech (including acronyms and coded language).
2. Personal contact info — phone numbers, email addresses (including bypasses like "nine eight seven", "user AT domain DOT com").

Review the message and replace violations with "[MASKED]".
If safe, return maskedContent unchanged.

Return ONLY valid JSON:
{"flagged": boolean, "reason": string | null, "maskedContent": string}

Message: "${regexResult.maskedContent}"
        `.trim();

        let responseText = "";

        if (ai.provider === 'openai') {
            const oai = new OpenAI({ apiKey: ai.apiKey });
            const chatRes = await oai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: moderationPrompt }],
                temperature: 0,
            });
            responseText = chatRes.choices[0]?.message?.content?.trim() || "";
        } else {
            const genAI = new GoogleGenerativeAI(ai.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(moderationPrompt);
            responseText = result.response.text().trim();
        }

        // Strip markdown fences if any
        responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');

        const data = JSON.parse(responseText);

        return {
            flagged: regexResult.flagged || data.flagged === true,
            reason: [regexResult.reason, data.reason].filter(Boolean).join("; ") || undefined,
            maskedContent: text  // always return original text unchanged
        };

    } catch (error) {
        console.error("AI Moderation Error (falling back to regex):", error);
        return regexResult;
    }
}

// ─── Rewrite politely function ────────────────────────────────────────────────

export async function rewriteMessagePolitely(text: string, studentName?: string): Promise<string[]> {
    const ai = await resolveAIKey();
    if (!ai) {
        return [text]; // fallback to returning the original if no AI is configured
    }

    const nameInstruction = studentName
        ? `Refer to the student by ONLY their first name: ${studentName.split(' ')[0]}. Do not use their last name. Use appropriate pronouns (he/she) for subsequent mentions.`
        : `Refer to the student formally.`;

    const prompt = `You are a helpful assistant helping a pre-school teacher write a message to a parent. 
Rewrite the following message into 3 different polite, formal, and professional variations. 

CRITICAL RULES:
- Fix ALL grammar, spelling, and typo errors (e.g., "helo" -> "Hello").
- Expand shorthand, internet slang, or elongated words (e.g., "u" -> "you", "Hellooo" -> "Hello").
- Keep it concise. Do NOT turn a simple sentence into a paragraph.
- If the original message is just a simple short acknowledgment (like "ok", "yes", "helo"), provide 3 correct, polite, and brief ways to acknowledge it without expanding it into a full paragraph.
- Be formal and respectful, but completely human.
- FORBIDDEN WORDS: NEVER use the words "son", "daughter", "child", "kid", "little one", or "student". 
- ${nameInstruction} 
- Maintain the exact original intent. 
- Return exactly a JSON object with a single key "options" containing an array of 3 strings. Do not include markdown formatting or ANY other text.

Original message: "${text}"`;

    try {
        let responseText = "";

        if (ai.provider === 'openai') {
            const oai = new OpenAI({ apiKey: ai.apiKey });
            const chatRes = await oai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" } // to help with json
            });
            responseText = chatRes.choices[0]?.message?.content?.trim() || "[]";
        } else {
            const genAI = new GoogleGenerativeAI(ai.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            responseText = result.response.text().trim();
        }

        responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');

        // If openAI returned {"options": []} structure
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
        if (parsed && Array.isArray(parsed.options)) return parsed.options.slice(0, 3);
        if (parsed && Array.isArray(parsed.variations)) return parsed.variations.slice(0, 3);
        if (typeof parsed === 'object') return Object.values(parsed).slice(0, 3) as string[];

        return [text]; // fallback
    } catch (error) {
        console.error("AI Rewrite error:", error);
        return [text];
    }
}
