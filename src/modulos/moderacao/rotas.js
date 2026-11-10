import { listarFilaCreci, decidirCreci } from './servico.js';

export const rotas = [
  { metodo: 'GET', caminho: '/admin/creci', auth: 'obrigatoria', acao: 'moderar', handler: listarFilaCreci },
  { metodo: 'PUT', caminho: '/admin/creci/:usuarioId', auth: 'obrigatoria', acao: 'moderar', handler: decidirCreci },
];
