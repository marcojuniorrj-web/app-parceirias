import * as s from './servico.js';

export const rotas = [
  { metodo: 'POST', caminho: '/auth/codigo', auth: 'nenhuma', handler: s.pedirCodigo },
  { metodo: 'POST', caminho: '/auth/entrar', auth: 'nenhuma', handler: s.entrar },
  { metodo: 'POST', caminho: '/auth/sair', auth: 'nenhuma', handler: s.sair },
  { metodo: 'POST', caminho: '/auth/sair-todos', auth: 'obrigatoria', handler: s.sairDeTodos },
  { metodo: 'GET', caminho: '/me', auth: 'opcional', handler: s.me },
  { metodo: 'PUT', caminho: '/me', auth: 'obrigatoria', handler: s.atualizarMe },
  { metodo: 'POST', caminho: '/me/perfil', auth: 'obrigatoria', handler: s.escolherPerfil },
];
