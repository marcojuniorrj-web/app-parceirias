// Teste no navegador de verdade (Playwright): sobe o servidor de desenvolvimento, percorre o roteiro da Fase 1
// e falha se houver erro de console, falha de rede, rolagem horizontal ou violação de CSP.
// Uso: SAIDA=/pasta/para/prints node testes/e2e/fluxo.mjs
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const PORTA = 8791;
const BASE = `http://localhost:${PORTA}`;
const SAIDA = process.env.SAIDA || '/tmp/prints-parceiros';
mkdirSync(SAIDA, { recursive: true });

const servidor = spawn('node', ['dev/servidor.js'], { env: { ...process.env, PORT: String(PORTA) }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((ok, falha) => {
  const t = setTimeout(() => falha(new Error('servidor não subiu')), 10000);
  servidor.stdout.on('data', (d) => { if (String(d).includes('http://localhost')) { clearTimeout(t); ok(); } });
});

const problemas = [];
const navegador = await chromium.launch();
const passo = (t) => console.log(`• ${t}`);

async function novaPagina(largura = 390, altura = 844) {
  const ctx = await navegador.newContext({ viewport: { width: largura, height: altura }, serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (!['error', 'warning'].includes(m.type())) return;
    // único erro esperado: o 400 do código errado digitado de propósito no passo 2
    if (m.location().url.endsWith('/api/v1/auth/entrar') && m.text().includes('status of 400')) return;
    problemas.push(`console ${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problemas.push(`erro de página: ${e.message}`));
  page.on('requestfailed', (r) => problemas.push(`requisição falhou: ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/api/v1/')) problemas.push(`HTTP ${r.status()} em ${r.url()}`); });
  return { ctx, page };
}
const semRolagemLateral = async (page, nome) => {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `rolagem horizontal em ${nome}: ${sw} > ${iw}`);
};
const foto = (page, nome) => page.screenshot({ path: `${SAIDA}/${nome}.png`, fullPage: true });
async function entrarComo(page, celular, perfil, nome) {
  await page.goto(`${BASE}/#/entrar`);
  await page.fill('#celular', celular);
  await page.click('button[type=submit]');
  await page.waitForSelector('#codigo-dev');
  const codigo = await page.textContent('#codigo-dev');
  await page.fill('#codigo', codigo);
  await page.click('button[type=submit]');
  await page.waitForSelector('#nome');
  await page.fill('#nome', nome);
  await page.click(`button[data-tipo="${perfil}"]`);
}

try {
  // ---------- 1. visitante vê o feed ----------
  const { page, ctx } = await novaPagina();
  await page.goto(BASE);
  await page.waitForSelector('.imovel');
  passo('feed abre para visitante, sem login');
  assert.equal(await page.locator('.imovel').count(), 5);
  assert.ok(await page.locator('.aviso-exemplo').isVisible(), 'aviso de exemplo');
  const menuVisitante = await page.locator('.menu__item span').allTextContents();
  assert.deepEqual(menuVisitante, ['Feed', 'Buscar', 'Salvos', 'Conversas', 'Entrar']);
  await semRolagemLateral(page, 'feed 390');
  await foto(page, '01-feed-visitante-390');

  // PWA: manifest, ícones e service worker
  const manifest = await (await page.request.get(`${BASE}/manifest.webmanifest`)).json();
  assert.equal(manifest.display, 'standalone');
  for (const ic of manifest.icons) assert.equal((await page.request.get(BASE + ic.src)).status(), 200, ic.src);
  await page.waitForFunction(() => navigator.serviceWorker.getRegistration().then((r) => Boolean(r?.active)), null, { timeout: 8000 });
  passo('PWA: manifest, ícones e service worker ativo');

  // ---------- 2. ♥ como visitante → entra → volta com o ♥ salvo ----------
  await page.click('[data-acao="favoritar"][data-id="ex-1"]');
  await page.waitForSelector('#celular');
  passo('♥ como visitante leva para entrar');
  await foto(page, '02-entrar-celular-390');
  await page.fill('#celular', '21 98888-1111');
  assert.equal(await page.inputValue('#celular'), '(21) 98888-1111', 'máscara do celular');
  await page.click('button[type=submit]');
  await page.waitForSelector('#codigo');
  assert.ok((await page.textContent('#reenviar')).includes('Pedir outro código em'), 'cronômetro de reenvio');
  assert.ok(await page.locator('#reenviar').isDisabled());
  await foto(page, '03-entrar-codigo-390');
  await page.fill('#codigo', '000000');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => document.getElementById('erro')?.textContent.includes('incorreto'));
  passo('código errado mostra erro claro');
  const codigo = await page.textContent('#codigo-dev');
  await page.fill('#codigo', codigo);
  await page.click('button[type=submit]');
  await page.waitForSelector('#nome');
  await foto(page, '04-primeiro-acesso-390');
  assert.ok(await page.locator('button[data-tipo="imobiliaria"]').isDisabled(), 'imobiliária em breve');
  await page.click('button[data-tipo="cliente"]');
  assert.equal(await page.locator('#erro').textContent(), 'Informe seu nome para continuar.');
  await page.fill('#nome', 'Maria Cliente');
  await page.click('button[data-tipo="cliente"]');
  await page.waitForSelector('.imovel');
  assert.equal(await page.getAttribute('[data-acao="favoritar"][data-id="ex-1"]', 'aria-pressed'), 'true');
  passo('depois de entrar, volta ao feed com o ♥ já salvo (aceite 1.6)');
  await page.reload();
  await page.waitForSelector('.imovel');
  assert.equal(await page.getAttribute('[data-acao="favoritar"][data-id="ex-1"]', 'aria-pressed'), 'true', 'persistiu no servidor');
  await foto(page, '05-feed-logado-390');
  const menuCliente = await page.locator('.menu__item span').allTextContents();
  assert.deepEqual(menuCliente, ['Feed', 'Buscar', 'Salvos', 'Conversas', 'Perfil']);

  // ---------- 3. virar corretor, enviar CRECI, ficar em análise ----------
  await page.click('.menu__item[href="#/perfil"]');
  await page.waitForSelector('text=Também sou corretor');
  await page.click('[data-acao="virar-corretor"]');
  await page.waitForSelector('#cpf');
  await foto(page, '06-cadastro-corretor-390');
  await page.fill('#cpf', '52998224725');
  assert.equal(await page.inputValue('#cpf'), '529.982.247-25', 'máscara de CPF');
  await page.fill('#creci', '12345F');
  await page.click('button[type=submit]');
  await page.waitForSelector('text=CRECI em análise');
  passo('CRECI enviado: perfil mostra "em análise"');
  await foto(page, '07-perfil-em-analise-390');
  const menuCorretor = await page.locator('.menu__item span').allTextContents();
  assert.deepEqual(menuCorretor, ['Feed', 'Buscar', 'Publicar', 'Conversas', 'Perfil']);
  await page.click('.menu__item[href="#/publicar"]');
  await page.waitForSelector('.estado--bloqueio');
  assert.ok((await page.textContent('.estado--bloqueio')).includes('em análise'));
  passo('corretor em análise vê bloqueio em Publicar (aceite 1.8)');
  await foto(page, '08-publicar-bloqueado-390');
  await semRolagemLateral(page, 'publicar 390');

  // ---------- 4. admin aprova ----------
  const adm = await novaPagina(1280, 800);
  await entrarComo(adm.page, '21 99999-0000', 'cliente', 'Marco Admin');
  await adm.page.waitForSelector('.imovel');
  await adm.page.click('.menu__item[href="#/perfil"]');
  await adm.page.click('text=Painel do administrador');
  await adm.page.waitForSelector('.item-fila');
  assert.equal(await adm.page.locator('.item-fila').count(), 1);
  assert.ok((await adm.page.textContent('.item-fila')).includes('***.***.***-25'), 'CPF mascarado');
  assert.ok(!(await adm.page.textContent('.item-fila')).includes('529.982'), 'CPF completo não aparece');
  await foto(adm.page, '09-admin-fila-1280');
  await semRolagemLateral(adm.page, 'admin 1280');
  await adm.page.click('[data-acao="aprovar-creci"]');
  await adm.page.waitForSelector('text=Fila zerada');
  passo('admin aprova CRECI e a fila zera');
  await foto(adm.page, '10-admin-fila-vazia-1280');

  // ---------- 5. corretor vê selo e teste grátis ----------
  await page.click('.menu__item[href="#/perfil"]');
  await page.reload();
  await page.waitForSelector('text=Verificado');
  const perfilTxt = await page.textContent('.bloco--ok');
  assert.ok(perfilTxt.includes('12345F/RJ') && perfilTxt.includes('teste grátis'), perfilTxt);
  assert.match(perfilTxt, /\d{2}\/\d{2}\/\d{4}/, 'data do fim do teste');
  passo('corretor aprovado vê selo "Verificado" e o fim do teste grátis (aceite 1.9)');
  await foto(page, '11-perfil-verificado-390');
  await page.click('.menu__item[href="#/publicar"]');
  await page.waitForSelector('.estado--vazio');
  assert.ok((await page.textContent('.estado--vazio')).includes('chega na próxima fase'));

  // ---------- 6. reprovação com motivo ----------
  const b = await novaPagina();
  await entrarComo(b.page, '21 97777-2222', 'corretor', 'Bruno Corretor');
  await b.page.waitForSelector('#cpf');
  await b.page.fill('#cpf', '11144477735');
  await b.page.fill('#creci', '54321');
  await b.page.click('button[type=submit]');
  await b.page.waitForSelector('text=CRECI em análise');
  await adm.page.click('.menu__item[href="#/admin"]').catch(() => {});
  await adm.page.goto(`${BASE}/#/admin`);
  await adm.page.reload();
  await adm.page.waitForSelector('.item-fila');
  await adm.page.click('[data-acao="reprovar-abrir"]');
  await adm.page.fill('input[name="motivo"]', 'O nome não confere com o CRECI');
  await adm.page.click('text=Confirmar reprovação');
  await adm.page.waitForSelector('text=Fila zerada');
  await b.page.reload();
  await b.page.waitForSelector('text=Pendente de ação');
  assert.ok((await b.page.textContent('.bloco--aviso')).includes('O nome não confere com o CRECI'));
  assert.ok((await b.page.textContent('.bloco--aviso')).includes('2 tentativas'));
  passo('reprovado vê o motivo e quantas tentativas restam');
  await foto(b.page, '12-perfil-reprovado-390');

  // ---------- 7. sair de todos os aparelhos ----------
  await page.click('.menu__item[href="#/perfil"]');
  await page.click('[data-acao="sair-todos"]');
  await page.waitForSelector('.imovel');
  assert.deepEqual(await page.locator('.menu__item span').allTextContents(), ['Feed', 'Buscar', 'Salvos', 'Conversas', 'Entrar']);
  passo('sair de todos os aparelhos volta ao modo visitante');

  // ---------- 8. design system e responsivo ----------
  for (const [w, h] of [[360, 780], [390, 844], [768, 1024], [1440, 900]]) {
    const r = await novaPagina(w, h);
    for (const rota of ['feed', 'entrar', 'design']) {
      await r.page.goto(`${BASE}/#/${rota}`);
      await r.page.waitForSelector('.pagina, .imovel');
      await semRolagemLateral(r.page, `${rota} ${w}`);
      await foto(r.page, `13-${rota}-${w}`);
    }
    await r.ctx.close();
  }
  passo('sem rolagem horizontal em 360, 390, 768 e 1440 px');

  // ---------- 9. teclado/foco ----------
  const t = await novaPagina();
  await t.page.goto(`${BASE}/#/feed`);
  await t.page.waitForSelector('.imovel');
  await t.page.keyboard.press('Tab');
  const foco = await t.page.evaluate(() => document.activeElement?.className);
  assert.ok(foco, 'algo recebe foco com Tab');

  await ctx.close(); await adm.ctx.close(); await b.ctx.close(); await t.ctx.close();
} finally {
  await navegador.close();
  servidor.kill();
}

if (problemas.length) {
  console.error('\nPROBLEMAS ENCONTRADOS:\n' + [...new Set(problemas)].map((p) => ` - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`\nOK — sem erros de console, rede ou CSP. Prints em ${SAIDA}`);
