import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import './estilo.css';
import { idiomaInicial, salvarIdioma, t as tr } from './i18n.js';
import pacote from '../package.json';

// Data da última mudança dos Termos e da Privacidade. Troque na hora de publicar:
// `npm run verificar-publicacao` recusa a publicação enquanto estiver 'AAAA-MM-DD'.
export const ATUALIZADO = 'AAAA-MM-DD';

let idioma = idiomaInicial();
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function dataBonita(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m && !/^A/.test(d) ? `${m[3]}/${m[2]}/${m[1]}` : d;
}

function aplicarIdioma() {
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : idioma;
  for (const el of $$('[data-t]')) el.textContent = tr(idioma, el.dataset.t);
  for (const el of $$('[data-t-label]')) el.setAttribute('aria-label', tr(idioma, el.dataset.tLabel));
  for (const b of $$('[data-idioma]')) b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma));
  // o texto legal é só em português; em EN e ES aparece uma linha avisando
  const aviso = $('.js-aviso');
  aviso.textContent = tr(idioma, 'legal.aviso');
  aviso.lang = idioma;
  aviso.hidden = idioma === 'pt';
}

for (const b of $$('[data-idioma]')) b.addEventListener('click', () => { idioma = b.dataset.idioma; salvarIdioma(idioma); aplicarIdioma(); });
$('.js-versao-site').textContent = pacote.version;
const data = $('.js-data');
data.textContent = dataBonita(ATUALIZADO);
if (/^\d{4}-\d{2}-\d{2}$/.test(ATUALIZADO)) data.setAttribute('datetime', ATUALIZADO);
aplicarIdioma();
