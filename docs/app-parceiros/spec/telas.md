# Telas — App de Corretores Parceiros

Uso principal: **celular** (web app instalável). Painéis de gestor/admin: computador, responsivos no celular.

## Mapa de navegação
```
Abrir app ──► [T1 Feed]  (sem login)
                 │
Menu inferior (logado):  Feed · Buscar · Publicar* · Conversas · Perfil
                 │              (*só corretor; cliente vê "Salvos" no lugar)
T1 Feed ─► T3 Imóvel ─► "Falar com corretor"/"Pedir parceria" ─► (login T6 se preciso) ─► T8 Chat
T8 Chat ─► T9 Agendar visita ─► T10 Visita realizada ─► T11 Avaliar
T3 Imóvel ─► T4 Perfil do corretor/imobiliária
Perfil (próprio) ─► T5 Meu perfil · Meus imóveis · Agenda · Negócios · Assinatura (T14)
Gestor ─► T15 Painel da imobiliária        Admin ─► T16 Painel admin
```

## Telas

### T1 · Feed
- **Perfil:** todos (visitante incluso) · **Objetivo:** descobrir imóveis como no Instagram.
- **Elementos:** topo com logo + chips de filtro rápido (Comprar/Alugar/Comercial, bairro). Cards verticais: foto/carrossel grande, preço, bairro, quartos/área, **nota do corretor (★ 4,8 · 32 avaliações)**, avatar do corretor, ♥ curtir, 🔖 salvar.
- **Ordem:** relevância = gosto do usuário (perfil de interesse + curtidas/salvos/tempo) + reputação do corretor + recência.
- **Ações:** tocar card → T3; ♥/🔖 → pede login se visitante; tocar corretor → T4.
- **Estados:** carregando = esqueleto dos cards; vazio (filtro sem resultado) = "Nada por aqui ainda. Ampliar bairro?" + botão; erro = "Sem conexão" + tentar de novo; fim do feed = sugestões de bairros vizinhos.
- **1º acesso logado (cliente):** cartão no topo "Conte o que você procura" → T2.

### T2 · Perfil de interesse (opcional)
- **Perfil:** cliente (e corretor buscando para cliente) · 3 passos com botões grandes: Comprar/Alugar → bairros (multi) → faixa de preço, quartos, tipo. "Pular" sempre visível.
- **Sucesso:** "Pronto! Seu feed já está personalizado." + ativa avisos de imóvel novo.

### T3 · Detalhe do imóvel
- **Elementos:** galeria (fotos/vídeo), preço, condomínio/IPTU, endereço aproximado (bairro + mapa sem número exato), características, descrição, "Atualizado em dd/mm", código.
  Bloco do corretor: foto, nome, selo Verificado, ★ nota geral e por critério, tempo médio de resposta, "ver perfil".
  Para corretor logado: bloco **Parceria** (aceita parceria? comissão sugerida/negociável).
- **Ações:** cliente → **Falar com corretor**; corretor → **Pedir parceria**; ♥, 🔖, compartilhar (link abre o app/feed), denunciar anúncio.
- **Estados:** imóvel pausado/vendido = faixa "Indisponível" + "ver parecidos".

### T4 · Perfil público (corretor / imobiliária)
- Avatar, nome, CRECI + selo Verificado, imobiliária (se houver), ★ geral, notas por critério (barras), tempo médio de resposta, nº de visitas e negócios fechados, grade de imóveis (estilo Instagram), avaliações com comentários e respostas; seção de destaque **Depoimentos de compra/locação verificada**. Notas de clientes **não aparecem** no perfil público do cliente para outros clientes.
- Imobiliária: nota = média da equipe, lista de corretores.
- **Vazio:** "Ainda sem avaliações" (corretor novo ganha selo "Novo" para não ser penalizado).

### T5 · Meu perfil / Menu do usuário
- Editar foto, nome, bio, bairros de atuação. Atalhos: Meus imóveis, Agenda de visitas, Parcerias e acordos, Negócios fechados, Assinatura, Configurações, Sair.
- Status do cadastro do corretor: "Verificado" / "Em análise" / "Pendente de ação".

### T6 · Entrar / Cadastro
- Celular → código SMS/WhatsApp (6 dígitos, reenviar em 60s) → "Sou cliente" ou "Sou corretor" (ou "Fui convidado pela imobiliária X" via link).
- **Corretor:** nome, CPF, CRECI → verificação automática → sucesso: "Verificado! 30 dias grátis começam agora." · divergência: "Vamos conferir manualmente em até 24h".
- **Erros:** código inválido/expirado; CRECI não encontrado (orienta corrigir ou enviar foto da carteira).

