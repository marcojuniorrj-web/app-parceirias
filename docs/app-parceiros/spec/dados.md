# Dados — App de Corretores Parceiros

## Entidades
| Entidade | Campos (tipo) | Obrigatórios | Relacionamentos |
|----------|---------------|--------------|-----------------|
| **Usuario** | id, celular (texto), nome, email, foto_url, tipo (cliente/corretor/gestor/admin), criado_em, status (ativo/suspenso/removido) | celular, nome, tipo | 1:1 Corretor ou Cliente |
| **Cliente** | usuario_id, perfil_interesse (finalidade, bairros[], preco_min/max, quartos, tipo) | usuario_id | N Favoritos, N BuscasSalvas, N Visitas |
| **Corretor** | usuario_id, cpf, creci, uf_creci, status_creci (pendente/verificado/reprovado), verificado_em, ultima_revalidacao, bio, bairros_atuacao[], imobiliaria_id?, nota_geral (dec), nota_por_criterio (json), tempo_medio_resposta_min, score_ranking | cpf, creci, uf_creci | N Imoveis; N:1 Imobiliaria |
| **Imobiliaria** | id, razao_social, nome_fantasia, cnpj, creci_juridico, gestor_id, plano_id, nota_media | cnpj, nome, gestor_id | N Corretores, 1 Assinatura |
| **Convite** | id, imobiliaria_id, celular, status, expira_em | todos | Imobiliaria |
| **Imovel** | id, corretor_id, finalidade (venda/locacao), tipo (apto, casa, sala, loja, galpão…), categoria (residencial/comercial), preco, condominio, iptu, area_m2, quartos, suites, banheiros, vagas, bairro, cidade, endereco (privado), lat/lng (aproximado no público), descricao, aceita_parceria (bool), comissao_sugerida (texto/%), status (rascunho/ativo/pausado/vendido/alugado/oculto), atualizado_em, origem (manual/xml), codigo_externo | finalidade, tipo, preco, area, bairro, ≥ **8 fotos** | N Midias, N Conversas |
| **Midia** | id, imovel_id, url, tipo (foto/video), ordem | url, tipo | Imovel |
| **Interacao** | usuario_id, imovel_id, tipo (view/curtida/salvo/compartilhar), duracao_seg, criado_em | todos | alimenta o feed |
| **BuscaSalva** | id, usuario_id, filtros (json), avisar (bool) | filtros | Usuario |
| **Conversa** | id, imovel_id, tipo (cliente/parceria), participante_a, participante_b, criada_em, primeira_resposta_em | imovel, participantes | N Mensagens, N Visitas |
| **Mensagem** | id, conversa_id, autor_id, texto, anexo_url, enviada_em, lida_em | conversa, autor | Conversa |
| **AcordoComissao** | id, conversa_id, corretor_captador, corretor_vendedor, percentual/divisao (texto), aceito_por_ambos_em | divisão, aceite dos dois | Conversa |
| **Visita** | id, conversa_id, imovel_id, solicitante_id, anfitriao_id, cliente_id?, data_hora, local, status (proposta/confirmada/realizada/nao_compareceu/cancelada), confirmacoes (json por parte) | data_hora, partes | N Avaliacoes |
| **Avaliacao** | id, origem (visita/negocio), visita_id?/negocio_id?, avaliador_id, avaliado_id, papel (corretor→parceiro / cliente→corretor / corretor→cliente / cliente→negócio), notas (json por critério 1–5), nota_geral, comentario/depoimento, foto_url?, visibilidade (publica/so_corretores), publicada_em, resposta_avaliado, status (ativa/oculta_moderacao) | notas, avaliador, avaliado | Visita ou Negocio |
| **Negocio** | id, imovel_id, tipo (venda/locacao), valor, data, corretores[] (com papel), cliente_id?, confirmado_pelo_parceiro_em | imovel, valor, tipo | 1 Avaliacao de compra/locação |
| **Plano** | id, nome, tipo (autonomo/imobiliaria), preco_mensal, limite_corretores, dias_teste, ativo | todos (definidos pelo admin) | N Assinaturas |
| **Assinatura** | id, titular (corretor ou imobiliária), plano_id, status (teste/ativa/vencida/cancelada), inicio_teste, proxima_cobranca, meio (pix/cartao/boleto), gateway_id | titular, plano | N Pagamentos |
| **Pagamento** | id, assinatura_id, valor, status, pago_em, gateway_ref | todos | Assinatura |
| **Denuncia** | id, autor_id, alvo (avaliacao/imovel/usuario), alvo_id, motivo, status, decisao, decidido_por | alvo, motivo | Admin |
| **Notificacao** | id, usuario_id, tipo, canal (app/whatsapp/push), enviada_em, lida_em | | Usuario |
| **Configuracao** | chave, valor (pesos do ranking, dias de teste, janelas de avaliação, mínimo de fotos) | | Admin |
| **LogAuditoria** | quem, acao, alvo, quando | | Admin |

