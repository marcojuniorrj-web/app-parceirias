# Fase 1 — Esqueleto e login
## Entrega
App instalável no celular: abrir o feed (vazio com exemplo), entrar com celular + código, escolher perfil (cliente/corretor/imobiliária/convite), cadastrar CRECI e ver o status; admin aprova CRECI numa fila.
## Depende de
nada
## Tarefas (prompts pequenos)
- [x] 1.1a Projeto Worker + D1 + rotas base + `node --test` ligado ao deploy (`[build]` do wrangler) — aceite: servidor local abre e 113 testes passam
- [ ] 1.1b Publicar em ambiente de teste (criar banco D1 `parceiros-teste`, segredo `SEGREDO_APP`, endereço de teste) — aceite: página abre no endereço de teste; **pendente: precisa da conta Cloudflare/domínio (decisão do Marco)**. R2 fica para a Fase 2
- [x] 1.2 Design system base (cores, tipografia, botões, cartões, esqueleto, toast) + componentes de estado (vazio/erro/sucesso/bloqueio) — aceite: página de amostra legível em 360px, contraste AA
- [x] 1.3 Shell PWA: manifest, service worker, menu inferior por perfil — aceite: manifest/ícones/service worker verificados no Chromium; cada perfil vê o menu certo (testado). **Instalação em Android e iOS reais: Marco confirma no roteiro de teste**
- [x] 1.4 Migração 001: usuarios, usuario_papeis, sessoes, codigos_otp, clientes, corretores (cpf cifrado + hash), configuracoes, log_auditoria — aceite: CPF repetido é recusado
- [x] 1.5 Adaptador SMS/WhatsApp com versão falsa + login OTP (6 dígitos, 10 min, 5/h, reenviar 60s) e sessão 30 dias — aceite: erros de código inválido/expirado; sair de todos os aparelhos
- [x] 1.6 Primeiro acesso: escolha de perfil + login com retorno à ação de origem — aceite: ♥ feito como visitante fica salvo após entrar
- [x] 1.7 Permissões centrais no `nucleo/` a partir da matriz de usuarios.md — aceite: um teste por linha da matriz; 403 com mensagem clara
- [x] 1.8 Cadastro de corretor (nome, CPF, CRECI, UF) + status em T5 + reenvio até 3x + T21 bloqueio — aceite: corretor 'em análise' não publica
- [x] 1.9 Admin seed + fila de CRECI em T16 (aprovar/reprovar com log) + aviso de aprovação — aceite: aprovado ganha selo e inicia teste grátis (data gravada)
- [x] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Abra o link no celular e instale na tela inicial.
2. Toque ♥ num imóvel de exemplo → entre com seu celular → confira que voltou com o ♥ salvo.
3. Cadastre-se como corretor com CRECI.
4. Entre como admin, aprove o CRECI e veja o selo 'Verificado' no seu perfil.
