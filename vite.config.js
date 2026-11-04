import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const aqui = (f) => fileURLToPath(new URL(f, import.meta.url));

// /termos e /privacidade sem ".html" também no `npm run dev` e no `npm run preview`
// (no Cloudflare Pages isso já é o comportamento padrão).
const urlsLimpas = (server) => {
  server.middlewares.use((req, _res, next) => {
    const caminho = (req.url || '').split('?')[0];
    if (caminho === '/termos' || caminho === '/privacidade') req.url = caminho + '.html';
    next();
  });
};

// caminhos relativos: o site funciona no domínio próprio, no GitHub Pages ou numa pasta qualquer
export default defineConfig({
  base: './',
  plugins: [{ name: 'urls-limpas', configureServer: urlsLimpas, configurePreviewServer: urlsLimpas }],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: { index: aqui('index.html'), termos: aqui('termos.html'), privacidade: aqui('privacidade.html') } },
  },
});
