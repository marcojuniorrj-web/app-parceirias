import { ErroHttp, json, lerCookies, montarCookie } from '../../nucleo/http.js';
import { hmacHex, tokenAleatorio, codigoNumerico, igualConstante } from '../../nucleo/cripto.js';
import { novoId } from '../../nucleo/id.js';
import { normalizarCelular, normalizarNome, mascararCelular } from '../../nucleo/validacao.js';
import { mapaDePermissoes } from '../../nucleo/permissoes.js';
import { situacaoDoCorretor } from '../corretores/servico.js';
import * as repo from './repositorio.js';

export const REGRAS = {
  codigoValidadeMin: 10,
  reenvioSeg: 60,
  maxPorHora: 5,
  maxPorIpHora: 20,
  maxTentativas: 5,
  sessaoDias: 30,
  renovarQuandoFaltar: 15, // dias
};
const COOKIE = 'sessao';
const DIA = 86400e3;

const iso = (ms) => new Date(ms).toISOString();

function cookieDeSessao(ctx, token) {
  return montarCookie(COOKIE, token, { maxAgeSeg: REGRAS.sessaoDias * 86400, seguro: ctx.env.AMBIENTE !== 'dev' });
}

// ---------- login por código ----------

export async function pedirCodigo(ctx) {
  const dados = await ctx.corpo();
  const celular = normalizarCelular(dados.celular);
  if (!celular) throw new ErroHttp(400, 'celular_invalido', 'Confira o número: DDD + celular com 9 dígitos.');

  const agora = ctx.agora();
  const ultimo = await repo.codigos.ultimo(ctx.db, celular);
  if (ultimo) {
    const passou = (agora - new Date(ultimo.criado_em)) / 1000;
    if (passou < REGRAS.reenvioSeg) {
      const espere = Math.ceil(REGRAS.reenvioSeg - passou);
      throw new ErroHttp(429, 'aguarde', `Aguarde ${espere}s para pedir outro código.`, { espere_s: espere });
    }
  }
  const desde = iso(agora.getTime() - 3600e3);
  const ipHash = await hmacHex(ctx.env.SEGREDO_APP, 'ip', ctx.ip);
  if ((await repo.codigos.contarPorCelular(ctx.db, celular, desde)) >= REGRAS.maxPorHora) {
    throw new ErroHttp(429, 'limite_horario', 'Muitos códigos pedidos para este número. Tente de novo em até 1 hora.');
  }
  if ((await repo.codigos.contarPorIp(ctx.db, ipHash, desde)) >= REGRAS.maxPorIpHora) {
    throw new ErroHttp(429, 'limite_horario', 'Muitos pedidos deste aparelho. Tente de novo mais tarde.');
  }

  const codigo = codigoNumerico(6);
  const id = novoId(agora.getTime());
  await repo.codigos
    .inserir(ctx.db, {
      id,
      celular,
      codigoHash: await hmacHex(ctx.env.SEGREDO_APP, 'otp', `${celular}:${codigo}`),
      ipHash,
      agora: agora.toISOString(),
      expiraEm: iso(agora.getTime() + REGRAS.codigoValidadeMin * 60e3),
    })
    .run();

  try {
    await ctx.mensageria.enviar({
      canal: 'sms',
      para: celular,
      texto: `Seu código de acesso: ${codigo}. Vale por ${REGRAS.codigoValidadeMin} minutos. Não compartilhe.`,
    });
  } catch (e) {
    await repo.codigos.apagar(ctx.db, id).run();
    console.error('envio_codigo_falhou', e?.message);
    throw new ErroHttp(502, 'envio_falhou', 'Não conseguimos enviar o código agora. Tente de novo em instantes.');
  }

  const resposta = { ok: true, reenviar_em_s: REGRAS.reenvioSeg, expira_em_min: REGRAS.codigoValidadeMin };
  // só existe com a mensageria falsa e fora de produção, para testar sem celular de verdade
  if (ctx.env.MENSAGERIA === 'falsa' && ctx.env.AMBIENTE !== 'producao') resposta.codigo_dev = codigo;
  return json(resposta);
}

