import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Source inventory only. It does not infer that every line is a requirement,
// or that unreviewed lines satisfy any release classification.
const source = readFileSync('docs/business/MASTER_DIRECTIVE.md', 'utf8');
const lines = source.split(/\r?\n/);
const csv = value => `"${String(value).replaceAll('"', '""')}"`;
const rows = [['Source line','Section context','Exact source line','Review state','Evidence / reason']];
let section = 'Document opening';
for (let i = 0; i < lines.length; i++) {
 const line = lines[i];
 const trimmed = line.trim();
 if (!trimmed || /^[=-]{3,}$/.test(trimmed)) continue;
 const next = (lines[i+1] || '').trim();
 if (/^#{1,6}\s/.test(trimmed) || /^[=-]{3,}$/.test(next)) section = trimmed.replace(/^#+\s*/, '');
 rows.push([i+1, section, line, 'REVIEW REQUIRED', 'Source inventory; not yet classified or linked to evidence']);
}
writeFileSync('docs/manager/DIRECTIVE_SOURCE_INVENTORY.csv', rows.map(row => row.map(csv).join(',')).join('\n')+'\n');
console.log(`Inventoried ${rows.length-1} nonempty source lines; SHA-256 ${createHash('sha256').update(source).digest('hex')}`);
