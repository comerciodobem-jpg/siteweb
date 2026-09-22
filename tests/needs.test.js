import test from 'node:test';
import assert from 'node:assert/strict';
import { needStatus, calculateNeedProgress } from '../src/domain/needs.js';

test('need progresses and completes from confirmed production', () => {
  const need = { product_id:'p1', target_quantity:100 };
  assert.equal(needStatus(need, []), 'OPEN');
  assert.equal(needStatus(need, [{product_id:'p1', confirmed_quantity:25}]), 'IN_PROGRESS');
  assert.equal(needStatus(need, [{product_id:'p1', confirmed_quantity:100}]), 'COMPLETED');
  assert.equal(calculateNeedProgress(need, [{product_id:'p1', confirmed_quantity:125}]).remaining, 0);
});
