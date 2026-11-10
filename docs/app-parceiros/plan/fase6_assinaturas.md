# Fase 6 — Assinaturas e cobrança
## Entrega
Teste grátis de 30 dias, assinatura de R$ 49,90 por Pix recorrente, cartão ou boleto, tolerância de 3 dias e reativação; admin edita preço e dias de teste.
## Depende de
Fase 1 (pode andar em paralelo às Fases 3–5)
## Tarefas (prompts pequenos)
- [ ] 6.1 Migração 006: planos, assinaturas, pagamentos (evento_id UNIQUE) — aceite: constraints
- [ ] 6.2 Adaptador de pagamento (Asaas) com versão falsa — aceite: trocar fornecedor não muda serviços
- [ ] 6.3 T14 Assinatura com todos os estados (teste, ativa, vence em X, tolerância, vencida, Pix aguardando, recusado) — aceite: cada estado com mensagem e ação
- [ ] 6.4 Assinar por Pix recorrente, cartão e boleto — aceite: em ambiente de teste do gateway
- [ ] 6.5 Webhook idempotente com assinatura verificada — aceite: mesmo evento 2× gera 1 efeito
- [ ] 6.6 Cron de vencimento: tolerância 3 dias → imóveis ocultos; perfil e notas mantidos; reativa ao pagar — aceite: teste com relógio simulado
- [ ] 6.7 Admin edita preço e dias de teste (configuracoes) — aceite: novo valor vale para novas cobranças
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Como corretor recém-aprovado, veja o contador do teste grátis.
2. Assine com Pix no ambiente de teste e veja 'ativa'.
3. Simule vencimento e confira que os imóveis saem do feed e voltam ao pagar.
