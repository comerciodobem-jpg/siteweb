import { findProductById } from '../domain/models.js';

export const nf = new Intl.NumberFormat('pt-BR');
export const dtf = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export function productName(products, productId) {
  const product = findProductById(products, productId);
  return product ? `${product.name} ${product.presentation}` : 'Produto';
}

export function employeeName(users, employeeId) {
  return users.find((user) => user.employeeId === employeeId)?.name ?? 'Colaborador';
}

export function statusChip(record) {
  if (record.sync_status === 'LOCAL_PENDING') return '<span class="chip sync">Pendente de sincronização</span>';
  if (record.review_status === 'CONFIRMED') return '<span class="chip confirmed">Confirmado</span>';
  if (record.review_status === 'DIVERGENT') return '<span class="chip divergent">Divergente</span>';
  return '<span class="chip pending">Aguardando conferência</span>';
}

export function makeIdempotencyKey(prefix = 'action') {
  if (globalThis.crypto?.randomUUID) return `${prefix}:${globalThis.crypto.randomUUID()}`;
  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export function toast(message, type = 'info') {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  region.append(el);
  setTimeout(() => el.remove(), 3200);
}
