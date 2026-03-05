import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('Authenticate as admin', async ({ page }) => {
    setup.setTimeout(60000);

    console.log('🔐 Running one-time login setup...');
    await page.goto('/school-login');
    await page.waitForSelector('input[type="tel"]');
    await page.locator('input[type="tel"]').fill('2323232323');
    await page.waitForTimeout(1000); // Wait for hydration
    await page.click('button:has-text("Continue")', { force: true });

    // Wait for the OTP screen - increased timeout to 45s for slow dev starts
    await page.waitForSelector('input[aria-label="OTP Digit 1"]', { timeout: 45000 });
    for (let i = 1; i <= 6; i++) {
        await page.fill(`input[aria-label="OTP Digit ${i}"]`, `${i}`);
    }

    await page.waitForURL(/\/s\/[^\/]+\/dashboard/, { timeout: 30000 });
    await expect(page.getByText('Dashboard', { exact: false }).first()).toBeVisible({ timeout: 10000 });

    const slug = page.url().split('/s/')[1].split('/')[0];
    console.log(`✅ Login successful. Slug: ${slug}. Saving session...`);

    // Save slug to environment or a file for tests to read
    process.env.TEST_SLUG = slug;

    // Save authentication state
    await page.context().storageState({ path: authFile });
    console.log('✅ Auth session saved to', authFile);
});
