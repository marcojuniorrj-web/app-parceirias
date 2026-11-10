// Estados padrão de toda tela: carregando, vazio, erro, sucesso e bloqueio. Usados em todas as telas.
import { html } from './util.js';
import { icone } from './icones.js';

export const estadoVazio = ({ icone: ic = 'info', titulo, texto, rota, botao }) => html`
  <div class="estado estado--vazio">
    <span class="estado__icone">${icone(ic)}</span>
    <h3>${titulo}</h3>
    ${texto ? html`<p>${texto}</p>` : ''}
    ${botao ? html`<button class="botao" type="button" data-acao="ir" data-rota="${rota}">${botao}</button>` : ''}
  </div>`;

export const estadoErro = ({ titulo = 'Não conseguimos carregar', texto, botao = 'Tentar de novo' }) => html`
  <div class="estado estado--erro" role="alert">
    <span class="estado__icone">${icone('alerta')}</span>
    <h3>${titulo}</h3>
    ${texto ? html`<p>${texto}</p>` : ''}
    <button class="botao" type="button" data-acao="recarregar">${botao}</button>
  </div>`;

export const estadoSucesso = ({ titulo, texto, rota, botao }) => html`
  <div class="estado estado--sucesso" role="status">
    <span class="estado__icone">${icone('verificado')}</span>
    <h3>${titulo}</h3>
    ${texto ? html`<p>${texto}</p>` : ''}
    ${botao ? html`<button class="botao" type="button" data-acao="ir" data-rota="${rota}">${botao}</button>` : ''}
  </div>`;

// Bloqueio: explica por que não pode e qual o próximo passo (nunca um beco sem saída).
export const estadoBloqueio = ({ titulo, texto, rota, botao }) => html`
  <div class="estado estado--bloqueio">
    <span class="estado__icone">${icone('cadeado')}</span>
    <h3>${titulo}</h3>
    ${texto ? html`<p>${texto}</p>` : ''}
    ${botao ? html`<button class="botao" type="button" data-acao="ir" data-rota="${rota}">${botao}</button>` : ''}
  </div>`;

export const esqueletoFeed = (n = 2) => html`
  <div class="esqueleto" aria-busy="true" aria-label="Carregando">
    ${Array.from({ length: n }, () => html`
      <div class="esq-card">
        <div class="esq esq--foto"></div>
        <div class="esq esq--linha-g"></div>
        <div class="esq esq--linha esq--linha-m"></div>
      </div>`)}
  </div>`;

export function toast(mensagem, tipo = 'info') {
  const caixa = document.getElementById('toasts');
  if (!caixa) return;
  const el = document.createElement('div');
  el.className = `toast${tipo === 'erro' ? ' toast--erro' : tipo === 'ok' ? ' toast--ok' : ''}`;
  el.textContent = mensagem;
  caixa.append(el);
  setTimeout(() => el.remove(), 3800);
}
