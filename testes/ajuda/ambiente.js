// Ambiente de teste: banco em memória, relógio controlável e um "navegador" mínimo (guarda o cookie).
import { criarD1 } from '../../dev/d1_sqlite.js';
import { manipular } from '../../src/worker.js';
import { caixaDeSaida } from '../../src/integracoes/mensageria.js';

export const SEGREDO = 'segredo-de-teste-com-mais-de-trinta-e-dois-caracteres';
export const ADMIN = '5521999990000';

export function criarAmbiente(extra = {}) {
  const relogio = { t: Date.parse('2026-11-10T12:00:00.000Z') };
  const env = {
    DB: criarD1(),
    SEGREDO_APP: SEGREDO,
    AMBIENTE: 'teste',
    MENSAGERIA: 'falsa',
    ADMIN_CELULARES: ADMIN,
    RELOGIO: () => new Date(relogio.t),
    ...extra,
  };
  return { env, relogio, avancar: (seg) => (relogio.t += seg * 1000) };
}

export function navegador(amb, { ip = '200.1.1.1' } = {}) {
  let cookie = '';
  const api = {
    get cookie() { return cookie; },
    async chamar(metodo, caminho, corpo, cabecalhos = {}) {
      const headers = { 'cf-connecting-ip': ip, ...cabecalhos };
      if (cookie) headers.cookie = cookie;
      const init = { method: metodo, headers };
      if (corpo !== undefined) {
        init.body = JSON.stringify(corpo);
        headers['content-type'] = 'application/json';
      }
      const resp = await manipular(new Request(`https://app.exemplo.com.br/api/v1${caminho}`, init), amb.env);
      const sets = resp.headers.getSetCookie?.() ?? [];
      for (const s of sets) {
        const par = s.split(';')[0];
        const [nome, valor] = [par.slice(0, par.indexOf('=')), par.slice(par.indexOf('=') + 1)];
        if (/Max-Age=0/i.test(s) || valor === '') cookie = '';
        else cookie = `${nome}=${valor}`;
      }
      let dados = null;
      try { dados = await resp.clone().json(); } catch { /* sem corpo JSON */ }
      return { status: resp.status, dados, resp, setCookie: sets };
    },
    get: (c) => api.chamar('GET', c),
    post: (c, b = {}) => api.chamar('POST', c, b),
    put: (c, b = {}) => api.chamar('PUT', c, b),
    del: (c) => api.chamar('DELETE', c),
    // atalho: pede o código e entra
    async entrar(celular) {
      const p = await api.post('/auth/codigo', { celular });
      if (p.status !== 200) throw new Error(`pedir código falhou: ${p.status} ${JSON.stringify(p.dados)}`);
      return api.post('/auth/entrar', { celular, codigo: p.dados.codigo_dev });
    },
  };
  return api;
}

export { caixaDeSaida };
