import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  designById,
  designLabel,
  designs,
  designsForProduct,
  isRect,
  originNames,
  productById,
  productTitle,
  sceneImage,
  sceneKinds,
  scenes,
  setById,
  type Design,
} from "../../site-data";
import { openCalculator } from "./catalog";
import { IconCheck, IconChevron, IconClose, IconPlus } from "./icons";
import { useRequest } from "./request";

// تصاميم البيوت والحمامات، وعارض الصور الحقيقية لأصناف الكتالوج.

export const designRequestItem = (d: Design) => {
  const p = productById(d.productId);
  return {
    key: `${d.productId}:${d.id}`,
    title: `${p ? productTitle(p) : ""}، ${designLabel(d)}`,
    detail: [p ? originNames[p.origin] : "", d.look].filter(Boolean).join("، "),
  };
};

// شريحة في العارض: صورة كبيرة، ومعها التصميم الحقيقي المرتبط بها.
export type Slide = { image: string; thumb: string; alt: string; title: string; note?: string; design: Design; inset?: boolean; shape?: string };

export const productSlidesFor = (productId: string): Slide[] => {
  const p = productById(productId);
  return designsForProduct(productId).flatMap((d) => {
    const main: Slide = {
      image: d.image,
      thumb: d.tiny,
      alt: `صورة حقيقية: ${p ? productTitle(p) : ""}، ${designLabel(d)}، ${d.look}`,
      title: designLabel(d),
      note: setById(d.setId)?.isNew ? `جديد: ${d.look}` : d.look,
      design: d,
      shape: setById(d.setId)?.shape,
    };
    // قطع أخرى من نفس الكود تظهر بعد صورتها الأولى.
    const more: Slide[] = d.more.map((m) => ({ ...main, image: m.image, thumb: m.tiny, alt: `${main.alt}، قطعة ثانية`, note: `${d.look} (قطعة ثانية من نفس الكود)` }));
    return [main, ...more];
  });
};

const sceneSlides: Slide[] = scenes.flatMap((s) => {
  const d = designById(s.designId);
  if (!d) return [];
  const p = productById(d.productId);
  return [
    {
      image: sceneImage(s).large,
      thumb: sceneImage(s).thumb,
      alt: `${s.title}: تصميم توضيحي يُظهر ${p ? productTitle(p) : "البلاط"} على ${s.surface}`,
      title: s.title,
      note: `تصميم توضيحي، البلاط على ${s.surface}`,
      design: d,
      inset: true,
    },
  ];
});

// يفتح العارض من أي مكان في الصفحة.
export function openViewer(slides: Slide[], index = 0, heading = "") {
  window.dispatchEvent(new CustomEvent("am:viewer", { detail: { slides, index, heading } }));
}

