import { findProductByBarcode, convertPackaging } from '../domain/models.js';
import { createProductionRecord, listUserRecords } from '../domain/production.js';
import { demoProducts } from '../data/demo-data.js';
import { saveState } from '../storage/store.js';
import { canUseNativeScanner, startBarcodeScanner } from '../scanner/barcode.js';
import { makeIdempotencyKey, nf, statusChip, toast } from './common.js';

function productCard(product) {
  return `
    <div class="selected-product" data-product-id="${product.id}">
      <div class="product-icon">${product.icon ?? '▦'}</div>
      <div class="product-copy">
        <span class="product-kicker">Produto identificado</span>
        <strong>${product.name}</strong>
        <span>${product.presentation} · ${product.sku}</span>
      </div>
      <span class="chip confirmed">Encontrado</span>
    </div>`;
}

export function renderRegister({ mount, state, session, rerender, online = navigator.onLine }) {
  const recent = listUserRecords(state, session).slice(0, 5);
  mount.innerHTML = `
    <section class="page register-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Produção rápida</p>
          <h2>Registrar produção</h2>
          <p>Leia o código de barras, informe a quantidade e pronto.</p>
        </div>
      </div>

      <div class="scanner-card card">
        <div class="scanner-head">
          <div>
            <h3 class="card-title">Leitor de código de barras</h3>
            <p class="card-subtitle">Aponte a câmera para a etiqueta do produto.</p>
          </div>
          <span class="chip ${online ? 'confirmed' : 'sync'}">${online ? 'Online' : 'Offline'}</span>
        </div>
        <div class="scanner-window" id="scanner-window">
          <video id="scanner-video" muted playsinline></video>
          <div class="scan-frame" aria-hidden="true"><span></span></div>
          <div class="scanner-empty" id="scanner-empty">
            <div class="scanner-glyph">▦</div>
            <strong>Pronto para ler</strong>
            <span>${canUseNativeScanner() ? 'Use a câmera ou digite o código.' : 'Digite o código ou busque o produto.'}</span>
          </div>
        </div>
        <div class="scanner-actions">
          <button class="btn btn-primary" type="button" id="start-camera">Abrir câmera</button>
          <button class="btn btn-secondary" type="button" id="manual-code">Digitar código</button>
          <button class="btn btn-ghost" type="button" id="search-product">Buscar produto</button>
        </div>
      </div>

      <div id="registration-panel" hidden></div>

      <div class="card recent-card">
        <div class="section-row">
          <div>
            <h3 class="card-title">Últimos registrados por você</h3>
            <p class="card-subtitle">Confirme rapidamente se o lançamento entrou.</p>
          </div>
          <span class="count-pill">${recent.length}</span>
        </div>
        <div class="record-list">
          ${recent.length ? recent.map((record) => {
            const product = demoProducts.find((item) => item.id === record.product_id);
            const time = new Date(record.recorded_at).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
            return `<article class="record-row"><div class="product-icon small">${product?.icon ?? '▦'}</div><div class="record-main"><strong>${product?.name ?? 'Produto'} ${product?.presentation ?? ''}</strong><span>${time} · ${statusChip(record)}</span></div><b>${nf.format(record.declared_quantity)} un.</b></article>`;
          }).join('') : '<div class="empty-state"><strong>Nenhum registro seu ainda.</strong><span>Seu primeiro lançamento aparecerá aqui.</span></div>'}
        </div>
      </div>
    </section>`;

  let stopScanner = null;
  let selectedProduct = null;
  let submitting = false;

  const panel = mount.querySelector('#registration-panel');
  const showProduct = (product) => {
    selectedProduct = product;
    stopScanner?.(); stopScanner = null;
    panel.hidden = false;
    const pack = product.package_conversion;
    panel.innerHTML = `
      <div class="card registration-card">
        ${productCard(product)}
        <div class="quantity-zone">
          <div class="form-field">
            <label for="production-quantity">Quantidade produzida</label>
            <input class="input input-lg" id="production-quantity" inputmode="numeric" min="1" step="1" placeholder="0" autofocus />
          </div>
          ${pack ? `<button class="pack-toggle" type="button" id="pack-toggle">Usar ${pack.name}s (${pack.multiplier} un.)</button><div class="pack-fields" id="pack-fields" hidden><div class="form-field"><label>Quantidade de ${pack.name}s</label><input class="input" id="pack-count" inputmode="numeric" min="0" value="0"></div><div class="form-field"><label>Unidades soltas</label><input class="input" id="loose-count" inputmode="numeric" min="0" value="0"></div><div class="pack-total">Total: <strong id="pack-total">0 un.</strong></div></div>` : ''}
        </div>
        <div class="registration-actions"><button class="btn btn-ghost" type="button" id="cancel-registration">Cancelar</button><button class="btn btn-primary" type="button" id="confirm-registration">Registrar produção</button></div>
      </div>`;
    panel.scrollIntoView({ behavior:'smooth', block:'center' });
    panel.querySelector('#production-quantity')?.focus();

    panel.querySelector('#cancel-registration').onclick = () => { panel.hidden = true; selectedProduct = null; };
    const toggle = panel.querySelector('#pack-toggle');
    if (toggle) {
      toggle.onclick = () => { const fields = panel.querySelector('#pack-fields'); fields.hidden = !fields.hidden; };
      const updatePack = () => {
        const total = convertPackaging(product, panel.querySelector('#pack-count').value, panel.querySelector('#loose-count').value);
        panel.querySelector('#pack-total').textContent = `${nf.format(total)} un.`;
        panel.querySelector('#production-quantity').value = total || '';
      };
      panel.querySelector('#pack-count').oninput = updatePack;
      panel.querySelector('#loose-count').oninput = updatePack;
    }
    panel.querySelector('#confirm-registration').onclick = () => {
      if (submitting) return;
      submitting = true;
      const button = panel.querySelector('#confirm-registration');
      button.disabled = true;
      try {
        const quantity = Number(panel.querySelector('#production-quantity').value);
        createProductionRecord(state, { product, quantity, idempotencyKey: makeIdempotencyKey('production') }, session, { online: navigator.onLine });
        saveState(state);
        toast(navigator.onLine ? 'Produção registrada. Aguardando conferência.' : 'Registro salvo offline. Será sincronizado quando a conexão voltar.');
        rerender();
      } catch (error) {
        toast(error.message, 'error');
        button.disabled = false;
        submitting = false;
      }
    };
  };

  const resolveBarcode = (barcode) => {
    const product = findProductByBarcode(demoProducts, barcode);
    if (!product) { toast('Produto não encontrado para este código.', 'error'); return; }
    showProduct(product);
  };

  mount.querySelector('#manual-code').onclick = () => {
    const code = prompt('Digite o código de barras do produto:');
    if (code) resolveBarcode(code);
  };

  mount.querySelector('#search-product').onclick = () => {
    const modal = document.getElementById('modal-root');
    modal.innerHTML = `<div class="modal-backdrop"><div class="modal-card card"><div class="section-row"><div><p class="eyebrow">Catálogo</p><h3>Buscar produto</h3></div><button class="icon-button" id="close-modal" aria-label="Fechar">×</button></div><input class="input" id="product-search-input" placeholder="Nome, apresentação ou código"><div class="product-search-list" id="product-search-list"></div></div></div>`;
    const list = modal.querySelector('#product-search-list');
    const input = modal.querySelector('#product-search-input');
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      list.innerHTML = demoProducts.filter((p) => !q || `${p.name} ${p.presentation} ${p.sku}`.toLowerCase().includes(q)).map((p) => `<button class="product-search-item" data-id="${p.id}"><span class="product-icon small">${p.icon}</span><span><strong>${p.name}</strong><small>${p.presentation} · ${p.sku}</small></span><b>›</b></button>`).join('');
      list.querySelectorAll('button').forEach((button) => button.onclick = () => { const p = demoProducts.find((item) => item.id === button.dataset.id); modal.innerHTML=''; showProduct(p); });
    };
    input.oninput = draw; draw(); input.focus();
    modal.querySelector('#close-modal').onclick = () => modal.innerHTML='';
  };

  mount.querySelector('#start-camera').onclick = async () => {
    const video = mount.querySelector('#scanner-video');
    const empty = mount.querySelector('#scanner-empty');
    try {
      stopScanner?.();
      stopScanner = await startBarcodeScanner({ video, onDetect: resolveBarcode, onError: () => {} });
      empty.hidden = true;
    } catch (error) {
      toast(`${error.message} Use “Digitar código” ou “Buscar produto”.`, 'error');
    }
  };

  return () => stopScanner?.();
}
