---
name: build
description: Fase 3 (BUILD) do método Spec → Plan → Build. Use após o PLAN aprovado ou quando o usuário disser "/build", "próxima onda" ou "pode construir". Constrói uma onda por vez com subagentes (construtor, revisor e testes), mantém a memória de construção e entrega para o usuário testar.
---

# BUILD — o Claude constrói seguindo o plano, com subagentes

A conversa principal coordena; o trabalho pesado vai para subagentes, que devolvem só resumos.
Isso mantém o contexto leve e evita que uma onda polua a próxima.

**Subagentes:** se os agentes `build-onda` e `build-revisor` estiverem disponíveis, use-os. Se não estiverem (ex.: claude.ai ou projeto sem `.claude/agents/`), dispare um subagente de uso geral passando como instrução o conteúdo de `agentes/onda.md` ou `agentes/revisor.md` desta skill, mais os dados da onda.

**Formato antigo:** se o repositório usa `docs/spec/` e `docs/plan/` direto (sem pasta do projeto), leia `docs/` no lugar de `docs/<projeto>/` aqui e ao passar caminhos aos subagentes.

## Começo de toda sessão ("Onde paramos?")
1. Leia **só** `docs/<projeto>/plan/execucao.md` (Onde paramos + Resumo das fases) e `plan/indice.md`.
2. Diga em 2–3 linhas o que já foi feito e qual é a próxima onda, e continue de lá.
3. Confirme que "PLAN aprovado" está marcado. Se não, volte para /plan (ou /projeto).

## Ciclo de cada onda
1. **Prepare**: anote o commit atual (`git rev-parse HEAD`) como início da onda e garanta que o arquivo da fase tem tarefas, critérios de aceite e dependências claros (o subagente começa sem memória).
2. **Construa** → subagente `build-onda`, passando: projeto, caminho do `faseN_*.md` e qualquer ajuste pedido pelo usuário.
3. **Revise** → subagente `build-revisor`, passando: projeto, arquivo da fase e commit de início.
4. **Teste a tela** (se a onda tiver interface web) → subagente `general-purpose` instruído a usar a skill `frontend-testes` nas telas da onda e devolver só falhas e o caminho dos screenshots.
   Os passos 3 e 4 podem rodar em paralelo.
5. **Corrija**: se o revisor ou os testes apontarem problemas, chame `build-onda` de novo só com a lista de ajustes. No máximo 2 rodadas; depois, relate ao usuário o que ficou pendente.
6. **Entregue**: mostre a evidência (testes/build) e o **roteiro de teste** da fase. Relate falhas como são.
7. **Espere o usuário testar tudo e pedir a próxima onda.** Ajustes pedidos por ele voltam ao passo 2.
8. **Registre**: atualize `indice.md` (status da fase) e `execucao.md` (Onde paramos + Histórico + Resumo das fases, se alguma decisão mudou).
9. Se algo da SPEC ou do plano mudar, atualize o documento antes do código.

Tarefa muito pequena (ex.: ajuste de texto ou cor) pode ser feita direto na conversa principal, sem subagente.

## Fim
Quando todas as ondas estiverem concluídas: o usuário abre no navegador e testa manualmente o app
completo; registre em `execucao.md` e resuma o que foi entregue, como usar e o que ficou para depois.
