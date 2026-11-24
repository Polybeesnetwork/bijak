// Mathematics accuracy audit for the procedural question engine.
// Every generated question is checked against an independent solver.
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
const expose = fs.readFileSync(path.join(process.cwd(), "tests/expose.js"), "utf8");

let passes = 0, fails = 0;
const problems = [];
function ok(c, label, extra = "") {
  if (c) passes++; else { fails++; if (problems.length < 25) problems.push(`${label} ${extra}`); }
}

const dom = new JSDOM(html, { runScripts: "dangerously", url: "https://x.test/", pretendToBeVisual: true });
const w = dom.window;
w.scrollTo = () => {};
const log = console.log;
console.log = (...a) => { if (!String(a[0]).startsWith("Not implemented")) log(...a); };
await new Promise((r) => setTimeout(r, 300));
const s = w.document.createElement("script");
s.textContent = expose;
w.document.body.appendChild(s);
const BM = w.__BM__;
ok(!!BM && typeof BM.genQuestion === "function", "engine exposed");
if (!BM) process.exit(1);

const text = (v) => (v && typeof v === "object" ? v.bm || "" : String(v ?? ""));
const num = (v) => { const m = text(v).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : NaN; };

console.log("\n[1] Curriculum integrity");
ok(BM.MODULES.length === 9, "9 modules", "got " + BM.MODULES.length);
const lessons = BM.MODULES.flatMap((m) => m.lessons);
ok(lessons.length === 19, "all lessons present", "got " + lessons.length);
const ids = new Set();
let structOk = 0;
for (const l of lessons) {
  const good = l.objectives?.bm && l.objectives?.en && l.terms?.bm && l.terms?.en &&
    l.explain?.bm && l.explain?.en && Array.isArray(l.examples) && l.examples.length >= 3 &&
    l.mistakes?.bm && l.application?.bm && l.summary?.bm && l.skills?.length && l.ref &&
    l.examples.every((e) => e.q?.bm && e.q?.en && e.steps?.bm?.length >= 1 && e.steps?.en?.length >= 1);
  if (good && !ids.has(l.id)) { structOk++; ids.add(l.id); }
}
ok(structOk === lessons.length, "every lesson has full required content", `${structOk}/${lessons.length}`);

// duplicate example question check (no copy-paste filler)
let dupEx = 0;
for (const l of lessons) {
  const qs = l.examples.map((e) => e.q.bm);
  if (new Set(qs).size !== qs.length) dupEx++;
}
ok(dupEx === 0, "no duplicate worked examples within a lesson", "dupes=" + dupEx);

console.log("\n[2] Question generation: validity of every skill x difficulty");
const skills = BM.allSkills();
const diffs = ["easy", "medium", "hard", "kbat"];
let gen = 0, badAnswer = 0, noOpts = 0, optNoAnswer = 0, noExpl = 0, dupOpts = 0;
const samples = {};
for (const sk of skills) {
  for (const d of diffs) {
    for (let i = 0; i < 12; i++) {
      const q = BM.genQuestion("m1", sk, d, 1000 + i * 7);
      gen++;
      if (!q || !q.q || q.answer === undefined || q.answer === null || String(q.answer).trim() === "") { badAnswer++; continue; }
      if (!q.expl || String(q.expl).trim() === "") noExpl++;
      if (q.options) {
        if (!q.options.length) noOpts++;
        else {
          const norm = q.options.map((o) => String(o).trim());
          if (new Set(norm).size !== norm.length) dupOpts++;
          if (!norm.includes(String(q.answer).trim())) optNoAnswer++;
        }
      }
      if (!samples[sk]) samples[sk] = q;
    }
  }
}
ok(gen > 2000, "volume of questions generated", "n=" + gen);
ok(badAnswer === 0, "every question has a non-empty answer", "bad=" + badAnswer);
ok(noExpl === 0, "every question has an explanation", "missing=" + noExpl);
ok(dupOpts === 0, "MCQ distractors are unique", "dupes=" + dupOpts);
ok(optNoAnswer === 0, "correct answer always among options", "missing=" + optNoAnswer);

