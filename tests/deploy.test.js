import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('service worker pre-caches complete app shell modules', async () => {
  const sw = await read('sw.js');
  assert.match(sw, /src\/ui\/register\.js/);
  assert.match(sw, /src\/ui\/review\.js/);
  assert.match(sw, /src\/domain\/production\.js/);
});

test('vercel config and deployment guide exist', async () => {
  const config = JSON.parse(await read('vercel.json'));
  assert.ok(config.headers?.length > 0);
  const guide = await read('docs/produzir-registra/12-RUN-AND-DEPLOY.md');
  assert.match(guide, /Vercel/i);
  assert.match(guide, /node --test/);
});
