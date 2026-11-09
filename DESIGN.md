---
version: alpha
name: Covil (site)
description: Landing de chat, call e tela ao vivo. Caverna 3D como protagonista, texto osso sobre noite, brasa como único destaque.
colors:
  primary: "#efe9e1"
  on-primary: "#060508"
  accent: "#ff8a3d"
  accent-light: "#ffc48a"
  background: "#060508"
  surface: "#14110f"
  surface-raised: "#1d1916"
  border: "#2c2621"
  border-strong: "#5a5149"
  text: "#efe9e1"
  text-secondary: "#d7cfc5"
  text-muted: "#a59c92"
  paper: "#ffffff"
  moon: "#9aa6c8"
  error: "#ff8f7a"
  success: "#9be0b0"
typography:
  marca:
    fontFamily: Bricolage Grotesque Variable
    fontSize: 218px
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: -0.01em
  final:
    fontFamily: Bricolage Grotesque Variable
    fontSize: 117px
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: -0.01em
  batida:
    fontFamily: Bricolage Grotesque Variable
    fontSize: 74px
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.01em
  titulo:
    fontFamily: Bricolage Grotesque Variable
    fontSize: 59px
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: -0.01em
  secao:
    fontFamily: Bricolage Grotesque Variable
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  sub:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 23px
    fontWeight: 400
    lineHeight: 1.45
  corpo:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.55
  nota:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
  5xl: 128px
components:
  botao-principal:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 24px
    height: 56px
  botao-principal-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.on-primary}"
  botao-principal-ativo:
    backgroundColor: "{colors.text-secondary}"
    textColor: "{colors.on-primary}"
  botao-desabilitado:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
  botao-ok:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
  botao-erro:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
  idioma:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    size: 44px
  idioma-ativo:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    size: 44px
  print:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  numero-de-passo:
    textColor: "{colors.accent}"
  link-hover:
    textColor: "{colors.accent-light}"
  divisoria:
    backgroundColor: "{colors.border}"
  contorno-de-controle:
    backgroundColor: "{colors.border-strong}"
  luz-fria-da-cena:
    backgroundColor: "{colors.moon}"
---

# DESIGN.md: site do Covil

Antes de mexer em qualquer tela do site, siga este arquivo. Nenhuma cor, tamanho, raio ou espaço fora daqui. Os valores vivem como variáveis em `src/estilo.css`; os números do YAML são os de 1440 px de largura, e a fórmula fluida de cada um está nas tabelas abaixo.

## Overview

O site é a entrada de uma caverna à noite. A cena 3D (`src/cena.js`) é a protagonista; o texto fica numa coluna à esquerda, em osso sobre noite, e a brasa é a única cor que chama atenção. O tom é o de um grupo de amigos: frase curta, sem jargão de startup.

Uma ideia em destaque por tela. Uma ação principal por tela.

A segurança manda na técnica: a CSP do site proíbe `style="..."`, `<style>`, `<script>` inline e qualquer recurso de outro host. Estilo dinâmico só por classe ou por `el.style.x`.

## Colors

| Token | Valor | Uso |
|---|---|---|
| `--noite` | `#060508` | fundo do site |
| `--rocha`, `--rocha-2` | `#14110f`, `#1d1916` | superfícies e hover de superfície |
| `--linha`, `--linha-forte` | `#2c2621`, `#5a5149` | divisórias; contorno de controle |
| `--osso` | `#efe9e1` | títulos, texto sobre a cena, botão principal |
| `--osso-2` | `#d7cfc5` | corpo sobre fundo liso |
| `--cinza` | `#a59c92` | texto de apoio, controle em repouso |
| `--brasa` | `#ff8a3d` | único destaque: numeração, marcadores, sublinhado de passo |
| `--brasa-luz` | `#ffc48a` | a mesma brasa, clara: foco e hover de link |
| `--lua` | `#9aa6c8` | luz fria, só dentro da cena |
| `--erro`, `--ok` | `#ff8f7a`, `#9be0b0` | só estado de controle, nunca enfeite |
| `--papel` | `#ffffff` | fundo do QR e hover do botão principal |

