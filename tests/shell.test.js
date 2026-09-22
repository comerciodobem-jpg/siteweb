import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('app shell exposes accessible landmarks and navigation outlet', async () => {
  const html = await read('index.html');
  assert.match(html, /<header[^>]*class="app-header"/);
  assert.match(html, /<main[^>]*id="app-main"/);
  assert.match(html, /id="primary-nav"/);
  assert.match(html, /id="toast-region"/);
  assert.match(html, /manifest\.webmanifest/);
});

test('manifest describes installable Produzir Registra app', async () => {
  const manifest = JSON.parse(await read('manifest.webmanifest'));
  assert.equal(manifest.name, 'Produzir Registra');
  assert.equal(manifest.short_name, 'Produzir');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.theme_color);
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
});
