# Covil site

The public website of [Covil](https://github.com/DredsGG/covil), a chat, voice and live-screen app for groups of friends. It is a static site: a landing page with a 3D cave, plus Terms and Privacy pages (in Portuguese), in Portuguese, English and Spanish.

The site has no sign-up and no backend. It only asks GitHub for the latest release to show the download button.

## Stack

- [Vite](https://vite.dev) (multi-page: `index.html`, `termos.html`, `privacidade.html`)
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

## Before publishing

Set the date in `src/legal.js` (`ATUALIZADO`, format `YYYY-MM-DD`), build, then run:

```bash
npm run verificar-publicacao
```

It fails while the date is still the placeholder, or if the build contains a server address.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Build output directory: `dist`
- Custom domain: `covil.app`

`public/_headers` sets the security headers. There is no Content-Security-Policy on purpose (it would break WebGL).

## License

MIT, see [LICENSE](LICENSE). Third-party notices are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

Status: the Terms and Privacy pages are drafts pending Covil app v0.8.2; the site is not live yet.