Regras: um único matiz de destaque (brasa). Uma única família de neutros, quente. Luz fria só na lua. A transparência sai de `--noite-rgb` e `--brasa-rgb`; nada de `rgba(...)` solto.

O botão principal é osso e não brasa de propósito: a fogueira já é o ponto de cor da tela, e um botão laranja competiria com ela.

Contraste é medido no renderizado, com o texto escondido e o fundo fotografado: corpo ≥ 4,5:1 e texto grande ≥ 3:1 em todos os estados, inclusive com a batida entrando e saindo da tela.

## Typography

Duas famílias, sem exceção: Bricolage Grotesque (títulos) e Atkinson Hyperlegible Next (texto). Ambas servidas do próprio site.

| Token | Fórmula | 390 | 1440 | 2560 | Uso |
|---|---|---|---|---|---|
| `--t-marca` | `clamp(min(8.5rem, max(136px, 35vw)), 1rem + 14vw, 14rem)` | 136 | 218 | 308 | a palavra Covil (o `min(...)` mantém a palavra dentro da tela com o texto do navegador a 200%; sem zoom de texto fica 136 em qualquer celular) |
| `--t-final` | `clamp(3.5rem, 1rem + 7vw, 8rem)` | 56 | 117 | 176 | chamada final |
| `--t-batida` | `clamp(2.625rem, 1.1rem + 3.9vw, 5rem)` | 42 | 74 | 110 | título de batida |
| `--t-titulo` | `clamp(2.25rem, 1rem + 3vw, 4rem)` | 36 | 59 | 88 | título de seção |
| `--t-doc` | `clamp(2.5rem, 1.5rem + 2.6vw, 4rem)` | 40 | 61 | 88 | h1 de página legal |
| `--t-sec` | `1.5rem` | 24 | 24 | 33 | subtítulo de seção, marca do topo |
| `--t-sub` | `clamp(1.1875rem, 1.05rem + 0.45vw, 1.5rem)` | 19 | 23 | 33 | texto de batida e de herói |
| `--t-corpo` | `clamp(1.125rem, 1rem + 0.25vw, 1.25rem)` | 18 | 20 | 28 | corpo |
| `--t-nota` | `clamp(0.9375rem, 0.875rem + 0.15vw, 1.0625rem)` | 15 | 16 | 23 | rodapé, notas, controles pequenos |

A raiz do `html` é 16 px até 1600 de largura e cresce até 24 px, então botões, margens e texto acompanham a tela sem depender de zoom.

Entrelinha: 0,84 a 1,06 em título, 1,45 em texto de cena, 1,55 em corpo, 1,65 em texto legal. Largura de leitura: `--leitura` = 68ch em texto longo; 40 a 56ch em texto curto de seção, porque a cena precisa de espaço.

## Layout

Grade: margem `--margem` = `clamp(1.25rem, 6vw, 10rem)` nos dois lados, em todas as seções e no topo. Sobre a cena, o texto fica em `--coluna` = `min(46vw, 48rem)`. Depois da cena, 5 + 7 colunas com o texto sempre à esquerda.

Espaço: só a escala de 4 (`--e-1` 4 px até `--e-48` 192 px). Alvo mínimo de qualquer controle: `--alvo` = 44 px.

Celular (até 860 px): cena em cima, texto ancorado embaixo, botão em largura total, rodapé em duas colunas, print recortado à esquerda em tamanho de leitura.

Em tela larga, `cena.js` desloca o quadro da câmera 11% para a direita, de modo que a fogueira não fica atrás da coluna de texto, e mais 13% no corredor das telas ao vivo. No celular, sobe o quadro 14% para a fogueira ficar acima do texto.

## Elevation & Depth

Só o que tem motivo:

| Token | Motivo |
|---|---|
| `--sombra-print` | o print flutua sobre a noite |
| `--sombra-dialogo` | o quadro Apoiar fica acima da página |
| `--brilho-brasa` | hover do botão principal: a brasa acende |

Gradientes permitidos, todos com função: `.veu` e `.texto-na-cena::before` (contraste do texto sobre a cena; no celular a sombra anda junto com o texto), `.depois` (saída da caverna), `.final::before` e `body.sem-3d .veu` (luz da fogueira). Sem vidro, sem desfoque, sem gradiente em texto.

