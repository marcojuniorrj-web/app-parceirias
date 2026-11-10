import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAmbiente, navegador, caixaDeSaida, ADMIN } from './ajuda/ambiente.js';

const CEL = '(21) 98888-1111';
const CEL_N = '5521988881111';

async function pedir(nav, celular = CEL) {
  const r = await nav.post('/auth/codigo', { celular });
  return r;
}

test('celular inválido é recusado com mensagem clara', async () => {
  const nav = navegador(criarAmbiente());
  const r = await pedir(nav, '123');
  assert.equal(r.status, 400);
  assert.equal(r.dados.erro.codigo, 'celular_invalido');
});

test('pedir código: envia pela mensageria e (só em teste) devolve o código', async () => {
  caixaDeSaida.length = 0;
  const nav = navegador(criarAmbiente());
  const r = await pedir(nav);
  assert.equal(r.status, 200);
  assert.match(r.dados.codigo_dev, /^\d{6}$/);
  assert.equal(r.dados.reenviar_em_s, 60);
  const msg = caixaDeSaida.at(-1);
  assert.equal(msg.para, CEL_N);
  assert.ok(msg.texto.includes(r.dados.codigo_dev));
});

test('se o envio do código falhar: erro claro e o código não fica valendo', async () => {
  const amb = criarAmbiente({ MENSAGERIA_INJETADA: { enviar: async () => { throw new Error('fora do ar'); } } });
  const nav = navegador(amb);
  const r = await pedir(nav);
  assert.equal(r.status, 502);
  assert.equal(r.dados.erro.codigo, 'envio_falhou');
  assert.equal(amb.env.DB._db.prepare('SELECT COUNT(*) n FROM codigos_otp').get().n, 0);
  // e pode tentar de novo logo em seguida (não conta no reenvio de 60s)
  amb.env.MENSAGERIA_INJETADA = undefined;
  assert.equal((await pedir(nav)).status, 200);
});

test('o código nunca fica guardado em texto no banco', async () => {
  const amb = criarAmbiente();
  const r = await pedir(navegador(amb));
  const linhas = amb.env.DB._db.prepare('SELECT * FROM codigos_otp').all();
  assert.equal(linhas.length, 1);
  assert.ok(!JSON.stringify(linhas[0]).includes(r.dados.codigo_dev));
});

test('reenvio só depois de 60s', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  await pedir(nav);
  amb.avancar(30);
  const cedo = await pedir(nav);
  assert.equal(cedo.status, 429);
  assert.equal(cedo.dados.erro.codigo, 'aguarde');
  assert.equal(cedo.dados.erro.espere_s, 30);
  amb.avancar(31);
  assert.equal((await pedir(nav)).status, 200);
});

test('limite de 5 códigos por hora por celular', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  for (let i = 0; i < 5; i++) {
    assert.equal((await pedir(nav)).status, 200, `pedido ${i + 1}`);
    amb.avancar(61);
  }
  const sexto = await pedir(nav);
  assert.equal(sexto.status, 429);
  assert.equal(sexto.dados.erro.codigo, 'limite_horario');
  amb.avancar(3600);
  assert.equal((await pedir(nav)).status, 200, 'libera depois de 1 hora');
});

test('limite por aparelho (IP): 20 por hora, mesmo trocando de celular', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb, { ip: '200.9.9.9' });
  for (let i = 0; i < 20; i++) {
    const r = await nav.post('/auth/codigo', { celular: `21 9${10000000 + i}` });
    assert.equal(r.status, 200, `pedido ${i + 1}: ${JSON.stringify(r.dados)}`);
  }
  const r = await nav.post('/auth/codigo', { celular: '21 99999-1234' });
  assert.equal(r.status, 429);
  assert.equal(r.dados.erro.codigo, 'limite_horario');
  const outroAparelho = navegador(amb, { ip: '200.9.9.10' });
  assert.equal((await outroAparelho.post('/auth/codigo', { celular: '21 99999-1234' })).status, 200);
});

