import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import {
  branches,
  company,
  facebookUrl,
  finishInfo,
  finishOrder,
  gallery,
  marqueeItems,
  offers,
  socials,
  tajouraCoords,
  telHref,
  waHref,
  workHours,
  type Finish,
} from "../../site-data";
import { formatClock, prefersReducedMotion, sunsetMinutes } from "./fx";
import { openRoomCalculator } from "./calculator";
import { IconArrow, IconChat, IconChevron, IconClock, IconClose, IconCube, IconList, IconMenu, IconPhone, IconPin, IconPlus } from "./icons";
import { useRequest } from "./request";

const navLinks = [
  { href: "#catalog", id: "catalog", label: "الأصناف" },
  { href: "#calculator", id: "calculator", label: "حاسبة البلاط" },
  { href: "#finishes", id: "finishes", label: "اللمعات" },
  { href: "#branches", id: "branches", label: "الفروع" },
  { href: "#contact", id: "contact", label: "تواصل معنا" },
];

export function Header() {
  const { items, setOpen, pulse } = useRequest();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("no-scroll", menu);
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <header className={`hd ${scrolled ? "is-scrolled" : ""} ${menu ? "is-menu" : ""}`}>
      <div className="wrap hd-in">
        <a href="#top" className="hd-logo" aria-label={company.nameAr} onClick={() => setMenu(false)}>
          <span className="mark" aria-hidden="true" />
          <span className="word" aria-hidden="true" />
        </a>
        <nav className="hd-nav" aria-label="التنقل الرئيسي">
          {navLinks.map((l) => (
            <a key={l.id} href={l.href} aria-current={active === l.id ? "true" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hd-actions">
          <button type="button" className="hd-req" onClick={() => setOpen(true)} aria-label={`طلبي، ${items.length} عناصر`}>
            <IconList />
            <span className="hd-req-label">طلبي</span>
            <span key={pulse} className={`badge ${items.length ? "is-on" : ""}`}>
              {items.length}
            </span>
          </button>
          <button type="button" className="hd-burger" aria-expanded={menu} aria-controls="mnav" aria-label="القائمة" onClick={() => setMenu((v) => !v)}>
            {menu ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      <nav id="mnav" className="mnav" aria-label="قائمة الجوال" inert={!menu}>
        {navLinks.map((l, i) => (
          <a key={l.id} href={l.href} onClick={() => setMenu(false)} style={{ "--i": i } as CSSProperties}>
            {l.label}
            <IconArrow />
          </a>
        ))}
      </nav>
    </header>
  );
}

export function Marquee() {
  const row = [...marqueeItems, ...marqueeItems];
  return (
    <div className="mq" aria-hidden="true">
      <div className="mq-track">
        {row.map((t, i) => (
          <span key={i}>
            {t}
            <i className="mq-tile" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Finishes() {
  const [finish, setFinish] = useState<Finish>("لمعة");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || prefersReducedMotion()) return;
    // على الجوال: يتحرك الضوء مع التمرير
    let raf = 0;
    const run = () => {
      raf = 0;
      if (el.dataset.pointer === "1") return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
      el.style.setProperty("--lx", `${(15 + p * 70).toFixed(1)}%`);
      el.style.setProperty("--ly", `${(70 - p * 40).toFixed(1)}%`);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el || e.pointerType === "touch") return;
    el.dataset.pointer = "1";
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--ly", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  return (
    <section className="sec sec-finish" id="finishes">
      <div className="wrap fin">
        <div className="fin-copy" data-reveal>
          <h2 className="h2">أي لمعة تناسبك؟</h2>
          <p className="lead">بعض أصناف البورسلين متوفرة بأكثر من لمعة. اختر درجة اللمعة وحرّك المؤشر فوق البلاطة لترى انعكاس الضوء.</p>
          <div className="fin-opts" role="radiogroup" aria-label="درجة اللمعة">
            {finishOrder.map((f) => (
              <button key={f} type="button" role="radio" aria-checked={f === finish} className={`fin-opt ${f === finish ? "is-on" : ""}`} onClick={() => setFinish(f)}>
                <span className="fin-dot" data-gloss={f} />
                {f}
              </button>
            ))}
          </div>
          <p className="fin-desc" aria-live="polite">
            <strong>{finish}:</strong> {finishInfo[finish]}
          </p>
        </div>
        <div
          className="fin-panel"
          ref={panelRef}
          data-gloss={finish}
          onPointerMove={onMove}
          onPointerLeave={() => {
            if (panelRef.current) panelRef.current.dataset.pointer = "";
          }}
          data-reveal
          aria-hidden="true"
        >
          <div className="fin-tiles">
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="fin-label">{finish}</span>
        </div>
      </div>
    </section>
  );
}

export function Sanitary() {
  const { add, has } = useRequest();
  const added = has("sanitary");
  return (
    <section className="sec sec-san" id="sanitary">
      <div className="wrap san">
        <div className="san-copy" data-reveal>
          <h2 className="h2">المواد الصحية</h2>
          <p className="lead">أطقم حمامات ومغاسل وخلاطات تكمل ما بدأته الأرضية. اسألنا عن الموديلات المتوفرة في الفرعين.</p>
          <div className="san-actions">
            <button
              type="button"
              className={`btn ${added ? "btn-done" : "btn-primary"}`}
              onClick={() => add({ key: "sanitary", title: "استفسار عن المواد الصحية", detail: "أطقم حمامات ومغاسل وخلاطات" })}
              data-magnetic
            >
              {added ? "في طلبك" : "أضف استفساراً لطلبي"} <IconPlus />
            </button>
            <button type="button" className="btn btn-ghost" onClick={openRoomCalculator}>
              <IconCube /> احسب بلاط حمامك
            </button>
          </div>
        </div>
        <figure className="san-img san-img-a" data-parallax="0.06" data-reveal>
          <img src="assets/cat-sanitary.jpg" alt="حمام حديث بطقم صحي أبيض وجدار أزرق" loading="lazy" width={1400} height={1050} />
        </figure>
        <figure className="san-img san-img-b" data-parallax="0.12" data-reveal>
          <img src="assets/cat-mixers.jpg" alt="خلاط مغسلة كروم لامع" loading="lazy" width={1400} height={1050} />
        </figure>
      </div>
    </section>
  );
}

export function Offers() {
  return (
    <section className="sec sec-offers" id="offers">
      <div className="wrap offers" data-reveal>
        <div className="offers-art" data-parallax="0.05">
          <img src="assets/offers-gift.jpg" alt="رزمة بلاط أبيض مربوطة بشريط أزرق" loading="lazy" width={1200} height={900} />
        </div>
        <div className="offers-copy">
          <h2 className="h2">العروض والتخفيضات</h2>
          {offers.length > 0 ? (
            <ul className="offer-list">
              {offers.map((o) => (
                <li key={o.title}>
                  <div>
                    <strong>{o.title}</strong>
                    {o.until ? <small>{o.until}</small> : null}
                  </div>
                  <b>{o.detail}</b>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="lead">نعلن تخفيضاتنا الجديدة أولاً على صفحاتنا. تابعنا حتى لا يفوتك عرض.</p>
              <p className="offers-pending">تفاصيل العروض الحالية تُضاف هنا قريباً.</p>
            </>
          )}
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light" data-magnetic>
            تابعنا على فيسبوك <IconArrow />
          </a>
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const t = trackRef.current;
    if (!t) return;
    const card = t.querySelector<HTMLElement>(".gal-item");
    const step = (card?.offsetWidth ?? 320) + 20;
    // في الاتجاه من اليمين لليسار يكون التمرير للأمام بقيمة سالبة
    t.scrollBy({ left: -dir * step, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section className="sec sec-gal" id="gallery">
      <div className="wrap gal-head" data-reveal>
        <div>
          <h2 className="h2">أفكار لمساحتك</h2>
          <p className="lead">لمسة زرقاء على أرضية هادئة تغير شكل المكان كله. اسحب لتتصفح، وانقر لتكبير الصورة.</p>
        </div>
        <div className="gal-nav">
          <button type="button" className="icon-btn" onClick={() => scrollBy(-1)} aria-label="السابق">
            <IconChevron dir="right" />
          </button>
          <button type="button" className="icon-btn" onClick={() => scrollBy(1)} aria-label="التالي">
            <IconChevron dir="left" />
          </button>
        </div>
      </div>
      <div className="gal-track" ref={trackRef}>
        {gallery.map((g, i) => (
          <figure key={g.image} className={`gal-item ${g.w > g.h ? "is-wide" : ""}`}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`تكبير: ${g.caption}`}>
              <img src={g.image} alt={g.alt} loading="lazy" width={g.w} height={g.h} />
            </button>
            <figcaption>{g.caption}</figcaption>
          </figure>
        ))}
      </div>
      {open !== null ? <Lightbox index={open} onClose={() => setOpen(null)} onNav={(i) => setOpen(i)} /> : null}
    </section>
  );
}

function Lightbox({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (i: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const g = gallery[index];
  const n = gallery.length;
  useEffect(() => {
    const last = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("no-scroll");
    closeRef.current?.focus();
    return () => {
      document.documentElement.classList.remove("no-scroll");
      last?.focus?.();
    };
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav((index + 1) % n);
      if (e.key === "ArrowRight") onNav((index - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, n, onClose, onNav]);

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={g.caption} onClick={onClose}>
      <figure className="lb-fig" onClick={(e) => e.stopPropagation()}>
        <img key={g.image} src={g.image} alt={g.alt} />
        <figcaption>
          {g.caption}
          <span className="muted">
            {index + 1} / {n}
          </span>
        </figcaption>
      </figure>
      <button ref={closeRef} type="button" className="icon-btn lb-close" onClick={onClose} aria-label="إغلاق">
        <IconClose />
      </button>
      <button
        type="button"
        className="icon-btn lb-prev"
        onClick={(e) => {
          e.stopPropagation();
          onNav((index - 1 + n) % n);
        }}
        aria-label="الصورة السابقة"
      >
        <IconChevron dir="right" />
      </button>
      <button
        type="button"
        className="icon-btn lb-next"
        onClick={(e) => {
          e.stopPropagation();
          onNav((index + 1) % n);
        }}
        aria-label="الصورة التالية"
      >
        <IconChevron dir="left" />
      </button>
    </div>
  );
}

// حالة الفروع الآن حسب أوقات العمل: من 10 صباحاً حتى المغرب، والجمعة عطلة (بتوقيت ليبيا).
function shopStatus(now: number) {
  const local = new Date(now + tajouraCoords.utcOffset * 3600 * 1000);
  const day = local.getUTCDay();
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  const sunset = sunsetMinutes(local, tajouraCoords.lat, tajouraCoords.lng, tajouraCoords.utcOffset);
  if (sunset === null) return null;
  const opens = workHours.opensText;
  if (day === workHours.closedDay) return { open: false, text: `مغلق اليوم (الجمعة)، نفتح غداً ${opens}` };
  if (minutes < workHours.opensAt) return { open: false, text: `مغلق الآن، نفتح اليوم ${opens}` };
  if (minutes < sunset) return { open: true, text: `مفتوح الآن حتى المغرب، نحو ${formatClock(sunset)}` };
  const tomorrowClosed = (day + 1) % 7 === workHours.closedDay;
  return { open: false, text: tomorrowClosed ? `مغلق الآن، نفتح السبت ${opens}` : `مغلق الآن، نفتح غداً ${opens}` };
}

export function Branches() {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    const update = () => setStatus(shopStatus(Date.now()));
    update();
    const t = window.setInterval(update, 60000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="sec sec-branches" id="branches">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2 className="h2">فروعنا في تاجوراء</h2>
          <p className="lead">زرنا لتعاين الأصناف بنفسك، أو راسل أحد موظفينا على واتساب أو اتصل به مباشرة.</p>
        </div>
        <div className="br-grid">
          {branches.map((b, bi) => (
            <article key={b.id} className="br" data-reveal style={{ "--d": `${bi * 120}ms` } as CSSProperties}>
              <div className="br-top">
                <span className="br-num">{bi + 1}</span>
                <h3>{b.name}</h3>
              </div>
              <p className="br-line">
                <IconPin /> <span>{b.address}</span>
              </p>
              {b.mapUrl ? (
                <a className="btn btn-ghost btn-sm br-map" href={b.mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`موقع ${b.name} على خرائط Google`}>
                  <IconPin /> افتح الموقع على الخريطة <IconArrow />
                </a>
              ) : null}
              <p className="br-line">
                <IconClock />
                <span>
                  {workHours.days}، {workHours.time} <span className="br-off">{workHours.closed}</span>
                </span>
              </p>
              {status ? (
                <p className={`br-status ${status.open ? "is-open" : ""}`}>
                  <i aria-hidden="true" /> {status.text}
                </p>
              ) : null}
              <ul className="br-phones">
                {b.phones.map((p) => (
                  <li key={p.number}>
                    <span className="br-name">{p.name}</span>
                    <span className="br-number" dir="ltr">
                      {p.number}
                    </span>
                    <span className="br-acts">
                      {p.whatsapp ? (
                        <a className="icon-btn icon-btn-wa" href={waHref(p.number, `مرحباً، أستفسر عن أصناف ${company.nameAr}`)} target="_blank" rel="noopener noreferrer" aria-label={`واتساب ${p.name}`}>
                          <IconChat />
                        </a>
                      ) : null}
                      <a className="icon-btn icon-btn-call" href={telHref(p.number)} aria-label={`اتصال بـ${p.name}: ${p.number}`}>
                        <IconPhone />
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="sec sec-contact" id="contact">
      <div className="wrap">
        <div className="sec-head sec-head-light" data-reveal>
          <h2 className="h2">تابعنا وتواصل معنا</h2>
          <p className="lead">جديد الأصناف والعروض ينزل أولاً على صفحاتنا.</p>
        </div>
        <div className="soc-grid">
          {socials.map((s, i) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="soc" data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
              <span className="soc-platform">{s.platform}</span>
              <span className="soc-handle" dir={s.handle.startsWith("@") ? "ltr" : undefined}>
                {s.handle}
              </span>
              <span className="soc-go">
                <IconArrow />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-in">
          <div className="ft-brand">
            <span className="mark" aria-hidden="true" />
            <span className="word" role="img" aria-label={company.nameAr} />
            <p>{company.nameEn}</p>
          </div>
          <nav className="ft-links" aria-label="روابط الموقع">
            {navLinks.map((l) => (
              <a key={l.id} href={l.href}>
                {l.label}
              </a>
            ))}
            <a href="#gallery">أفكار لمساحتك</a>
          </nav>
          <div className="ft-links">
            {branches.map((b) => (
              <span key={b.id}>
                {b.name}: {b.address}
              </span>
            ))}
          </div>
        </div>
        <p className="ft-base">
          <span>
            © {2026} {company.nameAr}. {company.tagline}.
          </span>
          <span>الصور توضيحية، وتختلف الألوان والنقشات حسب المتوفر في الفروع.</span>
        </p>
      </div>
    </footer>
  );
}
