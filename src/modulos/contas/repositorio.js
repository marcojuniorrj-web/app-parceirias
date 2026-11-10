// Só SQL. Nenhuma regra de negócio aqui.

export const usuarios = {
  porCelular: (db, celular) => db.prepare('SELECT * FROM usuarios WHERE celular = ?').bind(celular).first(),
  inserir: (db, { id, celular, agora }) =>
    db.prepare('INSERT INTO usuarios (id, celular, criado_em, atualizado_em) VALUES (?, ?, ?, ?)').bind(id, celular, agora, agora),
  atualizarNome: (db, id, nome, agora) =>
    db.prepare('UPDATE usuarios SET nome = ?, atualizado_em = ? WHERE id = ?').bind(nome, agora, id),
};

export const papeis = {
  doUsuario: async (db, id) => {
    const r = await db.prepare('SELECT papel FROM usuario_papeis WHERE usuario_id = ? ORDER BY papel').bind(id).all();
    return r.results.map((l) => l.papel);
  },
  adicionar: (db, id, papel, agora) =>
    db.prepare('INSERT OR IGNORE INTO usuario_papeis (usuario_id, papel, criado_em) VALUES (?, ?, ?)').bind(id, papel, agora),
};

export const clientes = {
  garantir: (db, id, agora) =>
    db.prepare('INSERT OR IGNORE INTO clientes (usuario_id, criado_em, atualizado_em) VALUES (?, ?, ?)').bind(id, agora, agora),
};

export const sessoes = {
  inserir: (db, { id, usuarioId, agora, expiraEm, agente }) =>
    db.prepare('INSERT INTO sessoes (id, usuario_id, criado_em, expira_em, agente) VALUES (?, ?, ?, ?, ?)').bind(id, usuarioId, agora, expiraEm, agente),
  ativa: (db, id, agora) =>
    db
      .prepare(
        `SELECT s.expira_em, u.id, u.nome, u.celular, u.status
           FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
          WHERE s.id = ? AND s.expira_em > ?`,
      )
      .bind(id, agora)
      .first(),
  renovar: (db, id, expiraEm) => db.prepare('UPDATE sessoes SET expira_em = ? WHERE id = ?').bind(expiraEm, id),
  apagar: (db, id) => db.prepare('DELETE FROM sessoes WHERE id = ?').bind(id),
  apagarTodasDoUsuario: (db, usuarioId) => db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').bind(usuarioId),
  limparExpiradas: (db, agora) => db.prepare('DELETE FROM sessoes WHERE expira_em <= ?').bind(agora),
};

export const codigos = {
  ultimo: (db, celular) =>
    db.prepare('SELECT criado_em FROM codigos_otp WHERE celular = ? ORDER BY criado_em DESC LIMIT 1').bind(celular).first(),
  contarPorCelular: async (db, celular, desde) =>
    (await db.prepare('SELECT COUNT(*) AS n FROM codigos_otp WHERE celular = ? AND criado_em > ?').bind(celular, desde).first()).n,
  contarPorIp: async (db, ipHash, desde) =>
    (await db.prepare('SELECT COUNT(*) AS n FROM codigos_otp WHERE ip_hash = ? AND criado_em > ?').bind(ipHash, desde).first()).n,
  inserir: (db, c) =>
    db
      .prepare('INSERT INTO codigos_otp (id, celular, codigo_hash, ip_hash, criado_em, expira_em) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(c.id, c.celular, c.codigoHash, c.ipHash, c.agora, c.expiraEm),
  apagar: (db, id) => db.prepare('DELETE FROM codigos_otp WHERE id = ?').bind(id),
  // o código válido é sempre o mais recente que ainda não foi usado
  vigente: (db, celular) =>
    db.prepare('SELECT * FROM codigos_otp WHERE celular = ? AND usado_em IS NULL ORDER BY criado_em DESC LIMIT 1').bind(celular).first(),
  somarTentativa: (db, id) => db.prepare('UPDATE codigos_otp SET tentativas = tentativas + 1 WHERE id = ?').bind(id),
  marcarUsado: (db, id, agora) =>
    db.prepare('UPDATE codigos_otp SET usado_em = ? WHERE id = ? AND usado_em IS NULL').bind(agora, id),
  limparAntigos: (db, antesDe) => db.prepare('DELETE FROM codigos_otp WHERE criado_em < ?').bind(antesDe),
};