export function Viewer() {
  const { add, has } = useRequest();
  const [state, setState] = useState<{ slides: Slide[]; index: number; heading: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    const on = (e: Event) => setState((e as CustomEvent).detail);
    window.addEventListener("am:viewer", on);
    return () => window.removeEventListener("am:viewer", on);
  }, []);

  const open = state !== null;
  useEffect(() => {
    if (!open) return;
    const last = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("no-scroll");
    closeRef.current?.focus();
    return () => {
      document.documentElement.classList.remove("no-scroll");
      last?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const n = state?.slides.length ?? 0;
  const go = (i: number) => setState((s) => (s ? { ...s, index: ((i % n) + n) % n } : s));

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState(null);
      if (e.key === "ArrowLeft") go(state.index + 1);
      if (e.key === "ArrowRight") go(state.index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!state) return null;
  const slide = state.slides[state.index];
  const d = slide.design;
  const p = productById(d.productId);
  const item = designRequestItem(d);
  const added = has(item.key);
  const set = setById(d.setId);

  return (
    <div className="vw" role="dialog" aria-modal="true" aria-label={state.heading || slide.title} onClick={() => setState(null)}>
      <div className="vw-box" onClick={(e) => e.stopPropagation()}>
        <div
          className={`vw-stage ${slide.shape ? `is-${slide.shape}` : "is-scene"}`}
          onTouchStart={(e) => {
            touch.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (dx > 50) go(state.index + 1);
            if (dx < -50) go(state.index - 1);
          }}
        >
          <img key={slide.image} src={slide.image} alt={slide.alt} />
          {slide.inset ? <span className="vw-badge">تصميم توضيحي</span> : null}
          {n > 1 ? (
            <>
              <button type="button" className="icon-btn vw-prev" onClick={() => go(state.index - 1)} aria-label="السابق">
                <IconChevron dir="right" />
              </button>
              <button type="button" className="icon-btn vw-next" onClick={() => go(state.index + 1)} aria-label="التالي">
                <IconChevron dir="left" />
              </button>
            </>
          ) : null}
        </div>

        <aside className="vw-side">
          {state.heading ? <p className="vw-heading">{state.heading}</p> : null}
          <h3>
            {slide.title} <span>{n > 1 ? `${state.index + 1} / ${n}` : ""}</span>
          </h3>
          {slide.note ? <p className="vw-note">{slide.note}</p> : null}

          <div className="vw-tile">
            {slide.inset ? <img src={d.thumb} alt="" /> : null}
            <div>
              <small>{slide.inset ? "البلاطة المستخدمة (صورة حقيقية)" : "صورة حقيقية من المعرض"}</small>
              <strong>{p ? productTitle(p) : ""}</strong>
              <span>
                {p ? originNames[p.origin] : ""}، {designLabel(d)}: {d.look}
              </span>
            </div>
          </div>

          <div className="vw-actions">
            <button type="button" className={`btn btn-sm ${added ? "btn-done" : "btn-primary"}`} onClick={() => add(item)}>
              {added ? <IconCheck /> : <IconPlus />} {added ? "في طلبك" : "أضف هذا التصميم لطلبي"}
            </button>
            {p && isRect(p) ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setState(null);
                  openCalculator(p);
                }}
              >
                احسب الكمية
              </button>
            ) : null}
            {slide.inset && set ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  const all = productSlidesFor(d.productId);
                  setState({ slides: all, index: Math.max(0, all.findIndex((x) => x.design.id === d.id)), heading: p ? productTitle(p) : "" });
                }}
              >
                كل صور الصنف ({productSlidesFor(d.productId).length})
              </button>
            ) : null}
          </div>

          {n > 1 ? (
            <div className="vw-thumbs" role="group" aria-label="اختر صورة">
              {state.slides.map((s, i) => (
                <button key={s.image} type="button" className={i === state.index ? "is-on" : ""} aria-pressed={i === state.index} onClick={() => go(i)} aria-label={s.title}>
                  <img src={s.thumb} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
      <button ref={closeRef} type="button" className="icon-btn vw-close" onClick={() => setState(null)} aria-label="إغلاق">
        <IconClose />
      </button>
    </div>
  );
}

// قسم تصاميم البيوت والحمامات: شبكة بطاقات، الأولى كبيرة والأخيرتان عريضتان.
export function Designs() {
  return (
    <section className="sec sec-dz" id="designs">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2 className="h2">تصاميم البيوت والحمامات</h2>
          <p className="lead">كيف تبدو أرضية بيتك أو حيطان حمّامك ببلاطنا؟ كل تصميم مصنوع من صورة بلاطة حقيقية من أصنافنا. اضغط على التصميم لترى البلاطة نفسها.</p>
        </div>
        <ul className="dz">
          {scenes.map((s, i) => {
            const d = designById(s.designId);
            const p = d ? productById(d.productId) : undefined;
            return (
              <li key={s.id} className={`dz-cell dz-${i}`} data-reveal style={{ "--d": `${i * 70}ms` } as CSSProperties}>
                <button type="button" className="dz-card" onClick={() => openViewer(sceneSlides, i, "تصاميم البيوت والحمامات")} aria-label={`${s.title}: افتح التصميم والبلاطة المستخدمة`}>
                  <img src={sceneImage(s).medium} alt="" loading="lazy" width={960} height={720} />
                  <span className="dz-kind">{sceneKinds[s.kind]}</span>
                  <span className="dz-cap">
                    {d ? <img className="dz-chip" src={d.tiny} alt="" loading="lazy" /> : null}
                    <span>
                      <strong>{s.title}</strong>
                      <span>{p ? productTitle(p) : ""}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="muted small dz-note">
          الصور تصاميم توضيحية أُعدّت بالحاسوب من صور بلاطنا الحقيقية، وقد يختلف اللون قليلاً عن الواقع. العيّنة نفسها تجدها في الفروع.
        </p>
      </div>
    </section>
  );
}

// وصل حديثاً: البلاطتان الجديدتان جنب بعض، وعلى كل واحدة بلد الصناعة ولونها.
export function NewArrivals() {
  const { add, has } = useRequest();
  const list = designs.filter((d) => setById(d.setId)?.isNew);
  if (!list.length) return null;
  return (
    <section className="nw" id="new" aria-labelledby="nw-title">
      <div className="wrap">
        <div className="nw-box" data-reveal>
          <div className="nw-head">
            <span className="nw-badge">وصل حديثاً</span>
            <h2 id="nw-title">ترافنتينو 120×60</h2>
            <p>يُركّب في الحمامات والمطابخ وحيطان الديكور. صور حقيقية من المعرض.</p>
          </div>
          <ul className="nw-list">
            {list.map((d) => {
              const p = productById(d.productId);
              const item = designRequestItem(d);
              const added = has(item.key);
              const open = () => {
                const all = productSlidesFor(d.productId);
                openViewer(all, Math.max(0, all.findIndex((x) => x.design.id === d.id)), p ? productTitle(p) : "");
              };
              return (
                <li key={d.id} className="nw-card">
                  <button type="button" className="nw-pic" onClick={open} aria-label={`تكبير: ${d.look}، ${p ? originNames[p.origin] : ""}`}>
                    <img src={d.thumb} alt="" loading="lazy" />
                  </button>
                  <div className="nw-text">
                    <span className="nw-origin">{p ? originNames[p.origin] : ""}</span>
                    <strong>{d.look}</strong>
                    <span>بورسلين 120×60{d.code ? ` · ${designLabel(d)}` : ""}</span>
                    <button type="button" className={`btn btn-sm ${added ? "btn-done" : "btn-primary"}`} onClick={() => add(item)}>
                      {added ? <IconCheck /> : <IconPlus />} {added ? "في طلبك" : "أضف لطلبي"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