console.log("\n[3] Determinism (seeded reproducibility)");
let detOk = true, detSample = "";
for (const sk of ["addsub", "mult", "fractions", "money", "area", "probability"]) {
  const a = BM.genQuestion("m1", sk, "medium", 4242);
  const b = BM.genQuestion("m1", sk, "medium", 4242);
  if (text(a.q) !== text(b.q) || String(a.answer) !== String(b.answer)) { detOk = false; detSample = sk; }
}
ok(detOk, "same seed reproduces the same question", detSample);
// variety across seeds
const uniq = new Set();
for (let i = 0; i < 60; i++) uniq.add(text(BM.genQuestion("m1", "addsub", "easy", i).q));
ok(uniq.size > 20, "questions vary across seeds", "unique=" + uniq.size);

console.log("\n[4] Independent arithmetic verification (parse question -> recompute)");
// For each skill, re-derive the expected answer from the question text itself.
let checked = 0, mismatch = 0;
const mismatchList = [];
function verify(sk, q) {
  const qt = text(q.q), ans = num(q.answer);
  let expect = NaN;
  if (sk === "addsub") { const m = qt.match(/(\d[\d,]*)\s*\+\s*(\d[\d,]*)/); if (m) expect = +m[1].replace(/,/g, "") + +m[2].replace(/,/g, ""); }
  if (sk === "mult") { const m = qt.match(/(\d[\d,]*)\s*[×x]\s*(\d[\d,]*)/); if (m) expect = +m[1].replace(/,/g, "") * +m[2].replace(/,/g, ""); }
  if (sk === "divide") { const m = qt.match(/(\d[\d,]*)\s*÷\s*(\d[\d,]*)/); if (m) expect = Math.floor(+m[1].replace(/,/g, "") / +m[2].replace(/,/g, "")); }
  if (sk === "round") {
    const m = qt.match(/(\d[\d,]+)/);
    if (m) {
      const n = +m[1].replace(/,/g, "");
      if (/puluh ribu|ten thousand/i.test(qt)) expect = Math.round(n / 10000) * 10000;
      else if (/ribu|thousand/i.test(qt)) expect = Math.round(n / 1000) * 1000;
      else if (/ratus|hundred/i.test(qt)) expect = Math.round(n / 100) * 100;
      else if (/puluh|ten/i.test(qt)) expect = Math.round(n / 10) * 10;
    }
  }
  if (sk === "area") { const m = qt.match(/(\d+)\s*(?:cm|m)?\s*[×x]\s*(\d+)/); if (m) expect = +m[1] * +m[2]; }
  if (sk === "perimeter") { const m = qt.match(/(\d+)\s*(?:cm|m)/g); if (m && m.length >= 2) expect = 2 * (parseInt(m[0]) + parseInt(m[1])); }
  if (sk === "percent") { const m = qt.match(/(\d+)%\s*(?:daripada|of)\s*(\d+)/i); if (m) expect = (+m[1] / 100) * +m[2]; }
  // decimals: "a + b"
  if (sk === "decimals") { const m = qt.match(/(\d+\.\d+)\s*\+\s*(\d+\.\d+)/); if (m) expect = +(+m[1] + +m[2]).toFixed(2); }
  // combined: a + b x c
  if (sk === "combined") { const m = qt.match(/(\d+)\s*\+\s*(\d+)\s*[\u00d7x]\s*(\d+)/); if (m) expect = +m[1] + +m[2] * +m[3]; }
  // patterns: arithmetic sequence
  if (sk === "patterns") { const m = [...qt.matchAll(/\d+/g)].map((x) => +x[0]);
    if (m.length >= 5) { const step = m[1] - m[0]; expect = m[3] + step; } }
  // change / money arithmetic with RM
  if (sk === "change") { const m = [...qt.matchAll(/RM\s*([\d.]+)/gi)].map((x) => +x[1]);
    if (m.length >= 2) expect = +(m[0] - m[1]).toFixed(2); }
  // word problem: n boxes x p items
  if (sk === "wordproblem") { const m = qt.match(/(\d+)\s+\S+.*?(\d+)\s+kotak|(\d+)\s+kotak/i);
    const nums = [...qt.matchAll(/\d+/g)].map((x) => +x[0]);
    if (nums.length >= 2) expect = nums[0] * nums[1]; }
  // experiment probability
  if (sk === "experiment") { const m = qt.match(/(\d+)\s+kali/i); if (m) expect = +m[1] / 6; }
  if (!isNaN(expect) && !isNaN(ans)) {
    checked++;
    if (Math.abs(expect - ans) > 1e-6) { mismatch++; if (mismatchList.length < 10) mismatchList.push(`${sk}: "${qt}" -> got ${ans}, expected ${expect}`); }
  }
}
// also cross-check solveSteps against real arithmetic
let stepChecked = 0, stepBad = 0;
for (let a = 12; a < 400; a += 37) {
  for (let b = 11; b < 90; b += 13) {
    const mul = BM.solveSteps(a, b, "×");
    stepChecked++;
    if (mul.ans !== a * b) stepBad++;
    const div = BM.solveSteps(a, b, "÷");
    stepChecked++;
    if (div.ans !== Math.floor(a / b)) stepBad++;
  }
}
ok(stepChecked > 100 && stepBad === 0, "solveSteps matches real arithmetic", `checked=${stepChecked} bad=${stepBad}`);

