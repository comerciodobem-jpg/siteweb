import { DEMO_COMPANY_ID, demoUsers } from '../data/demo-data.js';

const KEY = 'produzir-registra-session-v1';

export function login(userId, pin, storage = globalThis.localStorage) {
  const user = demoUsers.find((item) => item.id === userId && item.pin === String(pin));
  if (!user) throw new Error('Usuário ou PIN inválido.');
  const session = { companyId: DEMO_COMPANY_ID, userId: user.id, employeeId: user.employeeId, name: user.name, initials: user.initials, role: user.role };
  storage?.setItem(KEY, JSON.stringify(session));
  return session;
}

export function getSession(storage = globalThis.localStorage) {
  if (!storage) return null;
  const raw = storage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function logout(storage = globalThis.localStorage) {
  storage?.removeItem(KEY);
}

export function canReview(session) { return session?.role === 'manager'; }
