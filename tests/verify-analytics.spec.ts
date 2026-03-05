import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard Verification', () => {
    test('should render new analytics charts on the dashboard', async ({ page }) => {
        // 1. Navigate to dashboard
        await page.goto('/s/bodhi-board/dashboard');

        // 2. Wait for data to load
        await page.waitForSelector('text=Unified Intelligence', { timeout: 30000 });

        // 3. Verify all 4 new charts are present
        const charts = [
            'Enrollment Pulse',
            'Financial Intake',
            'Academic Achievement',
            'Attendance Consistency'
        ];

        for (const title of charts) {
            const heading = page.getByRole('heading', { name: title });
            await expect(heading).toBeVisible({ timeout: 15000 });
            console.log(`✅ Chart found: ${title}`);
        }

        // 4. Verify charts actually contain SVG elements (Recharts)
        const svgCount = await page.locator('.recharts-responsive-container svg').count();
        expect(svgCount).toBeGreaterThanOrEqual(1); // At least one chart rendered successfully
        console.log(`📊 Total charts rendered: ${svgCount}`);
    });
});
