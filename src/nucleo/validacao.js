// Validação e normalização de entradas. Toda entrada do usuário passa por aqui antes de virar regra.

export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

// Celular brasileiro → "55" + DDD + 9 dígitos. Devolve null se for inválido.
export function normalizarCelular(entrada) {
  if (typeof entrada !== 'string' && typeof entrada !== 'number') return null;
  let d = String(entrada).replace(/\D/g, '');
  if (d.startsWith('55') && d.length === 13) d = d.slice(2);
  d = d.replace(/^0+/, '');
  if (!/^[1-9][1-9]9\d{8}$/.test(d)) return null;
  return `55${d}`;
}

export function mascararCelular(cel) {
  const d = String(cel || '');
  if (d.length !== 13) return '';
  return `(${d.slice(2, 4)}) 9****-${d.slice(9)}`;
}

export function normalizarCpf(entrada) {
  if (typeof entrada !== 'string') return null;
  const d = entrada.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return null;
  const digito = (base) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  if (digito(d.slice(0, 9)) !== Number(d[9])) return null;
  if (digito(d.slice(0, 10)) !== Number(d[10])) return null;
  return d;
}

export function mascararCpf(cpf) {
  const d = String(cpf || '');
  return d.length === 11 ? `***.***.***-${d.slice(9)}` : '';
}

// CRECI: 3 a 7 dígitos, com letra opcional no fim (F = pessoa física, J = jurídica).
export function normalizarCreci(entrada) {
  if (typeof entrada !== 'string') return null;
  const c = entrada.toUpperCase().replace(/[\s.\-/]/g, '');
  return /^\d{3,7}[A-Z]?$/.test(c) ? c : null;
}

export function normalizarUf(entrada) {
  const uf = String(entrada || '').toUpperCase().trim();
  return UFS.includes(uf) ? uf : null;
}

export function normalizarNome(entrada) {
  if (typeof entrada !== 'string') return null;
  const n = entrada.replace(/\s+/g, ' ').trim();
  return n.length >= 2 && n.length <= 80 && !/[<>]/.test(n) ? n : null;
}
