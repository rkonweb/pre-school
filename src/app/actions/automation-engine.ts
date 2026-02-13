"use server";

import { prisma } from "@/lib/prisma";
import { refreshLeadScoreAction } from "./lead-scoring";

export async function triggerAutomationWorkflow(leadId: string, triggerType: 'NEW_LEAD' | 'STATUS_CHANGE' | 'TOUR_SCHEDULED' | 'TOUR_COMPLETED' | 'NO_ANSWER') {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { school: true }
        });

        if (!lead) return;

        // Refresh score first
        const score = await refreshLeadScoreAction(leadId);

        // Determine score band
        let band = 'COLD';
        if (score >= 80) band = 'HOT';
        else if (score >= 60) band = 'WARM';
        else if (score >= 40) band = 'COOL';

        switch (triggerType) {
            case 'NEW_LEAD':
                await simulateWhatsAppSend(leadId, "Instant WhatsApp welcome message", band);
                // Create first follow-up task
                await prisma.followUp.create({
                    data: {
                        leadId,
                        type: 'CALL',
                        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // Within 2 hours
                        notes: 'First follow-up call'
                    }
                });
                break;
            case 'TOUR_SCHEDULED':
                await simulateWhatsAppSend(leadId, "Tour confirmation message", band);
                break;
            case 'TOUR_COMPLETED':
                await simulateWhatsAppSend(leadId, "Post-visit thank you message", band);
                break;
            case 'NO_ANSWER':
                await simulateWhatsAppSend(leadId, "Auto WhatsApp after missed call", band);
                break;
        }

        // Log interaction
        await prisma.leadInteraction.create({
            data: {
                leadId,
                type: 'AUTOMATION',
                content: `Automation triggered: ${triggerType} (Band: ${band})`,
            }
        });

    } catch (error) {
        console.error("Automation Trigger Error:", error);
    }
}

async function simulateWhatsAppSend(leadId: string, templateType: string, band: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return;

    // SIMULATE WHATSAPP SENDING
    console.log(`[WHATSAPP AUTOMATION] To: ${lead.mobile} | Template: ${templateType} | Band: ${band}`);

    // Log interaction
    await prisma.leadInteraction.create({
        data: {
            leadId,
            type: 'WHATSAPP_MSG',
            content: `Automated WhatsApp sent: ${templateType}`,
        }
    });

    // Update read status for simulation
    setTimeout(async () => {
        await prisma.lead.update({
            where: { id: leadId },
            data: { whatsappRead: true }
        });
    }, 5000);
}

export async function escalateMissedTasksAction(schoolId: string) {
    try {
        const overdueTasks = await prisma.followUp.findMany({
            where: {
                status: 'PENDING',
                scheduledAt: { lt: new Date() },
                lead: { schoolId }
            },
            include: { lead: true }
        });

        for (const task of overdueTasks) {
            // Check for escalation (e.g., 2 missed follow-ups)
            // Implementation detail: check lead interactions for missed attempts
            console.log(`[ESCALATION] Task ${task.id} for lead ${task.lead.parentName} is overdue.`);

            // Trigger Manager alert (Simulated)
            await prisma.leadInteraction.create({
                data: {
                    leadId: task.leadId,
                    type: 'AUTOMATION',
                    content: `Escalation: Task ${task.type} is overdue. Manager alerted.`,
                }
            });
        }
    } catch (error) {
        console.error("Escalation Error:", error);
    }
}
