---
name: frontend
description: Orquestradora da trilha de frontend — leva uma tela do pedido à entrega encadeando visual → testes → performance, com um relatório final único. Use quando o usuário disser "/frontend", "cria uma tela", "faz a landing/página de…", "redesenha esta tela" ou quiser uma tela pronta para publicar. Para só testar, só medir ou só ajustar visual, ela chama apenas a etapa necessária.
---

# Frontend › Orquestradora

Esta skill não repete regras: em cada etapa, **leia o `SKILL.md` da sub-skill** e siga-o à risca.

| Etapa | Sub-skill | Arquivo |
|---|---|---|
| 1. Visual | frontend-visual | `.claude/skills/frontend-visual/SKILL.md` |
| 2. Testes | frontend-testes | `.claude/skills/frontend-testes/SKILL.md` (usa `roteiro.js`) |
| 3. Performance | frontend-performance | `.claude/skills/frontend-performance/SKILL.md` (usa `medir.js`) |

## 0. Classificar o pedido
- **Projeto grande** (app novo, várias telas, regras de negócio): proponha antes o método do projeto,
  `/spec` → `/plan` (ver `CLAUDE.md`). Depois, esta trilha roda dentro do `/build`, tela por tela.
- **Tela nova ou redesenho** → 1 → 2 → 3.
- **"Deixa mais bonito", "polir", "mais ousado/contido"** → 1 (modo refino) → 2 → 3.
- **"Testa isso", "vê se funciona"** → só 2.
- **"Está lento"** → 3, e depois 2 para garantir que a otimização não quebrou nada.

Diga em uma linha qual caminho vai seguir.

## 1. Visual
Siga `frontend-visual` até o plano de design (modo, cores, fontes, layout em ASCII, trocas contra os
anti-padrões).
**⏸ Pausa obrigatória:** mostre o plano e espere o usuário aprovar ou ajustar. O gosto do cliente decide
aqui. Aprovado, construa e tire os screenshots nas 3 larguras.

## 2. Testes
Siga `frontend-testes`: suba o ambiente local, reconheça, teste o fluxo principal e os casos aplicáveis.
Falhou → corrija o código (nunca o teste) e rode de novo.

## 3. Performance
Siga `frontend-performance`: meça com `medir.js`. Estourou o orçamento → corrija **um** gargalo por vez,
meça de novo, mantenha ou reverta. Cada correção mantida → rode a etapa 2 de novo.

## Regras da orquestração
- Etapas 2 e 3 rodam direto, sem pedir licença; só param se algo não puder ser resolvido.
- No máximo **3 voltas de correção por etapa**. Passou disso: pare e relate o que falta e por quê.
- Valem todas as travas das sub-skills: nada de gravar em produção, nada de afrouxar teste, marca do
  cliente preservada.
- Commit ao fim de cada etapa concluída, com mensagem clara.

## 4. Relatório final (uma mensagem)
1. **Visual** — modo e direção escolhidos, 1 screenshot de celular e 1 de desktop.
2. **Testes** — tabela teste · largura · passou/falhou.
3. **Performance** — tabela métrica · antes → depois · orçamento · status; tentativas revertidas.
4. **Pendências** — o que não passou ou ficou para depois, dito como é.
5. **Como o usuário testa** — passo a passo curto para conferir no navegador.
