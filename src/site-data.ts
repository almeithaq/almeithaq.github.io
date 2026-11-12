// بيانات شركة الميثاق. كل ما يحتاج تعديلاً لاحقاً موجود في هذا الملف فقط.

export const company = {
  nameAr: "شركة الميثاق",
  nameEn: "Almeithaq Company",
  tagline: "سيراميك وبورسلين ومواد صحية",
};

export type SocialLink = { platform: string; handle: string; url: string };

export const socials: SocialLink[] = [
  { platform: "فيسبوك", handle: "صفحة شركة الميثاق", url: "https://www.facebook.com/share/197E7R6mc2/" },
  { platform: "تيك توك", handle: "@almothaq_company", url: "https://www.tiktok.com/@almothaq_company" },
  { platform: "تيك توك", handle: "@almesraticeramics_", url: "https://www.tiktok.com/@almesraticeramics_" },
  { platform: "تيك توك", handle: "@abdalraheem.almosraty", url: "https://www.tiktok.com/@abdalraheem.almosraty" },
];

export const facebookUrl = socials[0].url;

// ---------- الأصناف حسب بلد الصناعة ----------
export type OriginId = "libya" | "india" | "turkey";
export type Look = "gloss" | "matte" | "kotto" | "pool" | "marble" | "blue";
export type Product = {
  kind: string; // نوع الصنف
  size: string; // المقاس كما يظهر للزائر
  w: number; // عرض البلاطة المرسومة بالسنتيمتر
  h: number; // ارتفاع البلاطة المرسومة بالسنتيمتر
  look: Look;
  finishes?: string[];
  note?: string;
  decor?: boolean; // يرسم بلاطة ديكور بجانب البلاطة السادة
};
export type Origin = { id: OriginId; title: string; products: Product[] };

export const origins: Origin[] = [
  {
    id: "libya",
    title: "صناعة ليبية",
    products: [
      { kind: "سيراميك", size: "60×60 سم", w: 60, h: 60, look: "matte" },
      { kind: "بورسلين", size: "120×60 سم", w: 120, h: 60, look: "gloss" },
      { kind: "سيراميك حائطي", size: "30×60 سم", w: 30, h: 60, look: "matte", decor: true, note: "مع ديكور 30×60" },
      { kind: "كوطو", size: "60×60 سم", w: 60, h: 60, look: "kotto", note: "سمك 14 ملم" },
      { kind: "كوطو", size: "50×50 سم", w: 50, h: 50, look: "kotto" },
      { kind: "بورسلين", size: "80×80 سم", w: 80, h: 80, look: "gloss" },
      { kind: "سيراميك حائطي", size: "40×80 سم", w: 40, h: 80, look: "matte", decor: true, note: "مع ديكور 40×80" },
    ],
  },
  {
    id: "india",
    title: "صناعة هندية",
    products: [
      { kind: "بورسلين", size: "120×60 سم", w: 120, h: 60, look: "gloss", finishes: ["لمعة", "مطفي", "نص لمعة", "دبل لمعة"] },
      { kind: "بورسلين", size: "80×80 سم", w: 80, h: 80, look: "gloss", finishes: ["لمعة", "مطفي", "نص لمعة"] },
      { kind: "بورسلين", size: "60×60 سم", w: 60, h: 60, look: "gloss" },
      { kind: "سيراميك أحواض سباحة", size: "30×60 سم", w: 30, h: 60, look: "pool" },
      { kind: "بورسلين", size: "1×1 متر", w: 100, h: 100, look: "gloss" },
      { kind: "بورسلين", size: "120×80 سم", w: 120, h: 80, look: "gloss" },
      { kind: "كوطو", size: "50×50 سم", w: 50, h: 50, look: "kotto" },
    ],
  },
  {
    id: "turkey",
    title: "صناعة تركية",
    products: [
      { kind: "بورسلين", size: "120×60 سم", w: 120, h: 60, look: "blue", finishes: ["لمعة"] },
      { kind: "رخام تركي", size: "30×60 سم", w: 30, h: 60, look: "marble" },
    ],
  },
];