export async function entrar(ctx) {
  const dados = await ctx.corpo();
  const celular = normalizarCelular(dados.celular);
  const codigo = typeof dados.codigo === 'string' ? dados.codigo.trim() : '';
  if (!celular || !/^\d{6}$/.test(codigo)) {
    throw new ErroHttp(400, 'dados_invalidos', 'Informe o celular e o código de 6 dígitos.');
  }
  const agora = ctx.agora();
  const vigente = await repo.codigos.vigente(ctx.db, celular);
  if (!vigente) throw new ErroHttp(400, 'codigo_invalido', 'Código inválido. Peça um novo código.');
  if (new Date(vigente.expira_em) <= agora) {
    throw new ErroHttp(400, 'codigo_expirado', 'Este código venceu. Peça um novo código.');
  }
  if (vigente.tentativas >= REGRAS.maxTentativas) {
    throw new ErroHttp(429, 'muitas_tentativas', 'Muitas tentativas erradas. Peça um novo código.');
  }
  const esperado = await hmacHex(ctx.env.SEGREDO_APP, 'otp', `${celular}:${codigo}`);
  if (!igualConstante(esperado, vigente.codigo_hash)) {
    await repo.codigos.somarTentativa(ctx.db, vigente.id).run();
    const restantes = REGRAS.maxTentativas - vigente.tentativas - 1;
    throw new ErroHttp(400, 'codigo_invalido', restantes > 0 ? `Código incorreto. Você ainda tem ${restantes} tentativa${restantes > 1 ? 's' : ''}.` : 'Código incorreto. Peça um novo código.', { tentativas_restantes: restantes });
  }
  // consome o código; se outra requisição já consumiu, esta perde (sem reuso)
  const consumo = await repo.codigos.marcarUsado(ctx.db, vigente.id, agora.toISOString()).run();
  if (consumo.meta.changes !== 1) throw new ErroHttp(400, 'codigo_invalido', 'Código inválido. Peça um novo código.');

  const agoraIso = agora.toISOString();
  let usuario = await repo.usuarios.porCelular(ctx.db, celular);
  if (!usuario) {
    const id = novoId(agora.getTime());
    await repo.usuarios.inserir(ctx.db, { id, celular, agora: agoraIso }).run();
    usuario = { id, celular, nome: null, status: 'ativo' };
  }
  if (usuario.status !== 'ativo' && usuario.status !== 'suspenso') {
    throw new ErroHttp(403, 'conta_indisponivel', 'Esta conta não está disponível.');
  }
  // primeiros administradores: celulares listados na configuração do ambiente
  const admins = (ctx.env.ADMIN_CELULARES || '').split(',').map((c) => normalizarCelular(c.trim())).filter(Boolean);
  if (admins.includes(celular)) await repo.papeis.adicionar(ctx.db, usuario.id, 'admin', agoraIso).run();

  const token = tokenAleatorio(32);
  await repo.sessoes
    .inserir(ctx.db, {
      id: await hmacHex(ctx.env.SEGREDO_APP, 'sessao', token),
      usuarioId: usuario.id,
      agora: agoraIso,
      expiraEm: iso(agora.getTime() + REGRAS.sessaoDias * DIA),
      agente: (ctx.req.headers.get('user-agent') || '').slice(0, 200),
    })
    .run();

  ctx.cookies.push(cookieDeSessao(ctx, token));
  return json({ ok: true, ...(await montarMe(ctx, usuario.id)) });
}

export async function sair(ctx) {
  const token = lerCookies(ctx.req)[COOKIE];
  if (token) await repo.sessoes.apagar(ctx.db, await hmacHex(ctx.env.SEGREDO_APP, 'sessao', token)).run();
  ctx.cookies.push(montarCookie(COOKIE, '', { maxAgeSeg: 0, seguro: ctx.env.AMBIENTE !== 'dev' }));
  return json({ ok: true });
}

export async function sairDeTodos(ctx) {
  await repo.sessoes.apagarTodasDoUsuario(ctx.db, ctx.usuario.id).run();
  ctx.cookies.push(montarCookie(COOKIE, '', { maxAgeSeg: 0, seguro: ctx.env.AMBIENTE !== 'dev' }));
  return json({ ok: true });
}

