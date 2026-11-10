# Visão — App de Corretores Parceiros

> Nome comercial: **a definir** (Conecta Imob indisponível; nome de trabalho: `app-parceiros`).

## Objetivo da aplicação
Plataforma de parcerias imobiliárias com reputação estilo Uber e descoberta estilo Instagram:
corretores e imobiliárias publicam imóveis, fazem parcerias entre si e atendem clientes finais;
toda visita realizada gera avaliação mútua, e quem atende melhor aparece mais no feed.

## Problema que resolve (hoje, sem o app)
- Parcerias acontecem em grupos de WhatsApp, sem histórico nem reputação: não se sabe se o colega responde rápido, se o imóvel está atualizado ou se ele facilita a visita.
- Anúncios desatualizados e informações erradas fazem cliente e corretor perderem visitas.
- O cliente final não tem como saber quais corretores atendem bem.
- Corretor bom não tem como provar sua qualidade; corretor ruim não sofre consequência.

## Métricas de sucesso
- **Principal (90 dias): negócios fechados** que nasceram de parcerias/atendimentos no app.
- Apoio: visitas realizadas e avaliadas; conversão teste grátis → assinante pago.

## Escopo do MVP
- Cadastro de corretor (com CRECI), imobiliária (conta com equipe de corretores) e cliente final (grátis).
- Publicação de imóveis: **venda de usados, locação e comercial**.
- Feed e busca estilo Instagram (fotos/vídeos, filtros), ordenado por relevância = reputação + aderência à busca.
- Pedido de parceria / contato do cliente → agendamento de visita.
- **Avaliação após visita realizada (estilo Uber), mútua:** corretor ↔ corretor e corretor ↔ cliente.
  - Critérios do parceiro: velocidade de resposta, agendamento, cordialidade, imóvel atualizado/informações corretas, facilitação da visita.
  - Critérios do cliente: atendimento; e o cliente também é avaliado (pontualidade, respeito).
  - Tempo de resposta medido automaticamente pelo app.
- Ranking/nota no perfil; nota da imobiliária = média da equipe.
- Comissão negociada diretamente entre os parceiros (o app registra o acordo, não intermedia).
- Assinatura: **30 dias grátis**, depois **R$ 49,90/mês** para publicar imóveis.
- Registro de "negócio fechado" para medir a métrica principal.

## Fica para depois
- Patrocínio de imóveis (planos de destaque pago).
- Campanhas individuais no Google, TikTok e Meta pela plataforma.
- Assessoria jurídica contratável e repasses bancários.
- Lançamentos na planta.
- App nas lojas (App Store / Google Play).
- Planos por volume de imóveis.

## Fora do escopo
- O app não intermedia nem retém comissões.
- Cliente final nunca paga.
- Não é CRM completo nem portal de construtora.

## Restrições (prazo, orçamento, ferramentas, público/interno)
- Público, lançamento na **cidade do Rio de Janeiro**.
- Formato: **web app no celular** (instalável na tela inicial).
- Sem prazo definido: construção no ritmo das ondas.
- Exigência legal a observar: LGPD (dados de clientes) e validação de CRECI (assumido).

## Ajustes pós-revisão (PLAN, aprovados pelo Marco)
- **Metas 90 dias após o lançamento:** 100 corretores verificados · 300 visitas avaliadas · **15 negócios confirmados** · 30% conversão teste→pago. Medidas no painel admin (T16).
- **Negócio válido para a meta:** registrado por um corretor e **confirmado pelo parceiro**, ou pelo cliente via avaliação de compra/locação quando não houver parceiro.
- **Piloto:** rede Unnità, 30–50 corretores convidados, 5–8 bairros (definir lista), cadastro assistido dos primeiros imóveis; meta de 300 imóveis ativos no lançamento.
- **MVP enxuto.** Saem para v2 (ver `plan/versoes-futuras.md`): importação XML, Google Agenda via OAuth (no MVP: convite `.ics`), feed que aprende por comportamento (no MVP: perfil de interesse + filtros + score), vista em mapa, modo escuro, avisos de imóvel novo/buscas salvas com aviso, plano fixo da imobiliária, detecção de pares suspeitos, foto no depoimento, revalidação mensal do CRECI, login Google.
- **Avaliação de compra/locação (peso 3)** faz parte do MVP.
- **CRECI:** verificação manual no MVP (SLA 24h); automática quando houver fornecedor.
- **Imobiliária no MVP:** perfil, vínculo da equipe, nota média e painel simples; **cada corretor paga a própria assinatura** (R$ 49,90, editável pelo admin).
