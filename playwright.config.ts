import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 2,
    timeout: 60000,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        // 1. Run the login setup first (saves session to file)
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        // 2. All other tests depend on setup and reuse the saved session
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testIgnore: /.*\.setup\.ts/,
        },
    ],
});
