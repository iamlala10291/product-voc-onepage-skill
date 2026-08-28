import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const htmlPath = path.resolve("examples/ankni-fragrance-lubricant-inbound-map.html");
const pngPath = path.resolve("examples/ankni-fragrance-lubricant-inbound-map-4k.png");

test("responsive ANKNI mind map allows vertical wheel scrolling", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    const before = await page.evaluate(() => ({
      overflowY: getComputedStyle(document.body).overflowY,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
    }));
    assert.ok(before.scrollHeight > before.viewportHeight, "the responsive page must be taller than the viewport");
    assert.ok(before.scrollWidth <= before.viewportWidth, "the scaled map must not create horizontal overflow");
    assert.notEqual(before.overflowY, "hidden", "vertical overflow must remain scrollable");
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(80);
    const afterY = await page.evaluate(() => window.scrollY);
    assert.ok(afterY > before.scrollY, "mouse-wheel input must move the page vertically");
  } finally {
    await browser.close();
  }
});

test("ANKNI artifact is a connected 3840 by 14400 mind map with nine task subtrees", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 3840, height: 1800 } });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.evaluate(() => window.setPreviewScale?.(1));
    const reportSize = await page.locator("#report").evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
    }));
    assert.deepEqual(reportSize, { width: 3840, height: 14400 });
    await page.waitForFunction(() => document.querySelectorAll("#connector-layer path").length >= 40);
    assert.equal(await page.locator(".mindmap-root").count(), 1);
    assert.equal(await page.locator("#task-mindmap .role-branch").count(), 3);
    assert.equal(await page.locator("#task-mindmap .scene-cluster[data-scene-id]").count(), 9);
    const sceneContracts = await page.locator("#task-mindmap .scene-cluster[data-scene-id]").evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.getAttribute("data-scene-id"),
        questionCount: element.querySelectorAll(".question-hub").length,
        answerCount: element.querySelectorAll(".answer-leaf").length,
        outcomeCount: element.querySelectorAll(".outcome-node").length,
      })),
    );
    for (const scene of sceneContracts) {
      assert.equal(scene.questionCount, 1, scene.id + " must have one central follow-up question");
      assert.ok(scene.answerCount >= 3, scene.id + " must fan out into at least three customer-answer leaves");
      assert.equal(scene.outcomeCount, 1, scene.id + " must converge into one explicit route outcome");
    }
    const connectorPaths = await page.locator("#connector-layer path").evaluateAll((paths) =>
      paths.map((item) => item.getAttribute("d")),
    );
    assert.ok(connectorPaths.length >= 40, "the map must visibly connect roots, branches, scenes, answers, and outcomes");
    assert.ok(connectorPaths.every((value) => value && value.length > 10), "every connector must have a rendered path");
    assert.ok((await page.locator("#concern-return-rail .concern-leaf").count()) >= 8);
    assert.equal(await page.locator("#route-exits .route-exit").count(), 3);
  } finally {
    await browser.close();
  }
});

test("mind-map nodes stay inside the 14400px canvas without clipping", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 3840, height: 1800 } });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.evaluate(() => window.setPreviewScale?.(1));
    await page.waitForFunction(() => document.querySelectorAll("#connector-layer path").length >= 40);
    const audit = await page.evaluate(() => {
      const selectors = [
        ".overview-map", ".role-map", ".scene-cluster", ".scene-node", ".question-hub",
        ".answer-leaf", ".outcome-node", ".concern-map", ".concern-leaf", ".exit-map", ".route-exit",
      ];
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
    assert.ok(audit.footerGap >= 60, "the final route map must not collide with the footer");
  } finally {
    await browser.close();
  }
});

test("published ANKNI PNG is true 4K width at 3840 by 14400", () => {
  const png = fs.readFileSync(pngPath);
  assert.equal(png.toString("ascii", 1, 4), "PNG");
  assert.equal(png.readUInt32BE(16), 3840);
  assert.equal(png.readUInt32BE(20), 14400);
});
