// Serve a interface (HTML/CSS/JS/ícones) a partir de arquivos embutidos no Worker, com os cabeçalhos de _headers
// e o comportamento de "aplicativo de página única" (rota desconhecida sem extensão → index.html).
const TIPOS = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json',
  webmanifest: 'application/manifest+json', svg: 'image/svg+xml', png: 'image/png', ico: 'image/x-icon' };

function bytes(b64) {
  const s = atob(b64);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u;
}

// arquivos: { '/caminho': { texto: '...' } | { base64: '...' } } ; regras: [{ padrao: '/*', headers: {..} }]
export function criarServidorEstatico(arquivos, regras = []) {
  const cacheBinario = new Map();
  return async function servir(req) {
    if (!['GET', 'HEAD'].includes(req.method)) return new Response('Método não permitido', { status: 405 });
    let caminho = decodeURIComponent(new URL(req.url).pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';
    let arq = arquivos[caminho];
    if (!arq) {
      if (/\.[a-z0-9]+$/i.test(caminho)) return new Response('Não encontrado', { status: 404 });
      caminho = '/index.html';
      arq = arquivos[caminho];
    }
    if (!arq) return new Response('Não encontrado', { status: 404 });
    const ext = caminho.split('.').pop();
    const headers = new Headers({ 'content-type': TIPOS[ext] ?? 'application/octet-stream' });
    for (const r of regras) {
      if (r.padrao === '/*' || r.padrao === caminho) for (const [k, v] of Object.entries(r.headers)) headers.set(k, v);
    }
    let corpo = arq.texto;
    if (corpo === undefined) {
      if (!cacheBinario.has(caminho)) cacheBinario.set(caminho, bytes(arq.base64));
      corpo = cacheBinario.get(caminho);
    }
    return new Response(req.method === 'HEAD' ? null : corpo, { headers });
  };
}
