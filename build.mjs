// يبني الموقع في مجلد dist: صفحة جاهزة مسبقاً + ملف app.js للحركة + الصور والملفات الثابتة.
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
cpSync("public", "dist", { recursive: true });

const shared = { bundle: true, jsx: "automatic", logLevel: "warning" };

await build({
  ...shared,
  entryPoints: ["src/client.tsx"],
  outfile: "dist/app.js",
  format: "esm",
  platform: "browser",
  minify: true,
  target: "es2020",
  define: { "process.env.NODE_ENV": '"production"' },
});

await build({
  ...shared,
  entryPoints: ["prerender.tsx"],
  outfile: ".build/prerender.mjs",
  format: "esm",
  platform: "node",
  packages: "external",
  define: { "process.env.NODE_ENV": '"production"' },
});
process.env.NODE_ENV = "production";
await import(pathToFileURL(".build/prerender.mjs").href);

// رقم نسخة لكل ملف حسب محتواه، حتى يحمّل الزوار التحديث الجديد فوراً بدل النسخة المخزنة في المتصفح.
const version = (file) => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10);
const v = { css: version("dist/styles.css"), js: version("dist/app.js") };
for (const page of ["dist/index.html", "dist/404.html"]) {
  const html = readFileSync(page, "utf8")
    .replace('href="styles.css"', `href="styles.css?v=${v.css}"`)
    .replace('src="app.js"', `src="app.js?v=${v.js}"`);
  writeFileSync(page, html);
}
console.log("built dist/");
