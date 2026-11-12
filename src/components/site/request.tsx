import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { branches, company, telHref, waHref } from "../../site-data";
import { IconCheck, IconClose, IconCopy, IconList, IconPhone, IconChat, IconTrash, IconArrow } from "./icons";

// قائمة طلب الزائر: يجمع فيها الأصناف والمساحات، ثم يتصل بالفرع أو ينسخ الطلب.
export type RequestItem = { key: string; title: string; detail?: string; area?: string };

type Ctx = {
  items: RequestItem[];
  open: boolean;
  pulse: number;
  setOpen: (v: boolean) => void;
  add: (item: RequestItem) => void;
  update: (key: string, patch: Partial<RequestItem>) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  toast: (msg: string) => void;
};

const RequestContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "almeithaq-request-v1";

export function useRequest() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error("useRequest must be used inside RequestProvider");
  return ctx;
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [message, setMessage] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const loaded = useRef(false);
  const toastTimer = useRef(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter((i) => i && typeof i.key === "string" && typeof i.title === "string"));
      }
    } catch {
      /* التخزين غير متاح: تعمل القائمة طوال الزيارة فقط */
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* تجاهل */
    }
  }, [items]);

  // الرسالة تبقى ظاهرة أثناء نزول الإشعار، ثم تُمسح حتى تُقرأ الرسالة التالية ولو تكررت.
  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setToastOn(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToastOn(false);
      toastTimer.current = window.setTimeout(() => setMessage(""), 500);
    }, 2600);
  }, []);

  const add = useCallback(
    (item: RequestItem) => {
      setItems((prev) => {
        const i = prev.findIndex((p) => p.key === item.key);
        if (i === -1) return [...prev, item];
        const next = prev.slice();
        next[i] = { ...prev[i], ...item, area: item.area ?? prev[i].area };
        return next;
      });
      setPulse((p) => p + 1);
      toast(`أُضيف إلى طلبك: ${item.title}`);
    },
    [toast],
  );

  const update = useCallback((key: string, patch: Partial<RequestItem>) => {
    setItems((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }, []);
  const remove = useCallback((key: string) => setItems((prev) => prev.filter((p) => p.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((key: string) => items.some((i) => i.key === key), [items]);

  const value = useMemo(
    () => ({ items, open, pulse, setOpen, add, update, remove, clear, has, toast }),
    [items, open, pulse, add, update, remove, clear, has, toast],
  );

  return (
    <RequestContext.Provider value={value}>
      {children}
      <div className={`toast ${toastOn ? "is-on" : ""}`} role="status" aria-live="polite">
        {message ? (
          <>
            <IconCheck />
            <span>{message}</span>
          </>
        ) : null}
      </div>
    </RequestContext.Provider>
  );
}

function requestText(items: RequestItem[], notes: string, branchName: string) {
  const lines = [`طلب عرض سعر - ${company.nameAr} (${branchName})`, ""];
  items.forEach((it, i) => {
    let line = `${i + 1}) ${it.title}`;
    if (it.detail) line += ` - ${it.detail}`;
    if (it.area && it.area.trim()) line += ` - المساحة: ${it.area.trim()} م²`;
    lines.push(line);
  });
  if (notes.trim()) lines.push("", `ملاحظات: ${notes.trim()}`);
  return lines.join("\n");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function RequestDrawer() {
  const { items, open, setOpen, update, remove, clear, toast } = useRequest();
  const [notes, setNotes] = useState("");
  const [branchId, setBranchId] = useState(branches[0].id);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const branch = branches.find((b) => b.id === branchId) ?? branches[0];
  const text = requestText(items, notes, branch.name);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement | null;
      document.documentElement.classList.add("no-scroll");
      window.setTimeout(() => closeRef.current?.focus(), 60);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        document.documentElement.classList.remove("no-scroll");
        lastFocus.current?.focus?.();
      };
    }
  }, [open, setOpen]);

  const onCopy = async () => {
    const ok = await copyText(text);
    toast(ok ? "تم نسخ الطلب، الصقه في رسالة للفرع" : "تعذر النسخ، حدّد النص وانسخه يدوياً");
  };

  return (
    <div className={`dr ${open ? "is-open" : ""}`} inert={!open}>
      <div className="dr-backdrop" onClick={() => setOpen(false)} />
      <aside className="dr-panel" role="dialog" aria-modal="true" aria-labelledby="dr-title">
        <header className="dr-head">
          <h2 id="dr-title">
            <IconList /> طلبي <span className="dr-count">{items.length}</span>
          </h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="إغلاق">
            <IconClose />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="dr-empty">
            <div className="dr-empty-tiles" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <p>لم تضف أي صنف بعد.</p>
            <p className="muted">أضف الأصناف التي تهمك من الكتالوج أو من حاسبة البلاط، ثم أرسل طلبك للفرع.</p>
            <a
              href="#catalog"
              className="btn btn-primary"
              onClick={() => {
                setOpen(false);
              }}
            >
              تصفح الأصناف <IconArrow />
            </a>
          </div>
        ) : (
          <div className="dr-body">
            <ul className="dr-list">
              {items.map((it) => (
                <li key={it.key} className="dr-item">
                  <div className="dr-item-main">
                    <strong>{it.title}</strong>
                    {it.detail ? <span className="muted">{it.detail}</span> : null}
                  </div>
                  <label className="dr-area">
                    <span>المساحة م²</span>
                    <input
                      inputMode="decimal"
                      value={it.area ?? ""}
                      placeholder="مثلاً 25"
                      onChange={(e) => update(it.key, { area: e.target.value })}
                    />
                  </label>
                  <button type="button" className="icon-btn icon-btn-soft" onClick={() => remove(it.key)} aria-label={`حذف ${it.title}`}>
                    <IconTrash />
                  </button>
                </li>
              ))}
            </ul>

            <label className="field">
              <span>ملاحظات (اختياري)</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="اللون المفضل، مكان الاستخدام، موعد التوريد..." />
            </label>

            <fieldset className="dr-branch">
              <legend>أرسل طلبك إلى</legend>
              <div className="seg">
                {branches.map((b) => (
                  <label key={b.id} className={`seg-opt ${b.id === branchId ? "is-on" : ""}`}>
                    <input type="radio" name="dr-branch" value={b.id} checked={b.id === branchId} onChange={() => setBranchId(b.id)} />
                    {b.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="dr-contacts">
              {branch.phones.map((p) => (
                <div key={p.number} className="dr-contact">
                  <div>
                    <strong>{p.name}</strong>
                    <span dir="ltr">{p.number}</span>
                  </div>
                  <div className="dr-contact-actions">
                    {p.whatsapp ? (
                      <a className="btn btn-wa" href={waHref(p.number, text)} target="_blank" rel="noopener noreferrer">
                        <IconChat /> واتساب
                      </a>
                    ) : null}
                    <a className="btn btn-ghost" href={telHref(p.number)}>
                      <IconPhone /> اتصال
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="dr-foot">
              <button type="button" className="btn btn-primary" onClick={onCopy}>
                <IconCopy /> نسخ الطلب
              </button>
              <button
                type="button"
                className="btn btn-text"
                onClick={() => {
                  clear();
                  setNotes("");
                }}
              >
                مسح القائمة
              </button>
            </div>
            <p className="muted small">انسخ الطلب وأرسله في رسالة، أو اتصل مباشرة واذكر الأصناف والمساحات.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
