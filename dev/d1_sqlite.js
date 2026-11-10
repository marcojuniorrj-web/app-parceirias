// Banco D1 "de mentira" sobre o SQLite embutido do Node (node:sqlite). Mesma interface do D1 (prepare/bind/first/all/run/batch),
// usado nos testes e no servidor de desenvolvimento. Em produção o Cloudflare D1 real assume.
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PASTA_MIGRACOES = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migracoes');

function normalizar(p) {
  if (p === undefined) throw new Error('D1: parâmetro undefined (use null)');
  return typeof p === 'boolean' ? Number(p) : p;
}

function statement(db, sql, params = []) {
  const ps = params.map(normalizar);
  return {
    bind: (...novos) => statement(db, sql, novos),
    first: async (coluna) => {
      const l = db.prepare(sql).get(...ps) ?? null;
      return l && coluna ? l[coluna] : l && { ...l };
    },
    all: async () => ({ results: db.prepare(sql).all(...ps).map((l) => ({ ...l })), success: true, meta: {} }),
    run: async () => {
      const r = db.prepare(sql).run(...ps);
      return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    },
    _sync: () => {
      const r = db.prepare(sql).run(...ps);
      return { success: true, meta: { changes: Number(r.changes) } };
    },
  };
}

export function aplicarMigracoes(db, pasta = PASTA_MIGRACOES) {
  db.exec('CREATE TABLE IF NOT EXISTS _migracoes (nome TEXT PRIMARY KEY)');
  const feitas = new Set(db.prepare('SELECT nome FROM _migracoes').all().map((l) => l.nome));
  for (const arq of readdirSync(pasta).filter((a) => a.endsWith('.sql')).sort()) {
    if (feitas.has(arq)) continue;
    db.exec('BEGIN');
    try {
      db.exec(readFileSync(path.join(pasta, arq), 'utf8'));
      db.prepare('INSERT INTO _migracoes (nome) VALUES (?)').run(arq);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw new Error(`Migração ${arq} falhou: ${e.message}`);
    }
  }
}

export function criarD1(arquivo = ':memory:', { migrar = true } = {}) {
  const db = new DatabaseSync(arquivo);
  db.exec('PRAGMA foreign_keys = ON');
  if (migrar) aplicarMigracoes(db);
  return {
    prepare: (sql) => statement(db, sql),
    // como no D1: o lote roda numa transação única (tudo ou nada)
    batch: async (stmts) => {
      db.exec('BEGIN');
      try {
        const r = stmts.map((s) => s._sync());
        db.exec('COMMIT');
        return r;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    exec: async (sql) => db.exec(sql),
    _db: db,
  };
}
