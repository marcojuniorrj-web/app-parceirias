# Fase 1 — Esqueleto e login
## Entrega
App instalável no celular: abrir o feed (vazio com exemplo), entrar com celular + código, escolher perfil (cliente/corretor/imobiliária/convite), cadastrar CRECI e ver o status; admin aprova CRECI numa fila.
## Depende de
nada
## Tarefas (prompts pequenos)
- [ ] 1.1 Projeto Worker + D1 (`parceiros`/`parceiros-teste`) + R2, rotas base, `node --test` e publicação automática — aceite: página abre em teste.<domínio>; teste de exemplo passa no deploy
- [ ] 1.2 Design system base (cores, tipografia, botões, cartões, esqueleto, toast) + componentes de estado (vazio/erro/sucesso/bloqueio) — aceite: página de amostra legível em 360px, contraste AA
- [ ] 1.3 Shell PWA: manifest, service worker, menu inferior por perfil — aceite: instala no Android e iOS; cada perfil vê o menu certo
- [ ] 1.4 Migração 001: usuarios, usuario_papeis, sessoes, codigos_otp, clientes, corretores (cpf cifrado + hash), configuracoes, log_auditoria — aceite: CPF repetido é recusado
- [ ] 1.5 Adaptador SMS/WhatsApp com versão falsa + login OTP (6 dígitos, 10 min, 5/h, reenviar 60s) e sessão 30 dias — aceite: erros de código inválido/expirado; sair de todos os aparelhos
- [ ] 1.6 Primeiro acesso: escolha de perfil + login com retorno à ação de origem — aceite: ♥ feito como visitante fica salvo após entrar
- [ ] 1.7 Permissões centrais no `nucleo/` a partir da matriz de usuarios.md — aceite: um teste por linha da matriz; 403 com mensagem clara
- [ ] 1.8 Cadastro de corretor (nome, CPF, CRECI, UF) + status em T5 + reenvio até 3x + T21 bloqueio — aceite: corretor 'em análise' não publica
- [ ] 1.9 Admin seed + fila de CRECI em T16 (aprovar/reprovar com log) + aviso de aprovação — aceite: aprovado ganha selo e inicia teste grátis (data gravada)
- [ ] Estados padrão (carregando/vazio/erro/sucesso/bloqueio) em todas as telas desta fase — aceite: revisão visual no celular
## Como testar (roteiro para o usuário)
1. Abra o link no celular e instale na tela inicial.
2. Toque ♥ num imóvel de exemplo → entre com seu celular → confira que voltou com o ♥ salvo.
3. Cadastre-se como corretor com CRECI.
4. Entre como admin, aprove o CRECI e veja o selo 'Verificado' no seu perfil.
