import { ErroHttp, json } from '../../nucleo/http.js';
import { cifrar } from '../../nucleo/cripto.js';
import { hmacHex } from '../../nucleo/cripto.js';
import { normalizarCpf, normalizarCreci, normalizarUf, normalizarNome } from '../../nucleo/validacao.js';

async function configNumero(db, chave, padrao) {
  const l = await db.prepare('SELECT valor FROM configuracoes WHERE chave = ?').bind(chave).first();
  const n = Number(l?.valor);
  return Number.isFinite(n) ? n : padrao;
}

// Estados que a interface mostra: incompleto (nada enviado), pendente (em análise), verificado,
// reprovado ("pendente de ação": pode reenviar) e bloqueado (esgotou as tentativas).
export async function situacaoDoCorretor(db, usuarioId) {
  const max = await configNumero(db, 'max_tentativas_creci', 3);
  const l = await db.prepare('SELECT * FROM corretores WHERE usuario_id = ?').bind(usuarioId).first();
  if (!l) return { status: 'incompleto', tentativas_restantes: max };
  return {
    status: l.status_creci,
    creci: l.creci,
    uf: l.uf_creci,
    tentativas_restantes: Math.max(0, max - l.tentativas_creci),
    motivo: l.motivo_reprovacao,
    enviado_em: l.enviado_em,
    verificado_em: l.verificado_em,
    teste_gratis_fim: l.teste_gratis_fim,
  };
}

export async function enviarCreci(ctx) {
  const dados = await ctx.corpo();
  const cpf = normalizarCpf(dados.cpf);
  const creci = normalizarCreci(dados.creci);
  const uf = normalizarUf(dados.uf ?? 'RJ');
  if (!cpf) throw new ErroHttp(400, 'cpf_invalido', 'CPF inválido. Confira os 11 números.');
  if (!creci) throw new ErroHttp(400, 'creci_invalido', 'CRECI inválido. Use só o número (ex.: 12345 ou 12345F).');
  if (!uf) throw new ErroHttp(400, 'uf_invalida', 'Escolha o estado do seu CRECI.');

  const agora = ctx.agora().toISOString();
  const usuarioId = ctx.usuario.id;
  const max = await configNumero(ctx.db, 'max_tentativas_creci', 3);
  const atual = await ctx.db.prepare('SELECT status_creci, tentativas_creci FROM corretores WHERE usuario_id = ?').bind(usuarioId).first();

  if (atual) {
    if (atual.status_creci === 'bloqueado' || atual.tentativas_creci >= max) {
      throw new ErroHttp(403, 'tentativas_esgotadas', 'Você usou todas as tentativas. Fale com o suporte para continuar.');
    }
    if (atual.status_creci !== 'reprovado') {
      throw new ErroHttp(409, 'ja_enviado', atual.status_creci === 'verificado' ? 'Seu CRECI já está verificado.' : 'Seu CRECI já está em análise.');
    }
  }

  const cpfHash = await hmacHex(ctx.env.SEGREDO_APP, 'cpf', cpf);
  const outroCpf = await ctx.db.prepare('SELECT usuario_id FROM corretores WHERE cpf_hash = ? AND usuario_id != ?').bind(cpfHash, usuarioId).first();
  if (outroCpf) throw new ErroHttp(409, 'cpf_em_uso', 'Este CPF já está cadastrado em outra conta.');
  const outroCreci = await ctx.db
    .prepare("SELECT usuario_id FROM corretores WHERE uf_creci = ? AND creci = ? AND status_creci IN ('pendente','verificado') AND usuario_id != ?")
    .bind(uf, creci, usuarioId)
    .first();
  if (outroCreci) throw new ErroHttp(409, 'creci_em_uso', 'Este CRECI já está cadastrado em outra conta.');

  const cpfCifrado = await cifrar(ctx.env.SEGREDO_APP, 'cpf', cpf);
  const stmts = [];
  if (dados.nome !== undefined) {
    const nome = normalizarNome(dados.nome);
    if (!nome) throw new ErroHttp(400, 'nome_invalido', 'Informe seu nome (de 2 a 80 letras).');
    stmts.push(ctx.db.prepare('UPDATE usuarios SET nome = ?, atualizado_em = ? WHERE id = ?').bind(nome, agora, usuarioId));
  }
  if (!atual) {
    stmts.push(
      ctx.db
        .prepare(
          `INSERT INTO corretores (usuario_id, cpf_cifrado, cpf_hash, creci, uf_creci, status_creci, tentativas_creci, enviado_em, criado_em, atualizado_em)
           VALUES (?, ?, ?, ?, ?, 'pendente', 1, ?, ?, ?)`,
        )
        .bind(usuarioId, cpfCifrado, cpfHash, creci, uf, agora, agora, agora),
    );
  } else {
    stmts.push(
      ctx.db
        .prepare(
          `UPDATE corretores SET cpf_cifrado = ?, cpf_hash = ?, creci = ?, uf_creci = ?, status_creci = 'pendente',
                  tentativas_creci = tentativas_creci + 1, motivo_reprovacao = NULL, enviado_em = ?, atualizado_em = ?
            WHERE usuario_id = ?`,
        )
        .bind(cpfCifrado, cpfHash, creci, uf, agora, agora, usuarioId),
    );
  }
  try {
    await ctx.db.batch(stmts);
  } catch (e) {
    if (String(e?.message).includes('UNIQUE')) throw new ErroHttp(409, 'creci_em_uso', 'Este CRECI ou CPF já está cadastrado em outra conta.');
    throw e;
  }
  return json({ ok: true, corretor: await situacaoDoCorretor(ctx.db, usuarioId) }, { status: 201 });
}
