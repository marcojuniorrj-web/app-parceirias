import { ErroHttp, json } from '../../nucleo/http.js';
import { IMOVEIS_EXEMPLO, IDS_EXEMPLO } from './exemplos.js';

function validarItem(id) {
  if (!IDS_EXEMPLO.has(id)) throw new ErroHttp(404, 'nao_encontrado', 'Imóvel não encontrado.');
  return id;
}

export const rotas = [
  // Fase 1: só exemplos. Na Fase 2 o mesmo endpoint passa a devolver imóveis reais ordenados.
  { metodo: 'GET', caminho: '/feed', auth: 'nenhuma', acao: 'ver_feed', handler: async () => json({ itens: IMOVEIS_EXEMPLO, exemplo: true }) },

  {
    metodo: 'GET',
    caminho: '/favoritos',
    auth: 'obrigatoria',
    acao: 'favoritar_ou_salvar',
    handler: async (ctx) => {
      const r = await ctx.db.prepare('SELECT item_id FROM favoritos WHERE usuario_id = ? ORDER BY criado_em DESC').bind(ctx.usuario.id).all();
      return json({ ids: r.results.map((l) => l.item_id) });
    },
  },
  {
    metodo: 'POST',
    caminho: '/favoritos/:id',
    auth: 'obrigatoria',
    acao: 'favoritar_ou_salvar',
    handler: async (ctx) => {
      validarItem(ctx.params.id);
      await ctx.db
        .prepare('INSERT OR IGNORE INTO favoritos (usuario_id, item_id, criado_em) VALUES (?, ?, ?)')
        .bind(ctx.usuario.id, ctx.params.id, ctx.agora().toISOString())
        .run();
      return json({ ok: true });
    },
  },
  {
    metodo: 'DELETE',
    caminho: '/favoritos/:id',
    auth: 'obrigatoria',
    acao: 'favoritar_ou_salvar',
    handler: async (ctx) => {
      await ctx.db.prepare('DELETE FROM favoritos WHERE usuario_id = ? AND item_id = ?').bind(ctx.usuario.id, ctx.params.id).run();
      return json({ ok: true });
    },
  },
];
