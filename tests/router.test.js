import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedRoutes, normalizeRoute } from '../src/ui/router.js';

test('operator does not receive manager review route', () => {
  assert.deepEqual(allowedRoutes({role:'operator'}).map(r => r.id), ['register','produced','results']);
});

test('manager receives review route and invalid route falls back', () => {
  const routes = allowedRoutes({role:'manager'});
  assert.ok(routes.some(r => r.id === 'review'));
  assert.equal(normalizeRoute('review', {role:'operator'}), 'register');
  assert.equal(normalizeRoute('review', {role:'manager'}), 'review');
});
