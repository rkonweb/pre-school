import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getStudentContext } from "@/lib/jarvis";
import { prisma } from "@/lib/prisma";

// Set runtime to edge for best performance
export const maxDuration = 30;

export async function POST(req: Request) {
    const payload = await req.json();
    console.log("Jarvis API Request Payload:", JSON.stringify(payload, null, 2));
    const { messages: rawMessages, studentId } = payload;

    // 1. Get API Key from System Settings
    const settings = await prisma.systemSettings.findUnique({
        where: { id: 'global' }
    });

    const configRes = (settings as any)?.integrationsConfig;
    if (!configRes) {
        throw new Error("AI integrations are not configured in Admin Settings.");
    }

    const config = JSON.parse(configRes);
    const apiKey = config.openAiKey;

    if (!apiKey) {
        throw new Error(`OpenAI API Key is missing. Please configure it in Settings.`);
    }

    // Initialize OpenAI with database-stored key
    const openaiProvider = createOpenAI({ apiKey });

    // Normalize messages for AI SDK v6 (CoreMessage schema)
    const messages = (rawMessages || []).map((m: any) => ({
        role: m.role,
        content: m.content || (m.parts && m.parts[0]?.text) || ""
    }));

    // Fetch context if studentId is provided
    let systemContext = "";
    if (studentId) {
        const studentData = await getStudentContext(studentId);
        if (studentData) {
            systemContext = `
You are Jarvis, a helpful and friendly AI assistant for the "Pre-School" parent app.
Your goal is to help parents stay updated on their child's progress, answer questions about school activities, and provide insights.

Here is the context for the current student:
${studentData}

Guidelines:
- Be concise, friendly, and encouraging.
- Refer to the student by name.
- If asking about data not present (e.g., "What did they eat for lunch?" if not in diary), politely say you don't have that specific record yet.
- Focus on the provided context but you can answer general parenting or educational questions too.
- Use emojis sparingly to be friendly.
        `.trim();
        }
    }

    const result = await streamText({
        model: openaiProvider("gpt-3.5-turbo"),
        messages,
        system: systemContext || "You are a helpful AI assistant for a school parent app.",
    });

    return result.toUIMessageStreamResponse();
}
