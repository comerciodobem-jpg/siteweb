import { demoProducts } from '../data/demo-data.js';
import { periodTotals, weeklyBuckets } from '../domain/analytics.js';
import { activeNeeds, calculateNeedProgress, needStatus } from '../domain/needs.js';
import { nf } from './common.js';

export function renderResults({ mount, state, session }) {
  const records = (state.productionRecords ?? []).filter((record) => record.company_id === session.companyId);
  const reviews = (state.productionReviews ?? []).filter((review) => review.company_id === session.companyId);
  const totals = periodTotals(records);
  const buckets = weeklyBuckets(records);
  const confirmedMonth = reviews.reduce((sum, review) => sum + Number(review.confirmed_quantity || 0), 0);
  const needs = activeNeeds(state, session.companyId);
  const urgent = needs.filter((need) => need.priority === 'URGENT');

  mount.innerHTML = `
    <section class="page results-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Como estamos indo?</p>
          <h2>Nosso Resultado</h2>
          <p>Uma visão simples do que a equipe está construindo — sem inventar meta quando ela não existe.</p>
        </div>
      </div>

      ${urgent.length ? `<button class="urgent-banner" type="button" id="urgent-jump"><span class="urgent-pulse">!</span><span><strong>URGENTE (${urgent.length})</strong><small>Produções que precisam de atenção imediata.</small></span><b>›</b></button>` : ''}

      <div class="result-hero card">
        <div>
          <span class="kpi-label">Registrado neste mês</span>
          <strong class="result-big">${nf.format(totals.month)} <small>un.</small></strong>
          <p>Produção declarada pela equipe.</p>
        </div>
        <div class="result-confirmed">
          <span>Já conferido</span>
          <strong>${nf.format(confirmedMonth)} un.</strong>
          <small>O estoque oficial só recebe o que foi validado.</small>
        </div>
      </div>

      <div class="grid two">
        <article class="card"><span class="kpi-label">Hoje</span><strong class="mini-result">${nf.format(totals.today)} un.</strong><p class="card-subtitle">registradas pela equipe</p></article>
        <article class="card"><span class="kpi-label">Semana</span><strong class="mini-result">${nf.format(totals.week)} un.</strong><p class="card-subtitle">registradas pela equipe</p></article>
      </div>

      <div class="card trend-card">
        <div class="section-row"><div><h3 class="card-title">Ritmo dos últimos dias</h3><p class="card-subtitle">Sem competição entre pessoas — o resultado é coletivo.</p></div><span class="chip confirmed">Equipe</span></div>
        <div class="spark-bars">${buckets.map((bucket) => `<div title="${bucket.label}: ${bucket.quantity} un."><span style="height:${Math.max(8, Math.min(100, bucket.quantity / Math.max(1, ...buckets.map(b=>b.quantity)) * 100))}%"></span><small>${bucket.label}</small></div>`).join('')}</div>
      </div>

      <div class="card needs-card" id="needs-card">
        <div class="section-row"><div><h3 class="card-title">Necessidades de produção</h3><p class="card-subtitle">Quando existe uma demanda específica, ela aparece aqui. A produção livre continua normal.</p></div><span class="count-pill">${needs.length}</span></div>
        <div class="needs-list">
          ${needs.length ? needs.map((need) => {
            const product = demoProducts.find((item) => item.id === need.product_id);
            const progress = calculateNeedProgress(need, reviews);
            const status = needStatus(need, reviews);
            return `<article class="need-item ${need.priority === 'URGENT' ? 'is-urgent' : ''}">
              <div class="need-top"><div class="product-icon">${product?.icon ?? '▦'}</div><div class="need-copy"><span>${need.priority === 'URGENT' ? '<b class="urgent-text">URGENTE</b>' : 'Necessidade'}</span><strong>${product?.name ?? 'Produto'} ${product?.presentation ?? ''}</strong><small>${need.note ?? ''}</small></div><span class="need-percent">${progress.percent}%</span></div>
              <div class="progress-track"><span style="width:${progress.percent}%"></span></div>
              <div class="need-stats"><span><small>Necessário</small><b>${nf.format(progress.target)}</b></span><span><small>Conferido</small><b>${nf.format(progress.confirmed)}</b></span><span><small>Faltam</small><b>${nf.format(progress.remaining)}</b></span></div>
              <span class="need-status">${status === 'OPEN' ? 'Aguardando produção conferida' : status === 'IN_PROGRESS' ? 'Em andamento' : 'Concluída'}</span>
            </article>`;
          }).join('') : '<div class="empty-state"><strong>Nenhuma necessidade especial no momento.</strong><span>Continue a produção normalmente. Quando surgir uma prioridade, ela aparecerá aqui.</span></div>'}
        </div>
      </div>

      <div class="motivation-card card soft"><span class="motivation-icon">✦</span><div><strong>Você produz. Você registra. A gente cresce junto.</strong><p>O resultado aparece porque a equipe registra a realidade do chão de fábrica.</p></div></div>
    </section>`;

  mount.querySelector('#urgent-jump')?.addEventListener('click', () => mount.querySelector('#needs-card')?.scrollIntoView({ behavior:'smooth', block:'center' }));
}
