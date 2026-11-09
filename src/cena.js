// A cena do site: a entrada da caverna tem o formato do logo do Covil (o arco), com uma fogueira lá dentro.
// Rolando a página, a câmera entra, passa pela fogueira (brasas e fumaça subindo) e chega ao fundo, onde o app
// aparece numa tela iluminada. Tudo gerado aqui (rocha por ruído, fogo e brasas por shader), sem modelo 3D baixado.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { fbm, ruido3 } from './ruido.js';

const CHAO = -1.2;
// o arco da entrada (mesmas proporções do logo: lados = 0,45 × largura, topo em meia-volta)
const ARCO = { meia: 4, lado: 3.6 };
const FOGO = new THREE.Vector3(2.4, CHAO, -17);
const TELA_Z = -47.6;

// distância de um ponto (x, y) até a borda do arco (negativa = dentro do vão)
function distArco(x, y, esc = 1) {
  const m = ARCO.meia * esc; const l = ARCO.lado * esc;
  const yb = CHAO; const yt = CHAO + l;
  if (y <= yt) {
    const dx = Math.abs(x) - m;
    const dy = yb - y;
    if (dx <= 0 && dy <= 0) return Math.max(dx, dy);
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  }
  return Math.hypot(x, y - yt) - m;
}

// pontos do contorno do arco (chão, lado, meia-volta, lado), espaçados por igual
function contornoArco(n) {
  const m = ARCO.meia; const l = ARCO.lado;
  const trechos = [
    { tam: 2 * m, p: (t) => [-m + 2 * m * t, 0] },
    { tam: l, p: (t) => [m, l * t] },
    { tam: Math.PI * m, p: (t) => [Math.cos(Math.PI * t) * m, l + Math.sin(Math.PI * t) * m] },
    { tam: l, p: (t) => [-m, l - l * t] },
  ];
  const total = trechos.reduce((s, x) => s + x.tam, 0);
  const pts = [];
  for (let i = 0; i < n; i++) {
    let d = (i / n) * total;
    for (const tr of trechos) {
      if (d <= tr.tam) { pts.push(tr.p(d / tr.tam)); break; }
      d -= tr.tam;
    }
  }
  return pts;
}

function corRocha(v, alvo) {
  // pedra escura com veios um pouco mais claros
  const c = 0.11 + v * 0.07;
  alvo.setRGB(c * 1.08, c * 0.98, c * 0.9);
  return alvo;
}

function paredeDeFora() {
  const L = 90; const A = 54; const sx = 180; const sy = 108;
  const g = new THREE.PlaneGeometry(L, A, sx, sy);
  g.translate(0, CHAO + A / 2 - 0.6, 0);
  const pos = g.attributes.position;
  const cor = new THREE.Color(); const cores = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i); const y = pos.getY(i);
    const d = distArco(x, y);
    let z = fbm(x * 0.18, y * 0.18, 0.5) * 2.2 + fbm(x * 0.9, y * 0.9, 3.1, 2) * 0.35;
    // borda do vão arredondada para dentro, como rocha gasta
    if (d < 2.4) z -= Math.pow(1 - Math.max(d, 0) / 2.4, 2) * 1.6;
    // a parede se afasta nas bordas (não aparece o fim do plano)
    z -= Math.pow(Math.min(1, Math.abs(x) / (L / 2)), 3) * 6;
    pos.setZ(i, z);
    corRocha(fbm(x * 0.35, y * 0.35, 7.7, 3), cor).toArray(cores, i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  // tira os triângulos que caem dentro do vão
  const idx = g.index.array; const fica = [];
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t]; const b = idx[t + 1]; const c = idx[t + 2];
    const cx = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
    const cy = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
    if (distArco(cx, cy) > -0.05) fica.push(a, b, c);
  }
  g.setIndex(fica);
  g.computeVertexNormals();
  return g;
}

