# Arquitetura — App de Corretores Parceiros

> Preenchida a partir de visao.md, usuarios.md, telas.md e dados.md. Seção 2 (boas práticas) vem do modelo.

## 1. Tecnologias escolhidas
Regra: prefira o que já usamos; o mais simples que atende o MVP. Mesma stack do Xaveco CRM / Visitas.

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Interface | HTML + CSS + JS sem framework, **PWA** (instalável, push, offline básico) | leve no celular; padrão dos outros apps |
| Servidor/API | Cloudflare Worker (JavaScript, ES modules) | custo zero no início, escala sozinho |
| Banco | Cloudflare D1 (SQLite) + migrações versionadas; bases `parceiros` e `parceiros-teste` | já usado |
| Fotos e vídeos | Cloudflare R2 + Cloudflare Images (miniaturas/WebP) | 8+ fotos por imóvel; sem custo de saída |
| Chat em tempo real | Cloudflare Durable Objects (WebSocket por conversa) | mede tempo de resposta com precisão |
| Busca e feed | Consultas no D1 com índices + tabela de score pré-calculada; busca textual FTS5 | suficiente para milhares de imóveis no RJ |
| Tarefas agendadas | Cron Triggers: recálculo do ranking (1h), lembretes, "ainda disponível?", revalidação CRECI (mensal), importação XML (diária), anonimização LGPD | |
| Filas | Cloudflare Queues (envio de WhatsApp, processamento de imagens, importação XML) | não trava a tela do usuário |
| Login | Celular + código (OTP) por WhatsApp, SMS como reserva; sessão em cookie assinado (herdado do Visitas) | sem senha |
| Pagamentos | Gateway brasileiro com Pix recorrente, cartão e boleto (**Asaas** como 1ª opção; alternativa Pagar.me) + webhooks | assinatura e plano fixo de imobiliária |
| WhatsApp | API oficial (Meta Cloud API ou provedor como Z-API/Twilio) atrás de adaptador | código de login e avisos |
| CRECI | Adaptador `creci` com fornecedor a definir (Marco); fallback = fila manual | independe do fornecedor |
| Google Agenda | OAuth do corretor + API Calendar | visitas na agenda |
| Mapas | Geocodificação (Google/Mapbox) ao publicar; mapa com localização aproximada | |
| Publicação | Workers Builds: push na `main` → `node --test` → deploy; ambiente de teste separado | testes barram erro |

**Domínio:** a definir junto com o nome (placeholder `app.<marca>.com.br`; `teste.` para homologação).

## 2. Boas práticas obrigatórias
- Separar camadas: interface → rotas/API → serviço (regra de negócio) → repositório (dados).
- Cada módulo do domínio tem sua pasta com rotas, serviço, repositório e modelos.
- Integrações externas atrás de adaptadores (trocar WhatsApp por Telegram não mexe na regra).
- Configuração e segredos só em variáveis de ambiente (`.env`, com `.env.exemplo` versionado).
- Validar toda entrada; erros com mensagem clara; logs das operações importantes.
- Dados sensíveis (CPF, renda) criptografados ou mascarados; acesso por perfil.
- Testes automáticos para regras de negócio e cálculos.
- Backups e migrações de banco versionados.

## 3. Organização interna (pastas)
```
src/
  worker.js                 # entrada: roteia para os módulos
  web/                      # interface PWA (páginas, componentes, estilos, service worker)
  modulos/
    contas/                 # login OTP, sessão, perfis (cliente, corretor, gestor, admin)
    corretores/             # cadastro, CRECI, perfil público, notas
    imobiliarias/           # equipe, convites, plano fixo
    imoveis/                # publicação, mídias, status, "ainda disponível?", importação XML
    feed/                   # ranking, personalização, busca, buscas salvas
    conversas/              # chat (Durable Object), tempo de resposta, acordo de comissão
    visitas/                # agendamento, confirmação de realizada, agenda
    avaliacoes/             # avaliação de visita e de negócio, publicação, respostas
    negocios/               # registro e confirmação de negócio fechado
    assinaturas/            # planos, teste grátis, cobrança, inadimplência
    moderacao/              # denúncias, fila de CRECI, log de auditoria
    admin/                  # métricas e configurações (pesos, preços, prazos)
    privacidade/            # exportar/apagar dados, anonimização
      (cada módulo: rotas.js · servico.js · repositorio.js · modelos.js · *.test.js)
  integracoes/              # adaptadores: whatsapp, sms, pagamento, creci, google-agenda, mapas, xml-portais, imagens
  nucleo/                   # validação, erros, logs, autenticação/permissões, config
migracoes/                  # SQL versionado do D1
testes/                     # testes de fluxo ponta a ponta
docs/app-parceiros/         # spec, plan e execucao.md
```

