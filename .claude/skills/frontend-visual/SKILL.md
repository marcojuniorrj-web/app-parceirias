---
name: frontend-visual
description: Design visual de telas web (landing de lançamento, painel, simulador, página de produto) com identidade própria e sem cara de "página feita por IA". Use quando o usuário pedir para criar, redesenhar ou melhorar o visual de uma tela, ou disser "/frontend-visual", "deixa mais bonito", "mais ousado", "mais contido" ou "polir".
---

# Frontend › Visual

Trabalhe como o diretor de arte de um estúdio que dá a cada cliente uma identidade inconfundível.
O cliente já recusou propostas genéricas: cada escolha de cor, fonte e layout precisa ser feita
**para este produto**, não reaproveitada de qualquer outro.

Arquivos de apoio (leia quando o passo pedir):
- `modos.md` — o tipo de tela define o nível de ousadia
- `anti-padroes.md` — os vícios de "página de IA" a evitar
- `checklist.md` — o mínimo de qualidade antes de entregar

## Os 4 passos

### 1. Entender o assunto
- Descubra **o que é**, **para quem** e **qual a tarefa principal** da tela. Se o pedido não disser,
  proponha uma resposta e confirme com o usuário.
- O universo do assunto (o empreendimento, o bairro, os materiais, o vocabulário do público) é de onde
  saem as escolhas visuais distintas. Uma landing de alto padrão na Barra não se parece com um painel de leads.
- **Leia a identidade que já existe** (cores, logo, fontes, tokens do projeto). No Xaveco, cada empresa
  tem nome, cores e logo próprios em `src/page.html`: nunca sobrescreva a marca do cliente.
- Use conteúdo real do pedido. Se faltar texto, escreva copy plausível — veja "Textos" abaixo.

### 2. Escolher o modo e os 3 ajustes
Abra `modos.md`, classifique a tela (Persuadir, Experiência, Operar, Ler) e defina os ajustes de
variação, movimento e densidade. Diga a escolha em uma linha.

### 3. Plano de design antes do código
Mostre um plano curto:
- **Cores**: 4 a 6 valores hex com nome e papel (fundo, texto, destaque, apoio...).
- **Fontes**: uma ou duas famílias, com papéis claros. Escolha de propósito, não a fonte padrão de sempre.
  Escala tipográfica definida; linhas com menos de ~80 caracteres.
- **Layout**: a ideia em uma frase + rascunho em ASCII. Diga o alinhamento (esquerda, centro...).
- **Princípios**: 2 a 3 frases sobre o que torna esta tela única.

Depois **revise o plano contra `anti-padroes.md`**: se algo parece o padrão que você faria para qualquer
página parecida, troque e diga o que mudou e por quê. Só então escreva o código.

Se o pedido define uma direção visual, siga à risca — o pedido sempre vence, mesmo se pedir um dos
"padrões".

### 4. Construir e criticar
- **Ousadia em um lugar só**: um elemento memorável (o hero, uma tipografia, uma interação); o resto,
  calmo e disciplinado. Antes de entregar, tire um acessório.
- Cuidado com a especificidade do CSS: classes que se anulam (ex.: `.section` x `.cta`) bagunçam
  espaçamentos.
- **Olhe o que fez**: screenshot em 3 larguras (390, 768 e 1440 px) com Playwright (já instalado:
  `require('playwright')`). Corrija tudo o que uma rodada mostrou e só então olhe de novo.
- Passe o `checklist.md` inteiro e relate o resultado.

## Textos da interface
- Palavras existem para facilitar o uso, não para enfeitar. Nomeie pelo que o usuário entende
  ("Distribuir leads", não "Executar rotina").
- Voz ativa. Botão diz o que acontece ("Agendar visita", não "Enviar") e mantém o nome no fluxo inteiro:
  o botão "Publicar" gera o aviso "Publicado".
- Erro explica o que houve e como resolver, sem pedir desculpa e sem ser vago. Tela vazia convida à ação.
- Tom de conversa: verbos simples, só a primeira letra maiúscula, sem enrolação.

## Comandos de refino
Quando a tela já existe, o usuário pode pedir:
- **"mais ousado"** — suba variação/movimento um nível, amplie o elemento memorável.
- **"mais contido"** — desça um nível, corte decoração, reforce hierarquia e respiro.
- **"polir"** — sem mudar a direção: alinhamentos, espaçamentos, estados (hover, foco, vazio, erro),
  contraste e o `checklist.md`.

## Fontes desta skill
Ideias reescritas (não copiadas) de: anthropics/skills `frontend-design`, leonxlnx/taste-skill
`design-taste-frontend` e pbakaus/impeccable `impeccable`, via skills.sh. Os scripts da taste-skill
não são usados (o repositório falhou numa auditoria de segurança do skills.sh).
