import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import './estilo.css';
import './topo.js';
import { idiomaInicial, salvarIdioma, t as tr } from './i18n.js';
import pacote from '../package.json';

let idioma = idiomaInicial();
const $$ = (s) => [...document.querySelectorAll(s)];

function aplicarIdioma() {
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : idioma;
  document.title = tr(idioma, '404.titulo') + ' · Covil';
  for (const el of $$('[data-t]')) el.textContent = tr(idioma, el.dataset.t);
  for (const el of $$('[data-t-label]')) el.setAttribute('aria-label', tr(idioma, el.dataset.tLabel));
  for (const b of $$('[data-idioma]')) b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma));
}

for (const b of $$('[data-idioma]')) b.addEventListener('click', () => { idioma = b.dataset.idioma; salvarIdioma(idioma); aplicarIdioma(); });
document.querySelector('.js-versao-site').textContent = pacote.version;
aplicarIdioma();
