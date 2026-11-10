// Telas da Fase 1: T1 Feed, T6 Entrar, primeiro acesso, cadastro de corretor, T5 Perfil, T16 Admin (fila de CRECI),
// bloqueio de Publicar, telas "em construção" e a amostra do design system.
// Cada tela recebe o contexto C ({ S, api, irPara, ... }) e devolve { titulo, corpo, depois?, largo? }.
import { html, esc, brl, notaFmt, dataBr, maskCelular, maskCpf, iniciais } from './util.js';
import { icone } from './icones.js';
import { estadoVazio, estadoErro, estadoSucesso, estadoBloqueio, esqueletoFeed } from './componentes.js';

const SEGUNDOS_REENVIO = 60;

// ---------- T1 · Feed ----------
function cartaoImovel(i, salvo) {
  const c = i.corretor;
  const preco = i.finalidade === 'locacao' ? html`${brl(i.preco)} <small>/mês</small>` : brl(i.preco);
  return html`
    <article class="imovel" aria-label="${i.bairro}">
      <div class="foto foto--${i.cor}" role="img" aria-label="Foto ilustrativa de exemplo"><span class="foto__etiqueta">Exemplo</span></div>
      <div class="imovel__corpo">
        <div class="imovel__topo">
          <p class="preco">${preco}</p>
          <button class="coracao" type="button" data-acao="favoritar" data-id="${i.id}" aria-pressed="${salvo ? 'true' : 'false'}" aria-label="${salvo ? 'Remover dos salvos' : 'Salvar imóvel'}">${icone('coracao')}</button>
        </div>
        <p>${i.bairro}</p>
        <p class="specs"><span>${i.quartos} ${i.quartos === 1 ? 'quarto' : 'quartos'}</span><span>${i.area_m2} m²</span><span>${i.finalidade === 'venda' ? 'Venda' : 'Aluguel'}</span></p>
        <div class="corretor">
          <span class="avatar" aria-hidden="true">${iniciais(c.nome)}</span>
          <span class="corretor__nome">${c.nome}</span>
          ${c.nota == null
            ? html`<span class="nota nota--nova">Novo na rede</span>`
            : html`<span class="nota" aria-label="Nota ${notaFmt(c.nota)} de 5, ${c.avaliacoes} avaliações">${icone('estrela')}<b>${notaFmt(c.nota)}</b><span>(${c.avaliacoes})</span></span>`}
          ${c.verificado ? html`<span class="selo">${icone('verificado')}Verificado</span>` : ''}
        </div>
      </div>
    </article>`;
}

export const feed = async (C) => {
  let dados;
  try {
    dados = await C.api.get('/feed');
  } catch (e) {
    return { titulo: 'Imóveis', corpo: estadoErro({ texto: e.message }) };
  }
  if (!dados.itens.length) {
    return { titulo: 'Imóveis', corpo: estadoVazio({ icone: 'obra', titulo: 'Ainda não há imóveis por aqui', texto: 'Quando os corretores publicarem, eles aparecem neste feed.' }) };
  }
  return {
    titulo: 'Imóveis no Rio',
    corpo: html`
      <div class="aviso-exemplo" role="note">${icone('info')}<p>Estes imóveis são <strong>exemplos</strong> para você conhecer o app. Os anúncios de verdade chegam na próxima fase.</p></div>
      ${dados.itens.map((i) => cartaoImovel(i, C.S.favoritos.has(i.id)))}`,
  };
};
feed.carregando = () => esqueletoFeed(2);

// ---------- T6 · Entrar (celular → código) ----------
const login = { passo: 'celular', celular: '', reenviarEm: 0, codigoDev: null, erro: '' };
export const reiniciarLogin = () => Object.assign(login, { passo: 'celular', celular: '', reenviarEm: 0, codigoDev: null, erro: '' });

