// Núcleo da interface: estado, roteador por hash, menu por perfil e todos os eventos (sem handlers inline: CSP).
import { api, ApiErro } from './api.js';
import { html } from './util.js';
import { NOME, ROTA_INICIAL } from './config.js';
import { menuPara } from './menu.js';
import { icone } from './icones.js';
import { toast, estadoErro } from './componentes.js';
import { maskCelular, maskCpf } from './util.js';
import * as T from './telas.js';

const S = { me: null, favoritos: new Set(), erroNome: '', erroForm: '' };
const raiz = document.getElementById('app');
let temporizador = null;
let geracao = 0; // descarta renderizações antigas se o usuário navegar rápido

// ---------- ação pendente (♥ feito como visitante) ----------
const CHAVE_PENDENTE = 'acao_pendente';
let pendenteMemoria = null;
function guardarPendente(a) { pendenteMemoria = a; try { localStorage.setItem(CHAVE_PENDENTE, JSON.stringify(a)); } catch { /* modo privado */ } }
function lerPendente() { try { const v = localStorage.getItem(CHAVE_PENDENTE); return v ? JSON.parse(v) : pendenteMemoria; } catch { return pendenteMemoria; } }
function limparPendente() { pendenteMemoria = null; try { localStorage.removeItem(CHAVE_PENDENTE); } catch { /* ok */ } }

