import { renderToString } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { App } from "./src/App";
import { company, socials, branches } from "./src/site-data";

// غيّر هذا الرابط إذا نشرت الموقع على نطاق خاص، مثل https://almeithaq.ly/
const SITE_URL = "https://almeithaq.github.io/";
const title = "شركة الميثاق | سيراميك وبورسلين ومواد صحية في تاجوراء";
const description =
  "سيراميك وبورسلين وكوطو ورخام ومواد صحية من الصناعة الليبية والهندية والتركية. جرّب الأرضيات على صالة حقيقية، احسب كمية البلاط، وأرسل طلبك لفرعينا في تاجوراء.";

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HomeGoodsStore",
  name: company.nameAr,
  alternateName: company.nameEn,
  url: SITE_URL,
  logo: SITE_URL + "icon-512.png",
  image: SITE_URL + "og.jpg",
  description,
  sameAs: socials.map((s) => s.url),
  department: branches.map((b) => ({
    "@type": "HomeGoodsStore",
    name: `${company.nameAr}، ${b.name}`,
    address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: "تاجوراء", addressCountry: "LY" },
    ...(b.phones?.length ? { telephone: b.phones.map((p) => p.number.replace(/^0/, "+218")) } : {}),
    ...(b.mapUrl ? { hasMap: b.mapUrl } : {}),
  })),
});

const body = renderToString(<App />);
const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#0B1F3A">
<link rel="canonical" href="${SITE_URL}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${company.nameAr}">
<meta property="og:locale" content="ar_LY">
<meta property="og:title" content="${company.nameAr}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:image" content="${SITE_URL}og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE_URL}og.jpg">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap">
<link rel="preload" as="image" href="assets/floor-cement.jpg">
<link rel="preload" as="image" href="assets/floor-ivory.jpg">
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">${jsonLd}</script>
<script type="module" src="app.js"></script>
</head>
<body>
<div id="root">${body}</div>
</body>
</html>
`;
writeFileSync("dist/index.html", html);
writeFileSync(
  "dist/404.html",
  `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>الصفحة غير موجودة | ${company.nameAr}</title><link rel="icon" href="${SITE_URL}favicon.svg" type="image/svg+xml"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B1F3A;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:2rem}a{display:inline-block;margin-top:1.4rem;background:#fff;color:#0B2140;padding:.7rem 1.4rem;border-radius:4px;font-weight:600;text-decoration:none}</style></head><body><div><h1>الصفحة غير موجودة</h1><p>ربما تغير الرابط أو حُذفت الصفحة.</p><a href="${SITE_URL}">العودة إلى الرئيسية</a></div></body></html>`,
);
writeFileSync(
  "dist/site.webmanifest",
  JSON.stringify(
    {
      name: company.nameAr,
      short_name: "الميثاق",
      lang: "ar",
      dir: "rtl",
      start_url: "./",
      display: "standalone",
      background_color: "#0B1F3A",
      theme_color: "#0B1F3A",
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    null,
    2,
  ),
);
writeFileSync("dist/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`);
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`,
);
writeFileSync("dist/.nojekyll", "");
console.log("prerendered", html.length);
