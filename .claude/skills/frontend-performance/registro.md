# Diário de tentativas de performance

Copie esta tabela para `PERF.md` na raiz do projeto (ou para a descrição do PR) e registre **toda**
tentativa — inclusive as revertidas. Leia o diário antes de propor uma nova ideia.

**Linha de base** — data · URL · perfil · comando
`2026-11-02 · http://localhost:8787 · celular-4g · node .claude/skills/frontend-performance/medir.js <url> 3`

| Data | Ideia | Métrica | Antes → Depois (±variação) | Veredito | Por quê |
|---|---|---|---|---|---|
| exemplo | Carregar jsPDF/xlsx só no clique de exportar | JS / LCP celular | 480 KB → 90 KB · 3,4 s → 2,1 s (±0,2) | mantido | Bibliotecas não eram usadas na abertura |
| exemplo | Pré-conectar à API | LCP celular | 2,1 s → 2,1 s (±0,2) | revertido | API já é do mesmo domínio |

Vereditos possíveis: **mantido** (melhorou além da variação, testes passando) · **revertido** (neutro,
piorou ou quebrou teste).
