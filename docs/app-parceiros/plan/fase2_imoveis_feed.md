# Fase 2 — Imóveis e feed
## Entrega
Corretor verificado publica imóvel (≥ 8 fotos); cliente vê no feed estilo Instagram, filtra, abre o detalhe, salva e vê o perfil público do corretor.
## Depende de
Fase 1
## Tarefas (prompts pequenos)
- [ ] 2.1 Migração 002: imoveis, midias, interacoes, buscas_salvas, imoveis_fts — aceite: índices de status/finalidade/bairro/preço
- [ ] 2.2 Upload de fotos/vídeo para R2 com compressão e miniaturas (adaptador imagens) — aceite: falha por foto com 'refazer'
- [ ] 2.3 T7 Publicar em 3 passos com rascunho automático e mínimo de 8 fotos — aceite: não publica com 7 fotos; finalidade e categoria separados
- [ ] 2.4 Geocodificação aproximada (adaptador mapas) — aceite: público vê só bairro/área; dono vê endereço exato
- [ ] 2.5 T1 Feed com cards (foto, preço, bairro, nota do corretor) e ordem simples (recência + perfil de interesse) — aceite: esqueleto, vazio e erro tratados
- [ ] 2.6 T2 Perfil de interesse (3 passos, pular) — aceite: feed reordena após salvar
- [ ] 2.7 T3 Detalhe do imóvel com status (indisponível, vendido, alugado) + compartilhar + denunciar — aceite: link compartilhado abre o imóvel
- [ ] 2.8 T12 Buscar com filtros completos (lista) + T13 Salvos — aceite: busca sem resultado sugere ampliar
- [ ] 2.9 T4 Perfil público (grade de imóveis, selo Novo) + T5 Meu perfil e Meus imóveis com status — aceite: dono pausa/reativa
- [ ] 2.10 Ciclo 'ainda disponível?' (aviso 30 dias, pausa 45) via cron — aceite: teste com relógio simulado
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Como corretor, publique um imóvel com 8 fotos (tente com 7 e veja o bloqueio).
2. Como cliente (outro celular), monte o perfil de interesse e veja o imóvel no feed.
3. Filtre por bairro, salve, abra o perfil do corretor.
4. Compartilhe o link pelo WhatsApp e abra em outro aparelho.
