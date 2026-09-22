import { createDemoState } from '../data/demo-data.js';

const KEY = 'produzir-registra-state-v1';

export function loadState(storage = globalThis.localStorage) {
  if (!storage) return createDemoState();
  const raw = storage.getItem(KEY);
  if (!raw) {
    const initial = createDemoState();
    storage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  try { return JSON.parse(raw); }
  catch {
    const initial = createDemoState();
    storage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  if (storage) storage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function resetState(storage = globalThis.localStorage) {
  const state = createDemoState();
  saveState(state, storage);
  return state;
}
