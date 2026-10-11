// Element-level captures of the live IndiaBiomass site at 2x for the film.
// The Netlify preview HUD is blocked so it never appears in a capture.
const { chromium } = require('playwright');
const OUT = 'public/ui/';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.route('**/.netlify/**', r => r.abort());
  const go = async p => { await page.goto(`https://indiabiomassfinal.netlify.app/${p}.dc.html`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    await page.evaluate(() => {
      // Remove preview chrome and floating UI so element crops are clean.
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') el.style.setProperty('display', 'none', 'important');
        if (cs.position === 'sticky') el.style.setProperty('position', 'relative', 'important');
        const t = (el.textContent || '').trim();
        if (el.tagName === 'BUTTON' && (t === '‹' || t === '›')) el.style.setProperty('visibility', 'hidden', 'important');
      }
    });
    await page.waitForTimeout(300); };
  // closest ancestor of a heading with given text matching selector
  const shot = async (text, tag, anc, name) => {
    const h = page.locator(tag, { hasText: text }).first();
    const el = anc ? h.locator(`xpath=ancestor::${anc}[1]`) : h;
    await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    await el.screenshot({ path: OUT + name + '.png' });
    console.log('ok', name);
  };
  await go('market-data');
  await shot('Weekly price index', 'h2', 'section', 'md_price');
  await shot('Raw material price ranges', 'h2', 'section', 'md_raw');
  await shot('Supply board', 'h2', 'section', 'md_supply');
  await shot('Mandatory biomass co-firing', 'h3', 'article', 'md_policy1');
  await shot('CBG blending obligation', 'h3', 'article', 'md_policy2');
  await shot('Crop residue management', 'h3', 'article', 'md_policy3');
  await shot('Market data', 'h1', 'section', 'md_header');
  await go('home');
  await page.locator('header').first().screenshot({ path: OUT + 'home_nav.png' }).catch(e => console.log('nav fail'));
  await shot('Buy biofuel', 'h1', 'section', 'home_hero');
  await shot('Biomass tenders', 'h2', 'section', 'home_tenders');
  for (const [t, n] of [['Co-firing pellets', 'card_cofiring'], ['Paddy straw pellets', 'card_paddypellets'], ['Mustard stalk briquettes', 'card_briquettes'], ['Wood pellets', 'card_wood'],
                        ['Ring-die pellet mill 2 TPH', 'card_pelletmill'], ['Square baler', 'card_baler'], ['Biomass boiler 6 TPH', 'card_boiler'],
                        ['Paddy straw square bales', 'card_bales'], ['Paddy straw round bales', 'card_roundbales'], ['Rice husk (loose)', 'card_ricehusk']]) {
    await shot(t, 'h3', 'article', n);
  }
  await shot('How it works', 'h2', 'section', 'home_how');
  await go('tenders');
  await page.screenshot({ path: OUT + 'tenders_view.png' });
  await browser.close();
})();
