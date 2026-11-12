import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { products, wallOnlySizeKeys, wallSizeKeys } from "../../site-data";
import { formatNumber, parseNumber, prefersReducedMotion } from "./fx";
import { IconCube, IconFloor, IconNet, IconPlus, IconRotate } from "./icons";
import { useRequest } from "./request";

// حاسبة البلاط: أرضية فقط، أو أرضية وحيطان للحمامات.
// تحسب البلاط الكامل والمقصوص حسب المخطط والكمية مع هامش الاحتياط، وترسم الغرفة مجسّمة أو مفرودة.

type Size = { w: number; h: number };
type Mode = "floor" | "room";
type View = "3d" | "net";
type Picked = { title: string; origin: string };
export type CalcDetail = { w: number; h: number; title: string; origin: string; kind: string };

const keyOf = (s: Size) => `${s.w}x${s.h}`;
const sizes: Size[] = Array.from(new Map(products.map((p) => [`${p.w}x${p.h}`, { w: p.w, h: p.h }])).values()).sort(
  (a, b) => a.w * a.h - b.w * b.h || a.w - b.w,
);
const sizeLabel = (s: Size) => (s.w === 100 && s.h === 100 ? "1×1 متر" : `${s.w}×${s.h} سم`);
// مقاسات الأرضية بدون المقاسات الحائطية فقط، ومقاسات الحيطان كما أوضحت الشركة.
const floorSizes = sizes.filter((s) => !wallOnlySizeKeys.includes(keyOf(s)));
const wallSizes = sizes.filter((s) => wallSizeKeys.includes(keyOf(s)));
const isFloorKey = (k: string) => floorSizes.some((s) => keyOf(s) === k);
const isWallKey = (k: string) => wallSizes.some((s) => keyOf(s) === k);
const WALL_KIND = "سيراميك حائطي";
const firstWall = products.find((p) => p.kind === WALL_KIND);
const DEFAULT_WALL = firstWall && isWallKey(`${firstWall.w}x${firstWall.h}`) ? `${firstWall.w}x${firstWall.h}` : keyOf(wallSizes[0] ?? sizes[0]);
// مقاسات مثال تتغير مع النوع ما دام الزائر لم يكتب مقاساته.
const SAMPLE = { floor: { len: "5", wid: "4" }, room: { len: "2.5", wid: "2" } };
const MAX_M = 200;
const MAX_H = 10;
const EPS = 1e-6;
const TILT = 52;
const START_PHI = -40;

type Layout = { fullCols: number; fullRows: number; total: number; cut: number };

function layoutOf(len: number, hgt: number, tw: number, th: number): Layout {
  const cols = Math.ceil(len / tw - EPS);
  const rows = Math.ceil(hgt / th - EPS);
  const fullCols = Math.floor(len / tw + EPS);
  const fullRows = Math.floor(hgt / th + EPS);
  return { fullCols, fullRows, total: cols * rows, cut: cols * rows - fullCols * fullRows };
}

// الكمية مع الاحتياط بحساب صحيح (50 بلاطة مع 10% = 55 وليس 56 بسبب كسور الحاسوب).
const withWaste = (n: number, waste: number) => Math.ceil((n * (100 + waste)) / 100 - 1e-9);

function lengthError(raw: string, n: number, empty: string, max: number) {
  if (raw.trim() === "") return empty;
  if (!(n > 0)) return "أدخل رقماً صحيحاً";
  return n > max ? `الحد الأقصى ${max} م` : "";
}

