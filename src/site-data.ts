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
export type OriginId = "libya" | "india" | "turkey" | "egypt" | "tunisia";
export const originNames: Record<OriginId, string> = {
  libya: "صناعة ليبية",
  india: "صناعة هندية",
  turkey: "صناعة تركية",
  egypt: "صناعة مصرية",
  tunisia: "صناعة تونسية",
};

export type Kind = "سيراميك" | "بورسلين" | "كوطو" | "سيراميك حائطي" | "سيراميك أحواض سباحة" | "رخام";
export const kinds: Kind[] = ["بورسلين", "سيراميك", "كوطو", "سيراميك حائطي", "رخام", "سيراميك أحواض سباحة"];

export type Finish = "مطفي" | "نص لمعة" | "لمعة" | "دبل لمعة";
export const finishOrder: Finish[] = ["مطفي", "نص لمعة", "لمعة", "دبل لمعة"];

// شكل البلاطة في البطاقة (توضيحي فقط، والألوان والنقشات حسب المتوفر في الفرع)
export type Look = "ivory" | "marble" | "kotto" | "pool" | "stone" | "wood" | "hex";

export type Product = {
  id: string;
  kind: Kind;
  variant?: string; // وصف يظهر بعد النوع، مثل «باركي»
  origin: OriginId;
  shape?: "hex"; // بلاط سداسي: يُرسم في البطاقة كخلية نحل
  size?: string; // كما يظهر للزائر (يُترك فارغاً إلى أن ترسل الشركة المقاس)
  w?: number; // العرض بالسنتيمتر
  h?: number; // الطول بالسنتيمتر
  look: Look;
  finishes?: Finish[];
  note?: string;
  decor?: boolean; // يُرسم معه بلاط ديكور
  use?: Use; // أين يُركَّب، كما أوضحت الشركة
  outdoor?: boolean; // يصلح للساحات الخارجية (أرضيات فقط)، كما أوضحت الشركة
  keywords?: string; // كلمات إضافية يجدها البحث
};

// الأصناف المستطيلة المعروف مقاسها: هي التي تدخل حاسبة البلاط.
export type RectProduct = Product & { size: string; w: number; h: number };
export const isRect = (p: Product): p is RectProduct => p.shape !== "hex" && !!p.size && typeof p.w === "number" && typeof p.h === "number";

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
  { id: "ly-kotto-45", kind: "كوطو", origin: "libya", size: "45×45 سم", w: 45, h: 45, look: "kotto", use: "floor", outdoor: true },
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
  { id: "in-ceramic-60", kind: "سيراميك", origin: "india", size: "60×60 سم", w: 60, h: 60, look: "ivory", use: "floor", outdoor: true },
  { id: "in-pool-30x60", kind: "سيراميك أحواض سباحة", origin: "india", size: "30×60 سم", w: 30, h: 60, look: "pool", use: "both" },
  { id: "in-porcelain-100", kind: "بورسلين", origin: "india", size: "1×1 متر", w: 100, h: 100, look: "marble" },
  { id: "in-porcelain-120x80", kind: "بورسلين", origin: "india", size: "120×80 سم", w: 120, h: 80, look: "stone" },
  { id: "in-kotto-50", kind: "كوطو", origin: "india", size: "50×50 سم", w: 50, h: 50, look: "kotto", use: "floor", outdoor: true },
  { id: "in-kotto-45", kind: "كوطو", origin: "india", size: "45×45 سم", w: 45, h: 45, look: "kotto", use: "floor", outdoor: true },
  { id: "in-parquet-20x120", kind: "بورسلين", variant: "باركي", origin: "india", size: "20×120 سم", w: 20, h: 120, look: "wood", use: "both" },
  { id: "tr-porcelain-120x60", kind: "بورسلين", origin: "turkey", size: "120×60 سم", w: 120, h: 60, look: "marble", finishes: ["لمعة"], use: "both" },
  { id: "tr-marble-30x60", kind: "رخام", origin: "turkey", size: "30×60 سم", w: 30, h: 60, look: "marble", use: "floor" },
  { id: "eg-parquet-20x120", kind: "بورسلين", variant: "باركي", origin: "egypt", size: "20×120 سم", w: 20, h: 120, look: "wood", use: "both" },
  { id: "eg-ceramic-70", kind: "سيراميك", origin: "egypt", size: "70×70 سم", w: 70, h: 70, look: "ivory", use: "floor" },
  { id: "eg-porcelain-80", kind: "بورسلين", origin: "egypt", size: "80×80 سم", w: 80, h: 80, look: "marble", use: "floor" },
  // السداسي التونسي: للحيطان والأرضيات. المقاس لم يُرسل بعد، فلا يدخل الحاسبة حتى يُضاف.
  {
    id: "tn-hex",
    kind: "سيراميك",
    variant: "سداسي",
    origin: "tunisia",
    shape: "hex",
    look: "hex",
    use: "both",
    note: "ألوان سادة ومنقوشة",
    keywords: "سداسية سداسيات هكساجون خلية نحل تونسي تونس",
  },
];

