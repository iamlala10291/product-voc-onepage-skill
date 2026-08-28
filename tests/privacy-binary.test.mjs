import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('privacy scan fails closed when a binary asset needs manual review', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-binary-'));
  fs.writeFileSync(path.join(tempRoot, 'preview.png'), Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]),
    Buffer.from([0x00, 0xff, 0x10, 0x80, 0x00])
  ]));
  fs.writeFileSync(path.join(tempRoot, 'README.md'), 'public fictional example');

  const run = spawnSync(process.execPath, [path.join(repoRoot, 'scripts/privacy_scan.mjs'), tempRoot], { encoding: 'utf8' });
  assert.equal(run.status, 1, run.stdout + run.stderr);
  const result = JSON.parse(run.stdout);
  assert.equal(result.ok, false);
  assert.equal(result.hits[0].type, 'binary asset requires manual review');
});


test('privacy scan accepts an explicitly reviewed binary only when its hash matches', () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-reviewed-'));
  const binary = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01, 0x02]);
  fs.mkdirSync(path.join(tempRoot, 'assets'));
  fs.writeFileSync(path.join(tempRoot, 'assets/preview.png'), binary);
  fs.writeFileSync(path.join(tempRoot, 'privacy-reviewed-binaries.json'), JSON.stringify({reviewed:[{
    path:'assets/preview.png',
    sha256:crypto.createHash('sha256').update(binary).digest('hex'),
    source:'generated from fictional example'
  }]}));

  const run = spawnSync(process.execPath, [path.join(repoRoot, 'scripts/privacy_scan.mjs'), tempRoot], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(JSON.parse(run.stdout).ok, true);
});
