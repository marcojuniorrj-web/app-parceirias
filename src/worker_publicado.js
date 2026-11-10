// Entrada usada no deploy: o mesmo Worker + a interface embutida (dist/web.js, gerado por build-web.mjs).
import { manipular } from './worker.js';
import { criarServidorEstatico } from './nucleo/estatico.js';
import { ARQUIVOS, REGRAS } from '../dist/web.js';

const servir = criarServidorEstatico(ARQUIVOS, REGRAS);

export default {
  fetch: (req, env) => manipular(req, { ...env, ASSETS: { fetch: servir } }),
};