export const entrar = async (C) => {
  if (C.S.me?.usuario) { C.irPara(C.S.me.precisa_escolher_perfil ? '/primeiro-acesso' : C.volta ?? '/feed', { substituir: true }); return { titulo: '', corpo: html`` }; }
  const restante = Math.max(0, Math.ceil((login.reenviarEm - Date.now()) / 1000));
  const erro = html`<p class="erro-campo" id="erro" role="alert">${login.erro}</p>`;
  if (login.passo === 'celular') {
    return {
      titulo: 'Entrar',
      corpo: html`
        <section class="pagina">
          <div><h2>Entre com seu celular</h2><p class="texto-2">Enviamos um código de 6 dígitos. Sem senha para lembrar.</p></div>
          <form class="form" data-form="pedir-codigo" novalidate>
            <div class="campo">
              <label for="celular">Seu celular com DDD</label>
              <input class="entrada" id="celular" name="celular" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(21) 99999-0000" value="${login.celular}" aria-describedby="erro" ${login.erro ? html`aria-invalid="true"` : ''} required>
              ${erro}
            </div>
            <button class="botao botao--cheio" type="submit">Receber código</button>
          </form>
        </section>`,
      depois: () => document.getElementById('celular')?.focus(),
    };
  }
  return {
    titulo: 'Confirmar código',
    corpo: html`
      <section class="pagina">
        <div><h2>Digite o código</h2><p class="texto-2">Enviamos para <strong>${maskCelular(login.celular)}</strong>. Ele vale por 10 minutos.</p></div>
        ${login.codigoDev ? html`<div class="painel-dev" role="note">Modo de teste (sem SMS real): seu código é <code id="codigo-dev">${login.codigoDev}</code></div>` : ''}
        <form class="form" data-form="entrar" novalidate>
          <div class="campo">
            <label for="codigo">Código de 6 dígitos</label>
            <input class="entrada entrada--codigo" id="codigo" name="codigo" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" aria-describedby="erro" ${login.erro ? html`aria-invalid="true"` : ''} required>
            ${erro}
          </div>
          <button class="botao botao--cheio" type="submit">Entrar</button>
        </form>
        <div class="acoes">
          <button class="botao botao--texto" type="button" data-acao="reenviar" id="reenviar" ${restante > 0 ? 'disabled' : ''}>${restante > 0 ? `Pedir outro código em ${restante}s` : 'Pedir outro código'}</button>
          <button class="botao botao--texto" type="button" data-acao="trocar-celular">Usar outro celular</button>
        </div>
      </section>`,
    depois: () => {
      document.getElementById('codigo')?.focus();
      C.cronometro(() => {
        const b = document.getElementById('reenviar');
        if (!b) return false;
        const s = Math.max(0, Math.ceil((login.reenviarEm - Date.now()) / 1000));
        b.disabled = s > 0;
        b.textContent = s > 0 ? `Pedir outro código em ${s}s` : 'Pedir outro código';
        return s > 0;
      });
    },
  };
};
export const estadoLogin = login;
export { SEGUNDOS_REENVIO };