// ---------- فصول الرحلة المتحركة ----------
export type Chapter = {
  id: OriginId;
  rail: string;
  title: string;
  text: string;
  chips: string[];
  link: string;
};

export const chapters: Chapter[] = [
  {
    id: "libya",
    rail: "ليبي",
    title: "صناعة ليبية",
    text: "سيراميك وبورسلين وكوطو من المصانع الليبية، للأرضيات والجدران.",
    chips: ["سيراميك 60×60", "بورسلين 120×60", "كوطو سمك 14 ملم"],
    link: "أصناف الصناعة الليبية",
  },
  {
    id: "india",
    rail: "هندي",
    title: "صناعة هندية",
    text: "بورسلين بأربع لمعات: لمعة، مطفي، نص لمعة، ودبل لمعة.",
    chips: ["بورسلين 120×60", "1×1 متر", "أحواض سباحة"],
    link: "أصناف الصناعة الهندية",
  },
  {
    id: "turkey",
    rail: "تركي",
    title: "صناعة تركية",
    text: "بورسلين تركي لمعة ورخام تركي يكملان المشهد.",
    chips: ["بورسلين 120×60", "رخام 30×60"],
    link: "أصناف الصناعة التركية",
  },
];

export const finishes = [
  { id: "matte", name: "مطفي", text: "سطح هادئ بلا انعكاس." },
  { id: "semi", name: "نص لمعة", text: "لمعان خفيف وناعم." },
  { id: "gloss", name: "لمعة", text: "سطح مصقول يعكس الضوء." },
  { id: "double", name: "دبل لمعة", text: "أعلى درجات اللمعان." },
];

// العروض والتخفيضات: أضف العروض هنا لتظهر تلقائياً في الموقع.
// مثال: { title: "بورسلين 60×60", detail: "خصم 15%", until: "حتى نهاية الشهر" }
export type Offer = { title: string; detail: string; until?: string };
export const offers: Offer[] = [];

// الفروع: استبدل الحقول الفارغة بالبيانات الحقيقية (العنوان، الهاتف، ساعات العمل، رابط الخريطة).
// الأرقام تُكتب كما تُطلب محلياً (10 أرقام تبدأ بـ 09).
export type Branch = { name: string; address?: string; phones?: string[]; hours?: string; mapUrl?: string };
// يحول الرقم المحلي إلى صيغة دولية لروابط الاتصال: 0924035518 تصبح +218924035518
export const telHref = (phone: string) => `tel:+218${phone.replace(/\D/g, "").replace(/^0/, "")}`;

export const workHours = "يومياً من 10 صباحاً حتى المغرب";
export const branches: Branch[] = [
  {
    name: "الفرع الرئيسي",
    address: "تاجوراء، سبان، بجانب السوق الشعبي",
    hours: workHours,
    phones: ["0924035518", "0928106906"],
  },
  {
    name: "الفرع الثاني",
    address: "تاجوراء، بئر الأسطى ميلاد، قبل أربع شوارع الكهرباء",
    hours: workHours,
    phones: ["0947999993", "0923898407"],
  },
];

export const gallery = [
  { image: "assets/gal-kitchen.jpg", w: 900, h: 1200, caption: "مطبخ بجدار أزرق لامع", alt: "مطبخ أبيض بجدار من البلاط الأزرق" },
  { image: "assets/cat-porcelain.jpg", w: 1400, h: 1050, caption: "ألواح بورسلين بملمس الرخام", alt: "ألواح بورسلين كبيرة بيضاء وزرقاء في صالة عرض" },
  { image: "assets/gal-shower.jpg", w: 900, h: 1200, caption: "حمام بجدران بيضاء وتجويف أزرق", alt: "دش بجدران بيضاء وتجويف من الموزاييك الأزرق" },
  { image: "assets/cat-ceramic.jpg", w: 1400, h: 1050, caption: "سيراميك أبيض مع لمسة زرقاء", alt: "عينات بلاط سيراميك بالأبيض والرمادي والأزرق" },
  { image: "assets/gal-terrace.jpg", w: 900, h: 1200, caption: "مدخل خارجي ببلاط حجري", alt: "مدخل فيلا ببلاط خارجي رمادي وباب أزرق" },
];
