const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to login...");
    await page.goto("http://localhost:3000/school-login");
    await page.fill('input[placeholder="Enter your email"]', "superadmin@bodhiboard.com");
    await page.fill('input[placeholder="Enter your password"]', "Admin@123");
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(3000);
    
    console.log("Navigating to Events...");
    await page.goto("http://localhost:3000/s/bodhi-board/events");
    await page.waitForTimeout(3000);
    
    console.log("Checking for errors...");
    const content = await page.content();
    if (content.includes("Cannot find module")) {
        console.log("FAILED: Cannot find module error is still present.");
    } else if (content.includes("School Calendar")) {
         console.log("SUCCESS: Events page loaded correctly. Error resolved.");
    } else {
        console.log("UNKNOWN: Check manual rendering.");
        console.log(content.slice(0, 500));
    }
  } catch (e) {
    console.log("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