// ---------- rotas ----------
function lerHash() {
  const h = location.hash.replace(/^#/, '') || ROTA_INICIAL;
  const [caminho, q = ''] = h.split('?');
  return { caminho: caminho || ROTA_INICIAL, query: new URLSearchParams(q) };
}
const rotaSegura = (r) => (typeof r === 'string' && /^\/[a-z-]*$/.test(r) ? r : null); // só rotas internas conhecidas
export function irPara(rota, { volta, substituir = false } = {}) {
  const alvo = `#${rota}${volta ? `?volta=${encodeURIComponent(volta)}` : ''}`;
  if (substituir) history.replaceState(null, '', alvo);
  else if (location.hash !== alvo) location.hash = alvo;
  if (substituir || location.hash === alvo) renderizar();
}

const TELAS = {
  '/feed': T.feed,
  '/entrar': T.entrar,
  '/primeiro-acesso': T.primeiroAcesso,
  '/cadastro-corretor': T.cadastroCorretor,
  '/perfil': T.perfil,
  '/admin': T.painelAdmin,
  '/publicar': T.publicar,
  '/buscar': T.emConstrucao('Buscar', 2, 'Filtros por bairro, preço e quartos chegam junto com os imóveis reais.'),
  '/salvos': T.emConstrucao('Salvos', 2, 'Aqui ficam os imóveis que você salvar.'),
  '/conversas': T.emConstrucao('Conversas', 3, 'O chat com corretores e parceiros chega na próxima etapa.'),
  '/equipe': T.emConstrucao('Equipe', 7, 'O painel da imobiliária chega na Fase 7.'),
  '/design': T.design,
};

function cronometro(fn) { clearInterval(temporizador); temporizador = setInterval(() => { if (!fn()) clearInterval(temporizador); }, 1000); }

function layout({ titulo, corpo, largo }, rotaAtual) {
  const itens = menuPara(S.me);
  return html`
    <header class="topo"><a class="marca" href="#/feed" aria-label="${NOME}: ir para o feed">${icone('marca')}${NOME}</a><span class="topo__titulo">${titulo}</span></header>
    <main id="conteudo" class="conteudo" tabindex="-1">${corpo}</main>
    <nav class="menu" aria-label="Principal">
      ${itens.map((i) => html`<a class="menu__item" href="#${i.rota}" ${i.rota === rotaAtual ? html`aria-current="page"` : ''}>${icone(i.icone)}<span>${i.rotulo}</span></a>`)}
    </nav>`;
}

async function renderizar() {
  const minha = ++geracao;
  clearInterval(temporizador);
  const { caminho, query } = lerHash();
  const tela = TELAS[caminho];
  const C = { S, api, irPara, cronometro, volta: rotaSegura(query.get('volta')) };
  raiz.classList.toggle('app--largo', caminho === '/admin');

  if (!tela) {
    raiz.innerHTML = layout({ titulo: '', corpo: html`<div class="pagina"><h2>Página não encontrada</h2><button class="botao" data-acao="ir" data-rota="/feed">Ir para o feed</button></div>` }, caminho);
    return;
  }
  if (tela.carregando) raiz.innerHTML = layout({ titulo: '', corpo: tela.carregando() }, caminho);
  let r;
  try {
    r = await tela(C);
  } catch (e) {
    r = { titulo: '', corpo: estadoErro({ texto: e instanceof ApiErro ? e.message : 'Algo deu errado.' }) };
  }
  if (minha !== geracao) return;
  document.title = r.titulo ? `${r.titulo} · ${NOME}` : NOME;
  raiz.classList.toggle('app--largo', Boolean(r.largo));
  raiz.innerHTML = layout(r, caminho);
  r.depois?.();
}

// ---------- sessão ----------
async function carregarMe() {
  try {
    S.me = await api.get('/me');
    if (!S.me.usuario) S.me = null; // visitante
  } catch { S.me = null; }
  S.favoritos = new Set();
  if (S.me?.pode?.favoritar_ou_salvar) {
    try { S.favoritos = new Set((await api.get('/favoritos')).ids); } catch { /* segue sem favoritos */ }
  }
}

async function executarPendente() {
  const a = lerPendente();
  if (!a) return;
  if (a.tipo === 'favoritar' && S.me?.pode?.favoritar_ou_salvar) {
    try { await api.post(`/favoritos/${encodeURIComponent(a.id)}`); S.favoritos.add(a.id); toast('Imóvel salvo!', 'ok'); limparPendente(); } catch (e) { toast(e.message, 'erro'); }
  } else if (a.tipo === 'favoritar') {
    return; // ainda não pode (falta escolher perfil): mantém para depois
  } else { limparPendente(); }
}

async function depoisDeEntrar(volta) {
  await carregarMe();
  if (S.me?.precisa_escolher_perfil) { irPara('/primeiro-acesso', { volta }); return; }
  await executarPendente();
  irPara(volta ?? '/feed', { substituir: true });
}

// ---------- ações ----------
async function favoritar(id) {
  if (!S.me) {
    guardarPendente({ tipo: 'favoritar', id });
    toast('Entre para salvar este imóvel.');
    irPara('/entrar', { volta: '/feed' });
    return;
  }
  if (!S.me.pode.favoritar_ou_salvar) {
    guardarPendente({ tipo: 'favoritar', id });
    irPara('/primeiro-acesso', { volta: '/feed' });
    return;
  }
  const salvo = S.favoritos.has(id);
  salvo ? S.favoritos.delete(id) : S.favoritos.add(id); // otimista: responde na hora
  atualizarCoracao(id);
  try {
    salvo ? await api.del(`/favoritos/${encodeURIComponent(id)}`) : await api.post(`/favoritos/${encodeURIComponent(id)}`);
    if (!salvo) toast('Imóvel salvo!', 'ok');
  } catch (e) {
    salvo ? S.favoritos.add(id) : S.favoritos.delete(id); // desfaz se falhou
    atualizarCoracao(id);
    toast(e.message, 'erro');
  }
}
function atualizarCoracao(id) {
  for (const b of document.querySelectorAll(`[data-acao="favoritar"][data-id="${CSS.escape(id)}"]`)) {
    const s = S.favoritos.has(id);
    b.setAttribute('aria-pressed', s ? 'true' : 'false');
    b.setAttribute('aria-label', s ? 'Remover dos salvos' : 'Salvar imóvel');
  }
}

function mostrarErro(mensagem) {
  const el = document.getElementById('erro') ?? document.querySelector('.erro-campo');
  if (el) el.textContent = mensagem;
  toast(mensagem, 'erro');
}

const ACOES = {
  ir: (el) => irPara(el.dataset.rota),
  recarregar: () => renderizar(),
  favoritar: (el) => favoritar(el.dataset.id),
  'toast-teste': (el) => toast(el.dataset.tipo === 'erro' ? 'Algo deu errado. Tente de novo.' : 'Salvo com sucesso!', el.dataset.tipo),

  'trocar-celular': () => { T.reiniciarLogin(); renderizar(); },
  reenviar: async () => {
    const L = T.estadoLogin;
    try {
      const r = await api.post('/auth/codigo', { celular: L.celular });
      L.reenviarEm = Date.now() + r.reenviar_em_s * 1000; L.codigoDev = r.codigo_dev ?? null; L.erro = '';
      toast('Enviamos um novo código.', 'ok');
    } catch (e) {
      L.erro = e.message;
      if (e.dados?.espere_s) L.reenviarEm = Date.now() + e.dados.espere_s * 1000;
    }
    renderizar();
  },

  'escolher-perfil': async (el) => {
    const nome = document.getElementById('nome')?.value ?? '';
    if (nome.trim().length < 2) { S.erroNome = 'Informe seu nome para continuar.'; renderizar(); return; }
    S.erroNome = '';
    try {
      S.me = await api.post('/me/perfil', { tipo: el.dataset.tipo, nome });
      await carregarMe();
      await executarPendente();
      const volta = rotaSegura(lerHash().query.get('volta'));
      if (el.dataset.tipo === 'corretor') irPara('/cadastro-corretor', { substituir: true });
      else irPara(volta ?? '/feed', { substituir: true });
    } catch (e) { S.erroNome = e.message; renderizar(); }
  },
  'virar-corretor': async () => {
    try { await api.post('/me/perfil', { tipo: 'corretor' }); await carregarMe(); irPara('/cadastro-corretor'); } catch (e) { toast(e.message, 'erro'); }
  },
  sair: async () => { try { await api.post('/auth/sair'); } finally { S.me = null; S.favoritos = new Set(); T.reiniciarLogin(); toast('Você saiu.'); irPara('/feed', { substituir: true }); } },
  'sair-todos': async () => {
    try { await api.post('/auth/sair-todos'); S.me = null; S.favoritos = new Set(); T.reiniciarLogin(); toast('Você saiu de todos os aparelhos.'); irPara('/feed', { substituir: true }); } catch (e) { toast(e.message, 'erro'); }
  },

  'aprovar-creci': async (el) => {
    try { const r = await api.put(`/admin/creci/${encodeURIComponent(el.dataset.id)}`, { decisao: 'aprovar' }); toast(`CRECI aprovado. Teste grátis até ${new Date(r.teste_gratis_fim).toLocaleDateString('pt-BR')}.`, 'ok'); } catch (e) { toast(e.message, 'erro'); }
    renderizar();
  },
  'reprovar-abrir': (el) => { T.estadoAdmin.reprovando = el.dataset.id; S.erroForm = ''; renderizar(); },
  'cancelar-reprovar': () => { T.estadoAdmin.reprovando = null; S.erroForm = ''; renderizar(); },
};

const FORMS = {
  'pedir-codigo': async (form) => {
    const L = T.estadoLogin;
    L.celular = new FormData(form).get('celular');
    try {
      const r = await api.post('/auth/codigo', { celular: L.celular });
      Object.assign(L, { passo: 'codigo', reenviarEm: Date.now() + r.reenviar_em_s * 1000, codigoDev: r.codigo_dev ?? null, erro: '' });
    } catch (e) {
      L.erro = e.message;
      if (e.codigo === 'aguarde') Object.assign(L, { passo: 'codigo', reenviarEm: Date.now() + e.dados.espere_s * 1000 });
    }
    renderizar();
  },
  entrar: async (form) => {
    const L = T.estadoLogin;
    try {
      await api.post('/auth/entrar', { celular: L.celular, codigo: new FormData(form).get('codigo') });
      L.erro = '';
      const volta = rotaSegura(lerHash().query.get('volta'));
      T.reiniciarLogin();
      await depoisDeEntrar(volta);
    } catch (e) { L.erro = e.message; renderizar(); }
  },
  'enviar-creci': async (form) => {
    const d = new FormData(form);
    try {
      await api.post('/corretores', { cpf: d.get('cpf'), creci: d.get('creci'), uf: d.get('uf') });
      S.erroForm = '';
      await carregarMe();
      toast('CRECI enviado! Conferimos em até 24 horas.', 'ok');
      irPara('/perfil', { substituir: true });
    } catch (e) { S.erroForm = e.message; renderizar(); }
  },
  'reprovar-creci': async (form) => {
    try {
      await api.put(`/admin/creci/${encodeURIComponent(form.dataset.id)}`, { decisao: 'reprovar', motivo: new FormData(form).get('motivo') });
      T.estadoAdmin.reprovando = null; S.erroForm = '';
      toast('CRECI reprovado. O corretor foi avisado.', 'ok');
    } catch (e) { S.erroForm = e.message; }
    renderizar();
  },
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-acao]');
  if (!el || el.disabled) return;
  const fn = ACOES[el.dataset.acao];
  if (fn) { ev.preventDefault(); fn(el); }
});
document.addEventListener('submit', (ev) => {
  const form = ev.target.closest('form[data-form]');
  if (!form) return;
  ev.preventDefault();
  const fn = FORMS[form.dataset.form];
  if (!fn) return;
  const botao = form.querySelector('[type="submit"]');
  if (botao) botao.disabled = true; // evita envio duplo
  Promise.resolve(fn(form)).finally(() => { if (botao?.isConnected) botao.disabled = false; });
});
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'celular') ev.target.value = maskCelular(ev.target.value);
  if (ev.target.id === 'codigo') ev.target.value = ev.target.value.replace(/\D/g, '').slice(0, 6);
  if (ev.target.id === 'cpf') ev.target.value = maskCpf(ev.target.value);
});
window.addEventListener('hashchange', renderizar);

// ---------- início ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { /* sem offline, segue normal */ }));
}
document.body.insertAdjacentHTML('beforeend', '<div id="toasts" class="toasts" aria-live="polite"></div>');
await carregarMe();
renderizar();
