import { useState, type CSSProperties } from "react";
import { company, hexGallery, hexProduct, originNames } from "../../site-data";
import { requestItem, searchCatalog } from "./catalog";
import { IconArrow, IconCheck, IconHex, IconPlus } from "./icons";
import { Lightbox } from "./lightbox";
import { useRequest } from "./request";

// خلية السداسي: أفكار الصنف السداسي في شبكة خلايا نحل بألوان هوية الشركة.
// الصور خلايا تُكبَّر عند الضغط، وبينها خلايا زرقاء وبيضاء تحمل معلومات الصنف وزر الإضافة للطلب.

type Cell =
  | { kind: "photo"; index: number }
  | { kind: "logo" }
  | { kind: "fact"; small: string; big: string; tone: "white" | "sky" | "glow" }
  | { kind: "cta" };

const photo = (index: number): Cell => ({ kind: "photo", index });

// 15 خلية: ثلاثة صفوف من خمس على الشاشات العريضة، وصفوف من ثلاث ثم اثنتين على الجوال.
// خلايا الهوية تقع في الأركان والوسط في الترتيبين.
function buildCells(origin: string): Cell[] {
  const [small, ...rest] = origin.split(" ");
  return [
    { kind: "logo" },
    photo(0),
    photo(1),
    photo(2),
    { kind: "fact", small: "يُركّب", big: "للحيطان", tone: "white" },
    photo(3),
    photo(4),
    { kind: "fact", small, big: rest.join(" "), tone: "sky" },
    photo(5),
    photo(6),
    { kind: "fact", small: "يُركّب", big: "للأرضيات", tone: "glow" },
    photo(7),
    photo(8),
    photo(9),
    { kind: "cta" },
  ];
}

// عدد صفوف الشبكة: على الشاشات العريضة خمس خلايا في كل صف، وعلى الجوال صف من ثلاث ثم صف من اثنتين.
const rowsWide = (n: number) => Math.ceil(n / 5);
const rowsNarrow = (n: number) => {
  const rest = n % 5;
  return Math.floor(n / 5) * 2 + (rest === 0 ? 0 : rest <= 3 ? 1 : 2);
};

export function Hive() {
  const { add, has } = useRequest();
  const [open, setOpen] = useState<number | null>(null);
  if (!hexProduct) return null;

  const product = hexProduct;
  const added = has(product.id);
  const cells = buildCells(originNames[product.origin]);

  return (
    <div className="hive-band" id="hexagon">
      <div className="wrap">
        <div className="hive-head" data-reveal>
          <p className="hive-kicker">
            <IconHex /> {originNames[product.origin]}
          </p>
          <h3 className="hive-title">
            {product.kind} <span>{product.variant}</span>
          </h3>
          <p className="hive-lead">شكل واحد وأفكار كثيرة: سادة هادئ، أو منقوش يلفت النظر، أو لونان معاً. اضغط على أي صورة لتكبيرها.</p>
          <div className="hive-actions">
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => searchCatalog(product.variant ?? product.kind)}>
              شاهد الصنف في الكتالوج <IconArrow />
            </button>
          </div>
        </div>

        <div className="hive-box">
          <div
            className="hive"
            data-reveal
            role="group"
            aria-label={`صور أفكار ${product.kind} ${product.variant ?? ""}`}
            style={{ "--rows-wide": rowsWide(cells.length), "--rows-narrow": rowsNarrow(cells.length) } as CSSProperties}
          >
            {cells.map((c, i) => {
              const style = { "--i": i } as CSSProperties;
              if (c.kind === "photo") {
                const g = hexGallery[c.index];
                if (!g) return null;
                return (
                  <button key={i} type="button" className="hx hx-photo" style={style} onClick={() => setOpen(c.index)} aria-label={`تكبير: ${g.caption}`}>
                    <img src={g.thumb ?? g.image} alt="" loading="lazy" width={420} height={485} />
                  </button>
                );
              }
              if (c.kind === "logo")
                return (
                  <div key={i} className="hx hx-logo" style={style}>
                    <span className="mark" aria-hidden="true" />
                    <span className="word" role="img" aria-label={company.nameAr} />
                  </div>
                );
              if (c.kind === "fact")
                return (
                  <div key={i} className={`hx hx-fact hx-${c.tone}`} style={style}>
                    <small>{c.small}</small>
                    <strong>{c.big}</strong>
                  </div>
                );
              return (
                <button key={i} type="button" className={`hx hx-cta ${added ? "is-added" : ""}`} style={style} onClick={() => add(requestItem(product))}>
                  {added ? <IconCheck /> : <IconPlus />}
                  <strong>{added ? "في طلبك" : "أضف لطلبي"}</strong>
                </button>
              );
            })}
          </div>
        </div>
        <p className="hive-note">الصور للتوضيح، والألوان والنقشات المتوفرة تُعرض في الفروع.</p>
      </div>
      {open !== null ? <Lightbox items={hexGallery} index={open} onClose={() => setOpen(null)} onNav={(i) => setOpen(i)} /> : null}
    </div>
  );
}
