import { useEffect, useRef } from "react";
import type { GalleryItem } from "../../site-data";
import { IconChevron, IconClose } from "./icons";

// عارض الصور المكبّرة: يُستخدم في معرض الأفكار وفي خلية السداسي.
export function Lightbox({ items, index, onClose, onNav }: { items: GalleryItem[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const g = items[index];
  const n = items.length;
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
