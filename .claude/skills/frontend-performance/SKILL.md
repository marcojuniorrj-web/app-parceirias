---
name: frontend-performance
description: Mede e melhora a velocidade de páginas web (carregamento, Core Web Vitals, peso de JS/CSS/imagens, consultas lentas no D1). Use quando o usuário disser que algo está lento, pedir para deixar uma página mais rápida, antes de publicar uma landing de lançamento, ou digitar "/frontend-performance". Mede antes de mexer e só mantém o que comprovadamente melhorou.
---

# Frontend › Performance

**Meça antes de otimizar.** Otimizar sem medir é chute, e chute vira complexidade que não melhora nada.
Encontre o gargalo real, corrija só ele, meça de novo.

Arquivos de apoio:
- `medir.js` — mede no Playwright do ambiente (celular 4G e desktop, mediana de 3 rodadas) e compara
  com o orçamento. Rode como caixa-preta: `node .claude/skills/frontend-performance/medir.js <url>`.
- `correcoes.md` — correção para cada gargalo, com "como reconhecer".
- `registro.md` — modelo do diário de tentativas.

**Quando NÃO usar:** sem evidência de lentidão e sem meta definida. Otimização antecipada custa mais do
que entrega. (Exceção: antes de publicar landing ou tela nova, rode a medição uma vez como conferência.)

## Metas
| Métrica | Bom | Atenção | Ruim |
|---|---|---|---|
| **LCP** (maior elemento visível carregado) | ≤ 2,5 s | ≤ 4 s | > 4 s |
| **INP** (resposta a um clique/toque) | ≤ 200 ms | ≤ 500 ms | > 500 ms |
| **CLS** (quanto a tela "pula") | ≤ 0,1 | ≤ 0,25 | > 0,25 |

Orçamento (já embutido no `medir.js`): JS ≤ 200 KB · CSS ≤ 50 KB · fontes ≤ 100 KB · imagens ≤ 500 KB ·
total ≤ 1 MB · ≤ 50 requisições · API p95 ≤ 200 ms. Ajuste por projeto se o usuário definir outro.

Em página de lançamento, velocidade é conversão: cada segundo a mais no celular derruba lead.

## Os 5 passos

### 1. Medir (linha de base)
- Ambiente local ou preview (o `medir.js` bloqueia produção; medir produção só se o usuário pedir — é
  só leitura, com `PERMITIR_PRODUCAO=1`).
- Rode `medir.js` e guarde a tabela. Anote a **variação** entre rodadas: é o ruído.

### 2. Identificar o gargalo
Comece pelo sintoma:
```
O que está lento?
├─ Primeira carga
│   ├─ Muito JS/CSS?          → ver peso por tipo; scripts de terceiros carregados cedo
│   ├─ Servidor demora (TTFB)? → medir a rota no Worker; consultas D1
│   └─ Imagem grande/LCP alto? → tamanho, formato, prioridade da imagem principal
├─ Clique/toque demora        → tarefas longas (> 50 ms) no JS; DOM enorme atualizado de uma vez
├─ Tela pula (CLS)            → imagem sem largura/altura, fonte trocando, conteúdo entrando por cima
└─ API / lista lenta          → consulta sem índice, N+1, lista sem limite
```
Confirme com dados (peso, tempo da rota, `EXPLAIN QUERY PLAN`) — não com suposição.

### 3. Corrigir só esse gargalo
Use a receita de `correcoes.md`. **Uma mudança por vez**; três juntas geram um número que não dá para
atribuir a nenhuma.

### 4. Verificar: manter ou reverter
Meça do mesmo jeito da linha de base (mesmo comando, mesmo perfil, mesmas rodadas).

| Resultado | Decisão |
|---|---|
| Melhorou além da variação, testes passando | **Manter** — commit com antes → depois na mensagem |
| Dentro do ruído (sem mudança real) | **Reverter** |
| Piorou | **Reverter** |
| Melhorou, mas quebrou um teste | **Reverter** — é regressão disfarçada |

"Neutro" é reverter, mesmo que já esteja escrito. Correção vem antes de métrica: ganhar velocidade
pulando validação ou cacheando o que precisa estar fresco é regressão.

Registre **toda** tentativa, inclusive as revertidas, no formato de `registro.md` (em `PERF.md` na
raiz do projeto ou na descrição do PR), para ninguém repetir ideia que já falhou.

### 5. Proteger
Deixe a medição como rotina: rodar `medir.js` antes de publicar telas novas e após mudanças grandes,
comparando com o último registro. Se estourar, volte ao passo 1.

## Sinais de alerta
- Otimização sem número antes e depois.
- Bibliotecas pesadas (PDF, Excel, gráficos) carregadas na abertura da página para todo mundo.
- Imagem sem `width`/`height`, sem `loading="lazy"` abaixo da dobra.
- Lista ou rota sem limite/paginação; consulta dentro de laço (N+1).
- Cache cuja chave não inclui a empresa (`emp`) — risco de uma imobiliária ver dado de outra.
- Índice novo sem plano de consulta antes e depois.
- Teste alterado ou apagado para a "otimização" passar.

## Fonte desta skill
Ideias reescritas (não copiadas) de addyosmani/agent-skills `performance-optimization`, via skills.sh,
adaptadas para Playwright (sem Lighthouse) e para Cloudflare Worker + D1.
