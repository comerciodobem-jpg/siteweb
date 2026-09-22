import { REVIEW_STATUS } from './models.js';

function makeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function useTechnicalSheet(state, product, quantity, reviewId, now) {
  if (!product?.technical_sheet?.items?.length) return;
  state.materialStock ??= {};
  state.shortages ??= [];
  state.stockMovements ??= [];

  for (const item of product.technical_sheet.items) {
    const required = Number(item.quantity_per_unit) * quantity;
    const available = Number(state.materialStock[item.material_id] ?? 0);
    const consumed = Math.min(Math.max(available, 0), required);
    state.materialStock[item.material_id] = Math.max(0, available - consumed);
    state.stockMovements.push({
      id: makeId('stk'),
      type: 'MATERIAL_OUT',
      item_id: item.material_id,
      quantity: consumed,
      reference_type: 'production_review',
      reference_id: reviewId,
      created_at: now
    });
    if (required > consumed) {
      state.shortages.push({
        id: makeId('shr'),
        material_id: item.material_id,
        required_quantity: required,
        consumed_quantity: consumed,
        shortage_quantity: required - consumed,
        reference_id: reviewId,
        created_at: now
      });
    }
  }
}

export function createProductionReview(state, input, session, context = {}) {
  if (session?.role !== 'manager') throw new Error('Usuário sem permissão para conferir produção.');
  const confirmedQuantity = Number(input.confirmedQuantity);
  if (!Number.isFinite(confirmedQuantity) || confirmedQuantity < 0) {
    throw new Error('Quantidade conferida inválida.');
  }
  if (!input.idempotencyKey) throw new Error('Chave de idempotência obrigatória.');

  state.productionReviews ??= [];
  state.stockMovements ??= [];
  const existing = state.productionReviews.find((review) => review.idempotency_key === input.idempotencyKey);
  if (existing) return existing;

  const selected = (state.productionRecords ?? []).filter((record) =>
    input.recordIds.includes(record.id) &&
    record.product_id === input.productId &&
    record.company_id === session.companyId &&
    record.review_status === REVIEW_STATUS.PENDING &&
    record.sync_status === 'SYNCED'
  );
  if (!selected.length) throw new Error('Nenhum registro elegível para conferência.');

  const declaredTotal = selected.reduce((sum, record) => sum + Number(record.declared_quantity), 0);
  const now = context.now?.() ?? new Date().toISOString();
  const status = confirmedQuantity === declaredTotal ? REVIEW_STATUS.CONFIRMED : REVIEW_STATUS.DIVERGENT;
  const review = {
    id: makeId('rev'),
    company_id: session.companyId,
    product_id: input.productId,
    record_ids: selected.map((record) => record.id),
    declared_total: declaredTotal,
    confirmed_quantity: confirmedQuantity,
    difference_quantity: confirmedQuantity - declaredTotal,
    reviewer_user_id: session.userId,
    reviewed_at: now,
    status,
    notes: input.notes ?? '',
    idempotency_key: input.idempotencyKey,
    contributors: selected.reduce((acc, record) => {
      acc[record.employee_id] = (acc[record.employee_id] ?? 0) + Number(record.declared_quantity);
      return acc;
    }, {})
  };

  state.productionReviews.push(review);
  for (const record of selected) record.review_status = status;
  state.stockMovements.push({
    id: makeId('stk'),
    type: 'FINISHED_GOODS_IN',
    item_id: input.productId,
    quantity: confirmedQuantity,
    reference_type: 'production_review',
    reference_id: review.id,
    created_at: now
  });

  const product = context.products?.find((item) => item.id === input.productId);
  useTechnicalSheet(state, product, confirmedQuantity, review.id, now);
  return review;
}

export function groupPendingByProduct(state, companyId) {
  const groups = new Map();
  for (const record of state.productionRecords ?? []) {
    if (record.company_id !== companyId || record.review_status !== REVIEW_STATUS.PENDING || record.sync_status !== 'SYNCED') continue;
    const group = groups.get(record.product_id) ?? { productId: record.product_id, total: 0, records: [] };
    group.total += Number(record.declared_quantity);
    group.records.push(record);
    groups.set(record.product_id, group);
  }
  return [...groups.values()];
}
