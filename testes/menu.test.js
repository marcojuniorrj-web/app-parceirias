import test from 'node:test';
import assert from 'node:assert/strict';
import { menuPara } from '../src/web/js/menu.js';

const rotulos = (me) => menuPara(me).map((i) => i.rotulo);
const eu = (...papeis) => ({ usuario: { id: 'x' }, papeis });

test('visitante: Feed, Buscar, Salvos, Conversas, Entrar', () => {
  assert.deepEqual(rotulos(null), ['Feed', 'Buscar', 'Salvos', 'Conversas', 'Entrar']);
});
test('cliente: Feed, Buscar, Salvos, Conversas, Perfil', () => {
  assert.deepEqual(rotulos(eu('cliente')), ['Feed', 'Buscar', 'Salvos', 'Conversas', 'Perfil']);
});
test('logado que ainda não escolheu perfil usa o menu de cliente', () => {
  assert.deepEqual(rotulos(eu()), ['Feed', 'Buscar', 'Salvos', 'Conversas', 'Perfil']);
});
test('corretor: Feed, Buscar, Publicar, Conversas, Perfil', () => {
  assert.deepEqual(rotulos(eu('corretor')), ['Feed', 'Buscar', 'Publicar', 'Conversas', 'Perfil']);
  assert.deepEqual(rotulos(eu('cliente', 'corretor')), ['Feed', 'Buscar', 'Publicar', 'Conversas', 'Perfil']);
});
test('gestor: menu do corretor + Equipe', () => {
  assert.deepEqual(rotulos(eu('gestor')), ['Feed', 'Buscar', 'Publicar', 'Conversas', 'Equipe', 'Perfil']);
});
test('admin sem outro papel entra direto na administração', () => {
  assert.deepEqual(rotulos(eu('admin')), ['Admin', 'Feed', 'Perfil']);
});
test('todo item do menu tem rota com #', () => {
  for (const me of [null, eu('cliente'), eu('corretor'), eu('gestor'), eu('admin')]) {
    for (const i of menuPara(me)) assert.match(i.rota, /^\/[a-z]+$/);
  }
});