// ---------- Primeiro acesso: quem é você? ----------
export const primeiroAcesso = async (C) => {
  if (!C.S.me?.usuario) { C.irPara('/entrar', { substituir: true }); return { titulo: '', corpo: html`` }; }
  const opcao = (tipo, ic, titulo, texto, emBreve) => html`
    <button class="opcao" type="button" data-acao="escolher-perfil" data-tipo="${tipo}" ${emBreve ? 'disabled' : ''}>
      ${icone(ic)}<div><strong>${titulo}${emBreve ? ' (em breve)' : ''}</strong><span>${texto}</span></div>
    </button>`;
  return {
    titulo: 'Bem-vindo',
    corpo: html`
      <section class="pagina">
        <div><h2>Como você vai usar o app?</h2><p class="texto-2">Você pode mudar ou acrescentar um perfil depois.</p></div>
        <div class="campo">
          <label for="nome">Seu nome</label>
          <input class="entrada" id="nome" type="text" autocomplete="name" maxlength="80" value="${C.S.me.usuario.nome ?? ''}" aria-describedby="erro" required>
          <p class="erro-campo" id="erro" role="alert">${C.S.erroNome ?? ''}</p>
        </div>
        <div class="acoes">
          ${opcao('cliente', 'buscar', 'Estou procurando um imóvel', 'Navegue, salve e fale com corretores avaliados.')}
          ${opcao('corretor', 'obra', 'Sou corretor', 'Publique imóveis, faça parcerias e construa sua reputação.')}
          ${opcao('imobiliaria', 'equipe', 'Tenho uma imobiliária', 'Cadastre sua equipe de corretores.', true)}
          ${opcao('convite', 'verificado', 'Recebi um convite', 'Entre na equipe da sua imobiliária.', true)}
        </div>
      </section>`,
  };
};

// ---------- Cadastro do corretor (CRECI) ----------
export const cadastroCorretor = async (C) => {
  const m = C.S.me;
  if (!m?.usuario) { C.irPara('/entrar', { substituir: true }); return { titulo: '', corpo: html`` }; }
  if (!m.papeis.includes('corretor')) { C.irPara('/primeiro-acesso', { substituir: true }); return { titulo: '', corpo: html`` }; }
  const st = m.corretor?.status;
  if (st === 'pendente' || st === 'verificado') { C.irPara('/perfil', { substituir: true }); return { titulo: '', corpo: html`` }; }
  if (st === 'bloqueado') return { titulo: 'Cadastro de corretor', corpo: html`<section class="pagina">${blocoCreci(m.corretor)}</section>` };
  const UFS = ['RJ', 'SP', 'MG', 'ES', 'BA', 'DF', 'GO', 'PR', 'RS', 'SC', 'PE', 'CE'];
  return {
    titulo: 'Cadastro de corretor',
    corpo: html`
      <section class="pagina">
        <div><h2>Confirme seu CRECI</h2><p class="texto-2">Conferimos em até 24 horas. Enquanto isso você já pode navegar e salvar imóveis.</p></div>
        ${st === 'reprovado' ? html`<div class="bloco bloco--aviso" role="note"><h3>${icone('alerta')}Precisamos de um ajuste</h3><p>${m.corretor.motivo}</p><p class="pequeno">Você tem ${m.corretor.tentativas_restantes} ${m.corretor.tentativas_restantes === 1 ? 'tentativa' : 'tentativas'} restantes.</p></div>` : ''}
        <form class="form" data-form="enviar-creci" novalidate>
          <div class="campo">
            <label for="cpf">CPF</label>
            <input class="entrada" id="cpf" name="cpf" inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" maxlength="14" aria-describedby="erro" required>
            <span class="dica">Usado só para evitar contas duplicadas. Guardamos cifrado.</span>
          </div>
          <div class="linha-2">
            <div class="campo"><label for="creci">Número do CRECI</label><input class="entrada" id="creci" name="creci" inputmode="text" autocomplete="off" placeholder="12345F" maxlength="10" required></div>
            <div class="campo"><label for="uf">Estado</label><select class="entrada" id="uf" name="uf">${UFS.map((u) => html`<option value="${u}" ${u === (m.corretor?.uf ?? 'RJ') ? 'selected' : ''}>${u}</option>`)}</select></div>
          </div>
          <p class="erro-campo" id="erro" role="alert">${C.S.erroForm ?? ''}</p>
          <button class="botao botao--cheio" type="submit">Enviar para conferência</button>
        </form>
      </section>`,
    depois: () => document.getElementById('cpf')?.addEventListener('input', (e) => { e.target.value = maskCpf(e.target.value); }),
  };
};

