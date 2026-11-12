// يبني الموقع في مجلد dist: صفحة جاهزة مسبقاً + ملف app.js للحركة + الصور والملفات الثابتة.
import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";
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
console.log("built dist/");
