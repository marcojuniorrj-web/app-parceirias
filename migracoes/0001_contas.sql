-- Fase 1: contas, papéis, login por código, sessões, corretores (CRECI), configuração e auditoria.
CREATE TABLE usuarios (
  id            TEXT PRIMARY KEY,
  celular       TEXT NOT NULL UNIQUE,
  nome          TEXT,
  email         TEXT,
  foto_url      TEXT,
  status        TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','suspenso','removido')),
  criado_em     TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);

-- um usuário pode ter vários papéis (ex.: cliente + corretor)
CREATE TABLE usuario_papeis (
  usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  papel      TEXT NOT NULL CHECK (papel IN ('cliente','corretor','gestor','admin')),
  criado_em  TEXT NOT NULL,
  PRIMARY KEY (usuario_id, papel)
);

-- id = HMAC do token (o token em si só existe no cookie do usuário)
CREATE TABLE sessoes (
  id            TEXT PRIMARY KEY,
  usuario_id    TEXT NOT NULL REFERENCES usuarios(id),
  criado_em     TEXT NOT NULL,
  expira_em     TEXT NOT NULL,
  agente        TEXT
);
CREATE INDEX idx_sessoes_usuario ON sessoes(usuario_id);

CREATE TABLE codigos_otp (
  id          TEXT PRIMARY KEY,
  celular     TEXT NOT NULL,
  codigo_hash TEXT NOT NULL,
  ip_hash     TEXT,
  criado_em   TEXT NOT NULL,
  expira_em   TEXT NOT NULL,
  tentativas  INTEGER NOT NULL DEFAULT 0,
  usado_em    TEXT
);
CREATE INDEX idx_otp_celular ON codigos_otp(celular, criado_em);
CREATE INDEX idx_otp_ip ON codigos_otp(ip_hash, criado_em);

CREATE TABLE clientes (
  usuario_id       TEXT PRIMARY KEY REFERENCES usuarios(id),
  perfil_interesse TEXT,
  criado_em        TEXT NOT NULL,
  atualizado_em    TEXT NOT NULL
);

CREATE TABLE corretores (
  usuario_id         TEXT PRIMARY KEY REFERENCES usuarios(id),
  cpf_cifrado        TEXT NOT NULL,
  cpf_hash           TEXT NOT NULL UNIQUE,
  creci              TEXT NOT NULL,
  uf_creci           TEXT NOT NULL,
  status_creci       TEXT NOT NULL DEFAULT 'pendente' CHECK (status_creci IN ('pendente','verificado','reprovado','bloqueado')),
  tentativas_creci   INTEGER NOT NULL DEFAULT 1,
  motivo_reprovacao  TEXT,
  enviado_em         TEXT NOT NULL,
  verificado_em      TEXT,
  teste_gratis_inicio TEXT,
  teste_gratis_fim    TEXT,
  ultima_revalidacao TEXT,
  bio                TEXT,
  bairros            TEXT,
  imobiliaria_id     TEXT,
  criado_em          TEXT NOT NULL,
  atualizado_em      TEXT NOT NULL
);
-- o mesmo CRECI não pode estar ativo em duas contas (reprovado libera o número)
CREATE UNIQUE INDEX uq_corretor_creci_ativo ON corretores(uf_creci, creci) WHERE status_creci IN ('pendente','verificado');
CREATE INDEX idx_corretores_status ON corretores(status_creci, enviado_em);

CREATE TABLE configuracoes (
  chave         TEXT PRIMARY KEY,
  valor         TEXT NOT NULL,
  versao        INTEGER NOT NULL DEFAULT 1,
  atualizado_em TEXT NOT NULL
);
INSERT INTO configuracoes (chave, valor, atualizado_em) VALUES
  ('dias_teste_gratis', '30', '2026-11-10T00:00:00.000Z'),
  ('max_tentativas_creci', '3', '2026-11-10T00:00:00.000Z');

CREATE TABLE log_auditoria (
  id       TEXT PRIMARY KEY,
  quem     TEXT,
  acao     TEXT NOT NULL,
  alvo     TEXT,
  detalhes TEXT,
  quando   TEXT NOT NULL
);
CREATE INDEX idx_auditoria_quando ON log_auditoria(quando);

-- Fase 1: guarda os ♥ dos imóveis de exemplo; na Fase 2 passa a apontar para imóveis reais.
CREATE TABLE favoritos (
  usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  item_id    TEXT NOT NULL,
  criado_em  TEXT NOT NULL,
  PRIMARY KEY (usuario_id, item_id)
);
