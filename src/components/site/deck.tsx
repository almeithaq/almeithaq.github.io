import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { designById, designLabel, designs, originNames, productById, productTitle, type Design } from "../../site-data";
import { designRequestItem } from "./designs";
import { prefersReducedMotion } from "./fx";
import { IconCheck, IconClose, IconPlus } from "./icons";
import { useRequest } from "./request";

// اكتشف ذوقك: بطاقات من صور البلاط الحقيقية، يسحبها الزائر يميناً لو عجبته ويساراً لو لا،
// وفي الآخر تنجمع اختياراته في طلب واحد. تعمل بالسحب أو بالأزرار أو بأسهم لوحة المفاتيح.

type Filter = "all" | "out" | "in";
const filterNames: Record<Filter, string> = { all: "كل البلاط", out: "الحوش والساحات", in: "داخل البيت" };
const isOut = (d: Design) => !!productById(d.productId)?.outdoor;
const poolOf = (f: Filter) => designs.filter((d) => f === "all" || (f === "out" ? isOut(d) : !isOut(d)));
const SWIPE = 90;

// خلط ثابت بالبذرة، فالرسم الأول يطابق الصفحة الجاهزة ثم يتغيّر الترتيب بعد التحميل.
function shuffle<T>(arr: T[], seed: number) {
  const a = arr.slice();
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const tilesWord = (n: number) => (n === 1 ? "بلاطة وحدة" : n === 2 ? "بلاطتين" : n <= 10 ? `${n} بلاطات` : `${n} بلاطة`);

const IconHeart = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" />
  </svg>
);

const IconUndo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </svg>
);

