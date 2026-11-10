import test from 'node:test';
import assert from 'node:assert/strict';
import { pode, motivoNegacao, ACOES, mapaDePermissoes } from '../src/nucleo/permissoes.js';

// Matriz escrita à mão a partir de docs/app-parceiros/spec/usuarios.md (com os ajustes pós-revisão).
// V=visitante C=cliente K=corretor G=gestor A=admin. Corretores aqui já com CRECI verificado.
const MATRIZ = {
  ver_feed:             { V: 1, C: 1, K: 1, G: 1, A: 1 },
  ver_perfil_publico:   { V: 1, C: 1, K: 1, G: 1, A: 1 },
  favoritar_ou_salvar:  { V: 0, C: 1, K: 1, G: 1, A: 0 },
  abrir_chat:           { V: 0, C: 1, K: 1, G: 1, A: 0 },
  pedir_parceria:       { V: 0, C: 0, K: 1, G: 1, A: 0 },
  publicar_imovel:      { V: 0, C: 0, K: 1, G: 1, A: 0 },
  apagar_imovel:        { V: 0, C: 0, K: 1, G: 1, A: 1 },
  agendar_visita:       { V: 0, C: 1, K: 1, G: 1, A: 0 },
  registrar_acordo:     { V: 0, C: 0, K: 1, G: 1, A: 0 },
  registrar_negocio:    { V: 0, C: 0, K: 1, G: 1, A: 0 },
  avaliar_pos_visita:   { V: 0, C: 1, K: 1, G: 0, A: 0 },
  avaliar_compra:       { V: 0, C: 1, K: 0, G: 0, A: 0 },
  ser_avaliado:         { V: 0, C: 1, K: 1, G: 0, A: 0 },
  responder_avaliacao:  { V: 0, C: 0, K: 1, G: 1, A: 0 },
  denunciar:            { V: 0, C: 1, K: 1, G: 1, A: 0 },
  convidar_corretor:    { V: 0, C: 0, K: 0, G: 1, A: 1 },
  ver_painel_equipe:    { V: 0, C: 0, K: 0, G: 1, A: 1 },
  pagar_assinatura:     { V: 0, C: 0, K: 1, G: 1, A: 0 },
  moderar:              { V: 0, C: 0, K: 0, G: 0, A: 1 },
  ver_nota_de_cliente:  { V: 0, C: 0, K: 1, G: 1, A: 1 },
};
const PAPEL = { C: 'cliente', K: 'corretor', G: 'gestor', A: 'admin' };

function usuarioDe(letra, extra = {}) {
  if (letra === 'V') return null;
  return { papeis: [PAPEL[letra]], status: 'ativo', corretor_status: letra === 'K' ? 'verificado' : null, ...extra };
}

for (const [acao, linha] of Object.entries(MATRIZ)) {
  test(`matriz › ${acao}`, () => {
    for (const [letra, esperado] of Object.entries(linha)) {
      assert.equal(pode(usuarioDe(letra), acao), Boolean(esperado), `${acao} para ${letra}`);
    }
  });
}

test('a matriz cobre exatamente as ações do código (nenhuma ação sem teste)', () => {
  assert.deepEqual(Object.keys(MATRIZ).sort(), Object.keys(ACOES).sort());
});

test('corretor com CRECI em análise não publica, não pede parceria, não agenda', () => {
  for (const status of ['incompleto', 'pendente', 'reprovado', 'bloqueado']) {
    const u = { papeis: ['corretor'], status: 'ativo', corretor_status: status };
    for (const a of ['publicar_imovel', 'pedir_parceria', 'agendar_visita', 'registrar_negocio']) {
      assert.equal(pode(u, a), false, `${a} com CRECI ${status}`);
    }
    assert.equal(pode(u, 'ver_feed'), true);
    assert.equal(pode(u, 'favoritar_ou_salvar'), true);
    assert.equal(motivoNegacao(u, 'publicar_imovel').codigo, 'creci_nao_verificado');
  }
});

test('vários papéis: cliente + corretor em análise ainda pode agendar visita como cliente', () => {
  const u = { papeis: ['cliente', 'corretor'], status: 'ativo', corretor_status: 'pendente' };
  assert.equal(pode(u, 'agendar_visita'), true);
  assert.equal(pode(u, 'publicar_imovel'), false);
});

test('gestor que também é corretor verificado avalia pós-visita; gestor puro não', () => {
  assert.equal(pode({ papeis: ['gestor'], status: 'ativo' }, 'avaliar_pos_visita'), false);
  assert.equal(pode({ papeis: ['gestor', 'corretor'], status: 'ativo', corretor_status: 'verificado' }, 'avaliar_pos_visita'), true);
});

test('conta suspensa só vê o público', () => {
  const u = { papeis: ['corretor', 'admin'], status: 'suspenso', corretor_status: 'verificado' };
  for (const a of Object.keys(ACOES)) assert.equal(pode(u, a), ['ver_feed', 'ver_perfil_publico'].includes(a), a);
  assert.equal(motivoNegacao(u, 'moderar').codigo, 'conta_suspensa');
});

test('logado sem papel ainda (primeiro acesso) vale como visitante', () => {
  const u = { papeis: [], status: 'ativo', corretor_status: null };
  assert.equal(pode(u, 'ver_feed'), true);
  assert.equal(pode(u, 'favoritar_ou_salvar'), false);
});

test('ação desconhecida é sempre negada; mapa tem todas as ações', () => {
  assert.equal(pode({ papeis: ['admin'], status: 'ativo' }, 'fazer_qualquer_coisa'), false);
  assert.deepEqual(Object.keys(mapaDePermissoes(null)).sort(), Object.keys(ACOES).sort());
});

test('motivo padrão é "sem_permissao"', () => {
  assert.equal(motivoNegacao({ papeis: ['cliente'], status: 'ativo' }, 'moderar').codigo, 'sem_permissao');
});
