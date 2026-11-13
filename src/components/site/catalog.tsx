import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { finishOrder, kinds, originNames, outdoorLabel, products, productTitle, useNames, type Finish, type Kind, type OriginId, type Product } from "../../site-data";
import { normalize, prefersReducedMotion } from "./fx";
import { IconCheck, IconPlus, IconSearch, IconClose, IconRotate } from "./icons";
import { useRequest } from "./request";
import type { CalcDetail } from "./calculator";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type OriginFilter = OriginId | "all";
type KindFilter = Kind | "all";
type FinishFilter = Finish | "all";

const haystack = new Map(
  products.map((p) => [
    p.id,
    normalize(
      [p.kind, p.variant ?? "", p.size, originNames[p.origin], p.origin, ...(p.finishes ?? []), p.note ?? "", p.use ? useNames[p.use] : "", p.outdoor ? `${outdoorLabel} خارجي حوش ساحه` : "", `${p.w} ${p.h}`, `${p.h} ${p.w}`].join(" "),
    ),
  ]),
);

export function openCalculator(p: Product) {
  const detail: CalcDetail = { id: p.id, w: p.w, h: p.h, title: productTitle(p), origin: originNames[p.origin], kind: p.kind, use: p.use, outdoor: !!p.outdoor };
  window.dispatchEvent(new CustomEvent("am:calc", { detail }));
  document.getElementById("calculator")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function Catalog() {
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const [finish, setFinish] = useState<FinishFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKind = (e: Event) => {
      const k = (e as CustomEvent<KindFilter>).detail;
      setKind(k);
      setOrigin("all");
      setFinish("all");
      setQuery("");
    };
    window.addEventListener("am:kind", onKind);
    return () => window.removeEventListener("am:kind", onKind);
  }, []);

  const tokens = normalize(query).split(" ").filter(Boolean);
  const matches = (p: Product, skip?: "origin" | "kind" | "finish") =>
    (skip === "origin" || origin === "all" || p.origin === origin) &&
    (skip === "kind" || kind === "all" || p.kind === kind) &&
    (skip === "finish" || finish === "all" || (p.finishes ?? []).includes(finish)) &&
    tokens.every((t) => haystack.get(p.id)!.includes(t));

  const list = products.filter((p) => matches(p));
  const count = (pred: (p: Product) => boolean, skip: "origin" | "kind" | "finish") => products.filter((p) => matches(p, skip) && pred(p)).length;
  const filtersOn = origin !== "all" || kind !== "all" || finish !== "all" || tokens.length > 0;
  const reset = () => {
    setOrigin("all");
    setKind("all");
    setFinish("all");
    setQuery("");
  };

  // تحريك إعادة ترتيب البطاقات عند تغيير الفلاتر (تقنية FLIP).
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const prevRects = useRef(new Map<string, DOMRect>());
  const listKey = list.map((p) => p.id).join(",");
  useIsoLayoutEffect(() => {
    const next = new Map<string, DOMRect>();
    cardRefs.current.forEach((el, id) => next.set(id, el.getBoundingClientRect()));
    if (!prefersReducedMotion() && prevRects.current.size) {
      next.forEach((rect, id) => {
        const el = cardRefs.current.get(id);
        if (!el || typeof el.animate !== "function") return;
        const prev = prevRects.current.get(id);
        if (prev) {
          const dx = prev.left - rect.left;
          const dy = prev.top - rect.top;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
            el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 480, easing: "cubic-bezier(.2,.8,.2,1)" });
        } else {
          el.animate([{ opacity: 0, transform: "translateY(18px) scale(.94)" }, { opacity: 1, transform: "none" }], {
            duration: 420,
            easing: "cubic-bezier(.2,.8,.2,1)",
          });
        }
      });
    }
    prevRects.current = next;
  }, [listKey]);

  const finishesInUse = finishOrder.filter((f) => products.some((p) => p.finishes?.includes(f)));

  return (
    <section className="sec sec-catalog" id="catalog">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2 className="h2">كتالوج الأصناف</h2>
          <p className="lead">ابحث وصفِّ حسب بلد الصناعة ونوع البلاط واللمعة. كل بلاطة مرسومة بنسبة مقاسها الحقيقي لتقارن بين المقاسات بسهولة.</p>
        </div>

        <div className="cat-tools" data-reveal>
          <label className="search">
            <IconSearch />
            <span className="sr-only">ابحث في الأصناف</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث: بورسلين 120، كوطو، حائطي..." />
            {query ? (
              <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="مسح البحث">
                <IconClose />
              </button>
            ) : null}
          </label>

          <div className="chips" role="group" aria-label="بلد الصناعة">
            <Chip on={origin === "all"} onClick={() => setOrigin("all")} label="كل المصادر" n={count(() => true, "origin")} />
            {(Object.keys(originNames) as OriginId[]).map((o) => (
              <Chip key={o} on={origin === o} onClick={() => setOrigin(o)} label={originNames[o]} n={count((p) => p.origin === o, "origin")} />
            ))}
          </div>

          <div className="chips" role="group" aria-label="نوع البلاط">
            <Chip on={kind === "all"} onClick={() => setKind("all")} label="كل الأنواع" n={count(() => true, "kind")} />
            {kinds.map((k) => (
              <Chip key={k} on={kind === k} onClick={() => setKind(k)} label={k} n={count((p) => p.kind === k, "kind")} />
            ))}
          </div>

          <div className="chips chips-soft" role="group" aria-label="درجة اللمعة">
            <span className="chips-label">اللمعة:</span>
            <Chip on={finish === "all"} onClick={() => setFinish("all")} label="الكل" />
            {finishesInUse.map((f) => (
              <Chip key={f} on={finish === f} onClick={() => setFinish(f)} label={f} n={count((p) => !!p.finishes?.includes(f), "finish")} />
            ))}
          </div>
        </div>

        <div className="cat-status" aria-live="polite">
          <span>
            {list.length === 0 ? "لا توجد أصناف مطابقة" : `${list.length} ${list.length === 1 ? "صنف" : list.length === 2 ? "صنفان" : list.length <= 10 ? "أصناف" : "صنفاً"}`}
          </span>
          {filtersOn ? (
            <button type="button" className="btn btn-text" onClick={reset}>
              <IconRotate /> إعادة ضبط
            </button>
          ) : null}
        </div>

        {list.length === 0 ? (
          <div className="cat-empty">
            <p>لم نجد صنفاً يطابق بحثك.</p>
            <p className="muted">جرّب كلمة أخرى مثل «بورسلين» أو مقاساً مثل «60».</p>
            <button type="button" className="btn btn-primary" onClick={reset}>
              عرض كل الأصناف
            </button>
          </div>
        ) : (
          <div className="cat-grid">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                cardRef={(el) => {
                  if (el) cardRefs.current.set(p.id, el);
                  else cardRefs.current.delete(p.id);
                }}
              />
            ))}
          </div>
        )}
        <p className="muted small cat-note">الأشكال توضيحية للمقاس واللمعة، والألوان والنقشات المتوفرة تُعرض في الفروع.</p>
      </div>
    </section>
  );
}