// Chamado pelo roteador em toda requisição: devolve o usuário logado (ou null).
export async function autenticar(ctx) {
  const token = lerCookies(ctx.req)[COOKIE];
  if (!token) return null;
  const agora = ctx.agora();
  const sessaoId = await hmacHex(ctx.env.SEGREDO_APP, 'sessao', token);
  const s = await repo.sessoes.ativa(ctx.db, sessaoId, agora.toISOString());
  if (!s || s.status === 'removido') return null;

  // sessão que está perto de vencer é renovada (quem usa o app não precisa entrar de novo)
  if (new Date(s.expira_em) - agora < REGRAS.renovarQuandoFaltar * DIA) {
    await repo.sessoes.renovar(ctx.db, sessaoId, iso(agora.getTime() + REGRAS.sessaoDias * DIA)).run();
    ctx.cookies.push(cookieDeSessao(ctx, token));
  }
  const papeis = await repo.papeis.doUsuario(ctx.db, s.id);
  const corretor = papeis.includes('corretor') ? await situacaoDoCorretor(ctx.db, s.id) : null;
  return { id: s.id, nome: s.nome, celular: s.celular, status: s.status, papeis, corretor_status: corretor?.status ?? null };
}

// ---------- perfil do próprio usuário ----------

export async function montarMe(ctx, usuarioId) {
  const usuario = ctx.usuario?.id === usuarioId ? ctx.usuario : await carregarUsuario(ctx, usuarioId);
  const corretor = usuario.papeis.includes('corretor') ? await situacaoDoCorretor(ctx.db, usuarioId) : null;
  return {
    usuario: { id: usuario.id, nome: usuario.nome, celular: mascararCelular(usuario.celular), status: usuario.status },
    papeis: usuario.papeis,
    precisa_escolher_perfil: !usuario.papeis.some((p) => p !== 'admin'),
    corretor,
    pode: mapaDePermissoes({ ...usuario, corretor_status: corretor?.status ?? null }),
  };
}

async function carregarUsuario(ctx, id) {
  const l = await ctx.db.prepare('SELECT id, nome, celular, status FROM usuarios WHERE id = ?').bind(id).first();
  return { ...l, papeis: await repo.papeis.doUsuario(ctx.db, id) };
}

export async function me(ctx) {
  if (!ctx.usuario) {
    return json({ usuario: null, papeis: [], precisa_escolher_perfil: false, corretor: null, pode: mapaDePermissoes(null) });
  }
  return json(await montarMe(ctx, ctx.usuario.id));
}

export async function atualizarMe(ctx) {
  const dados = await ctx.corpo();
  const nome = normalizarNome(dados.nome);
  if (!nome) throw new ErroHttp(400, 'nome_invalido', 'Informe seu nome (de 2 a 80 letras).');
  await repo.usuarios.atualizarNome(ctx.db, ctx.usuario.id, nome, ctx.agora().toISOString()).run();
  ctx.usuario.nome = nome;
  return json(await montarMe(ctx, ctx.usuario.id));
}

const PERFIS_EM_BREVE = {
  imobiliaria: 'O cadastro de imobiliárias chega em breve. Por enquanto, cadastre-se como corretor ou cliente.',
  convite: 'Os convites de imobiliária chegam em breve. Por enquanto, cadastre-se como corretor ou cliente.',
};

export async function escolherPerfil(ctx) {
  const dados = await ctx.corpo();
  const agora = ctx.agora().toISOString();
  if (dados.nome !== undefined) {
    const nome = normalizarNome(dados.nome);
    if (!nome) throw new ErroHttp(400, 'nome_invalido', 'Informe seu nome (de 2 a 80 letras).');
    await repo.usuarios.atualizarNome(ctx.db, ctx.usuario.id, nome, agora).run();
  }
  if (PERFIS_EM_BREVE[dados.tipo]) throw new ErroHttp(501, 'em_breve', PERFIS_EM_BREVE[dados.tipo]);
  if (dados.tipo === 'cliente') {
    await ctx.db.batch([repo.papeis.adicionar(ctx.db, ctx.usuario.id, 'cliente', agora), repo.clientes.garantir(ctx.db, ctx.usuario.id, agora)]);
  } else if (dados.tipo === 'corretor') {
    await repo.papeis.adicionar(ctx.db, ctx.usuario.id, 'corretor', agora).run();
  } else {
    throw new ErroHttp(400, 'perfil_invalido', 'Escolha uma das opções.');
  }
  ctx.usuario = await carregarUsuarioCompleto(ctx);
  return json(await montarMe(ctx, ctx.usuario.id));
}

async function carregarUsuarioCompleto(ctx) {
  const u = await carregarUsuario(ctx, ctx.usuario.id);
  const corretor = u.papeis.includes('corretor') ? await situacaoDoCorretor(ctx.db, u.id) : null;
  return { ...u, corretor_status: corretor?.status ?? null };
}
