import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const [htmlPath, outputPath] = process.argv.slice(2);
if (!htmlPath || !outputPath) {
  console.error('Usage: node scripts/render_report.mjs <input.html> <output.png>');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 2160, height: 5760 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.setPreviewScale?.(1));
  await page.locator('#report').screenshot({ path: path.resolve(outputPath), animations: 'disabled' });
  console.log(`Rendered ${path.resolve(outputPath)} at 2160x5760`);
} finally {
  await browser.close();
}

