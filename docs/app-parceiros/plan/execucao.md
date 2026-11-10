# Execução (memória de construção)
## Onde paramos
- Fase atual: **Fase 1 — Esqueleto e login** (publicada em teste; aguardando o teste do Marco)
- Última tarefa concluída: 1.9 + estados padrão + 1.1b (publicação de teste)
- **Endereço de teste:** https://app-parceiros-teste.marco-junior-rj.workers.dev (admin de teste: (21) 99999-0000; o código de login aparece na tela)
- Próximo passo: Marco testa o roteiro da Fase 1 → ajustes → liberar a **Fase 2 — Imóveis e feed**
- Como rodar local: `npm run dev` (http://localhost:8787; admin de teste: (21) 99999-0000; o código aparece na tela em modo de teste). Testes: `npm test` (113). Navegador: `npm run e2e`.
## Pendências do Marco (fora do código)
- [ ] Nome e domínio definitivos
- [ ] Fornecedor da consulta CRECI
- [ ] Conta no gateway (Asaas) e na Meta (WhatsApp Business + template de autenticação)
- [ ] Lista dos 5–8 bairros do piloto
- [ ] Preço final (inicial R$ 49,90)
- [ ] Definir o celular dos administradores reais (`ADMIN_CELULARES`)
## Histórico
| Data | Fase/tarefa | O que foi feito | Decisões | Testado por |
|------|-------------|-----------------|----------|-------------|
| 2026-11-10 | PLAN | SPEC revisada por 4 agentes; 9 fases criadas | MVP enxuto; imobiliária sem plano fixo; piloto Unnità; metas 100/300/15/30% | — |
| 2026-11-10 | Fase 1 (1.1a–1.9) | Worker + D1, login por código (6 dígitos, 10 min, 5/h, reenvio 60s, sessão 30 dias), papéis múltiplos, matriz de permissões (20 ações), cadastro de CRECI (3 tentativas), fila do admin, teste grátis gravado, PWA, design system, feed de exemplo | Mensageria falsa (o código aparece na tela só fora de produção; produção recusa a mensageria falsa). CPF cifrado (AES-GCM) + hash para unicidade. Tabela `favoritos` criada na Fase 1 para guardar os ♥ dos exemplos (migra para imóveis reais na Fase 2). Admin nasce por `ADMIN_CELULARES`; admin não aprova o próprio CRECI. Testes de banco rodam em SQLite local (node:sqlite) com a interface do D1 | 113 testes automáticos + roteiro no navegador (Chromium, 360–1440 px); **Marco ainda não testou** |
| 2026-11-10 | 1.1b | Publicado na Cloudflare: Worker `app-parceiros-teste`, banco D1 `parceiros-teste` (id em wrangler.toml), segredo `SEGREDO_APP` aleatório, preview URLs desligadas | A interface é **embutida no Worker** no build (`build-web.mjs` → `dist/web.js`), porque o envio de assets da Cloudflare falha atrás do proxy do ambiente de desenvolvimento (401); revisar na Fase 9 (assets nativos pelo Workers Builds). Ambiente de teste tem mensageria falsa e mostra o código na tela; admin de teste fictício (21) 99999-0000. Liberado o host workers.dev na rede do ambiente Default só para verificação | verificado por curl e Chromium (sem erros); Marco ainda não testou |
