---
name: dados
description: Skill de SPEC "Dados". Use quando o usuário digitar "/dados" ou quando a skill /spec chamar. Faz perguntas em português e cria docs/NOME-DO-PROJETO/spec/dados.md. Não escreve código.
---

# SPEC › Dados

1. Descubra o projeto (pasta `docs/<projeto>/`). Se não houver, pergunte o nome e crie.
2. Leia os arquivos de `docs/<projeto>/spec/` que já existirem — não repita o que já foi respondido.
3. Faça as perguntas abaixo **em blocos de 3 a 4**, usando a ferramenta de perguntas com opções
   quando houver respostas típicas. Se o usuário não souber, sugira o padrão sensato e marque "assumido".
4. Crie `docs/<projeto>/spec/dados.md` a partir de `docs/modelos/spec/dados.md`. Mostre um resumo e peça aprovação.
5. Diga qual é a próxima skill da SPEC.

## Perguntas
- Que informações o sistema guarda (clientes, imóveis, unidades, propostas...)?
- Quais campos cada uma tem? Quais são obrigatórios?
- De onde vêm os dados (formulário, planilha, CRM, tabela de vendas)?
- O que sai do sistema (relatório, PDF, mensagem, painel)?
- Há cálculos ou regras (financiamento, comissão, fluxo de pagamento)? Descreva as fórmulas.
- Precisa conectar com Google Sheets, CRM, WhatsApp, e-mail?
- Há dados sensíveis (CPF, renda)? Quem pode ver? Por quanto tempo guardar?
