import { chromium } from 'playwright-core';

const CHROME = '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:5000';
const routes = ['/', '/plans', '/purchase?plan=lite', '/compatibility', '/how-it-works', '/support', '/esim', '/countries'];
const widths = [375, 430];

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  for (const route of routes) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1200);
      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = doc.clientWidth;
        const overflow = Math.max(doc.scrollWidth, document.body.scrollWidth) - vw;
        const offenders = [];
        if (overflow > 1) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
              const cs = getComputedStyle(el);
              if (cs.position === 'fixed' || cs.visibility === 'hidden') continue;
              // skip elements inside horizontally-scrollable ancestors
              let p = el.parentElement, scrollable = false;
              while (p) {
                const pcs = getComputedStyle(p);
                if (/(auto|scroll|hidden)/.test(pcs.overflowX)) { scrollable = true; break; }
                p = p.parentElement;
              }
              if (scrollable) continue;
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 120),
                left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
                text: (el.textContent || '').trim().slice(0, 40),
              });
            }
          }
        }
        return { vw, overflow, offenders: offenders.slice(0, 12) };
      });
      console.log(`\n=== ${width}px ${route} overflow=${result.overflow}px`);
      for (const o of result.offenders) console.log(`  <${o.tag}> L${o.left} R${o.right} W${o.w} "${o.text}" cls=${o.cls}`);
    } catch (e) {
      console.log(`\n=== ${width}px ${route} ERROR: ${e.message.split('\n')[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();
