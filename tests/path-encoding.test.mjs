import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('build succeeds when the skill lives under a non-ASCII path', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), '产品 报告-'));
  const output = path.join(tempRoot, '结果.html');
  const run = spawnSync(process.execPath, [
    path.join(repoRoot, 'scripts/build_report.mjs'),
    path.join(repoRoot, 'templates/report-config.example.json'),
    output
  ], { encoding: 'utf8' });

  assert.equal(run.status, 0, run.stderr);
  assert.equal(fs.existsSync(output), true);
  assert.match(fs.readFileSync(output, 'utf8'), /FICTIONAL PUBLIC EXAMPLE/);
});
