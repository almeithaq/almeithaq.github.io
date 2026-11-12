import { useEffect, useMemo, useState } from "react";
import { products } from "../../site-data";
import { formatNumber, parseNumber } from "./fx";
import { IconPlus, IconRotate } from "./icons";
import { useRequest } from "./request";

// حاسبة البلاط: مساحة الأرضية، عدد البلاطات حسب المخطط (الكاملة والمقصوصة)، والكمية مع هامش الاحتياط.

type Size = { w: number; h: number };
const sizes: Size[] = Array.from(new Map(products.map((p) => [`${p.w}x${p.h}`, { w: p.w, h: p.h }])).values()).sort(
  (a, b) => a.w * a.h - b.w * b.h || a.w - b.w,
);
const sizeLabel = (s: Size) => (s.w === 100 && s.h === 100 ? "1×1 متر" : `${s.w}×${s.h} سم`);
const MAX_M = 200;

export function Calculator() {
  const { add } = useRequest();
  const [len, setLen] = useState("5");
  const [wid, setWid] = useState("4");
  const [sizeKey, setSizeKey] = useState("60x60");
  const [rotated, setRotated] = useState(false);
  const [waste, setWaste] = useState(10);
  const [product, setProduct] = useState<{ title: string; origin: string } | null>(null);

  useEffect(() => {
    const onCalc = (e: Event) => {
      const d = (e as CustomEvent<{ w: number; h: number; title: string; origin: string }>).detail;
      setSizeKey(`${d.w}x${d.h}`);
      setRotated(false);
      setProduct({ title: d.title, origin: d.origin });
    };
    window.addEventListener("am:calc", onCalc);
    return () => window.removeEventListener("am:calc", onCalc);
  }, []);

  const size = sizes.find((s) => `${s.w}x${s.h}` === sizeKey) ?? sizes[0];
  const square = size.w === size.h;
  const L = parseNumber(len);
  const W = parseNumber(wid);
  const lenErr = len.trim() === "" ? "أدخل الطول" : !(L > 0) ? "أدخل رقماً صحيحاً" : L > MAX_M ? `الحد الأقصى ${MAX_M} م` : "";
  const widErr = wid.trim() === "" ? "أدخل العرض" : !(W > 0) ? "أدخل رقماً صحيحاً" : W > MAX_M ? `الحد الأقصى ${MAX_M} م` : "";
  const ok = !lenErr && !widErr;

  const r = useMemo(() => {
    if (!ok) return null;
    const lc = L * 100;
    const wc = W * 100;
    const tw = rotated ? size.h : size.w;
    const th = rotated ? size.w : size.h;
    const eps = 1e-6;
    const cols = Math.ceil(lc / tw - eps);
    const rows = Math.ceil(wc / th - eps);
    const fullCols = Math.floor(lc / tw + eps);
    const fullRows = Math.floor(wc / th + eps);
    const total = cols * rows;
    const full = fullCols * fullRows;
    const buy = Math.ceil(total * (1 + waste / 100));
    return {
      lc,
      wc,
      tw,
      th,
      fullCols,
      fullRows,
      area: L * W,
      total,
      cut: total - full,
      buy,
      buyArea: (buy * tw * th) / 10000,
    };
  }, [ok, L, W, rotated, size.w, size.h, waste]);

  const pad = r ? Math.max(r.lc, r.wc) * 0.04 : 0;
  const stroke = r ? Math.max(r.lc, r.wc) / 320 : 1;

  const addToRequest = () => {
    if (!r) return;
    const title = product ? product.title : `بلاط ${sizeLabel(size)}`;
    add({
      key: `calc-${product ? product.title : sizeKey}-${len}x${wid}`,
      title,
      detail: [product?.origin, `أرضية ${formatNumber(L)}×${formatNumber(W)} م`, `${r.buy} بلاطة مع الاحتياط`].filter(Boolean).join("، "),
      area: formatNumber(r.buyArea, 1),
    });
  };

  return (
    <section className="sec sec-calc" id="calculator">
      <div className="wrap">
        <div className="sec-head sec-head-light" data-reveal>
          <h2 className="h2">حاسبة البلاط</h2>
          <p className="lead">أدخل مقاسات الغرفة واختر مقاس البلاط، وشاهد المخطط والكمية التقريبية فوراً.</p>
        </div>

        <div className="calc" data-reveal>
          <form className="calc-form" onSubmit={(e) => e.preventDefault()} noValidate>
            {product ? (
              <div className="calc-product">
                <span>
                  الصنف: <strong>{product.title}</strong> ({product.origin})
                </span>
                <button type="button" className="btn btn-text" onClick={() => setProduct(null)}>
                  إلغاء
                </button>
              </div>
            ) : null}
            <div className="calc-row">
              <Field id="calc-len" label="طول الغرفة (متر)" value={len} onChange={setLen} error={lenErr} />
              <Field id="calc-wid" label="عرض الغرفة (متر)" value={wid} onChange={setWid} error={widErr} />
            </div>

            <fieldset className="calc-sizes">
              <legend>مقاس البلاط</legend>
              <div className="calc-size-grid">
                {sizes.map((s) => {
                  const key = `${s.w}x${s.h}`;
                  const max = 120;
                  return (
                    <label key={key} className={`calc-size ${key === sizeKey ? "is-on" : ""}`}>
                      <input
                        type="radio"
                        name="calc-size"
                        value={key}
                        checked={key === sizeKey}
                        onChange={() => {
                          setSizeKey(key);
                          setRotated(false);
                          setProduct(null);
                        }}
                      />
                      <span className="calc-size-shape" style={{ width: `${(s.w / max) * 34 + 6}px`, height: `${(s.h / max) * 34 + 6}px` }} />
                      <span>{sizeLabel(s)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="calc-row calc-row-end">
              <label className="calc-waste">
                <span>
                  هامش احتياط للقص والكسر: <strong>{waste}%</strong>
                </span>
                <input type="range" min={0} max={20} step={1} value={waste} onChange={(e) => setWaste(Number(e.target.value))} />
              </label>
              {!square ? (
                <button type="button" className="btn btn-outline-light btn-sm" onClick={() => setRotated((v) => !v)} aria-pressed={rotated}>
                  <IconRotate /> تدوير اتجاه البلاط
                </button>
              ) : null}
            </div>
          </form>

          <div className="calc-out">
            <div className="calc-plan" aria-hidden="true">
              {r ? (
                <svg key={`${r.tw}-${r.th}-${r.lc}-${r.wc}`} viewBox={`${-pad} ${-pad} ${r.lc + pad * 2} ${r.wc + pad * 2}`} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="calc-tile" width={r.tw} height={r.th} patternUnits="userSpaceOnUse">
                      <rect width={r.tw} height={r.th} className="plan-tile" />
                      <rect width={r.tw} height={r.th} fill="none" className="plan-grout" strokeWidth={stroke} />
                    </pattern>
                    <pattern id="calc-cut" width={stroke * 10} height={stroke * 10} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width={stroke * 10} height={stroke * 10} className="plan-cut-bg" />
                      <line x1="0" y1="0" x2="0" y2={stroke * 10} className="plan-cut-line" strokeWidth={stroke * 2.2} />
                    </pattern>
                  </defs>
                  <rect width={r.lc} height={r.wc} fill="url(#calc-tile)" className="plan-floor" />
                  {r.lc - r.fullCols * r.tw > 0.5 ? (
                    <rect x={r.fullCols * r.tw} width={r.lc - r.fullCols * r.tw} height={r.wc} fill="url(#calc-cut)" />
                  ) : null}
                  {r.wc - r.fullRows * r.th > 0.5 ? (
                    <rect y={r.fullRows * r.th} width={r.lc} height={r.wc - r.fullRows * r.th} fill="url(#calc-cut)" />
                  ) : null}
                  <rect width={r.lc} height={r.wc} fill="none" className="plan-wall" strokeWidth={stroke * 3} />
                </svg>
              ) : (
                <p className="calc-plan-empty">أدخل الطول والعرض لرسم المخطط</p>
              )}
            </div>
            {r ? (
              <div className="calc-legend">
                <span>
                  <i className="lg-tile" /> بلاطة كاملة
                </span>
                <span>
                  <i className="lg-cut" /> بلاطة مقصوصة
                </span>
                <span className="muted">
                  {formatNumber(L)} × {formatNumber(W)} م
                </span>
              </div>
            ) : null}

            <dl className="calc-results" aria-live="polite">
              <div>
                <dt>مساحة الأرضية</dt>
                <dd>{r ? `${formatNumber(r.area)} م²` : "-"}</dd>
              </div>
              <div>
                <dt>بلاط حسب المخطط</dt>
                <dd>{r ? `${r.total} بلاطة` : "-"}</dd>
                {r && r.cut > 0 ? <dd className="calc-sub">منها {r.cut} مقصوصة</dd> : null}
              </div>
              <div className="calc-main">
                <dt>الكمية المقترحة مع الاحتياط</dt>
                <dd>{r ? `${r.buy} بلاطة` : "-"}</dd>
                {r ? <dd className="calc-sub">نحو {formatNumber(r.buyArea, 1)} م²</dd> : null}
              </div>
            </dl>
            <div className="calc-actions">
              <button type="button" className="btn btn-light" onClick={addToRequest} disabled={!r} data-magnetic>
                <IconPlus /> أضف الكمية لطلبي
              </button>
            </div>
            <p className="calc-note">النتيجة تقديرية. عدد الكراتين يحدده الفرع حسب الصنف، وننصح بمراجعة المقاسات معنا قبل الشراء.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (v: string) => void; error: string }) {
  return (
    <div className={`field field-dark ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      {error ? (
        <span className="field-error" id={`${id}-err`}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
