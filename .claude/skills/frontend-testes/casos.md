# O que testar sempre

Escolha os que se aplicam à tela. Cada item vira um `registrar(...)` no roteiro.

## Carregamento
- [ ] A página abre sem erro no console e sem requisição falhando (o `roteiro.js` já coleta).
- [ ] Nenhuma rolagem horizontal em 390, 768 e 1440 px (o `roteiro.js` já confere).
- [ ] O conteúdo principal aparece sem precisar rolar no celular.

## Fluxo principal (o motivo da tela existir)
Teste do começo ao fim, como o usuário faria. Exemplos no Xaveco:
- [ ] Login → painel aparece → "Sair" volta ao login.
- [ ] Corretor gira a roleta → recebe um lead → o lead aparece em "meus leads".
- [ ] Gerente abre o painel → vê o placar da equipe.
- [ ] Cadastro de imobiliária nova → conta criada com 14 dias grátis.
- [ ] Landing de lançamento → formulário de interesse enviado → mensagem de confirmação.

## Formulários
- [ ] Envio vazio → mensagem clara em cada campo obrigatório.
- [ ] Dado inválido (e-mail sem @, telefone curto, senha errada) → erro explica como resolver.
- [ ] Dado válido → sucesso visível e o dado gravado (confira recarregando a página).
- [ ] Botão não permite clique duplo gerando dois envios.

## Estados
- [ ] Vazio (sem leads, sem visitas) → tela convida à ação, não fica em branco.
- [ ] Erro do servidor → mensagem amigável, nada quebra.
- [ ] Carregando → indicador visível em ações demoradas.

## Teclado e acessibilidade básica
- [ ] Tab percorre os elementos em ordem lógica, com foco visível.
- [ ] Enter envia formulários; Esc fecha modais.
- [ ] Botões e links têm nome acessível (o `getByRole` acha pelo nome).

## Permissões
- [ ] Usuário comum não vê nem acessa o que é do gerente/dono (ex.: aba Empresas).
- [ ] Uma empresa não enxerga dados de outra.