## Entradas e saídas
**Entradas:** formulários do app (cadastro, imóvel, chat, visita, avaliação); **importação XML** de portais/CRM (padrão ZAP/VivaReal/OLX) com sincronização diária; consulta CRECI; webhooks do gateway de pagamento.
**Saídas:** feed e perfis; notificações (app, push, **WhatsApp**); eventos de visita no **Google Agenda**; painel do gestor; painel admin com métricas; recibos de pagamento (do gateway); exportação CSV de negócios (admin).

## Regras de negócio e cálculos
**Notas**
- Nota do critério = média simples das notas recebidas naquele critério.
- **Nota geral do corretor** = média ponderada: avaliações de **negócio verificado peso 3**, de parceiro (corretor) peso 1,5, de cliente pós-visita peso 1.
- Suavização para quem tem poucas avaliações (média bayesiana): `nota_exibida = (n·média + 5·4,0) / (n + 5)` — evita que 1 avaliação 5★ ou 1★ distorça. Selo "Novo" com < 5 avaliações.
- Avaliações dos últimos 12 meses pesam 100%; mais antigas, 50% (assumido).
- Nota do cliente: só visível a corretores; nunca entra no ranking de imóveis.
- **Nota da imobiliária** = média das notas gerais dos corretores ativos, ponderada pelo nº de avaliações.

**Publicação das avaliações**
- Visita: libera após "visita realizada" (2 confirmações, ou 1 sem contestação em 48h). Janela de 7 dias para avaliar. Publica quando ambos avaliarem ou ao fim dos 7 dias.
- Negócio: libera quando o negócio é registrado e confirmado pelo parceiro; cliente tem 30 dias para avaliar com nota + depoimento ("Compra/Locação verificada").
- Uma avaliação por pessoa por visita/negócio. Edição em até 24h.

**Tempo de resposta**
- `primeira_resposta_em – criada_em` por conversa, contando só horário comercial estendido 8h–21h (assumido). Média móvel das últimas 30 conversas.

**Score do ranking (pesos ajustáveis no admin)**
`score = 0,40·nota_norm + 0,20·resposta_norm + 0,20·atualizacao_norm + 0,20·atividade_norm`
- nota_norm = nota_exibida / 5
- resposta_norm = 1 se ≤ 15 min, decai até 0 em 24h
- atualizacao_norm = % dos imóveis confirmados nos últimos 30 dias
- atividade_norm = visitas realizadas + negócios (90 dias), normalizado entre corretores
- **Ordem do feed** = score do corretor × aderência ao gosto do usuário (perfil de interesse + interações) × recência do imóvel. Diversidade: no máx. 2 imóveis seguidos do mesmo corretor.
- Patrocínio (fase 2) entra como item marcado "Patrocinado", sem alterar o score orgânico.

**Imóveis e assinatura**
- Mínimo 8 fotos; sem confirmação "ainda disponível?" em 30 dias → aviso; em 45 dias → pausado automaticamente.
- Teste grátis: dias configuráveis (padrão 30) a partir da verificação do CRECI.
- Assinatura vencida: 3 dias de tolerância → imóveis ocultos do feed; perfil e notas mantidos.
- Preços e limites dos planos: **a definir**, configuráveis pelo admin.
- Comissão: apenas registrada (texto livre + %), o app não calcula nem retém valores.

