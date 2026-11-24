# AGENTS.md — working on BIJAK MATEMATIK

Guidance for any AI agent or developer continuing this project.

---

## 1. What this project is

A static, single-file PWA teaching **KSSR Semakan 2017 Matematik Tahun 5** in Bahasa
Melayu with an English toggle, for Malaysian children aged 10–11.

- Everything ships in `index.html` (~1,480 lines: CSS + curriculum data + engines + views).
- No framework, no bundler, no backend, no accounts, no API keys, no paid services.
- Progress lives in `localStorage["bijak_v1"]`, exportable/importable as JSON.

The non-negotiable constraint: **it must keep working offline and on cheap hardware.**

---

## 2. Hard rules — do not break these

1. **Never introduce a network dependency.** No CDN fonts, no external scripts, no
   remote images, no telemetry. `tests/pwa.mjs` fails if any `http(s)://` external
   reference appears. Fonts must be system stacks. Icons must be inline SVG or emoji.
2. **Never introduce a build step** without a very good reason. The single-file design
   is what makes offline caching and school-hardware deployment reliable.
3. **Never use floating point for fractions or money.** Use `frac()`/`fadd()`/`fsub()`/
   `fmul()`/`fdiv()`/`fstr()` for fractions and `cents()`/`rmstr()` for currency.
4. **Never ship a placeholder lesson.** The test suite asserts all 19 lessons have
   objectives, terms, explanation, ≥3 worked examples with BM+EN steps, mistakes,
   application, summary, `skills`, `sim` and `ref`. A stub will fail `npm test`.
5. **Never claim an untested feature works.** See §7.
6. **Never collect personal data.** No name/address/phone/photo fields, no analytics,
   no public profiles, no chat. Nickname only, stored locally.
7. **Never add gambling-like or addictive mechanics.** No loot boxes, no loss streaks,
   no punishment for missing days, no public rankings, no timed-by-default pressure.
   Learning progress outranks points.
8. **Never make up DSKP standards.** Anchor lessons to real KSSR Semakan 2017 Tahun 5
   content. If unsure whether a topic is Year 5 compulsory, mark it *(extension)* and
   never gate progress on it.
9. **Keep BM primary.** Every user-facing curriculum string is `{bm, en}` and rendered
   through `L(bm, en)`. Do not add English-only content.

---

## 3. Code map

```
index.html
├── <style>            design system (CSS custom properties, cards, responsive, reduced-motion)
├── #app               mount point
├── #toast #confetti   feedback layers
└── <script>
    ├── utils          $, $$, esc, gcd, lcm, fmt, mulberry32 RNG, ri, pick, shuffle, toast, confetti, sfx
    ├── exact maths    frac fadd fsub fmul fdiv feq fval fstr · cents rmstr
    ├── i18n           STRINGS dictionary, t(key), L(bm,en)
    ├── state          defaultState, load/save (`bijak_v1`), addXP, level, recordAnswer, skillAcc, checkBadges
    ├── mascot         TIGER_SVG, mascot(speech) → speech-bubble HTML
    ├── MODULES        ← curriculum data (pure data, no UI logic)
    ├── genQuestion(moduleId, skill, diff, seed)  ← 44 skill generators
    ├── mcqOpts        ← safe distractor builder (must always terminate)
    ├── nextDifficulty / weakSkills / allSkills   ← adaptive engine
    ├── solveSteps     ← step-by-step long × and ÷
    ├── SIMS           ← registry of 30 simulation factories, keyed by sim id
    └── views + router ← hash router, 11 views, quiz runner, export/import
```

---

## 4. Common tasks

### Add a lesson
Push an object into the right module's `lessons` array in `MODULES`:

```js
{
  id: "m3l3",                       // unique, pattern m<module>l<index>
  title:   { bm: "...", en: "..." },
  ref:     "DSKP 6.x.x",
  objectives: { bm: ["..."], en: ["..."] },
  terms:   { bm: { "Istilah": "maksud" }, en: { ... } },   // both required
  explain: { bm: "<p>...</p>", en: "<p>...</p>" },         // short paragraphs only
  examples: [ { q: {bm,en}, steps: { bm: ["..."], en: ["..."] } } ],  // ≥3
  mistakes:    { bm, en },
  application: { bm, en },
  summary:     { bm, en },
  skills: ["money"],                 // must exist in genQuestion
  sim:    "cashier"                  // must exist in SIMS
}
```

