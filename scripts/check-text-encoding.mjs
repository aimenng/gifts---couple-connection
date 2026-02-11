import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INCLUDE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.md']);
const IGNORE_DIRS = new Set([
  '.git',
  '.codex',
  'node_modules',
  'dist',
  'backend/node_modules',
]);

const CHECKS = [
  { name: 'replacement-char', regex: /�/u },
  { name: 'private-use-char', regex: /[\uE000-\uF8FF]/u },
  { name: 'broken-jsx-closing', regex: /\?\/(p|span|label|h[1-6])>/u },
  { name: 'broken-surrogate-snippet', regex: /(痐|歿)/u },
];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(ROOT, fullPath).replaceAll('\\', '/');

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(relative) || IGNORE_DIRS.has(entry.name)) continue;
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!INCLUDE_EXT.has(ext)) continue;
    files.push(fullPath);
  }

  return files;
}

function hasCheckableText(filePath) {
  return !filePath.includes('tmpclaude-');
}

function firstMatchingCheck(line) {
  for (const check of CHECKS) {
    if (check.regex.test(line)) return check.name;
  }
  return null;
}

async function main() {
  const files = await walk(ROOT);
  const findings = [];

  for (const filePath of files) {
    if (!hasCheckableText(filePath)) continue;
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      const match = firstMatchingCheck(line);
      if (!match) return;
      findings.push({
        file: path.relative(ROOT, filePath).replaceAll('\\', '/'),
        line: index + 1,
        rule: match,
        preview: line.trim().slice(0, 120),
      });
    });
  }

  if (findings.length === 0) {
    console.log('Encoding check passed: no suspicious text artifacts found.');
    return;
  }

  console.error('Encoding check failed. Suspicious text artifacts:');
  findings.forEach((item) => {
    console.error(`- ${item.file}:${item.line} [${item.rule}] ${item.preview}`);
  });
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