## Shapes

| Token | Valor | Uso |
|---|---|---|
| `--r-1` | 4 px | reservado para detalhes pequenos |
| `--r-2` | 8 px | ações, campos, ícone, QR |
| `--r-3` | 16 px | prints e quadro |
| `--r-pilula` | 999 px | seletor de idioma |

Nenhum raio fora da escala.

## Components

Movimento: `--m-rapido` 120 ms (cor, clique), `--m-medio` 240 ms (faixa do topo, brilho), `--m-lento` 600 ms (entrada do texto, cena), `--m-pulso` 1,2 s (ícone procurando versão), `--m-respirar` 2,4 s (dica de rolar). Easing `--saida`, `cubic-bezier(0.22, 1, 0.36, 1)`. O texto entra só com deslocamento, nunca com opacidade: não existe estado apagado.

Nada pisca mais de 3 vezes por segundo: o tremor da luz da fogueira tem no máximo cerca de 2,3 Hz (componente rápido em `sin(tempo * 14)`, e o produto de dois senos chega a 2,3 Hz), e as brasas piscam em até cerca de 2,2 Hz (`6 + 8` rad/s). A cena é um pedaço de JavaScript à parte, carregado com `import()`: o texto que já vem no HTML pinta antes dela.

Sem WebGL, ou com o contexto WebGL perdido, vale `body.sem-3d`: a cena some e fica o fundo estático (`--noite` com a luz da fogueira), com o texto inteiro legível e nenhuma mensagem de erro no console.

Reflow: o topo quebra em duas linhas (marca em cima, navegação embaixo) quando o texto a 200% não cabe numa linha. Zoom de 200% (720 px) e 400% (320 px) e texto a 200% não geram rolagem horizontal em nenhuma página.

Com `prefers-reduced-motion: reduce`, a cena para de desenhar em laço e todas as animações e transições do CSS são desligadas. A câmera continua acompanhando a rolagem, um quadro por evento, sem suavização: anda só quando a pessoa rola.

Ciclo de estados:

| Controle | Repouso | Hover | Foco visível | Ativo | Desabilitado | Carregando | Erro |
|---|---|---|---|---|---|---|---|
| Baixar | osso, texto noite | papel e brilho brasa | contorno 2 px brasa-luz | osso-2, desce 1 px | rocha, texto cinza | ícone pulsa, `aria-busy`; o link já funciona | sem alarme: linha "Todas as versões no GitHub" e o botão cai na página de versões |
| Idioma | cinza | osso e contorno | contorno 2 px brasa-luz | rocha | não se aplica | não se aplica | não se aplica |
| Idioma escolhido | osso sobre rocha-2, `aria-pressed` | igual | igual | igual | não se aplica | não se aplica | não se aplica |
| Copiar Pix | osso, texto noite | papel e brilho brasa | contorno 2 px brasa-luz | osso-2, desce 1 px | rocha, texto cinza | instantâneo | contorno e texto erro, com aviso em `role=status` apontando a chave Pix; sucesso em verde ok |
| Link | sublinhado no texto corrido; sem sublinhado no topo e rodapé | brasa-luz | contorno 2 px brasa-luz | brasa | não se aplica | não se aplica | não se aplica |

## Do's and Don'ts

Faça:

- Um rótulo por intenção: "Baixar para Windows", "Como entrar" e "Ir para o início" em todo o site.
- Fora do Windows o botão de baixar leva à página de versões, nunca direto ao `.exe`.
- Toda frase nova em PT, EN e ES em `src/i18n.js`.
- Confira no README ou no código do app antes de afirmar algo sobre ele.
- Olhe o renderizado em 390, 1440 e 2560 antes de dar por pronto.

Não faça:

- Não use `style="..."`, `<style>` ou `<script>` inline, nem recurso de outro host.
- Não use emoji como ícone. Ícone é SVG próprio.
- Não monte grade genérica de cartões com ícone em cima de título.
- Não ponha gradiente em texto, vidro em cartão ou brilho sem motivo.
- Não centralize a página inteira: o texto ancora na margem esquerda.
- Não baixe a opacidade de texto para animar.
