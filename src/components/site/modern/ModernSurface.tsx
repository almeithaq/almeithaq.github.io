import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { designLabel, originNames, productById, productTitle, waHref, type Design } from "../../../site-data";
import { useRequest } from "../request";
import { IconCheck, IconPlus, IconZoom, PRODUCTS_ANCHOR, designRequestItem, scrollToId, useViewer } from "./adapter";
import { WHATSAPP_CONTACTS, WHATSAPP_NUMBER } from "./config";
import { collections, gallery, macro, materials, roomEn, roomNames, sceneById, type Collection, type RoomKind } from "./data";

// MODERN SURFACE: تجربة عرض فاخرة داخل الصفحة. كل الصور من بلاط الشركة الحقيقي،
// وتصاميم المساحات مكتوب عليها أنها توضيحية.

type QuoteType = "" | "porcelain" | "ceramic";

const tileAlt = (d: Design) => {
  const p = productById(d.productId);
  return `صورة حقيقية: ${p ? productTitle(p) : ""}، ${designLabel(d)}، ${d.look}`;
};
const En = ({ children, className }: { children: string; className?: string }) => (
  <span lang="en" dir="ltr" className={className}>
    {children}
  </span>
);

const IconWa = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z" />
  </svg>
);

const Pic = ({ webp, jpg, alt, w, h, sizes, eager }: { webp: string; jpg: string; alt: string; w: number; h: number; sizes?: string; eager?: boolean }) => (
  <picture>
    <source type="image/webp" srcSet={webp} sizes={sizes} />
    <img src={jpg} alt={alt} width={w} height={h} loading={eager ? "eager" : "lazy"} decoding="async" />
  </picture>
);

