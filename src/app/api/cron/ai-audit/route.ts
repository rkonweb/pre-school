import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure this route doesn't get statically cached
export const dynamic = "force-dynamic";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function GET(request: Request) {
    if (!genAI) {
        return NextResponse.json({ success: false, error: "GEMINI_API_KEY not configured." }, { status: 500 });
    }

    try {
        // Fetch up to 30 pending audit logs that haven't been analyzed yet
        const pendingLogs = await prisma.auditLog.findMany({
            where: {
                aiAnalysis: null,
            },
            take: 30,
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                user: {
                    select: { firstName: true, lastName: true, role: true, email: true }
                }
            }
        });

        if (pendingLogs.length === 0) {
            return NextResponse.json({ success: true, message: "No pending logs to analyze." });
        }

        // Format logs for AI prompt
        const logData = pendingLogs.map(log => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            userId: log.userId,
            userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown',
            userRole: log.user?.role || 'UNKNOWN',
            details: log.details,
            createdAt: log.createdAt.toISOString()
        }));

        const prompt = `
You are an AI Security and Audit Analyst for an ERP platform.
Review the following batch of system activity logs and identify any suspicious behavior.

Look for anomalies such as:
- Mass deletions or exports.
- Unauthorized access attempts or role escalations.
- Changes made outside of typical school hours (usually 8 AM - 6 PM).
- Suspicious login attempts (e.g., multiple failures followed by a success).
- Deleting critical business records.
- Any other data modification that seems unusual for a standard school environment.

Assign a riskScore from 0 (completely safe/routine) to 100 (highly critical/malicious).
Flag 'isSuspicious' as true if the riskScore is > 60.
Provide a brief 'aiAnalysis' reasoning for your score.

Input Logs (JSON):
${JSON.stringify(logData, null, 2)}

Output exactly valid JSON in this format, and nothing else (do not include markdown ticks, just raw JSON array of objects):
[
  {
    "id": "log_id_here",
    "riskScore": 0,
    "isSuspicious": false,
    "aiAnalysis": "Routine login activity."
  }
]
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        // Remove markdown formatting if present
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let analysisResults = [];

        try {
            analysisResults = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            
            // Mark these logs as failed to analyze temporarily, or leave null to retry
            // For now, let's set them with a default so we don't infinitely retry the same broken batch
            for (const log of pendingLogs) {
                await prisma.auditLog.update({
                    where: { id: log.id },
                    data: { aiAnalysis: "AI Analysis Parse Error" }
                });
            }

            return NextResponse.json({ success: false, error: "Failed to parse AI response" }, { status: 500 });
        }

        // Update database with results
        let updateCount = 0;
        
        if (Array.isArray(analysisResults)) {
            for (const res of analysisResults) {
                if (!res.id || typeof res.riskScore !== 'number') continue;
                
                await prisma.auditLog.update({
                    where: { id: res.id },
                    data: {
                        riskScore: res.riskScore,
                        isSuspicious: !!res.isSuspicious,
                        aiAnalysis: res.aiAnalysis || "Analyzed by AI"
                    }
                });
                updateCount++;
            }
        }

        return NextResponse.json({ success: true, processedCount: updateCount });

    } catch (error: any) {
        console.error("AI Audit Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
