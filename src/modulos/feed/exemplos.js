// Imóveis de EXEMPLO da Fase 1 (o feed real chega na Fase 2). Dados fictícios, claramente marcados como exemplo.
export const IMOVEIS_EXEMPLO = [
  { id: 'ex-1', finalidade: 'venda', preco: 1250000, bairro: 'Recreio dos Bandeirantes', quartos: 3, area_m2: 98, cor: 1,
    corretor: { nome: 'Corretor Exemplo A', nota: 4.8, avaliacoes: 32, verificado: true } },
  { id: 'ex-2', finalidade: 'locacao', preco: 4800, bairro: 'Barra da Tijuca', quartos: 2, area_m2: 74, cor: 2,
    corretor: { nome: 'Corretora Exemplo B', nota: 4.6, avaliacoes: 18, verificado: true } },
  { id: 'ex-3', finalidade: 'venda', preco: 780000, bairro: 'Tijuca', quartos: 2, area_m2: 66, cor: 3,
    corretor: { nome: 'Corretor Exemplo C', nota: 4.9, avaliacoes: 54, verificado: true } },
  { id: 'ex-4', finalidade: 'venda', preco: 2100000, bairro: 'Jardim Oceânico', quartos: 4, area_m2: 160, cor: 4,
    corretor: { nome: 'Corretora Exemplo D', nota: 4.7, avaliacoes: 12, verificado: true } },
  { id: 'ex-5', finalidade: 'locacao', preco: 3200, bairro: 'Botafogo', quartos: 1, area_m2: 48, cor: 5,
    corretor: { nome: 'Corretor Exemplo E', nota: null, avaliacoes: 0, verificado: true } },
].map((i) => ({ ...i, exemplo: true }));

export const IDS_EXEMPLO = new Set(IMOVEIS_EXEMPLO.map((i) => i.id));
