import { ErroHttp, json, respostaErro, lerJson } from './http.js';
import { pode, motivoNegacao } from './permissoes.js';
import { criarMensageria } from '../integracoes/mensageria.js';

const BASE = '/api/v1';

function compilar(caminho) {
  const padrao = caminho.replace(/:([a-zA-Z_]+)/g, '(?<$1>[^/]+)');
  return new RegExp(`^${padrao}/?$`);
}

function ipDoPedido(req) {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'desconhecido'
  );
}

// Defesa contra CSRF: pedidos que alteram dados só valem se vierem do próprio site.
function validarOrigem(req, url) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
  const origem = req.headers.get('origin');
  if (origem && new URL(origem).host !== url.host) {
    throw new ErroHttp(403, 'origem_invalida', 'Pedido de origem não permitida.');
  }
}

function exigirConfiguracao(env) {
  if (!env.DB) throw new Error('Binding DB (D1) ausente.');
  if (typeof env.SEGREDO_APP !== 'string' || env.SEGREDO_APP.length < 32) {
    throw new Error('SEGREDO_APP ausente ou curto demais.');
  }
}

/**
 * rotas: [{ metodo, caminho, auth: 'nenhuma'|'opcional'|'obrigatoria', acao?, handler(ctx) }]
 * Se a rota tem `acao`, a permissão é checada aqui, antes do handler.
 */
export function criarManipulador(rotas, { autenticar }) {
  const tabela = rotas.map((r) => ({ ...r, regex: compilar(BASE + r.caminho) }));

  return async function manipular(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) {
      if (env.ASSETS) return env.ASSETS.fetch(req);
      return json({ erro: { codigo: 'nao_encontrado', mensagem: 'Página não encontrada.' } }, { status: 404 });
    }
    try {
      exigirConfiguracao(env);
      validarOrigem(req, url);

      let achada = null;
      let params = {};
      let caminhoExiste = false;
      for (const r of tabela) {
        const m = r.regex.exec(url.pathname);
        if (!m) continue;
        caminhoExiste = true;
        if (r.metodo === req.method) {
          achada = r;
          params = m.groups || {};
          break;
        }
      }
      if (!achada) {
        throw caminhoExiste
          ? new ErroHttp(405, 'metodo_invalido', 'Método não permitido.')
          : new ErroHttp(404, 'nao_encontrado', 'Rota não encontrada.');
      }

      const ctx = {
        req,
        env,
        db: env.DB,
        url,
        params,
        ip: ipDoPedido(req),
        agora: env.RELOGIO ? () => env.RELOGIO() : () => new Date(),
        mensageria: criarMensageria(env),
        cookies: [], // cookies a anexar na resposta
        corpo: () => lerJson(req),
        usuario: null,
      };
      ctx.usuario = await autenticar(ctx);

      if ((achada.auth === 'obrigatoria' || achada.acao) && !ctx.usuario) {
        if (!achada.acao || !pode(null, achada.acao)) {
          throw new ErroHttp(401, 'login_necessario', 'Entre na sua conta para continuar.');
        }
      }
      if (achada.acao && !pode(ctx.usuario, achada.acao)) {
        const m = motivoNegacao(ctx.usuario, achada.acao);
        throw new ErroHttp(403, m.codigo, m.mensagem);
      }

      const resposta = await achada.handler(ctx);
      for (const c of ctx.cookies) resposta.headers.append('set-cookie', c);
      return resposta;
    } catch (e) {
      if (e instanceof ErroHttp) return respostaErro(e);
      console.error('erro_interno', e?.stack || e);
      return json({ erro: { codigo: 'erro_interno', mensagem: 'Algo deu errado do nosso lado. Tente de novo em instantes.' } }, { status: 500 });
    }
  };
}
