'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

interface CMSUpsertData {
    sectionKey: string;
    title?: string;
    subtitle?: string;
    content: string;
    isEnabled?: boolean;
    sortOrder?: number;
}


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await wait(delay);
        return withRetry(fn, retries - 1, delay * 2);
    }
}

// --- CMS Pages ---

export async function getCMSPagesAction() {
    return withRetry(() => prisma.cMSPage.findMany({
        orderBy: { updatedAt: 'desc' }
    }));
}

export async function getCMSPageBySlugAction(slug: string) {
    return withRetry(() => prisma.cMSPage.findUnique({
        where: { slug, isPublished: true }
    }));
}

export async function createCMSPageAction(data: { title: string, slug: string, content: string, metaTitle?: string, metaDescription?: string }) {
    try {
        const page = await prisma.cMSPage.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                isPublished: true // Auto-publish for now
            }
        });
        revalidatePath('/admin/cms/pages');
        return { success: true, page };
    } catch (error) {
        return { success: false, error: 'Failed to create page' };
    }
}

export async function updateCMSPageAction(id: string, data: any) {
    try {
        const page = await prisma.cMSPage.update({
            where: { id },
            data
        });
        revalidatePath('/admin/cms/pages');
        return { success: true, page };
    } catch (error) {
        return { success: false, error: 'Failed to update page' };
    }
}

export async function deleteCMSPageAction(id: string) {
    try {
        await prisma.cMSPage.delete({ where: { id } });
        revalidatePath('/admin/cms/pages');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete page' };
    }
}

// --- Blog Posts ---

// For public pages - only published posts
export async function getBlogPostsAction() {
    return withRetry(() => prisma.blogPost.findMany({
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        where: { isPublished: true }
    }));
}

// For admin CMS - ALL posts including drafts
export async function getAllBlogPostsAction() {
    return withRetry(() => prisma.blogPost.findMany({
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    }));
}

export async function getBlogPostBySlugAction(slug: string) {
    return withRetry(() => prisma.blogPost.findUnique({
        where: { slug },
        include: { author: { select: { firstName: true, lastName: true } } }
    }));
}

export async function createBlogPostAction(data: any, authorId?: string) {
    try {
        let finalAuthorId = authorId;

        if (!finalAuthorId) {
            // Find the first ADMIN user to assign as author
            let adminUser = await prisma.user.findFirst({
                where: { role: 'ADMIN' }
            });

            // If no admin user exists, create a default one for blog authorship
            if (!adminUser) {
                adminUser = await prisma.user.create({
                    data: {
                        mobile: '0000000000',
                        firstName: 'Bodhi',
                        lastName: 'Board',
                        email: 'admin@bodhiboard.in',
                        role: 'ADMIN',
                        status: 'ACTIVE'
                    }
                });
            }

            finalAuthorId = adminUser.id;
        }

        const post = await prisma.blogPost.create({
            data: {
                ...data,
                authorId: finalAuthorId,
                isPublished: true
            }
        });
        revalidatePath('/admin/cms/blog');
        return { success: true, post };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to create post' };
    }
}

export async function deleteBlogPostAction(id: string) {
    try {
        await prisma.blogPost.delete({ where: { id } });
        revalidatePath('/admin/cms/blog');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete post' };
    }
}

// --- Job Postings ---

export async function getJobPostingsAction() {
    return withRetry(() => prisma.jobPosting.findMany({
        orderBy: { createdAt: 'desc' }
    }));
}

export async function createJobPostingAction(data: any) {
    try {
        await prisma.jobPosting.create({ data });
        revalidatePath('/admin/cms/careers');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to create job' };
    }
}

export async function updateJobPostingAction(id: string, data: any) {
    try {
        await prisma.jobPosting.update({
            where: { id },
            data
        });
        revalidatePath('/admin/cms/careers');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update job' };
    }
}

export async function deleteJobPostingAction(id: string) {
    try {
        await prisma.jobPosting.delete({ where: { id } });
        revalidatePath('/admin/cms/careers');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete job' };
    }
}

