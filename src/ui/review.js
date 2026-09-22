import { demoProducts, demoUsers } from '../data/demo-data.js';
import { createProductionReview, groupPendingByProduct } from '../domain/review.js';
import { calculateNeedProgress } from '../domain/needs.js';
import { saveState } from '../storage/store.js';
import { employeeName, makeIdempotencyKey, nf, toast } from './common.js';

export function renderReview({ mount, state, session, rerender }) {
  if (session.role !== 'manager') {
    mount.innerHTML = '<section class="page"><div class="empty-state"><strong>Acesso restrito.</strong><span>Somente conferentes autorizados podem validar produção.</span></div></section>';
    return;
  }
  const groups = groupPendingByProduct(state, session.companyId);
  mount.innerHTML = `
    <section class="page review-page">
      <div class="page-heading"><div><p class="eyebrow">Validação do estoque</p><h2>Conferir</h2><p>Confira o total físico. Você não precisa redigitar o que a equipe já lançou.</p></div><span class="review-counter">${groups.length}</span></div>
      <div class="review-info card soft"><div class="info-icon">i</div><div><strong>O estoque só muda depois daqui.</strong><p>O declarado pelo colaborador fica preservado. Você confirma a quantidade física e o sistema registra qualquer divergência.</p></div></div>
      <div class="review-list">
        ${groups.length ? groups.map((group) => {
          const product = demoProducts.find((item) => item.id === group.productId);
          const contributors = group.records.reduce((acc, record) => { acc[record.employee_id] = (acc[record.employee_id] ?? 0) + Number(record.declared_quantity); return acc; }, {});
          return `<article class="review-card card" data-product-id="${group.productId}">
            <div class="review-card-top"><div class="product-icon">${product?.icon ?? '▦'}</div><div class="review-title"><span>Registrado pela equipe</span><strong>${product?.name ?? 'Produto'} ${product?.presentation ?? ''}</strong><small>${group.records.length} registro${group.records.length === 1 ? '' : 's'} aguardando</small></div><b class="review-total">${nf.format(group.total)} <small>un.</small></b></div>
            <div class="contributors">${Object.entries(contributors).map(([employeeId, qty]) => `<div><span>${employeeName(demoUsers, employeeId)}</span><b>${nf.format(qty)} un.</b></div>`).join('')}</div>
            <div class="review-form">
              <div class="form-field"><label>Quantidade física conferida</label><input class="input input-lg confirmed-input" inputmode="numeric" min="0" value="${group.total}"></div>
              <div class="difference-preview"><span>Divergência</span><strong class="difference-value neutral">0 un.</strong></div>
            </div>
            <div class="review-actions"><button class="btn btn-primary confirm-review" type="button">Confirmar produção</button></div>
          </article>`;
        }).join('') : '<div class="card empty-state"><strong>Tudo conferido por aqui.</strong><span>Não há registros sincronizados aguardando validação.</span></div>'}
      </div>
      ${state.shortages?.length ? `<div class="card shortage-card"><div class="section-row"><div><h3 class="card-title">Atenções de matéria-prima</h3><p class="card-subtitle">Produções físicas confirmadas com saldo teórico insuficiente.</p></div><span class="chip divergent">${state.shortages.length}</span></div>${state.shortages.slice(-4).map((item) => `<div class="shortage-row"><span>${item.material_id}</span><b>Faltaram ${nf.format(item.shortage_quantity)}</b></div>`).join('')}</div>` : ''}
    </section>`;

  mount.querySelectorAll('.review-card').forEach((card) => {
    const productId = card.dataset.productId;
    const group = groups.find((item) => item.productId === productId);
    const input = card.querySelector('.confirmed-input');
    const difference = card.querySelector('.difference-value');
    const updateDiff = () => {
      const value = Number(input.value || 0) - group.total;
      difference.textContent = `${value > 0 ? '+' : ''}${nf.format(value)} un.`;
      difference.className = `difference-value ${value === 0 ? 'neutral' : 'has-difference'}`;
    };
    input.oninput = updateDiff;
    card.querySelector('.confirm-review').onclick = () => {
      const button = card.querySelector('.confirm-review');
      button.disabled = true;
      try {
        const confirmedQuantity = Number(input.value);
        const review = createProductionReview(state, {
          productId,
          recordIds: group.records.map((record) => record.id),
          confirmedQuantity,
          idempotencyKey: makeIdempotencyKey('review')
        }, session, { products: demoProducts });

        for (const need of state.productionNeeds ?? []) {
          if (need.product_id !== productId || need.status === 'CANCELLED') continue;
          const progress = calculateNeedProgress(need, state.productionReviews);
          if (progress.remaining === 0) { need.status = 'COMPLETED'; need.completed_at = new Date().toISOString(); }
          else if (progress.confirmed > 0) need.status = 'IN_PROGRESS';
        }
        saveState(state);
        toast(review.difference_quantity === 0 ? 'Produção confirmada e estoque atualizado.' : `Produção confirmada com divergência de ${review.difference_quantity} un.`, review.difference_quantity === 0 ? 'success' : 'error');
        rerender();
      } catch (error) {
        button.disabled = false;
        toast(error.message, 'error');
      }
    };
  });
}
