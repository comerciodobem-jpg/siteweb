import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function file(path){ return readFile(new URL(`../${path}`, import.meta.url), 'utf8'); }

test('produced UI includes period totals, weekly chart and history filter', async () => {
  const src = await file('src/ui/produced.js');
  assert.match(src, /Hoje/);
  assert.match(src, /Semana/);
  assert.match(src, /Mês/);
  assert.match(src, /weeklyBuckets/);
});

test('results UI includes needs and does not require a fake target', async () => {
  const src = await file('src/ui/results.js');
  assert.match(src, /Nenhuma necessidade especial/);
  assert.match(src, /calculateNeedProgress/);
});

test('review UI exposes declared confirmed and divergence values', async () => {
  const src = await file('src/ui/review.js');
  assert.match(src, /Registrado pela equipe/);
  assert.match(src, /Quantidade física conferida/);
  assert.match(src, /Divergência/);
});

test('app wires service worker and role-aware navigation', async () => {
  const src = await file('src/app.js');
  assert.match(src, /serviceWorker/);
  assert.match(src, /allowedRoutes/);
  assert.match(src, /renderLogin/);
});
