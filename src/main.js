import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import './estilo.css';
import qrcode from 'qrcode-generator';
import { TEXTOS, idiomaInicial, salvarIdioma, t as tr } from './i18n.js';
import { APOIO, brCode, valorPix } from './pix.js';
import pacote from '../package.json';

const REPO = 'DredsGG/covil';
const VERSAO_SITE = pacote.version;
const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
const estreito = matchMedia('(max-width: 860px)').matches;
const eWindows = (() => {
  const p = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /win/i.test(p) && !/android|iphone|ipad/i.test(navigator.userAgent);
})();

let idioma = idiomaInicial();
const t = (k, v) => tr(idioma, k, v);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- idioma ----------
function aplicarIdioma() {
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : idioma;
  document.title = t('meta.titulo');
  $('meta[name="description"]').setAttribute('content', t('meta.desc'));
  for (const el of $$('[data-t]')) el.textContent = t(el.dataset.t);
  for (const el of $$('[data-t-alt]')) el.setAttribute('alt', t(el.dataset.tAlt));
  for (const el of $$('[data-t-label]')) el.setAttribute('aria-label', t(el.dataset.tLabel));
  for (const b of $$('[data-idioma]')) b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma));
  atualizarBaixar();
  atualizarBug();
  if ($('.js-apoio').open) desenharApoio();
}
for (const b of $$('[data-idioma]')) b.addEventListener('click', () => { idioma = b.dataset.idioma; salvarIdioma(idioma); aplicarIdioma(); });
$('.js-versao-site').textContent = VERSAO_SITE;

// ---------- baixar: o Covil-Setup mais novo do Release do GitHub ----------
let release = null; let releaseErro = false;
async function buscarRelease() {
  try {
    const c = JSON.parse(sessionStorage.getItem('covil_release') || 'null');
    if (c && Date.now() - c.em < 10 * 60 * 1000) return c.dados;
  } catch {}
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  const setup = (j.assets || []).find((a) => /^Covil-Setup-\d+\.\d+\.\d+\.exe$/.test(a.name));
  const dados = { versao: String(j.tag_name || '').replace(/^v/, ''), url: setup?.browser_download_url || null, tamanho: setup?.size || 0, pagina: j.html_url };
  try { sessionStorage.setItem('covil_release', JSON.stringify({ em: Date.now(), dados })); } catch {}
  return dados;
}
function atualizarBaixar() {
  const fallback = `https://github.com/${REPO}/releases/latest`;
  for (const a of $$('.js-baixar')) a.href = release?.url || fallback;
  for (const p of $$('.js-baixar-info')) {
    if (release?.url) p.textContent = t('baixar.versao', { v: release.versao, mb: Math.round(release.tamanho / 1048576) });
    else if (releaseErro) { p.innerHTML = ''; const a = document.createElement('a'); a.href = release?.pagina || fallback; a.textContent = t('baixar.semInfo'); p.append(a); }
    else p.textContent = t('baixar.carregando');
  }
  const outro = $('.js-outro-sistema');
  if (!eWindows) {
    outro.hidden = false; outro.textContent = t('baixar.outroSistema');
  }
}
buscarRelease().then((r) => { release = r; atualizarBaixar(); }).catch(() => { releaseErro = true; atualizarBaixar(); });

// ---------- rodapé: relatar bug com a versão e um diagnóstico sem dado pessoal ----------
function atualizarBug() {
  const corpo = [
    `<!-- ${idioma === 'pt' ? 'Conte o que aconteceu e o que você esperava.' : idioma === 'es' ? 'Cuenta qué pasó y qué esperabas.' : 'Tell us what happened and what you expected.'} -->`, '', '',
    '---', `Site do Covil v${VERSAO_SITE}`, `Idioma: ${idioma}`, `3D: ${document.body.classList.contains('sem-3d') ? 'não' : 'sim'}`,
    `Navegador: ${(navigator.userAgentData?.brands || []).map((b) => `${b.brand} ${b.version}`).join(', ') || navigator.userAgent}`,
    `Tela: ${innerWidth}×${innerHeight}`,
  ].join('\n');
  $('.js-bug').href = `https://github.com/${REPO}/issues/new?` + new URLSearchParams({ title: '[site] ', body: corpo });
}

