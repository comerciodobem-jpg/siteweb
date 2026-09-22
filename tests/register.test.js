import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBarcode, canUseNativeScanner } from '../src/scanner/barcode.js';
import { convertPackaging } from '../src/domain/models.js';

test('barcode normalization trims scanner input', () => {
  assert.equal(normalizeBarcode(' 7891000000011\n'), '7891000000011');
});

test('native scanner capability is detected from provided environment', () => {
  assert.equal(canUseNativeScanner({ BarcodeDetector: class {}, navigator: { mediaDevices: { getUserMedia(){} } } }), true);
  assert.equal(canUseNativeScanner({ navigator: {} }), false);
});

test('package conversion calculates base units', () => {
  const product = { package_conversion: { multiplier: 24 } };
  assert.equal(convertPackaging(product, 10, 8), 248);
});