## 4. Modelo de dados técnico
Tabelas D1 (snake_case, `id` texto ULID, datas ISO em UTC, `criado_em`/`atualizado_em` em todas):

- `usuarios` (id, celular UNIQUE, nome, email, foto_url, tipo, status) · `sessoes` · `codigos_otp` (hash, expira_em, tentativas)
- `clientes` (usuario_id PK, perfil_interesse JSON)
- `corretores` (usuario_id PK, cpf_cifrado, cpf_hash UNIQUE, creci, uf_creci, status_creci, verificado_em, ultima_revalidacao, bio, bairros JSON, imobiliaria_id FK)
- `corretor_metricas` (corretor_id PK, nota_exibida, nota_por_criterio JSON, n_avaliacoes, tempo_medio_resposta_min, pct_atualizados, atividade_90d, score, recalculado_em) — **tabela derivada, recalculada por cron**
- `imobiliarias`, `convites`
- `imoveis` (… status, aceita_parceria, comissao_sugerida, endereco_privado, lat_aprox, lng_aprox, atualizado_em, confirmado_em, origem, codigo_externo) · índices (status, finalidade, bairro, preco) · `imoveis_fts` (FTS5)
- `midias` (imovel_id, r2_chave, tipo, ordem)
- `interacoes` (usuario_id, imovel_id, tipo, duracao_seg) — agregada diariamente em `preferencias_usuario` (bairros/faixas/tipos com peso)
- `buscas_salvas`
- `conversas` (imovel_id, tipo, participante_a, participante_b, primeira_resposta_em) · `mensagens`
- `acordos_comissao`
- `visitas` (…, status, confirmacao_a, confirmacao_b, realizada_em)
- `avaliacoes` (origem, ref_id, avaliador_id, avaliado_id, papel, notas JSON, nota_geral, texto, foto_r2, visibilidade, publicada_em, resposta, status) — UNIQUE (origem, ref_id, avaliador_id)
- `negocios` + `negocio_corretores` (negocio_id, corretor_id, papel)
- `planos`, `assinaturas` (titular_tipo, titular_id, …, gateway_id), `pagamentos`
- `denuncias`, `notificacoes`, `configuracoes` (chave PK, valor JSON), `log_auditoria`

## 5. Contrato da API
Base `/api/v1`, JSON, sessão por cookie. Perfis: V=visitante, C=cliente, K=corretor, G=gestor, A=admin.

| Operação | Rota | Quem chama | Recebe | Devolve | Regras |
|----------|------|------------|--------|---------|--------|
| Pedir código | POST /auth/codigo | V | celular | ok | limite 5/h por celular e IP |
| Entrar | POST /auth/entrar | V | celular, código | usuário, sessão | código 6 dígitos, expira em 10 min |
| Cadastro corretor | POST /corretores | C/novo | nome, cpf, creci, uf | status_creci | dispara verificação CRECI; fallback fila manual |
| Perfil de interesse | PUT /me/interesse | C,K | filtros | ok | opcional |
| Feed | GET /feed?cursor= | todos | filtros rápidos | lista de cards | ordem = score × gosto × recência; máx. 2 seguidos do mesmo corretor; só imóveis de assinantes ativos |
| Buscar | GET /imoveis?filtros | todos | filtros, mapa | lista | |
| Ver imóvel | GET /imoveis/:id | todos | — | imóvel + corretor + notas | endereço exato só p/ dono e parceiro c/ visita confirmada |
| Publicar/editar | POST/PUT /imoveis | K,G | dados + mídias | imóvel | CRECI verificado + assinatura ativa; ≥ 8 fotos |
| Confirmar disponível | POST /imoveis/:id/confirmar | dono | — | ok | renova atualizado_em |
| Upload de mídia | POST /midias | K,G | arquivo | url | URL assinada R2; compressão |
| Interação | POST /interacoes | todos (anônimo por dispositivo) | imovel, tipo, duração | ok | alimenta personalização |
| Curtir/salvar | POST /imoveis/:id/salvar | C,K | — | ok | |
| Abrir conversa | POST /conversas | C,K | imovel_id, tipo | conversa | parceria só entre corretores verificados |
| Chat | WS /conversas/:id | participantes | mensagens | mensagens | registra primeira_resposta_em |
| Acordo comissão | POST /conversas/:id/acordo | K | divisão | acordo | aceite dos dois corretores |
| Agendar visita | POST /visitas | C,K | conversa, data, local | visita | outro lado confirma; lembrete 2h antes; Google Agenda |
| Responder visita | PUT /visitas/:id | parte | confirmar/sugerir/recusar | visita | |
| Visita realizada | POST /visitas/:id/realizada | parte | sim/não + motivo | visita | 2 confirmações ou 1 sem contestação em 48h |
| Avaliar visita | POST /avaliacoes | C,K | visita_id, notas, texto | ok | janela 7 dias; 1 por pessoa; publica quando ambos ou 7 dias |
| Registrar negócio | POST /negocios | K,G | imóvel, tipo, valor, parceiros, cliente | negócio | parceiro confirma |
| Avaliar compra/locação | POST /avaliacoes (origem=negocio) | C | negocio_id, nota, depoimento | ok | 30 dias; selo "verificada" |
| Responder avaliação | POST /avaliacoes/:id/resposta | avaliado (K) | texto | ok | 1 resposta |
| Perfil público | GET /corretores/:id | todos | — | perfil, notas, avaliações públicas | nota de cliente só p/ K/G |
| Equipe | POST/DELETE /imobiliarias/:id/corretores | G | celular | convite | limite do plano |
| Assinar | POST /assinaturas | K,G | plano, meio | link/QR Pix/boleto | teste grátis = dias configurados |
| Webhook pagamento | POST /webhooks/pagamento | gateway | evento | 200 | assinatura verificada; idempotente |
| Denunciar | POST /denuncias | C,K,G | alvo, motivo | ok | |
| Moderar | PUT /admin/denuncias/:id, /admin/creci/:id | A | decisão | ok | grava log_auditoria |
| Métricas/config | GET /admin/metricas · PUT /admin/config | A | — / chaves | dados | pesos do ranking, preços, prazos |
| Meus dados | GET /me/dados · DELETE /me | todos logados | — | export / ok | anonimização em 30 dias |

