// Respostas, erros e leitura de requisições. Nada de regra de negócio aqui.

export class ErroHttp extends Error {
  constructor(status, codigo, mensagem, extra = {}) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.extra = extra;
  }
}

export function json(dados, { status = 200, cookies = [], headers = {} } = {}) {
  const h = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers,
  });
  for (const c of cookies) h.append('set-cookie', c);
  return new Response(JSON.stringify(dados), { status, headers: h });
}

export function respostaErro(e) {
  return json(
    { erro: { codigo: e.codigo, mensagem: e.message, ...e.extra } },
    { status: e.status },
  );
}

export function lerCookies(req) {
  const saida = {};
  for (const parte of (req.headers.get('cookie') || '').split(';')) {
    const i = parte.indexOf('=');
    if (i > 0) {
      try {
        saida[parte.slice(0, i).trim()] = decodeURIComponent(parte.slice(i + 1).trim());
      } catch {
        /* cookie malformado: ignora */
      }
    }
  }
  return saida;
}

export function montarCookie(nome, valor, { maxAgeSeg, seguro = true } = {}) {
  let c = `${nome}=${encodeURIComponent(valor)}; Path=/; HttpOnly; SameSite=Lax`;
  if (maxAgeSeg !== undefined) c += `; Max-Age=${maxAgeSeg}`;
  if (seguro) c += '; Secure';
  return c;
}

export async function lerJson(req, limiteBytes = 64 * 1024) {
  const tipo = req.headers.get('content-type') || '';
  if (!tipo.includes('application/json')) {
    throw new ErroHttp(415, 'tipo_invalido', 'Envie os dados em JSON.');
  }
  const texto = await req.text();
  if (texto.length > limiteBytes) {
    throw new ErroHttp(413, 'corpo_grande', 'Os dados enviados são grandes demais.');
  }
  let dados;
  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch {
    throw new ErroHttp(400, 'json_invalido', 'Não foi possível ler os dados enviados.');
  }
  if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new ErroHttp(400, 'json_invalido', 'Formato de dados inválido.');
  }
  return dados;
}
