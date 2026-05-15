const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);

  // Navigate to worker page
  await page.evaluate(() => {
    const links = document.querySelectorAll('.nav-link');
    for (const link of links) {
      if (link.textContent?.trim().includes('WORKER_RISK')) { link.click(); return; }
    }
  });

  // Wait for worker content to appear
  await page.waitForSelector('h2', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Scroll to DOSH table
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3, [class*="dosh"], [class*="compliance"]'));
    const doshEl = headings.find(el => el.textContent?.toLowerCase().includes('dosh'));
    if (doshEl) {
      doshEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      // Scroll to 60% of page
      window.scrollTo(0, document.documentElement.scrollHeight * 0.6);
    }
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verify_dosh_table.png' });
  console.log('Saved verify_dosh_table.png');

  await browser.close();
})();
