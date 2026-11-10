# Arquitetura

> Este arquivo já vem com as boas práticas. O Claude preenche as seções marcadas com <...>
> a partir de visao.md, usuarios.md, telas.md e dados.md.

## 1. Tecnologias escolhidas
<interface / servidor / banco / hospedagem / autenticação — e por quê>
Regra: prefira o que o repositório já usa; escolha o mais simples que atende o MVP.

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
<árvore de pastas com a responsabilidade de cada uma>

## 4. Modelo de dados técnico
<tabelas/coleções derivadas de dados.md>

## 5. Contrato da API
| Operação | Rota | Quem chama | Recebe | Devolve | Regras |
|----------|------|------------|--------|---------|--------|

## 6. Riscos e decisões
| Tema | Opções | Decisão |
|------|--------|---------|
