import test from 'node:test';
import assert from 'node:assert/strict';
import { cifrar, decifrar, hmacHex, codigoNumerico, tokenAleatorio, igualConstante } from '../src/nucleo/cripto.js';
import { novoId } from '../src/nucleo/id.js';
import { SEGREDO } from './ajuda/ambiente.js';

test('cifrar/decifrar ida e volta; cada cifra é diferente (IV aleatório)', async () => {
  const a = await cifrar(SEGREDO, 'cpf', '52998224725');
  const b = await cifrar(SEGREDO, 'cpf', '52998224725');
  assert.notEqual(a, b);
  assert.ok(!a.includes('52998224725'));
  assert.equal(await decifrar(SEGREDO, 'cpf', a), '52998224725');
});
test('chave de um contexto não abre o outro nem segredo errado', async () => {
  const a = await cifrar(SEGREDO, 'cpf', 'x');
  await assert.rejects(() => decifrar(SEGREDO, 'outro', a));
  await assert.rejects(() => decifrar(SEGREDO.replace('a', 'b'), 'cpf', a));
});
test('hmac é estável e separado por contexto', async () => {
  assert.equal(await hmacHex(SEGREDO, 'a', 'x'), await hmacHex(SEGREDO, 'a', 'x'));
  assert.notEqual(await hmacHex(SEGREDO, 'a', 'x'), await hmacHex(SEGREDO, 'b', 'x'));
});
test('segredo curto é recusado', async () => {
  await assert.rejects(() => hmacHex('curto', 'a', 'x'), /SEGREDO_APP/);
  await assert.rejects(() => hmacHex(undefined, 'a', 'x'), /SEGREDO_APP/);
});
test('código numérico tem 6 dígitos e varia', () => {
  const vistos = new Set();
  for (let i = 0; i < 200; i++) {
    const c = codigoNumerico(6);
    assert.match(c, /^\d{6}$/);
    vistos.add(c);
  }
  assert.ok(vistos.size > 150);
});
test('token e id', () => {
  assert.notEqual(tokenAleatorio(), tokenAleatorio());
  assert.match(tokenAleatorio(32), /^[A-Za-z0-9_-]{43}$/);
  const a = novoId(1000), b = novoId(2000);
  assert.equal(a.length, 26);
  assert.ok(a < b, 'ids são ordenáveis por tempo');
});
test('igualConstante', () => {
  assert.ok(igualConstante('abc', 'abc'));
  assert.ok(!igualConstante('abc', 'abd'));
  assert.ok(!igualConstante('abc', 'abcd'));
});
