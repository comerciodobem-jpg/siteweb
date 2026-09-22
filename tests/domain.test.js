import test from 'node:test';
import assert from 'node:assert/strict';
import { findProductByBarcode } from '../src/domain/models.js';
import { createProductionRecord } from '../src/domain/production.js';
import { createProductionReview } from '../src/domain/review.js';
import { calculateNeedProgress } from '../src/domain/needs.js';

const products = [{ id: 'p1', barcode: '7891', name: 'Colorau 100 g' }];

test('finds product by barcode', () => {
  assert.equal(findProductByBarcode(products, '7891')?.id, 'p1');
  assert.equal(findProductByBarcode(products, '0000'), null);
});

test('production record requires positive quantity and session authorship', () => {
  const state = { productionRecords: [] };
  const session = { companyId: 'c1', userId: 'u1', employeeId: 'e1' };
  const record = createProductionRecord(state, { product: products[0], quantity: 25, idempotencyKey: 'k1' }, session, { now: () => '2026-09-22T10:00:00-03:00', online: true });
  assert.equal(record.user_id, 'u1');
  assert.equal(record.employee_id, 'e1');
  assert.equal(record.declared_quantity, 25);
  assert.equal(record.review_status, 'PENDING_REVIEW');
  assert.equal(record.sync_status, 'SYNCED');
  assert.throws(() => createProductionRecord(state, { product: products[0], quantity: 0, idempotencyKey: 'k2' }, session), /maior que zero/i);
});

test('production record is idempotent', () => {
  const state = { productionRecords: [] };
  const session = { companyId: 'c1', userId: 'u1', employeeId: 'e1' };
  const args = { product: products[0], quantity: 25, idempotencyKey: 'same' };
  const a = createProductionRecord(state, args, session);
  const b = createProductionRecord(state, args, session);
  assert.equal(a.id, b.id);
  assert.equal(state.productionRecords.length, 1);
});

test('review preserves declared total and records confirmed quantity separately', () => {
  const state = {
    productionRecords: [
      { id: 'r1', product_id: 'p1', company_id: 'c1', employee_id: 'e1', declared_quantity: 50, review_status: 'PENDING_REVIEW', sync_status: 'SYNCED' },
      { id: 'r2', product_id: 'p1', company_id: 'c1', employee_id: 'e2', declared_quantity: 40, review_status: 'PENDING_REVIEW', sync_status: 'SYNCED' }
    ],
    productionReviews: [], stockMovements: [], materialStock: {}, shortages: []
  };
  const manager = { companyId: 'c1', userId: 'm1', role: 'manager' };
  const review = createProductionReview(state, { productId: 'p1', recordIds: ['r1','r2'], confirmedQuantity: 85, idempotencyKey: 'rv1' }, manager, { products });
  assert.equal(review.declared_total, 90);
  assert.equal(review.confirmed_quantity, 85);
  assert.equal(review.difference_quantity, -5);
  assert.equal(state.productionRecords[0].declared_quantity, 50);
  assert.equal(state.stockMovements[0].quantity, 85);
});

test('need progress uses confirmed reviews and never invents target', () => {
  const need = { product_id: 'p1', target_quantity: 4500 };
  const reviews = [{ product_id: 'p1', confirmed_quantity: 1800 }, { product_id: 'p1', confirmed_quantity: 600 }];
  assert.deepEqual(calculateNeedProgress(need, reviews), { target: 4500, confirmed: 2400, remaining: 2100, percent: 53 });
  assert.equal(calculateNeedProgress(null, reviews), null);
});
