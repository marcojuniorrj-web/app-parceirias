import { enviarCreci } from './servico.js';
import { ErroHttp, json } from '../../nucleo/http.js';
import { situacaoDoCorretor } from './servico.js';

export const rotas = [
  // Só quem escolheu o perfil "corretor" envia o CRECI. A verificação decide o que o corretor pode fazer.
  {
    metodo: 'POST',
    caminho: '/corretores',
    auth: 'obrigatoria',
    handler: (ctx) => {
      if (!ctx.usuario.papeis.includes('corretor')) {
        throw new ErroHttp(403, 'perfil_corretor_necessario', 'Escolha o perfil de corretor antes de enviar o CRECI.');
      }
      return enviarCreci(ctx);
    },
  },
  {
    metodo: 'GET',
    caminho: '/corretores/meu-creci',
    auth: 'obrigatoria',
    handler: async (ctx) => json({ corretor: await situacaoDoCorretor(ctx.db, ctx.usuario.id) }),
  },
];
