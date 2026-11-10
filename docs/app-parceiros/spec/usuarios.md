# Usuários — App de Corretores Parceiros

## Perfis
| Perfil | Quem é | Objetivo | Dispositivo/momento de uso |
|--------|--------|----------|----------------------------|
| **Visitante** | Qualquer pessoa sem login | Navegar no feed e ver imóveis | Celular, a qualquer hora |
| **Cliente** | Comprador/locatário cadastrado (grátis) | Achar imóvel, falar com corretor bem avaliado, agendar visita | Celular, à noite/fim de semana |
| **Corretor autônomo** | Corretor com CRECI, assinante | Divulgar imóveis, achar imóvel para seu cliente via parceria, ganhar reputação | Celular na rua, entre visitas |
| **Corretor de imobiliária** | Corretor vinculado a uma imobiliária | Igual ao autônomo; assinatura coberta pela imobiliária | Celular na rua |
| **Gestor da imobiliária** | Dono/gerente da imobiliária | Pagar o plano, convidar/remover corretores, acompanhar notas e imóveis da equipe | Celular e computador no escritório |
| **Administrador** | Marco + 1–2 pessoas | Aprovar CRECI, moderar denúncias e avaliações, acompanhar métricas | Computador |

Volume esperado no lançamento (assumido): centenas de corretores e milhares de clientes na cidade do RJ.

## Regras de acesso
- **Login sem senha:** celular + código por SMS/WhatsApp (Google opcional).
- **Corretor:** informa CRECI + CPF → **conferência automática** na consulta pública do CRECI/COFECI (nome, número, situação ativa) → se bater, selo "Verificado" na hora; se não bater ou a consulta falhar, vai para a fila do administrador (até 24h). Sem aprovação, não publica nem pede parceria. Revalidação automática periódica (ex.: mensal) para pegar inscrição cancelada.
  - Fonte da consulta (a validar no `/dados`/arquitetura): API de terceiro que consulta o CRECI (ex.: Infosimples) ou leitura da consulta pública do site do conselho.
- **Assinatura:** 30 dias grátis a partir da aprovação; depois R$ 49,90/mês (autônomo).
  Imobiliária paga **plano fixo** que cobre até X corretores. **Valores de todos os pacotes: a definir** (o app deve permitir o admin configurar preços sem mexer em código).
- **Inadimplente:** imóveis saem do feed; perfil, notas e conversas abertas continuam; tudo volta ao pagar.
- **Contato só pelo chat do app** (sem telefone/WhatsApp exposto) — garante medir tempo de resposta e vincular a avaliação à visita.
- **Avaliação só após visita marcada como realizada** pelas duas partes (ou confirmada por uma e não contestada em 48h — assumido). Janela para avaliar: 7 dias (assumido). Uma avaliação por visita, por lado.

## Permissões
| Ação | Visitante | Cliente | Corretor | Gestor imob. | Admin |
|------|:-:|:-:|:-:|:-:|:-:|
| Ver feed e imóveis | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver perfil e notas de corretores | ✅ | ✅ | ✅ | ✅ | ✅ |
| Favoritar / salvar busca | — | ✅ | ✅ | ✅ | — |
| Abrir chat com corretor | — | ✅ | ✅ | ✅ | — |
| Pedir parceria em imóvel de outro corretor | — | — | ✅ | ✅ | — |
| Publicar / editar / pausar os próprios imóveis | — | — | ✅* | ✅ (da equipe) | — |
| Apagar imóvel | — | — | os seus | da equipe | qualquer (moderação) |
| Agendar visita | ✅ pede | ✅ pede | ✅ pede/confirma | ✅ | — |
| Registrar acordo de comissão | — | — | ✅ (entre parceiros) | ✅ | ver |
| Registrar negócio fechado | — | — | ✅ | ✅ | ver |
| Avaliar após visita | — | ✅ (avalia corretor) | ✅ (avalia parceiro e cliente) | — | — |
| Ser avaliado | — | ✅ (nota visível só a corretores) | ✅ | nota = média da equipe | — |
| Avaliar a compra/locação (pós-negócio) | — | ✅ nota + depoimento | — | — | — |
| Responder publicamente a uma avaliação | — | — | ✅ | ✅ | — |
| Denunciar avaliação/imóvel/usuário | — | ✅ | ✅ | ✅ | trata |
| Convidar / remover corretores da equipe | — | — | — | ✅ | ✅ |
| Ver painel da equipe (notas, imóveis, negócios) | — | — | — | ✅ | ✅ (todos) |
| Pagar assinatura | — | — | ✅ (autônomo) | ✅ (plano fixo) | — |
| Aprovar CRECI, suspender usuário, remover avaliação | — | — | — | — | ✅ |