export function ModernSurface() {
  const viewer = useViewer();
  const [quoteType, setQuoteType] = useState<QuoteType>("");
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const openTiles = viewer.openTiles;
  const askQuote = (t: QuoteType) => {
    setQuoteType(t);
    scrollToId("msf-quote");
  };

  return (
    <section className="msf" id="modern-surface" aria-labelledby="msf-title" ref={root}>
      <Hero onExplore={() => scrollToId("msf-collections")} onProducts={() => scrollToId(PRODUCTS_ANCHOR)} onTile={openTiles} />
      <Collections onOpen={openTiles} onQuote={askQuote} />
      <Materials onOpen={openTiles} />
      <Gallery onOpen={viewer.openScenes} />
      <Quote preset={quoteType} />

      {WHATSAPP_NUMBER ? (
        <a
          className={`msf-float ${inView ? "is-on" : ""}`}
          href={waHref(WHATSAPP_NUMBER, "مرحباً، أريد الاستفسار عن منتجاتكم من السيراميك والبورسلين.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل معنا على واتساب"
          tabIndex={inView ? 0 : -1}
          aria-hidden={!inView}
        >
          <IconWa />
          <span>واتساب</span>
        </a>
      ) : WHATSAPP_CONTACTS.length ? (
        <button type="button" className={`msf-float ${inView ? "is-on" : ""}`} onClick={() => scrollToId("msf-quote")} tabIndex={inView ? 0 : -1} aria-hidden={!inView}>
          <IconWa />
          <span>اطلب عرض سعر</span>
        </button>
      ) : null}
      {viewer.node}
    </section>
  );
}

function Hero({ onExplore, onProducts, onTile }: { onExplore: () => void; onProducts: () => void; onTile: (list: Design[]) => void }) {
  const item = gallery.find((g) => g.scene.id === "living") ?? gallery[0];
  const d = item?.design;
  const p = d ? productById(d.productId) : undefined;
  return (
    <div className="msf-hero">
      <div className="msf-hero-text">
        <p className="msf-eyebrow" data-reveal>
          <En>MODERN SURFACE</En>
        </p>
        <h2 id="msf-title" className="msf-h1" data-reveal style={{ "--d": "80ms" } as CSSProperties}>
          <En>Spaces Made Beautiful.</En>
        </h2>
        <p className="msf-tag" data-reveal style={{ "--d": "160ms" } as CSSProperties}>
          <En>Discover the Art of Modern Living</En>
        </p>
        <p className="msf-lead" data-reveal style={{ "--d": "220ms" } as CSSProperties}>
          اكتشف تشكيلاتنا من السيراميك والبورسلين وامنح مساحتك طابعاً مختلفاً يجمع بين الأناقة والجودة.
        </p>
        <blockquote className="msf-quote-line" data-reveal style={{ "--d": "280ms" } as CSSProperties}>
          «تفاصيل تصنع الفرق، ومساحات تعكس ذوقك.»
        </blockquote>
        <div className="msf-actions" data-reveal style={{ "--d": "340ms" } as CSSProperties}>
          <button type="button" className="msf-btn msf-btn-dark" onClick={onExplore}>
            تصفّح المجموعات
          </button>
          <button type="button" className="msf-btn msf-btn-line" onClick={onProducts}>
            اكتشف منتجاتنا
          </button>
        </div>
      </div>
      {item ? (
        <figure className="msf-hero-media" data-reveal>
          <div className="msf-hero-img">
            <Pic webp={`${item.img.webp} 1600w, ${item.img.mediumWebp} 960w`} jpg={item.img.large} alt={`${item.scene.title}: تصميم توضيحي لأرضية من بلاطنا`} w={1600} h={1200} sizes="(max-width: 900px) 100vw, 60vw" />
          </div>
          <span className="msf-badge">تصميم توضيحي من صورة بلاطة حقيقية</span>
          {d && p ? (
            <button type="button" className="msf-chip" onClick={() => onTile([d])} aria-label={`شوف البلاطة الحقيقية: ${designLabel(d)}، ${d.look}`}>
              <img src={d.tiny} alt="" width={56} height={56} loading="lazy" />
              <span>
                <small>البلاطة في الصورة</small>
                <strong>{d.look}</strong>
                <em>{productTitle(p)}</em>
              </span>
            </button>
          ) : null}
        </figure>
      ) : null}
    </div>
  );
}

function SecTitle({ num, en, title, descEn, descAr, id }: { num: string; en: string; title: string; descEn: string; descAr?: string; id: string }) {
  return (
    <header className="msf-head" data-reveal>
      <p className="msf-eyebrow">
        <En>{`${num} — ${en}`}</En>
      </p>
      <h3 id={id} className="msf-h2">
        <En>{title}</En>
      </h3>
      <p className="msf-desc">
        <En>{descEn}</En>
      </p>
      {descAr ? <p className="msf-desc-ar">{descAr}</p> : null}
    </header>
  );
}

const countWord = (n: number) => (n <= 10 ? `${n} تصاميم` : `${n} تصميماً`);

function Collections({ onOpen, onQuote }: { onOpen: (list: Design[], i?: number) => void; onQuote: (t: QuoteType) => void }) {
  const main = collections.filter((c) => c.sceneId);
  const extra = collections.filter((c) => !c.sceneId);
  return (
    <div className="msf-block" id="msf-collections">
      <SecTitle num="01" en="COLLECTIONS" id="msf-col-title" title="Explore Our Collections" descEn="Carefully selected surfaces designed to elevate every space." descAr="أسطح مختارة بعناية من أصنافنا، بصورها الحقيقية من المعرض." />
      <div className="msf-cols">
        {main.map((c, i) => (
          <CollectionCard key={c.id} c={c} i={i} onOpen={onOpen} onQuote={onQuote} />
        ))}
      </div>
      {extra.map((c) => (
        <div key={c.id} className="msf-strip" data-reveal>
          <div className="msf-strip-text">
            <p className="msf-eyebrow">
              <En>{c.en.toUpperCase()}</En>
            </p>
            <h4>{c.ar}</h4>
            <p>{c.descAr}</p>
            <div className="msf-actions">
              <button type="button" className="msf-btn msf-btn-dark" onClick={() => onOpen(c.tiles)}>
                شوف {countWord(c.tiles.length)}
              </button>
              <button type="button" className="msf-btn msf-btn-line" onClick={() => onQuote(c.quoteType)}>
                اطلب عرض سعر
              </button>
            </div>
          </div>
          <ul className="msf-strip-tiles">
            {c.tiles.slice(0, 8).map((d, k) => (
              <li key={d.id}>
                <button type="button" onClick={() => onOpen(c.tiles, k)} aria-label={`${designLabel(d)}: ${d.look}`}>
                  <img src={d.thumb} alt="" width={180} height={180} loading="lazy" />
                  <span>{designLabel(d)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CollectionCard({ c, i, onOpen, onQuote }: { c: Collection; i: number; onOpen: (list: Design[], i?: number) => void; onQuote: (t: QuoteType) => void }) {
  const scene = sceneById(c.sceneId);
  const item = gallery.find((g) => g.scene.id === scene?.id);
  return (
    <article className="msf-col" data-reveal style={{ "--d": `${i * 120}ms` } as CSSProperties}>
      <button type="button" className="msf-col-media" onClick={() => onOpen(c.tiles)} aria-label={`افتح صور ${c.ar} الحقيقية`}>
        {item ? <Pic webp={`${item.img.mediumWebp} 960w, ${item.img.webp} 1600w`} jpg={item.img.medium} alt="" w={960} h={720} sizes="(max-width: 900px) 100vw, 50vw" /> : null}
        <span className="msf-badge">تصميم توضيحي</span>
      </button>
      <div className="msf-col-body">
        <p className="msf-col-name">
          <En>{c.en.toUpperCase()}</En>
          <span>{c.ar}</span>
        </p>
        <p className="msf-col-desc">
          <En>{c.descEn}</En>
        </p>
        <p className="msf-col-ar">{c.descAr}</p>
        <ul className="msf-swatches" aria-label={`عيّنات من ${c.ar}`}>
          {c.tiles.slice(0, 5).map((d, k) => (
            <li key={d.id}>
              <button type="button" onClick={() => onOpen(c.tiles, k)} aria-label={`${designLabel(d)}: ${d.look}`} title={`${designLabel(d)}: ${d.look}`}>
                <img src={d.tiny} alt="" width={64} height={64} loading="lazy" />
              </button>
            </li>
          ))}
          <li className="msf-more">+{Math.max(0, c.tiles.length - 5)}</li>
        </ul>
        <div className="msf-actions">
          <button type="button" className="msf-btn msf-btn-dark" onClick={() => onOpen(c.tiles)}>
            <En>{`Explore ${c.en}`}</En>
          </button>
          <button type="button" className="msf-btn msf-btn-line" onClick={() => onQuote(c.quoteType)}>
            اطلب عرض سعر
          </button>
        </div>
      </div>
    </article>
  );
}

function Materials({ onOpen }: { onOpen: (list: Design[], i?: number) => void }) {
  const [mi, setMi] = useState(0);
  const [ti, setTi] = useState(0);
  const m = materials[mi];
  const list = useMemo(() => m.ids.map((id) => collections.flatMap((c) => c.tiles).find((d) => d.id === id)).filter(Boolean) as Design[], [m]);
  const d = list[Math.min(ti, list.length - 1)];
  const p = d ? productById(d.productId) : undefined;
  return (
    <div className="msf-block msf-mat" id="msf-materials">
      <SecTitle num="02" en="MATERIALS" id="msf-mat-title" title="Discover Every Detail." descEn="Every surface tells a story. Explore the textures, finishes and details that make each collection unique." descAr="كل سطح له حكاية. قرّب على العروق والملمس واللمعة في صور بلاطنا الحقيقية." />
      <div className="msf-mat-grid" data-reveal>
        <div className="msf-mat-stage">
          {m.compare && list.length === 2 ? (
            <button type="button" className="msf-split" onClick={() => onOpen(list)} aria-label="افتح صورتي اللامع والمطفي">
              {list.map((x) => (
                <span key={x.id}>
                  <Pic webp={macro(x.id).webp} jpg={macro(x.id).jpg} alt={tileAlt(x)} w={900} h={900} />
                  <em>{x.code}</em>
                </span>
              ))}
            </button>
          ) : d ? (
            <button type="button" className="msf-macro" key={d.id} onClick={() => onOpen(list, ti)} aria-label={`كبّر الصورة: ${designLabel(d)}، ${d.look}`}>
              <Pic webp={macro(d.id).webp} jpg={macro(d.id).jpg} alt={tileAlt(d)} w={900} h={900} />
              <i>
                <IconZoom />
              </i>
            </button>
          ) : null}
          {d && p ? (
            <p className="msf-mat-cap">
              <strong>{m.compare ? "284" : designLabel(d)}</strong> {m.compare ? "ترافنتينو ليبي 120×60، لامع ومطفي" : `${d.look} · ${productTitle(p)}، ${originNames[p.origin]}`}
            </p>
          ) : null}
        </div>
        <div className="msf-mat-list" role="tablist" aria-label="الخامات">
          {materials.map((x, k) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={k === mi}
              className={k === mi ? "is-on" : ""}
              onClick={() => {
                setMi(k);
                setTi(0);
              }}
            >
              <span className="msf-mat-n">
                <En>{String(k + 1).padStart(2, "0")}</En>
              </span>
              <span className="msf-mat-name">
                <strong>{x.ar}</strong>
                <En>{x.en}</En>
                <small>{x.note}</small>
              </span>
              <img src={macro(x.ids[0]).small} alt="" width={64} height={64} loading="lazy" />
            </button>
          ))}
          {!m.compare && list.length > 1 ? (
            <div className="msf-mat-picks" role="group" aria-label="صور هذه الخامة">
              {list.map((x, k) => (
                <button key={x.id} type="button" className={k === ti ? "is-on" : ""} aria-pressed={k === ti} onClick={() => setTi(k)}>
                  <img src={macro(x.id).small} alt="" width={64} height={64} loading="lazy" />
                  <span>{designLabel(x)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Gallery({ onOpen }: { onOpen: (list: typeof gallery, index: number) => void }) {
  const [room, setRoom] = useState<RoomKind>("all");
  const rooms = (Object.keys(roomNames) as RoomKind[]).filter((r) => r === "all" || gallery.some((g) => g.room === r));
  const list = gallery.filter((g) => room === "all" || g.room === room);
  return (
    <div className="msf-block" id="msf-gallery">
      <SecTitle num="03" en="INSPIRATION" id="msf-gal-title" title="Find Your Inspiration." descEn="Explore inspiring spaces created with our ceramic and porcelain collections." descAr="مساحات مصمّمة من صور بلاطنا الحقيقية: صالات وغرف نوم ومطابخ وحمّامات." />
      <div className="msf-filters" role="group" aria-label="نوع المساحة" data-reveal>
        {rooms.map((r) => (
          <button key={r} type="button" className={r === room ? "is-on" : ""} aria-pressed={r === room} onClick={() => setRoom(r)}>
            {roomNames[r]}
          </button>
        ))}
      </div>
      <ul className={`msf-gal ${room === "all" ? "is-all" : ""}`}>
        {list.map((g, i) => (
          <li key={g.scene.id} className={`msf-g msf-g-${i}`}>
            <button type="button" onClick={() => onOpen(list, i)} aria-label={`${g.scene.title}: كبّر التصميم`}>
              <Pic webp={`${g.img.mediumWebp} 960w, ${g.img.webp} 1600w`} jpg={g.img.medium} alt="" w={960} h={720} sizes="(max-width: 700px) 100vw, 50vw" />
              <span className="msf-g-cap">
                <En>{roomEn[g.room]}</En>
                <strong>{g.scene.title}</strong>
                {g.design ? <small>البلاط: {designLabel(g.design)}، {g.design.look}</small> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="msf-note">الصور تصاميم توضيحية أُعدّت بالحاسوب من صور بلاطنا الحقيقية، وقد يختلف اللون قليلاً عن الواقع. العيّنة نفسها تجدها في المعرض.</p>
    </div>
  );
}

const typeNames: Record<Exclude<QuoteType, "">, string> = { porcelain: "بورسلين", ceramic: "سيراميك" };
const uses = ["أرضيات", "حيطان", "حمّامات", "مطابخ"] as const;
type Errors = Partial<Record<"name" | "phone" | "type" | "use" | "area", string>>;

const phoneOk = (v: string) => {
  const digits = v.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  if (!/^\d{9,15}$/.test(digits)) return false;
  if (digits.startsWith("09") && digits.length !== 10) return false;
  return true;
};

function Quote({ preset }: { preset: QuoteType }) {
  const { items } = useRequest();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<QuoteType>("");
  const [use, setUse] = useState<string[]>([]);
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [ready, setReady] = useState<string | null>(null);
  const canSend = !!WHATSAPP_NUMBER || WHATSAPP_CONTACTS.length > 0;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (preset) setType(preset);
  }, [preset]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "اكتب اسمك الكامل.";
    if (!phone.trim()) e.phone = "اكتب رقم هاتفك.";
    else if (!phoneOk(phone)) e.phone = "الرقم مش صحيح. اكتبه مثل 0912345678.";
    if (!type) e.type = "اختار نوع المنتج.";
    if (!use.length) e.use = "اختار مكان الاستخدام.";
    if (area.trim()) {
      const n = Number(area.replace(",", "."));
      if (!Number.isFinite(n) || n <= 0 || n > 100000) e.area = "اكتب المساحة بالأرقام، مثل 45.";
    }
    return e;
  };

  const message = () =>
    [
      "مرحباً، أريد الاستفسار عن منتجات الشركة وطلب عرض سعر.",
      "",
      `الاسم: ${name.trim()}`,
      `رقم الهاتف: ${phone.trim()}`,
      `نوع المنتج: ${type ? typeNames[type] : ""}`,
      `الاستخدام: ${use.join("، ")}`,
      area.trim() ? `المساحة: ${area.trim()} متر مربع` : "",
      notes.trim() ? `ملاحظات: ${notes.trim()}` : "",
      items.length ? `\nالبلاط اللي اخترته من الموقع:\n${items.map((it) => `- ${it.title}`).join("\n")}` : "",
    ]
      .filter((l, i) => l !== "" || i === 1)
      .join("\n");

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setSent(false);
    setReady(null);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    if (WHATSAPP_NUMBER) {
      window.open(waHref(WHATSAPP_NUMBER, message()), "_blank", "noopener,noreferrer");
      setSent(true);
    } else if (WHATSAPP_CONTACTS.length) setReady(message());
  };

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <span className="msf-err" id={`msf-err-${k}`} role="alert">
        {errors[k]}
      </span>
    ) : null;

  return (
    <div className="msf-block msf-quote" id="msf-quote">
      <div className="msf-quote-intro" data-reveal>
        <p className="msf-eyebrow">
          <En>04 — REQUEST A QUOTE</En>
        </p>
        <h3 className="msf-h2">
          <En>Let’s Create Your Perfect Space.</En>
        </h3>
        <p className="msf-desc">
          <En>Found a design you love? Tell us what you need and our team will help you find the perfect solution.</En>
        </p>
        <p className="msf-desc-ar">هل أعجبك أحد تصاميمنا؟ أرسل طلبك وسيتواصل معك فريقنا لمساعدتك في اختيار المنتج المناسب.</p>
        <ul className="msf-points">
          <li>الطلب يوصل للشركة على واتساب برسالة جاهزة، وأنت تضغط إرسال.</li>
          <li>بياناتك ما تنحفظ في الموقع ولا تنرسل لأي جهة ثانية.</li>
          {items.length ? <li>البلاط اللي في «طلبي» ({items.length}) ينضاف للرسالة تلقائياً.</li> : null}
        </ul>
      </div>

      <form className="msf-form" ref={formRef} onSubmit={submit} noValidate data-reveal>
        <div className="msf-row2">
          <label className="msf-field">
            <span>الاسم الكامل</span>
            <input data-field="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "msf-err-name" : undefined} />
            {err("name")}
          </label>
          <label className="msf-field">
            <span>رقم الهاتف</span>
            <input data-field="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09X XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "msf-err-phone" : undefined} />
            {err("phone")}
          </label>
        </div>

        <fieldset className="msf-field">
          <legend>نوع المنتج</legend>
          <div className="msf-choice" data-field="type" tabIndex={-1}>
            {(Object.keys(typeNames) as Exclude<QuoteType, "">[]).map((t) => (
              <label key={t} className={type === t ? "is-on" : ""}>
                <input type="radio" name="msf-type" value={t} checked={type === t} onChange={() => setType(t)} />
                <span>{typeNames[t]}</span>
                <En>{t === "porcelain" ? "Porcelain" : "Ceramic"}</En>
              </label>
            ))}
          </div>
          {err("type")}
        </fieldset>

        <fieldset className="msf-field">
          <legend>الاستخدام</legend>
          <div className="msf-choice" data-field="use" tabIndex={-1}>
            {uses.map((u) => (
              <label key={u} className={use.includes(u) ? "is-on" : ""}>
                <input type="checkbox" value={u} checked={use.includes(u)} onChange={() => setUse((l) => (l.includes(u) ? l.filter((x) => x !== u) : [...l, u]))} />
                <span>{u}</span>
              </label>
            ))}
          </div>
          {err("use")}
        </fieldset>

        <label className="msf-field msf-area">
          <span>المساحة التقريبية (متر مربع)</span>
          <input data-field="area" type="text" inputMode="decimal" dir="ltr" placeholder="45" value={area} onChange={(e) => setArea(e.target.value)} aria-invalid={!!errors.area} aria-describedby={errors.area ? "msf-err-area" : undefined} />
          {err("area")}
        </label>

        <label className="msf-field">
          <span>
            ملاحظات <small>(اختياري)</small>
          </span>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <button type="submit" className="msf-btn msf-btn-dark msf-submit" disabled={!canSend}>
          <IconWa /> اطلب عرض السعر
        </button>
        {!canSend ? <p className="msf-warn">زر الإرسال متوقف: ما فيه رقم واتساب مؤكد في إعدادات الموقع (WHATSAPP_NUMBER).</p> : null}
        {ready ? (
          <div className="msf-wa-list" role="status">
            <p>
              <IconCheck /> طلبك جاهز. اختار الفرع والموظف اللي تبي ترسل له على واتساب:
            </p>
            {[...new Set(WHATSAPP_CONTACTS.map((c) => c.branch))].map((b) => (
              <div key={b} className="msf-wa-group">
                <strong>{b}</strong>
                <div>
                  {WHATSAPP_CONTACTS.filter((c) => c.branch === b).map((c) => (
                    <a key={c.number} href={waHref(c.number, ready)} target="_blank" rel="noopener noreferrer">
                      <IconWa /> {c.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {Object.keys(errors).length ? <p className="msf-warn" role="status">في بيانات ناقصة، صلّحها وجرّب مرة ثانية.</p> : null}
        {sent ? (
          <p className="msf-ok" role="status">
            <IconCheck /> فتحنا لك واتساب برسالة جاهزة فيها طلبك، اضغط إرسال هناك. لو ما انفتح، تأكد إن المتصفح ما منع النافذة.
          </p>
        ) : null}
      </form>
    </div>
  );
}
