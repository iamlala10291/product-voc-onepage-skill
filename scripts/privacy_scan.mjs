import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const excluded = new Set(['.git', 'node_modules', '.DS_Store']);
const binaryExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.zip', '.woff', '.woff2', '.ttf']);
const patterns = [
  {name:'local path', rx:/\/(Users|Volumes)\//g},
  {name:'credential', rx:/(api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"']{8,}["']/gi},
  {name:'GitHub token', rx:/gh[opsu]_[A-Za-z0-9_]{20,}/g},
  {name:'private key', rx:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g},
  {name:'customer phone', rx:/(?<!\d)1[3-9]\d{9}(?!\d)/g},
  {name:'long order-like number', rx:/(?<!\d)\d{16,}(?!\d)/g}
];

const manifestPath = path.join(root, 'privacy-reviewed-binaries.json');
const reviewed = new Map();
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const item of manifest.reviewed || []) {
    if (typeof item.path !== 'string' || !/^[a-f0-9]{64}$/.test(item.sha256 || '') || !item.source) {
      throw new Error('Invalid privacy-reviewed-binaries.json entry');
    }
    reviewed.set(item.path, item);
  }
}

const hits = [];
const reviewedAssets = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const relative = path.relative(root, full);
      if (binaryExtensions.has(path.extname(entry.name).toLowerCase())) {
        const hash = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
        const approval = reviewed.get(relative);
        if (approval?.sha256 === hash) reviewedAssets.push({file:relative, sha256:hash, source:approval.source});
        else hits.push({file:relative, type:'binary asset requires manual review', sample:entry.name});
        continue;
      }
      const stat = fs.statSync(full);
      if (stat.size > 5_000_000) {
        hits.push({file:relative, type:'large text asset requires manual review', sample:String(stat.size)});
        continue;
      }
      const content = fs.readFileSync(full, 'utf8');
      for (const p of patterns) {
        p.rx.lastIndex = 0;
        const match = p.rx.exec(content);
        if (match) hits.push({file:relative, type:p.name, sample:match[0].slice(0, 80)});
      }
    }
  }
}
walk(root);
console.log(JSON.stringify({ok:hits.length === 0, hits, reviewedAssets}, null, 2));
if (hits.length) process.exit(1);
