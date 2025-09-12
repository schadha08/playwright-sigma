const { test } = require("@playwright/test");

test.describe.configure({ mode: "serial" });
test.use({ browserName: "chromium" });

test("Sigma Computing login and save session", async ({ page, context }) => {
  await page.goto("https://app.sigmacomputing.com/envoy/login?no_sso=1");

  const emailField = page.locator(
    'input[type="email"], input[name*="email"], input[id*="email"]'
  );
  await emailField.fill("username");

  const passwordField = page.locator(
    'input[type="password"], input[name*="password"], input[id*="password"]'
  );
  await passwordField.fill("password");

  const signInButton = page.locator('button[data-track-id="button-login"]');
  await signInButton.click();

  // Wait for 2FA page and pause for manual entry
  console.log("Please enter your 2FA code manually in the browser...");
  await page.pause();

  // Wait for successful login
  await page.waitForURL("https://app.sigmacomputing.com/envoy", {
    timeout: 60000,
  });

  // Save the storage state to file
  await context.storageState({ path: "storageState.json" });
  console.log("Session saved to storageState.json");
});
