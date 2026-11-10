// Matriz de permissões (usuarios.md) como código. Uma linha por ação; um teste por linha em testes/permissoes.test.js.
// Papéis: visitante (sem login), cliente, corretor, gestor, admin. Um usuário pode ter vários papéis.

export const ACOES = {
  ver_feed:                 { papeis: ['visitante', 'cliente', 'corretor', 'gestor', 'admin'] },
  ver_perfil_publico:       { papeis: ['visitante', 'cliente', 'corretor', 'gestor', 'admin'] },
  favoritar_ou_salvar:      { papeis: ['cliente', 'corretor', 'gestor'] },
  abrir_chat:               { papeis: ['cliente', 'corretor', 'gestor'] },
  pedir_parceria:           { papeis: ['corretor', 'gestor'], exigeCreci: ['corretor'] },
  publicar_imovel:          { papeis: ['corretor', 'gestor'], exigeCreci: ['corretor'] },
  apagar_imovel:            { papeis: ['corretor', 'gestor', 'admin'], exigeCreci: ['corretor'] },
  agendar_visita:           { papeis: ['cliente', 'corretor', 'gestor'], exigeCreci: ['corretor'] },
  registrar_acordo:         { papeis: ['corretor', 'gestor'], exigeCreci: ['corretor'] },
  registrar_negocio:        { papeis: ['corretor', 'gestor'], exigeCreci: ['corretor'] },
  avaliar_pos_visita:       { papeis: ['cliente', 'corretor'], exigeCreci: ['corretor'] },
  avaliar_compra:           { papeis: ['cliente'] },
  ser_avaliado:             { papeis: ['cliente', 'corretor'] },
  responder_avaliacao:      { papeis: ['corretor', 'gestor'], exigeCreci: ['corretor'] },
  denunciar:                { papeis: ['cliente', 'corretor', 'gestor'] },
  convidar_corretor:        { papeis: ['gestor', 'admin'] },
  ver_painel_equipe:        { papeis: ['gestor', 'admin'] },
  pagar_assinatura:         { papeis: ['corretor', 'gestor'] },
  moderar:                  { papeis: ['admin'] },
  ver_nota_de_cliente:      { papeis: ['corretor', 'gestor', 'admin'] },
};

// Conta suspensa só enxerga o que é público.
const PUBLICAS_SUSPENSO = new Set(['ver_feed', 'ver_perfil_publico']);

function papeisEfetivos(usuario) {
  return usuario?.papeis?.length ? usuario.papeis : usuario ? [] : ['visitante'];
}

export function pode(usuario, acao) {
  const regra = ACOES[acao];
  if (!regra) return false; // ação desconhecida nunca é permitida
  if (usuario?.status === 'suspenso') return PUBLICAS_SUSPENSO.has(acao);
  const verificado = usuario?.corretor_status === 'verificado';
  const papeis = papeisEfetivos(usuario);
  // quem está logado sem papel ainda (primeiro acesso) vê o público como visitante
  const efetivos = usuario && !papeis.length ? ['visitante'] : papeis;
  return efetivos.some((p) => {
    if (!regra.papeis.includes(p)) return false;
    if (regra.exigeCreci?.includes(p) && !verificado) return false;
    return true;
  });
}

// Mensagem clara para o 403: diferencia "não tem permissão" de "falta verificar o CRECI".
export function motivoNegacao(usuario, acao) {
  const regra = ACOES[acao];
  if (usuario?.status === 'suspenso') {
    return { codigo: 'conta_suspensa', mensagem: 'Sua conta está suspensa. Fale com o suporte para pedir revisão.' };
  }
  if (regra && usuario?.papeis?.includes('corretor') && regra.exigeCreci?.includes('corretor') && usuario.corretor_status !== 'verificado') {
    return { codigo: 'creci_nao_verificado', mensagem: 'Seu CRECI ainda não foi verificado. Acompanhe o status no seu perfil.' };
  }
  return { codigo: 'sem_permissao', mensagem: 'Você não tem permissão para fazer isso.' };
}

export function mapaDePermissoes(usuario) {
  return Object.fromEntries(Object.keys(ACOES).map((a) => [a, pode(usuario, a)]));
}