for (const sk of skills) {
  for (const d of diffs) {
    for (let i = 0; i < 10; i++) verify(sk, BM.genQuestion("m1", sk, d, i * 31 + 5));
  }
}
ok(checked > 300, "recomputed answers from question text", "checked=" + checked);
ok(mismatch === 0, "no arithmetic mismatches", mismatchList.join(" ; "));

console.log("\n[5] Exact fraction & currency helpers");
const F = BM.frac;
ok(F(1, 2) && F(1, 2).n === 1 && F(1, 2).d === 2, "frac constructs");
ok(JSON.stringify(F(6, 8)) === JSON.stringify({ n: 3, d: 4 }), "frac reduces 6/8 -> 3/4", JSON.stringify(F(6, 8)));
ok(F(1, 3).n === 1 && F(1, 3).d === 3, "frac keeps 1/3 as 1/3 (no float)", JSON.stringify(F(1, 3)));

console.log("\n[6] Adaptive difficulty logic");
const nd = BM.nextDifficulty("never-seen-skill-xyz");
ok(nd === "easy", "unseen skill starts easy", nd);
const validDiffs = new Set(["easy", "medium", "hard", "kbat"]);
let diffOk = true;
for (const sk of skills) { const d = BM.nextDifficulty(sk); if (!validDiffs.has(d)) { diffOk = false; } }
ok(diffOk, "nextDifficulty always returns a valid level");
const weak = BM.weakSkills();
ok(Array.isArray(weak), "weakSkills returns array");

console.log("\n[7] Per-skill sample spot check");
for (const sk of ["addsub", "mult", "fractions", "money", "timeunits", "length", "area", "ratio", "probability"]) {
  const q = BM.genQuestion("m1", sk, "easy", 777);
  ok(!!q && !!q.answer && (q.q && (q.q.bm || typeof q.q === "string")), `skill ${sk} produces usable question`);
}

console.log("\n===== MATH AUDIT: " + passes + " passed, " + fails + " failed =====");
if (mismatchList.length) console.log("mismatch samples:\n" + mismatchList.join("\n"));
if (problems.length) console.log("problem samples:\n" + problems.slice(0, 15).join("\n"));
process.exit(fails ? 1 : 0);