export const rectProducts = products.filter(isRect);
export const hexProduct = products.find((p) => p.shape === "hex");
export const productById = (id: string) => products.find((p) => p.id === id);

export const productTitle = (p: Product) => `${p.kind}${p.variant ? ` ${p.variant}` : ""}${p.size ? ` ${p.size}` : ""}`;

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

export type GalleryItem = { image: string; thumb?: string; w: number; h: number; caption: string; alt: string };

export const gallery: GalleryItem[] = [
  { image: "assets/gal-kitchen.jpg", w: 900, h: 1200, caption: "مطبخ بجدار أزرق لامع", alt: "مطبخ أبيض بجدار من البلاط الأزرق" },
  { image: "assets/cat-porcelain.jpg", w: 1400, h: 1050, caption: "ألواح بورسلين بملمس الرخام", alt: "ألواح بورسلين كبيرة بيضاء وزرقاء في صالة عرض" },
  { image: "assets/gal-shower.jpg", w: 900, h: 1200, caption: "حمام بجدران بيضاء وتجويف أزرق", alt: "دش بجدران بيضاء وتجويف من الموزاييك الأزرق" },
  { image: "assets/cat-ceramic.jpg", w: 1400, h: 1050, caption: "سيراميك أبيض مع لمسة زرقاء", alt: "عينات بلاط سيراميك بالأبيض والرمادي والأزرق" },
  { image: "assets/gal-terrace.jpg", w: 900, h: 1200, caption: "مدخل خارجي ببلاط حجري", alt: "مدخل فيلا ببلاط خارجي رمادي وباب أزرق" },
  { image: "assets/cat-sanitary.jpg", w: 1400, h: 1050, caption: "حمام بطقم صحي أبيض", alt: "حمام حديث بطقم صحي أبيض وجدار أزرق" },
];

// أفكار السداسي التونسي: صور الشركة نفسها (بعد قص الشعار وأشرطة الأرقام). thumb هي النسخة المصغّرة داخل الخلية السداسية.
export const hexGallery: GalleryItem[] = [
  { image: "assets/hex-01.jpg", thumb: "assets/hex-01-t.jpg", w: 1600, h: 1329, caption: "جدار سداسي منقوش بالأبيض والأسود", alt: "حمام بجدار من السداسي المنقوش بالأبيض والأسود ومغسلة سوداء" },
  { image: "assets/hex-02.jpg", thumb: "assets/hex-02-t.jpg", w: 1024, h: 1536, caption: "سداسي أبيض للحائط والأرضية", alt: "حمام صغير بسداسي أبيض على الحائط والأرضية ومغسلة معلقة" },
  { image: "assets/hex-03.jpg", thumb: "assets/hex-03-t.jpg", w: 1024, h: 1536, caption: "أرضية مقهى بالأبيض والأسود", alt: "مقهى بأرضية سداسية بالأبيض والأسود وطاولات خشبية" },
  { image: "assets/hex-04.jpg", thumb: "assets/hex-04-t.jpg", w: 778, h: 650, caption: "أبيض هادئ مع جدار منقوش", alt: "حمام بسداسي أبيض وجدار جانبي من السداسي المنقوش" },
  { image: "assets/hex-05.jpg", thumb: "assets/hex-05-t.jpg", w: 1024, h: 1536, caption: "ساحة مسبح بدرجتين من البيج", alt: "ساحة حول مسبح بسداسي بدرجتين من البيج أمام بيت أبيض" },
  { image: "assets/hex-06.jpg", thumb: "assets/hex-06-t.jpg", w: 800, h: 647, caption: "المنقوش ينعكس في المرآة", alt: "حمام بجدار رمادي ومرآة مضيئة تعكس السداسي المنقوش" },
  { image: "assets/hex-07.jpg", thumb: "assets/hex-07-t.jpg", w: 1024, h: 1536, caption: "حمام بلونين دافئين", alt: "حمام بسداسي بيج وبني فاتح على الحائط والأرضية ومغسلة بيضاء" },
  { image: "assets/hex-08.jpg", thumb: "assets/hex-08-t.jpg", w: 580, h: 572, caption: "منقوش بجانب سادة فاتح", alt: "جدار من السداسي المنقوش بجانب جدار سداسي فاتح بتجويف مضيء" },
  { image: "assets/hex-09.jpg", thumb: "assets/hex-09-t.jpg", w: 1024, h: 820, caption: "ركن مقهى بأرضية داكنة وبيضاء", alt: "ركن مقهى بطاولات خشبية وأرضية سداسية داكنة وبيضاء" },
  { image: "assets/hex-10.jpg", thumb: "assets/hex-10-t.jpg", w: 1152, h: 652, caption: "حمام كامل بالسداسي الفاتح", alt: "حمام بجدران من السداسي الفاتح ومرآة مضيئة ومغسلة سوداء" },
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
  "بورسلين باركي 20×120",
  "سيراميك سداسي تونسي",
  "مواد صحية",
];

