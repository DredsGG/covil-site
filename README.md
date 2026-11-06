# Covil site

The public website of [Covil](https://github.com/DredsGG/covil), a chat, voice and live-screen app for groups of friends. It is a static site: a landing page with a 3D cave, plus the legal and trust pages (Terms, Privacy, Cookies, Community guidelines, Security), in Portuguese, English and Spanish.

The site has no sign-up and no backend. It only asks GitHub for the latest release to show the download button.

## Pages

| Address | File | Notes |
|---|---|---|
| `/` | `index.html` | landing page with the 3D cave |
| `/termos` | `termos.html` | Terms of Use (Portuguese text; EN/ES show a notice) |
| `/privacidade` | `privacidade.html` | Privacy Policy (Portuguese text; EN/ES show a notice) |
| `/cookies` | `cookies.html` | what the site stores in the browser (localStorage language, sessionStorage app version), no cookies |
| `/diretrizes` | `diretrizes.html` | community guidelines, how to report, official channels in Brazil |
| `/seguranca` | `seguranca.html` | how to report a security flaw, scope, what the site does for security |
| `/.well-known/security.txt` | `public/.well-known/security.txt` | RFC 9116. **Renew `Expires` before 2027-10-31** |
| `/sitemap.xml`, `/robots.txt` | `public/` | the six public pages; `404.html` is `noindex` |

The texts of Cookies, Guidelines and Security live in `src/i18n-paginas.js` (pt, en, es; `[text](url)` becomes a link, see `src/marcacao.js`). At build time `vite.config.js` writes the Portuguese text into the HTML, so those pages read without JavaScript. To add a page, add it to `PAGINAS` in `vite.config.js`, add its keys to `src/i18n-paginas.js` (footer labels go in `src/i18n.js`), link it in every footer and in `public/sitemap.xml`.

## Stack

- [Vite](https://vite.dev) (multi-page)
- [three](https://threejs.org) for the 3D cave
- [Fontsource](https://fontsource.org) for the fonts (Bricolage Grotesque, Atkinson Hyperlegible Next)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) for the Pix QR code

## Develop

```bash
npm install
npm run dev
npm run build
```

`npm run build` writes the site to `dist/`.

## Security headers (`public/_headers`)

Cloudflare Pages applies `public/_headers` to every response (`/*`): an **enforced** Content-Security-Policy (not Report-Only), Permissions-Policy denying what the site does not use, `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options`. Hashed files in `/assets/*` get a one-year immutable cache. `/.well-known/*` has no long cache (Pages already serves `.txt` as `text/plain; charset=utf-8`). The `*.pages.dev` mirror gets `X-Robots-Tag: noindex`.

The CSP is `default-src 'self'`, plus `connect-src https://api.github.com` for the download button and `img-src data:` for the Pix QR code. There is no `'unsafe-inline'` and no `'unsafe-eval'`: the site has no inline script or `style="..."` attribute (setting `el.style.x` from a script is allowed). WebGL is not affected by CSP, and the 3D cave runs with it. If you add an inline style attribute, the browser will block it: use a CSS class.

**HSTS stays on Cloudflare, not in `_headers`.** It is set in the Cloudflare dashboard (SSL/TLS > Edge Certificates). Repeating it here would send the header twice. There is no COEP or CORP on purpose (they can break resources), and no `X-XSS-Protection`, `Expect-CT` or HPKP (obsolete).

Limits of Pages: at most 100 rules and 2000 characters per line. `_headers` does not apply to Pages Functions.

### Test the headers locally

`vite preview` does **not** apply `_headers`. Use Wrangler:

```bash
npm run build
npx wrangler pages dev dist
```

Open it in a Chromium browser with the console open and visit every page and flow (home with the 3D cave, PT/EN/ES, the download button, the Pix dialog and QR code, the 404 page, and the legal pages). The goal is zero CSP violations. `tests/site.mjs` in the main repository does the same automatically: it serves `dist/` with the rules of `dist/_headers`, opens every page and fails on any CSP violation.

## Before publishing

Set the date in `src/legal.js` (`ATUALIZADO`, format `YYYY-MM-DD`) whenever a legal page changes, build, then run:

```bash
npm run verificar-publicacao
```

It fails while the date is still the placeholder, or if the build contains a server address.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Build output directory: `dist`
- Custom domain: `covil.app`

## Report a security problem

See [SECURITY.md](SECURITY.md) or <https://covil.app/seguranca>.

## License

MIT, see [LICENSE](LICENSE). Third-party notices are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
