# Fase 8 — Admin, moderação e LGPD
## Entrega
Painel admin completo (filas, denúncias, suspensão, métricas das metas de 90 dias, configurações) e direitos LGPD (baixar dados, apagar conta, consentimentos).
## Depende de
Fases 4–7
## Tarefas (prompts pequenos)
- [ ] 8.1 Migração 008: denuncias, notificacoes, consentimentos — aceite: constraints
- [ ] 8.2 Denunciar avaliação/imóvel/usuário + autor acompanha status — aceite: fluxo completo
- [ ] 8.3 T16 fila de denúncias (manter/ocultar/suspender) com log — aceite: toda ação no log_auditoria
- [ ] 8.4 T21 Conta suspensa + pedido de revisão — aceite: suspenso não publica nem conversa
- [ ] 8.5 Métricas das metas (corretores verificados, visitas avaliadas, negócios confirmados, conversão teste→pago, imóveis ativos) + funil por evento — aceite: números batem com o banco
- [ ] 8.6 Configurações: pesos do ranking, preços, prazos (com versão) — aceite: alteração registrada
- [ ] 8.7 Gestão de admins (um cria outro) — aceite: log
- [ ] 8.8 T20 Configurações do usuário: consentimento WhatsApp, baixar dados (JSON), apagar conta — aceite: export inclui nota recebida
- [ ] 8.9 Cron de anonimização (30 dias) — aceite: nenhum dado pessoal após 30 dias; avaliações como 'usuário removido'
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Denuncie uma avaliação e trate como admin.
2. Confira as métricas das metas no painel.
3. Baixe seus dados e teste apagar uma conta de teste.
