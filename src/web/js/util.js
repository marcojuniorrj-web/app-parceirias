// Montagem segura de HTML: tudo que vem de fora é escapado, a não ser que passe por raw()/html``.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

class Html {
  constructor(t) { this.t = t; }
  toString() { return this.t; }
}
export const raw = (t) => new Html(t);
const parte = (v) => (v instanceof Html ? v.t : Array.isArray(v) ? v.map(parte).join('') : v === false || v == null ? '' : esc(v));
export function html(strings, ...vals) {
  let saida = '';
  strings.forEach((s, i) => { saida += s; if (i < vals.length) saida += parte(vals[i]); });
  return new Html(saida);
}

export const brl = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
export const notaFmt = (n) => Number(n).toFixed(1).replace('.', ',');
export const dataBr = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function maskCelular(v) {
  const d = String(v).replace(/\D/g, '').replace(/^55(?=\d{11})/, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
export function maskCpf(v) {
  const d = String(v).replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
export const iniciais = (nome) => (String(nome || '?').trim()[0] || '?').toUpperCase();
