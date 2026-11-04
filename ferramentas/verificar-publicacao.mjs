// Trava de publicação: falha (saída 1) se os Termos ainda estão sem data ou se o site montado
// ainda carrega endereço de servidor. Uso: npm run build && npm run verificar-publicacao
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problemas = [];

const legal = fs.readFileSync(path.join(site, 'src', 'legal.js'), 'utf8');
const data = /export const ATUALIZADO\s*=\s*'([^']*)'/.exec(legal)?.[1];
if (data === undefined) problemas.push('src/legal.js: não achei a constante ATUALIZADO');
else if (data.includes('AAAA') || !/^\d{4}-\d{2}-\d{2}$/.test(data)) problemas.push(`src/legal.js: ATUALIZADO ainda é "${data}" (troque pela data de hoje, AAAA-MM-DD com números)`);

const proibidas = ['duckdns', 'VITE_COVIL_SERVIDOR', '/api/auth', 'covildreds'];
const dist = path.join(site, 'dist');
if (!fs.existsSync(dist)) problemas.push('dist/ não existe: rode npm run build antes');
else {
  const varrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { varrer(f); continue; }
      if (!/\.(html|js|css|svg|txt|json|map|webmanifest)$|^_headers$/.test(e.name)) continue;
      const txt = fs.readFileSync(f, 'utf8');
      for (const p of proibidas) if (txt.includes(p)) problemas.push(`${path.relative(site, f)}: contém "${p}"`);
    }
  };
  varrer(dist);
}

if (problemas.length) {
  console.error('NÃO PUBLICAR:\n' + problemas.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log(`ok: data dos termos ${data}, dist sem endereço de servidor`);
