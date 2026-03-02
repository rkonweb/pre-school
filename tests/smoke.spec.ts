import { test, expect } from '@playwright/test';

test.describe('Complete Application Smoke Test', () => {

    // Helper function to handle Login
    const performLogin = async (page: import('@playwright/test').Page) => {
        await page.goto('/school-login');
        await page.waitForSelector('input[type="tel"]');
        // Use pressSequentially to trigger React state correctly instead of just fill
        await page.locator('input[type="tel"]').pressSequentially('2323232323', { delay: 50 }); // Demo Admin

        // Give time for validation & hydration
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Continue")', { force: true });

        await page.waitForSelector('input[aria-label="OTP Digit 1"]', { timeout: 15000 });
        await page.fill('input[aria-label="OTP Digit 1"]', '1');
        await page.fill('input[aria-label="OTP Digit 2"]', '2');
        await page.fill('input[aria-label="OTP Digit 3"]', '3');
        await page.fill('input[aria-label="OTP Digit 4"]', '4');
        await page.fill('input[aria-label="OTP Digit 5"]', '5');
        await page.fill('input[aria-label="OTP Digit 6"]', '6');

        // Wait for the Dashboard
        await page.waitForURL(/\/s\/[^\/]+\/dashboard/, { timeout: 30000, waitUntil: 'commit' });
        await expect(page.getByText('Dashboard', { exact: false }).first()).toBeVisible({ timeout: 10000 });

        // Return the slug
        const url = page.url();
        return url.split('/s/')[1].split('/')[0];
    };

    test('Should navigate through Core Dashboard Modules completely', async ({ page }) => {
        test.setTimeout(120000); // 2 minutes timeout for the extensive flow

        console.log('Starting Test: Logging into system...');
        const slug = await performLogin(page);
        console.log(`[PASS] Login successful. Tenant Slug: ${slug}`);

        // Define all routes to verify
        const routesToTest = [
            { path: 'students', label: 'Students' },
            { path: 'academics/classes', label: 'Academics' },
            { path: 'hr/directory', label: 'HR' },
            { path: 'transport/fleet/vehicles', label: 'Transport' },
            { path: 'settings/admin', label: 'Settings' },
            { path: 'admissions/inquiry', label: 'Admissions' },
            { path: 'library/inventory', label: 'Library' },
            { path: 'hostel/allocation', label: 'Hostel' },
            { path: 'store', label: 'Store' }
        ];

        for (const route of routesToTest) {
            console.log(`Testing Route: /s/${slug}/${route.path}`);

            const response = await page.goto(`/s/${slug}/${route.path}`, { waitUntil: 'load' });

            // Wait for the main layout to render
            await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

            // Ensure it is not a 404
            const notFoundText = await page.getByText('This page could not be found', { exact: false }).isVisible();
            expect(notFoundText).toBeFalsy();
            console.log(`[PASS] Route /s/${slug}/${route.path} loaded smoothly.`);
        }

        console.log('All Core Application Modules verified successfully.');
    });
});
