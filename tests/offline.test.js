import test from 'node:test';
import assert from 'node:assert/strict';
import { enqueueRecord, flushQueue } from '../src/offline/sync.js';

test('offline queue retries without duplicating idempotency key', async () => {
  const queue = [];
  enqueueRecord(queue, { id:'r1', idempotency_key:'k1', sync_status:'LOCAL_PENDING' });
  enqueueRecord(queue, { id:'r2', idempotency_key:'k1', sync_status:'LOCAL_PENDING' });
  assert.equal(queue.length, 1);
  const sent = [];
  await flushQueue(queue, async (record) => { sent.push(record.idempotency_key); return { ok:true }; });
  assert.deepEqual(sent, ['k1']);
  assert.equal(queue.length, 0);
});
