const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  // Navigate to sensors page
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1500);

  // Find and click the sensors nav item (Station Network)
  const navItems = await page.$$eval('[class*="nav"]', els => els.map(e => ({ tag: e.tagName, cls: e.className, text: e.textContent?.trim().substring(0, 30) })));
  console.log('Nav elements:', JSON.stringify(navItems.slice(0, 20)));

  await browser.close();
})();
