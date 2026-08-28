import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('validator rejects a major card whose content is vertically clipped', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vertical-overflow-'));
  const htmlPath = path.join(tempRoot, 'clipped.html');
  fs.writeFileSync(htmlPath, `<!doctype html><style>
    html,body{margin:0;overflow-x:hidden}.preview-shell{width:2160px;height:5760px}
    #report{width:2160px;height:5760px}.card{width:500px;height:50px;overflow:hidden}
  </style><div class="preview-shell"><main id="report"><section class="card"><div style="height:200px">clipped</div></section></main></div>`);

  const run = spawnSync(process.execPath, [path.join(repoRoot, 'scripts/validate_report.mjs'), htmlPath], { encoding: 'utf8' });
  assert.equal(run.status, 1, run.stdout + run.stderr);
  assert.match(run.stdout, /vertical overflow/);
});

