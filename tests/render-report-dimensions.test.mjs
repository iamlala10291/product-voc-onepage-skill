import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

const execFileAsync = promisify(execFile);

test("renderer discovers the HTML canvas size instead of reporting a hard-coded size", async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "voc-render-size-"));
  const html = path.join(temp, "fixture.html");
  const png = path.join(temp, "fixture.png");
  fs.writeFileSync(html, "<!doctype html><style>html,body{margin:0}#report{width:640px;height:960px;background:white}</style><div id='report'></div><script>window.setPreviewScale=function(){}</script>");
  try {
    const result = await execFileAsync(process.execPath, [
      path.resolve("scripts/render_report.mjs"),
      html,
      png,
    ], { cwd: process.cwd() });
    const image = fs.readFileSync(png);
    assert.equal(image.readUInt32BE(16), 640);
    assert.equal(image.readUInt32BE(20), 960);
    assert.match(result.stdout, /640x960/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
