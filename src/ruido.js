// Ruído 3D (simplex, versão compacta) para a rocha da caverna, com semente fixa: a caverna é sempre a mesma.
const grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
const perm = new Uint8Array(512);
(() => {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = 1337;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
})();
const F3 = 1 / 3; const G3 = 1 / 6;

export function ruido3(x, y, z) {
  const s = (x + y + z) * F3;
  const i = Math.floor(x + s); const j = Math.floor(y + s); const k = Math.floor(z + s);
  const t = (i + j + k) * G3;
  const x0 = x - (i - t); const y0 = y - (j - t); const z0 = z - (k - t);
  let i1, j1, k1, i2, j2, k2;
  if (x0 >= y0) {
    if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
    else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
  } else if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
  else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
  else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
  const x1 = x0 - i1 + G3; const y1 = y0 - j1 + G3; const z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2 * G3; const y2 = y0 - j2 + 2 * G3; const z2 = z0 - k2 + 2 * G3;
  const x3 = x0 - 1 + 0.5; const y3 = y0 - 1 + 0.5; const z3 = z0 - 1 + 0.5;
  const ii = i & 255; const jj = j & 255; const kk = k & 255;
  const canto = (gi, cx, cy, cz) => {
    let tt = 0.6 - cx * cx - cy * cy - cz * cz;
    if (tt < 0) return 0;
    const g = grad3[gi % 12];
    tt *= tt;
    return tt * tt * (g[0] * cx + g[1] * cy + g[2] * cz);
  };
  const n0 = canto(perm[ii + perm[jj + perm[kk]]], x0, y0, z0);
  const n1 = canto(perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]], x1, y1, z1);
  const n2 = canto(perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]], x2, y2, z2);
  const n3 = canto(perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]], x3, y3, z3);
  return 32 * (n0 + n1 + n2 + n3);
}

// várias camadas (rocha com detalhe grande e pequeno)
export function fbm(x, y, z, oitavas = 4) {
  let v = 0; let a = 0.5; let f = 1;
  for (let o = 0; o < oitavas; o++) { v += a * ruido3(x * f, y * f, z * f); f *= 2.03; a *= 0.5; }
  return v;
}
