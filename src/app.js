import { getSession, logout } from './session/session.js';
import { loadState, saveState } from './storage/store.js';
import { motivationFor } from './ui/motivation.js';
import { renderLogin } from './ui/login.js';
import { renderRegister } from './ui/register.js';
import { renderProduced } from './ui/produced.js';
import { renderResults } from './ui/results.js';
import { renderReview } from './ui/review.js';
import { allowedRoutes, normalizeRoute } from './ui/router.js';
import { updateLocalSyncState } from './offline/sync.js';
import { toast } from './ui/common.js';
import { groupPendingByProduct } from './domain/review.js';

let state = loadState();
let session = getSession();
let currentCleanup = null;

const main = document.getElementById('app-main');
const nav = document.getElementById('primary-nav');
const motivation = document.getElementById('motivation-strip');
const motivationText = document.getElementById('motivation-text');
const avatarButton = document.getElementById('user-menu-button');
const userAvatar = document.getElementById('user-avatar');
const networkStatus = document.getElementById('network-status');

function routeFromHash() { return location.hash.replace('#/', '').trim() || 'register'; }
function setHash(route) { if (location.hash !== `#/${route}`) history.replaceState(null, '', `#/${route}`); }

function renderHeader() {
  const dot = networkStatus.querySelector('.status-dot');
  dot.classList.toggle('offline', !navigator.onLine);
  networkStatus.title = navigator.onLine ? 'Online' : 'Offline — os registros ficam no aparelho até sincronizar';
  if (!session) {
    motivation.hidden = true;
    avatarButton.hidden = true;
    return;
  }
  motivation.hidden = false;
  motivationText.textContent = motivationFor(new Date());
  avatarButton.hidden = false;
  userAvatar.textContent = session.initials ?? session.name?.split(' ').map((part) => part[0]).slice(0,2).join('') ?? 'U';
  avatarButton.title = `${session.name} · ${session.role === 'manager' ? 'Gestor/Conferente' : 'Colaborador'}`;
}

function renderNav(route) {
  if (!session) { nav.hidden = true; nav.innerHTML = ''; return; }
  const routes = allowedRoutes(session);
  const pendingGroups = session.role === 'manager' ? groupPendingByProduct(state, session.companyId).length : 0;
  nav.hidden = false;
  nav.innerHTML = routes.map((item) => `<button class="nav-button" type="button" data-route="${item.id}" ${item.id === route ? 'aria-current="page"' : ''}><span class="nav-icon">${item.icon}</span><span>${item.label}${item.id === 'review' && pendingGroups ? ` (${pendingGroups})` : ''}</span></button>`).join('');
  nav.querySelectorAll('[data-route]').forEach((button) => button.onclick = () => navigate(button.dataset.route));
}

function render() {
  currentCleanup?.(); currentCleanup = null;
  renderHeader();
  if (!session) {
    nav.hidden = true;
    renderLogin({ mount: main, onLogin: (newSession) => { session = newSession; setHash('register'); render(); }, showToast: toast });
    return;
  }

  const route = normalizeRoute(routeFromHash(), session);
  setHash(route);
  renderNav(route);
  const context = { mount: main, state, session, rerender: render };
  if (route === 'register') currentCleanup = renderRegister(context) ?? null;
  if (route === 'produced') renderProduced(context);
  if (route === 'results') renderResults(context);
  if (route === 'review') renderReview(context);
  requestAnimationFrame(() => main.focus({ preventScroll:true }));
}

function navigate(route) {
  const allowed = normalizeRoute(route, session);
  history.pushState(null, '', `#/${allowed}`);
  render();
}

window.addEventListener('hashchange', render);
window.addEventListener('popstate', render);
window.addEventListener('online', () => {
  const changed = updateLocalSyncState(state, true);
  if (changed) { saveState(state); toast(`${changed} registro${changed === 1 ? '' : 's'} sincronizado${changed === 1 ? '' : 's'}.`); }
  render();
});
window.addEventListener('offline', () => { toast('Sem internet. Os próximos registros ficarão pendentes de sincronização.'); renderHeader(); });

avatarButton.addEventListener('click', () => {
  const label = session?.name ?? 'usuário';
  if (confirm(`${label}\n\nDeseja sair do Produzir Registra?`)) {
    logout(); session = null; currentCleanup?.(); currentCleanup = null; history.replaceState(null, '', location.pathname); render();
  }
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

render();
