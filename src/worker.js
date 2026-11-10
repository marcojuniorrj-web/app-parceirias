// Entrada do Worker: junta as rotas dos módulos. Só /api/* chega aqui em produção (a interface é servida como arquivos estáticos).
import { criarManipulador } from './nucleo/roteador.js';
import { json } from './nucleo/http.js';
import { rotas as contas } from './modulos/contas/rotas.js';
import { autenticar } from './modulos/contas/servico.js';
import { rotas as corretores } from './modulos/corretores/rotas.js';
import { rotas as feed } from './modulos/feed/rotas.js';
import { rotas as moderacao } from './modulos/moderacao/rotas.js';

const saude = {
  metodo: 'GET',
  caminho: '/saude',
  auth: 'nenhuma',
  handler: async (ctx) => {
    const banco = await ctx.db.prepare('SELECT 1 AS ok').first();
    return json({ ok: banco?.ok === 1, ambiente: ctx.env.AMBIENTE ?? null });
  },
};

export const manipular = criarManipulador([saude, ...contas, ...corretores, ...feed, ...moderacao], { autenticar });

export default {
  fetch: (req, env) => manipular(req, env),
};
