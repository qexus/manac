import assert from 'node:assert/strict';
import fs from 'node:fs';
for (const language of ['fr','uk']) {
  const file = language + '/index.html';
  const html = fs.readFileSync(file, 'utf8');
  const nav = html.match(/<nav\b[^>]*class="[^"]*qx-language-switch[^"]*"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  assert(nav, file + ': missing visible language selector');
  const option = [...nav.matchAll(/<a\b[^>]*hreflang="uk"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(option.length, 1, file + ': exactly one Ukrainian option');
  assert.equal(option[0][1].trim(), 'UA', file + ': use UA label');
  assert.match(option[0][0], /\/uk\//, file + ': preserve uk URLs');
}
assert(fs.readFileSync('index.html','utf8').includes('src="https://qexus.github.io/shared/site-i18n.js" defer'), 'Manac should reuse cached central language module');
console.log('Manac FR/UK static switches and dynamic language label checked.');
