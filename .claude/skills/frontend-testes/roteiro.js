// Modelo de teste de tela com Playwright (Node). Não instala nada: usa o Playwright do ambiente.
// Uso: node roteiro.js <url> [pasta-de-saida]
//   ex.: node .claude/skills/frontend-testes/roteiro.js http://localhost:8787 /tmp/testes
// Faz: abre a URL em 3 larguras, espera a rede acalmar, tira screenshot, coleta erros do console,
// erros de página e requisições com falha. Sai com código 1 se encontrou algum problema.
// Para testar um fluxo, copie este arquivo e escreva os passos dentro de `passos()`.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const url = process.argv[2];
const saida = process.argv[3] || 'testes-saida';
if (!url) { console.error('Uso: node roteiro.js <url> [pasta-de-saida]'); process.exit(2); }

// Trava de segurança: não roda contra os endereços de produção do Xaveco.
const PRODUCAO = ['roleta.xavecocrm.com.br', 'xaveco.corretormarcojunior.com.br'];
if (PRODUCAO.some(h => url.includes(h)) && process.env.PERMITIR_PRODUCAO !== '1') {
  console.error('Bloqueado: isso é produção (dados reais de leads). Teste local ou no preview.');
  process.exit(2);
}

const LARGURAS = [
  { nome: 'celular', width: 390, height: 844 },
  { nome: 'tablet', width: 768, height: 1024 },
  { nome: 'desktop', width: 1440, height: 900 },
];

// Escreva aqui os passos do fluxo (reconheça antes: veja o screenshot e a lista de elementos).
// Use seletores descritivos: page.getByRole('button', { name: 'Entrar' }), page.getByLabel('E-mail'), '#id'.
async function passos(page, registrar) {
  // exemplo:
  // await page.getByLabel('E-mail').fill('teste@exemplo.com');
  // await page.getByRole('button', { name: 'Entrar' }).click();
  // await page.waitForLoadState('networkidle');
  // registrar('login leva ao painel', await page.getByText('Sair').isVisible());
}

(async () => {
  fs.mkdirSync(saida, { recursive: true });
  const browser = await chromium.launch();
  const resultados = [];
  let problemas = 0;
  try {
    for (const tam of LARGURAS) {
      const page = await browser.newPage({ viewport: { width: tam.width, height: tam.height } });
      const erros = [];
      page.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
      page.on('pageerror', e => erros.push('página: ' + e.message));
      page.on('requestfailed', r => erros.push('rede: ' + r.url() + ' (' + (r.failure()?.errorText || '') + ')'));
      page.on('response', r => { if (r.status() >= 500) erros.push('rede: ' + r.status() + ' ' + r.url()); });

      await page.goto(url, { waitUntil: 'networkidle' });

      // reconhecimento: o que existe na tela
      const elementos = await page.$$eval('button, a[href], input, select, textarea', els =>
        els.filter(e => e.offsetParent !== null).slice(0, 40).map(e =>
          `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''} "${(e.innerText || e.placeholder || e.name || '').trim().slice(0, 40)}"`));
      const rolaDoLado = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (rolaDoLado) erros.push('layout: rolagem horizontal');

      const registrar = (nome, ok) => { resultados.push({ largura: tam.nome, teste: nome, ok: !!ok }); if (!ok) problemas++; };
      await passos(page, registrar);

      const arquivo = path.join(saida, `${tam.nome}.png`);
      await page.screenshot({ path: arquivo, fullPage: true });
      problemas += erros.length;
      console.log(`\n## ${tam.nome} (${tam.width}px) → ${arquivo}`);
      console.log('elementos visíveis:', elementos.length ? '\n  ' + elementos.join('\n  ') : 'nenhum');
      console.log('problemas:', erros.length ? '\n  ' + erros.join('\n  ') : 'nenhum');
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (resultados.length) {
    console.log('\n| largura | teste | resultado |\n|---|---|---|');
    for (const r of resultados) console.log(`| ${r.largura} | ${r.teste} | ${r.ok ? 'passou' : 'FALHOU'} |`);
  }
  console.log(`\nTotal de problemas: ${problemas}`);
  process.exit(problemas ? 1 : 0);
})();
