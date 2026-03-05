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
    
    console.log("Navigating to PTM...");
    await page.goto("http://localhost:3000/s/bodhi-board/ptm");
    await page.waitForTimeout(3000);
    
    console.log("Clicking New Session...");
    await page.click('button:has-text("New Session")');
    await page.waitForTimeout(1000);
    
    console.log("Filling form...");
    await page.fill('input[placeholder="E.g., Term 2 Parent-Teacher Meeting"]', "Automated PTM Test");
    await page.fill('input[type="date"]', "2026-12-01");
    // select classes
    await page.click('button:has-text("All Classes")'); // deselect all
    await page.waitForTimeout(500);
    await page.click('button:has-text("LKG")'); // assuming LKG exists
    await page.waitForTimeout(500);
    
    console.log("Publishing...");
    await page.click('button:has-text("Publish Session")');
    await page.waitForTimeout(3000);
    
    console.log("Verifying creation...");
    const content = await page.content();
    if (content.includes("Automated PTM Test")) {
        console.log("SUCCESS: Session found in list.");
    } else {
        console.log("FAILED: Session not found.");
    }
  } catch (e) {
    console.log("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