\* exige CRECI aprovado e assinatura ativa (ou teste grátis).

## Jornadas (passo a passo por perfil)

**Cliente**
1. Abre o link/app e navega no feed sem login. Ao entrar, pode (opcional, 3 toques) montar um **perfil de interesse**: comprar/alugar, bairros, faixa de preço, quartos, tipo.
   - Com ou sem perfil, o feed **aprende com o comportamento**: curtidas, imóveis salvos, tempo olhando e buscas ajustam o que aparece (estilo Instagram).
   - Quando entra imóvel novo que combina com o perfil, o cliente recebe aviso.
2. Gosta de um imóvel → toca "Falar com corretor" → faz login pelo celular.
3. Conversa no chat → pede visita com data/horário → corretor confirma.
4. Visita acontece → ambos marcam "visita realizada".
5. App pede avaliação do corretor (atendimento, pontualidade, imóvel conforme anúncio).

**Corretor (parceria)**
1. Cadastro com celular + CRECI → aguarda aprovação → recebe selo e começa os 30 dias grátis.
2. Publica imóveis (fotos/vídeo, preço, dados obrigatórios).
3. Tem um cliente procurando algo → busca no feed → encontra imóvel de outro corretor → "Pedir parceria".
4. Combina a comissão no chat → registra o acordo no app → agenda visita com o parceiro.
5. Após a visita, avalia o parceiro (velocidade de resposta, agendamento, cordialidade, imóvel atualizado, facilitação da visita) e o cliente.
6. Fechou negócio → registra "negócio fechado" (valor, parceiros envolvidos).

**Gestor da imobiliária**
1. Cria a conta da imobiliária (CNPJ, CRECI jurídico) → contrata o plano fixo.
2. Convida corretores por celular → eles entram já vinculados.
3. Acompanha no painel: notas da equipe, imóveis ativos, visitas e negócios.

**Administrador**
1. Fila de CRECI pendentes → confere → aprova/reprova.
2. Fila de denúncias → mantém, oculta avaliação ou suspende usuário.
3. Acompanha métricas: negócios fechados, visitas avaliadas, conversão do teste grátis.

## Histórias de usuário do MVP (com critério de aceite)
1. **Como cliente, quero navegar sem cadastro** — aceite: feed e detalhes do imóvel abrem sem login; ações de contato pedem login.
2. **Como corretor, quero me cadastrar com celular e CRECI** — aceite: código chega em até 1 min; CRECI válido e ativo aprova na hora; divergência vai para análise manual com status visível; notificação ao ser aprovado.
3. **Como corretor, quero publicar um imóvel** — aceite: só publica com no mínimo 8 fotos e campos obrigatórios; aparece no feed na hora; mostra "atualizado em".
4. **Como corretor, quero pedir parceria** — aceite: abre chat vinculado ao imóvel; o tempo até a primeira resposta é registrado.
5. **Como corretor ou cliente, quero agendar visita** — aceite: proposta de data/hora; o outro lado confirma ou sugere outro horário; lembrete antes.
6. **Como participante, quero avaliar após a visita** — aceite: avaliação só libera após "visita realizada"; notas de 1 a 5 por critério + comentário; uma por visita; aparece no perfil após as duas partes avaliarem ou 7 dias (evita retaliação).
7a. **Como cliente, quero um feed que entenda meu gosto** — aceite: perfil de interesse opcional; curtidas e salvos mudam a ordem do feed na próxima abertura; aviso de imóvel novo compatível.
7. **Como cliente, quero ver os melhores corretores primeiro** — aceite: ordem do feed considera nota, tempo de resposta e aderência à busca.
8. **Como corretor, quero registrar negócio fechado** — aceite: valor, imóvel e parceiro; parceiro confirma.
9. **Como gestor, quero convidar corretores e ver a nota da equipe** — aceite: convite por celular; nota da imobiliária = média ponderada da equipe.
10. **Como admin, quero aprovar CRECI e moderar denúncias** — aceite: filas com aprovar/reprovar; ações ficam registradas.
11. **Como corretor inadimplente, mantenho meu perfil** — aceite: imóveis ocultos do feed, notas preservadas, reativa ao pagar.