function Chip({ on, onClick, label, n }: { on: boolean; onClick: () => void; label: string; n?: number }) {
  return (
    <button type="button" className={`chip ${on ? "is-on" : ""}`} aria-pressed={on} onClick={onClick} disabled={!on && n === 0}>
      {label}
      {typeof n === "number" ? <span className="chip-n">{n}</span> : null}
    </button>
  );
}

function ProductCard({ product: p, cardRef }: { product: Product; cardRef: (el: HTMLElement | null) => void }) {
  const { add, has } = useRequest();
  const [finish, setFinish] = useState<Finish | undefined>(p.finishes?.[0]);
  const stageRef = useRef<HTMLDivElement>(null);
  const added = has(p.id);
  const tiles = p.decor ? 2 : 1;
  const gloss = finish ?? (p.look === "marble" ? "لمعة" : p.look === "pool" ? "لمعة" : "مطفي");

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || e.pointerType === "touch" || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - y) * 16).toFixed(1)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 20).toFixed(1)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(0)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(0)}%`);
  };
  const onLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
    el.style.removeProperty("--gx");
    el.style.removeProperty("--gy");
  };

  return (
    <article className="pc" ref={cardRef}>
      <div className="pc-stage" ref={stageRef} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="pc-tiles" style={{ "--n": tiles } as CSSProperties}>
          <span className="pc-tile" data-look={p.look} data-gloss={gloss} style={{ "--w": p.w, "--h": p.h } as CSSProperties} />
          {p.decor ? <span className="pc-tile" data-look="decor" data-gloss="لمعة" style={{ "--w": p.w, "--h": p.h } as CSSProperties} /> : null}
        </div>
        <span className="pc-dim">{p.size}</span>
      </div>
      <div className="pc-body">
        <span className={`pc-origin pc-origin-${p.origin}`}>{originNames[p.origin]}</span>
        <h3>{p.variant ? `${p.kind} ${p.variant}` : p.kind}</h3>
        <p className="pc-size">{p.size}</p>
        {p.outdoor || p.use ? <p className="pc-use">{p.outdoor ? outdoorLabel : useNames[p.use!]}</p> : null}
        {p.note ? <p className="pc-note">{p.note}</p> : null}
        {p.finishes && p.finishes.length > 1 ? (
          <div className="pc-finishes" role="radiogroup" aria-label={`لمعات ${productTitle(p)}`}>
            {p.finishes.map((f) => (
              <button key={f} type="button" role="radio" aria-checked={f === finish} className={`pc-fin ${f === finish ? "is-on" : ""}`} onClick={() => setFinish(f)}>
                {f}
              </button>
            ))}
          </div>
        ) : p.finishes ? (
          <p className="pc-note">اللمعة: {p.finishes[0]}</p>
        ) : null}
        <div className="pc-actions">
          <button
            type="button"
            className={`btn btn-sm ${added ? "btn-done" : "btn-primary"}`}
            onClick={() =>
              add({
                key: p.id,
                title: productTitle(p),
                detail: [originNames[p.origin], finish && p.finishes && p.finishes.length > 1 ? `لمعة: ${finish}` : "", p.note ?? ""].filter(Boolean).join("، "),
              })
            }
          >
            {added ? <IconCheck /> : <IconPlus />} {added ? "في طلبك" : "أضف لطلبي"}
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => openCalculator(p)}>
            احسب الكمية
          </button>
        </div>
      </div>
    </article>
  );
}
