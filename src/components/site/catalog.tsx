import { useEffect, useRef, useState, type CSSProperties } from "react";
import { finishes, origins, type OriginId } from "../../site-data";
import { onViewProgress, prefersReducedMotion } from "./fx";

const tile = (w: number, h: number, i: number) => ({ "--w": w, "--h": h, "--i": i }) as CSSProperties;

export function Catalog() {
  const [active, setActive] = useState<OriginId>("libya");
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOrigin = (e: Event) => setActive((e as CustomEvent<OriginId>).detail);
    window.addEventListener("am:origin", onOrigin);
    return () => window.removeEventListener("am:origin", onOrigin);
  }, []);

  useEffect(() => {
    const el = finRef.current;
    if (!el || prefersReducedMotion()) return;
    let hovering = false;
    const setX = (x: number) => el.style.setProperty("--sx", x.toFixed(3));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hovering = true;
      const r = el.getBoundingClientRect();
      setX(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    };
    const onLeave = () => {
      hovering = false;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    const stop = onViewProgress(el, (p) => {
      if (!hovering) setX(0.1 + p * 0.8);
    });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      stop();
    };
  }, []);

  return (
    <section className="am-section am-grout" id="catalog">
      <div className="am-wrap">
        <h2 className="am-h2">أصنافنا بالمقاس الحقيقي</h2>
        <p className="am-lead">كل بلاطة مرسومة بنسبة مقاسها الفعلي، لتقارن بين المقاسات قبل زيارتنا.</p>
        <div className="am-tabs" role="tablist" aria-label="بلد الصناعة">
          {origins.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              id={`tab-${o.id}`}
              aria-selected={active === o.id}
              aria-controls={`panel-${o.id}`}
              className="am-tab"
              onClick={() => setActive(o.id)}
            >
              {o.title} <small>{o.products.length === 2 ? "صنفان" : `${o.products.length} أصناف`}</small>
            </button>
          ))}
        </div>
        {origins.map((o) => (
          <div
            key={o.id}
            role="tabpanel"
            id={`panel-${o.id}`}
            aria-labelledby={`tab-${o.id}`}
            hidden={active !== o.id}
            className="am-panel"
          >
            <div className="am-shelf">
              {o.products.map((p, i) => (
                <article key={`${p.kind}-${p.size}`} className="am-item">
                  <div className="am-item-fig" aria-hidden="true">
                    <span className="am-tile" data-look={p.look} style={tile(p.w, p.h, i)} />
                    {p.decor ? <span className="am-tile" data-look="decor" style={tile(p.w, p.h, i + 1)} /> : null}
                  </div>
                  <div>
                    <h4>{p.kind}</h4>
                    <span className="am-size">{p.size}</span>
                    {p.finishes ? <p>{p.finishes.join("، ")}</p> : null}
                    {p.note ? <p>{p.note}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
        <div className="am-finishes" ref={finRef}>
          <h3>لمعات البورسلين الهندي 120×60</h3>
          <p className="am-lead">حرّك المؤشر أو مرّر الصفحة لترى الفرق في انعكاس الضوء.</p>
          <div className="am-fin-grid">
            {finishes.map((f) => (
              <figure key={f.id} className="am-fin" data-f={f.id}>
                <div className="am-fin-tile" aria-hidden="true" />
                <figcaption>
                  <strong>{f.name}</strong>
                  <span>{f.text}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
