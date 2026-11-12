// يستدعي cb بنسبة ظهور العنصر أثناء التمرير (0 عند دخوله، 1 عند خروجه).
export function onViewProgress(el: HTMLElement, cb: (p: number) => void) {
  let raf = 0;
  const run = () => {
    raf = 0;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    cb(Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))));
  };
  const on = () => {
    if (!raf) raf = requestAnimationFrame(run);
  };
  run();
  window.addEventListener("scroll", on, { passive: true });
  window.addEventListener("resize", on);
  return () => {
    window.removeEventListener("scroll", on);
    window.removeEventListener("resize", on);
    if (raf) cancelAnimationFrame(raf);
  };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
