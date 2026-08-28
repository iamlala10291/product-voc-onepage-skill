import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const [htmlPath, outputPath] = process.argv.slice(2);
if (!htmlPath || !outputPath) {
  console.error("Usage: node scripts/render_report.mjs <input.html> <output.png>");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => window.setPreviewScale?.(1));

  const report = page.locator("#report");
  const size = await report.evaluate((element) => ({
    width: element.offsetWidth,
    height: element.offsetHeight,
  }));
  if (!size.width || !size.height) {
    throw new Error("The #report canvas has no measurable size");
  }

  await page.setViewportSize({
    width: Math.min(size.width, 7680),
    height: Math.min(size.height, 4000),
  });
  await page.evaluate(() => window.setPreviewScale?.(1));
  await report.screenshot({ path: path.resolve(outputPath), animations: "disabled", type: "png" });
  console.log("Rendered " + path.resolve(outputPath) + " at " + size.width + "x" + size.height);
} finally {
  await browser.close();
}
