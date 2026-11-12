import { useEffect, useRef } from "react";
import { chapters, type OriginId } from "../../site-data";
import { prefersReducedMotion } from "./fx";

const SIZES = "(orientation: portrait) 180vh, 100vw";
const stageSrc = (n: number) => ({
  src: `assets/stage-${n}.jpg`,
  srcSet: `assets/stage-${n}-m.jpg 1400w, assets/stage-${n}.jpg 2400w`,
  sizes: SIZES,
  width: 2400,
  height: 1350,
});

export function selectOrigin(id: OriginId) {
  window.dispatchEvent(new CustomEvent<OriginId>("am:origin", { detail: id }));
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export function Journey() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || prefersReducedMotion()) return;

    const layers = Array.from(stage.querySelectorAll<HTMLElement>("[data-layer]"));
    const sections = Array.from(track.querySelectorAll<HTMLElement>("[data-chapter]"));
    const dots = Array.from(stage.querySelectorAll<HTMLElement>("[data-dot]"));
    let raf = 0;
    let running = false;
    let current = 0;
    let target = 0;
    let lastActive = -1;

    const measure = () => {
      const total = Math.max(1, track.offsetHeight - window.innerHeight);
      target = clamp(-track.getBoundingClientRect().top / total);
    };

    const render = () => {
      const vh = window.innerHeight;
      const y = current * Math.max(1, track.offsetHeight - vh);
      let ringK = 0;
      let ringO = 0;
      let active = 0;
      stage.style.setProperty("--zoom", (1 + 0.22 * ease(current)).toFixed(4));
      sections.forEach((section, i) => {
        if (i === 0) return;
        const top = section.offsetTop;
        const t = clamp((y - (top - vh * 0.85)) / (vh * 0.8));
        const k = ease(t) * 100;
        const layer = layers[i - 1];
        if (layer) {
          layer.style.setProperty("--k", k.toFixed(2));
          layer.dataset.s = t <= 0 ? "hidden" : t >= 1 ? "full" : "on";
        }
        if (t > 0 && t < 1) {
          ringK = k;
          ringO = Math.sin(Math.PI * t);
        }
        if (y >= top - vh * 0.5) active = i;
      });
      stage.style.setProperty("--kr", ringK.toFixed(2));
      stage.style.setProperty("--ro", ringO.toFixed(3));
      if (active !== lastActive) {
        lastActive = active;
        dots.forEach((dot, i) => {
          if (i === active) dot.setAttribute("aria-current", "step");
          else dot.removeAttribute("aria-current");
        });
      }
    };

    const tick = () => {
      const delta = target - current;
      if (Math.abs(delta) < 0.0004) {
        current = target;
        render();
        running = false;
        return;
      }
      current += delta * 0.14;
      render();
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      measure();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    measure();
    current = target;
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="am-journey" ref={trackRef} id="top">
      <div className="am-stage" ref={stageRef}>
        <div className="am-media">
          <img {...stageSrc(0)} alt="صالة منزل قيد التشطيب بأرضية إسمنتية قبل تركيب البلاط" fetchPriority="high" />
          <img {...stageSrc(1)} alt="" aria-hidden="true" className="am-layer" data-layer data-s="hidden" />
          <img {...stageSrc(2)} alt="" aria-hidden="true" className="am-layer" data-layer data-s="hidden" />
          <img {...stageSrc(3)} alt="" aria-hidden="true" className="am-layer" data-layer data-s="hidden" />
          <span className="am-ring" aria-hidden="true" />
        </div>
        <div className="am-scrim" aria-hidden="true" />
        <nav className="am-rail" aria-label="مراحل تحول الصالة">
          <a href="#ch-start" data-dot aria-current="step">
            <i aria-hidden="true" />
            <span>البداية</span>
          </a>
          {chapters.map((c) => (
            <a key={c.id} href={`#ch-${c.id}`} data-dot aria-label={c.title}>
              <i aria-hidden="true" />
              <span>{c.rail}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="am-chapters">
        <section className="am-ch am-ch--hero" data-chapter id="ch-start">
          <div className="am-hero">
            <h1>بيتك يبدأ من الأرضية</h1>
            <p className="am-hero-sub">
              شركة الميثاق: سيراميك وبورسلين وكوطو ورخام ومواد صحية، من الصناعة الليبية والهندية والتركية.
            </p>
            <div className="am-hero-cta">
              <a href="#catalog" className="am-cta-browse">
                تصفح الأصناف <i aria-hidden="true">←</i>
              </a>
              <a href="#contact" className="am-cta-talk">
                تواصل معنا
              </a>
            </div>
          </div>
        </section>
        {chapters.map((c) => (
          <section key={c.id} className="am-ch" data-chapter id={`ch-${c.id}`}>
            <article className="am-card">
              <h2>{c.title}</h2>
              <p>{c.text}</p>
              <ul className="am-chips">
                {c.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
              <a href="#catalog" className="am-ch-link" onClick={() => selectOrigin(c.id)}>
                {c.link} <span aria-hidden="true">←</span>
              </a>
            </article>
          </section>
        ))}
      </div>
    </div>
  );
}
