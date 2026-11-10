import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { readFileSync } from 'node:fs';
const dir = '/home/user/app-parceirias/src/web/icons/';
const svg = readFileSync(dir + 'icone.svg', 'utf8');
const browser = await chromium.launch();
async function png(tam, arquivo, escala = 1) {
  const page = await browser.newPage({ viewport: { width: tam, height: tam } });
  // maskable: conteúdo dentro da zona segura (80%), fundo sangrando até a borda
  const corpo = escala === 1 ? svg : svg.replace('<g fill', `<g transform="translate(256 256) scale(${escala}) translate(-256 -256)" fill`).replace('<circle cx="256" cy="256" r="26"', `<circle transform="translate(256 256) scale(${escala}) translate(-256 -256)" cx="256" cy="256" r="26"`);
  await page.setContent(`<html><body style="margin:0">${corpo.replace('<svg ', `<svg width="${tam}" height="${tam}" `)}</body></html>`);
  await page.screenshot({ path: dir + arquivo });
  await page.close();
}
await png(180, 'icone-180.png');
await png(192, 'icone-192.png');
await png(512, 'icone-512.png');
await png(512, 'icone-maskable-512.png', 0.78);
await browser.close();