test('entrar com código certo cria sessão em cookie HttpOnly', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  const r = await nav.entrar(CEL);
  assert.equal(r.status, 200);
  assert.equal(r.dados.precisa_escolher_perfil, true);
  assert.equal(r.dados.usuario.celular, '(21) 9****-1111');
  const c = r.setCookie[0];
  assert.match(c, /^sessao=/);
  assert.match(c, /HttpOnly/);
  assert.match(c, /SameSite=Lax/);
  assert.match(c, /Secure/);
  assert.match(c, /Max-Age=2592000/); // 30 dias
  const eu = await nav.get('/me');
  assert.equal(eu.dados.usuario.celular, '(21) 9****-1111');
});

test('o token da sessão não fica em texto no banco', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  await nav.entrar(CEL);
  const token = nav.cookie.split('=')[1];
  const linhas = JSON.stringify(amb.env.DB._db.prepare('SELECT * FROM sessoes').all());
  assert.ok(!linhas.includes(token));
});

test('em desenvolvimento o cookie não exige https', async () => {
  const nav = navegador(criarAmbiente({ AMBIENTE: 'dev' }));
  const r = await nav.entrar(CEL);
  assert.ok(!/Secure/.test(r.setCookie[0]));
});

test('código errado: conta tentativas e bloqueia na quinta', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  const p = await pedir(nav);
  const errado = p.dados.codigo_dev === '000000' ? '111111' : '000000';
  for (let i = 1; i <= 4; i++) {
    const r = await nav.post('/auth/entrar', { celular: CEL, codigo: errado });
    assert.equal(r.status, 400);
    assert.equal(r.dados.erro.codigo, 'codigo_invalido');
    assert.equal(r.dados.erro.tentativas_restantes, 5 - i);
  }
  const quinta = await nav.post('/auth/entrar', { celular: CEL, codigo: errado });
  assert.equal(quinta.status, 400);
  const depois = await nav.post('/auth/entrar', { celular: CEL, codigo: p.dados.codigo_dev });
  assert.equal(depois.status, 429, 'mesmo o código certo é recusado depois de 5 erros');
  assert.equal(depois.dados.erro.codigo, 'muitas_tentativas');
});

test('código vencido (10 min) é recusado com mensagem própria', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  const p = await pedir(nav);
  amb.avancar(10 * 60 + 1);
  const r = await nav.post('/auth/entrar', { celular: CEL, codigo: p.dados.codigo_dev });
  assert.equal(r.status, 400);
  assert.equal(r.dados.erro.codigo, 'codigo_expirado');
});

test('código só vale uma vez', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  const p = await pedir(nav);
  assert.equal((await nav.post('/auth/entrar', { celular: CEL, codigo: p.dados.codigo_dev })).status, 200);
  const outro = navegador(amb);
  const de_novo = await outro.post('/auth/entrar', { celular: CEL, codigo: p.dados.codigo_dev });
  assert.equal(de_novo.status, 400);
});

test('código de outro celular não serve', async () => {
  const nav = navegador(criarAmbiente());
  const p = await pedir(nav, CEL);
  const r = await nav.post('/auth/entrar', { celular: '(21) 97777-2222', codigo: p.dados.codigo_dev });
  assert.equal(r.status, 400);
});

test('dados malformados', async () => {
  const nav = navegador(criarAmbiente());
  assert.equal((await nav.post('/auth/entrar', { celular: CEL, codigo: '12' })).status, 400);
  assert.equal((await nav.post('/auth/entrar', {})).status, 400);
  const r = await nav.chamar('POST', '/auth/codigo', undefined);
  assert.equal(r.status, 415);
});

test('sair encerra só esta sessão; sair de todos encerra todas', async () => {
  const amb = criarAmbiente();
  const celular = navegador(amb), notebook = navegador(amb);
  await celular.entrar(CEL);
  amb.avancar(61);
  await notebook.entrar(CEL);
  assert.ok((await celular.get('/me')).dados.usuario);
  assert.ok((await notebook.get('/me')).dados.usuario);

  await celular.post('/auth/sair');
  assert.equal((await celular.get('/me')).dados.usuario, null);
  assert.ok((await notebook.get('/me')).dados.usuario, 'o outro aparelho continua logado');

  amb.avancar(61);
  await celular.entrar(CEL);
  const r = await celular.post('/auth/sair-todos');
  assert.equal(r.status, 200);
  assert.equal((await celular.get('/me')).dados.usuario, null);
  assert.equal((await notebook.get('/me')).dados.usuario, null, 'sair de todos os aparelhos');
});

