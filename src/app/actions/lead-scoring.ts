"use server";

import { prisma } from "@/lib/prisma";

export async function calculateLeadScore(leadId: string, customWeights?: any): Promise<number> {
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
            school: {
                include: { aiSettings: true }
            }
        }
    });

    if (!lead || !lead.school) return 0;

    const settings = lead.school.aiSettings;
    let weights = customWeights || {
        responsiveness: 30,
        programInterest: 25,
        location: 15,
        budget: 20,
        engagement: 10
    };

    if (!customWeights && settings && settings.weights) {
        try {
            weights = JSON.parse(settings.weights);
        } catch (e) {
            console.error("Error parsing AI weights:", e);
        }
    }

    // 1. Responsiveness (0-100)
    let responsiveness = 0;
    if (lead.firstResponseTime) {
        if (lead.firstResponseTime < 15) responsiveness = 100;
        else if (lead.firstResponseTime < 60) responsiveness = 80;
        else if (lead.firstResponseTime < 360) responsiveness = 60;
        else if (lead.firstResponseTime < 1440) responsiveness = 40;
        else responsiveness = 20;
    } else {
        responsiveness = 50; // Neutral if unknown
    }

    // 2. Program Interest (0-100)
    let interest = 0;
    if (lead.tourStatus === 'COMPLETED') interest = 100;
    else if (lead.tourStatus === 'SCHEDULED') interest = 80;
    else if (lead.repliesCount > 5) interest = 70;
    else if (lead.repliesCount > 2) interest = 50;
    else interest = 30;

    // 3. Location (0-100)
    let location = 50;
    if (lead.distanceConcern === false) location = 100;
    if (lead.distanceConcern === true) location = 20;

    // 4. Budget (0-100)
    let budget = 60;
    if (lead.feeConcernLevel === 'NONE') budget = 100;
    else if (lead.feeConcernLevel === 'MILD') budget = 60;
    else if (lead.feeConcernLevel === 'STRONG') budget = 20;

    // 5. Engagement (0-100)
    let engagement = 0;
    const interactions = (lead.callConnectedCount * 20) + (lead.linkClicks * 15) + (lead.repliesCount * 10);
    engagement = Math.min(100, interactions);

    // Calculate final weighted score
    const weightedScore = (
        (responsiveness * (weights.responsiveness / 100)) +
        (interest * (weights.programInterest / 100)) +
        (location * (weights.location / 100)) +
        (budget * (weights.budget / 100)) +
        (engagement * (weights.engagement / 100))
    );

    // Apply Decay
    const lastAction = lead.lastMeaningfulActionAt || lead.createdAt;
    const daysSinceLastAction = Math.floor((Date.now() - new Date(lastAction).getTime()) / (1000 * 60 * 60 * 24));
    let decayFactor = 1;

    if (daysSinceLastAction >= 30) decayFactor = 0.5;
    else if (daysSinceLastAction >= 15) decayFactor = 0.7;
    else if (daysSinceLastAction >= 7) decayFactor = 0.85;

    const finalScore = Math.max(0, Math.min(100, weightedScore * decayFactor));

    return Math.round(finalScore);
}

export async function refreshLeadScoreAction(leadId: string) {
    const score = await calculateLeadScore(leadId);
    await prisma.lead.update({
        where: { id: leadId },
        data: { score }
    });
    return score;
}

