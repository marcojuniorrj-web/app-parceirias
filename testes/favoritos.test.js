import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAmbiente, navegador } from './ajuda/ambiente.js';

test('feed é público e traz imóveis de exemplo marcados como exemplo', async () => {
  const r = await navegador(criarAmbiente()).get('/feed');
  assert.equal(r.status, 200);
  assert.equal(r.dados.exemplo, true);
  assert.ok(r.dados.itens.length >= 3);
  assert.ok(r.dados.itens.every((i) => i.exemplo === true && i.id.startsWith('ex-')));
});

test('visitante não consegue curtir (precisa entrar)', async () => {
  const r = await navegador(criarAmbiente()).post('/favoritos/ex-1');
  assert.equal(r.status, 401);
  assert.equal(r.dados.erro.codigo, 'login_necessario');
});

test('♥ feito depois do login fica salvo e volta na lista (aceite 1.6)', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  await nav.entrar('21 98888-1111');
  await nav.post('/me/perfil', { tipo: 'cliente', nome: 'Maria' });
  assert.equal((await nav.post('/favoritos/ex-2')).status, 200);
  assert.equal((await nav.post('/favoritos/ex-2')).status, 200, 'curtir duas vezes não duplica');
  assert.deepEqual((await nav.get('/favoritos')).dados.ids, ['ex-2']);
  // volta a entrar em outro aparelho: continua salvo
  const outro = navegador(amb, { ip: '200.5.5.5' });
  amb.avancar(61);
  await outro.entrar('21 98888-1111');
  assert.deepEqual((await outro.get('/favoritos')).dados.ids, ['ex-2']);
  assert.equal((await nav.del('/favoritos/ex-2')).status, 200);
  assert.deepEqual((await nav.get('/favoritos')).dados.ids, []);
});

test('logado mas sem escolher perfil ainda não salva (precisa ser cliente/corretor)', async () => {
  const nav = navegador(criarAmbiente());
  await nav.entrar('21 98888-1111');
  assert.equal((await nav.post('/favoritos/ex-1')).status, 403);
});

test('imóvel desconhecido é 404; favoritos de uma pessoa não aparecem para outra', async () => {
  const amb = criarAmbiente();
  const a = navegador(amb), b = navegador(amb, { ip: '200.6.6.6' });
  await a.entrar('21 98888-1111'); await a.post('/me/perfil', { tipo: 'cliente', nome: 'Ana' });
  await b.entrar('21 97777-2222'); await b.post('/me/perfil', { tipo: 'cliente', nome: 'Bia' });
  assert.equal((await a.post('/favoritos/nao-existe')).status, 404);
  await a.post('/favoritos/ex-1');
  assert.deepEqual((await b.get('/favoritos')).dados.ids, []);
});