// ---------- T5 · Perfil ----------
function blocoCreci(c) {
  switch (c.status) {
    case 'incompleto':
      return html`<div class="bloco bloco--aviso"><h3>${icone('alerta')}Falta enviar seu CRECI</h3><p>Sem a verificação você não publica imóveis nem pede parceria.</p><button class="botao" type="button" data-acao="ir" data-rota="/cadastro-corretor">Enviar CRECI</button></div>`;
    case 'pendente':
      return html`<div class="bloco"><h3>${icone('relogio')}CRECI em análise <span class="selo selo--aviso">Em análise</span></h3><p>Conferimos em até 24 horas e avisamos por SMS. Você já pode navegar e salvar imóveis.</p></div>`;
    case 'verificado':
      return html`<div class="bloco bloco--ok"><h3>${icone('verificado')}CRECI ${c.creci}/${c.uf} <span class="selo">Verificado</span></h3>${c.teste_gratis_fim ? html`<p>Seu <strong>teste grátis</strong> vai até <strong>${dataBr(c.teste_gratis_fim)}</strong>.</p>` : ''}</div>`;
    case 'reprovado':
      return html`<div class="bloco bloco--aviso"><h3>${icone('alerta')}Pendente de ação <span class="selo selo--aviso">Ajuste necessário</span></h3><p>${c.motivo}</p><p class="pequeno">${c.tentativas_restantes} ${c.tentativas_restantes === 1 ? 'tentativa restante' : 'tentativas restantes'}.</p><button class="botao" type="button" data-acao="ir" data-rota="/cadastro-corretor">Corrigir e reenviar</button></div>`;
    case 'bloqueado':
      return html`<div class="bloco bloco--erro"><h3>${icone('cadeado')}Verificação bloqueada</h3><p>Você usou todas as tentativas de envio do CRECI. Fale com o suporte para continuar.</p>${c.motivo ? html`<p class="pequeno">Último motivo: ${c.motivo}</p>` : ''}</div>`;
    default:
      return html``;
  }
}

export const perfil = async (C) => {
  const m = C.S.me;
  if (!m?.usuario) { C.irPara('/entrar', { substituir: true }); return { titulo: '', corpo: html`` }; }
  const nomePapel = { cliente: 'Cliente', corretor: 'Corretor', gestor: 'Gestor', admin: 'Administrador' };
  return {
    titulo: 'Perfil',
    corpo: html`
      <section class="pagina">
        <div class="cabeca-perfil">
          <span class="avatar avatar--g" aria-hidden="true">${iniciais(m.usuario.nome)}</span>
          <div><h2>${m.usuario.nome ?? 'Sem nome'}</h2><p class="texto-2">${m.usuario.celular}</p>
            <div class="lista-papeis">${m.papeis.map((p) => html`<span class="selo selo--neutro">${nomePapel[p] ?? p}</span>`)}</div></div>
        </div>
        ${m.corretor ? blocoCreci(m.corretor) : ''}
        <div class="acoes">
          ${!m.papeis.includes('corretor') ? html`<button class="botao botao--secundario" type="button" data-acao="virar-corretor">Também sou corretor</button>` : ''}
          ${m.papeis.includes('admin') ? html`<button class="botao botao--secundario" type="button" data-acao="ir" data-rota="/admin">${icone('admin')}Painel do administrador</button>` : ''}
          <button class="botao botao--texto" type="button" data-acao="sair">Sair</button>
          <button class="botao botao--texto" type="button" data-acao="sair-todos">Sair de todos os aparelhos</button>
        </div>
      </section>`,
  };
};

