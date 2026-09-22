export function normalizeBarcode(value) {
  return String(value ?? '').trim();
}

export function canUseNativeScanner(env = globalThis) {
  return Boolean(env?.BarcodeDetector && env?.navigator?.mediaDevices?.getUserMedia);
}

export async function startBarcodeScanner({ video, onDetect, onError, env = globalThis }) {
  if (!canUseNativeScanner(env)) {
    throw new Error('Leitor por câmera não disponível neste navegador.');
  }
  const detector = new env.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'qr_code'] });
  const stream = await env.navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
  video.srcObject = stream;
  await video.play();
  let active = true;
  let last = '';
  let raf = 0;

  const scan = async () => {
    if (!active) return;
    try {
      const codes = await detector.detect(video);
      const raw = normalizeBarcode(codes?.[0]?.rawValue);
      if (raw && raw !== last) {
        last = raw;
        onDetect(raw);
      }
    } catch (error) {
      onError?.(error);
    }
    raf = env.requestAnimationFrame(scan);
  };
  raf = env.requestAnimationFrame(scan);

  return () => {
    active = false;
    if (raf) env.cancelAnimationFrame(raf);
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };
}
