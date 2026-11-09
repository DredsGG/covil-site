# Covil site

The public website of [Covil](https://github.com/DredsGG/covil), a chat, voice and live-screen app for groups of friends. It is a static site: a landing page with a 3D cave, plus the legal and trust pages (Terms, Privacy, Cookies, Community guidelines, Security), in Portuguese, English and Spanish.

Current version: **v0.3.1** (see `package.json`). The site has no sign-up and no backend. It only asks GitHub for the latest release to show the download button, and it sets no cookies.

Design rules (colors, type, spacing, states, motion) live in [DESIGN.md](DESIGN.md). Follow it before touching any screen.

## Pages

| Address | File | Notes |
|---|---|---|
| `/` | `index.html` | landing page with the 3D cave, `SoftwareApplication` JSON-LD |
| `/termos` | `termos.html` | Terms of Use (Portuguese text; EN/ES show a notice) |
| `/privacidade` | `privacidade.html` | Privacy Policy (Portuguese text; EN/ES show a notice) |
| `/cookies` | `cookies.html` | what the site stores in the browser (localStorage language, sessionStorage app version), no cookies |
| `/diretrizes` | `diretrizes.html` | community guidelines, how to report, official channels in Brazil |
| `/seguranca` | `seguranca.html` | how to report a security flaw, scope, what the site does for security |
| `/.well-known/security.txt` | `public/.well-known/security.txt` | RFC 9116. **Renew `Expires` before 2027-10-31** |
| `/sitemap.xml`, `/robots.txt` | `public/` | the six public pages with `lastmod`; `404.html` is `noindex` |

The texts of Cookies, Guidelines and Security live in `src/i18n-paginas.js` (pt, en, es; `[text](url)` becomes a link, see `src/marcacao.js`). At build time `vite.config.js` writes the Portuguese text into the HTML, so those pages read without JavaScript. To add a page, add it to `PAGINAS` in `vite.config.js`, add its keys to `src/i18n-paginas.js` (footer labels go in `src/i18n.js`), link it in every footer and in `public/sitemap.xml`.

## Stack

- [Vite](https://vite.dev) (multi-page)
- [three](https://threejs.org) for the 3D cave (a separate chunk loaded with `import()`, so the text in the HTML paints first; deferring or slicing the scene build was tried and measured worse, see `decisoes.md` in the vault)
- [Fontsource](https://fontsource.org) for the fonts (Bricolage Grotesque, Atkinson Hyperlegible Next), served from the site itself
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) for the Pix QR code

No runtime dependency may be added without a reason written in the commit. Test tools (below) are installed **outside** the repository.

## Develop

```bash
npm install
npm run dev
npm run build
```

`npm run build` writes the site to `dist/`.

## Security headers (`public/_headers`)

Cloudflare Pages applies `public/_headers` to every response (`/*`): an **enforced** Content-Security-Policy (not Report-Only), Permissions-Policy denying what the site does not use, `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options`. Hashed files in `/assets/*` get a one-year immutable cache. `/.well-known/*` has no long cache (Pages already serves `.txt` as `text/plain; charset=utf-8`). The `*.pages.dev` mirror gets `X-Robots-Tag: noindex`.

The CSP is `default-src 'self'`, plus `connect-src https://api.github.com` for the download button and `img-src data:` for the Pix QR code. There is no `'unsafe-inline'` and no `'unsafe-eval'`: the site has no inline script or `style="..."` attribute (setting `el.style.x` from a script is allowed). The JSON-LD block is data (`type="application/ld+json"`), it does not execute and CSP does not touch it. WebGL is not affected by CSP, and the 3D cave runs with it. If you add an inline style attribute, the browser will block it: use a CSS class.

**HSTS stays on Cloudflare, not in `_headers`.** It is set in the Cloudflare dashboard (SSL/TLS > Edge Certificates). Repeating it here would send the header twice. There is no COEP or CORP on purpose (they can break resources), and no `X-XSS-Protection`, `Expect-CT` or HPKP (obsolete).

**Cloudflare Web Analytics is off by choice.** It injects a beacon script that the CSP would block and that would contradict `/cookies` and `/privacidade` ("no analytics"). If it is ever turned on, update those two pages (and `ATUALIZADO` in `src/legal.js`) first.

Limits of Pages: at most 100 rules and 2000 characters per line. `_headers` does not apply to Pages Functions.

## Test

Everything below runs on Windows from PowerShell. The tools stay outside the repo (a temporary folder); nothing is added to `package.json`.

1. **Site test** (links, headers, CSP, JSON-LD, landmarks, languages, touch targets, zoom, reduced motion, no WebGL): `node ..\tests\site.mjs <folder with node_modules of playwright-core, jsqr, pngjs>` with `COVIL_CANAL=chrome` to use the installed Chrome. It builds the site, serves `dist/` with the rules of `dist/_headers`, opens every page and fails on any CSP violation.
2. **Headers for real**: `npm run build`, then `npx wrangler pages dev dist`. `vite preview` does **not** apply `_headers`. Open it in Chromium with the console open and visit every page and flow (home with the 3D cave, PT/EN/ES, the download button, the Pix dialog and QR code, the 404 page, the legal pages). Goal: zero CSP violations.
3. **Accessibility**: inject `axe-core` (`npm i axe-core` in the temporary folder) with Playwright using `bypassCSP: true` on the test context (the page CSP correctly refuses an injected inline script) and run it on all pages, in PT/EN/ES, at 1440x900 and 390x844. Goal: 0 critical/serious.
4. **Performance**: `npx lighthouse http://127.0.0.1:8788/ --preset=desktop` (and the default mobile preset) against the wrangler server. In headless Chrome the 3D runs in software (SwiftShader), so total blocking time is far worse than on a real GPU: compare versions with several runs and the median, never a single run.
5. **Publish gate**: `npm run verificar-publicacao` after `npm run build`.

## Accessibility and performance rules

- WCAG 2.2 AA on all pages: a visible 2 px focus outline (`--brasa-luz`, contrast above 3:1 over the dark background and over the scene), "Skip to content" first in tab order, one `h1` per page, landmarks with names, `<html lang>` and `<title>` follow the chosen language, controls at least 44x44 px, no horizontal scroll at 200% and 400% zoom or with text at 200%.
- With `prefers-reduced-motion: reduce` the scene draws only when the page scrolls (one frame per scroll event) and every CSS animation and transition is off.
- Nothing flashes more than 3 times per second (fire light flicker and ember twinkle are at most about 2.3 Hz).
- Without WebGL, or when the WebGL context is lost, the page keeps the static background (`body.sem-3d`) and stays fully readable.
- Fonts are **not** preloaded: measured with CPU 4x and slow 4G, preloading delayed the first text by 100 to 280 ms and did not change CLS (already 0 with `font-display: swap`).
- Initial JS (gzip) budget: about 17 kB; the scene (about 144 kB gzip) loads after the text.

## SEO and metadata

Every public page has title, description, canonical and Open Graph/Twitter tags; `og.png` is 1200x630 and is the real home page (without a version number, which would age). `apple-touch-icon.png` (180x180) is generated from `public/icone.svg`. `theme-color` is `--noite`.

**Left out on purpose:**

- **hreflang**: the three languages share one URL (the language switch happens in the browser), so `hreflang` would point three languages at the same address and be wrong. To index by language the site would need one URL per language (for example `/en/` and `/es/`, each with its own HTML, canonical and `hreflang` links, and sitemap entries). That is a separate decision.
- **`manifest.webmanifest`**: the site is not a PWA.

## Before publishing

Set the date in `src/legal.js` (`ATUALIZADO`, format `YYYY-MM-DD`) whenever a legal page changes, and `lastmod` in `public/sitemap.xml`; build, then run:

```bash
npm run verificar-publicacao
```

It fails while the date is still the placeholder, or if the build contains a server address. Checklist: `npm audit` clean; site test green; wrangler run with zero CSP violations; `security.txt` still valid (`Expires`); no new request to another host; after the deploy, `curl.exe -sI https://covil.app/` shows the CSP, Permissions-Policy, COOP and (from Cloudflare) HSTS once.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Build output directory: `dist`
- Custom domain: `covil.app`

## Report a security problem

See [SECURITY.md](SECURITY.md) or <https://covil.app/seguranca>.

## License

MIT, see [LICENSE](LICENSE). Third-party notices are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
