export const REVIEW_STATUS = Object.freeze({
  PENDING: 'PENDING_REVIEW',
  CONFIRMED: 'CONFIRMED',
  DIVERGENT: 'DIVERGENT',
  CORRECTED: 'CORRECTED'
});

export const SYNC_STATUS = Object.freeze({
  LOCAL_PENDING: 'LOCAL_PENDING',
  SYNCED: 'SYNCED',
  FAILED: 'SYNC_FAILED'
});

export function findProductByBarcode(products, barcode) {
  const normalized = String(barcode ?? '').trim();
  if (!normalized) return null;
  return products.find((product) => String(product.barcode) === normalized) ?? null;
}

export function findProductById(products, productId) {
  return products.find((product) => product.id === productId) ?? null;
}

export function convertPackaging(product, packages = 0, looseUnits = 0) {
  const multiplier = Number(product?.package_conversion?.multiplier ?? 1);
  const boxes = Number(packages || 0);
  const units = Number(looseUnits || 0);
  if (!Number.isFinite(boxes) || !Number.isFinite(units) || boxes < 0 || units < 0) {
    throw new Error('Quantidades de embalagem inválidas.');
  }
  return boxes * multiplier + units;
}