test('sessão vale 30 dias, renova quando falta menos de 15 e vence se ficar parada', async () => {
  const amb = criarAmbiente();
  const nav = navegador(amb);
  await nav.entrar(CEL);
  amb.avancar(10 * 86400);
  const r1 = await nav.get('/me');
  assert.ok(r1.dados.usuario);
  assert.equal(r1.setCookie.length, 0, 'faltam 20 dias: não renova');
  amb.avancar(10 * 86400); // faltam 10 dias
  const r2 = await nav.get('/me');
  assert.ok(r2.dados.usuario);
  assert.equal(r2.setCookie.length, 1, 'faltam 10 dias: renova por mais 30');
  amb.avancar(29 * 86400);
  assert.ok((await nav.get('/me')).dados.usuario, 'ainda vale (e renova de novo)');
  amb.avancar(31 * 86400); // parada por mais de 30 dias
  assert.equal((await nav.get('/me')).dados.usuario, null);
});

test('celular listado em ADMIN_CELULARES nasce admin; os outros não', async () => {
  const amb = criarAmbiente();
  const adm = await navegador(amb).entrar('21 99999-0000');
  assert.ok(adm.dados.papeis.includes('admin'));
  assert.equal(adm.dados.precisa_escolher_perfil, true, 'admin ainda escolhe se também é cliente/corretor');
  const outro = await navegador(amb).entrar(CEL);
  assert.ok(!outro.dados.papeis.includes('admin'));
});

test('visitante recebe /me vazio (200, sem erro no console do navegador)', async () => {
  const nav = navegador(criarAmbiente());
  const r = await nav.get('/me');
  assert.equal(r.status, 200);
  assert.equal(r.dados.usuario, null);
  assert.equal(r.dados.pode.ver_feed, true);
  assert.equal(r.dados.pode.favoritar_ou_salvar, false);
});

test('pedido vindo de outro site (CSRF) é barrado', async () => {
  const nav = navegador(criarAmbiente());
  const r = await nav.chamar('POST', '/auth/codigo', { celular: CEL }, { origin: 'https://site-malicioso.com' });
  assert.equal(r.status, 403);
  assert.equal(r.dados.erro.codigo, 'origem_invalida');
  const ok = await nav.chamar('POST', '/auth/codigo', { celular: CEL }, { origin: 'https://app.exemplo.com.br' });
  assert.equal(ok.status, 200);
});

test('mensageria falsa é proibida em produção (falha alto, não em silêncio)', async () => {
  const nav = navegador(criarAmbiente({ AMBIENTE: 'producao' }));
  const r = await pedir(nav);
  assert.equal(r.status, 500);
  assert.equal(r.dados.erro.codigo, 'erro_interno');
});

test('segredo ausente derruba com erro 500 genérico (sem vazar detalhes)', async () => {
  const nav = navegador(criarAmbiente({ SEGREDO_APP: undefined }));
  const r = await pedir(nav);
  assert.equal(r.status, 500);
  assert.ok(!JSON.stringify(r.dados).includes('SEGREDO'));
});

test('rota inexistente e método errado', async () => {
  const nav = navegador(criarAmbiente());
  assert.equal((await nav.get('/nao-existe')).status, 404);
  assert.equal((await nav.get('/auth/codigo')).status, 405);
});

test('saúde: responde e toca o banco', async () => {
  const r = await navegador(criarAmbiente()).get('/saude');
  assert.equal(r.status, 200);
  assert.equal(r.dados.ok, true);
});

test('fora de /api o worker entrega ao serviço de arquivos estáticos', async () => {
  const { manipular } = await import('../src/worker.js');
  const amb = criarAmbiente({ ASSETS: { fetch: async () => new Response('estatico') } });
  const r = await manipular(new Request('https://app.exemplo.com.br/feed'), amb.env);
  assert.equal(await r.text(), 'estatico');
});
