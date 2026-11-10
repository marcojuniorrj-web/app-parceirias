// ULID: 48 bits de tempo + 80 bits aleatórios, em base32. Ordenável por data e sem colisão prática.
const ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function novoId(agora = Date.now()) {
  let tempo = '';
  let t = Math.floor(agora);
  for (let i = 0; i < 10; i++) {
    tempo = ALFABETO[t % 32] + tempo;
    t = Math.floor(t / 32);
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let aleatorio = '';
  for (let i = 0; i < 16; i++) aleatorio += ALFABETO[bytes[i] % 32];
  return tempo + aleatorio;
}
