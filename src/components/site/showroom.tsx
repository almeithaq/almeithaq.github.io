import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { floorCement, floorLooks, type Kind } from "../../site-data";
import { prefersReducedMotion } from "./fx";
import { IconArrow, IconGrid } from "./icons";

// غرفة العرض التفاعلية: نفس الصالة بعدة أرضيات. اختيار أرضية يقلب البلاط واحدة تلو الأخرى من نقطة النقر.

const AUTOPLAY_MS = 5600;
const INTRO_MS = 2700;

type Geo = { w: number; h: number; bgw: number; bgh: number; ox: number; oy: number };

const layerVars = (image: string) => ({ "--img": `url(${image}.jpg)` }) as CSSProperties;

export function filterCatalog(kind: Kind | "all") {
  window.dispatchEvent(new CustomEvent("am:kind", { detail: kind }));
  document.getElementById("catalog")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function Showroom() {
  const stageRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<Geo | null>(null);
  const activeRef = useRef(0);
  const finishRef = useRef<(() => void) | null>(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const [cycle, setCycle] = useState(0);

  // حساب أبعاد الصورة المعروضة (مثل background-size: cover) حتى تتطابق البلاطات المقلوبة مع الصورة تماماً.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const ar = 16 / 9;
      const mobile = w < 760;
      const px = mobile ? 0.6 : 0.5;
      const py = 0.62;
      const bgw = w / h > ar ? w : h * ar;
      const bgh = w / h > ar ? w / ar : h;
      const ox = (w - bgw) * px;
      const oy = (h - bgh) * py;
      geoRef.current = { w, h, bgw, bgh, ox, oy };
      stage.style.setProperty("--bgw", `${bgw}px`);
      stage.style.setProperty("--bgh", `${bgh}px`);
      stage.style.setProperty("--ox", `${ox}px`);
      stage.style.setProperty("--oy", `${oy}px`);
      stage.classList.add("is-measured");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // نهاية مشهد التشطيب الافتتاحي (تحريكه بالـ CSS حتى يعمل قبل تحميل السكربت).
  useEffect(() => {
    const t = window.setTimeout(
      () => {
        const base = baseRef.current;
        if (base) Object.entries(layerVars(floorLooks[0].image)).forEach(([k, v]) => base.style.setProperty(k, String(v)));
        setIntroDone(true);
      },
      prefersReducedMotion() ? 0 : INTRO_MS,
    );
    return () => window.clearTimeout(t);
  }, []);

  const go = useCallback((next: number, origin?: { x: number; y: number }) => {
    if (next === activeRef.current) return;
    finishRef.current?.();
    const stage = stageRef.current;
    const grid = gridRef.current;
    const base = baseRef.current;
    const geo = geoRef.current;
    const look = floorLooks[next];
    const applyBase = () => {
      if (base) Object.entries(layerVars(look.image)).forEach(([k, v]) => base.style.setProperty(k, String(v)));
    };
    activeRef.current = next;
    setActive(next);
    if (!stage || !grid || !geo || prefersReducedMotion() || typeof grid.animate !== "function") {
      applyBase();
      return;
    }

    // نغطي الأرضية فقط (النصف السفلي من الصورة) بشبكة بلاطات.
    const floorTop = Math.max(0, geo.oy + geo.bgh * 0.48);
    const cell = geo.w < 760 ? 46 : 74;
    const cols = Math.ceil(geo.w / cell);
    const rows = Math.ceil((geo.h - floorTop) / cell);
    const ox = origin?.x ?? geo.w * 0.5;
    const oy = origin?.y ?? geo.h;
    Object.entries(layerVars(look.image)).forEach(([k, v]) => grid.style.setProperty(k, String(v)));

    // منطقة الكرسي في الصورة: تتلاشى بدل أن تنقلب حتى لا يتقطع شكله أثناء الحركة.
    const chair = { x0: geo.ox + geo.bgw * 0.61, x1: geo.ox + geo.bgw * 0.86, y0: geo.oy + geo.bgh * 0.46, y1: geo.oy + geo.bgh * 0.82 };
    const frag = document.createDocumentFragment();
    const cells: { el: HTMLElement; d: number; fade: boolean }[] = [];
    let maxD = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cell;
        const y = floorTop + r * cell;
        const el = document.createElement("i");
        el.className = "sr-cell";
        el.style.cssText = `left:${x}px;top:${y}px;width:${cell + 1}px;height:${cell + 1}px;--cx:${x}px;--cy:${y}px`;
        const d = Math.hypot(x + cell / 2 - ox, y + cell / 2 - oy);
        maxD = Math.max(maxD, d);
        const fade = x + cell > chair.x0 && x < chair.x1 && y + cell > chair.y0 && y < chair.y1;
        cells.push({ el, d, fade });
        frag.appendChild(el);
      }
    }
    grid.replaceChildren(frag);

    const animations = cells.map(({ el, d, fade }) =>
      el.animate(
        fade
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { transform: "perspective(520px) rotateX(-90deg) scale(.84)", filter: "brightness(1)" },
              { transform: "perspective(520px) rotateX(12deg) scale(1.02)", filter: "brightness(1.55)", offset: 0.72 },
              { transform: "none", filter: "brightness(1)" },
            ],
        { duration: fade ? 700 : 620, delay: (d / maxD) * 900, easing: "cubic-bezier(.22,.7,.25,1)", fill: "backwards" },
      ),
    );

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      animations.forEach((a) => a.cancel());
      applyBase();
      grid.replaceChildren();
      finishRef.current = null;
    };
    finishRef.current = finish;
    Promise.all(animations.map((a) => a.finished))
      .then(finish)
      .catch(() => {
        /* أُلغيت الحركة لصالح اختيار أحدث */
      });
  }, []);

  // التبديل التلقائي حتى يتفاعل الزائر، فقط عندما يكون القسم ظاهراً.
  useEffect(() => {
    if (!introDone || !auto || prefersReducedMotion()) return;
    const stage = stageRef.current;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.2 });
    if (stage) io.observe(stage);
    const t = window.setInterval(() => {
      if (!visible || document.hidden) return;
      const geo = geoRef.current;
      const next = (activeRef.current + 1) % floorLooks.length;
      go(next, geo ? { x: geo.w * (0.3 + Math.random() * 0.4), y: geo.h * 0.92 } : undefined);
      setCycle((c) => c + 1);
    }, AUTOPLAY_MS);
    return () => {
      window.clearInterval(t);
      io.disconnect();
    };
  }, [introDone, auto, go]);

  const pick = (i: number, origin?: { x: number; y: number }) => {
    setAuto(false);
    go(i, origin);
  };

  const onStageClick = (e: MouseEvent<HTMLDivElement>) => {
    const geo = geoRef.current;
    const stage = stageRef.current;
    if (!geo || !stage || !introDone) return;
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (y < geo.oy + geo.bgh * 0.48) return;
    pick((activeRef.current + 1) % floorLooks.length, { x, y });
  };

  const onDockKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (active + keys[e.key] + floorLooks.length) % floorLooks.length;
    pick(next);
    const btn = e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]")[next];
    btn?.focus();
  };

  const look = floorLooks[active];

  return (
    <section className="sr" id="top" aria-label="غرفة العرض">
      <div className="sr-stage" ref={stageRef} onClick={onStageClick}>
        <div className="sr-layer sr-base" ref={baseRef} style={layerVars(floorCement)} />
        {!introDone ? <div className="sr-layer sr-intro" style={layerVars(floorLooks[0].image)} /> : null}
        {!introDone ? <span className="sr-ring" aria-hidden="true" /> : null}
        <div className="sr-grid" ref={gridRef} aria-hidden="true" />
        <div className="sr-shade" aria-hidden="true" />
      </div>

      <div className="wrap sr-content">
        <div className="sr-copy">
          <p className="sr-kicker">
            <span className="sr-dot" aria-hidden="true" /> {`سيراميك • بورسلين • كوطو • رخام • مواد صحية`}
          </p>
          <h1>
            بيتك يبدأ
            <br />
            <span>من الأرضية</span>
          </h1>
          <p className="sr-sub">جرّب الأرضيات على نفس الصالة، ثم اختر من أصنافنا الليبية والهندية والتركية في فرعينا بتاجوراء.</p>
          <div className="sr-cta">
            <a href="#catalog" className="btn btn-light btn-lg" data-magnetic>
              تصفح الأصناف <IconArrow />
            </a>
            <a href="#calculator" className="btn btn-outline-light btn-lg" data-magnetic>
              احسب كميتك
            </a>
          </div>
        </div>

        <div className="sr-dock">
          <div className="sr-dock-head">
            <span>جرّب أرضية الصالة</span>
            <span className="sr-hint">أو انقر على الأرضية</span>
          </div>
          <div className="sr-swatches" role="radiogroup" aria-label="اختر أرضية للصالة" onKeyDown={onDockKey}>
            {floorLooks.map((f, i) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={i === active}
                tabIndex={i === active ? 0 : -1}
                className={`sr-swatch ${i === active ? "is-on" : ""}`}
                onClick={(e) => {
                  const geo = geoRef.current;
                  const stage = stageRef.current;
                  if (geo && stage) {
                    const r = stage.getBoundingClientRect();
                    const b = e.currentTarget.getBoundingClientRect();
                    pick(i, { x: b.left + b.width / 2 - r.left, y: geo.h });
                  } else pick(i);
                }}
              >
                <span className="sr-swatch-img" style={{ backgroundImage: `url(${f.swatch})` }}>
                  {i === active && auto && introDone ? <span key={cycle} className="sr-progress" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} /> : null}
                </span>
                <span className="sr-swatch-name">{f.name}</span>
              </button>
            ))}
          </div>
          <div className="sr-now" aria-live="polite">
            <div>
              <strong>{look.name}</strong>
              <span>{look.detail}</span>
            </div>
            <button type="button" className="sr-more" onClick={() => filterCatalog(look.kind)}>
              <IconGrid /> أصناف {look.kind}
            </button>
          </div>
        </div>
      </div>
      <p className="sr-note">صور توضيحية للتصميم، والألوان والنقشات حسب المتوفر في الفروع.</p>
    </section>
  );
}
