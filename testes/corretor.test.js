import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAmbiente, navegador, caixaDeSaida, ADMIN } from './ajuda/ambiente.js';

const CPF = '529.982.247-25';
const CPF2 = '111.444.777-35';

async function novoCorretor(amb, celular, nome = 'Ana Corretora') {
  const nav = navegador(amb, { ip: `200.0.0.${Math.floor(Math.random() * 200) + 1}` });
  await nav.entrar(celular);
  const r = await nav.post('/me/perfil', { tipo: 'corretor', nome });
  assert.equal(r.status, 200, JSON.stringify(r.dados));
  return nav;
}

test('escolher perfil: cliente, corretor; imobiliária e convite ainda "em breve"', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  await nav.entrar('21 98888-1111');
  assert.equal((await nav.post('/me/perfil', { tipo: 'imobiliaria' })).status, 501);
  assert.equal((await nav.post('/me/perfil', { tipo: 'convite' })).status, 501);
  assert.equal((await nav.post('/me/perfil', { tipo: 'xyz' })).status, 400);
  const r = await nav.post('/me/perfil', { tipo: 'cliente', nome: 'João Cliente' });
  assert.equal(r.status, 200);
  assert.deepEqual(r.dados.papeis, ['cliente']);
  assert.equal(r.dados.precisa_escolher_perfil, false);
  assert.equal(r.dados.usuario.nome, 'João Cliente');
  assert.equal(r.dados.pode.favoritar_ou_salvar, true);
  assert.equal(r.dados.pode.publicar_imovel, false);
});

test('a mesma pessoa pode ser cliente e corretor (papéis múltiplos)', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  await nav.entrar('21 98888-1111');
  await nav.post('/me/perfil', { tipo: 'cliente', nome: 'Maria' });
  const r = await nav.post('/me/perfil', { tipo: 'corretor' });
  assert.deepEqual(r.dados.papeis, ['cliente', 'corretor']);
  assert.equal(r.dados.corretor.status, 'incompleto');
});

test('nome inválido é recusado', async () => {
  const nav = navegador(criarAmbiente());
  await nav.entrar('21 98888-1111');
  assert.equal((await nav.post('/me/perfil', { tipo: 'cliente', nome: '<script>' })).status, 400);
  assert.equal((await nav.put('/me', { nome: 'x' })).status, 400);
  assert.equal((await nav.put('/me', { nome: 'Nome Certo' })).status, 200);
});

test('enviar CRECI sem ser corretor é recusado; sem login também', async () => {
  const amb = criarAmbiente();
  const anon = navegador(amb);
  assert.equal((await anon.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' })).status, 401);
  const cli = navegador(amb);
  await cli.entrar('21 98888-1111');
  await cli.post('/me/perfil', { tipo: 'cliente', nome: 'Maria' });
  const r = await cli.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  assert.equal(r.status, 403);
  assert.equal(r.dados.erro.codigo, 'perfil_corretor_necessario');
});

test('CPF e CRECI inválidos são recusados com mensagem', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  assert.equal((await nav.post('/corretores', { cpf: '111.111.111-11', creci: '12345', uf: 'RJ' })).dados.erro.codigo, 'cpf_invalido');
  assert.equal((await nav.post('/corretores', { cpf: CPF, creci: 'abc', uf: 'RJ' })).dados.erro.codigo, 'creci_invalido');
  assert.equal((await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'XX' })).dados.erro.codigo, 'uf_invalida');
});

test('corretor "em análise" não publica nem pede parceria (aceite 1.8)', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  let me = (await nav.get('/me')).dados;
  assert.equal(me.corretor.status, 'incompleto');
  assert.equal(me.pode.publicar_imovel, false);

  const r = await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  assert.equal(r.status, 201);
  assert.equal(r.dados.corretor.status, 'pendente');
  me = (await nav.get('/me')).dados;
  assert.equal(me.corretor.status, 'pendente');
  assert.equal(me.pode.publicar_imovel, false);
  assert.equal(me.pode.pedir_parceria, false);
  assert.equal(me.pode.favoritar_ou_salvar, true, 'continua navegando e salvando');
});

test('CPF é guardado cifrado, nunca em texto', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const linha = amb.env.DB._db.prepare('SELECT * FROM corretores').get();
  assert.ok(!JSON.stringify(linha).includes('52998224725'));
  assert.ok(!JSON.stringify(linha).includes('529.982'));
  assert.ok(linha.cpf_cifrado.length > 20);
});

