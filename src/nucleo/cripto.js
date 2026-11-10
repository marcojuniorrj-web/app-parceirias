// Criptografia com Web Crypto (igual no Worker e no Node). Todas as chaves derivam de SEGREDO_APP.
const enc = new TextEncoder();
const dec = new TextDecoder();

function paraBase64(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function deBase64(txt) {
  const s = atob(txt);
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
}
export function paraBase64Url(bytes) {
  return paraBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function paraHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Deriva 32 bytes distintos para cada "contexto" (otp, sessão, cpf...), assim uma chave nunca serve para duas coisas.
async function derivar(segredo, contexto) {
  if (typeof segredo !== 'string' || segredo.length < 32) {
    throw new Error('SEGREDO_APP ausente ou curto demais (mínimo 32 caracteres).');
  }
  const base = await crypto.subtle.importKey('raw', enc.encode(segredo), 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: enc.encode('app-parceiros-v1'), info: enc.encode(contexto) },
    base,
    256,
  );
  return new Uint8Array(bits);
}

export async function hmacHex(segredo, contexto, texto) {
  const chave = await crypto.subtle.importKey('raw', await derivar(segredo, contexto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = await crypto.subtle.sign('HMAC', chave, enc.encode(String(texto)));
  return paraHex(new Uint8Array(assinatura));
}

export async function cifrar(segredo, contexto, texto) {
  const chave = await crypto.subtle.importKey('raw', await derivar(segredo, contexto), 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, chave, enc.encode(texto)));
  const junto = new Uint8Array(iv.length + ct.length);
  junto.set(iv);
  junto.set(ct, iv.length);
  return paraBase64(junto);
}

export async function decifrar(segredo, contexto, cifrado) {
  const chave = await crypto.subtle.importKey('raw', await derivar(segredo, contexto), 'AES-GCM', false, ['decrypt']);
  const junto = deBase64(cifrado);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: junto.slice(0, 12) }, chave, junto.slice(12));
  return dec.decode(pt);
}

export function tokenAleatorio(bytes = 32) {
  return paraBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

// Código numérico sem viés (descarta valores que desequilibrariam o resto da divisão).
export function codigoNumerico(digitos = 6) {
  const limite = 10 ** digitos;
  const teto = Math.floor(0xffffffff / limite) * limite;
  let n;
  do {
    n = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (n >= teto);
  return String(n % limite).padStart(digitos, '0');
}

export function igualConstante(a, b) {
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let dif = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) dif |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return dif === 0;
}