## 6. Riscos e decisões
| Tema | Opções | Decisão |
|------|--------|---------|
| Verificação CRECI | Fornecedor pago (ex.: Infosimples) · leitura do site do conselho · manual | Adaptador único; começa **manual** (já funciona no dia 1) e liga o automático quando o Marco definir o fornecedor |
| Ovo e galinha (pouca oferta no início) | Teste grátis · importar carteira por XML · convidar rede Unnità | XML na 1ª entrega de imóveis + 30 dias grátis + convite por imobiliária |
| Avaliação manipulada (amigos dando 5★) | Livre · só após visita · moderação | Só após visita/negócio confirmado, média bayesiana, detecção de pares que só se avaliam entre si (alerta ao admin) |
| Retaliação entre avaliações | Publicar na hora · cego | **Cego**: publica quando os dois avaliam ou após 7 dias |
| Contato por fora do app (WhatsApp direto) | Proibir · tolerar | Contato só pelo chat; celular nunca exposto; detector simples de telefone no chat (aviso, não bloqueio) |
| Custo do WhatsApp por mensagem | WhatsApp para tudo · push + WhatsApp só no essencial | Push no app como padrão; WhatsApp para login, lembrete de visita e avaliação pendente |
| Escala do feed | Algoritmo em tempo real · score pré-calculado | Score recalculado por cron a cada hora; personalização leve na consulta |
| Gateway de pagamento | Asaas · Pagar.me · Mercado Pago | Asaas (Pix recorrente + boleto + cartão, foco em PME); trocável pelo adaptador |
| LGPD | — | CPF cifrado + hash para unicidade; endereço exato restrito; anonimização por cron; log de auditoria |
| Nome/domínio | — | Placeholder; trocar marca é configuração, não código |
| Fora do MVP | patrocínio, campanhas Google/TikTok/Meta, jurídico, repasses, lançamentos, app nas lojas | Registrar em `plan/versoes-futuras.md` no /plan; o score orgânico já nasce separado do patrocinado |

## Ajustes pós-revisão (PLAN)
- **Login:** SMS como padrão até a aprovação do template de autenticação do WhatsApp na Meta; depois WhatsApp primeiro e SMS como reserva. Iniciar a aprovação da Meta já.
- **Google Agenda:** MVP envia convite `.ics`; OAuth na v2.
- **Importação XML:** v2.
- **Todos os adaptadores** começam com versão falsa (mock) para desenvolvimento e testes.
- UNIQUE de `avaliacoes` corrigida para (origem, ref_id, avaliador_id, avaliado_id).
- Nova tabela `usuario_papeis`, `consentimentos`; `pagamentos.evento_id` UNIQUE.
