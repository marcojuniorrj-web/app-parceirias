import { raw } from './util.js';

// Ícones de traço simples (24x24). Cor vem do CSS (currentColor).
const T = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const ICONES = {
  feed: T('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
  buscar: T('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  publicar: T('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>'),
  conversas: T('<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z"/>'),
  perfil: T('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
  entrar: T('<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>'),
  salvos: T('<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/>'),
  equipe: T('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.900 2.100 6.500 5.500"/><path d="M16 4.700a3.500 3.500 0 010 6.600M18 14.800c2 .8 3.200 2.600 3.500 5.200"/>'),
  admin: T('<path d="M12 3l8 3v6c0 4.500-3.200 8-8 9-4.800-1-8-4.500-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>'),
  coracao: T('<path d="M12 21s-8-5.200-8-11a4.500 4.500 0 018-2.800A4.500 4.500 0 0120 10c0 5.800-8 11-8 11z"/>'),
  estrela: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.500l2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.300l-5.900 3.200 1.200-6.500L2.500 9.400l6.600-.9L12 2.500z"/></svg>',
  verificado: T('<path d="M5 12.500l4.500 4.500L19 7.500"/>'),
  info: T('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  alerta: T('<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/>'),
  relogio: T('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  cadeado: T('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  obra: T('<path d="M3 21h18M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/>'),
  marca: '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="12" cy="16" r="7.500" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="16" r="7.500" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="16" cy="16" r="2.200" fill="#F2A900"/></svg>',
};

export const icone = (nome) => raw(ICONES[nome] ?? '');
