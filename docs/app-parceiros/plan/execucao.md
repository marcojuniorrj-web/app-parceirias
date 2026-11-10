# Execução (memória de construção)
## Onde paramos
- Fase atual: **Fase 1 — Esqueleto e login** (código pronto; aguardando o teste do Marco)
- Última tarefa concluída: 1.9 + estados padrão (1.1b, publicar em ambiente de teste, pendente de decisão do Marco)
- Próximo passo: Marco testa o roteiro da Fase 1 → ajustes → liberar a **Fase 2 — Imóveis e feed**
- Como rodar local: `npm run dev` (http://localhost:8787; admin de teste: (21) 99999-0000; o código aparece na tela em modo de teste). Testes: `npm test` (113). Navegador: `npm run e2e`.
## Pendências do Marco (fora do código)
- [ ] Nome e domínio definitivos
- [ ] Fornecedor da consulta CRECI
- [ ] Conta no gateway (Asaas) e na Meta (WhatsApp Business + template de autenticação)
- [ ] Lista dos 5–8 bairros do piloto
- [ ] Preço final (inicial R$ 49,90)
- [ ] Criar o banco D1 de teste e o endereço de teste na Cloudflare (libera a tarefa 1.1b)
- [ ] Definir o celular dos administradores reais (`ADMIN_CELULARES`)
## Histórico
| Data | Fase/tarefa | O que foi feito | Decisões | Testado por |
|------|-------------|-----------------|----------|-------------|
| 2026-11-10 | PLAN | SPEC revisada por 4 agentes; 9 fases criadas | MVP enxuto; imobiliária sem plano fixo; piloto Unnità; metas 100/300/15/30% | — |
| 2026-11-10 | Fase 1 (1.1a–1.9) | Worker + D1, login por código (6 dígitos, 10 min, 5/h, reenvio 60s, sessão 30 dias), papéis múltiplos, matriz de permissões (20 ações), cadastro de CRECI (3 tentativas), fila do admin, teste grátis gravado, PWA, design system, feed de exemplo | Mensageria falsa (o código aparece na tela só fora de produção; produção recusa a mensageria falsa). CPF cifrado (AES-GCM) + hash para unicidade. Tabela `favoritos` criada na Fase 1 para guardar os ♥ dos exemplos (migra para imóveis reais na Fase 2). Admin nasce por `ADMIN_CELULARES`; admin não aprova o próprio CRECI. Testes de banco rodam em SQLite local (node:sqlite) com a interface do D1 | 113 testes automáticos + roteiro no navegador (Chromium, 360–1440 px); **Marco ainda não testou** |
