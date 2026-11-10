# Regras do projeto

## Método padrão: SPEC → PLAN → BUILD

Sempre que formos criar algo mais estruturado (app, ferramenta, automação, painel,
simulador, nova funcionalidade com várias partes), siga as três fases, na ordem.
Tarefas pequenas e pontuais não precisam do método.

| Fase | Comando | O que acontece | Arquivos |
|------|---------|----------------|----------|
| **SPEC** — você explica | `/spec` (roda `/visao`, `/usuarios`, `/telas`, `/dados`) | O Claude faz perguntas em português; você responde. Depois ele define a arquitetura a partir de um modelo com boas práticas | `docs/<projeto>/spec/` visao, usuarios, telas, dados, arquitetura |
| **PLAN** — o Claude planeja | `/plan` | 4 agentes revisam a SPEC em paralelo (visão, usuários, telas, dados) apontando lacunas, conflitos e tarefas; depois o Claude divide a construção em fases (ondas), cada uma entregando uma funcionalidade completa | `docs/<projeto>/plan/` indice, mapa, cobertura, execucao, faseN_*.md |
| **BUILD** — o Claude constrói, você testa | `/build` | Constrói uma onda por vez; você testa tudo e pede a próxima | código + `plan/execucao.md` |

Regras:
- Não pule fases: sem SPEC aprovada não há PLAN; sem PLAN aprovado não há código.
- **Memória de construção**: `docs/<projeto>/plan/execucao.md`. Em qualquer sessão nova, basta
  perguntar "Onde paramos?" — leia esse arquivo e continue de onde parou.
- Modelos de todos os arquivos ficam em `docs/modelos/`.
- Se a realidade mudar, atualize o documento antes do código.

## Boas práticas

- Separe responsabilidades (interface, regras de negócio, dados, integrações).
- Fluxos que se repetem viram comando/skill reutilizável.
- Integrações externas (planilhas, CRM, WhatsApp) entram por conector/MCP quando houver.
- Responda em português do Brasil, linguagem direta e voltada a resultado comercial.

## Repositórios relacionados (marcojuniorrj-web)
- app-parcerias (este repositório)
- roleta-xaveco, xaveco-crm, ficha-cadastro-MJ, visitas-equipeMJ
