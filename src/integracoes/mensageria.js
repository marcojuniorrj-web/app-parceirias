// Adaptador de mensagens (SMS / WhatsApp). A regra de negócio só conhece `enviar`;
// trocar de provedor na Fase 9 não mexe em nenhum serviço.
//
// Contrato: enviar({ canal: 'sms' | 'whatsapp', para: '5521999990000', texto }) → Promise<void>

// Versão falsa: guarda o que "enviou" numa caixa de saída para testes e para o ambiente de desenvolvimento.
export const caixaDeSaida = [];

export function criarMensageriaFalsa() {
  return {
    nome: 'falsa',
    async enviar(msg) {
      caixaDeSaida.push({ ...msg, enviadaEm: new Date().toISOString() });
    },
  };
}

export function criarMensageria(env) {
  // gancho só para testes: um adaptador injetado (ex.: que falha) — ignorado em produção
  if (env.MENSAGERIA_INJETADA && env.AMBIENTE !== 'producao') return env.MENSAGERIA_INJETADA;
  if (env.MENSAGERIA === 'falsa') {
    if (env.AMBIENTE === 'producao') {
      // Em produção a mensageria falsa nunca entregaria o código: melhor falhar alto do que deixar o login quebrado em silêncio.
      throw new Error('MENSAGERIA=falsa não é permitida em AMBIENTE=producao.');
    }
    return criarMensageriaFalsa();
  }
  // Fase 9: provedor real de SMS e WhatsApp oficial entram aqui.
  throw new Error(`Mensageria "${env.MENSAGERIA}" ainda não implementada.`);
}
