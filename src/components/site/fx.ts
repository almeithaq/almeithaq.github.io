// أدوات الحركة والتفاعل. كلها تعمل في المتصفح فقط وتحترم تفضيل تقليل الحركة.

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

// ظهور متدرج للعناصر [data-reveal] عند الوصول إليها. العناصر الظاهرة من البداية لا تُخفى أبداً.
export function setupReveal() {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );
  const vh = window.innerHeight;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))) {
    if (el.getBoundingClientRect().top < vh * 0.95) continue;
    el.classList.add("is-armed");
    io.observe(el);
  }
  // احتياط: لا يبقى أي عنصر مخفياً إذا لم يصله التمرير بشكل طبيعي (طباعة، قفز مباشر لرابط).
  const reveal = () => document.querySelectorAll(".is-armed:not(.is-in)").forEach((el) => el.classList.add("is-in"));
  window.addEventListener("beforeprint", reveal);
  window.addEventListener("hashchange", reveal);
  return () => {
    io.disconnect();
    window.removeEventListener("beforeprint", reveal);
    window.removeEventListener("hashchange", reveal);
  };
}

// حركة عمق خفيفة: العنصر [data-parallax] يحرك أول ابن له أثناء التمرير.
export function setupParallax() {
  if (prefersReducedMotion()) return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
  let raf = 0;
  const run = () => {
    raf = 0;
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const speed = Number(el.dataset.parallax) || 0.08;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.setProperty("--py", `${offset.toFixed(1)}px`);
    }
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

// أزرار تنجذب قليلاً نحو المؤشر [data-magnetic]، للفأرة فقط.
export function setupMagnetic() {
  if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  let current: HTMLElement | null = null;
  const reset = () => {
    if (current) current.style.transform = "";
    current = null;
  };
  const move = (e: PointerEvent) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>("[data-magnetic]") ?? null;
    if (el !== current) reset();
    if (!el) return;
    current = el;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  };
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerleave", reset);
  return () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerleave", reset);
    reset();
  };
}

// تحويل النص للبحث: توحيد الهمزات والتاء المربوطة والأرقام العربية وعلامة الضرب.
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[×x*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// يقرأ رقماً كتبه الزائر بالأرقام العربية أو الإنجليزية، مع الفاصلة العربية.
export function parseNumber(s: string) {
  const t = s
    .trim()
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[٫,]/g, ".");
  if (!/^\d*\.?\d+$/.test(t)) return NaN;
  return Number(t);
}

// وقت غروب الشمس (المغرب) بالدقائق من منتصف الليل بالتوقيت المحلي، بخوارزمية التقويم الفلكي المختصرة.
export function sunsetMinutes(date: Date, lat: number, lng: number, utcOffset: number) {
  const rad = Math.PI / 180;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
  const lngHour = lng / 15;
  const t = day + (18 - lngHour) / 24;
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90;
  RA /= 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH < -1 || cosH > 1) return null;
  const H = Math.acos(cosH) / rad / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  const UT = (((T - lngHour) % 24) + 24) % 24;
  return Math.round(((UT + utcOffset) % 24) * 60);
}

export function formatClock(minutes: number) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "ص" : "م"}`;
}

export function formatNumber(n: number, digits = 2) {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}