## Integrações (sistema, direção, frequência)
| Sistema | Direção | Frequência | Uso |
|---|---|---|---|
| Gateway de pagamento (Pix recorrente, cartão, boleto — ex.: Asaas, Pagar.me, Mercado Pago) | ida e volta (webhook) | mensal + eventos | assinaturas |
| WhatsApp (API oficial via provedor) | saída | evento | código de login, lembrete de visita, nova mensagem, avaliação pendente |
| SMS | saída | evento | código de login (reserva) |
| Consulta CRECI (fornecedor a definir pelo Marco) | ida | no cadastro + mensal | verificação automática |
| XML de portais/CRMs | entrada | diária | importar carteira de imóveis |
| Google Agenda | saída | evento | visita confirmada vai para a agenda do corretor |
| Mapas (geocodificação) | ida | ao publicar | lat/lng aproximado |
| Armazenamento de mídia (fotos/vídeos) | ida | upload | compressão e miniaturas |

## Privacidade (LGPD): dados sensíveis, quem acessa, retenção
- **Sensíveis:** CPF e CRECI (só o titular e admin), celular (nunca exposto — contato só pelo chat), endereço exato do imóvel (só o dono e parceiro com visita confirmada), nota do cliente (só corretores).
- **Base legal:** execução de contrato (cadastro/assinatura) e legítimo interesse (avaliações e segurança); consentimento para WhatsApp e avisos de marketing.
- **Retenção:** conta cancelada → **anonimização após 30 dias** (avaliações viram "usuário removido"); negócios e pagamentos guardados 5 anos sem identificação pessoal (fiscal); mensagens de chat 2 anos (assumido).
- Usuário pode baixar ou apagar seus dados pelo app. Todas as ações de admin ficam no LogAuditoria.

## Ajustes pós-revisão (PLAN) — fórmulas fechadas
- **Nota da avaliação** = média simples dos critérios.
- **Nota do corretor:** `peso = peso_origem (negócio 3 · parceiro 1,5 · cliente pós-visita 1) × peso_idade (≤12 meses 1 · >12 meses 0,5)`; `média = Σ(peso·nota)/Σpeso`; `n` = nº bruto de avaliações; `nota_exibida = (n·média + 5·4,0)/(n+5)`. Selo "Novo" enquanto n < 5.
- **Avaliação de negócio** vale para **todos** os corretores do negócio.
- **Visita realizada:** confirmação de anfitrião + solicitante (ou de um deles sem contestação em 48h).
- **tempo de resposta:** só 8h–21h, todos os dias (feriados contam); conversa nunca respondida = 24h; média das últimas 30 conversas.
- `resposta_norm` = 1 até 15 min, queda linear até 0 em 24h; sem histórico = 0,5.
- `atividade_norm` = min-max sobre o p95 dos corretores.
- **Feed (MVP):** `ordem = score × aderência × recência`; aderência = 0,5 + 0,5 × proporção de filtros do perfil de interesse atendidos (1 se não há perfil); recência com meia-vida de 14 dias; máx. 2 seguidos do mesmo corretor.
- **Pesos e fórmulas versionados** em `configuracoes` (guardar versão aplicada em `corretor_metricas`).
- **Chave única de avaliação:** (origem, ref_id, avaliador_id, avaliado_id) — permite avaliar parceiro e cliente na mesma visita.
- **Campos novos:** `Interacao.dispositivo_id` (usuario opcional); `Pagamento.evento_id` UNIQUE (webhook idempotente); `Corretor.nao_comparecimentos`; `Convite.status` (pendente/aceito/expirado/cancelado); `Imovel.confirmado_em`; tabela `consentimentos` (tipo, versão, concedido_em, revogado_em); `usuario_papeis`.
- **Nomes padronizados:** `area_m2`; imobiliária `nome_fantasia`.
- **Retenção corrigida:** pagamentos guardados identificados por 5 anos (obrigação fiscal), acesso restrito ao admin; mensagens de usuário removido continuam para a outra parte como "usuário removido"; nota recebida pelo cliente aparece no export de `/me/dados` (LGPD art. 18).
- **Preço inicial:** R$ 49,90 editável pelo admin.
