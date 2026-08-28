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

test("ANKNI map renders a real nine-scene decision tree on the extended canvas", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 2160, height: 1400 } });
    const html = path.resolve("examples/ankni-fragrance-lubricant-inbound-map.html");
    await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
    await page.evaluate(() => window.setPreviewScale?.(1));

    const reportSize = await page.locator("#report").evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
    }));
    assert.deepEqual(reportSize, { width: 2160, height: 7680 });

    const lanes = await page.locator("#scene-decision-tree .scenario-lane").count();
    const scenes = await page.locator("#scene-decision-tree .scene-flow[data-scene-id]").count();
    assert.equal(lanes, 3, "the tree must route customers into three usage-role lanes");
    assert.equal(scenes, 9, "all nine user-task scenes must remain represented");

    const sceneContracts = await page.locator("#scene-decision-tree .scene-flow[data-scene-id]").evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.getAttribute("data-scene-id"),
        hasSignal: Boolean(element.querySelector(".branch-node.signal-node")),
        hasQuestion: Boolean(element.querySelector(".branch-node.question-node")),
        branchCount: element.querySelectorAll(".answer-branch").length,
        hasOutcome: Boolean(element.querySelector(".route-outcome")),
      })),
    );
    for (const scene of sceneContracts) {
      assert.ok(scene.hasSignal, `${scene.id} must begin with a customer signal`);
      assert.ok(scene.hasQuestion, `${scene.id} must include a progressive follow-up question`);
      assert.ok(scene.branchCount >= 2, `${scene.id} must branch on at least two customer answers`);
      assert.ok(scene.hasOutcome, `${scene.id} must end in an explicit route outcome`);
    }

    assert.ok(
      (await page.locator("#concern-return-rail .concern-route").count()) >= 6,
      "cross-cutting concerns must be able to interrupt and return to the main sales route",
    );
    assert.equal(await page.locator("#route-exits .route-exit").count(), 3);
  } finally {
    await browser.close();
  }
});

test("ANKNI map keeps cards inside the 7680px canvas without clipping", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 2160, height: 1400 } });
    const html = path.resolve("examples/ankni-fragrance-lubricant-inbound-map.html");
    await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
    await page.evaluate(() => window.setPreviewScale?.(1));
    const audit = await page.evaluate(() => {
      const selectors = [".overview", ".scene-flow", ".concern-card", ".concern-route", ".exit-card", ".route-exit"];
      const clipped = [];
      for (const element of document.querySelectorAll(selectors.join(","))) {
        if (element.scrollHeight > element.clientHeight + 2 || element.scrollWidth > element.clientWidth + 2) {
          clipped.push(element.className);
        }
      }
      const finalSection = document.querySelector("#route-exits").getBoundingClientRect();
      const footer = document.querySelector(".footer").getBoundingClientRect();
      return { clipped, footerGap: footer.top - finalSection.bottom };
    });
    assert.deepEqual(audit.clipped, []);
    assert.ok(audit.footerGap >= 40, "the final route section must not collide with the footer");
  } finally {
    await browser.close();
  }
});