export function Deck() {
  const { add, has } = useRequest();
  const [filter, setFilter] = useState<Filter>("all");
  const [seed, setSeed] = useState(7);
  const [pos, setPos] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [history, setHistory] = useState<{ id: string; like: boolean }[]>([]);
  const [drag, setDrag] = useState(0);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const [msg, setMsg] = useState("");
  const startX = useRef<number | null>(null);

  useEffect(() => setSeed(Math.floor(Math.random() * 100000) + 1), []);

  const deck = useMemo(() => shuffle(poolOf(filter), seed), [filter, seed]);
  const n = deck.length;
  const card = deck[pos];
  const product = card ? productById(card.productId) : undefined;
  const likedDesigns = liked.map(designById).filter(Boolean) as Design[];
  const items = likedDesigns.map(designRequestItem);
  const allAdded = items.length > 0 && items.every((it) => has(it.key));

  // تجهيز صورة البطاقة التالية حتى تظهر فوراً.
  useEffect(() => {
    const next = deck[pos + 1];
    if (next) new Image().src = next.image;
  }, [deck, pos]);

  const decide = (like: boolean) => {
    if (!card || fly) return;
    setFly(like ? 1 : -1);
    if (like) {
      setLiked((l) => (l.includes(card.id) ? l : [...l, card.id]));
      navigator.vibrate?.(12);
    }
    setHistory((h) => [...h, { id: card.id, like }]);
    setMsg(`${like ? "عجبتك" : "تخطّيتها"}: ${designLabel(card)}، ${card.look}`);
    window.setTimeout(
      () => {
        setPos((p) => p + 1);
        setFly(0);
        setDrag(0);
      },
      prefersReducedMotion() ? 0 : 260,
    );
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last || fly) return;
    setHistory((h) => h.slice(0, -1));
    if (last.like) setLiked((l) => l.filter((x) => x !== last.id));
    setPos((p) => Math.max(0, p - 1));
    setMsg("رجّعنا البطاقة اللي قبل");
  };

  const pick = (f: Filter) => {
    setFilter(f);
    setPos(0);
    setHistory([]);
    setDrag(0);
  };

  const restart = () => {
    setPos(0);
    setHistory([]);
    setLiked([]);
    setSeed((s) => s + 1);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (fly) return;
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current !== null) setDrag(e.clientX - startX.current);
  };
  const onUp = () => {
    if (startX.current === null) return;
    startX.current = null;
    if (drag > SWIPE) decide(true);
    else if (drag < -SWIPE) decide(false);
    else setDrag(0);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      decide(true);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      decide(false);
    }
  };

  const moving = fly !== 0 || drag !== 0;
  const topStyle: CSSProperties = fly
    ? { transform: `translateX(${fly * 130}%) rotate(${fly * 16}deg)`, opacity: 0 }
    : { transform: `translateX(${drag}px) rotate(${drag / 16}deg)`, transition: startX.current !== null ? "none" : undefined };
  const yes = Math.max(0, Math.min(1, fly === 1 ? 1 : drag / SWIPE));
  const no = Math.max(0, Math.min(1, fly === -1 ? 1 : -drag / SWIPE));

  return (
    <section className="sec sec-sw" id="discover" aria-labelledby="sw-title">
      <div className="wrap sw-wrap">
        <div className="sw-intro" data-reveal>
          <p className="sw-kicker">جديد</p>
          <h2 id="sw-title">اكتشف ذوقك في دقيقة</h2>
          <p className="sw-lead">بلاطة ورا بلاطة من صور معرضنا الحقيقية. اسحبها لليمين لو عجبتك، ولليسار لو لا. وفي الآخر نجمع لك اللي عجبك في طلب واحد.</p>

          <div className="sw-filters" role="group" aria-label="نوع البلاط">
            {(Object.keys(filterNames) as Filter[]).map((f) => (
              <button key={f} type="button" className={filter === f ? "is-on" : ""} aria-pressed={filter === f} onClick={() => pick(f)}>
                {filterNames[f]}
                <span>{poolOf(f).length}</span>
              </button>
            ))}
          </div>

          <div className="sw-tray" aria-live="polite">
            <p>
              <IconHeart /> عجبتك {likedDesigns.length ? tilesWord(likedDesigns.length) : "ولا بلاطة لين الحين"}
            </p>
            {likedDesigns.length ? (
              <>
                <ul>
                  {likedDesigns.map((d) => (
                    <li key={d.id}>
                      <button type="button" onClick={() => setLiked((l) => l.filter((x) => x !== d.id))} aria-label={`شيل ${designLabel(d)} من اختياراتك`} title="اضغط للحذف">
                        <img src={d.tiny} alt="" loading="lazy" />
                        <span>{designLabel(d)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" className={`btn btn-sm ${allAdded ? "btn-done" : "btn-primary"}`} onClick={() => items.forEach((it) => add(it))}>
                  {allAdded ? <IconCheck /> : <IconPlus />} {allAdded ? "كلها في طلبك" : "أضف اختياراتي لطلبي"}
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="sw-stage">
          <div className="sw-deck" tabIndex={0} onKeyDown={onKey} role="group" aria-roledescription="بطاقات البلاط" aria-label="اسحب البطاقة، أو استخدم السهم الأيمن لو عجبتك والأيسر للتخطّي">
            {deck[pos + 2] ? (
              <div className="sw-card sw-back2" aria-hidden="true">
                <img src={deck[pos + 2].thumb} alt="" />
              </div>
            ) : null}
            {deck[pos + 1] ? (
              <div className={`sw-card sw-back1 ${moving ? "is-rise" : ""}`} aria-hidden="true">
                <img src={deck[pos + 1].thumb} alt="" />
              </div>
            ) : null}
            {card && product ? (
              <div key={card.id} className="sw-card sw-top" style={topStyle} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                <div className="sw-pic">
                  <img src={card.image} alt={`صورة حقيقية: ${productTitle(product)}، ${designLabel(card)}، ${card.look}`} draggable={false} />
                  <span className="sw-stamp sw-yes" style={{ opacity: yes }} aria-hidden="true">
                    عجبتني
                  </span>
                  <span className="sw-stamp sw-no" style={{ opacity: no }} aria-hidden="true">
                    تخطّي
                  </span>
                </div>
                <div className="sw-info">
                  <strong>{designLabel(card)}</strong>
                  <span>{card.look}</span>
                  <small>
                    {productTitle(product)}، {originNames[product.origin]}
                  </small>
                </div>
              </div>
            ) : (
              <div className="sw-card sw-done">
                <p className="sw-done-title">خلّصت البطاقات!</p>
                <p>{likedDesigns.length ? `عجبتك ${tilesWord(likedDesigns.length)}. تقدر تضيفها لطلبك من القائمة، أو تعاود من جديد بترتيب ثاني.` : "ما اخترت شي هالمرة. جرّب نوع ثاني من البلاط، أو عاود من جديد."}</p>
                <button type="button" className="btn btn-sm btn-primary" onClick={restart}>
                  عاود من جديد
                </button>
              </div>
            )}
          </div>

          <div className="sw-controls">
            <button type="button" className="sw-btn sw-btn-yes" onClick={() => decide(true)} disabled={!card} aria-label="عجبتني البلاطة">
              <IconHeart />
            </button>
            <button type="button" className="sw-btn sw-btn-undo" onClick={undo} disabled={!history.length} aria-label="رجّع البطاقة اللي قبل">
              <IconUndo />
            </button>
            <button type="button" className="sw-btn sw-btn-no" onClick={() => decide(false)} disabled={!card} aria-label="تخطّي البلاطة">
              <IconClose />
            </button>
          </div>
          <p className="sw-count">{n ? `${Math.min(pos + 1, n)} من ${n}` : ""}</p>
          <p className="sw-sr" aria-live="polite">
            {msg}
          </p>
        </div>
      </div>
    </section>
  );
}
