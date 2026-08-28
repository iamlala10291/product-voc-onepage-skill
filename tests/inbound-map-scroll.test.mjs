import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

test("responsive ANKNI map allows vertical wheel scrolling", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    const html = path.resolve("examples/ankni-fragrance-lubricant-inbound-map.html");
    await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });

    const before = await page.evaluate(() => ({
      overflowY: getComputedStyle(document.body).overflowY,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
    }));
    assert.ok(before.scrollHeight > before.viewportHeight, "the responsive page must be taller than the viewport");
    assert.notEqual(before.overflowY, "hidden", "vertical overflow must remain scrollable");

    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(80);
    const afterY = await page.evaluate(() => window.scrollY);
    assert.ok(afterY > before.scrollY, "mouse-wheel input must move the page vertically");
  } finally {
    await browser.close();
  }
});
