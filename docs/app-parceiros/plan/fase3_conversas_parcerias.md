# Fase 3 — Conversas e parcerias
## Entrega
Cliente fala com o corretor e corretor pede parceria pelo chat em tempo real; corretores registram o acordo de comissão; o app mede o tempo de resposta.
## Depende de
Fase 2
## Tarefas (prompts pequenos)
- [ ] 3.1 Migração 003: conversas, mensagens, acordos_comissao — aceite: constraints testadas
- [ ] 3.2 Chat em tempo real (Durable Object) com envio de fotos e fila offline — aceite: mensagem chega em < 2s; 'enviando…' sem sinal
- [ ] 3.3 T8 lista de conversas com etiquetas (Cliente/Parceria/Visita) e não lidas — aceite: vazio orienta explorar o feed
- [ ] 3.4 Pedir parceria só entre corretores verificados; bloco Parceria no T3 — aceite: cliente não vê bloco de parceria
- [ ] 3.5 Serviço tempo_resposta (8h–21h, últimas 30, sem resposta = 24h) — aceite: testes cruzando noite e fim de semana
- [ ] 3.6 T17 Acordo de comissão com aceite do parceiro e contestação — aceite: só vale com aceite dos dois
- [ ] 3.7 Notificação push de nova mensagem (Web Push) + selo no menu — aceite: chega com app fechado
- [ ] 3.8 Aviso de telefone digitado no chat (não bloqueia) — aceite: aviso aparece ao digitar um número de celular
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Como cliente, toque 'Falar com corretor' e envie mensagem; responda como corretor e veja o tempo de resposta no perfil.
2. Como outro corretor, peça parceria e registre um acordo; aceite pelo dono do imóvel.
