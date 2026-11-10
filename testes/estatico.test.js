import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServidorEstatico } from '../src/nucleo/estatico.js';

const arquivos = {
  '/index.html': { texto: '<html>app</html>' },
  '/app.css': { texto: 'body{}' },
  '/icons/a.png': { base64: btoa(String.fromCharCode(137, 80, 78, 71)) },
};
const regras = [{ padrao: '/*', headers: { 'x-teste': 'sim' } }, { padrao: '/index.html', headers: { 'cache-control': 'no-cache' } }];
const servir = criarServidorEstatico(arquivos, regras);
const pedir = (c, m = 'GET') => servir(new Request(`https://x.com${c}`, { method: m }));

test('serve arquivo com tipo e cabeçalhos', async () => {
  const r = await pedir('/app.css');
  assert.equal(r.headers.get('content-type'), 'text/css; charset=utf-8');
  assert.equal(r.headers.get('x-teste'), 'sim');
  assert.equal(await r.text(), 'body{}');
});
test('raiz e rotas do app caem no index.html (página única)', async () => {
  for (const c of ['/', '/feed', '/qualquer/coisa']) {
    const r = await pedir(c);
    assert.equal(await r.text(), '<html>app</html>', c);
    assert.equal(r.headers.get('cache-control'), 'no-cache');
  }
});
test('arquivo inexistente com extensão é 404 (não vira index)', async () => {
  assert.equal((await pedir('/sumiu.js')).status, 404);
});
test('binário volta com os mesmos bytes', async () => {
  const r = await pedir('/icons/a.png');
  assert.equal(r.headers.get('content-type'), 'image/png');
  assert.deepEqual([...new Uint8Array(await r.arrayBuffer())], [137, 80, 78, 71]);
});
test('só GET e HEAD', async () => {
  assert.equal((await pedir('/', 'POST')).status, 405);
  assert.equal((await pedir('/', 'HEAD')).status, 200);
});
