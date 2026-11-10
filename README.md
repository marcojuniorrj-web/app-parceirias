# App de Parceirias

App de gestão de parcerias da Unnità. Construído pelo método SPEC → PLAN → BUILD (ver CLAUDE.md).

## Rodar no computador
```bash
npm run dev     # http://localhost:8787 (banco em memória; admin de teste: (21) 99999-0000)
npm test        # testes automáticos
npm run e2e     # roteiro no navegador (Playwright); SAIDA=/pasta guarda os prints
```
Nome provisório do app: `src/web/js/config.js`. Documentação do projeto: `docs/app-parceiros/`.

## Publicação de teste (Cloudflare)
Endereço: https://app-parceiros-teste.marco-junior-rj.workers.dev (Worker `app-parceiros-teste`, banco D1 `parceiros-teste`).
```bash
npx wrangler d1 migrations apply parceiros-teste --remote   # só quando houver migração nova
npx wrangler deploy                                         # roda os testes, embute a interface e publica
```
O segredo `SEGREDO_APP` já está gravado no Worker (`npx wrangler secret put SEGREDO_APP` para trocar).
**Atenção:** o ambiente de teste mostra o código de login na tela (não envia SMS); use só dados de teste.
