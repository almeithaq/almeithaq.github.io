// بيانات شركة الميثاق. كل ما يحتاج تعديلاً لاحقاً موجود في هذا الملف فقط.

export const company = {
  nameAr: "شركة الميثاق",
  nameEn: "Almeithaq Company",
  tagline: "سيراميك وبورسلين ومواد صحية",
  city: "تاجوراء",
};

export type SocialLink = { platform: string; handle: string; url: string };

export const socials: SocialLink[] = [
  { platform: "فيسبوك", handle: "صفحة شركة الميثاق", url: "https://www.facebook.com/share/197E7R6mc2/" },
  { platform: "تيك توك", handle: "@almothaq_company", url: "https://www.tiktok.com/@almothaq_company" },
  { platform: "تيك توك", handle: "@almesraticeramics_", url: "https://www.tiktok.com/@almesraticeramics_" },
  { platform: "تيك توك", handle: "@abdalraheem.almosraty", url: "https://www.tiktok.com/@abdalraheem.almosraty" },
];

export const facebookUrl = socials[0].url;

// ---------- الأصناف ----------
export type OriginId = "libya" | "india" | "turkey";
export const originNames: Record<OriginId, string> = {
  libya: "صناعة ليبية",
  india: "صناعة هندية",
  turkey: "صناعة تركية",
};

export type Kind = "سيراميك" | "بورسلين" | "كوطو" | "سيراميك حائطي" | "سيراميك أحواض سباحة" | "رخام";
export const kinds: Kind[] = ["بورسلين", "سيراميك", "كوطو", "سيراميك حائطي", "رخام", "سيراميك أحواض سباحة"];

export type Finish = "مطفي" | "نص لمعة" | "لمعة" | "دبل لمعة";
export const finishOrder: Finish[] = ["مطفي", "نص لمعة", "لمعة", "دبل لمعة"];

// شكل البلاطة في البطاقة (توضيحي فقط، والألوان والنقشات حسب المتوفر في الفرع)
export type Look = "ivory" | "marble" | "kotto" | "pool" | "stone";

export type Product = {
  id: string;
  kind: Kind;
  origin: OriginId;
  size: string; // كما يظهر للزائر
  w: number; // العرض بالسنتيمتر
  h: number; // الطول بالسنتيمتر
  look: Look;
  finishes?: Finish[];
  note?: string;
  decor?: boolean; // يُرسم معه بلاط ديكور
  use?: Use; // أين يُركَّب، كما أوضحت الشركة
  outdoor?: boolean; // يصلح للساحات الخارجية (أرضيات فقط)، كما أوضحت الشركة
};

// مكان التركيب كما أوضحت الشركة. الأصناف بدون قيمة تُركّب للأرضيات،
// وحاسبة البلاط تبني منها مقاسات الأرضية ومقاسات الحيطان.
export type Use = "floor" | "wall" | "both";
export const useNames: Record<Use, string> = { floor: "يُركّب للأرضيات", wall: "يُركّب للحيطان", both: "يُركّب للأرضيات والحيطان" };
export const outdoorLabel = "يُركّب للأرضيات والساحات الخارجية";