// ---------- Publicar (bloqueio até a Fase 2) ----------
export const publicar = async (C) => {
  const m = C.S.me;
  if (!m?.usuario) return { titulo: 'Publicar', corpo: estadoBloqueio({ titulo: 'Entre para publicar', texto: 'Publicar imóveis é para corretores verificados.', rota: '/entrar', botao: 'Entrar' }) };
  const st = m.corretor?.status;
  if (!m.pode.publicar_imovel) {
    const textos = {
      incompleto: ['Envie seu CRECI', 'Para publicar imóveis precisamos conferir seu CRECI.', '/cadastro-corretor', 'Enviar CRECI'],
      pendente: ['Seu CRECI está em análise', 'Conferimos em até 24 horas e avisamos por SMS. Assim que for verificado, você publica.', '/perfil', 'Ver status'],
      reprovado: ['Seu CRECI precisa de um ajuste', m.corretor?.motivo ?? '', '/cadastro-corretor', 'Corrigir e reenviar'],
      bloqueado: ['Verificação bloqueada', 'Fale com o suporte para continuar.', '/perfil', 'Ver detalhes'],
    };
    const t = textos[st] ?? ['Publicar é para corretores', 'Escolha o perfil de corretor para publicar imóveis.', '/perfil', 'Ir para o perfil'];
    return { titulo: 'Publicar', corpo: estadoBloqueio({ titulo: t[0], texto: t[1], rota: t[2], botao: t[3] }) };
  }
  return { titulo: 'Publicar', corpo: estadoVazio({ icone: 'obra', titulo: 'Publicar imóvel chega na próxima fase', texto: 'Seu CRECI está verificado. Na Fase 2 você publica com 8 fotos ou mais.', rota: '/feed', botao: 'Ver o feed' }) };
};

// ---------- telas que chegam nas próximas fases ----------
export const emConstrucao = (titulo, fase, texto) => async () => ({
  titulo,
  corpo: estadoVazio({ icone: 'obra', titulo: `${titulo} chega na Fase ${fase}`, texto, rota: '/feed', botao: 'Voltar ao feed' }),
});

// ---------- T16 · Admin: fila de CRECI ----------
const admin = { reprovando: null };
export const painelAdmin = async (C) => {
  const m = C.S.me;
  if (!m?.usuario) { C.irPara('/entrar', { substituir: true }); return { titulo: '', corpo: html`` }; }
  if (!m.pode.moderar) return { titulo: 'Administração', corpo: estadoBloqueio({ titulo: 'Área restrita', texto: 'Só administradores acessam esta página.', rota: '/feed', botao: 'Voltar ao feed' }) };
  let fila;
  try { fila = await C.api.get('/admin/creci?status=pendente'); } catch (e) { return { titulo: 'Administração', largo: true, corpo: estadoErro({ texto: e.message }) }; }
  const item = (i) => html`
    <article class="item-fila" aria-label="CRECI de ${i.nome ?? 'corretor'}">
      <dl class="item-fila__dados">
        <div><dt>Nome</dt><dd>${i.nome ?? '(sem nome)'}</dd></div>
        <div><dt>CRECI</dt><dd>${i.creci}/${i.uf}</dd></div>
        <div><dt>CPF</dt><dd>${i.cpf}</dd></div>
        <div><dt>Celular</dt><dd>${i.celular}</dd></div>
        <div><dt>Tentativa</dt><dd>${i.tentativa}</dd></div>
        <div><dt>Aguardando</dt><dd>${i.horas_aguardando < 1 ? 'menos de 1 h' : `${i.horas_aguardando} h`}</dd></div>
      </dl>
      ${admin.reprovando === i.usuario_id
        ? html`<form class="form" data-form="reprovar-creci" data-id="${i.usuario_id}"><div class="campo"><label for="motivo-${i.usuario_id}">Motivo (o corretor vai ler)</label><input class="entrada" id="motivo-${i.usuario_id}" name="motivo" maxlength="300" placeholder="Ex.: o nome não confere com o CRECI" required></div><p class="erro-campo" role="alert">${C.S.erroForm ?? ''}</p><div class="item-fila__acoes"><button class="botao botao--perigo" type="submit">Confirmar reprovação</button><button class="botao botao--texto" type="button" data-acao="cancelar-reprovar">Cancelar</button></div></form>`
        : html`<div class="item-fila__acoes"><button class="botao" type="button" data-acao="aprovar-creci" data-id="${i.usuario_id}">Aprovar</button><button class="botao botao--secundario" type="button" data-acao="reprovar-abrir" data-id="${i.usuario_id}">Reprovar</button></div>`}
    </article>`;
  return {
    titulo: 'Administração',
    largo: true,
    corpo: html`
      <section class="pagina">
        <div><h2>CRECI para conferir</h2><p class="texto-2">Confira o nome e a situação no site do conselho. Prazo combinado: 24 horas.</p></div>
        ${fila.itens.length
          ? html`<div class="fila">${fila.itens.map(item)}</div>`
          : estadoSucesso({ titulo: 'Fila zerada', texto: 'Nenhum CRECI aguardando conferência.' })}
      </section>`,
  };
};
export const estadoAdmin = admin;

