import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext();
const page = await context.newPage();

// Collect console errors
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

// Collect API responses
const apiResponses = [];
page.on('response', async (response) => {
  if (response.url().includes('/api/onboarding')) {
    const status = response.status();
    let body = '';
    try { body = await response.text(); } catch {}
    apiResponses.push({ status, body });
    console.log(`\n[API] /api/onboarding → status=${status} body=${body}`);
  }
});

const email = `test-${Date.now()}@example.com`;
const password = 'testpassword123';

try {
  console.log('1. Going to /signup...');
  await page.goto('http://localhost:3000/signup', { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/signup', { timeout: 5000 }).catch(() => {});
  console.log('   URL:', page.url());

  console.log('2. Filling signup form...');
  await page.fill('#full-name', 'Test User');
  await page.fill('#email', email);
  await page.fill('#password', password);

  console.log('3. Submitting signup form...');
  await page.click('button[type="submit"]');

  // Wait for navigation away from /signup
  try {
    await page.waitForURL(url => !url.includes('/signup'), { timeout: 15000 });
    console.log('   Navigated to:', page.url());
  } catch {
    console.log('   Still on signup after 15s. Current URL:', page.url());
    const bodyText = await page.locator('body').textContent();
    // Check for error on signup page
    const errorEl = await page.locator('.bg-destructive\\/10').textContent().catch(() => null);
    if (errorEl) console.log('   SIGNUP ERROR:', errorEl);
    console.log('   Page text (first 200):', bodyText?.slice(0, 200));
  }

  const currentUrl = page.url();
  console.log('4. Current URL:', currentUrl);

  if (currentUrl.includes('/onboarding')) {
    console.log('5. On onboarding page. Filling step 1 (workspace)...');
    await page.waitForSelector('#ws-name', { timeout: 10000 });
    await page.fill('#ws-name', 'Test Workspace');
    await page.waitForTimeout(500); // slug auto-fill
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    console.log('6. After step 1. Looking for step 2...');
    const skipBtn = page.locator('button:has-text("Skip for now")');
    const completeBtn = page.locator('button:has-text("Complete setup")');

    if (await skipBtn.isVisible({ timeout: 5000 })) {
      console.log('   Step 2 visible. Clicking "Skip for now"...');
      await skipBtn.click();
      await page.waitForTimeout(5000);

      console.log('   URL after skip:', page.url());

      // Check for error banner
      const errorEl = page.locator('.bg-destructive\\/10');
      if (await errorEl.isVisible({ timeout: 2000 })) {
        console.log('   ERROR SHOWN:', await errorEl.textContent());
      } else {
        console.log('   No error banner visible');
        // Check if we moved to step 3
        const doneEl = page.locator('text=You\'re all set!');
        if (await doneEl.isVisible({ timeout: 2000 })) {
          console.log('   SUCCESS: Step 3 shown ("You\'re all set!")');
        } else {
          const bodyText = await page.locator('body').textContent();
          console.log('   Page content:', bodyText?.slice(0, 300));
        }
      }
    } else {
      console.log('   Step 2 NOT visible. Page text:', await page.locator('body').textContent().then(t => t?.slice(0, 300)));
    }
  } else if (currentUrl.includes('Check your email') || await page.locator('text=Check your email').isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('   Email confirmation required - local Supabase has confirmations enabled');
  } else {
    console.log('   Unexpected URL/state');
    const bodyText = await page.locator('body').textContent();
    console.log('   Page text:', bodyText?.slice(0, 300));
  }

  if (consoleErrors.length > 0) {
    console.log('\nBROWSER CONSOLE ERRORS:');
    consoleErrors.forEach(e => console.log(' ', e));
  }

} catch (err) {
  console.error('FATAL ERROR:', err.message);
} finally {
  await browser.close();
}
