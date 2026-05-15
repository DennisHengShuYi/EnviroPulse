const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:5173');
  // Wait for the page to load (wait for a dashboard element to appear)
  await page.waitForSelector('.dashboard-grid-3col, .dashboard-column', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tablet_kpi_risk.png' });
  console.log('Saved tablet_kpi_risk.png');

  await browser.close();
})();
