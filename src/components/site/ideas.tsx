import { useState, type CSSProperties } from "react";
import { designById, designLabel, ideas, originNames, productById, productTitle, type Design, type Idea } from "../../site-data";
import { designRequestItem, openViewer, productSlidesFor } from "./designs";
import { IconCheck, IconPlus } from "./icons";
import { useRequest } from "./request";

// أفكار لمساحتك: قائمة أفكار على جنب، واللوحة الكبيرة للفكرة المختارة.
// كل لوحة مرسومة من صور بلاطتين حقيقيتين، وتحتها كود كل بلاطة.

const ROWS = 4;
const COLS = 6;

function pick(layout: Idea["layout"], r: number, c: number) {
  if (layout === "frame") return r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 ? 1 : 0;
  if (layout === "checker") return (r + c) % 2;
  if (layout === "path") return c === 2 || c === 3 ? 0 : 1;
  if (layout === "accent") return (r === 1 || r === 2) && (c === 2 || c === 3) ? 1 : 0;
  return 0;
}

const tilesOf = (idea: Idea) => idea.tiles.map((id) => designById(id)).filter(Boolean) as Design[];

function Board({ idea }: { idea: Idea }) {
  const [a, b] = tilesOf(idea);
  if (!a || !b) return null;
  const vars = { "--ta": `url(${a.tiny})`, "--tb": `url(${b.tiny})` } as CSSProperties;
  const label = `تشكيل توضيحي: ${idea.title}، من البلاطتين ${designLabel(a)} و${designLabel(b)}`;
  if (idea.layout === "room") {
    return (
      <div className="ib ib-room" style={vars} role="img" aria-label={label}>
        <div className="ib-wall">
          {Array.from({ length: 20 }, (_, i) => (
            <i key={i} className="t0" />
          ))}
        </div>
        <div className="ib-floor">
          <div className="ib-plane">
            {Array.from({ length: 36 }, (_, i) => (
              <i key={i} className="t1" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) cells.push(<i key={`${r}-${c}`} className={`t${pick(idea.layout, r, c)} r${(r * 5 + c * 3 + r * c) % 4}`} />);
  return (
    <div className="ib ib-grid" style={vars} role="img" aria-label={label}>
      {cells}
    </div>
  );
}

export function Ideas() {
  const { add, has } = useRequest();
  const list = ideas.filter((i) => tilesOf(i).length === 2);
  const [current, setCurrent] = useState(0);
  if (!list.length) return null;
  const idea = list[Math.min(current, list.length - 1)];
  const tiles = tilesOf(idea);
  const items = tiles.map(designRequestItem);
  const added = items.every((it) => has(it.key));

  const openTile = (d: Design) => {
    const all = productSlidesFor(d.productId);
    const p = productById(d.productId);
    openViewer(all, Math.max(0, all.findIndex((x) => x.design.id === d.id)), p ? productTitle(p) : "");
  };

  return (
    <section className="sec sec-ip" id="ideas">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2 className="h2">أفكار لمساحتك</h2>
          <p className="lead">تشكيلات من بلاطتين من أصنافنا للحوش والمدخل والسطح والحمّام والصالة. اختر فكرة، وشوف كود كل بلاطة وصورتها الحقيقية.</p>
        </div>

        <div className="ip" data-reveal>
          <div className="ip-menu" role="group" aria-label="اختر فكرة">
            {list.map((it, i) => (
              <button key={it.id} type="button" className={i === current ? "is-on" : ""} aria-pressed={i === current} onClick={() => setCurrent(i)}>
                <span className="ip-chip" aria-hidden="true">
                  {tilesOf(it).map((d) => (
                    <img key={d.id} src={d.tiny} alt="" loading="lazy" width={40} height={40} />
                  ))}
                </span>
                <span className="ip-name">
                  <strong>{it.title}</strong>
                  <small>{it.place}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="ip-stage" aria-live="polite">
            <div className="ip-board" key={idea.id}>
              <Board idea={idea} />
              <span className="ip-badge">رسم توضيحي من صور حقيقية</span>
            </div>
            <div className="ip-info">
              <div className="ip-text">
                <p className="ip-place">{idea.place}</p>
                <h3>{idea.title}</h3>
                <p>{idea.text}</p>
              </div>
              <ul className="ip-tiles">
                {tiles.map((d, k) => {
                  const p = productById(d.productId);
                  return (
                    <li key={d.id}>
                      <button type="button" className="ip-tile" onClick={() => openTile(d)} aria-label={`افتح الصورة الحقيقية: ${idea.roles[k]}، ${designLabel(d)}، ${d.look}`}>
                        <img src={d.thumb} alt="" loading="lazy" width={120} height={120} />
                        <span>
                          <em>{idea.roles[k]}</em>
                          <strong>{designLabel(d)}</strong>
                          <small>
                            {p ? productTitle(p) : ""}
                            {p ? `، ${originNames[p.origin]}` : ""}
                          </small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className={`btn btn-sm ip-add ${added ? "btn-done" : "btn-primary"}`} onClick={() => items.forEach((it) => add(it))}>
                {added ? <IconCheck /> : <IconPlus />} {added ? "البلاطتان في طلبك" : "أضف البلاطتين لطلبي"}
              </button>
            </div>
          </div>
        </div>
        <p className="muted small ip-note">الرسم مركّب من صور بلاطنا الحقيقية لتقريب الفكرة فقط، والمقاسات فيه تقريبية. العيّنات نفسها تجدها في الفروع.</p>
      </div>
    </section>
  );
}
