// Contraste AA (WCAG 2.1): 4,5:1 para texto normal. Lê as cores direto do app.css para não haver cópia que envelheça.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/web/app.css', import.meta.url), 'utf8');
const cor = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const PARES = [
  ['texto', 'fundo'], ['texto', 'superficie'], ['texto-2', 'superficie'], ['texto-2', 'fundo'],
  ['sobre-primaria', 'primaria'], ['sobre-primaria', 'primaria-escura'], ['primaria', 'superficie'], ['primaria', 'primaria-clara'], ['primaria-escura', 'primaria-clara'],
  ['sobre-ambar', 'ambar'], ['verde', 'verde-claro'], ['erro', 'erro-claro'], ['aviso', 'aviso-claro'], ['erro', 'superficie'],
];

for (const [a, b] of PARES) {
  test(`contraste AA › ${a} sobre ${b}`, () => {
    assert.ok(cor[a] && cor[b], `variáveis --${a} e --${b} existem`);
    const r = razao(cor[a], cor[b]);
    assert.ok(r >= 4.5, `${a} (${cor[a]}) sobre ${b} (${cor[b]}) = ${r.toFixed(2)}:1`);
  });
}

test('toque: botões e itens de menu têm pelo menos 44px de altura', () => {
  assert.match(css, /\.botao \{[^}]*min-height: 2\.75rem/);
  assert.match(css, /\.menu__item \{[^}]*min-height: 3\.5rem/);
});

test('sem estilos inline na interface (a política de segurança bloqueia)', () => {
  for (const arq of ['index.html', 'js/telas.js', 'js/componentes.js', 'js/app.js']) {
    const t = readFileSync(new URL(`../src/web/${arq}`, import.meta.url), 'utf8');
    assert.ok(!/\sstyle=["']/.test(t), `${arq} usa style=""`);
    assert.ok(!/\son[a-z]+=["']/.test(t), `${arq} usa handler inline`);
  }
});
