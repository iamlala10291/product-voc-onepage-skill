import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [configPath, outputPath] = process.argv.slice(2);
if (!configPath || !outputPath) {
  console.error('Usage: node scripts/build_report.mjs <config.json> <output.html>');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const templatePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../templates/onepage-report.html');
const template = fs.readFileSync(templatePath, 'utf8');
if (!template.includes('__REPORT_DATA__')) throw new Error('Template placeholder __REPORT_DATA__ not found');

const safeJson = JSON.stringify(config).replace(/</g, '\\u003c').replace(/-->/g, '--\\u003e');
const output = template.replace('__REPORT_DATA__', safeJson);
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Built ${path.resolve(outputPath)}`);

