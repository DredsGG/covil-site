// Pix do botão "Apoiar ♥" (regra 16): BR Code estático montado aqui, sem internet. Dados só de apoio.md do vault.
export const APOIO = {
  sponsors: 'https://github.com/sponsors/DredsGG',
  chave: 'fa525dad-afca-4683-845d-eee7225a53e3',
  nome: 'Andre Miller Fleck', // sem acento, até 25
  cidade: 'Sao Paulo', // sem acento, até 15
};

const campo = (id, v) => id + String(v.length).padStart(2, '0') + v;

// CRC16-CCITT-FALSE: polinômio 0x1021, começa em 0xFFFF
export function crc16(s) {
  let crc = 0xffff;
  for (const b of new TextEncoder().encode(s)) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// "12,50", "10", 25 → "12.50"; vazio → null (valor livre); fora de R$ 1 a R$ 10.000 → NaN
export function valorPix(v) {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(String(v).trim().replace(/\s|R\$/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n < 1 || n > 10000) return NaN;
  return n.toFixed(2);
}

export function brCode(valor = null, d = APOIO) {
  const v = valorPix(valor);
  const corpo = campo('00', '01')
    + campo('26', campo('00', 'br.gov.bcb.pix') + campo('01', d.chave))
    + campo('52', '0000') + campo('53', '986')
    + (v && v === v ? campo('54', v) : '')
    + campo('58', 'BR') + campo('59', d.nome) + campo('60', d.cidade)
    + campo('62', campo('05', '***'))
    + '6304';
  return corpo + crc16(corpo);
}