function chaoDeFora() {
  const g = new THREE.PlaneGeometry(90, 40, 90, 40);
  g.rotateX(-Math.PI / 2);
  g.translate(0, CHAO, 20);
  const pos = g.attributes.position;
  const cor = new THREE.Color(); const cores = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i); const z = pos.getZ(i);
    const borda = Math.min(1, Math.abs(x) / 7);
    pos.setY(i, CHAO + fbm(x * 0.3, 2.2, z * 0.3, 3) * 0.5 * borda + borda * borda * 0.8 - 0.05);
    corRocha(fbm(x * 0.5, 9.1, z * 0.5, 2) - 0.4, cor).toArray(cores, i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  g.computeVertexNormals();
  return g;
}

// largura do túnel ao longo do caminho: entrada, salão da fogueira, corredor e o fundo
function escalaTunel(z) {
  const sal = Math.exp(-Math.pow((z + 19) / 7.5, 2)) * 1.35;
  const fim = z < -49.5 ? Math.max(0.08, 1 - (-49.5 - z) / 4.5) : 1;
  return (1.05 + sal + 0.12 * Math.sin(z * 0.37)) * fim;
}

function tunel() {
  const passo = 0.45; const z0 = 0.8; const z1 = -53.5;
  const aneis = Math.round((z0 - z1) / passo) + 1; const nv = 72;
  const base = contornoArco(nv);
  const posicoes = new Float32Array(aneis * nv * 3);
  const cores = new Float32Array(aneis * nv * 3);
  const cor = new THREE.Color();
  for (let r = 0; r < aneis; r++) {
    const z = z0 - r * passo; const s = escalaTunel(z);
    for (let k = 0; k < nv; k++) {
      let [x, y] = base[k];
      x *= s; y *= s * (y > 0 ? 1 : 1);
      // empurra para fora pela "normal" aproximada (do centro do vão)
      const cx = 0; const cy = ARCO.lado * s * 0.55;
      let nx = x - cx; let ny = y - cy; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const chao = y < 0.05;
      const amp = chao ? 0.18 : 0.95 * Math.min(1.6, s);
      const n = fbm(x * 0.32, y * 0.32, z * 0.32) * amp + ruido3(x * 1.3, y * 1.3, z * 1.3) * 0.12;
      const px = x + nx * n; const py = chao ? CHAO + n * 0.4 : CHAO + y + ny * n;
      const i = (r * nv + k) * 3;
      posicoes[i] = px; posicoes[i + 1] = py; posicoes[i + 2] = z;
      corRocha(fbm(px * 0.4, py * 0.4, z * 0.4, 3) + (chao ? -0.3 : 0), cor).toArray(cores, i);
    }
  }
  const ind = [];
  for (let r = 0; r < aneis - 1; r++) {
    for (let k = 0; k < nv; k++) {
      const a = r * nv + k; const b = r * nv + ((k + 1) % nv); const c = (r + 1) * nv + k; const d = (r + 1) * nv + ((k + 1) % nv);
      ind.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  g.setIndex(ind);
  g.computeVertexNormals();
  return g;
}

// ---------- fogo, brasas e fumaça (shaders) ----------
const RUIDO_GLSL = `
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float r2(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
float fb(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*r2(p); p*=2.1; a*=.5; } return v; }
`;

function chama(largura, altura, semente) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uTempo: { value: 0 }, uSemente: { value: semente } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        // sempre de frente para a câmera, mas em pé
        vec4 centro = modelViewMatrix * vec4(0., 0., 0., 1.);
        centro.xy += position.xy;
        gl_Position = projectionMatrix * centro;
      }`,
    fragmentShader: `
      uniform float uTempo; uniform float uSemente; varying vec2 vUv;
      ${RUIDO_GLSL}
      void main(){
        vec2 p = vUv; float t = uTempo*1.6 + uSemente*10.;
        float n = fb(vec2(p.x*3.2 + uSemente, p.y*2.4 - t));
        float n2 = fb(vec2(p.x*6. - uSemente, p.y*5. - t*1.7));
        float larg = (1. - p.y) * 0.42 + 0.04;
        float dx = abs(p.x - .5 + (n - .5) * .32 * p.y);
        float corpo = smoothstep(larg, larg*.25, dx) * smoothstep(1., .05, p.y + (n2-.5)*.45);
        corpo *= smoothstep(0., .08, p.y);
        float calor = corpo * (1.15 - p.y*.9);
        vec3 c = mix(vec3(.95, .2, .02), vec3(1., .55, .12), smoothstep(.2, .7, calor));
        c = mix(c, vec3(1., .86, .55), smoothstep(.75, 1.05, calor));
        gl_FragColor = vec4(c * corpo * .85, corpo * .9);
      }`,
  });
  const g = new THREE.PlaneGeometry(largura, altura);
  g.translate(0, altura / 2, 0);
  return new THREE.Mesh(g, m);
}

function brasas(qtd) {
  const g = new THREE.BufferGeometry();
  const sem = new Float32Array(qtd * 4);
  for (let i = 0; i < qtd; i++) {
    sem[i * 4] = Math.random(); sem[i * 4 + 1] = Math.random(); sem[i * 4 + 2] = Math.random(); sem[i * 4 + 3] = Math.random();
  }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(qtd * 3), 3));
  g.setAttribute('aSem', new THREE.BufferAttribute(sem, 4));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTempo: { value: 0 }, uOrigem: { value: FOGO.clone() }, uEscala: { value: 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    vertexShader: `
      uniform float uTempo; uniform vec3 uOrigem; uniform float uEscala;
      attribute vec4 aSem; varying float vVida; varying float vBrilho;
      void main(){
        float vida = 3.5 + aSem.x*5.;
        float idade = fract(uTempo / vida + aSem.y);
        vVida = idade;
        // sobem rodopiando e a corrente de ar leva para a boca da caverna
        float sobe = idade * (4.5 + aSem.z*5.);
        float leva = idade*idade * (aSem.w*14. + 1.);
        vec3 p = uOrigem + vec3(
          (aSem.z-.5)*1.9 + sin(idade*9. + aSem.x*40.)*.35*idade - leva*.18,
          .3 + sobe - leva*.12,
          (aSem.w-.5)*1.6 + leva);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        vBrilho = .5 + .5*sin(uTempo*(6.+aSem.y*8.) + aSem.x*20.);
        gl_PointSize = min(uEscala * 9., uEscala * (1.4 + aSem.y*2.6) * (60. / -mv.z) * (1. - idade*.6));
      }`,
    fragmentShader: `
      varying float vVida; varying float vBrilho;
      void main(){
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, 0., d);
        vec3 quente = mix(vec3(1., .85, .45), vec3(1., .38, .08), smoothstep(0., .5, vVida));
        quente = mix(quente, vec3(.7, .08, .02), smoothstep(.5, 1., vVida));
        float some = smoothstep(1., .55, vVida) * smoothstep(0., .04, vVida);
        gl_FragColor = vec4(quente * (0.9 + vBrilho*0.9), a * some);
      }`,
  });
  const p = new THREE.Points(g, m);
  p.frustumCulled = false;
  return p;
}

function texturaFumaca() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const img = g.createImageData(128, 128);
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const dx = x / 64 - 1; const dy = y / 64 - 1; const r = Math.hypot(dx, dy);
      const n = fbm(x * 0.05, y * 0.05, 0.3, 4) * 0.5 + 0.5;
      const a = Math.max(0, 1 - r) ** 1.6 * n;
      const i = (y * 128 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a * 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- caminho da câmera ----------
// marcos: em que ponto da rolagem (p) a câmera está onde e olha para onde. Cada frase do site cai num marco:
// 0 começo (de fora), 0,24 a entrada, 0,45 a fogueira, 0,70 as telas ao vivo, 1 o app no fundo.
function caminhos(largo) {
  const xi = largo ? -4.6 : 0; // tela larga: a entrada fica à direita do texto do começo
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const marcos = [
    [0, V(xi, 1.4, 15.5), V(xi * 0.55, 2.2, 0)],
    [0.12, V(xi * 0.4, 1.3, 7), V(0, 1.6, -6)],
    [0.24, V(-0.4, 1.3, 0.5), V(1.2, 0.8, -14)],
    [0.45, V(-2.0, 1.7, -10), V(FOGO.x, 0.3, FOGO.z)],
    [0.58, V(-2.2, 2.0, -18.5), V(FOGO.x + 0.4, 0.8, -24)],
    [0.70, V(-2.0, 1.7, -23.2), V(1.3, 2.2, -31)],
    [0.86, V(-0.1, 1.55, -32.5), V(0, 1.55, TELA_Z)],
    [1, V(0, 1.55, TELA_Z + 5.4), V(0, 1.55, TELA_Z - 1)],
  ];
  const pos = new THREE.CatmullRomCurve3(marcos.map((m) => m[1]));
  const olha = new THREE.CatmullRomCurve3(marcos.map((m) => m[2]));
  const n = marcos.length - 1;
  // p → posição na curva (passa exatamente por cada marco)
  const u = (p) => {
    for (let i = 0; i < n; i++) {
      const [a] = marcos[i]; const [b] = marcos[i + 1];
      if (p <= b) return (i + (p - a) / (b - a)) / n;
    }
    return 1;
  };
  return { pos, olha, u };
}

// telas "ao vivo" flutuando no corredor (a frase das 4 telas): cenas de jogo desenhadas aqui
function texturaJogo(tipo) {
  const W = 640; const H = 360;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const grad = (cores) => { const l = g.createLinearGradient(0, 0, 0, H); cores.forEach((cor, i) => l.addColorStop(i / (cores.length - 1), cor)); return l; };
  if (tipo === 0) { // pôr do sol nas montanhas
    g.fillStyle = grad(['#1b1530', '#7a3b4d', '#f08a4b', '#f6c27a']); g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,220,160,.9)'; g.beginPath(); g.arc(420, 230, 46, 0, 7); g.fill();
    for (const [b, a, cor] of [[255, 30, '#4a2a44'], [290, 24, '#2d1c33'], [325, 18, '#160f1d']]) {
      g.fillStyle = cor; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 10) g.lineTo(x, b - Math.sin(x / 70 + b) * a); g.lineTo(W, H); g.fill();
    }
  } else if (tipo === 1) { // corrida neon
    g.fillStyle = grad(['#07021a', '#2a0a4a', '#120326']); g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,60,200,.75)'; g.lineWidth = 2;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 12, 170); g.lineTo(W / 2 + i * 80, H); g.stroke(); }
    for (let y = 175; y < H; y += (y - 160) * 0.35) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.fillStyle = '#ff4fd8'; g.fillRect(0, 168, W, 3);
    g.fillStyle = '#29e6ff'; g.beginPath(); g.moveTo(W / 2 - 40, 320); g.lineTo(W / 2 + 40, 320); g.lineTo(W / 2 + 22, 290); g.lineTo(W / 2 - 22, 290); g.fill();
  } else if (tipo === 2) { // floresta com mira
    g.fillStyle = grad(['#9fd6c8', '#3e7a5e', '#1b3324']); g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) {
      const x = (i * 97) % W; const h = 120 + (i * 53) % 140; const s = 0.6 + ((i * 31) % 10) / 12;
      g.fillStyle = i % 2 ? '#183a28' : '#21492f';
      g.beginPath(); g.moveTo(x, H - 40 - h * s); g.lineTo(x - 40 * s, H - 40); g.lineTo(x + 40 * s, H - 40); g.fill();
    }
    g.fillStyle = '#132a1c'; g.fillRect(0, H - 44, W, 44);
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(W / 2, H / 2, 12, 0, 7); g.moveTo(W / 2 - 22, H / 2); g.lineTo(W / 2 + 22, H / 2); g.moveTo(W / 2, H / 2 - 22); g.lineTo(W / 2, H / 2 + 22); g.stroke();
  } else { // masmorra vista de cima
    g.fillStyle = '#16120f'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 40) for (let x = 0; x < W; x += 40) { g.fillStyle = (x + y) % 80 ? '#2a221c' : '#241d18'; g.fillRect(x + 1, y + 1, 38, 38); }
    g.fillStyle = '#0b0907'; g.fillRect(120, 80, 40, 200); g.fillRect(360, 40, 200, 40); g.fillRect(480, 200, 40, 120);
    g.fillStyle = '#ffb347'; for (const [x, y] of [[300, 180], [210, 120], [440, 290]]) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
    g.fillStyle = '#6fd3ff'; g.beginPath(); g.arc(260, 240, 11, 0, 7); g.fill();
    const r = g.createRadialGradient(260, 240, 10, 260, 240, 260); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = r; g.fillRect(0, 0, W, H);
  }
  // selo vermelho de "ao vivo" (sem texto: vale para qualquer idioma)
  g.fillStyle = '#ef4444'; g.beginPath(); g.roundRect(18, 18, 58, 22, 6); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(34, 29, 5, 0, 7); g.fill();
  g.fillRect(46, 26, 22, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function suportaWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function criarCena(canvas, { reduzido = false, leve = false, imagemTela = null } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
  const dpr = Math.min(window.devicePixelRatio || 1, leve ? 1 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0x060508);
  cena.fog = new THREE.FogExp2(0x060508, 0.034);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 140);

  // rocha
  const rocha = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0, flatShading: true, side: THREE.DoubleSide });
  cena.add(new THREE.Mesh(paredeDeFora(), rocha));
  cena.add(new THREE.Mesh(chaoDeFora(), rocha));
  cena.add(new THREE.Mesh(tunel(), rocha));

  // luzes: lua fria do lado de fora, fogueira quente dentro, a tela no fundo
  cena.add(new THREE.HemisphereLight(0x3a4466, 0x0b0907, 0.9));
  const lua = new THREE.DirectionalLight(0x8f9cc4, 1.7);
  lua.position.set(-8, 14, 16);
  cena.add(lua);
  const fogo = new THREE.PointLight(0xff7a2e, 90, 34, 1.7);
  fogo.position.copy(FOGO).add(new THREE.Vector3(0, 1.1, 0));
  cena.add(fogo);
  const brilhoBoca = new THREE.PointLight(0xff8a40, 14, 16, 1.8);
  brilhoBoca.position.set(0.6, 1.6, -3.5);
  cena.add(brilhoBoca);

  // fogueira: pedras em volta, lenha e três chamas
  const grupoFogo = new THREE.Group();
  grupoFogo.position.copy(FOGO);
  const pedra = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 1, flatShading: true });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + (i % 3) * 0.06, 0), pedra);
    m.position.set(Math.cos(a) * 1.05, 0.12, Math.sin(a) * 1.05);
    m.rotation.set(i, i * 2, i * 3);
    grupoFogo.add(m);
  }
  const lenha = new THREE.MeshStandardMaterial({ color: 0x1c130d, roughness: 1, emissive: 0x3a0e02, emissiveIntensity: 0.8 });
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.6, 6), lenha);
    m.rotation.set(Math.PI / 2 - 0.35, (i / 4) * Math.PI * 2, 0);
    m.position.set(Math.cos((i / 4) * Math.PI * 2) * 0.25, 0.3, Math.sin((i / 4) * Math.PI * 2) * 0.25);
    grupoFogo.add(m);
  }
  const chamas = [chama(1.5, 2.6, 0.1), chama(1.1, 2.1, 0.57), chama(0.8, 1.6, 0.83)];
  chamas[1].position.set(0.25, 0, 0.1); chamas[2].position.set(-0.25, 0, -0.1);
  for (const c of chamas) grupoFogo.add(c);
  cena.add(grupoFogo);

  const qtd = leve ? 500 : 1400;
  const pontos = brasas(qtd);
  cena.add(pontos);

  // fumaça: placas suaves que sobem e saem pela boca
  const texFum = texturaFumaca();
  const fumacas = [];
  for (let i = 0; i < (leve ? 8 : 16); i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFum, color: 0x6a5a50, transparent: true, depthWrite: false, opacity: 0 }));
    s.userData = { fase: i / (leve ? 8 : 16), giro: (Math.random() - 0.5) * 0.6, lado: (Math.random() - 0.5) * 2 };
    cena.add(s); fumacas.push(s);
  }

  // as 4 telas ao vivo no corredor
  const telasVivo = [];
  const lugares = [[0.5, 4.15, -30.8, 0.15], [2.4, 2.55, -28.8, -0.45], [2.9, 0.95, -31.4, -0.5], [1.1, 3.95, -33.2, -0.15]];
  lugares.forEach(([x, y, z, giro], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.35), new THREE.MeshBasicMaterial({ map: texturaJogo(i), toneMapped: false, fog: false, side: THREE.DoubleSide }));
    const borda = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.45), new THREE.MeshBasicMaterial({ color: 0x0d0c10, fog: false, side: THREE.DoubleSide }));
    borda.position.z = -0.01;
    const g = new THREE.Group(); g.add(borda); g.add(m);
    g.position.set(x, y, z); g.rotation.y = giro;
    g.userData = { y, fase: i * 1.7 };
    cena.add(g); telasVivo.push(g);
  });
  const luzTelas = new THREE.PointLight(0x9fb0ff, 10, 12, 1.6);
  luzTelas.position.set(0, 2.4, -30);
  cena.add(luzTelas);

  // o app no fundo da caverna
  const grupoTela = new THREE.Group();
  grupoTela.position.set(0, 1.55, TELA_Z);
  const moldura = new THREE.Mesh(new THREE.PlaneGeometry(6.75, 4.32), new THREE.MeshStandardMaterial({ color: 0x0c0c0f, roughness: 0.5, metalness: 0.3 }));
  moldura.position.z = -0.03;
  grupoTela.add(moldura);
  const matTela = new THREE.MeshBasicMaterial({ color: 0x222226, toneMapped: false, fog: false });
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), matTela);
  grupoTela.add(tela);
  const luzTela = new THREE.PointLight(0xb8c4ff, 12, 14, 1.6);
  luzTela.position.set(0, 0, 2.2);
  grupoTela.add(luzTela);
  cena.add(grupoTela);
  if (imagemTela) {
    new THREE.TextureLoader().load(imagemTela, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      matTela.map = t; matTela.color.set(0xd8d8de); matTela.needsUpdate = true;
      desenhar();
    });
  }

  // pós: brilho (bloom) no fogo e nas brasas
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(cena, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), leve ? 0.55 : 0.7, 0.55, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let largo = innerWidth / innerHeight > 1.1;
  let curvas = caminhos(largo);
  const alvoPos = new THREE.Vector3(); const alvoOlha = new THREE.Vector3();
  const atualPos = new THREE.Vector3(); const atualOlha = new THREE.Vector3();
  let progresso = 0; let suave = 0; let primeiro = true;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

  const vista = { w: 1, h: 1, x: 0, y: 0, ultimoX: -1, ultimoY: -1 };
  // extra (0 a 1): no corredor das telas ao vivo o quadro anda um pouco mais, para as telas não ficarem atrás do texto
  function enquadrar(extra) {
    const dx = vista.x > 0 ? vista.x + extra * 0.13 : 0;
    const dy = vista.y * (1 - extra); // no celular o corredor volta ao centro para as telas aparecerem
    if (dx === vista.ultimoX && dy === vista.ultimoY) return;
    vista.ultimoX = dx; vista.ultimoY = dy;
    if (dx > 0 || dy > 0) camera.setViewOffset(vista.w, vista.h, -vista.w * dx, vista.h * dy, vista.w, vista.h); else camera.clearViewOffset();
  }

  function tamanho() {
    const w = canvas.clientWidth || innerWidth; const h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 68 : 52;
    // composição: em tela larga o quadro vai para a direita da coluna de texto; no celular a fogueira sobe para acima do texto
    vista.w = w; vista.h = h;
    vista.x = THREE.MathUtils.clamp((w / h - 1.1) / 0.5, 0, 1) * 0.11;
    vista.y = w / h < 0.8 ? 0.14 : 0;
    vista.ultimoX = -1;
    enquadrar(0);
    camera.updateProjectionMatrix();
    const l = w / h > 1.1;
    if (l !== largo) { largo = l; curvas = caminhos(largo); }
  }

  const relogio = new THREE.Timer();
  let tempo = 0;
  function quadro(agora) {
    relogio.update(agora);
    const dt = Math.min(relogio.getDelta(), 0.05);
    if (!reduzido) tempo += dt;
    suave = reduzido || primeiro ? progresso : suave + (progresso - suave) * Math.min(1, dt * 3.2);
    curvas.pos.getPoint(curvas.u(suave), alvoPos);
    curvas.olha.getPoint(curvas.u(suave), alvoOlha);
    mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 2.5);
    mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 2.5);
    alvoPos.x += mouse.sx * 0.45; alvoPos.y += mouse.sy * 0.25;
    if (primeiro) { atualPos.copy(alvoPos); atualOlha.copy(alvoOlha); primeiro = false; }
    atualPos.lerp(alvoPos, reduzido ? 1 : Math.min(1, dt * 6));
    atualOlha.lerp(alvoOlha, reduzido ? 1 : Math.min(1, dt * 6));
    camera.position.copy(atualPos);
    camera.lookAt(atualOlha);

    // fogo tremendo
    const tremor = 0.82 + 0.12 * Math.sin(tempo * 9.1) * Math.sin(tempo * 5.3 + 1) + 0.08 * Math.sin(tempo * 23.7);
    fogo.intensity = 90 * tremor;
    fogo.position.x = FOGO.x + Math.sin(tempo * 3.1) * 0.06;
    brilhoBoca.intensity = 14 * (0.9 + 0.1 * tremor);
    for (const c of chamas) c.material.uniforms.uTempo.value = tempo;
    pontos.material.uniforms.uTempo.value = tempo;
    pontos.material.uniforms.uEscala.value = renderer.getPixelRatio() * (canvas.clientHeight / 900);
    for (const s of fumacas) {
      const u = s.userData; const idade = (tempo * 0.055 + u.fase) % 1;
      const leva = idade * idade * 16;
      s.position.set(FOGO.x + u.lado * 0.6 - leva * 0.2, CHAO + 1.6 + idade * 6.5 - leva * 0.12, FOGO.z + leva);
      const esc = 1.5 + idade * 5;
      s.scale.set(esc, esc, 1);
      s.material.rotation = u.giro * tempo;
      s.material.opacity = Math.sin(idade * Math.PI) * 0.16;
    }
    // as telas ao vivo acendem quando a câmera chega no corredor e somem depois que ela passa
    const acende = THREE.MathUtils.smoothstep(suave, 0.56, 0.68) * (1 - THREE.MathUtils.smoothstep(suave, 0.88, 0.96));
    enquadrar(acende);
    for (const g of telasVivo) {
      g.visible = acende > 0.01;
      g.position.y = g.userData.y + Math.sin(tempo * 0.8 + g.userData.fase) * 0.08 - (1 - acende) * 0.6;
      g.scale.setScalar(0.6 + acende * 0.4);
      for (const m of g.children) { m.material.transparent = true; m.material.opacity = acende; }
    }
    luzTelas.intensity = 10 * acende;
    // a tela vira para quem chega
    const chegada = THREE.MathUtils.smoothstep(suave, 0.72, 0.97);
    grupoTela.visible = suave > 0.76;
    grupoTela.scale.setScalar(0.85 + 0.15 * THREE.MathUtils.smoothstep(suave, 0.76, 0.95));
    grupoTela.rotation.y = (1 - chegada) * 0.55;
    grupoTela.position.x = (1 - chegada) * 0.9;
    luzTela.intensity = 4 + chegada * 14;
    composer.render(dt);
  }

  let rodando = false; let pedido = 0;
  function laco(agora) { if (!rodando) return; quadro(agora); pedido = requestAnimationFrame(laco); }
  function desenhar() { if (!rodando) quadro(performance.now()); }

  tamanho();
  addEventListener('resize', () => { tamanho(); desenhar(); });
  if (!reduzido) {
    addEventListener('pointermove', (e) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = -(e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  }

  return {
    definirProgresso(p) { progresso = Math.min(1, Math.max(0, p)); },
    ligar() { if (rodando || reduzido) { desenhar(); return; } rodando = true; relogio.update(performance.now()); pedido = requestAnimationFrame(laco); },
    desligar() { rodando = false; cancelAnimationFrame(pedido); },
    desenhar,
    // para os testes: pula direto para um ponto (sem a câmera deslizar)
    irPara(p) { progresso = suave = Math.min(1, Math.max(0, p)); primeiro = true; quadro(performance.now()); },
    // para os testes: o que a câmera está vendo agora
    estado: () => ({ progresso, suave, camera: camera.position.toArray().map((v) => +v.toFixed(2)), brasas: qtd, dpr }),
  };
}
