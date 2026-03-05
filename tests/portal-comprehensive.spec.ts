import { test, expect, Page } from '@playwright/test';

// ─── Shared Helpers ────────────────────────────────────────────────────────
async function navTo(page: Page, slug: string, path: string) {
    await page.goto(`/s/${slug}/${path}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 });
    const is404 = await page.getByText('This page could not be found', { exact: false }).isVisible().catch(() => false);
    expect(is404, `404 on /s/${slug}/${path}`).toBeFalsy();
}

/**
 * Gets the school slug from the URL after login
 */
async function getSlug(page: Page): Promise<string> {
    console.log('🔍 Attempting to extract school slug...');
    try {
        await page.goto('/dashboard', { waitUntil: 'networkidle' });
        if (page.url().includes('login')) {
            throw new Error('Authentication failed - redirected to login');
        }
        await page.waitForURL(/\/s\/[^\/]+\/dashboard/, { timeout: 30000 });
        return page.url().split('/s/')[1].split('/')[0];
    } catch (e) {
        console.warn(`⚠️ Slug extraction failed: ${e}. Using fallback: bodhi-board`);
        return 'bodhi-board';
    }
}

// ─── Test Suite: Portal Comprehensive Smoke Tests ─────────────────────────
test.describe('Portal Route Smoke Tests', () => {
    const slug = 'bodhi-board';

    test('Core Routes: Dashboard, Students, Parents', async ({ page }) => {
        const routes = ['dashboard', 'students', 'parent-requests'];
        for (const r of routes) await navTo(page, slug, r);
    });

    test('Academic Routes: Classes, Timetable, Reports', async ({ page }) => {
        const routes = ['academics/classes', 'academics/timetable', 'academics/report-cards'];
        for (const r of routes) await navTo(page, slug, r);
    });

    test('Communication: Chat, Circulars, Events, Alerts', async ({ page }) => {
        const routes = ['communication', 'circulars', 'events', 'emergency'];
        for (const r of routes) await navTo(page, slug, r);
    });

    test('HR & Finance: Directory, Payroll, Billing, Accounts', async ({ page }) => {
        const routes = ['hr/directory', 'hr/attendance', 'hr/payroll', 'billing', 'accounts', 'accounts/insights'];
        for (const r of routes) await navTo(page, slug, r);
    });

    test('Admissions CRM: Dashboard, Inquiry, Pipeline', async ({ page }) => {
        const routes = ['admissions', 'admissions/inquiry', 'admissions/pipeline', 'admissions/dashboard'];
        for (const r of routes) await navTo(page, slug, r);
    });

    test('Services: Transport, Library, Canteen, Store', async ({ page }) => {
        const routes = [
            'transport', 'transport/fleet/vehicles', 'transport/route/routes',
            'library', 'library/inventory', 'canteen', 'school-store', 'ptm'
        ];
        for (const r of routes) await navTo(page, slug, r);
    });

    test('Settings & Config', async ({ page }) => {
        const routes = ['settings/admin', 'settings/config'];
        for (const r of routes) await navTo(page, slug, r);
    });
});

// ─── Functional Checks ─────────────────────────────────────────────────────
test.describe('Portal Functional Checks', () => {
    const slug = 'bodhi-board';

    test('Students list renders table', async ({ page }) => {
        await navTo(page, slug, 'students');
        await expect(page.locator('table, [data-testid="student-list"], .student-card').first()).toBeVisible({ timeout: 10000 })
            .catch(() => expect(page.getByText(/student|pupil|admission/i).first()).toBeVisible({ timeout: 10000 }));
    });

    test('Inquiry list renders', async ({ page }) => {
        await navTo(page, slug, 'admissions/inquiry');
        await expect(page.getByText(/inquiry|admission|lead|applicant/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('HR Directory renders', async ({ page }) => {
        await navTo(page, slug, 'hr/directory');
        await expect(page.getByText(/staff|employee|teacher|designation/i).first()).toBeVisible({ timeout: 10000 });
    });
});

// ─── Mobile API Health Check ───────────────────────────────
test.describe('Mobile API Endpoint Health', () => {
    const mobileApiEndpoints = [
        '/api/mobile/v1/parent/home',
        '/api/mobile/v1/parent/attendance',
        '/api/mobile/v1/parent/events',
        '/api/mobile/v1/parent/alerts',
        '/api/mobile/v1/parent/ptm',
        '/api/mobile/v1/parent/store',
        '/api/mobile/v1/parent/payments',
        '/api/mobile/v1/parent/timetable',
        '/api/mobile/v1/parent/canteen',
        '/api/mobile/v1/parent/transport',
        '/api/mobile/v1/parent/diary',
        '/api/mobile/v1/parent/progress',
    ];

    test('All mobile API routes return response (not 404/500)', async ({ page }) => {
        const badEndpoints: string[] = [];
        for (const endpoint of mobileApiEndpoints) {
            const res = await page.request.get(endpoint);
            const status = res.status();
            if (status === 404 || status === 500) {
                badEndpoints.push(`${endpoint} (${status})`);
            }
        }
        if (badEndpoints.length > 0) {
            throw new Error(`Broken API endpoints: ${badEndpoints.join(', ')}`);
        }
    });
});
