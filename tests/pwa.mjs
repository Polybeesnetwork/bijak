// PWA / offline-readiness checks: required files, valid JSON, offline cache list, privacy.
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
let passes = 0, fails = 0;
const ok = (c, label, extra = "") => {
  if (c) passes++;
  else { fails++; console.log(`  FAIL: ${label} ${extra}`); }
};

console.log("\n[1] Required PWA files");
for (const f of ["index.html", "sw.js", "manifest.webmanifest", "icon.svg"]) {
  ok(fs.existsSync(path.join(ROOT, f)), `${f} exists`);
}
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const mfRaw = fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8");

console.log("\n[2] Manifest validity");
let mf = null;
try { mf = JSON.parse(mfRaw); ok(true, "manifest is valid JSON"); }
catch (e) { ok(false, "manifest is valid JSON", e.message); }
if (mf) {
  ok(!!mf.name && !!mf.short_name, "manifest has name + short_name");
  ok(!!mf.start_url && !!mf.display, "manifest has start_url + display");
  ok(mf.display === "standalone", "manifest display is standalone");
  ok(Array.isArray(mf.icons) && mf.icons.length >= 1, "manifest declares icons");
  ok(mf.icons.every((i) => fs.existsSync(path.join(ROOT, i.src))), "declared icon files exist");
}

console.log("\n[3] Offline capability");
ok(/self\.addEventListener\("install"/.test(sw), "SW has install handler");
ok(/self\.addEventListener\("activate"/.test(sw), "SW has activate handler");
ok(/self\.addEventListener\("fetch"/.test(sw), "SW has fetch handler");
ok(/caches\.open/.test(sw), "SW uses the Cache API");
ok(/navigate/.test(sw), "SW handles navigations (offline page loads)");
for (const a of ["./", "./index.html"]) ok(sw.includes(a), `SW precaches ${a}`);
ok(/serviceWorker/.test(html) && /register\("sw\.js"\)/.test(html), "app registers the service worker");
ok(/location\.protocol\.startsWith\("http"\)/.test(html), "SW registration guarded against file://");
ok(html.includes('rel="manifest" href="manifest.webmanifest"'), "manifest linked from HTML");

console.log("\n[4] Self-contained / privacy");
const externals = html.match(/(?:src|href)="https?:\/\/[^"]+"/g) || [];
ok(externals.length === 0, "no external scripts/styles/fonts (works fully offline)", externals.join(","));
ok(!/<script[^>]+src=/.test(html), "no external <script src>");
ok(!/https?:\/\/[^"'\s]*\.(?:js|css|woff2?|png|jpg)/.test(html), "no remote asset URLs");
ok(!/api[_-]?key|sk-[a-z0-9]{10}/i.test(html), "no embedded API keys");
ok(!/google-analytics|gtag\(|facebook\.net|doubleclick|hotjar|mixpanel/i.test(html), "no third-party trackers");
ok(!/fetch\(["']https?:/.test(html), "no outbound network calls at runtime");
ok(/localStorage/.test(html), "progress stored locally");
ok(!/XMLHttpRequest/.test(html), "no XHR to remote servers");

console.log("\n[5] Accessibility & safety essentials");
ok(/lang="ms"/.test(html), "document language declared");
ok(/prefers-reduced-motion/.test(html), "respects prefers-reduced-motion");
ok(/:focus-visible/.test(html), "visible keyboard focus styles");
ok(/aria-live/.test(html), "live regions announce feedback");
ok(/role="progressbar"/.test(html), "progress bar has ARIA semantics");
ok(/viewport/.test(html) && /width=device-width/.test(html), "mobile-first viewport meta");
ok(/theme-color/.test(html), "theme-color declared");
ok(!/<input[^>]+type="(?:tel|email|password)"/.test(html), "no fields requesting personal contact data");
ok(/no third-party|privacy/i.test(html) || /privacy/i.test(html), "privacy messaging present in app");

console.log("\n[6] Exact-arithmetic helpers present");
ok(/function frac\(/.test(html), "exact fraction helper");
ok(/const cents=/.test(html) && /rmstr=/.test(html), "integer-cents money helper");
ok(/mulberry32/.test(html), "seeded PRNG (reproducible questions)");

console.log(`\n===== PWA: ${passes} passed, ${fails} failed =====`);
process.exit(fails ? 1 : 0);