// ---------- amostra do design system (T0, só para conferência) ----------
export const design = async (C) => ({
  titulo: 'Design',
  corpo: html`
    <section class="pagina">
      <div><h2>Design system</h2><p class="texto-2">Amostra das peças usadas em todas as telas. Conferida em 360px, com contraste AA.</p></div>
      <h3>Cores</h3>
      <div class="amostras">
        <div class="amostra sw-primaria"><b>Primária</b>Azul-petróleo</div><div class="amostra sw-primaria-clara"><b>Primária clara</b>Fundos de destaque</div>
        <div class="amostra sw-ambar"><b>Âmbar</b>Estrelas e selos</div><div class="amostra sw-verde"><b>Verde</b>Verificado</div>
        <div class="amostra sw-aviso"><b>Aviso</b>Atenção</div><div class="amostra sw-erro"><b>Erro</b>Falhas</div>
      </div>
      <h3>Reputação</h3>
      <div class="corretor"><span class="avatar">M</span><span class="corretor__nome">Marina Souza</span><span class="nota">${icone('estrela')}<b>4,8</b><span>(32)</span></span><span class="selo">${icone('verificado')}Verificado</span><span class="nota nota--nova">Novo na rede</span></div>
      <h3>Botões</h3>
      <div class="acoes"><button class="botao" type="button">Agendar visita</button><button class="botao botao--secundario" type="button">Falar com corretor</button><button class="botao botao--texto" type="button">Cancelar</button><button class="botao" type="button" disabled>Desativado</button></div>
      <h3>Campos</h3>
      <div class="campo"><label for="ex">Seu celular</label><input class="entrada" id="ex" placeholder="(21) 99999-0000"><span class="dica">Texto de ajuda</span></div>
      <div class="campo"><label for="ex2">Campo com erro</label><input class="entrada" id="ex2" aria-invalid="true" value="123"><span class="erro-campo">Confira o número: DDD + 9 dígitos.</span></div>
      <h3>Estados</h3>
      ${estadoVazio({ titulo: 'Nada por aqui ainda', texto: 'Mensagem curta que convida à ação.', rota: '/feed', botao: 'Explorar o feed' })}
      ${estadoErro({ texto: 'Sem conexão. Confira sua internet.' })}
      ${estadoSucesso({ titulo: 'Tudo certo', texto: 'Sua avaliação foi enviada.' })}
      ${estadoBloqueio({ titulo: 'Seu CRECI está em análise', texto: 'Assim que for verificado você publica.', rota: '/perfil', botao: 'Ver status' })}
      <h3>Carregando</h3>
      ${esqueletoFeed(1)}
      <h3>Aviso rápido</h3>
      <div class="acoes"><button class="botao botao--secundario" type="button" data-acao="toast-teste" data-tipo="ok">Sucesso</button><button class="botao botao--secundario" type="button" data-acao="toast-teste" data-tipo="erro">Erro</button></div>
    </section>`,
});
