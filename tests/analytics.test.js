import test from 'node:test';
import assert from 'node:assert/strict';
import { periodTotals, weeklyBuckets } from '../src/domain/analytics.js';

const base = new Date('2026-09-22T12:00:00-03:00');
const records = [
  { declared_quantity: 10, recorded_at: '2026-09-22T10:00:00-03:00' },
  { declared_quantity: 20, recorded_at: '2026-09-21T10:00:00-03:00' },
  { declared_quantity: 30, recorded_at: '2026-09-16T10:00:00-03:00' }
];

test('period totals calculate today week month', () => {
  const totals = periodTotals(records, base);
  assert.equal(totals.today, 10);
  assert.equal(totals.week, 30);
  assert.equal(totals.month, 60);
});

test('weekly buckets return seven day quantities ending today', () => {
  const buckets = weeklyBuckets(records, base);
  assert.equal(buckets.length, 7);
  assert.equal(buckets.at(-1).quantity, 10);
  assert.equal(buckets.at(-2).quantity, 20);
});
