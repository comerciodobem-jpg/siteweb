import test from 'node:test';
import assert from 'node:assert/strict';
import { motivationFor } from '../src/ui/motivation.js';
import { login, canReview } from '../src/session/session.js';

class MemoryStorage {
  constructor(){ this.map = new Map(); }
  getItem(k){ return this.map.get(k) ?? null; }
  setItem(k,v){ this.map.set(k,String(v)); }
  removeItem(k){ this.map.delete(k); }
}

test('motivation changes by daypart', () => {
  const morning = motivationFor(new Date('2026-09-21T09:00:00-03:00'));
  const afternoon = motivationFor(new Date('2026-09-21T15:00:00-03:00'));
  assert.notEqual(morning, afternoon);
  assert.ok(morning.length > 10);
  assert.ok(afternoon.length > 10);
});

test('login resolves role and review permission', () => {
  const storage = new MemoryStorage();
  const operator = login('u-joao','1111', storage);
  assert.equal(operator.role, 'operator');
  assert.equal(canReview(operator), false);
  const manager = login('u-gestor','9999', storage);
  assert.equal(manager.role, 'manager');
  assert.equal(canReview(manager), true);
});
