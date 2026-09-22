import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductionReview } from '../src/domain/review.js';

const product = {
  id: 'p1',
  technical_sheet: { items: [{ material_id: 'm1', quantity_per_unit: 2 }] }
};

function state() {
  return {
    productionRecords: [{ id:'r1', company_id:'c1', product_id:'p1', employee_id:'e1', declared_quantity:5, sync_status:'SYNCED', review_status:'PENDING_REVIEW' }],
    productionReviews: [], stockMovements: [], materialStock: { m1: 6 }, shortages: []
  };
}

test('operator cannot review production', () => {
  assert.throws(() => createProductionReview(state(), { productId:'p1', recordIds:['r1'], confirmedQuantity:5, idempotencyKey:'x' }, { companyId:'c1', userId:'u1', role:'operator' }, { products:[product] }), /permissão/i);
});

test('material stock never becomes negative and shortage is auditable', () => {
  const s = state();
  createProductionReview(s, { productId:'p1', recordIds:['r1'], confirmedQuantity:5, idempotencyKey:'x' }, { companyId:'c1', userId:'m1', role:'manager' }, { products:[product], now:()=>'2026-09-22T12:00:00Z' });
  assert.equal(s.materialStock.m1, 0);
  assert.equal(s.shortages[0].shortage_quantity, 4);
});
