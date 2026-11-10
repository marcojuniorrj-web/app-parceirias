// Menu inferior por perfil (telas.md). Função pura: o teste confere cada perfil sem abrir navegador.
const ITENS = {
  feed: { id: 'feed', rotulo: 'Feed', rota: '/feed', icone: 'feed' },
  buscar: { id: 'buscar', rotulo: 'Buscar', rota: '/buscar', icone: 'buscar' },
  salvos: { id: 'salvos', rotulo: 'Salvos', rota: '/salvos', icone: 'salvos' },
  publicar: { id: 'publicar', rotulo: 'Publicar', rota: '/publicar', icone: 'publicar' },
  conversas: { id: 'conversas', rotulo: 'Conversas', rota: '/conversas', icone: 'conversas' },
  equipe: { id: 'equipe', rotulo: 'Equipe', rota: '/equipe', icone: 'equipe' },
  perfil: { id: 'perfil', rotulo: 'Perfil', rota: '/perfil', icone: 'perfil' },
  entrar: { id: 'entrar', rotulo: 'Entrar', rota: '/entrar', icone: 'entrar' },
  admin: { id: 'admin', rotulo: 'Admin', rota: '/admin', icone: 'admin' },
};
const ordem = (...ids) => ids.map((i) => ITENS[i]);

export function menuPara(me) {
  const papeis = me?.papeis ?? [];
  if (!me?.usuario) return ordem('feed', 'buscar', 'salvos', 'conversas', 'entrar'); // visitante
  if (papeis.includes('gestor')) return ordem('feed', 'buscar', 'publicar', 'conversas', 'equipe', 'perfil');
  if (papeis.includes('corretor')) return ordem('feed', 'buscar', 'publicar', 'conversas', 'perfil');
  if (papeis.includes('admin') && !papeis.includes('cliente')) return ordem('admin', 'feed', 'perfil');
  return ordem('feed', 'buscar', 'salvos', 'conversas', 'perfil'); // cliente (e logado ainda sem perfil)
}
