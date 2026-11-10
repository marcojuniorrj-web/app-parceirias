// Embute a interface (src/web) num módulo do Worker: dist/web.js. Rodado antes do deploy (veja wrangler.toml).
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const raiz = path.resolve('src/web');
const TEXTO = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg']);
const arquivos = {};
let regras = [];

function percorrer(dir) {
  for (const nome of readdirSync(dir)) {
    const cheio = path.join(dir, nome);
    if (statSync(cheio).isDirectory()) { percorrer(cheio); continue; }
    const rel = '/' + path.relative(raiz, cheio).split(path.sep).join('/');
    if (rel === '/_headers') { regras = lerHeaders(readFileSync(cheio, 'utf8')); continue; }
    arquivos[rel] = TEXTO.has(path.extname(nome)) ? { texto: readFileSync(cheio, 'utf8') } : { base64: readFileSync(cheio).toString('base64') };
  }
}
function lerHeaders(txt) {
  const saida = []; let atual = null;
  for (const l of txt.split('\n')) {
    if (!l.trim()) continue;
    if (!/^\s/.test(l)) { atual = { padrao: l.trim(), headers: {} }; saida.push(atual); }
    else { const i = l.indexOf(':'); atual.headers[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  }
  return saida;
}

percorrer(raiz);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/web.js', `// GERADO por build-web.mjs — não editar\nexport const ARQUIVOS = ${JSON.stringify(arquivos)};\nexport const REGRAS = ${JSON.stringify(regras)};\n`);
const kb = (JSON.stringify(arquivos).length / 1024).toFixed(0);
console.log(`dist/web.js: ${Object.keys(arquivos).length} arquivos, ${kb} KB`);