// ---------- التصاميم الحقيقية ----------
// صور حقيقية أرسلها المالك (الأصناف نفسها متوفرة عند الميثاق كما أكد المالك). عُدّلت زاويتها فقط لتظهر البلاطة مستقيمة، ولم تُغيَّر ألوانها.
// وصف اللون مأخوذ من الصورة نفسها ليساعد على التمييز بين التصاميم.
export type SetShape = "slab" | "square" | "wall";
export type DesignSet = {
  id: string;
  productId: string;
  label: string; // اسم التبويب
  shape: SetShape; // نسبة الصورة: لوح 60×120، مربع، أو حائطي مع ديكوره
  note?: string;
  looks: string[]; // وصف كل تصميم بترتيب صوره
  codes?: (string | undefined)[]; // كود التصميم كما أكده المالك، بنفس ترتيب الصور
  isNew?: boolean; // صنف وصل حديثاً: يُعلَّم «جديد»
  prefix?: string; // اسم يُكتب بدل «تصميم» حتى لا يتكرر «تصميم 1» في الصنف نفسه
};
export const designSets: DesignSet[] = [
  {
    id: "p120",
    productId: "in-porcelain-120x60",
    label: "بورسلين هندي 120×60",
    shape: "slab",
    looks: [
      "كريمي بعروق ذهبية",
      "أبيض بعروق سوداء رفيعة",
      "رمادي فاتح بعروق داكنة",
      "رمادي رخامي منقّط",
      "بيج فاتح",
      "رمادي متوسط",
      "رمادي فاتح بعروق رفيعة",
      "أبيض بعروق رمادية",
      "رمادي فاتح ناعم",
      "بني داكن بعروق فاتحة",
      "رمادي داكن بعروق",
      "بني فاتح",
    ],
  },
  {
    id: "ly120",
    productId: "ly-porcelain-120x60",
    label: "ترافنتينو ليبي 120×60",
    shape: "slab",
    isNew: true,
    prefix: "ترافنتينو",
    note: "الترافنتينو يُركّب في الحمامات والمطابخ وحيطان الديكور.",
    looks: ["ترافنتينو رمادي", "ترافنتينو بيج لامع", "ترافنتينو بيج مطفي"],
    codes: ["273", "284 لامع", "284 مطفي"],
  },
  {
    id: "in120t",
    productId: "in-porcelain-120x60",
    label: "ترافنتينو هندي 120×60",
    shape: "slab",
    isNew: true,
    prefix: "ترافنتينو",
    note: "الترافنتينو يُركّب في الحمامات والمطابخ وحيطان الديكور.",
    looks: ["ترافنتينو بيج فاتح", "ترافنتينو بيج وردي مطفي", "ترافنتينو رمادي داكن مطفي"],
    codes: ["8111", "8080", "8113"],
  },
  {
    id: "ly120m",
    productId: "ly-porcelain-120x60",
    label: "بورسلين ليبي 120×60",
    shape: "slab",
    looks: ["أبيض بعروق رمادية عريضة", "أبيض بعروق رمادية ناعمة", "أبيض بعروق رمادية متشعّبة"],
    codes: ["206", "289", "230"],
  },
  {
    id: "ly120tz",
    productId: "ly-porcelain-120x60",
    label: "تيرازو ليبي 120×60",
    shape: "slab",
    prefix: "تيرازو",
    looks: ["تيرازو رمادي فاتح بحبيبات سوداء وبنية وبيضاء"],
    codes: ["288"],
  },
  {
    id: "p80",
    productId: "in-porcelain-80",
    label: "بورسلين هندي 80×80",
    shape: "square",
    looks: ["رمادي بعروق بيضاء", "رمادي فاتح حجري", "رمادي حجري بعروق", "بيج إسمنتي", "بيج رمادي فاتح", "رمادي فاتح سادة"],
  },
  {
    id: "c60",
    productId: "ly-ceramic-60",
    label: "سيراميك ليبي 60×60",
    shape: "square",
    looks: ["رمادي فاتح بعروق ناعمة", "رمادي فاتح بتموّجات", "بيج كريمي", "بيج بعروق", "رمادي حجري", "أبيض بعروق بيج"],
  },
  {
    id: "lk60",
    productId: "ly-kotto-60",
    label: "كوطو ليبي 60×60",
    shape: "square",
    note: "سمك 14 ملم، للأرضيات والساحات الخارجية.",
    looks: ["بيج بنقشة ترافنتينو", "رمادي حجري بعروق مائلة", "رمادي فاتح حجري", "رمادي بحصى صغير", "رمادي بحجارة كبيرة", "بيج تيرازو بحبيبات بنية", "بيج رمادي حجري بعروق بنية", "رمادي فاتح منقّط", "رمادي غرانيتي بخطوط حجرية مائلة", "رمادي إسمنتي ببقع فاتحة", "رمادي إسمنتي داكن", "تيرازو رمادي بحجارة رمادية وسوداء", "رمادي رخامي بعروق بيضاء", "رمادي فاتح بنقشة رملية مائلة", "رمادي حجري بخطوط داكنة رفيعة", "رمادي داكن غرانيتي ببقع فاتحة", "رمادي رخامي بعروق متموجة", "بني حجري معتّق", "رمادي فاتح بعروق داكنة متموجة", "بيج ترافنتينو بعروق بنية", "بيج فاتح سادة", "رمادي غرانيتي منقّط بتموّجات خفيفة", "بيج رمادي حجري هادئ", "رمادي فاتح منقّط بحبيبات ناعمة", "ترافنتينو رمادي بعروق زيتونية", "رمادي داكن حجري بعروق بيضاء"],
    codes: ["059", "010", "012", "009", "002", "063", "053", "017", "038", "024", "016", "062", "044", "008", "020", "028", "004", "011", "021", "050", "023", "074", "041", "003", "049", "007"],
  },
  {
    id: "w30",
    productId: "ly-wall-30x60",
    label: "حائطي ليبي 30×60",
    shape: "wall",
    note: "كل صورة تعرض البلاطة السادة ومعها الديكور المطابق لها.",
    looks: ["أبيض رخامي بعروق سوداء مع ديكور هندسي بارز", "رمادي مع ديكور مربعات بارزة", "تيرازو رمادي مع ديكور مثلثات", "رمادي فاتح مع ديكور خطوط بارزة"],
  },
];

