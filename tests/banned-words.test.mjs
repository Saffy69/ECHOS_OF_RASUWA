import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Allowed disclaimer patterns that qualify as explicit "what this is NOT" statements.
// Strictly specific phrases only — NO broad catch-alls like /disclaimer/ or /limitation/
const ALLOWED_DISCLAIMER_PATTERNS = [
  /does\s+not\s+predict/i,
  /cannot\s+predict/i,
  /never\s+predicts/i,
  /not\s+predict/i,
  /not\s+a\s+(?:warning|forecast|probability\s+or\s+forecast|reconstruction\s+or\s+event\s+forecast)/i,
  /not\s+an\s+early\s+warning/i,
  /can\s+(?:insar|radar)\s+predict/i,
  /detection\s*≠\s*.*prediction/i,
  /≠\s*.*prediction/i,
  /not\s+a\s+(?:unique\s+cause\s+or\s+disaster-timing\s+|disaster-timing\s+|timing\s+|flood\s+|collapse\s+|failure\s+)?prediction/i,
  /without\s+pretending\s+to\s+predict/i,
  /what\s+this\s+prototype\s+cannot/i,
  /prediction\s+of\s+worldwide\s+energy\s+resources/i, // Official NASA POWER acronym expansion
  /toy\s+(?:evidence-check|checklist)/i,
  /not\s+a\s+forecast/i,
  /not\s+a\s+prediction/i,
  /no\s+(?:local\s+sensor\s+measurement,\s+)?validated\s+prediction/i,
  /no\s+(?:historical\s+measurement,\s+)?validated\s+forecast/i,
  /no\s+(?:local\s+measurement\s+or\s+)?forecast/i,
  /no\s+prediction\s+or\s+forecast/i,
  /no\s+warning\s+service/i
];

const BANNED_TERMS_REGEX = /\b(predict(?:s|ed|ing|ion)?|forecast(?:s|ed|ing)?|early\s+warning|probability\s+of\s+(?:failure|flood|collapse))\b/i;

async function getFiles(dir, extensions) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath, extensions)));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

test('science honesty gate: no prediction, forecast, or operational warning claims outside explicit disclaimers', async () => {
  const srcFiles = await getFiles(new URL('../src', import.meta.url).pathname, ['.ts', '.tsx']);
  const violations = [];

  for (const filePath of srcFiles) {
    const content = await readFile(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      // Ignore comment lines that only name state variables or types
      const trimmed = line.trim();
      if (trimmed.startsWith('//') && trimmed.includes('state')) return;

      const match = BANNED_TERMS_REGEX.exec(line);
      if (match) {
        const isExempt = ALLOWED_DISCLAIMER_PATTERNS.some(pat => pat.test(line));
        if (!isExempt) {
          violations.push({
            file: filePath.split('/src/')[1],
            line: lineIndex + 1,
            term: match[0],
            snippet: trimmed
          });
        }
      }
    });
  }

  assert.equal(
    violations.length,
    0,
    `Found ${violations.length} prohibited prediction/forecast claim(s) outside explicit disclaimers:\n` +
      violations.map(v => `  at src/${v.file}:${v.line} [${v.term}]: "${v.snippet}"`).join('\n')
  );
});
