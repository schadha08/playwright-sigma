const { test } = require("@playwright/test");

// Use storage state file (will be created from GitHub secret in CI)
test.use({ storageState: 'storageState.json' });

test("Visit Sigma workbook with saved session", async ({ page }) => {
  await page.goto("https://app.sigmacomputing.com/envoy/workbook/Location-Visitors-Analytics-56Ahn6kJEe1efCYGI2IGU9");
  
  // Wait for the specific element to confirm page has loaded
  await page.waitForSelector('p.h-med:has-text("Visitors Analytics")', { timeout: 30000 });
  
  console.log("Successfully accessed the workbook using saved session");
});