const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  const pagesToCapture = [
    { text: 'REPORTS', file: 'final_reports2.png' },
  ];

  for (const p of pagesToCapture) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    await page.evaluate((targetText) => {
      const links = document.querySelectorAll('.nav-link');
      for (const link of links) {
        if (link.textContent?.trim().includes(targetText)) {
          link.click();
          return;
        }
      }
    }, p.text);

    await page.waitForTimeout(2500);
    await page.screenshot({ path: p.file, fullPage: true });
    console.log(`Saved ${p.file}`);
    await ctx.close();
  }

  await browser.close();
})();
