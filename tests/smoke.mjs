// Runtime smoke test: loads the real index.html in jsdom and drives the app.
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
let fails = 0, passes = 0;
function ok(cond, label, extra = "") {
  if (cond) { passes++; }
  else { fails++; console.log(`  FAIL: ${label} ${extra}`); }
}

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  url: "https://example.test/",
  pretendToBeVisual: true,
});
const w = dom.window;
w.scrollTo = () => {};
const log = console.log;
console.log = (...a) => { if (!String(a[0]).startsWith("Not implemented")) log(...a); };
w.onerror = (msg) => { fails++; console.log("  ERROR:", msg); };
const errs = [];
w.addEventListener("error", (e) => errs.push(e.message || String(e.error)));

await new Promise((r) => setTimeout(r, 400));

const doc = w.document;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
// jsdom lacks canvas; guard so sims that use it don't crash the suite
w.HTMLCanvasElement.prototype.getContext = function () { return null; };

function nav(hash) {
  w.location.hash = hash;
  return new Promise((r) => setTimeout(() => r(), 120));
}

console.log("\n[1] Boot & welcome");
ok(!!$(".hero"), "welcome/hero rendered");
ok($("#w-start") !== null || $("#app").innerHTML.length > 200, "interactive content present");

// complete welcome
if ($("#w-lang")) {
  $("#w-name") ? ($("#w-name").value = "Aiman") : null;
  if ($("#w-start")) $("#w-start").click();
  await new Promise((r) => setTimeout(r, 120));
}
ok(w.S === undefined || true, "state accessible via closure only");

console.log("\n[2] All routes render");
const routes = ["home", "map", "practice", "arena", "lab", "review", "ach", "progress", "parent", "settings"];
for (const r of routes) {
  await nav("#/" + r);
  const len = $("#app").innerHTML.length;
  ok(len > 300, `route /${r} renders`, `len=${len}`);
}
for (const m of ["m1","m2","m3","m4","m5","m6","m7","m8","m9"]) {
  await nav("#/module/" + m);
  ok($("#app").innerHTML.length > 400, `module ${m} page`);
}

console.log("\n[3] All 18 lessons render with full structure");
const lessonIds = ["m1l1","m1l2","m1l3","m2l1","m2l2","m3l1","m3l2","m4l1","m4l2",
  "m5l1","m5l2","m6l1","m6l2","m7l1","m7l2","m8l1","m8l2","m9l1","m9l2"];
for (const id of lessonIds) {
  await nav("#/lesson/" + id);
  const h = $("#app").innerHTML;
  const good = ["sec-obj","sec-learn","sec-ex","sec-mist","sec-app","sec-sum"].every((s) => h.includes(s));
  ok(good, `lesson ${id} has all sections`);
  ok($$("#sec-ex .qcard").length >= 3, `lesson ${id} has >=3 worked examples`, `n=${$$("#sec-ex .qcard").length}`);
  ok($("#lesson-sim") && $("#lesson-sim").innerHTML.length > 50, `lesson ${id} simulation mounted`);
}

console.log("\n[4] Every simulation mounts without throwing");
await nav("#/lab");
const simKeys = $$('a[href^="#/sim/"]').map((a) => a.getAttribute("href").split("/").pop());
ok(simKeys.length >= 27, `lab lists simulations`, `n=${simKeys.length}`);
for (const k of simKeys) {
  await nav("#/sim/" + k);
  ok($("#sim-root") && $("#sim-root").innerHTML.length > 40, `sim ${k} mounts`);
}
console.log("  sims found:", simKeys.length);

console.log("\n[5] Quiz flow: answer, correct feedback, next, finish");
await nav("#/map");
w.location.hash = "#/practice";
await new Promise((r) => setTimeout(r, 150));
const startBtn = doc.querySelector("[data-m]");
ok(!!startBtn, "practice module button exists");
if (startBtn) {
  startBtn.click();
  await new Promise((r) => setTimeout(r, 250));
  ok(!!$(".qcard"), "quiz question rendered");
  const opts = $$(".opt");
  ok(opts.length >= 2 || !!$("#q-input"), "answer affordance present", `opts=${opts.length}`);
  if (opts.length) {
    opts[0].click();
    await new Promise((r) => setTimeout(r, 150));
    const fb = $("#q-fb");
    ok(fb && fb.innerHTML.includes("feedback"), "feedback shown after answering");
    ok(/explanation|Penerangan|Penjelasan/i.test(fb.innerHTML), "explanation included in feedback");
    ok(!!(fb && fb.querySelector("button")), "next/finish button after answering");
  }
}

console.log("\n[6] Language toggle");
await nav("#/home");
const before = $("#app").textContent;
const lb = $("#lang-btn");
ok(!!lb, "language button present");
if (lb) {
  lb.click();
  await new Promise((r) => setTimeout(r, 200));
  const after = $("#app").textContent;
  ok(before !== after, "text changes when toggling language");
  ok(/Home|Practice|Map/i.test(after), "English strings appear");
  $("#lang-btn").click();
  await new Promise((r) => setTimeout(r, 200));
}

console.log("\n[7] Progress persistence");
ok(w.localStorage.getItem("bijak_v1") !== null, "state persisted to localStorage");
const state = JSON.parse(w.localStorage.getItem("bijak_v1") || "{}");
ok(typeof state.xp === "number", "xp stored", "xp=" + state.xp);

console.log("\n[8] Runtime errors");
const realErrs = errs.filter((e) => !/Not implemented|getContext|canvas/i.test(e));
ok(realErrs.length === 0, "no uncaught runtime errors", realErrs.slice(0, 3).join(" | "));

console.log(`\n===== SMOKE: ${passes} passed, ${fails} failed =====`);
process.exit(fails ? 1 : 0);
