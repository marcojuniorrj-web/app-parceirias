// Cliente da API. Erros viram ApiErro com mensagem pronta para mostrar ao usuário.
export class ApiErro extends Error {
  constructor(status, codigo, mensagem, dados = {}) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.dados = dados;
  }
}

async function chamar(metodo, caminho, corpo) {
  let resp;
  try {
    resp = await fetch(`/api/v1${caminho}`, {
      method: metodo,
      credentials: 'same-origin',
      headers: corpo !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiErro(0, 'sem_conexao', 'Sem conexão. Confira sua internet e tente de novo.');
  }
  let dados = null;
  try { dados = await resp.json(); } catch { /* sem corpo */ }
  if (!resp.ok) {
    const e = dados?.erro ?? {};
    throw new ApiErro(resp.status, e.codigo ?? 'erro', e.mensagem ?? 'Algo deu errado. Tente de novo.', e);
  }
  return dados;
}

export const api = {
  get: (c) => chamar('GET', c),
  post: (c, b = {}) => chamar('POST', c, b),
  put: (c, b = {}) => chamar('PUT', c, b),
  del: (c) => chamar('DELETE', c),
};
