import { designLabel, productById, productTitle, setById, type Design } from "../../../site-data";
import { designRequestItem, openViewer, type Slide } from "../designs";
import { prefersReducedMotion } from "../fx";
import { IconCheck, IconPlus } from "../icons";
import type { GalleryItem } from "./data";

// ما يختلف بين الموقعين: عارض الصور، والتنقّل، ومكان قائمة المنتجات.
export { IconCheck, IconPlus, designRequestItem };
export const PRODUCTS_ANCHOR = "catalog";

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export const IconZoom = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4M11 8v6M8 11h6" />
  </svg>
);

const tileSlide = (d: Design): Slide => {
  const p = productById(d.productId);
  return { image: d.image, thumb: d.tiny, alt: `صورة حقيقية: ${p ? productTitle(p) : ""}، ${designLabel(d)}، ${d.look}`, title: designLabel(d), note: d.look, design: d, shape: setById(d.setId)?.shape };
};

// العارض موجود في الصفحة أصلاً (Viewer)، فالقسم يرسل له الصور فقط.
export function useViewer() {
  const openTiles = (list: Design[], index = 0) => openViewer(list.map(tileSlide), index, "صور حقيقية من المعرض");
  const openScenes = (list: GalleryItem[], index: number) => {
    const withTile = list.filter((g) => g.design);
    const slides: Slide[] = withTile.map((g) => ({
      image: g.img.large,
      thumb: g.img.thumb,
      alt: `${g.scene.title}: تصميم توضيحي من صورة بلاطة حقيقية`,
      title: g.scene.title,
      note: `تصميم توضيحي، البلاط على ${g.scene.surface}`,
      design: g.design as Design,
      inset: true,
    }));
    openViewer(slides, Math.max(0, withTile.indexOf(list[index])), "Find Your Inspiration");
  };
  return { openTiles, openScenes, node: null };
}
