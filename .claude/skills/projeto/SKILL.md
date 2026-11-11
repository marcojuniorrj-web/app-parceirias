---
name: projeto
description: Orquestradora do método Spec → Plan → Build. Use quando o usuário disser "/projeto", "onde paramos?", "continua o projeto", "próximo passo" ou quiser começar algo estruturado sem saber qual fase rodar. Lê o estado, mostra a fase atual e chama a skill certa (/spec, /plan ou /build). Só roteia: não repete as instruções das outras skills.
---

# PROJETO — orquestradora Spec → Plan → Build

Esta skill é fina de propósito: decide a fase e chama a skill daquela fase. Não copie aqui o conteúdo de /spec, /plan ou /build.

## 1. Descobrir o projeto
- Liste `docs/*/` (ignore `docs/modelos/`). Se houver mais de um projeto, pergunte qual.
- Se não houver nenhum, ou o usuário pedir algo novo: é um projeto novo → vá para a SPEC.
- **Formato antigo:** se existirem `docs/spec/` e/ou `docs/plan/` direto (sem pasta do projeto), o projeto é o próprio repositório: trate `docs/` como `docs/<projeto>/` em todas as fases. Projetos novos no mesmo repositório usam o formato `docs/<projeto>/`.

## 2. Ler só o estado (economia de tokens)
Leia **apenas** `docs/<projeto>/plan/execucao.md`, em especial "Onde paramos" e "Resumo das fases".
Não leia a SPEC nem o código nesta etapa. Se o arquivo não existir, veja só quais pastas existem:

| Situação | Fase |
|----------|------|
| Não existe `spec/` ou falta algum de visao/usuarios/telas/dados/arquitetura | SPEC |
| SPEC completa, mas "SPEC aprovada" não está marcado em `execucao.md` | Aprovar SPEC |
| SPEC aprovada, sem `plan/indice.md` | PLAN |
| PLAN pronto, mas "PLAN aprovado" não marcado | Aprovar PLAN |
| PLAN aprovado, ondas pendentes | BUILD (onda indicada em "Onde paramos") |
| Todas as ondas concluídas | Fim: teste manual do app completo |

## 3. Mostrar e pedir o ok
Em até 3 linhas: **Projeto**, **Fase atual**, **Próximo passo**. Pergunte "Posso seguir?".
Nunca pule fase: sem SPEC aprovada não há PLAN; sem PLAN aprovado não há código.

## 4. Chamar a skill da fase
- SPEC → skill `spec` · PLAN → skill `plan` · BUILD → skill `build`.
- Aprovação: mostre o resumo da fase e peça "aprovado?". Com o sim, marque em `execucao.md`.

## 5. Fechar a fase
Ao terminar SPEC ou PLAN (aprovados), crie `plan/execucao.md` a partir de `docs/modelos/plan/execucao.md` se ainda não existir e preencha o bloco **Resumo das fases**:
até 10 linhas com as decisões fechadas (escopo do MVP, usuários, telas principais, dados, stack).
As fases seguintes leem esse resumo primeiro e só abrem os documentos completos quando precisarem de detalhe.
