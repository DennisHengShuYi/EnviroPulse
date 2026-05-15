const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(4000);

  await page.evaluate(() => {
    const links = document.querySelectorAll('.nav-link');
    for (const link of links) {
      if (link.textContent?.trim().includes('WORKER_RISK')) { link.click(); return; }
    }
  });

  await page.waitForSelector('h2', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Scroll to DOSH table
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    const el = headings.find(h => h.textContent?.toLowerCase().includes('dosh'));
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo(0, document.documentElement.scrollHeight * 0.65);
  });

  await page.waitForTimeout(400);
  await page.screenshot({ path: 'dosh_cards.png' });
  console.log('Saved dosh_cards.png');

  await browser.close();
})();
