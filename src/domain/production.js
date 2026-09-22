import { REVIEW_STATUS, SYNC_STATUS } from './models.js';

function makeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${globalThis.crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function createProductionRecord(state, input, session, env = {}) {
  const quantity = Number(input.quantity);
  if (!session?.userId || !session?.employeeId || !session?.companyId) {
    throw new Error('Sessão de colaborador inválida.');
  }
  if (!input?.product?.id) throw new Error('Produto inválido.');
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('A quantidade deve ser maior que zero.');
  }
  if (!input.idempotencyKey) throw new Error('Chave de idempotência obrigatória.');

  state.productionRecords ??= [];
  const existing = state.productionRecords.find((record) => record.idempotency_key === input.idempotencyKey);
  if (existing) return existing;

  const now = env.now?.() ?? new Date().toISOString();
  const online = env.online ?? globalThis.navigator?.onLine ?? true;
  const record = {
    id: makeId('prd'),
    company_id: session.companyId,
    user_id: session.userId,
    employee_id: session.employeeId,
    product_id: input.product.id,
    barcode: input.product.barcode,
    declared_quantity: quantity,
    unit: input.product.control_unit ?? 'un',
    recorded_at: now,
    local_recorded_at: now,
    sync_status: online ? SYNC_STATUS.SYNCED : SYNC_STATUS.LOCAL_PENDING,
    review_status: REVIEW_STATUS.PENDING,
    idempotency_key: input.idempotencyKey,
    source_device_id: input.sourceDeviceId ?? 'web-pwa',
    production_need_id: input.productionNeedId ?? null,
    packaging_breakdown: input.packagingBreakdown ?? null
  };
  state.productionRecords.push(record);
  return record;
}

export function listUserRecords(state, session) {
  return (state.productionRecords ?? [])
    .filter((record) => record.company_id === session.companyId && record.user_id === session.userId)
    .sort((a, b) => String(b.recorded_at).localeCompare(String(a.recorded_at)));
}
