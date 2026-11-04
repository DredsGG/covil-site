// Prints do site em várias posições da rolagem (PC e celular). Uso: node site/ferramentas/olhar.mjs <dist> <saída> [larg] [alt]
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [dist, saida, W = '1440', H = '900', nome = 'pc'] = process.argv.slice(2);
fs.mkdirSync(saida, { recursive: true });
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  let f = path.join(dist, decodeURIComponent(new URL(q.url, 'http://x').pathname));
  if (f.endsWith('/')) f += 'index.html';
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const porta = srv.address().port;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1, locale: process.env.LOCALE || 'pt-BR' });
await ctx.route('https://api.github.com/**', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tag_name: 'v0.7.4', html_url: 'https://github.com/DredsGG/covil/releases/tag/v0.7.4', assets: [{ name: 'Covil-Setup-0.7.4.exe', size: 113298312, browser_download_url: 'https://github.com/DredsGG/covil/releases/download/v0.7.4/Covil-Setup-0.7.4.exe' }] }) }));
const p = await ctx.newPage();
const erros = [];
p.on('pageerror', (e) => erros.push(e.message));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') erros.push(m.text()); });
await p.goto(`http://localhost:${porta}/`);
await p.waitForFunction(() => window.__covilSite || document.body.classList.contains('sem-3d'), null, { timeout: 30000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__covilParado = true; window.__covilSite?.desligar(); });
const pontos = (process.env.PONTOS || '0,0.2,0.4,0.55,0.75,1').split(',').map(Number);
for (const fr of pontos) {
  await p.evaluate((fr) => { const h = document.querySelector('.historia'); const fim = h.offsetTop + h.offsetHeight - innerHeight; window.scrollTo(0, fim * fr); }, fr);
  await p.waitForTimeout(900);
  await p.evaluate((fr) => { window.__covilSite?.irPara(fr); }, fr);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(saida, `${nome}-${String(fr).replace('.', '_')}.png`) });
}
for (const id of (process.env.SECOES || 'conta,baixar').split(',')) {
  await p.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(saida, `${nome}-${id}.png`) });
}
console.log(JSON.stringify(await p.evaluate(() => window.__covilSite?.estado())), erros.slice(0, 8));
await b.close(); srv.close();
