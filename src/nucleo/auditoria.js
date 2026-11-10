import { novoId } from './id.js';

// Toda ação sensível (aprovar CRECI, suspender, etc.) deixa rastro. Devolve o statement para entrar num batch.
export function registrarAuditoria(db, { quem, acao, alvo = null, detalhes = null, quando }) {
  return db
    .prepare('INSERT INTO log_auditoria (id, quem, acao, alvo, detalhes, quando) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(novoId(Date.parse(quando)), quem, acao, alvo, detalhes ? JSON.stringify(detalhes) : null, quando);
}
