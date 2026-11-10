# Checklist antes de entregar

Marque cada item e relate o que não passou. Não anuncie o checklist como argumento de venda — é o piso.

## Responsivo
- [ ] Testado em 390, 768 e 1440 px (screenshot de cada).
- [ ] Sem rolagem horizontal em nenhuma largura; margem lateral de pelo menos 16 px no celular.
- [ ] Hero cabe na primeira tela do celular com o chamado principal visível.
- [ ] Texto de botão não quebra em duas linhas; botões com área de toque de pelo menos 44 px.
- [ ] Imagens não distorcem nem estouram o contêiner.

## Acessibilidade
- [ ] Contraste de texto de pelo menos 4,5:1 (3:1 para texto grande e ícones).
- [ ] Foco de teclado visível em todo elemento clicável; ordem do Tab faz sentido.
- [ ] `prefers-reduced-motion` respeitado: animações não essenciais desligam.
- [ ] Imagens com `alt` útil; ícones sozinhos com rótulo acessível.
- [ ] Formulários com `label` ligado ao campo e mensagens de erro claras.

## Consistência
- [ ] Cores vindas só da paleta do plano (sem hex soltos no meio do CSS).
- [ ] Escala tipográfica respeitada; no máximo duas famílias de fonte.
- [ ] Hierarquia de camadas (`z-index`) organizada: menus e modais sempre por cima.
- [ ] Estados cobertos: hover, foco, ativo, desabilitado, carregando, vazio, erro.
- [ ] Marca do cliente (cores, logo) preservada.

## Conteúdo
- [ ] Cada botão diz o que acontece; mesmo nome do começo ao fim do fluxo.
- [ ] Nenhum dado, depoimento ou logo inventado apresentado como real.
- [ ] Revisão contra `anti-padroes.md` feita e as trocas registradas.

## Movimento
- [ ] Cada animação tem motivo (chamar atenção ou mostrar o que mudou).
- [ ] No máximo um momento orquestrado de entrada.