export type Design = {
  id: string;
  setId: string;
  productId: string;
  n: number; // رقم التصميم داخل مجموعته
  look: string;
  code?: string;
  image: string; // الصورة الكبيرة
  thumb: string; // صورة البطاقة
  tiny: string; // صورة صغيرة لجدار الواجهة والقوائم
};
export const designs: Design[] = designSets.flatMap((s) =>
  s.looks.map((look, i) => {
    const id = `${s.id}-${String(i + 1).padStart(2, "0")}`;
    return { id, setId: s.id, productId: s.productId, n: i + 1, look, code: s.codes?.[i], image: `designs/${id}.jpg`, thumb: `designs/${id}-t.jpg`, tiny: `designs/${id}-w.jpg` };
  }),
);
export const designById = (id: string) => designs.find((d) => d.id === id);
export const setById = (id: string) => designSets.find((s) => s.id === id);
export const setForProduct = (productId: string) => designSets.find((s) => s.productId === productId);
export const designsOf = (setId: string) => designs.filter((d) => d.setId === setId);
// كل تصاميم الصنف من كل مجموعاته، والجديد أولاً.
export const designsForProduct = (productId: string) => {
  const list = designs.filter((d) => d.productId === productId);
  const isNew = (id: string) => (designSets.find((s) => s.id === id)?.isNew ? 0 : 1);
  return list.slice().sort((a, b) => isNew(a.setId) - isNew(b.setId));
};
export const designLabel = (d: Design) => {
  if (d.code) return d.code;
  const set = designSets.find((s) => s.id === d.setId);
  if (set?.prefix) return set.looks.length === 1 ? set.prefix : `${set.prefix} ${d.n}`;
  return `تصميم ${d.n}`;
};

