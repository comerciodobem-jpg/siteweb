export const BASE_ROUTES = [
  { id: 'register', label: 'Registrar', icon: '▣' },
  { id: 'produced', label: 'Produzido', icon: '✓' },
  { id: 'results', label: 'Nosso Resultado', icon: '↗' }
];
export const REVIEW_ROUTE = { id: 'review', label: 'Conferir', icon: '◎' };

export function allowedRoutes(session) {
  if (!session) return [];
  return session.role === 'manager' ? [...BASE_ROUTES, REVIEW_ROUTE] : [...BASE_ROUTES];
}

export function normalizeRoute(route, session) {
  const routes = allowedRoutes(session);
  return routes.some((item) => item.id === route) ? route : routes[0]?.id ?? 'login';
}
