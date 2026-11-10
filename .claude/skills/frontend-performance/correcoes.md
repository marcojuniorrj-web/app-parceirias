# Correções por gargalo

Abra só a seção do gargalo que a medição apontou.

## Imagens (LCP alto, CLS, peso de imagem)
**Como reconhecer:** `img` alto no `medir.js`; LCP é uma foto; a tela pula quando a imagem carrega.
- Toda imagem com `width` e `height` (ou `aspect-ratio` no CSS) — acaba com o pulo.
- Imagem principal (hero, fachada do empreendimento): `fetchpriority="high"`, **sem** lazy.
- Abaixo da dobra: `loading="lazy"` e `decoding="async"`.
- Formatos modernos com `<picture>` (AVIF/WebP + fallback) e `srcset`/`sizes` para o celular não baixar
  a versão de 2.000 px. Foto de perspectiva: ~1.600 px de largura no máximo, ~200 KB acima da dobra.
- Ícones: SVG em vez de PNG quando possível.

## JavaScript pesado (peso de JS, tarefas longas, INP)
**Como reconhecer:** `js` acima de 200 KB; `longas` alto; clique demora a responder.
- **Carregar sob demanda** bibliotecas usadas só em uma ação. Ex. no Xaveco: jsPDF, xlsx e pdf.js
  (`src/page.html`) podem ser carregadas só quando o usuário clica em exportar/abrir PDF:
  ```js
  function carregaScript(src){return new Promise((ok,erro)=>{if(document.querySelector(`script[src="${src}"]`))return ok();
    const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=erro;document.head.appendChild(s)})}
  // no clique: await carregaScript('https://cdnjs.cloudflare.com/.../jspdf.umd.min.js'); depois usa window.jspdf
  ```
- Scripts que não precisam rodar antes da tela: `defer`.
- Trabalho pesado no clique (montar lista enorme): dividir em partes, ou renderizar só o visível.
- Atualizar o DOM uma vez (montar string/fragmento e inserir), não item a item em laço.

## CSS e fontes (render bloqueado, CLS por fonte)
**Como reconhecer:** `css` ou `font` acima do orçamento; texto "pisca" ou muda de tamanho ao carregar.
- No máximo 2 famílias e poucos pesos; `font-display: swap`; `preconnect` para o servidor de fontes.
- Preferir fonte do sistema em telas de operação (roleta, painel).
- CSS crítico enxuto; remover regras mortas.

## Servidor lento (TTFB alto)
**Como reconhecer:** `ttfb` acima de 800 ms local, ou rota da API lenta.
- Cronometrar a rota no Worker (`const t=Date.now(); ... console.log('rota', Date.now()-t)`) e ver nos
  registros do Cloudflare (observability já ligado em `wrangler.toml`).
- Paralelizar consultas independentes (`Promise.all` ou `env.DB.batch([...])`).

## Banco D1 (SQLite)
**Como reconhecer:** rota lenta só com muitos dados; consulta dentro de laço.
- **N+1:** uma consulta por item num laço → trazer tudo numa consulta só (`JOIN` ou `WHERE id IN (...)`).
- **Lista sem limite:** toda listagem com `LIMIT` e ordem estável (`ORDER BY ... , id`).
- **Índice:** antes de criar, rode `EXPLAIN QUERY PLAN <consulta>`. `SCAN tabela` onde se esperava
  `SEARCH ... USING INDEX` pede índice. Monte o índice no formato da consulta: colunas de igualdade
  primeiro (quase sempre `emp` vem primeiro), depois a de intervalo/ordem. Rode o plano de novo — índice
  que não mudou o plano é revertido. Todo índice deixa as gravações mais lentas.
- Mudança de índice vira migração versionada, testada no banco local/preview antes da produção.

## Cache
**Como reconhecer:** a mesma resposta cara é pedida muitas vezes e muda pouco.
- Cache só o que é **caro e muito mais lido do que alterado**. Cachear consulta já rápida só traz bug.
- A chave inclui **tudo** que muda a resposta: empresa (`emp`), usuário/permissão, filtros.
- Defina por quanto tempo pode ficar desatualizado e como invalida.
- **Nunca** cachear: leads disponíveis na roleta, sessão/login, cobrança, permissões.
- Arquivos estáticos (ícones, imagens): `Cache-Control` longo com nome versionado.
