---
name: frontend-testes
description: Testa telas web no navegador de verdade (Playwright) — abre a página, clica, preenche, tira screenshots no celular/tablet/desktop e captura erros do console e da rede. Use quando o usuário pedir para testar, conferir se uma tela funciona, achar um bug visual ou de fluxo, ou disser "/frontend-testes", "testa isso" ou "vê se está funcionando".
---

# Frontend › Testes

Teste como um usuário de verdade: abra a tela no navegador, olhe, clique e confira. Nada de supor que
funciona porque o código "parece certo".

Arquivos de apoio:
- `roteiro.js` — modelo pronto (Node + Playwright): 3 larguras, screenshots, erros de console/rede,
  rolagem horizontal. Rode como caixa-preta; copie e preencha `passos()` para testar um fluxo.
- `casos.md` — o que testar sempre.

## Regras de segurança (antes de tudo)
- **Nunca teste gravando em produção.** O Xaveco guarda leads reais (LGPD). Use o ambiente local ou o
  banco de preview (`xaveco-preview` em `wrangler.toml`). O `roteiro.js` bloqueia os endereços de produção.
- Só leitura em produção (abrir a página de login, por exemplo) e só se o usuário pedir.
- Use contas e dados de teste criados no banco local; nunca dados de clientes.
- O Playwright já está instalado (`require('playwright')`). **Não rode `playwright install`.**

## Os 4 passos

### 1. Onde testar
```
É HTML estático?
 ├─ Sim → abra com file:///caminho/arquivo.html (leia o HTML para achar os seletores)
 └─ Não (app com servidor) → o servidor já está rodando?
     ├─ Não → suba em segundo plano. No Xaveco:
     │        node build.mjs  e depois  npx wrangler dev --local   (porta 8787, D1 local)
     └─ Sim → siga para o passo 2
```
Atenção: `src/page.html` do Xaveco chama `/api/...`, então aberto por `file://` ele mostra erros de
API e de service worker que são esperados. Para testar fluxo de verdade, use o servidor local.
Confirme que a URL **não** é produção antes de qualquer ação que grava dados.

### 2. Reconhecer
Rode o `roteiro.js` sem passos: ele abre a página, espera a rede acalmar (`networkidle`), tira
screenshot nas 3 larguras e lista botões, links e campos visíveis. **Olhe os screenshots** antes de
escrever qualquer passo. Erro comum: procurar elementos antes de a página terminar de carregar.

### 3. Agir
Copie o `roteiro.js` para a pasta de rascunho e escreva os passos em `passos()`, com os seletores que
você viu:
- prefira seletores descritivos: `getByRole('button', { name: 'Entrar' })`, `getByLabel('E-mail')`, `#id`;
- espere de forma explícita (`waitForLoadState('networkidle')`, `waitForSelector`) — evite `sleep` fixo;
- cubra os casos de `casos.md` que se aplicam à tela;
- registre cada verificação com `registrar('o que foi testado', condição)`.

### 4. Relatar
- Tabela: teste · largura · passou/falhou.
- Screenshots relevantes (mostre ao usuário os de falha).
- Erros de console e de rede encontrados.
- **Relate falha como falha.** Nunca afrouxe ou apague um teste para ele passar. Se o pedido era
  corrigir: corrija o código, rode de novo e mostre o antes e depois.

## Testes de regra de negócio
Cálculos e regras de API (ex.: distribuição da roleta, cobrança) ficam em testes de código com
`node --test`, como prevê `docs/xaveco-crm/spec/arquitetura.md`. Esta skill cobre a tela e o fluxo
no navegador.

## Fonte desta skill
Ideias reescritas (não copiadas) de anthropics/skills `webapp-testing`, via skills.sh, adaptadas de
Python para o Playwright de Node deste ambiente.
