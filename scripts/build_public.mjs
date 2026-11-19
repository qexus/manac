// Explicit allowlist of deployable Manac web assets. Never upload the repo root.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';

const output = 'dist';
const files = [
  '.nojekyll', 'index.html', 'fr/index.html', 'uk/index.html',
  'style.css', 'i18n.css', 'filter.js',
  'assets/qx-logo-180.png', 'assets/qx-favicon-48.png'
];
rmSync(output, { recursive: true, force: true });
for (const file of files) {
  assert(existsSync(file), 'Missing approved public asset: ' + file);
  const dest = join(output, file);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(file, dest);
}
for (const htmlName of ['index.html', 'fr/index.html', 'uk/index.html']) {
  const page = readFileSync(join(output, htmlName), 'utf8');
  for (const match of page.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith('http:') || href.startsWith('https:') || href.startsWith('/') || href.startsWith('#') || href.startsWith('data:')) continue;
    const target = posix.normalize(posix.join(posix.dirname(htmlName), href.split(/[?#]/)[0]));
    assert(!target.startsWith('../'), 'Public HTML asset escapes Manac directory: ' + href);
    assert(existsSync(join(output, target)), htmlName + ' references missing public asset ' + href);
  }
}
const publicFiles = [];
function walk(dir) {
  for (const item of readdirSync(dir)) {
    const file = join(dir, item);
    if (statSync(file).isDirectory()) walk(file);
    else publicFiles.push(file.replace(/\\/g, '/').slice(output.length + 1));
  }
}
walk(output);
assert.deepEqual(publicFiles.sort(), [...files].sort(), 'Unexpected file escaped into Pages artifact');
assert(publicFiles.every(file => !/\.(md|map|json|log|zip)$/.test(file) && !file.startsWith('.github/')), 'Internal files must never be published');
console.log('Manac public build: ' + publicFiles.length + ' approved files; repository docs, tests and CI excluded.');
