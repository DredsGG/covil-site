import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import './estilo.css';
import './topo.js';
import { idiomaInicial, registrar, salvarIdioma, t as tr } from './i18n.js';
import { PAGINAS } from './i18n-paginas.js';
import { paraNos } from './marcacao.js';
import pacote from '../package.json';

// Data da última mudança das páginas legais (Termos, Privacidade, Cookies, Diretrizes e Segurança). Troque na hora de publicar:
// `npm run verificar-publicacao` recusa a publicação enquanto estiver 'AAAA-MM-DD'.
export const ATUALIZADO = '2026-11-06';

registrar(PAGINAS); // corpo de Cookies, Diretrizes e Segurança (só as páginas legais carregam)
let idioma = idiomaInicial();
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function dataBonita(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m && !/^A/.test(d) ? `${m[3]}/${m[2]}/${m[1]}` : d;
}

function aplicarIdioma() {
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : idioma;
  // texto com "[link](endereço)" vira <a>, sempre por nós do DOM (nunca innerHTML)
  for (const el of $$('[data-t]')) el.replaceChildren(paraNos(document, tr(idioma, el.dataset.t)));
  for (const el of $$('[data-t-label]')) el.setAttribute('aria-label', tr(idioma, el.dataset.tLabel));
  for (const b of $$('[data-idioma]')) b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma));
  // Cookies, Diretrizes e Segurança têm o corpo traduzido (marcado com js-traduzido); o idioma do trecho acompanha
  for (const el of $$('.js-traduzido')) el.lang = idioma === 'pt' ? 'pt-BR' : idioma;
  // Termos e Privacidade são só em português; em EN e ES aparece uma linha avisando
  const aviso = $('.js-aviso');
  const traduzida = !!$('.js-traduzido'); // Cookies, Diretrizes e Segurança: corpo traduzido, aviso e título próprios
  aviso.textContent = tr(idioma, traduzida ? 'legal.avisoTraduzido' : 'legal.aviso');
  if (traduzida) document.title = `${$('h1').textContent} · Covil`;
  aviso.lang = idioma;
  aviso.hidden = idioma === 'pt';
}

for (const b of $$('[data-idioma]')) b.addEventListener('click', () => { idioma = b.dataset.idioma; salvarIdioma(idioma); aplicarIdioma(); });
$('.js-versao-site').textContent = pacote.version;
const data = $('.js-data');
data.textContent = dataBonita(ATUALIZADO);
if (/^\d{4}-\d{2}-\d{2}$/.test(ATUALIZADO)) data.setAttribute('datetime', ATUALIZADO);
aplicarIdioma();
