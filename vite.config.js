import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { TEXTOS } from './src/i18n.js';
import { PAGINAS as TEXTOS_PAGINAS } from './src/i18n-paginas.js';
import { paraHtml } from './src/marcacao.js';

const aqui = (f) => fileURLToPath(new URL(f, import.meta.url));

// Páginas além da home e da 404. Cada uma é uma entrada do build e uma URL limpa (sem ".html").
const PAGINAS = ['termos', 'privacidade', 'cookies', 'diretrizes', 'seguranca'];

// /termos, /privacidade etc. sem ".html" também no `npm run dev` e no `npm run preview`
// (no Cloudflare Pages isso já é o comportamento padrão).
const urlsLimpas = (server) => {
  server.middlewares.use((req, _res, next) => {
    const caminho = (req.url || '').split('?')[0];
    if (PAGINAS.some((p) => caminho === '/' + p)) req.url = caminho + '.html';
    next();
  });
};

// O Cloudflare Pages serve o 404.html em qualquer caminho (ex.: /a/b/c). Com base './' os links dele
// quebrariam fora da raiz; só nessa página os caminhos viram absolutos (/assets/..., /termos).
const raizNo404 = {
  name: 'raiz-no-404',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      return ctx.path === '/404.html' ? html.replace(/(src|href)="\.\//g, '$1="/') : html;
    },
  },
};

// Elementos vazios com data-t (ex.: <p data-t="seg.s1.p"></p>) recebem o texto em português já no HTML,
// para a página ler sem JavaScript e para os buscadores. Uma só fonte: src/i18n.js e src/i18n-paginas.js. Chave que não existe quebra o build.
const VAZIO = /<(h1|h2|p|li)(\s[^>]*?\bdata-t="([^"]+)"[^>]*)>\s*<\/\1>/g;
const portuguesNoHtml = {
  name: 'portugues-no-html',
  transformIndexHtml(html) {
    return html.replace(VAZIO, (_m, tag, attrs, chave) => {
      const texto = TEXTOS_PAGINAS.pt[chave] ?? TEXTOS.pt[chave];
      if (texto === undefined) throw new Error(`data-t="${chave}": chave que não existe em src/i18n.js nem em src/i18n-paginas.js`);
      return `<${tag}${attrs}>${paraHtml(texto)}</${tag}>`;
    });
  },
};

// caminhos relativos: o site funciona no domínio próprio, no GitHub Pages ou numa pasta qualquer
export default defineConfig({
  base: './',
  plugins: [{ name: 'urls-limpas', configureServer: urlsLimpas, configurePreviewServer: urlsLimpas }, portuguesNoHtml, raizNo404],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: { index: aqui('index.html'), ...Object.fromEntries(PAGINAS.map((p) => [p, aqui(p + '.html')])), '404': aqui('404.html') },
    },
  },
});
