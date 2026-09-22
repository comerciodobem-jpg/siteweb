import { demoUsers } from '../data/demo-data.js';
import { login } from '../session/session.js';

export function renderLogin({ mount, onLogin, showToast }) {
  mount.innerHTML = `
    <section class="login-page">
      <div class="login-hero card">
        <div class="login-badge">Óris 360 · Produção</div>
        <div class="login-logo">PR</div>
        <h2>Tudo começa nas suas mãos.</h2>
        <p>Você produz. Você registra. <strong>A gente cresce junto.</strong></p>
      </div>
      <div class="login-card card">
        <div>
          <p class="eyebrow">Acesso da equipe</p>
          <h3>Fazer meu login</h3>
          <p class="card-subtitle">Escolha seu perfil e informe o PIN.</p>
        </div>
        <form id="login-form" class="login-form">
          <div class="form-field">
            <label for="login-user">Quem está entrando?</label>
            <select id="login-user" class="select" required>
              ${demoUsers.map((user) => `<option value="${user.id}">${user.name}${user.role === 'manager' ? ' · Gestor' : ''}</option>`).join('')}
            </select>
          </div>
          <div class="form-field">
            <label for="login-pin">PIN</label>
            <input id="login-pin" class="input input-lg" inputmode="numeric" autocomplete="one-time-code" maxlength="4" placeholder="••••" required />
            <span class="helper">Demonstração: João 1111 · Maria 2222 · Gestor 9999</span>
          </div>
          <button class="btn btn-primary login-submit" type="submit">Entrar no Produzir Registra</button>
        </form>
      </div>
    </section>`;

  mount.querySelector('#login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const userId = mount.querySelector('#login-user').value;
    const pin = mount.querySelector('#login-pin').value;
    try {
      const session = login(userId, pin);
      onLogin(session);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}
