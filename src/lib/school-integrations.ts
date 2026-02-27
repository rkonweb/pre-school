/**
 * Per-School Integration Config Helper
 *
 * Each school stores its own API keys in `school.integrationsConfig` (JSON).
 * This helper resolves keys from the per-school config, with no fallback to
 * global/super-admin settings, ensuring full isolation between schools.
 *
 * Config structure (saved by /s/[slug]/settings/integrations page):
 * {
 *   ai:          { enabled, openaiKey, geminiKey, defaultModel }
 *   whatsapp:    { enabled, provider, apiKey, phoneId, businessId }
 *   sms:         { enabled, provider, apiKey, senderId }
 *   payment:     { enabled, provider, key, secret }
 *   email:       { enabled, host, port, user, pass, from }
 *   maps:        { enabled, apiKey }
 *   zoom:        { enabled, clientId, clientSecret, accountId }
 *   storage:     { enabled, provider, bucket, region, accessKey, secretKey, endpoint }
 *   googleDrive: { enabled, clientEmail, privateKey, folderId }
 * }
 */

import { prisma } from '@/lib/prisma';

export interface SchoolIntegrationConfig {
    ai: {
        enabled: boolean;
        openaiKey: string;
        geminiKey: string;
        defaultModel: string;
    };
    whatsapp: {
        enabled: boolean;
        provider: string;
        apiKey: string;
        phoneId: string;
        businessId: string;
    };
    sms: {
        enabled: boolean;
        provider: string;
        apiKey: string;
        senderId: string;
    };
    payment: {
        enabled: boolean;
        provider: string;
        key: string;
        secret: string;
    };
    email: {
        enabled: boolean;
        host: string;
        port: string;
        user: string;
        pass: string;
        from: string;
    };
    maps: {
        enabled: boolean;
        apiKey: string;
    };
    zoom: {
        enabled: boolean;
        clientId: string;
        clientSecret: string;
        accountId: string;
    };
    storage: {
        enabled: boolean;
        provider: string;
        bucket: string;
        region: string;
        accessKey: string;
        secretKey: string;
        endpoint: string;
    };
    googleDrive: {
        enabled: boolean;
        clientEmail: string;
        privateKey: string;
        folderId: string;
    };
}

/**
 * Get the full integration config for a school by slug.
 * Returns null if the school is not found.
 */
export async function getSchoolIntegrationConfig(slug: string): Promise<Partial<SchoolIntegrationConfig> | null> {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { slug },
            select: { integrationsConfig: true }
        });

        if (!school) return null;

        const raw = school.integrationsConfig;
        return raw ? JSON.parse(raw) as Partial<SchoolIntegrationConfig> : null;
    } catch {
        return null;
    }
}

/**
 * Get the full integration config for a school by schoolId.
 * Returns null if the school is not found.
 */
export async function getSchoolIntegrationConfigById(schoolId: string): Promise<Partial<SchoolIntegrationConfig> | null> {
    try {
        const school = await (prisma as any).school.findUnique({
            where: { id: schoolId },
            select: { integrationsConfig: true }
        });

        if (!school) return null;

        const raw = school.integrationsConfig;
        return raw ? JSON.parse(raw) as Partial<SchoolIntegrationConfig> : null;
    } catch {
        return null;
    }
}

/**
 * Get the OpenAI API key for a school by slug.
 */
export async function getSchoolOpenAIKey(slug: string): Promise<string | null> {
    const config = await getSchoolIntegrationConfig(slug);
    return config?.ai?.openaiKey || null;
}

/**
 * Get the Google/Gemini AI key for a school by slug.
 */
export async function getSchoolGeminiKey(slug: string): Promise<string | null> {
    const config = await getSchoolIntegrationConfig(slug);
    return config?.ai?.geminiKey || null;
}

/**
 * Resolve an AI model for a school.
 * Returns { model, apiKey, provider } or throws if not configured.
 */
export async function resolveSchoolAIModel(
    slug: string,
    preferredProvider?: 'openai' | 'google'
): Promise<{ apiKey: string; provider: 'openai' | 'google' }> {
    const config = await getSchoolIntegrationConfig(slug);

    const openaiKey = config?.ai?.openaiKey;
    const geminiKey = config?.ai?.geminiKey;

    if (preferredProvider === 'openai' && openaiKey) {
        return { apiKey: openaiKey, provider: 'openai' };
    }
    if (preferredProvider === 'google' && geminiKey) {
        return { apiKey: geminiKey, provider: 'google' };
    }

    // Auto-detect: prefer whichever key is present
    if (openaiKey) return { apiKey: openaiKey, provider: 'openai' };
    if (geminiKey) return { apiKey: geminiKey, provider: 'google' };

    throw new Error('No AI API key configured. Please add an OpenAI or Gemini key in Settings → Integrations.');
}
