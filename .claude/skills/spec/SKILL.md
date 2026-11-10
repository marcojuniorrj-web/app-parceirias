---
name: spec
description: Fase 1 (SPEC) do método Spec → Plan → Build. Use quando o usuário quiser criar algo estruturado (app, ferramenta, automação, painel, simulador) ou disser "/spec". Roda as 4 skills de especificação (/visao, /usuarios, /telas, /dados) e depois gera a arquitetura. Você não escreve nada do zero: o Claude pergunta, você responde.
---

# SPEC — você explica o sistema

1. Pergunte o nome do projeto e crie `docs/<projeto>/spec/`.
2. Rode, na ordem, as 4 skills — cada uma faz perguntas e cria seu arquivo:
   `/visao` → `/usuarios` → `/telas` → `/dados`.
3. Com os 4 arquivos aprovados, crie `docs/<projeto>/spec/arquitetura.md` a partir de
   `docs/modelos/spec/arquitetura.md` (que já contém as boas práticas). Leia os 4 arquivos e o
   código existente, e defina: tecnologias, organização das pastas, modelo de dados técnico,
   contrato da API e riscos. Não altere a seção de boas práticas, só complemente.
4. Verifique consistência entre os 5 arquivos (tela que usa dado inexistente, perfil sem permissão
   para uma ação etc.) e corrija.
5. Mostre o resumo e peça aprovação. Próximo passo: `/plan`. **Não escreva código nesta fase.**
