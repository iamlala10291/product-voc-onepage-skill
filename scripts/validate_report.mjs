import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const [htmlPath] = process.argv.slice(2);
if (!htmlPath) {
  console.error('Usage: node scripts/validate_report.mjs <input.html>');
  process.exit(1);
}

const source = fs.readFileSync(htmlPath, 'utf8');
const forbidden = [/TODO/gi, /昨天/g, /新证据/g, /<del\b/gi, /<ins\b/gi, /\/Users\//g, /\/Volumes\//g];
const staticHits = forbidden.flatMap(rx => (source.match(rx) || []).map(v => `${rx}:${v}`));
const browser = await chromium.launch({ headless: true });
const failures = [];
const results = [];

try {
  for (const width of [900, 1366, 1440, 2160]) {
    const page = await browser.newPage({ viewport: { width, height: 1200 }, deviceScaleFactor: 1 });
    const failedImages = [];
    page.on('requestfailed', req => failedImages.push(req.url()));
    await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: 'networkidle' });
    const metrics = await page.evaluate(() => {
      const report = document.querySelector('#report');
      const rect = report.getBoundingClientRect();
      const offenders = [...report.querySelectorAll('*')].filter(el => {
        const cs = getComputedStyle(el);
        return el.scrollWidth > el.clientWidth + 2 && cs.overflowX === 'visible';
      }).length;
      const verticalOffenders = [...report.querySelectorAll('.card,.finding,.metric,.map-item,.task,.loss,.proof-row,.action,.footer-main,.footer-meta')]
        .filter(el => el.scrollHeight > el.clientHeight + 2)
        .map(el => el.id || el.className);
      return {
        viewport: innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        reportCssWidth: Number.parseFloat(getComputedStyle(report).width),
        reportCssHeight: Number.parseFloat(getComputedStyle(report).height),
        visualWidth: rect.width,
        visualHeight: rect.height,
        overflowOffenders: offenders,
        verticalOverflowOffenders: verticalOffenders,
        images: [...document.images].map(img => ({src: img.src, ok: img.complete && img.naturalWidth > 0}))
      };
    });
    if (metrics.docScrollWidth > width + 2) failures.push(`horizontal overflow at ${width}px`);
    if (metrics.reportCssWidth !== 2160 || metrics.reportCssHeight !== 5760) failures.push('report CSS size is not 2160x5760');
    if (metrics.overflowOffenders) failures.push(`${metrics.overflowOffenders} possible overflow element(s) at ${width}px`);
    if (metrics.verticalOverflowOffenders.length) failures.push(`vertical overflow at ${width}px: ${metrics.verticalOverflowOffenders.join(', ')}`);
    if (failedImages.length || metrics.images.some(x => !x.ok)) failures.push(`failed image at ${width}px`);
    results.push(metrics);
    await page.close();
  }
} finally {
  await browser.close();
}

if (staticHits.length) failures.push(`forbidden process/private markers: ${staticHits.join(', ')}`);
console.log(JSON.stringify({ ok: failures.length === 0, failures, breakpoints: results }, null, 2));
if (failures.length) process.exit(1);

