// Links dentro dos textos de src/i18n.js: "[texto](endereço)". Só aceita https://, mailto:, ./ e /.
// Usado no navegador (monta nós, nunca innerHTML) e no build (vite.config.js grava o português no HTML).
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const permitido = (h) => /^(https:\/\/|mailto:|\.\/|\/(?!\/))/.test(h); // "//host" não vale: seria link para outro site
const externo = (h) => /^https:\/\/(?!covil\.app(\/|$))/.test(h);

export function partes(texto) {
  const saida = []; let i = 0; let m;
  LINK.lastIndex = 0;
  while ((m = LINK.exec(texto))) {
    if (m.index > i) saida.push({ t: texto.slice(i, m.index) });
    saida.push(permitido(m[2]) ? { t: m[1], href: m[2] } : { t: m[0] });
    i = m.index + m[0].length;
  }
  if (i < texto.length) saida.push({ t: texto.slice(i) });
  return saida;
}

export function paraNos(doc, texto) {
  const frag = doc.createDocumentFragment();
  for (const p of partes(texto)) {
    if (!p.href) { frag.append(p.t); continue; }
    const a = doc.createElement('a');
    a.href = p.href; a.textContent = p.t;
    if (externo(p.href)) { a.target = '_blank'; a.rel = 'noopener'; }
    frag.append(a);
  }
  return frag;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function paraHtml(texto) {
  return partes(texto).map((p) => (p.href ? `<a href="${esc(p.href)}"${externo(p.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(p.t)}</a>` : esc(p.t))).join('');
}
