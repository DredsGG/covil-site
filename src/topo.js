// Altura REAL do topo fixo. Com o texto a 200% ele quebra em duas linhas e fica mais alto que --altura-topo;
// âncoras e foco por teclado precisam parar abaixo dele (WCAG 2.4.11). Só muda uma variável (el.style é permitido pela CSP).
const topo = document.querySelector('.topo');
if (topo && 'ResizeObserver' in window) {
  const medir = () => document.documentElement.style.setProperty('--topo-real', `${Math.ceil(topo.getBoundingClientRect().height)}px`);
  new ResizeObserver(medir).observe(topo);
  medir();
}
