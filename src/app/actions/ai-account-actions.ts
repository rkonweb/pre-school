'use server';

import { prisma } from '@/lib/prisma';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { TransactionStatus } from '@/lib/types/accounts';
import { resolveSchoolAIModel } from '@/lib/school-integrations';

export async function generateAccountInsights(schoolSlug: string) {
    const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
    if (!school) return { success: false, error: "School not found" };

    try {
        const aiConfig = await resolveSchoolAIModel(schoolSlug);
        const aiModel = aiConfig.provider === 'google'
            ? createGoogleGenerativeAI({ apiKey: aiConfig.apiKey })('gemini-2.5-flash')
            : createOpenAI({ apiKey: aiConfig.apiKey })('gpt-4o-mini');

        // Fetch last 100 transactions to give AI some context without blowing up tokens
        const txns = await prisma.accountTransaction.findMany({
            where: { schoolId: school.id, status: TransactionStatus.COMPLETED },
            take: 100,
            orderBy: { date: 'desc' },
            select: {
                id: true,
                amount: true,
                type: true,
                date: true,
                description: true,
                transactionNo: true,
                category: { select: { name: true } },
                vendor: { select: { name: true } }
            }
        });

        if (txns.length === 0) {
            return { success: false, error: "Not enough data for insights" };
        }

        // Simplify payload for AI
        const payload = txns.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            date: t.date.toISOString().split('T')[0],
            desc: t.description || 'No desc',
            cat: t.category?.name || 'Uncategorized',
            vendor: t.vendor?.name || 'No vendor'
        }));

        const prompt = `
        You are an expert strict financial auditor and AI Data Analyst for a school. 
        Analyze the following recent 100 transactions and provide two things:
        1. A list of 3 high-level actionable and interesting business insights. (e.g. "Most of your expenses are in Transportation", or "Revenue is stable this month.")
        2. A list of explicitly "suspicious" or "anomalous" transactions that an admin should review. 
           Flag transactions if they:
           - Are unusually large round or un-rounded numbers that look like typos or fat-finger mistakes.
           - Are manual expenses on weekends (Saturday/Sunday).
           - Have weird, explicit, or suspicious descriptions/categories like "Misc", "Unknown", or random characters.
           - Only return suspicious transactions IF you truly believe they are anomalies.

        Here is the JSON data of transactions:
        ${JSON.stringify(payload)}
        `;

        const { object } = await generateObject({
            model: aiModel,
            schema: z.object({
                insights: z.array(z.string()).describe("A list of 3 string sentences containing financial insights."),
                suspiciousTransactions: z.array(z.object({
                    transactionId: z.string(),
                    reason: z.string().describe("A short explanation of why this is flagged as suspicious.")
                })).describe("A list of flagged transaction IDs and the reason. Can be empty if all looks perfectly normal.")
            }),
            prompt: prompt,
        });

        return { success: true, data: object };

    } catch (e: any) {
        console.error("AI Insight Error:", e);
        return { success: false, error: e.message || "Failed to generate AI insights" };
    }
}
