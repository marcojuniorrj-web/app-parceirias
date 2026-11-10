// Mede a performance de uma página com o Playwright do ambiente (não instala nada).
// Uso: node medir.js <url> [rodadas=3]
//   ex.: node .claude/skills/frontend-performance/medir.js http://localhost:8787
// Mede em celular (4G simulado, CPU 4x mais lenta) e desktop: LCP, CLS, TTFB, carga completa,
// tarefas longas, nº de requisições e peso por tipo. Mostra a MEDIANA das rodadas e compara
// com o orçamento. Sai com código 1 se algo estourou o orçamento.
const { chromium } = require('playwright');

const url = process.argv[2];
const rodadas = Math.max(1, Number(process.argv[3]) || 3);
if (!url) { console.error('Uso: node medir.js <url> [rodadas]'); process.exit(2); }

const PRODUCAO = ['roleta.xavecocrm.com.br', 'xaveco.corretormarcojunior.com.br'];
if (PRODUCAO.some(h => url.includes(h)) && process.env.PERMITIR_PRODUCAO !== '1') {
  console.error('Bloqueado: produção. Meça local/preview, ou rode com PERMITIR_PRODUCAO=1 se o usuário pediu (só leitura).');
  process.exit(2);
}

// Orçamento (limites máximos). Peso em KB transferidos.
const ORCAMENTO = { lcp: 2500, cls: 0.1, ttfb: 800, longas: 200, js: 200, css: 50, img: 500, font: 100, total: 1000, reqs: 50 };

const PERFIS = [
  { nome: 'celular-4g', viewport: { width: 390, height: 844 }, mobile: true,
    rede: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }, cpu: 4 },
  { nome: 'desktop', viewport: { width: 1440, height: 900 }, mobile: false, rede: null, cpu: 1 },
];

const tipoDe = (t, u) => t === 'script' ? 'js' : t === 'stylesheet' ? 'css' : t === 'image' ? 'img' : t === 'font' ? 'font' : 'outro';

async function umaRodada(browser, perfil) {
  const ctx = await browser.newContext({ viewport: perfil.viewport, isMobile: perfil.mobile });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (perfil.rede) await cdp.send('Network.emulateNetworkConditions', { offline: false, ...perfil.rede });
  if (perfil.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: perfil.cpu });

  const peso = { js: 0, css: 0, img: 0, font: 0, outro: 0 };
  const tipos = new Map();
  let reqs = 0;
  cdp.on('Network.responseReceived', e => tipos.set(e.requestId, tipoDe(e.type.toLowerCase(), e.response.url)));
  cdp.on('Network.loadingFinished', e => { reqs++; const t = tipos.get(e.requestId) || 'outro'; peso[t] += e.encodedDataLength; });

  await page.addInitScript(() => {
    window.__m = { lcp: 0, cls: 0, longas: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.longas += Math.max(0, e.duration - 50); })
      .observe({ type: 'longtask', buffered: true });
  });

  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1500); // deixa LCP/CLS assentarem
  const m = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    return { ...window.__m, ttfb: n ? n.responseStart : 0, carga: n ? n.loadEventEnd : 0 };
  });
  await ctx.close();
  const kb = v => Math.round(v / 1024);
  return { lcp: Math.round(m.lcp), cls: Number(m.cls.toFixed(3)), ttfb: Math.round(m.ttfb), carga: Math.round(m.carga),
    longas: Math.round(m.longas), reqs, js: kb(peso.js), css: kb(peso.css), img: kb(peso.img), font: kb(peso.font),
    total: kb(Object.values(peso).reduce((a, b) => a + b, 0)) };
}

const mediana = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

(async () => {
  const browser = await chromium.launch();
  let estouros = 0;
  try {
    for (const perfil of PERFIS) {
      const runs = [];
      for (let i = 0; i < rodadas; i++) runs.push(await umaRodada(browser, perfil));
      console.log(`\n## ${perfil.nome} — mediana de ${rodadas} rodada(s)`);
      console.log('| métrica | valor | variação | orçamento | status |\n|---|---|---|---|---|');
      const un = { lcp: 'ms', ttfb: 'ms', carga: 'ms', longas: 'ms', cls: '', reqs: '', js: 'KB', css: 'KB', img: 'KB', font: 'KB', total: 'KB' };
      for (const k of Object.keys(un)) {
        const vals = runs.map(r => r[k]);
        const v = mediana(vals);
        const varia = Math.max(...vals) - Math.min(...vals);
        const lim = ORCAMENTO[k];
        const ok = lim === undefined || v <= lim;
        if (!ok) estouros++;
        console.log(`| ${k} | ${v}${un[k]} | ±${Number(varia.toFixed(3))} | ${lim === undefined ? '—' : lim + un[k]} | ${lim === undefined ? '' : ok ? 'ok' : 'ESTOUROU'} |`);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`\nItens acima do orçamento: ${estouros}`);
  process.exit(estouros ? 1 : 0);
})();
