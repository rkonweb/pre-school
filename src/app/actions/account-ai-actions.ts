'use server';

import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { TransactionStatus } from '@/lib/types/accounts';

export async function generateAccountInsights(slug: string, financialYearId?: string) {
    // Look up school by slug — resolves both the ID and the API key together
    const school = await (prisma as any).school.findUnique({
        where: { slug },
        select: { id: true, integrationsConfig: true }
    });

    if (!school) return { error: "School not found." };
    const schoolId = school.id;

    // Resolve API key from per-school integrationsConfig (saved via Settings → Integrations)
    let apiKey = process.env.OPENAI_API_KEY || '';
    try {
        if (school.integrationsConfig) {
            const config = JSON.parse(school.integrationsConfig);
            if (config.ai?.openaiKey) apiKey = config.ai.openaiKey;
        }
    } catch { /* ignore parse errors */ }

    if (!apiKey) {
        return { error: "AI insights are unavailable: OpenAI API key is not configured. Add it in Settings → Integrations." };
    }

    try {
        // 1. Fetch relevant financial data
        let activeYearId = financialYearId;
        if (!activeYearId) {
            const activeYear = await prisma.accountFinancialYear.findFirst({
                where: { schoolId, isActive: true }
            });
            if (!activeYear) return { error: "No active financial year found." };
            activeYearId = activeYear.id;
        }

        const transactions = await prisma.accountTransaction.findMany({
            where: {
                schoolId,
                financialYearId: activeYearId,
                status: TransactionStatus.COMPLETED
            },
            include: {
                category: true,
                vendor: true,
            },
            orderBy: { date: 'desc' },
            take: 100 // Limit to recent 100 for context size
        });

        if (transactions.length === 0) {
            return { message: "Not enough data to generate insights." };
        }

        // 2. Prepare data for the prompt
        const strippedTxns = transactions.map(t => ({
            no: t.transactionNo,
            type: t.type,
            amount: t.amount,
            date: t.date.toISOString().split('T')[0],
            method: t.paymentMethod,
            category: t.category.name,
            vendor: t.vendor?.name || 'N/A',
            title: t.title
        }));

        const prompt = `You are an expert financial auditor and AI analyst for a school management system.
Analyze the following recent transactions (up to 100) for a school.

Data:
${JSON.stringify(strippedTxns, null, 2)}

Task:
Provide a concise financial report in JSON format with the following exact keys:
{
  "summary": "A 2-3 sentence overview of the financial health based on this data.",
  "anomalies": [
     { "issue": "describe the potential issue (e.g., duplicate payment, very high expense for category)", "transactionNo": "TXN-XXX or N/A" }
  ],
  "recommendations": [
     "Actionable advice 1",
     "Actionable advice 2"
  ]
}

Ensure the output is strictly valid JSON without markdown wrapping or code fences. If no anomalies are found, return an empty array for anomalies.`;

        // 3. Call OpenAI API
        const model = createOpenAI({ apiKey })('gpt-4o-mini');

        const { text: reportText } = await generateText({
            model,
            messages: [{ role: 'user', content: prompt }]
        });

        if (!reportText) {
            return { error: "AI failed to generate a response." };
        }

        return JSON.parse(reportText);

    } catch (error) {
        console.error("AI Insight Gen Error:", error);
        return { error: "Failed to generate AI insights. Check server logs." };
    }
}
