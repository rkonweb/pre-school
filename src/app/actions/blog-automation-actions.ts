'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createBlogPostAction } from "./cms-actions"
import { resolveSchoolAIModel } from "@/lib/school-integrations"

// Fetch Automation Settings
export async function getBlogAutomationSettingsAction() {
    try {
        let settings = await prisma.blogAutomationSettings.findUnique({
            where: { id: 'global' }
        });

        if (!settings) {
            settings = await prisma.blogAutomationSettings.create({
                data: { id: 'global' }
            });
        }

        return { success: true, settings };
    } catch (error) {
        return { success: false, error: 'Failed to fetch settings' };
    }
}

// Update Automation Settings
export async function updateBlogAutomationSettingsAction(data: any) {
    try {
        const settings = await prisma.blogAutomationSettings.upsert({
            where: { id: 'global' },
            create: { ...data, id: 'global' },
            update: data
        });
        revalidatePath('/admin/cms/blog');
        return { success: true, settings };
    } catch (error) {
        return { success: false, error: 'Failed to update settings' };
    }
}

// THE BIG ONE: Automated Generation Logic
export async function triggerAutoBlogGenerationAction(force: boolean = false, clientTimeISO?: string) {
    try {
        console.log(`[Blog AI] Trigger check started. Force: ${force}`);
        const settings = await prisma.blogAutomationSettings.findUnique({
            where: { id: 'global' }
        });

        if (!settings?.isEnabled) {
            console.log("[Blog AI] Skipping: Automation is disabled.");
            return { success: false, error: 'Automation is disabled' };
        }

        // Automated Check Logic
        if (!force) {
            if (!clientTimeISO) {
                console.log("[Blog AI] Skipping: No client time provided for automated check.");
                return { success: false, error: 'No client time provided' };
            }

            const clientNow = new Date(clientTimeISO);
            const [schedH, schedM] = settings.scheduledTime.split(':').map(Number);

            // 1. Calculate the Most Recent Scheduled Occurrence (MRSO)
            const scheduledToday = new Date(clientNow);
            scheduledToday.setHours(schedH, schedM, 0, 0);

            const scheduledYesterday = new Date(clientNow);
            scheduledYesterday.setDate(scheduledYesterday.getDate() - 1);
            scheduledYesterday.setHours(schedH, schedM, 0, 0);

            const mrso = clientNow >= scheduledToday ? scheduledToday : scheduledYesterday;

            console.log(`[Blog AI] Client Time: ${clientNow.toISOString()}`);
            console.log(`[Blog AI] MRSO Candidate: ${mrso.toISOString()}`);
            console.log(`[Blog AI] Last Run: ${settings.lastRunDate?.toISOString() || 'Never'}`);

            const lastRun = settings.lastRunDate ? new Date(settings.lastRunDate) : new Date(0);

            if (lastRun >= mrso) {
                console.log("[Blog AI] Skipping: Already run for the most recent scheduled window.");
                return { success: false, error: 'Already run for this window' };
            }

            console.log("[Blog AI] Proceeding: Scheduled window met and last run is outdated.");
        }

        // Per-school AI model resolution
        // Blog automation targets the first/only school if no slug is available
        const firstSchool = await prisma.school.findFirst({ select: { slug: true } });
        if (!firstSchool?.slug) throw new Error("No school found for blog generation.");

        const { apiKey, provider } = await resolveSchoolAIModel(firstSchool.slug);

        const model = provider === 'openai'
            ? createOpenAI({ apiKey })('gpt-4o-mini')
            : createGoogleGenerativeAI({ apiKey })('gemini-flash-latest');

        // 1. Generate a Topic & Research
        const topicPrompt = `
            Based on these preferred interests: "${settings.preferredTopics}",
            Generate a unique, highly relevant, and trending blog post topic for a preschool/education platform.
            The tone should be ${settings.tone}.
            
            Return ONLY a JSON object with:
            {
                "topic": "The title of the post",
                "brief": "A 2-sentence research summary of what should be covered"
            }
        `;

        const { text: topicJson } = await generateText({
            model,
            prompt: topicPrompt
        });

        const { topic, brief } = JSON.parse(topicJson.replace(/```json|```/g, '').trim());

        // 2. Generate Full Content
        const contentPrompt = `
            Write a professional, heartwarming, and SEO-optimized blog post about: "${topic}".
            Context: ${brief}.
            Tone: ${settings.tone}.
            
            Return ONLY a JSON object with:
            {
                "title": "${topic}",
                "excerpt": "A catchy 2-line summary",
                "content": "Full HTML content using semantic tags (h2, p, strong, ul, li). Do NOT use h1.",
                "tags": ["Tag1", "Tag2"],
                "metaTitle": "SEO optimized title",
                "metaDescription": "SEO description under 160 chars",
                "imagePrompt": "A highly detailed AI image generation prompt for a professional header image (DALL-E style)"
            }
        `;

        const { text: contentJson } = await generateText({
            model,
            prompt: contentPrompt
        });

        const postData = JSON.parse(contentJson.replace(/```json|```/g, '').trim());

        // 3. Create the Blog Post
        // Note: For coverImage, we'll use a placeholder or Unsplash based on the prompt for now 
        // until we add a dedicated DALL-E action.
        const res = await createBlogPostAction({
            title: postData.title,
            slug: postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            excerpt: postData.excerpt,
            content: postData.content,
            isPublished: true,
            publishedAt: new Date(),
            tags: JSON.stringify(postData.tags),
            metaTitle: postData.metaTitle,
            metaDescription: postData.metaDescription,
            coverImage: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop` // Default professional school image
        });

        if (res.success) {
            await prisma.blogAutomationSettings.update({
                where: { id: 'global' },
                data: { lastRunDate: new Date() }
            });
            revalidatePath('/blog');
            revalidatePath('/admin/cms/blog');
            return { success: true, post: res.post };
        }

        return res;

    } catch (error: any) {
        console.error("Auto Generation Failed:", error);
        return { success: false, error: error.message };
    }
}

// NEW: True Server-Side Autonomous Trigger
export async function triggerServerAutoBlogAction() {
    try {
        console.log("[Blog AI Server] Independent cron check started.");

        const school = await prisma.school.findFirst({ select: { timezone: true } });
        const timezone = school?.timezone || 'UTC';

        const settings = await prisma.blogAutomationSettings.findUnique({
            where: { id: 'global' }
        });

        if (!settings?.isEnabled) return { success: false, error: 'Automation is disabled' };

        // 1. Calculate "Now" in School Scale
        const now = new Date();
        const fmt = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        });
        const parts = fmt.formatToParts(now);
        const getV = (t: string) => parts.find(p => p.type === t)?.value || "0";

        // Sanitize Hour: Some environments/locales return 24 for midnight
        let hour = parseInt(getV('hour'));
        if (hour === 24) hour = 0;

        // "Local Scale Now" (LSN): A Date object representing the numbers in the target TZ
        const lsn = new Date(
            parseInt(getV('year')),
            parseInt(getV('month')) - 1,
            parseInt(getV('day')),
            hour,
            getV('minute') === "0" ? 0 : parseInt(getV('minute')),
            getV('second') === "0" ? 0 : parseInt(getV('second'))
        );

        const [schedH, schedM] = settings.scheduledTime.split(':').map(Number);

        // 2. Calculate Most Recent Scheduled Occurrence (MRSO) in Local Scale
        const scheduledToday = new Date(lsn);
        scheduledToday.setHours(schedH, schedM, 0, 0);

        const scheduledYesterday = new Date(lsn);
        scheduledYesterday.setDate(scheduledYesterday.getDate() - 1);
        scheduledYesterday.setHours(schedH, schedM, 0, 0);

        const mrso_ls = lsn >= scheduledToday ? scheduledToday : scheduledYesterday;

        // 3. Convert Last Run Date to Local Scale for comparison
        // We need to see what time it was IN THE SCHOOL TZ when it last ran.
        let lastRun_ls = new Date(0);
        if (settings.lastRunDate) {
            const lrParts = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
            }).formatToParts(settings.lastRunDate);
            const getLRV = (t: string) => lrParts.find(p => p.type === t)?.value || "0";
            let lrHour = parseInt(getLRV('hour'));
            if (lrHour === 24) lrHour = 0;

            lastRun_ls = new Date(
                parseInt(getLRV('year')),
                parseInt(getLRV('month')) - 1,
                parseInt(getV('day')), // Use current day context since we are comparing same-day logic
                lrHour,
                parseInt(getLRV('minute')),
                parseInt(getLRV('second'))
            );
        }

        console.log(`[Blog AI Server] TZ: ${timezone} | LSN: ${lsn.toISOString()} | MRSO_LS: ${mrso_ls.toISOString()} | LastRun_LS: ${lastRun_ls.toISOString()}`);

        // 4. Decision: If Last Run (Local Scale) is before the MRSO (Local Scale), we are due!
        if (lastRun_ls < mrso_ls) {
            console.log("[Blog AI Server] Condition Met: Triggering generation...");
            return await triggerAutoBlogGenerationAction(true); // Force run
        }

        console.log("[Blog AI Server] Skipping: Already run for the latest scheduled window.");
        return { success: false, error: 'Already run for this window' };

    } catch (error: any) {
        console.error("[Blog AI Server] Error:", error);
        return { success: false, error: error.message };
    }
}
