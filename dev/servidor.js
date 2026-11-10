// Servidor de desenvolvimento: roda o MESMO Worker de produção com um banco SQLite local e serve a interface estática,
// aplicando os cabeçalhos de segurança de src/web/_headers (assim erros de CSP aparecem aqui, não só em produção).
// Uso: npm run dev   →   http://localhost:8787
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { criarD1 } from './d1_sqlite.js';
import worker from '../src/worker.js';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'web');
const porta = Number(process.env.PORT || 8787);
const db = criarD1(process.env.DB_ARQUIVO || ':memory:');

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function lerHeadersArquivo() {
  const regras = []; let atual = null;
  for (const linha of readFileSync(path.join(raiz, '_headers'), 'utf8').split('\n')) {
    if (!linha.trim()) continue;
    if (!/^\s/.test(linha)) { atual = { padrao: linha.trim(), h: {} }; regras.push(atual); }
    else { const i = linha.indexOf(':'); atual.h[linha.slice(0, i).trim()] = linha.slice(i + 1).trim(); }
  }
  return regras;
}
const REGRAS = lerHeadersArquivo();
const casa = (padrao, caminho) => (padrao === '/*' ? true : padrao === caminho);

async function estatico(req) {
  const url = new URL(req.url);
  let alvo = path.normalize(path.join(raiz, decodeURIComponent(url.pathname)));
  if (!alvo.startsWith(raiz)) return new Response('Proibido', { status: 403 });
  if (url.pathname.endsWith('/') || !existsSync(alvo) || alvo === raiz) {
    // fallback de aplicativo de página única (como not_found_handling = single-page-application)
    if (path.extname(url.pathname)) return new Response('Não encontrado', { status: 404 });
    alvo = path.join(raiz, 'index.html');
  }
  const corpo = await readFile(alvo);
  const headers = new Headers({ 'content-type': TIPOS[path.extname(alvo)] || 'application/octet-stream' });
  for (const r of REGRAS) if (casa(r.padrao, url.pathname) || (alvo.endsWith('index.html') && r.padrao === '/index.html')) for (const [k, v] of Object.entries(r.h)) headers.set(k, v);
  return new Response(corpo, { headers });
}

const env = {
  DB: db,
  AMBIENTE: 'dev',
  MENSAGERIA: 'falsa',
  SEGREDO_APP: process.env.SEGREDO_APP || 'dev-segredo-local-nao-use-em-producao-0123456789',
  ADMIN_CELULARES: process.env.ADMIN_CELULARES || '5521999990000',
  ASSETS: { fetch: estatico },
};

const servidor = http.createServer(async (rq, rs) => {
  try {
    const partes = [];
    for await (const p of rq) partes.push(p);
    const corpo = ['GET', 'HEAD'].includes(rq.method) ? undefined : Buffer.concat(partes);
    const req = new Request(`http://${rq.headers.host}${rq.url}`, { method: rq.method, headers: rq.headers, body: corpo });
    const resp = await worker.fetch(req, env);
    const cabecalhos = {};
    for (const [k, v] of resp.headers) if (k !== 'set-cookie') cabecalhos[k] = v;
    const cookies = resp.headers.getSetCookie?.() ?? [];
    if (cookies.length) cabecalhos['set-cookie'] = cookies;
    rs.writeHead(resp.status, cabecalhos);
    rs.end(Buffer.from(await resp.arrayBuffer()));
  } catch (e) {
    console.error(e);
    rs.writeHead(500); rs.end('erro');
  }
});
servidor.listen(porta, () => console.log(`Parceiros (dev) em http://localhost:${porta}  ·  admin de teste: (21) 99999-0000`));
