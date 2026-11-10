import { ErroHttp, json } from '../../nucleo/http.js';
import { decifrar } from '../../nucleo/cripto.js';
import { mascararCpf, mascararCelular } from '../../nucleo/validacao.js';
import { registrarAuditoria } from '../../nucleo/auditoria.js';

const STATUS_VALIDOS = ['pendente', 'verificado', 'reprovado', 'bloqueado'];
const DIA = 86400e3;

async function configNumero(db, chave, padrao) {
  const l = await db.prepare('SELECT valor FROM configuracoes WHERE chave = ?').bind(chave).first();
  const n = Number(l?.valor);
  return Number.isFinite(n) ? n : padrao;
}

// Fila de CRECI para o administrador conferir manualmente (SLA de 24h). O CPF só aparece mascarado.
export async function listarFilaCreci(ctx) {
  const status = ctx.url.searchParams.get('status') || 'pendente';
  if (!STATUS_VALIDOS.includes(status)) throw new ErroHttp(400, 'status_invalido', 'Filtro de status inválido.');
  const r = await ctx.db
    .prepare(
      `SELECT c.usuario_id, c.creci, c.uf_creci, c.status_creci, c.tentativas_creci, c.enviado_em, c.cpf_cifrado, u.nome, u.celular
         FROM corretores c JOIN usuarios u ON u.id = c.usuario_id
        WHERE c.status_creci = ? ORDER BY c.enviado_em ASC LIMIT 200`,
    )
    .bind(status)
    .all();
  const agora = ctx.agora();
  const itens = [];
  for (const l of r.results) {
    itens.push({
      usuario_id: l.usuario_id,
      nome: l.nome,
      celular: mascararCelular(l.celular),
      creci: l.creci,
      uf: l.uf_creci,
      cpf: mascararCpf(await decifrar(ctx.env.SEGREDO_APP, 'cpf', l.cpf_cifrado)),
      tentativa: l.tentativas_creci,
      enviado_em: l.enviado_em,
      horas_aguardando: Math.floor((agora - new Date(l.enviado_em)) / 3600e3),
    });
  }
  return json({ status, itens });
}

export async function decidirCreci(ctx) {
  const dados = await ctx.corpo();
  const alvoId = ctx.params.usuarioId;
  if (alvoId === ctx.usuario.id) {
    throw new ErroHttp(403, 'auto_aprovacao', 'Você não pode decidir o seu próprio CRECI. Peça a outro administrador.');
  }
  if (!['aprovar', 'reprovar'].includes(dados.decisao)) {
    throw new ErroHttp(400, 'decisao_invalida', 'Escolha aprovar ou reprovar.');
  }
  const motivo = typeof dados.motivo === 'string' ? dados.motivo.trim().slice(0, 300) : '';
  if (dados.decisao === 'reprovar' && motivo.length < 3) {
    throw new ErroHttp(400, 'motivo_necessario', 'Explique o motivo da reprovação para o corretor poder corrigir.');
  }

  const c = await ctx.db
    .prepare('SELECT c.*, u.celular FROM corretores c JOIN usuarios u ON u.id = c.usuario_id WHERE c.usuario_id = ?')
    .bind(alvoId)
    .first();
  if (!c) throw new ErroHttp(404, 'nao_encontrado', 'Corretor não encontrado.');
  if (c.status_creci !== 'pendente') {
    throw new ErroHttp(409, 'ja_decidido', 'Este CRECI já foi decidido por outro administrador.');
  }

  const agora = ctx.agora();
  const agoraIso = agora.toISOString();
  let resultado;
  if (dados.decisao === 'aprovar') {
    const dias = await configNumero(ctx.db, 'dias_teste_gratis', 30);
    const fim = new Date(agora.getTime() + dias * DIA).toISOString();
    // "AND status = pendente" garante que duas aprovações simultâneas não se atropelam
    const up = ctx.db
      .prepare(
        `UPDATE corretores SET status_creci = 'verificado', verificado_em = ?, teste_gratis_inicio = ?, teste_gratis_fim = ?,
                ultima_revalidacao = ?, motivo_reprovacao = NULL, atualizado_em = ?
          WHERE usuario_id = ? AND status_creci = 'pendente'`,
      )
      .bind(agoraIso, agoraIso, fim, agoraIso, agoraIso, alvoId);
    const [r] = await ctx.db.batch([up, registrarAuditoria(ctx.db, { quem: ctx.usuario.id, acao: 'creci_aprovado', alvo: alvoId, detalhes: { creci: c.creci, uf: c.uf_creci, teste_ate: fim }, quando: agoraIso })]);
    if (r.meta.changes !== 1) throw new ErroHttp(409, 'ja_decidido', 'Este CRECI já foi decidido por outro administrador.');
    resultado = { status: 'verificado', teste_gratis_fim: fim };
  } else {
    const max = await configNumero(ctx.db, 'max_tentativas_creci', 3);
    const novo = c.tentativas_creci >= max ? 'bloqueado' : 'reprovado';
    const up = ctx.db
      .prepare(`UPDATE corretores SET status_creci = ?, motivo_reprovacao = ?, atualizado_em = ? WHERE usuario_id = ? AND status_creci = 'pendente'`)
      .bind(novo, motivo, agoraIso, alvoId);
    const [r] = await ctx.db.batch([up, registrarAuditoria(ctx.db, { quem: ctx.usuario.id, acao: 'creci_reprovado', alvo: alvoId, detalhes: { motivo, resultado: novo }, quando: agoraIso })]);
    if (r.meta.changes !== 1) throw new ErroHttp(409, 'ja_decidido', 'Este CRECI já foi decidido por outro administrador.');
    resultado = { status: novo, motivo };
  }

  // aviso ao corretor; se o envio falhar, a decisão já está gravada (o app também mostra o status)
  try {
    await ctx.mensageria.enviar({
      canal: 'sms',
      para: c.celular,
      texto:
        dados.decisao === 'aprovar'
          ? 'Seu CRECI foi verificado! Você já pode publicar imóveis e pedir parcerias. Abra o app.'
          : `Precisamos de um ajuste no seu CRECI: ${motivo}. Abra o app para corrigir.`,
    });
  } catch (e) {
    console.error('aviso_creci_falhou', e?.message);
  }
  return json({ ok: true, ...resultado });
}
