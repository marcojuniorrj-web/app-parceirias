# Fase 7 — Imobiliárias
## Entrega
Imobiliária se cadastra, convida corretores por celular, vê painel simples da equipe e tem nota média no perfil público.
## Depende de
Fases 2 e 4
## Tarefas (prompts pequenos)
- [ ] 7.1 Migração 007: imobiliarias, convites — aceite: constraints
- [ ] 7.2 T19 Cadastro da imobiliária (CNPJ, CRECI jurídico) + verificação manual — aceite: fila no admin
- [ ] 7.3 Convites por celular (status, expiração) e vínculo automático no login — aceite: convidado entra já vinculado
- [ ] 7.4 Remover corretor (notas ficam com ele, imóveis pausados, 7 dias para assinar) — aceite: teste
- [ ] 7.5 T15 Painel simples: equipe, notas, imóveis ativos, visitas e negócios do mês — aceite: responsivo sem rolagem lateral
- [ ] 7.6 Nota da imobiliária (média ponderada pelo nº de avaliações) no perfil público — aceite: teste de cálculo
- [ ] 7.7 Gestor confirma 'ainda disponível' e edita imóveis da equipe — aceite: permissões testadas
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Cadastre uma imobiliária, convide um corretor e entre com o celular dele.
2. Veja o painel da equipe e a nota média no perfil público.
3. Remova o corretor e confira que os imóveis foram pausados.
