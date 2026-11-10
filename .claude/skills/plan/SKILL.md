---
name: plan
description: Fase 2 (PLAN) do método Spec → Plan → Build. Use após a SPEC aprovada ou quando o usuário disser "/plan". Lê a SPEC, dispara 4 agentes revisores em paralelo (visão, usuários, telas, dados) e divide a construção em fases (ondas), cada uma entregando uma funcionalidade completa. Não escreve código.
---

# PLAN — o Claude cria o planejamento estruturado

Pré-requisito: os 5 arquivos de `docs/<projeto>/spec/` aprovados. Se faltar algum, rode `/spec`.

1. Leia **todos** os arquivos da SPEC e o código existente.
2. **Revisão por especialistas — 4 revisores em paralelo** (na mesma resposta), cada um sobre a pasta `docs/<projeto>/spec/`:
   visão, usuários, telas e dados.
   - Se os agentes `plan-visao`, `plan-usuarios`, `plan-telas` e `plan-dados` estiverem disponíveis, dispare-os.
   - Se não estiverem (ex.: projeto sem a pasta `.claude/agents/`), dispare 4 subagentes de uso geral, passando a
     cada um o conteúdo do arquivo correspondente em `revisores/` desta skill (`visao.md`, `usuarios.md`,
     `telas.md`, `dados.md`) como instrução, mais a pasta da SPEC. Eles só leem; não escrevem arquivos.
   Consolide o retorno: leve as **lacunas** ao usuário (com as sugestões, em um bloco só de perguntas),
   corrija os **conflitos** nos arquivos da SPEC e use as **tarefas** de cada área como matéria-prima das ondas.
3. Divida a construção em **fases (ondas)**. Regra de ouro: **cada onda entrega uma funcionalidade
   completa e testável** pelo usuário — não "só o banco" ou "só a tela".
   Ordem típica: esqueleto (projeto rodando, ponta a ponta mínimo) → fluxo principal →
   demais funcionalidades → integrações → segurança/regras → gestão/administração →
   observabilidade → fechamento.
4. Para cada fase, crie `docs/<projeto>/plan/faseN_<nome>.md` a partir de `docs/modelos/plan/faseN_nome.md`,
   com tarefas fatiadas em **prompts pequenos**, cada uma com critério de aceite, e um roteiro de teste.
5. Crie, a partir dos modelos em `docs/modelos/plan/`:
   - `indice.md` — lista das fases, entrega e status.
   - `mapa.md` — dependências entre fases.
   - `cobertura.md` — todo item da SPEC mapeado para uma fase/tarefa. Se algo ficou de fora, corrija.
   - `execucao.md` — memória de construção, começando em "Fase 1, nenhuma tarefa concluída".
   - `versoes-futuras.md` — roadmap por versão: tudo o que ficou fora do MVP ou foi marcado "depois/fora do
     escopo" na SPEC e na revisão dos agentes, com valor, pré-requisito, custo e gatilho para começar.
     **Nada pensado pode se perder.**
6. Mostre o índice e peça aprovação. Próximo passo: `/build`. **Não escreva código nesta fase.**