// --- Homepage Content ---

export async function getHomepageContentAction() {
    return withRetry(() => prisma.homepageContent.findMany({
        orderBy: { sortOrder: 'asc' }
    }));
}

export async function getHomepageSectionAction(sectionKey: string) {
    return withRetry(() => prisma.homepageContent.findUnique({
        where: { sectionKey }
    }));
}

export async function upsertHomepageSectionAction(data: {
    sectionKey: string;
    title?: string;
    subtitle?: string;
    content: string;
    isEnabled?: boolean;
    sortOrder?: number;
}) {
    try {
        const section = await prisma.homepageContent.upsert({
            where: { sectionKey: data.sectionKey },
            create: {
                sectionKey: data.sectionKey,
                title: data.title,
                subtitle: data.subtitle,
                content: data.content,
                isEnabled: data.isEnabled ?? true,
                sortOrder: data.sortOrder ?? 0
            },
            update: {
                title: data.title,
                subtitle: data.subtitle,
                content: data.content,
                isEnabled: data.isEnabled,
                sortOrder: data.sortOrder
            }
        });
        revalidatePath('/');
        revalidatePath('/admin/cms/homepage');
        return { success: true, section };
    } catch (error) {
        console.error('Failed to upsert homepage section:', error);
        return { success: false, error: 'Failed to save homepage section' };
    }
}

export async function deleteHomepageSectionAction(id: string) {
    try {
        await prisma.homepageContent.delete({ where: { id } });
        revalidatePath('/');
        revalidatePath('/admin/cms/homepage');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete section' };
    }
}

export async function toggleHomepageSectionAction(id: string, isEnabled: boolean) {
    try {
        await prisma.homepageContent.update({
            where: { id },
            data: { isEnabled }
        });
        revalidatePath('/');
        revalidatePath('/admin/cms/homepage');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to toggle section' };
    }
}

// --- Features Page Content ---

export async function getFeaturesPageContentAction() {
    return withRetry(() => prisma.featuresPageContent.findMany({
        orderBy: { sortOrder: 'asc' }
    }));
}

export async function getFeaturesSectionAction(sectionKey: string) {
    return withRetry(() => prisma.featuresPageContent.findUnique({
        where: { sectionKey }
    }));
}

export async function upsertFeaturesSectionAction(data: {
    sectionKey: string;
    title?: string;
    subtitle?: string;
    content: string;
    isEnabled?: boolean;
    sortOrder?: number;
}) {
    try {
        const section = await prisma.featuresPageContent.upsert({
            where: { sectionKey: data.sectionKey },
            create: {
                sectionKey: data.sectionKey,
                title: data.title,
                subtitle: data.subtitle,
                content: data.content,
                isEnabled: data.isEnabled ?? true,
                sortOrder: data.sortOrder ?? 0
            },
            update: {
                title: data.title,
                subtitle: data.subtitle,
                content: data.content,
                isEnabled: data.isEnabled,
                sortOrder: data.sortOrder
            }
        });
        revalidatePath('/features');
        revalidatePath('/admin/cms/features');
        return { success: true, section };
    } catch (error) {
        console.error('Failed to upsert features section:', error);
        return { success: false, error: 'Failed to save features section' };
    }
}

export async function deleteFeaturesSectionAction(id: string) {
    try {
        await prisma.featuresPageContent.delete({ where: { id } });
        revalidatePath('/features');
        revalidatePath('/admin/cms/features');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete section' };
    }
}

export async function toggleFeaturesSectionAction(id: string, isEnabled: boolean) {
    try {
        await prisma.featuresPageContent.update({
            where: { id },
            data: { isEnabled }
        });
        revalidatePath('/features');
        revalidatePath('/admin/cms/features');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to toggle section' };
    }
}

// --- Pricing Page Content ---

export async function getPricingPageContentAction() {
    return withRetry(() => prisma.pricingPageContent.findMany({ orderBy: { sortOrder: 'asc' } }));
}