// ---------- تصاميم البيوت والحمامات ----------
// صور توضيحية صُمّمت بالحاسوب: كل صورة تُظهر أحد تصاميمنا الحقيقية بعد التركيب.
export type SceneKind = "floor" | "bath";
export const sceneKinds: Record<SceneKind, string> = { floor: "أرضيات البيت", bath: "الحمامات" };
export type Scene = { id: string; kind: SceneKind; title: string; designId: string; surface: string };
export const scenes: Scene[] = [
  { id: "living", kind: "floor", title: "صالة الجلوس", designId: "p120-01", surface: "الأرضية" },
  { id: "bath1", kind: "bath", title: "حمّام بالأبيض الرخامي", designId: "w30-01", surface: "الحيطان" },
  { id: "majlis", kind: "floor", title: "المجلس", designId: "p120-02", surface: "الأرضية" },
  { id: "bedroom", kind: "floor", title: "غرفة النوم", designId: "p80-01", surface: "الأرضية" },
  { id: "bath2", kind: "bath", title: "حمّام بالتيرازو", designId: "w30-03", surface: "الحيطان" },
  { id: "kitchen", kind: "floor", title: "المطبخ", designId: "c60-03", surface: "الأرضية" },
  { id: "bath3", kind: "bath", title: "حمّام بالرمادي الفاتح", designId: "w30-04", surface: "الحيطان" },
];
export const sceneImage = (s: Scene) => ({ large: `looks/${s.id}.jpg`, medium: `looks/${s.id}-m.jpg`, thumb: `looks/${s.id}-t.jpg` });

// أفكار لمساحتك: تشكيلات تُرسم من صور بلاطنا الحقيقية، وكل فكرة تذكر أكواد البلاط المستخدم.
export type IdeaLayout = "frame" | "checker" | "path" | "accent" | "room";
export type Idea = { id: string; title: string; place: string; text: string; layout: IdeaLayout; tiles: [string, string]; roles: [string, string] };
const byCode = (setId: string, code: string) => designs.find((d) => d.setId === setId && d.code === code)?.id ?? "";
export const ideas: Idea[] = [
  {
    id: "yard-frame",
    title: "حوش بإطار بني",
    place: "الحوش والساحات",
    layout: "frame",
    text: "وسط الحوش بيج ترافنتينو، وحوله إطار بني معتّق يرسم حدود المساحة ويعطيها شكل سجادة كبيرة.",
    tiles: [byCode("lk60", "059"), byCode("lk60", "011")],
    roles: ["الوسط", "الإطار"],
  },
  {
    id: "roof-checker",
    title: "شطرنج رمادي",
    place: "السطح أو الحوش",
    layout: "checker",
    text: "رمادي فاتح ورمادي داكن بالتبادل. شكل كلاسيكي هادئ يناسب المساحات الواسعة.",
    tiles: [byCode("lk60", "017"), byCode("lk60", "016")],
    roles: ["الفاتح", "الداكن"],
  },
  {
    id: "garden-path",
    title: "ممر في المدخل",
    place: "المدخل والحديقة",
    layout: "path",
    text: "خط فاتح في الوسط يدلّ على الطريق من الباب للبيت، وعلى الجانبين رمادي غرانيتي داكن.",
    tiles: [byCode("lk60", "008"), byCode("lk60", "028")],
    roles: ["الممر", "الجوانب"],
  },
  {
    id: "terrazzo-rug",
    title: "سجادة تيرازو",
    place: "الحوش أو مدخل البيت",
    layout: "accent",
    text: "أرضية بيج سادة، وفي النص مربع تيرازو يلفت النظر مثل سجادة ثابتة.",
    tiles: [byCode("lk60", "023"), byCode("lk60", "063")],
    roles: ["الأرضية", "الوسط"],
  },
  {
    id: "travertine-bath",
    title: "حمّام بترافنتينو",
    place: "الحمّام",
    layout: "room",
    text: "حيطان الحمّام ترافنتينو بيج مطفي بالطول، والأرضية بورسلين أبيض بعروق رمادية ناعمة.",
    tiles: [byCode("ly120", "284 مطفي"), byCode("ly120m", "289")],
    roles: ["الحيطان", "الأرضية"],
  },
  {
    id: "living-feature",
    title: "حائط ديكور في الصالة",
    place: "الصالة أو المجلس",
    layout: "room",
    text: "حائط واحد بترافنتينو رمادي يكون خلفية للتلفزيون أو الكنب، والأرضية بورسلين أبيض بعروق رمادية متشعّبة.",
    tiles: [byCode("ly120", "273"), byCode("ly120m", "230")],
    roles: ["الحائط", "الأرضية"],
  },
];