test('CPF repetido é recusado (aceite 1.4): pela API e pelo banco', async () => {
  const amb = criarAmbiente();
  const a = await novoCorretor(amb, '21 98888-1111');
  const b = await novoCorretor(amb, '21 97777-2222', 'Bia');
  assert.equal((await a.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' })).status, 201);
  const r = await b.post('/corretores', { cpf: '52998224725', creci: '54321', uf: 'RJ' });
  assert.equal(r.status, 409);
  assert.equal(r.dados.erro.codigo, 'cpf_em_uso');
  // a trava existe no banco, não só na tela
  assert.throws(() => amb.env.DB._db.prepare(
    "INSERT INTO corretores (usuario_id, cpf_cifrado, cpf_hash, creci, uf_creci, enviado_em, criado_em, atualizado_em) SELECT id, 'x', (SELECT cpf_hash FROM corretores LIMIT 1), '999', 'RJ', 'a', 'a', 'a' FROM usuarios WHERE celular = '5521977772222'"
  ).run(), /UNIQUE/);
});

test('o mesmo CRECI não pode estar em duas contas', async () => {
  const amb = criarAmbiente();
  const a = await novoCorretor(amb, '21 98888-1111');
  const b = await novoCorretor(amb, '21 97777-2222', 'Bia');
  await a.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const r = await b.post('/corretores', { cpf: CPF2, creci: '12.345', uf: 'rj' });
  assert.equal(r.status, 409);
  assert.equal(r.dados.erro.codigo, 'creci_em_uso');
});

test('reenviar enquanto está em análise não é permitido', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  assert.equal((await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' })).dados.erro.codigo, 'ja_enviado');
});

// ---------- administração ----------

async function admin(amb) {
  const adm = navegador(amb, { ip: '200.7.7.7' });
  await adm.entrar('21 99999-0000');
  return adm;
}

test('só admin vê a fila e decide; cliente e visitante não', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const idCorretor = amb.env.DB._db.prepare('SELECT usuario_id FROM corretores').get().usuario_id;
  assert.equal((await navegador(amb).get('/admin/creci')).status, 401);
  const r = await nav.get('/admin/creci');
  assert.equal(r.status, 403);
  assert.equal(r.dados.erro.codigo, 'sem_permissao');
  assert.equal((await nav.put(`/admin/creci/${idCorretor}`, { decisao: 'aprovar' })).status, 403);
});

test('fila mostra CPF mascarado e celular mascarado, mais antigos primeiro', async () => {
  const amb = criarAmbiente();
  const a = await novoCorretor(amb, '21 98888-1111', 'Ana');
  await a.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  amb.avancar(3600 * 5);
  const b = await novoCorretor(amb, '21 97777-2222', 'Bia');
  await b.post('/corretores', { cpf: CPF2, creci: '54321F', uf: 'RJ' });
  const fila = (await (await admin(amb)).get('/admin/creci')).dados;
  assert.equal(fila.itens.length, 2);
  assert.equal(fila.itens[0].nome, 'Ana');
  assert.equal(fila.itens[0].cpf, '***.***.***-25');
  assert.equal(fila.itens[0].celular, '(21) 9****-1111');
  assert.equal(fila.itens[0].horas_aguardando, 5);
  assert.ok(!JSON.stringify(fila).includes('529982'));
});

test('aprovar: ganha selo, teste grátis de 30 dias gravado, vira capaz de publicar, recebe aviso (aceite 1.9)', async () => {
  const amb = criarAmbiente();
  caixaDeSaida.length = 0;
  const nav = await novoCorretor(amb, '21 98888-1111');
  await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const adm = await admin(amb);
  const id = (await adm.get('/admin/creci')).dados.itens[0].usuario_id;
  amb.avancar(3600);
  const r = await adm.put(`/admin/creci/${id}`, { decisao: 'aprovar' });
  assert.equal(r.status, 200);
  assert.equal(r.dados.status, 'verificado');
  assert.equal(r.dados.teste_gratis_fim, '2026-12-10T13:00:00.000Z'); // 10/nov 13:00 + 30 dias

  const me = (await nav.get('/me')).dados;
  assert.equal(me.corretor.status, 'verificado');
  assert.equal(me.corretor.teste_gratis_fim, '2026-12-10T13:00:00.000Z');
  assert.ok(me.corretor.verificado_em);
  assert.equal(me.pode.publicar_imovel, true);
  assert.equal(me.pode.pedir_parceria, true);

  const linha = amb.env.DB._db.prepare('SELECT * FROM corretores').get();
  assert.equal(linha.teste_gratis_inicio, '2026-11-10T13:00:00.000Z');

  const aviso = caixaDeSaida.at(-1);
  assert.equal(aviso.para, '5521988881111');
  assert.match(aviso.texto, /verificado/);

  const auditoria = amb.env.DB._db.prepare("SELECT * FROM log_auditoria WHERE acao = 'creci_aprovado'").all();
  assert.equal(auditoria.length, 1);
  assert.equal(auditoria[0].alvo, id);
  assert.equal((await adm.get('/admin/creci')).dados.itens.length, 0, 'sai da fila');
});

test('duração do teste grátis vem da configuração', async () => {
  const amb = criarAmbiente();
  amb.env.DB._db.prepare("UPDATE configuracoes SET valor = '7' WHERE chave = 'dias_teste_gratis'").run();
  const nav = await novoCorretor(amb, '21 98888-1111');
  await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const adm = await admin(amb);
  const id = (await adm.get('/admin/creci')).dados.itens[0].usuario_id;
  const r = await adm.put(`/admin/creci/${id}`, { decisao: 'aprovar' });
  assert.equal(r.dados.teste_gratis_fim, '2026-11-17T12:00:00.000Z');
});

test('reprovar exige motivo; corretor vê o motivo e pode reenviar até 3 tentativas, depois bloqueia (aceite 1.8)', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  const adm = await admin(amb);
  let r = await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  assert.equal(r.dados.corretor.tentativas_restantes, 2);
  const id = (await adm.get('/admin/creci')).dados.itens[0].usuario_id;

  assert.equal((await adm.put(`/admin/creci/${id}`, { decisao: 'reprovar' })).dados.erro.codigo, 'motivo_necessario');
  r = await adm.put(`/admin/creci/${id}`, { decisao: 'reprovar', motivo: 'Nome não confere com o CRECI' });
  assert.equal(r.dados.status, 'reprovado');
  let me = (await nav.get('/me')).dados;
  assert.equal(me.corretor.status, 'reprovado');
  assert.equal(me.corretor.motivo, 'Nome não confere com o CRECI');
  assert.equal(me.corretor.tentativas_restantes, 2);

  // 2ª tentativa
  r = await nav.post('/corretores', { cpf: CPF, creci: '12346', uf: 'RJ' });
  assert.equal(r.status, 201);
  assert.equal(r.dados.corretor.tentativas_restantes, 1);
  assert.equal(r.dados.corretor.motivo, null);
  await adm.put(`/admin/creci/${id}`, { decisao: 'reprovar', motivo: 'CRECI inativo' });
  // 3ª tentativa
  r = await nav.post('/corretores', { cpf: CPF, creci: '12347', uf: 'RJ' });
  assert.equal(r.dados.corretor.tentativas_restantes, 0);
  r = await adm.put(`/admin/creci/${id}`, { decisao: 'reprovar', motivo: 'Documento ilegível' });
  assert.equal(r.dados.status, 'bloqueado');
  me = (await nav.get('/me')).dados;
  assert.equal(me.corretor.status, 'bloqueado');
  r = await nav.post('/corretores', { cpf: CPF, creci: '12348', uf: 'RJ' });
  assert.equal(r.status, 403);
  assert.equal(r.dados.erro.codigo, 'tentativas_esgotadas');
  assert.equal(me.pode.publicar_imovel, false);
});

test('reprovado libera o número do CRECI para outro corretor legítimo', async () => {
  const amb = criarAmbiente();
  const a = await novoCorretor(amb, '21 98888-1111');
  const b = await novoCorretor(amb, '21 97777-2222', 'Bia');
  const adm = await admin(amb);
  await a.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const id = (await adm.get('/admin/creci')).dados.itens[0].usuario_id;
  await adm.put(`/admin/creci/${id}`, { decisao: 'reprovar', motivo: 'Dados de outra pessoa' });
  assert.equal((await b.post('/corretores', { cpf: CPF2, creci: '12345', uf: 'RJ' })).status, 201);
});

test('não decide duas vezes o mesmo CRECI e não decide o próprio', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const adm = await admin(amb);
  const id = (await adm.get('/admin/creci')).dados.itens[0].usuario_id;
  assert.equal((await adm.put(`/admin/creci/${id}`, { decisao: 'aprovar' })).status, 200);
  const de_novo = await adm.put(`/admin/creci/${id}`, { decisao: 'reprovar', motivo: 'tarde demais' });
  assert.equal(de_novo.status, 409);
  assert.equal(de_novo.dados.erro.codigo, 'ja_decidido');

  // admin que também é corretor não aprova a si mesmo
  await adm.post('/me/perfil', { tipo: 'corretor', nome: 'Admin Corretor' });
  await adm.post('/corretores', { cpf: CPF2, creci: '77777', uf: 'RJ' });
  const meuId = amb.env.DB._db.prepare("SELECT usuario_id FROM corretores WHERE creci = '77777'").get().usuario_id;
  const auto = await adm.put(`/admin/creci/${meuId}`, { decisao: 'aprovar' });
  assert.equal(auto.status, 403);
  assert.equal(auto.dados.erro.codigo, 'auto_aprovacao');
});

test('decisão inválida e corretor inexistente', async () => {
  const amb = criarAmbiente();
  const adm = await admin(amb);
  assert.equal((await adm.put('/admin/creci/INEXISTENTE', { decisao: 'aprovar' })).status, 404);
  assert.equal((await adm.put('/admin/creci/X', { decisao: 'talvez' })).status, 400);
  assert.equal((await adm.get('/admin/creci?status=qualquer')).status, 400);
});

test('falha ao avisar por SMS não desfaz a aprovação (o status continua visível no app)', async () => {
  const amb = criarAmbiente();
  const nav = await novoCorretor(amb, '21 98888-1111');
  await nav.post('/corretores', { cpf: CPF, creci: '12345', uf: 'RJ' });
  const adm = await admin(amb);
  const id = (await adm.get('/admin/creci')).dados.itens[0].usuario_id;
  amb.env.MENSAGERIA_INJETADA = { enviar: async () => { throw new Error('provedor fora do ar'); } };
  const r = await adm.put(`/admin/creci/${id}`, { decisao: 'aprovar' });
  assert.equal(r.status, 200);
  assert.equal((await nav.get('/me')).dados.corretor.status, 'verificado');
});