### T7 · Publicar / editar imóvel
- Passo 1 fotos/vídeo (**mín. 8 fotos**) · Passo 2 tipo (venda usado/locação/comercial), preço, área, quartos, vagas, condomínio, IPTU, endereço · Passo 3 descrição, aceita parceria (sim/não) + comissão sugerida · Revisar e publicar.
- Rascunho salvo automático. Lembrete a cada 30 dias: "Seu imóvel ainda está disponível?" (confirmar atualiza a data).
- **Bloqueios:** sem CRECI aprovado ou assinatura vencida → tela explicando + botão para T14.

### T8 · Conversas (lista + chat)
- Lista: foto do imóvel, nome, última mensagem, etiquetas (Cliente / Parceria / Visita marcada).
- Chat vinculado a um imóvel: cartão do imóvel no topo, mensagens, envio de fotos. Botões fixos: **Agendar visita**, **Registrar acordo de comissão** (só entre corretores), **Registrar negócio fechado**.
- Indicador para o corretor: "Responda em até 15 min para manter seu tempo de resposta".
- **Vazio:** "Nenhuma conversa ainda. Explore o feed."

### T9 · Agendar visita
- Escolher data e horário (sugestões), local de encontro, observação → envia proposta. Outro lado: Confirmar / Sugerir outro horário / Recusar.
- Visitas aparecem na **Agenda** (em T5) com lembrete 2h antes.

### T10 · Confirmar visita realizada
- Após o horário, as duas partes recebem: "A visita aconteceu?" Sim / Não (motivo: não compareceu, remarcada, cancelada). Não-comparecimento conta no perfil.

### T11 · Avaliar
- **Estrelas por critério (1–5) + comentário opcional, ~20 segundos.**
  - Corretor avalia parceiro: velocidade de resposta · agendamento · cordialidade · imóvel atualizado e informações corretas · facilitou a visita.
  - Cliente avalia corretor: atendimento · pontualidade · imóvel conforme anúncio · cordialidade.
  - Corretor avalia cliente: pontualidade · respeito · interesse real. **Visível só para corretores** (cliente não vê a própria nota nem a de outros clientes).
- Avaliações ficam ocultas até os dois lados avaliarem ou 7 dias.
- **Sucesso:** "Obrigado! Sua avaliação fortalece a rede."

### T11b · Avaliar a compra/locação (pós-negócio, estilo Shopee/Mercado Livre)
- Disparada quando o negócio fechado é registrado e confirmado pelo corretor.
- Cliente dá **nota geral (1–5 ★) + depoimento escrito** (opcional: foto do novo lar, com consentimento).
- Aparece no perfil do corretor em destaque como **"Compra verificada"** / **"Locação verificada"**, separada das avaliações de visita — pesa mais no ranking.
- Corretor pode responder publicamente.

### T12 · Buscar
- Barra de busca + filtros completos (finalidade, tipo, bairro, preço, quartos, vagas, área, aceita parceria) · alternar lista/mapa · salvar busca (gera avisos).

### T13 · Salvos (cliente) / Notificações
- Imóveis salvos e buscas salvas. Notificações: nova mensagem, visita, avaliação pendente, imóvel novo compatível, CRECI aprovado, assinatura.

### T14 · Assinatura
- Status (teste grátis: X dias restantes / ativa / vencida), plano, valor (configurado pelo admin), forma de pagamento, histórico. Vencida: "Seus imóveis estão ocultos. Reative para voltar ao feed."

### T15 · Painel da imobiliária (gestor)
- Equipe (convidar por celular, remover), nota média e ranking interno, imóveis ativos por corretor, visitas e negócios do mês, plano fixo e uso (X de Y corretores).

### T16 · Painel admin
- Filas: CRECI em análise · denúncias (avaliação, imóvel, usuário) com manter/ocultar/suspender.
- Métricas: **negócios fechados**, visitas avaliadas, novos corretores, conversão teste→pago, imóveis ativos.
- Configurações: preços dos planos, dias de teste grátis, pesos do ranking.

## Identidade visual (marca, cores, tom de voz)
- **Nome:** a definir (placeholder no app).
- **Estilo:** moderno e limpo, foco nas fotos dos imóveis (fundo claro, interface discreta). Modo escuro suportado.
- **Paleta provisória (assumido):** primária azul-petróleo (confiança) · destaque âmbar/dourado para estrelas e selos · neutros cinza-quente · verde para "Verificado"/confirmações · vermelho só para erros.
- **Tipografia (assumido):** sans-serif geométrica (ex.: Inter / Plus Jakarta Sans).
- **Tom de voz:** próximo, direto e respeitoso, em português do Brasil. Fala "você", sem jargão técnico, valoriza o corretor ("sua reputação", "sua rede").
- **Referências:** Instagram (feed/perfil), Uber (avaliação pós-serviço), QuintoAndar (detalhe do imóvel).