export const products: Product[] = [
  { id: "ly-ceramic-60", kind: "سيراميك", origin: "libya", size: "60×60 سم", w: 60, h: 60, look: "ivory", use: "floor", outdoor: true },
  { id: "ly-porcelain-120x60", kind: "بورسلين", origin: "libya", size: "120×60 سم", w: 120, h: 60, look: "marble", use: "both" },
  { id: "ly-wall-30x60", kind: "سيراميك حائطي", origin: "libya", size: "30×60 سم", w: 30, h: 60, look: "ivory", decor: true, note: "مع ديكور 30×60", use: "wall" },
  { id: "ly-kotto-60", kind: "كوطو", origin: "libya", size: "60×60 سم", w: 60, h: 60, look: "kotto", note: "سمك 14 ملم", use: "floor", outdoor: true },
  { id: "ly-kotto-50", kind: "كوطو", origin: "libya", size: "50×50 سم", w: 50, h: 50, look: "kotto", use: "floor", outdoor: true },
  { id: "ly-porcelain-80", kind: "بورسلين", origin: "libya", size: "80×80 سم", w: 80, h: 80, look: "marble" },
  { id: "ly-wall-40x80", kind: "سيراميك حائطي", origin: "libya", size: "40×80 سم", w: 40, h: 80, look: "ivory", decor: true, note: "مع ديكور 40×80", use: "both" },
  {
    id: "in-porcelain-120x60",
    kind: "بورسلين",
    origin: "india",
    size: "120×60 سم",
    w: 120,
    h: 60,
    look: "marble",
    finishes: ["لمعة", "مطفي", "نص لمعة", "دبل لمعة"],
    use: "both",
  },
  { id: "in-porcelain-80", kind: "بورسلين", origin: "india", size: "80×80 سم", w: 80, h: 80, look: "marble", finishes: ["لمعة", "مطفي", "نص لمعة"] },
  { id: "in-porcelain-60", kind: "بورسلين", origin: "india", size: "60×60 سم", w: 60, h: 60, look: "stone", use: "floor", outdoor: true },
  { id: "in-pool-30x60", kind: "سيراميك أحواض سباحة", origin: "india", size: "30×60 سم", w: 30, h: 60, look: "pool", use: "both" },
  { id: "in-porcelain-100", kind: "بورسلين", origin: "india", size: "1×1 متر", w: 100, h: 100, look: "marble" },
  { id: "in-porcelain-120x80", kind: "بورسلين", origin: "india", size: "120×80 سم", w: 120, h: 80, look: "stone" },
  { id: "in-kotto-50", kind: "كوطو", origin: "india", size: "50×50 سم", w: 50, h: 50, look: "kotto", use: "floor", outdoor: true },
  { id: "tr-porcelain-120x60", kind: "بورسلين", origin: "turkey", size: "120×60 سم", w: 120, h: 60, look: "marble", finishes: ["لمعة"], use: "both" },
  { id: "tr-marble-30x60", kind: "رخام", origin: "turkey", size: "30×60 سم", w: 30, h: 60, look: "marble", use: "floor" },
];

export const productTitle = (p: Product) => `${p.kind} ${p.size}`;

// ---------- غرفة العرض التفاعلية (صور توضيحية لنفس الصالة) ----------
export type FloorLook = { id: string; name: string; detail: string; image: string; swatch: string; kind: Kind };
export const floorLooks: FloorLook[] = [
  { id: "ivory", name: "سيراميك مطفي فاتح", detail: "بلاط مربع بلون عاجي هادئ", image: "assets/floor-ivory", swatch: "assets/sw-ivory.jpg", kind: "سيراميك" },
  { id: "marble", name: "بورسلين رخامي لامع", detail: "سطح مصقول بعروق رمادية ناعمة", image: "assets/floor-marble", swatch: "assets/sw-marble.jpg", kind: "بورسلين" },
  { id: "grey", name: "بورسلين رمادي مطفي", detail: "مقاسات كبيرة بملمس عصري", image: "assets/floor-grey", swatch: "assets/sw-grey.jpg", kind: "بورسلين" },
  { id: "blue", name: "بورسلين أزرق لامع", detail: "لمسة جريئة بعروق بيضاء", image: "assets/floor-blue", swatch: "assets/sw-blue.jpg", kind: "بورسلين" },
];
export const floorCement = "assets/floor-cement";

export const finishInfo: Record<Finish, string> = {
  مطفي: "سطح هادئ بلا انعكاس، مريح للعين ومناسب للحركة الكثيفة.",
  "نص لمعة": "لمعان خفيف وناعم يجمع بين الأناقة والعملية.",
  لمعة: "سطح مصقول يعكس الضوء ويوسّع المكان بصرياً.",
  "دبل لمعة": "أعلى درجات اللمعان، انعكاس يشبه المرآة.",
};

// ---------- العروض والتخفيضات ----------
// أضف العروض هنا لتظهر تلقائياً في الموقع.
// مثال: { title: "بورسلين 60×60", detail: "خصم 15%", until: "حتى نهاية الشهر" }
export type Offer = { title: string; detail: string; until?: string };
export const offers: Offer[] = [];

// ---------- الفروع وأرقام التواصل ----------
// whatsapp: true فقط للأرقام التي أكدت الشركة أن عليها واتساب.
export type Phone = { name: string; number: string; whatsapp?: boolean };
export type Branch = { id: string; name: string; address: string; phones: Phone[]; mapUrl?: string };