// ---------- Apoiar ♥ (regra 16): Brasil → Pix (QR gerado aqui), outro país → GitHub Sponsors ----------
const dlg = $('.js-apoio');
let passoApoio = null; let valorApoio = '10';
function el(tag, attrs = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'on') for (const [ev, f] of Object.entries(v)) n.addEventListener(ev, f); else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v); }
  n.append(...filhos.filter((f) => f != null));
  return n;
}
function desenharApoio() {
  const topo = el('div', { class: 'apoio-topo' }, el('h2', { id: 'apoio-titulo' }, t('apoio.titulo')), el('button', { type: 'button', class: 'apoio-x', 'aria-label': t('apoio.fechar'), on: { click: () => dlg.close() } }, '×'));
  const corpo = el('div', { class: 'apoio-dentro' }, topo);
  if (!passoApoio) {
    corpo.append(el('p', {}, t('apoio.pergunta')));
    const prov = idioma === 'pt' ? 'br' : 'fora';
    corpo.append(el('div', { class: 'apoio-opcoes' },
      el('button', { type: 'button', class: 'apoio-cartao' + (prov === 'br' ? ' provavel' : ''), on: { click: () => { passoApoio = 'br'; desenharApoio(); } } }, el('b', {}, '🇧🇷 ' + t('apoio.brasil')), el('small', {}, t('apoio.brasilSub'))),
      el('button', { type: 'button', class: 'apoio-cartao' + (prov === 'fora' ? ' provavel' : ''), on: { click: () => { passoApoio = 'fora'; desenharApoio(); } } }, el('b', {}, '🌎 ' + t('apoio.fora')), el('small', {}, t('apoio.foraSub')))));
  } else if (passoApoio === 'br') {
    const valores = el('div', { class: 'apoio-valores', role: 'group' });
    for (const v of ['5', '10', '25']) valores.append(el('button', { type: 'button', 'aria-pressed': String(valorApoio === v), on: { click: () => { valorApoio = v; desenharApoio(); } } }, `R$ ${v}`));
    valores.append(el('button', { type: 'button', 'aria-pressed': String(!['5', '10', '25'].includes(valorApoio)), on: { click: () => { valorApoio = ''; desenharApoio(); } } }, t('apoio.outro')));
    corpo.append(valores);
    if (!['5', '10', '25'].includes(valorApoio)) {
      corpo.append(el('input', { inputmode: 'decimal', placeholder: t('apoio.valorPh'), value: valorApoio, 'aria-label': t('apoio.outro'), on: { change: (e) => { valorApoio = e.target.value; desenharApoio(); } } }));
    }
    const v = valorPix(valorApoio);
    const codigo = brCode(v === v ? valorApoio : '');
    const q = qrcode(0, 'M'); q.addData(codigo); q.make();
    corpo.append(el('img', { class: 'apoio-qr', src: q.createDataURL(6, 4), alt: 'QR Code Pix', width: 210, height: 210 }));
    if (v === null || v !== v) corpo.append(el('p', { class: 'apoio-nota' }, t('apoio.livre')));
    const copiar = el('button', { type: 'button', class: 'botao principal', on: { click: async () => { try { await navigator.clipboard.writeText(codigo); copiar.textContent = t('apoio.copiado'); } catch {} } } }, t('apoio.copiar'));
    corpo.append(copiar, el('p', { class: 'apoio-chave' }, `${t('apoio.chave')}: ${APOIO.chave}`));
    corpo.append(el('button', { type: 'button', class: 'apoio-voltar', on: { click: () => { passoApoio = null; desenharApoio(); } } }, t('apoio.voltar')));
  } else {
    corpo.append(el('a', { class: 'botao principal', href: APOIO.sponsors, target: '_blank', rel: 'noopener' }, t('apoio.sponsors')));
    corpo.append(el('button', { type: 'button', class: 'apoio-voltar', on: { click: () => { passoApoio = null; desenharApoio(); } } }, t('apoio.voltar')));
  }
  corpo.append(el('p', { class: 'apoio-nota' }, t('apoio.nota')));
  dlg.replaceChildren(corpo);
}
$('.js-apoiar').addEventListener('click', () => { passoApoio = null; desenharApoio(); dlg.showModal(); });
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

// ---------- a caverna ----------
const historia = $('.historia');
const topo = $('.topo');
let cena = null;
function progresso() {
  const fim = historia.offsetTop + historia.offsetHeight - innerHeight;
  return fim > 0 ? scrollY / fim : 0;
}
function aoRolar() {
  const p = progresso();
  topo.classList.toggle('com-fundo', scrollY > 40);
  const fora = p > 1.02;
  document.body.classList.toggle('fora-da-caverna', fora);
  if (cena) {
    cena.definirProgresso(p);
    // __covilParado: só nos testes (tira print com a cena parada)
    if (fora || document.hidden || window.__covilParado) cena.desligar(); else cena.ligar();
  }
}
const vistas = new IntersectionObserver((itens) => { for (const it of itens) if (it.isIntersecting) it.target.classList.add('vista'); }, { threshold: [0.3], rootMargin: '0px 0px -20% 0px' });
for (const b of $$('.batida')) vistas.observe(b);

async function ligarCena() {
  const { criarCena, suportaWebGL } = await import('./cena.js');
  if (!suportaWebGL()) throw new Error('sem WebGL');
  cena = criarCena($('#cena'), { reduzido, leve: estreito || (navigator.hardwareConcurrency || 8) <= 4, imagemTela: './img/call.webp' });
  window.__covilSite = cena;
  aoRolar();
}
ligarCena().catch((e) => {
  console.warn('Covil: sem a caverna em 3D', e);
  document.body.classList.add('sem-3d');
  atualizarBug();
});
addEventListener('scroll', aoRolar, { passive: true });
addEventListener('resize', aoRolar);
document.addEventListener('visibilitychange', aoRolar);

aplicarIdioma();
aoRolar();