Then run `npm test` — it will verify the structure immediately.

### Add a simulation
```js
SIMS.myTool = (el) => {
  simShell(el, t("tool_myTool"), ` ...controls + <div id="mt-out"></div> `);
  const draw = () => { /* compute truthfully, then render SVG/HTML */ };
  $("#mt-go").onclick = draw;
  draw();   // always render once on mount
};
```
Rules: mathematically correct calculations, a **Reset** and **Replay** control, keyboard
reachable controls, touch-friendly hit areas, and animation that *explains* (e.g. shows
carrying) rather than merely decorates. Add `tool_myTool` to `STRINGS` for both languages.

### Add a question skill
Add a `case` to the `genQuestion` switch returning
`M(questionText, correctAnswer, { options, hint, expl, ref })`.
- Use `L(bm, en)` for the question, hint and explanation.
- Use `mcqOpts(correct, [...distractors])` — never build options by hand; a pool with
  fewer than three distinct distractors is fine, `mcqOpts` tops it up safely.
- Use exact fraction/money helpers, never raw floats.
- Then add the skill to the relevant lesson's `skills` array so it gets practised.

### Fix a question bug
`genQuestion(moduleId, skill, diff, seed)` accepts a seed. Reproduce exactly:
```js
genQuestion("m1", "mult", "medium", 4242)
```
Same seed ⇒ same question. Use this to write a regression test.

---

## 5. Testing workflow

```bash
npm install     # jsdom, test-only
npm test        # 192 checks: math audit + runtime smoke + PWA/privacy
```

- After **any** edit to `index.html`, run `npm test`.
- After editing the `<script>` block, also syntax-check:
  `python3 -c "import re;h=open('index.html').read();open('/tmp/a.js','w').write(re.search(r'<script>(.*)</script>',h,re.S).group(1))" && node --check /tmp/a.js`
- Add a test for every bug you fix. Every defect in `TEST_REPORT.md` §4 has one now.

### Preferred debugging pattern
Never reason about a hang from reading code alone — instrument it:
```js
const { JSDOM } = require("jsdom");
// load index.html, inject tests/expose.js, call __BM__.genQuestion(...) in a loop,
// print progress with fs.writeSync(1, ...) so output survives a hang.
```
This is exactly how the `mcqOpts` infinite loop was found.

---

## 6. Style conventions

- **CSS**: use the existing custom properties (`--blue`, `--purple`, `--emerald`,
  `--orange`, `--yellow`); rounded cards; large tap targets (≥44px); mobile-first.
- **JS**: no `var`; small pure helpers; exact maths for fractions/money; every
  user-facing string through `t()` or `L()`; never interpolate unescaped user input
  into HTML (use `esc()`).
- **Content**: BM primary, short paragraphs (2–3 sentences), Malaysian contexts
  (RM, pasar malam, kantin, kedai alat tulis, bas sekolah), never assume prior knowledge.
- **Tone**: encouraging, never punitive. TIGER BIJAK explains mistakes in child-friendly
  language — a red cross alone is a bug.

---

## 7. Honesty contract

- Do not mark something complete in `README.md` / `MILESTONES.md` unless a test covers it
  or you have personally verified it.
- When something cannot be verified in the current environment (e.g. no real browser),
  say so explicitly in `TEST_REPORT.md` §5. That section exists for this reason.
- Internal mastery stars are **learning indicators**, never official assessment results.
  Keep that caveat visible in parent mode.

---

## 8. Known limitations / good next tasks

1. **Quiz UI lacks matching & drag-and-drop question types.** The engine schema supports
   `match`; the runner renders only MCQ and short text. Wiring a drag-and-drop renderer
   into `renderQuiz` is the highest-value unfinished feature.
2. **Real-browser E2E is missing.** `playwright` cannot run here (missing system libs, no
   root). If you have a machine that can, add a Playwright spec covering: load, lesson,
   sim interaction, full quiz, offline reload.
3. **KBAT pool is thin** for some skills — deepen multi-step higher-order generators.
4. **Diagnostic assessment** samples uniformly; a calibrated difficulty staircase would
   give a better initial profile.
5. **3D shapes** are SVG projections; a WebGL viewer would improve Module 6.
6. **No audio narration** for early readers.