// أوقات العمل كما أرسلتها الشركة: كل الأيام ما عدا الجمعة، من 10 صباحاً حتى المغرب.
export const workHours = {
  days: "من السبت إلى الخميس",
  time: "من 10 صباحاً حتى المغرب",
  closed: "الجمعة عطلة",
  opensAt: 10 * 60, // بالدقائق من منتصف الليل بتوقيت ليبيا
  opensText: "10 صباحاً",
  closedDay: 5, // الجمعة (الأحد = 0)
};

export const branches: Branch[] = [
  {
    id: "main",
    name: "الفرع الرئيسي",
    address: "تاجوراء، سبان، بجانب السوق الشعبي",
    mapUrl: "https://maps.app.goo.gl/yHfoANptu8CkHU89A",
    phones: [
      { name: "سلمان", number: "0924035518", whatsapp: true },
      { name: "أحمد", number: "0912910643", whatsapp: true },
      { name: "عبدالعزيز", number: "0928106906", whatsapp: true },
    ],
  },
  {
    id: "second",
    name: "الفرع الثاني",
    address: "تاجوراء، بئر الأسطى ميلاد، قبل أربع شوارع الكهرباء",
    mapUrl: "https://maps.app.goo.gl/Wb6JiLGWRNP66GyT6",
    phones: [
      { name: "عبدالله", number: "0923898407", whatsapp: true },
      { name: "عبدالرحيم", number: "0947999993", whatsapp: true },
    ],
  },
];

// يحول الرقم المحلي إلى صيغة دولية: 0924035518 تصبح 218924035518
export const intlNumber = (phone: string) => `218${phone.replace(/\D/g, "").replace(/^0/, "")}`;
export const telHref = (phone: string) => `tel:+${intlNumber(phone)}`;
export const waHref = (phone: string, text: string) => `https://wa.me/${intlNumber(phone)}?text=${encodeURIComponent(text)}`;
// رسالة نصية بنص جاهز (الصيغة ?&body= تعمل على آيفون وأندرويد).
export const smsHref = (phone: string, text: string) => `sms:+${intlNumber(phone)}?&body=${encodeURIComponent(text)}`;

// إحداثيات تاجوراء التقريبية لحساب وقت المغرب اليومي (توقيت ليبيا UTC+2)
export const tajouraCoords = { lat: 32.882, lng: 13.35, utcOffset: 2 };

export const gallery = [
  { image: "assets/gal-kitchen.jpg", w: 900, h: 1200, caption: "مطبخ بجدار أزرق لامع", alt: "مطبخ أبيض بجدار من البلاط الأزرق" },
  { image: "assets/cat-porcelain.jpg", w: 1400, h: 1050, caption: "ألواح بورسلين بملمس الرخام", alt: "ألواح بورسلين كبيرة بيضاء وزرقاء في صالة عرض" },
  { image: "assets/gal-shower.jpg", w: 900, h: 1200, caption: "حمام بجدران بيضاء وتجويف أزرق", alt: "دش بجدران بيضاء وتجويف من الموزاييك الأزرق" },
  { image: "assets/cat-ceramic.jpg", w: 1400, h: 1050, caption: "سيراميك أبيض مع لمسة زرقاء", alt: "عينات بلاط سيراميك بالأبيض والرمادي والأزرق" },
  { image: "assets/gal-terrace.jpg", w: 900, h: 1200, caption: "مدخل خارجي ببلاط حجري", alt: "مدخل فيلا ببلاط خارجي رمادي وباب أزرق" },
  { image: "assets/cat-sanitary.jpg", w: 1400, h: 1050, caption: "حمام بطقم صحي أبيض", alt: "حمام حديث بطقم صحي أبيض وجدار أزرق" },
];

export const marqueeItems = [
  "سيراميك 60×60",
  "بورسلين 120×60",
  "كوطو سمك 14 ملم",
  "بورسلين 1×1 متر",
  "سيراميك حائطي مع ديكور",
  "رخام تركي 30×60",
  "سيراميك أحواض سباحة",
  "بورسلين 120×80",
  "مواد صحية",
];
