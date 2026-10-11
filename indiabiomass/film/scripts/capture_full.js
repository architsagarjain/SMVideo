// Full-page reference captures of the live IndiaBiomass site.
const { chromium } = require('playwright');
const pages = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(`https://indiabiomassfinal.netlify.app/${p}.dc.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `public/ui/full/${p}.png`, fullPage: true });
    const h = await page.evaluate(() => document.body.scrollHeight);
    console.log(p, h);
    await page.close();
  }
  await browser.close();
})();
