import { designById, designs, productById, sceneImage, scenes, type Design, type Scene } from "../../../site-data";

// بيانات القسم مأخوذة كلها من بيانات الموقع الحقيقية: الأصناف وصور البلاط وتصاميم المساحات.

const kindOf = (d: Design) => productById(d.productId)?.kind ?? "";
export type CollectionId = "porcelain" | "ceramic" | "outdoor";
export type Collection = { id: CollectionId; en: string; ar: string; descEn: string; descAr: string; sceneId?: string; quoteType: "porcelain" | "ceramic"; tiles: Design[] };

export const collections: Collection[] = [
  {
    id: "porcelain",
    en: "Porcelain",
    ar: "بورسلين",
    descEn: "Premium porcelain surfaces combining durability, elegance and contemporary design.",
    descAr: "أسطح بورسلين تجمع المتانة والأناقة والتصميم العصري.",
    sceneId: "bedroom",
    quoteType: "porcelain",
    tiles: designs.filter((d) => kindOf(d) === "بورسلين"),
  },
  {
    id: "ceramic",
    en: "Ceramic",
    ar: "سيراميك",
    descEn: "Versatile ceramic designs that bring style and character to every space.",
    descAr: "تصاميم سيراميك متنوّعة تعطي كل مساحة طابعها الخاص.",
    sceneId: "bath1",
    quoteType: "ceramic",
    tiles: designs.filter((d) => kindOf(d).startsWith("سيراميك")),
  },
  {
    id: "outdoor",
    en: "Outdoor",
    ar: "كوطو للحوش والساحات",
    descEn: "Stone, terrazzo and travertine looks for yards and outdoor floors.",
    descAr: "نقشات حجر وتيرازو وترافنتينو للحوش والساحات الخارجية.",
    quoteType: "ceramic",
    tiles: designs.filter((d) => kindOf(d) === "كوطو"),
  },
];

export const sceneById = (id?: string) => scenes.find((s) => s.id === id);

// صور مقرّبة لتفاصيل الأسطح، من صور بلاط حقيقية. اللامع والمطفي مذكوران فقط حيث أكدتهما الشركة.
export type Material = { id: string; en: string; ar: string; note: string; ids: string[]; compare?: boolean };
export const materials: Material[] = [
  { id: "veins", en: "Marble Veining", ar: "عروق الرخام", note: "عروق ذهبية وسوداء وبنية على أرضية فاتحة.", ids: ["p120-03", "p120-02", "p120-09"] },
  { id: "onyx", en: "Onyx Glow", ar: "أونكس", note: "طبقات شفافة بدرجات البيج والرمادي.", ids: ["p120-01"] },
  { id: "stone", en: "Natural Stone", ar: "ملمس الحجر", note: "حجر وغرانيت وترافنتينو للأرضيات الخارجية.", ids: ["lk60-26", "lk60-10", "lk60-20"] },
  { id: "terrazzo", en: "Terrazzo", ar: "تيرازو", note: "حجارة كبيرة وحبيبات على أرضية فاتحة.", ids: ["lk60-12"] },
  { id: "finish", en: "Gloss & Matte", ar: "لامع ومطفي", note: "نفس الترافنتينو 284 بلمعتين: لامع ومطفي.", ids: ["ly120-02", "ly120-03"], compare: true },
];
export const macro = (id: string) => ({ webp: `macro/${id}.webp`, jpg: `macro/${id}.jpg`, small: `macro/${id}-s.webp` });

// معرض الإلهام: تصاميم المساحات الموجودة في الموقع، مقسّمة حسب نوع المكان.
export type RoomKind = "all" | "living" | "bedroom" | "kitchen" | "bath";
export const roomNames: Record<RoomKind, string> = { all: "كل المساحات", living: "صالات ومجالس", bedroom: "غرف النوم", kitchen: "مطابخ", bath: "حمّامات" };
export const roomEn: Record<Exclude<RoomKind, "all">, string> = { living: "Living Rooms", bedroom: "Bedrooms", kitchen: "Kitchens", bath: "Bathrooms" };
const roomOf: Record<string, Exclude<RoomKind, "all">> = { living: "living", majlis: "living", bedroom: "bedroom", kitchen: "kitchen", bath1: "bath", bath2: "bath", bath3: "bath" };
export type GalleryItem = { scene: Scene; room: Exclude<RoomKind, "all">; design?: Design; img: ReturnType<typeof sceneImage> & { webp: string; mediumWebp: string } };
export const gallery: GalleryItem[] = ["living", "bath1", "majlis", "kitchen", "bath2", "bedroom", "bath3"]
  .map((id) => scenes.find((s) => s.id === id))
  .filter((s): s is Scene => !!s)
  .map((scene) => ({
    scene,
    room: roomOf[scene.id] ?? "living",
    design: designById(scene.designId),
    img: { ...sceneImage(scene), webp: `looks/${scene.id}.webp`, mediumWebp: `looks/${scene.id}-m.webp` },
  }));
