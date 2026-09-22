import { demoProducts, demoUsers } from '../data/demo-data.js';
import { periodTotals, weeklyBuckets, filterRecordsByPeriod } from '../domain/analytics.js';
import { employeeName, nf, statusChip } from './common.js';

function recordScope(state, session) {
  const company = (state.productionRecords ?? []).filter((record) => record.company_id === session.companyId);
  const mine = company.filter((record) => record.user_id === session.userId);
  return { company, mine };
}

export function renderProduced({ mount, state, session }) {
  const { company, mine } = recordScope(state, session);
  const totals = periodTotals(company);
  const buckets = weeklyBuckets(company);
  const max = Math.max(1, ...buckets.map((bucket) => bucket.quantity));

  mount.innerHTML = `
    <section class="page produced-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">O que já fizemos?</p>
          <h2>Produzido</h2>
          <p>Olha o que nossa equipe já fez! Cada produção registrada conta a nossa história.</p>
        </div>
      </div>

      <div class="grid three kpi-grid">
        <article class="kpi"><span class="kpi-label">Hoje</span><span class="kpi-value">${nf.format(totals.today)}</span><span class="kpi-note">unidades registradas</span></article>
        <article class="kpi"><span class="kpi-label">Semana</span><span class="kpi-value">${nf.format(totals.week)}</span><span class="kpi-note">unidades registradas</span></article>
        <article class="kpi"><span class="kpi-label">Mês</span><span class="kpi-value">${nf.format(totals.month)}</span><span class="kpi-note">unidades registradas</span></article>
      </div>

      <div class="card chart-card">
        <div class="section-row">
          <div><h3 class="card-title">Produção da semana</h3><p class="card-subtitle">Volume registrado nos últimos 7 dias.</p></div>
          <span class="chip pending">Equipe</span>
        </div>
        <div class="bar-chart" role="img" aria-label="Gráfico de produção da semana">
          ${buckets.map((bucket) => `<div class="bar-item"><span class="bar-value">${nf.format(bucket.quantity)}</span><div class="bar-track"><div class="bar-fill" style="height:${Math.max(5, Math.round((bucket.quantity / max) * 100))}%"></div></div><span class="bar-label">${bucket.label}</span></div>`).join('')}
        </div>
      </div>

      <div class="card history-card">
        <div class="section-row history-head">
          <div><h3 class="card-title">Produzidos</h3><p class="card-subtitle">${session.role === 'manager' ? 'Registros da equipe.' : 'Seus registros mais recentes.'}</p></div>
          <div class="segmented" role="group" aria-label="Período">
            <button type="button" data-period="today">Hoje</button>
            <button type="button" data-period="week" class="active">Semana</button>
            <button type="button" data-period="month">Mês</button>
          </div>
        </div>
        <div id="produced-list" class="record-list"></div>
      </div>

      <div class="motivation-card card soft">
        <span class="motivation-icon">✦</span>
        <div><strong>Mandamos bem!</strong><p>Seu trabalho de hoje vira informação para a equipe inteira.</p></div>
      </div>
    </section>`;

  const list = mount.querySelector('#produced-list');
  const source = session.role === 'manager' ? company : mine;
  const draw = (period = 'week') => {
    const records = filterRecordsByPeriod(source, period).sort((a,b) => String(b.recorded_at).localeCompare(String(a.recorded_at)));
    list.innerHTML = records.length ? records.map((record) => {
      const product = demoProducts.find((item) => item.id === record.product_id);
      const when = new Date(record.recorded_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
      return `<article class="record-row history-row"><div class="product-icon small">${product?.icon ?? '▦'}</div><div class="record-main"><strong>${product?.name ?? 'Produto'} ${product?.presentation ?? ''}</strong><span>${when}${session.role === 'manager' ? ` · ${employeeName(demoUsers, record.employee_id)}` : ''}</span><span>${statusChip(record)}</span></div><b>${nf.format(record.declared_quantity)} un.</b></article>`;
    }).join('') : '<div class="empty-state"><strong>Nenhuma produção neste período.</strong><span>Quando houver registros, eles aparecem aqui.</span></div>';
  };
  draw('week');
  mount.querySelectorAll('[data-period]').forEach((button) => button.onclick = () => {
    mount.querySelectorAll('[data-period]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    draw(button.dataset.period);
  });
}
