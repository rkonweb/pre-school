"use server";

import { prisma } from "@/lib/prisma";

export async function calculateLeadScore(id: string, customWeights?: any): Promise<number> {
    // Try to find as Lead first, then Admission
    let data: any = await prisma.lead.findUnique({
        where: { id },
        include: { school: { include: { aiSettings: true } } }
    });

    if (!data) {
        data = await (prisma as any).admission.findUnique({
            where: { id },
            include: { school: { include: { aiSettings: true } } }
        });
    }

    if (!data || !data.school) return 0;

    const settings = data.school.aiSettings;
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

    // Map Admission fields to Lead-style internal vars for scoring
    const firstResponseTime = data.firstResponseTime ?? null;
    const tourStatus = data.tourStatus || 'NONE';
    const repliesCount = data.repliesCount || 0;
    const distanceConcern = data.distanceConcern ?? null;
    const feeConcernLevel = data.feeConcernLevel || 'NONE';
    const callConnectedCount = data.callConnectedCount || 0;
    const linkClicks = data.linkClicks || 0;

    // 1. Responsiveness (0-100)
    let responsiveness = 0;
    if (firstResponseTime) {
        if (firstResponseTime < 15) responsiveness = 100;
        else if (firstResponseTime < 60) responsiveness = 80;
        else if (firstResponseTime < 360) responsiveness = 60;
        else if (firstResponseTime < 1440) responsiveness = 40;
        else responsiveness = 20;
    } else {
        responsiveness = 50; // Neutral if unknown
    }

    // 2. Program Interest (0-100)
    let interest = 0;
    if (tourStatus === 'COMPLETED') interest = 100;
    else if (tourStatus === 'SCHEDULED') interest = 80;
    else if (repliesCount > 5) interest = 70;
    else if (repliesCount > 2) interest = 50;
    else interest = 30;

    // 3. Location (0-100)
    let location = 50;
    if (distanceConcern === false) location = 100;
    if (distanceConcern === true) location = 20;

    // 4. Budget (0-100)
    let budget = 60;
    if (feeConcernLevel === 'NONE') budget = 100;
    else if (feeConcernLevel === 'MILD') budget = 60;
    else if (feeConcernLevel === 'STRONG') budget = 20;

    // 5. Engagement (0-100)
    const interactions = (callConnectedCount * 20) + (linkClicks * 15) + (repliesCount * 10);
    let engagement = Math.min(100, interactions);

    // Calculate final weighted score
    const weightedScore = (
        (responsiveness * (weights.responsiveness / 100)) +
        (interest * (weights.programInterest / 100)) +
        (location * (weights.location / 100)) +
        (budget * (weights.budget / 100)) +
        (engagement * (weights.engagement / 100))
    );

    // Apply Decay
    const lastAction = data.lastMeaningfulActionAt || data.createdAt;
    const daysSinceLastAction = Math.floor((Date.now() - new Date(lastAction).getTime()) / (1000 * 60 * 60 * 24));
    let decayFactor = 1;

    if (daysSinceLastAction >= 30) decayFactor = 0.5;
    else if (daysSinceLastAction >= 15) decayFactor = 0.7;
    else if (daysSinceLastAction >= 7) decayFactor = 0.85;

    const finalScore = Math.max(0, Math.min(100, weightedScore * decayFactor));

    return Math.round(finalScore);
}

export async function refreshLeadScoreAction(id: string) {
    const score = await calculateLeadScore(id);

    // Update both if applicable (usually one will fail or we check existence)
    try {
        await prisma.lead.update({
            where: { id: id },
            data: { score }
        });
    } catch (e) {
        try {
            await (prisma as any).admission.update({
                where: { id: id },
                data: { score }
            });
        } catch (e2) {
            console.error("Failed to update score for any model:", id);
        }
    }
    return score;
}

