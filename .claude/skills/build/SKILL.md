---
name: build
description: Fase 3 (BUILD) do método Spec → Plan → Build. Use após o PLAN aprovado ou quando o usuário disser "/build", "onde paramos?", "próxima onda" ou "pode construir". Constrói uma onda por vez seguindo o plano, mantém a memória de construção e entrega para o usuário testar.
---

# BUILD — o Claude constrói seguindo o plano

## Começo de toda sessão ("Onde paramos?")
1. Leia `docs/<projeto>/plan/execucao.md` (memória de construção), `indice.md` e a fase atual.
2. Diga em 2–3 linhas o que já foi feito e qual é o próximo passo, e continue de lá.

## Ciclo de cada onda
1. Leia o arquivo da fase e `spec/arquitetura.md`.
2. Para cada tarefa: implemente só ela → verifique o critério de aceite → se não passou, itere e
   ajuste → marque `[x]` → atualize `execucao.md` → faça commit.
3. Ao terminar a onda: rode o projeto/testes, mostre a evidência e entregue ao usuário o
   **roteiro de teste** da fase. Relate falhas como são.
4. **Espere o usuário testar tudo e pedir a próxima onda.** Ajuste o que ele apontar antes de seguir.
5. Atualize `indice.md` (status da fase) e `execucao.md` (onde paramos).
6. Se algo da SPEC ou do plano mudar, atualize o documento antes do código.

## Fim
Quando todas as ondas estiverem concluídas: o usuário abre no navegador e testa manualmente o app
completo; registre em `execucao.md` e resuma o que foi entregue, como usar e o que ficou para depois.
