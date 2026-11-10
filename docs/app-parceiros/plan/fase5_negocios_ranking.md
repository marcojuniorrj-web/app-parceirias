# Fase 5 — Negócios e ranking
## Entrega
Registrar negócio fechado, parceiro confirma, cliente avalia a compra/locação (nota + depoimento, 'Compra verificada'), e o feed passa a ordenar pelo ranking completo.
## Depende de
Fase 4
## Tarefas (prompts pequenos)
- [ ] 5.1 Migração 005: negocios, negocio_corretores — aceite: constraints
- [ ] 5.2 T18 Registrar negócio + confirmação/contestação do parceiro — aceite: só conta na meta após confirmação
- [ ] 5.3 T11b Avaliação de compra/locação (30 dias, peso 3, vale para todos os corretores do negócio) — aceite: selo 'Compra verificada' no perfil
- [ ] 5.4 Serviço score (nota, resposta, atualização, atividade p95) com pesos versionados em configuracoes — aceite: mudar peso muda score no ciclo seguinte
- [ ] 5.5 Cron horário grava corretor_metricas — aceite: execução em < 30s com 1.000 corretores simulados
- [ ] 5.6 Ordem do feed = score × aderência × recência (meia-vida 14d) + máx. 2 seguidos do mesmo corretor — aceite: teste de sequência
- [ ] 5.7 Imóveis de corretor sem assinatura ativa ficam fora do feed (gancho para a Fase 6) — aceite: teste
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Registre um negócio como corretor e confirme como parceiro.
2. Como cliente, avalie a compra com depoimento e veja o selo no perfil.
3. Compare a ordem do feed entre dois corretores com notas diferentes.