export function openRoomCalculator() {
  window.dispatchEvent(new CustomEvent("am:calc-room"));
  document.getElementById("calculator")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function Calculator() {
  const { add, toast } = useRequest();
  const [mode, setMode] = useState<Mode>("floor");
  const [view, setView] = useState<View>("3d");
  const [len, setLen] = useState(SAMPLE.floor.len);
  const [wid, setWid] = useState(SAMPLE.floor.wid);
  const [hgt, setHgt] = useState("3");
  const [opening, setOpening] = useState("");
  const [floorKey, setFloorKey] = useState("60x60");
  const [floorRot, setFloorRot] = useState(false);
  const [wallKey, setWallKey] = useState(DEFAULT_WALL);
  const [wallRot, setWallRot] = useState(false);
  const [waste, setWaste] = useState(10);
  const [floorProduct, setFloorProduct] = useState<Picked | null>(null);
  const [wallProduct, setWallProduct] = useState<Picked | null>(null);
  const dimsTouched = useRef(false);

  const changeMode = useCallback((m: Mode) => {
    setMode(m);
    if (!dimsTouched.current) {
      setLen(SAMPLE[m].len);
      setWid(SAMPLE[m].wid);
    }
  }, []);

  useEffect(() => {
    const onCalc = (e: Event) => {
      const d = (e as CustomEvent<CalcDetail>).detail;
      const picked = { title: d.title, origin: d.origin };
      const key = `${d.w}x${d.h}`;
      // البلاط الحائطي والمقاسات التي تُركّب على الحيطان فقط تفتح حساب الحمام.
      if (isWallKey(key) && (d.kind === WALL_KIND || !isFloorKey(key))) {
        changeMode("room");
        setWallKey(key);
        setWallRot(false);
        setWallProduct(picked);
      } else if (isFloorKey(key)) {
        setFloorKey(key);
        setFloorRot(false);
        setFloorProduct(picked);
      }
    };
    const onRoom = () => changeMode("room");
    window.addEventListener("am:calc", onCalc);
    window.addEventListener("am:calc-room", onRoom);
    return () => {
      window.removeEventListener("am:calc", onCalc);
      window.removeEventListener("am:calc-room", onRoom);
    };
  }, [changeMode]);

  const room = mode === "room";
  const floorSize = floorSizes.find((s) => keyOf(s) === floorKey) ?? floorSizes[0];
  const wallSize = wallSizes.find((s) => keyOf(s) === wallKey) ?? wallSizes[0];
  const L = parseNumber(len);
  const W = parseNumber(wid);
  const H = parseNumber(hgt);
  const O = opening.trim() === "" ? 0 : parseNumber(opening);
  const lenErr = lengthError(len, L, "أدخل الطول", MAX_M);
  const widErr = lengthError(wid, W, "أدخل العرض", MAX_M);
  const hgtErr = room ? lengthError(hgt, H, "أدخل الارتفاع", MAX_H) : "";
  const floorOk = !lenErr && !widErr;
  const wallGross = floorOk && room && !hgtErr ? 2 * (L + W) * H : 0;
  const openErr = !room || opening.trim() === "" ? "" : !(O >= 0) ? "أدخل رقماً صحيحاً" : wallGross > 0 && O >= wallGross ? "أكبر من مساحة الحيطان" : "";
  const wallsOk = room && floorOk && !hgtErr && !openErr;

  const floor = useMemo(() => {
    if (!floorOk) return null;
    const lc = L * 100;
    const wc = W * 100;
    const tw = floorRot ? floorSize.h : floorSize.w;
    const th = floorRot ? floorSize.w : floorSize.h;
    const lay = layoutOf(lc, wc, tw, th);
    const buy = withWaste(lay.total, waste);
    return { lc, wc, tw, th, total: lay.total, cut: lay.cut, area: L * W, buy, buyArea: (buy * tw * th) / 10000 };
  }, [floorOk, L, W, floorRot, floorSize.w, floorSize.h, waste]);

  const walls = useMemo(() => {
    if (!wallsOk || !floor) return null;
    const hc = H * 100;
    const tw = wallRot ? wallSize.h : wallSize.w;
    const th = wallRot ? wallSize.w : wallSize.h;
    const a = layoutOf(floor.lc, hc, tw, th);
    const b = layoutOf(floor.wc, hc, tw, th);
    // البلاطات التي تقع كاملة داخل الباب والشبابيك لا تُشترى.
    const openTiles = Math.floor((O * 10000) / (tw * th) + EPS);
    const total = Math.max(0, 2 * (a.total + b.total) - openTiles);
    const buy = withWaste(total, waste);
    return {
      hc,
      tw,
      th,
      total,
      cut: Math.min(total, 2 * (a.cut + b.cut)),
      area: 2 * (L + W) * H - O,
      buy,
      buyArea: (buy * tw * th) / 10000,
    };
  }, [wallsOk, floor, H, O, L, W, wallRot, wallSize.w, wallSize.h, waste]);

  const dimsText = `${formatNumber(L)}×${formatNumber(W)} م`;

  const addToRequest = () => {
    if (!floor || (room && !walls)) return;
    add({
      key: `calc-floor-${floorProduct ? floorProduct.title : floorKey}-${len}x${wid}`,
      title: floorProduct ? floorProduct.title : `بلاط أرضية ${sizeLabel(floorSize)}`,
      detail: [floorProduct?.origin, `أرضية ${dimsText}`, `${floor.buy} بلاطة مع الاحتياط`].filter(Boolean).join("، "),
      area: formatNumber(floor.buyArea, 1),
    });
    if (room && walls) {
      add({
        key: `calc-wall-${wallProduct ? wallProduct.title : wallKey}-${len}x${wid}x${hgt}`,
        title: wallProduct ? wallProduct.title : `بلاط حائطي ${sizeLabel(wallSize)}`,
        detail: [
          wallProduct?.origin,
          `حيطان غرفة ${dimsText} بارتفاع ${formatNumber(H)} م`,
          O > 0 ? `بعد خصم ${formatNumber(O)} م² للباب والشبابيك` : "",
          `${walls.buy} بلاطة مع الاحتياط`,
        ]
          .filter(Boolean)
          .join("، "),
        area: formatNumber(walls.buyArea, 1),
      });
      toast("أُضيف إلى طلبك: بلاط الأرضية والبلاط الحائطي");
    }
  };

  return (
    <section className="sec sec-calc" id="calculator">
      <div className="wrap">
        <div className="sec-head sec-head-light" data-reveal>
          <h2 className="h2">حاسبة البلاط</h2>
          <p className="lead">أدخل مقاسات الغرفة واختر مقاس البلاط. وللحمام أضف ارتفاع الحيطان لنحسب البلاط الحائطي مع الأرضية، وشاهد الغرفة والكمية التقريبية فوراً.</p>
        </div>

        <div className="calc" data-reveal>
          <form className="calc-form" onSubmit={(e) => e.preventDefault()} noValidate>
            <fieldset className="calc-mode">
              <legend>ماذا ستبلّط؟</legend>
              <div className="calc-mode-opts">
                <ModeOption value="floor" on={!room} onPick={() => changeMode("floor")} icon={<IconFloor />} title="أرضية فقط" sub="صالات وغرف" />
                <ModeOption value="room" on={room} onPick={() => changeMode("room")} icon={<IconCube />} title="أرضية وحيطان" sub="حمامات" />
              </div>
            </fieldset>

            {floorProduct ? <PickedProduct label={room ? "صنف الأرضية" : "الصنف"} p={floorProduct} onClear={() => setFloorProduct(null)} /> : null}
            {room && wallProduct ? <PickedProduct label="الصنف الحائطي" p={wallProduct} onClear={() => setWallProduct(null)} /> : null}

            <fieldset className="calc-dims">
              <legend>مقاسات الغرفة بالمتر</legend>
              <div className={`calc-row ${room ? "calc-row-3" : ""}`}>
                <Field
                  id="calc-len"
                  label="الطول"
                  value={len}
                  onChange={(v) => {
                    dimsTouched.current = true;
                    setLen(v);
                  }}
                  error={lenErr}
                />
                <Field
                  id="calc-wid"
                  label="العرض"
                  value={wid}
                  onChange={(v) => {
                    dimsTouched.current = true;
                    setWid(v);
                  }}
                  error={widErr}
                />
                {room ? <Field id="calc-hgt" label="الارتفاع" value={hgt} onChange={setHgt} error={hgtErr} className="calc-appear" /> : null}
              </div>
              {room ? <p className="calc-hint calc-appear">الارتفاع هو المكان الذي سيصل إليه البلاط على الحيطان، وغالباً يكون حتى السقف.</p> : null}
            </fieldset>

            <SizePicker
              options={floorSizes}
              name="calc-floor-size"
              legend={room ? "مقاس بلاط الأرضية" : "مقاس البلاط"}
              value={floorKey}
              rotated={floorRot}
              onPick={(k) => {
                setFloorKey(k);
                setFloorRot(false);
                setFloorProduct(null);
              }}
              onRotate={() => setFloorRot((v) => !v)}
            />

            {room ? (
              <div className="calc-walls calc-appear">
                <SizePicker
                  options={wallSizes}
                  name="calc-wall-size"
                  legend="مقاس البلاط الحائطي"
                  value={wallKey}
                  rotated={wallRot}
                  onPick={(k) => {
                    setWallKey(k);
                    setWallRot(false);
                    setWallProduct(null);
                  }}
                  onRotate={() => setWallRot((v) => !v)}
                />
                <Field
                  id="calc-open"
                  label="خصم الباب والشبابيك (م²)"
                  value={opening}
                  onChange={setOpening}
                  error={openErr}
                  placeholder="0"
                  hint="اختياري. مثلاً باب 80×200 سم = 1.6 م²"
                />
              </div>
            ) : null}

            <label className="calc-waste">
              <span>
                هامش احتياط للقص والكسر: <strong>{waste}%</strong>
              </span>
              <input type="range" min={0} max={20} step={1} value={waste} onChange={(e) => setWaste(Number(e.target.value))} />
            </label>
          </form>

          <div className="calc-out">
            <div className="calc-view-bar">
              <span className="calc-view-title">{room ? "الأرضية والحيطان" : "مخطط الأرضية"}</span>
              {walls ? (
                <div className="calc-view-toggle" role="group" aria-label="طريقة عرض الغرفة">
                  <button type="button" className={view === "3d" ? "is-on" : ""} aria-pressed={view === "3d"} onClick={() => setView("3d")}>
                    <IconCube /> مجسّم
                  </button>
                  <button type="button" className={view === "net" ? "is-on" : ""} aria-pressed={view === "net"} onClick={() => setView("net")}>
                    <IconNet /> مفرود
                  </button>
                </div>
              ) : null}
            </div>

            {floor ? (
              <RoomView floor={floor} walls={walls} view={view} />
            ) : (
              <div className="calc-plan calc-plan-off">
                <p className="calc-plan-empty">أدخل الطول والعرض لرسم المخطط</p>
              </div>
            )}

            {floor ? (
              <div className="calc-legend">
                <span>
                  <i className="lg-tile" /> {walls ? "بلاط الأرضية" : "بلاطة كاملة"}
                </span>
                {walls ? (
                  <span>
                    <i className="lg-wall" /> البلاط الحائطي
                  </span>
                ) : null}
                <span>
                  <i className="lg-cut" /> بلاطة مقصوصة
                </span>
                <span className="muted">{walls ? `${dimsText}، ارتفاع ${formatNumber(H)} م` : dimsText}</span>
              </div>
            ) : null}

            <div className="calc-res" aria-live="polite">
              <ResultGroup
                title={room ? "الأرضية" : undefined}
                swatch="lg-tile"
                size={sizeLabel(floorSize)}
                areaLabel="مساحة الأرضية"
                area={floor ? `${formatNumber(floor.area)} م²` : "-"}
                total={floor?.total}
                cut={floor?.cut}
                buy={floor?.buy}
                buyArea={floor?.buyArea}
              />
              {room ? (
                <ResultGroup
                  title="الحيطان"
                  swatch="lg-wall"
                  size={sizeLabel(wallSize)}
                  areaLabel={O > 0 ? "مساحة الحيطان بعد الخصم" : "مساحة الحيطان"}
                  area={walls ? `${formatNumber(walls.area)} م²` : "-"}
                  total={walls?.total}
                  cut={walls?.cut}
                  buy={walls?.buy}
                  buyArea={walls?.buyArea}
                />
              ) : null}
            </div>

            <div className="calc-actions">
              <button type="button" className="btn btn-light" onClick={addToRequest} disabled={!floor || (room && !walls)} data-magnetic>
                <IconPlus /> {room ? "أضف الكميتين لطلبي" : "أضف الكمية لطلبي"}
              </button>
            </div>
            <p className="calc-note">
              النتيجة تقديرية. عدد الكراتين يحدده الفرع حسب الصنف، وننصح بمراجعة المقاسات معنا قبل الشراء.
              {room ? " حساب الحيطان يفترض تبليط الحيطان الأربعة حتى الارتفاع الذي أدخلته." : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeOption({ value, on, onPick, icon, title, sub }: { value: Mode; on: boolean; onPick: () => void; icon: ReactNode; title: string; sub: string }) {
  return (
    <label className={`calc-mode-opt ${on ? "is-on" : ""}`}>
      <input type="radio" name="calc-mode" value={value} checked={on} onChange={onPick} />
      {icon}
      <span>
        <strong>{title}</strong>
        <small>{sub}</small>
      </span>
    </label>
  );
}

function PickedProduct({ label, p, onClear }: { label: string; p: Picked; onClear: () => void }) {
  return (
    <div className="calc-product">
      <span>
        {label}: <strong>{p.title}</strong> ({p.origin})
      </span>
      <button type="button" className="btn btn-text" onClick={onClear} aria-label={`إلغاء ${label}`}>
        إلغاء
      </button>
    </div>
  );
}

function SizePicker({
  options,
  name,
  legend,
  value,
  rotated,
  onPick,
  onRotate,
}: {
  options: Size[];
  name: string;
  legend: string;
  value: string;
  rotated: boolean;
  onPick: (key: string) => void;
  onRotate: () => void;
}) {
  const selected = options.find((s) => keyOf(s) === value) ?? options[0];
  return (
    <fieldset className="calc-sizes">
      <legend>{legend}</legend>
      <div className="calc-size-grid" style={{ gridTemplateColumns: `repeat(${Math.min(4, options.length)}, 1fr)` }}>
        {options.map((s) => {
          const key = keyOf(s);
          const on = key === value;
          const w = on && rotated ? s.h : s.w;
          const h = on && rotated ? s.w : s.h;
          return (
            <label key={key} className={`calc-size ${on ? "is-on" : ""}`}>
              <input type="radio" name={name} value={key} checked={on} onChange={() => onPick(key)} />
              <span className="calc-size-shape" style={{ width: `${(w / 120) * 34 + 6}px`, height: `${(h / 120) * 34 + 6}px` }} />
              <span>{sizeLabel(s)}</span>
            </label>
          );
        })}
      </div>
      {selected.w !== selected.h ? (
        <button type="button" className="btn btn-outline-light btn-sm calc-rotate" onClick={onRotate} aria-pressed={rotated}>
          <IconRotate /> تدوير اتجاه البلاط
        </button>
      ) : null}
    </fieldset>
  );
}

function ResultGroup({
  title,
  swatch,
  size,
  areaLabel,
  area,
  total,
  cut,
  buy,
  buyArea,
}: {
  title?: string;
  swatch: string;
  size: string;
  areaLabel: string;
  area: string;
  total?: number;
  cut?: number;
  buy?: number;
  buyArea?: number;
}) {
  return (
    <div className="calc-group">
      {title ? (
        <h3 className="calc-group-title">
          <i className={swatch} aria-hidden="true" /> {title} <small>{size}</small>
        </h3>
      ) : null}
      <dl className="calc-results">
        <div>
          <dt>{areaLabel}</dt>
          <dd>{area}</dd>
        </div>
        <div>
          <dt>بلاط حسب المخطط</dt>
          <dd>{total !== undefined ? `${total} بلاطة` : "-"}</dd>
          {cut ? <dd className="calc-sub">منها {cut} مقصوصة</dd> : null}
        </div>
        <div className="calc-main">
          <dt>الكمية المقترحة مع الاحتياط</dt>
          <dd key={buy ?? "none"} className="calc-num">
            {buy !== undefined ? `${buy} بلاطة` : "-"}
          </dd>
          {buyArea !== undefined ? <dd className="calc-sub">نحو {formatNumber(buyArea, 1)} م²</dd> : null}
        </div>
      </dl>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string;
  hint?: string;
  placeholder?: string;
  className?: string;
}) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ");
  return (
    <div className={`field field-dark ${error ? "has-error" : ""} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
      />
      {hint ? (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field-error" id={`${id}-err`}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

/* ---------- رسم الغرفة: مخطط، مجسّم، مفرود ---------- */

type FloorDraw = { lc: number; wc: number; tw: number; th: number };
type WallDraw = { hc: number; tw: number; th: number };
type Shape = "floor" | View;

// مقياس يجعل الغرفة المجسّمة تملأ الإطار في أي اتجاه تدوير، مع حساب المنظور.
function fit3d(Lp: number, Wp: number, Hp: number, aw: number, ah: number, P: number) {
  const a = (TILT * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const D = Math.hypot(Lp, Wp);
  let s = Math.min(aw / D, ah / (D * ca + Hp * sa));
  let ty = 0;
  for (let it = 0; it < 4; it++) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let deg = 0; deg < 360; deg += 7.5) {
      const p = (deg * Math.PI) / 180;
      const cp = Math.cos(p);
      const sp = Math.sin(p);
      for (const x of [-Lp / 2, Lp / 2]) {
        for (const y of [-Wp / 2, Wp / 2]) {
          const x1 = x * cp - y * sp;
          const y1 = x * sp + y * cp;
          for (const z of [0, Hp]) {
            const y2 = y1 * ca - z * sa;
            const z2 = (y1 * sa + z * ca) * s;
            const f = P / Math.max(P * 0.2, P - z2);
            const X = x1 * s * f;
            const Y = (y2 * s + ty) * f;
            minX = Math.min(minX, X);
            maxX = Math.max(maxX, X);
            minY = Math.min(minY, Y);
            maxY = Math.max(maxY, Y);
          }
        }
      }
    }
    const k = Math.min(aw / (maxX - minX), ah / (maxY - minY));
    ty = (ty - (minY + maxY) / 2) * k;
    s *= k;
  }
  return { s, ty };
}

const cmText = (cm: number) => formatNumber(cm / 100);

function RoomView({ floor, walls, view }: { floor: FloorDraw; walls: WallDraw | null; view: View }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; phi: number; id: number } | null>(null);
  const [box, setBox] = useState({ w: 520, h: 390 });
  const [phi, setPhi] = useState(START_PHI);
  const [dragging, setDragging] = useState(false);
  const [dragged, setDragged] = useState(false);

  // نحتفظ بآخر حيطان صالحة حتى تنزل الحيطان بشكلها عند الرجوع للأرضية فقط.
  const lastWalls = useRef<WallDraw | null>(walls);
  if (walls) lastWalls.current = walls;
  const wallsDraw = walls ?? lastWalls.current;
  const shape: Shape = walls ? view : "floor";

  // الحركة تعمل فقط عند تغيير طريقة العرض، وليس مع كل رقم يكتبه الزائر.
  const [prevShape, setPrevShape] = useState<Shape>(shape);
  const [anim, setAnim] = useState(false);
  if (prevShape !== shape) {
    setPrevShape(shape);
    setAnim(true);
  }
  useEffect(() => {
    if (!anim) return;
    const t = window.setTimeout(() => setAnim(false), 1500);
    return () => window.clearTimeout(t);
  }, [anim, shape]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = box.w < 420 ? 14 : 22;
  const aw = Math.max(40, box.w - pad * 2);
  const ah = Math.max(40, box.h - pad * 2);
  const k0 = Math.min(aw / floor.lc, ah / floor.wc);
  const Lp = floor.lc * k0;
  const Wp = floor.wc * k0;
  const Hp = (wallsDraw ? wallsDraw.hc : 260) * k0;
  const persp = Math.round(Math.max(box.w, box.h) * 2.1);

  const fit = useMemo(() => {
    if (shape === "floor") return { s: 1, ty: 0 };
    if (shape === "net") return { s: Math.min(aw / (Lp + 2 * Hp), ah / (Wp + 2 * Hp)), ty: 0 };
    return fit3d(Lp, Wp, Hp, aw, ah, persp);
  }, [shape, aw, ah, Lp, Wp, Hp, persp]);

  const u = 1 / (k0 * fit.s);
  const theta = shape === "net" ? 0 : -90;
  const sy = shape === "floor" ? 0.001 : 1;
  const wallDefs = [
    { id: "n", len: floor.lc, psi: 0, hx: 0, hy: -Wp / 2 },
    { id: "e", len: floor.wc, psi: 90, hx: Lp / 2, hy: 0 },
    { id: "s", len: floor.lc, psi: 180, hx: 0, hy: Wp / 2 },
    { id: "w", len: floor.wc, psi: -90, hx: -Lp / 2, hy: 0 },
  ];

  // الحيطان القريبة من الزائر تصبح شفافة حتى يرى داخل الغرفة، والحائط المقابل للضوء أغمق قليلاً.
  const wallOpacity = (psi: number) => {
    if (shape !== "3d") return 1;
    const c = Math.cos(((psi + phi) * Math.PI) / 180);
    return c >= 0.12 ? 1 : c <= -0.22 ? 0.18 : 0.18 + ((c + 0.22) / 0.34) * 0.82;
  };
  const wallShade = (psi: number) => Math.max(0, Math.sin(((psi + phi) * Math.PI) / 180)) * 0.2;

  const sceneStyle = {
    transform:
      shape === "3d"
        ? `translateY(${fit.ty}px) scale3d(${fit.s}, ${fit.s}, ${fit.s}) rotateX(${TILT}deg) rotateZ(${phi}deg)`
        : `translateY(0px) scale3d(${fit.s}, ${fit.s}, ${fit.s}) rotateX(0deg) rotateZ(0deg)`,
    "--inv": 1 / fit.s,
  } as CSSProperties;

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (shape !== "3d" || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { x: e.clientX, phi, id: e.pointerId };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* تجاهل */
    }
    setDragging(true);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!dragged && Math.abs(dx) > 4) setDragged(true);
    setPhi(d.phi - dx * 0.5);
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    setPhi((p) => ((((p + 180) % 360) + 360) % 360) - 180);
  };

  return (
    <div
      ref={boxRef}
      className={`calc-plan rv${anim ? " is-anim" : ""}${dragging ? " is-dragging" : ""}${dragged ? " was-dragged" : ""}`}
      data-shape={shape}
      style={{ perspective: `${persp}px` }}
      aria-hidden="true"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="rv-scene" style={sceneStyle}>
        <div className="rv-shadow" style={{ left: -Lp / 2, top: -Wp / 2, width: Lp, height: Wp }} />
        <div className="rv-face rv-floor" style={{ left: -Lp / 2, top: -Wp / 2, width: Lp, height: Wp }}>
          <TileFace len={floor.lc} hgt={floor.wc} tw={floor.tw} th={floor.th} u={u} variant="floor" />
          <span className="rv-label">{`${cmText(floor.lc)} × ${cmText(floor.wc)} م`}</span>
        </div>
        {wallDefs.map((w, i) => (
          <div
            key={w.id}
            className="rv-face rv-wall"
            style={
              {
                left: -(w.len * k0) / 2,
                top: -Hp,
                width: w.len * k0,
                height: Hp,
                opacity: wallOpacity(w.psi),
                "--shade": wallShade(w.psi).toFixed(3),
                transform: `translate(${w.hx}px, ${w.hy}px) rotate(${w.psi}deg) rotateX(${theta}deg) scaleY(${sy})`,
                "--i": i,
                "--lr": `${-w.psi}deg`,
              } as CSSProperties
            }
          >
            {wallsDraw ? <TileFace len={w.len} hgt={wallsDraw.hc} tw={wallsDraw.tw} th={wallsDraw.th} u={u} variant="wall" /> : null}
            {wallsDraw ? <span className="rv-label">{`${cmText(w.len)} × ${cmText(wallsDraw.hc)} م`}</span> : null}
          </div>
        ))}
      </div>
      <span className="rv-hint">
        <IconRotate /> اسحب لتدوير المجسّم
      </span>
    </div>
  );
}

// وجه مبلّط: بلاط كامل، شريط مقصوص مخطط، وخطوط الفواصل فوق الجميع.
// بلاط الحيطان يبدأ من الأرض صعوداً، فيكون الصف المقصوص في الأعلى.
const TileFace = memo(function TileFace({
  len,
  hgt,
  tw,
  th,
  u,
  variant,
}: {
  len: number;
  hgt: number;
  tw: number;
  th: number;
  u: number;
  variant: "floor" | "wall";
}) {
  const id = `tf-${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;
  const lay = layoutOf(len, hgt, tw, th);
  const fromBottom = variant === "wall";
  const cutW = len - lay.fullCols * tw;
  const cutH = hgt - lay.fullRows * th;
  const py = fromBottom ? cutH : 0;
  const grout = Math.min(1.1 * u, Math.min(tw, th) / 5);
  const hatch = 7 * u;
  return (
    <svg viewBox={`0 0 ${len} ${hgt}`} preserveAspectRatio="none" className={`rv-svg rv-svg-${variant}`}>
      <defs>
        <pattern id={`${id}a`} x={0} y={py} width={tw} height={th} patternUnits="userSpaceOnUse">
          <rect width={tw} height={th} className="plan-tile" />
        </pattern>
        <pattern id={`${id}g`} x={0} y={py} width={tw} height={th} patternUnits="userSpaceOnUse">
          <rect width={tw} height={th} fill="none" className="plan-grout" strokeWidth={grout} />
        </pattern>
        <pattern id={`${id}c`} width={hatch} height={hatch} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={hatch} height={hatch} className="plan-cut-bg" />
          <line x1="0" y1="0" x2="0" y2={hatch} className="plan-cut-line" strokeWidth={hatch * 0.32} />
        </pattern>
      </defs>
      <rect width={len} height={hgt} fill={`url(#${id}a)`} />
      {cutW > 0.5 ? <rect x={lay.fullCols * tw} width={cutW} height={hgt} fill={`url(#${id}c)`} /> : null}
      {cutH > 0.5 ? <rect y={fromBottom ? 0 : lay.fullRows * th} width={len} height={cutH} fill={`url(#${id}c)`} /> : null}
      <rect width={len} height={hgt} fill={`url(#${id}g)`} />
      <rect width={len} height={hgt} fill="none" className="plan-wall" strokeWidth={2.4 * u} />
    </svg>
  );
});
