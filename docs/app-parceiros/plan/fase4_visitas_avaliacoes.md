# Fase 4 — Visitas e avaliações
## Entrega
Agendar visita pelo chat, confirmar, receber lembrete e convite de agenda (.ics), marcar 'visita realizada' e avaliar em estrelas por critério (às cegas); notas aparecem no perfil.
## Depende de
Fase 3
## Tarefas (prompts pequenos)
- [ ] 4.1 Migração 004: visitas, avaliacoes (UNIQUE origem+ref+avaliador+avaliado), corretor_metricas — aceite: constraints testadas
- [ ] 4.2 T9 Agendar/confirmar/sugerir/recusar/cancelar visita + Agenda em T5 + convite .ics — aceite: visita aparece na agenda do celular
- [ ] 4.3 Lembrete 2h antes (push) via cron — aceite: teste com relógio simulado
- [ ] 4.4 T10 'A visita aconteceu?' (anfitrião + solicitante; 48h sem contestação) + não-comparecimento — aceite: contagem aparece no perfil
- [ ] 4.5 T11 Avaliar por critério (corretor→parceiro, cliente→corretor, corretor→cliente) em ~20s — aceite: 1 por pessoa por avaliado; edição em 24h
- [ ] 4.6 Publicação às cegas (ambos avaliaram ou 7 dias) — aceite: testes com relógio simulado
- [ ] 4.7 Serviço notas (peso origem × idade + bayesiana) e exibição no T4/T3/T1 — aceite: casos 0, 1, 5 avaliações e mistura de origens com valores fechados
- [ ] 4.8 Nota do cliente visível só a corretores — aceite: cliente não vê; aparece no export LGPD
- [ ] 4.9 Pendências no app (cartão no feed + selo em Conversas) — aceite: avaliação acessível sem notificação
- [ ] 4.10 Resposta pública do corretor à avaliação — aceite: editável
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Agende uma visita pelo chat, confirme no outro celular e adicione à agenda.
2. Depois do horário, confirme 'visita realizada' nos dois lados.
3. Avalie como cliente e como corretor; veja que só aparece quando ambos avaliarem.
4. Confira a nota no perfil público.