export async function upsertPricingSectionAction(data: CMSUpsertData) {
    try {
        const section = await prisma.pricingPageContent.upsert({
            where: { sectionKey: data.sectionKey },
            create: {
                sectionKey: data.sectionKey,
                title: data.title ?? null,
                subtitle: data.subtitle ?? null,
                content: data.content,
                isEnabled: data.isEnabled ?? true,
                sortOrder: data.sortOrder ?? 0
            },
            update: {
                title: data.title,
                subtitle: data.subtitle,
                content: data.content,
                isEnabled: data.isEnabled,
                sortOrder: data.sortOrder
            }
        });
        revalidatePath('/pricing');
        revalidatePath('/admin/cms/pricing');
        return { success: true, section };
    } catch (error) {
        return { success: false, error: 'Failed to save section' };
    }
}

export async function togglePricingSectionAction(id: string, isEnabled: boolean) {
    try {
        await prisma.pricingPageContent.update({ where: { id }, data: { isEnabled } });
        revalidatePath('/pricing');
        revalidatePath('/admin/cms/pricing');
        return { success: true };
    } catch { return { success: false, error: 'Failed' }; }
}

// --- Careers Page Content ---

export async function getCareersPageContentAction() {
    return withRetry(() => prisma.careersPageContent.findMany({ orderBy: { sortOrder: 'asc' } }));
}

export async function upsertCareersSectionAction(data: CMSUpsertData) {
    try {
        await prisma.careersPageContent.upsert({
            where: { sectionKey: data.sectionKey },
            create: {
                sectionKey: data.sectionKey,
                title: data.title ?? null,
                subtitle: data.subtitle ?? null,
                content: data.content,
                isEnabled: data.isEnabled ?? true,
                sortOrder: data.sortOrder ?? 0
            },
            update: { ...data }
        });
        revalidatePath('/careers');
        revalidatePath('/admin/cms/careers');
        return { success: true };
    } catch { return { success: false, error: 'Failed' }; }
}

export async function toggleCareersSectionAction(id: string, isEnabled: boolean) {
    try {
        await prisma.careersPageContent.update({ where: { id }, data: { isEnabled } });
        revalidatePath('/careers');
        revalidatePath('/admin/cms/careers');
        return { success: true };
    } catch { return { success: false, error: 'Failed' }; }
}

// --- Blog Page Content ---

export async function getBlogPageContentAction() {
    return withRetry(() => prisma.blogPageContent.findMany({ orderBy: { sortOrder: 'asc' } }));
}

export async function upsertBlogSectionAction(data: CMSUpsertData) {
    try {
        await prisma.blogPageContent.upsert({
            where: { sectionKey: data.sectionKey },
            create: {
                sectionKey: data.sectionKey,
                title: data.title ?? null,
                subtitle: data.subtitle ?? null,
                content: data.content,
                isEnabled: data.isEnabled ?? true,
                sortOrder: data.sortOrder ?? 0
            },
            update: { ...data }
        });
        revalidatePath('/blog');
        revalidatePath('/admin/cms/blog');
        return { success: true };
    } catch { return { success: false, error: 'Failed' }; }
}

// --- Contact Page Content ---

export async function getContactPageContentAction() {
    return withRetry(() => prisma.contactPageContent.findMany({ orderBy: { sortOrder: 'asc' } }));
}

export async function upsertContactSectionAction(data: CMSUpsertData) {
    try {
        await prisma.contactPageContent.upsert({
            where: { sectionKey: data.sectionKey },
            create: {
                sectionKey: data.sectionKey,
                title: data.title ?? null,
                subtitle: data.subtitle ?? null,
                content: data.content,
                isEnabled: data.isEnabled ?? true,
                sortOrder: data.sortOrder ?? 0
            },
            update: { ...data }
        });
        revalidatePath('/contact');
        revalidatePath('/admin/cms/contact');
        return { success: true };
    } catch { return { success: false, error: 'Failed' }; }
}
