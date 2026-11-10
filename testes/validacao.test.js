import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCelular, mascararCelular, normalizarCpf, mascararCpf, normalizarCreci, normalizarUf, normalizarNome } from '../src/nucleo/validacao.js';

test('celular: aceita formatos comuns e normaliza para 55+DDD+9 dígitos', () => {
  assert.equal(normalizarCelular('(21) 99999-0000'), '5521999990000');
  assert.equal(normalizarCelular('+55 21 99999-0000'), '5521999990000');
  assert.equal(normalizarCelular('021999990000'), '5521999990000');
  assert.equal(normalizarCelular('21999990000'), '5521999990000');
});
test('celular: recusa fixo, DDD inválido, curto e lixo', () => {
  for (const ruim of ['2133334444', '(21) 3333-4444', '00999990000', '1999990000', '', 'abc', null, undefined, {}, '2199999000011']) {
    assert.equal(normalizarCelular(ruim), null, String(ruim));
  }
});
test('celular: máscara esconde o miolo', () => {
  assert.equal(mascararCelular('5521999990000'), '(21) 9****-0000');
  assert.equal(mascararCelular('x'), '');
});
test('cpf: valida dígitos verificadores', () => {
  assert.equal(normalizarCpf('529.982.247-25'), '52998224725');
  assert.equal(normalizarCpf('52998224725'), '52998224725');
  for (const ruim of ['529.982.247-26', '111.111.111-11', '123', '', null, 12345678909]) assert.equal(normalizarCpf(ruim), null, String(ruim));
  assert.equal(mascararCpf('52998224725'), '***.***.***-25');
});
test('creci: 3 a 7 dígitos com letra opcional', () => {
  assert.equal(normalizarCreci('12345'), '12345');
  assert.equal(normalizarCreci(' 12.345-f '), '12345F');
  for (const ruim of ['12', '12345678', 'ABC', '12 34 5 6 7 8', '', null]) assert.equal(normalizarCreci(ruim), null, String(ruim));
});
test('uf e nome', () => {
  assert.equal(normalizarUf('rj'), 'RJ');
  assert.equal(normalizarUf('XX'), null);
  assert.equal(normalizarNome('  Maria   da Silva '), 'Maria da Silva');
  for (const ruim of ['A', '', '<b>x</b>', 'x'.repeat(81), null]) assert.equal(normalizarNome(ruim), null, String(ruim));
});
