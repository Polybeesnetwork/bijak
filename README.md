# BIJAK MATEMATIK

**Belajar, Bermain, Faham dan Kuasai!**
Interactive Mathematics Learning Lab — Matematik Tahun 5 (KSSR Semakan 2017), Malaysia.

A complete, working, offline-capable educational web app for Standard 5 students (ages 10–11).
Bahasa Melayu primary with a working English toggle.

---

## 1. Quick start

```bash
cd bijak-matematik
npm install        # installs jsdom (test-only dev dependency)
npm start          # serves on http://localhost:4173
npm test           # runs all 192 automated checks
```

No build step. No framework. No external services. No API keys. No account.

`index.html` is the entire application — open it directly in a browser and it works
(with the caveat that offline installation requires serving over `http(s)`, which
`npm start` provides).

---

## 2. What this actually is

A single-file static PWA:

| File | Purpose |
|---|---|
| `index.html` | The whole app — design system, curriculum, engines, 30 simulations, 11 views (~1,480 lines) |
| `sw.js` | Service worker — real offline support (cache-first assets, offline navigation fallback) |
| `manifest.webmanifest` | PWA manifest |
| `icon.svg` | Original TIGER BIJAK app icon |
| `serve.mjs` | Dependency-free static server with SPA fallback + path-traversal guard |
| `tests/` | 3 automated suites (mathematics audit, runtime smoke, PWA/privacy) |

### Documented deviation from the recommended stack

The brief recommended React + TypeScript + Vite + Tailwind + Three.js + Recharts.
This implementation uses **vanilla HTML/CSS/JS in one file**. Reasoning:

- **Offline reliability**: one document = one cache entry. No chunk-splitting, no
  stale-hash mismatches, no failed lazy chunks while offline.
- **Zero dependency risk**: nothing to break, nothing to pay for, no supply chain.
- **Educational constraint met**: curriculum content is still separated from UI
  (`MODULES` data is pure data; views and engines read it), simulations are a
  registry (`SIMS`), and the question engine is standalone and unit-tested.
- **Trade-off, stated honestly**: no TypeScript type-safety, no component
  hot-reload, and 3D geometry is SVG-based rather than WebGL. This was accepted to
  guarantee the app runs on low-spec school hardware and cheap Android tablets,
  which is the actual deployment target.

---

## 3. Feature status — completed vs partial vs pending

Verified by `npm test` (192 checks). Nothing below is marked complete without a test.

### ✅ Completed and tested

**Curriculum** — all 9 modules, **19 lessons**, fully written original content:
1. Nombor Bulat dan Operasi Asas (3 lessons)
2. Pecahan, Perpuluhan dan Peratus (2)
3. Wang (2)
4. Masa dan Waktu (2)
5. Ukuran dan Sukatan (2)
6. Ruang (2)
7. Koordinat, Nisbah dan Kadaran (2)
8. Pengurusan Data (2)
9. Kebolehjadian (2)

Every lesson contains: learning objectives, BM concept explanation, defined terms,
visual illustrations, **≥3 worked examples** with step-by-step solutions, an
attached interactive simulation, guided practice, independent practice, common
mistakes with explanations, real-world application, mastery quiz, and summary.
The test suite fails if any lesson is missing a section or has fewer than 3
worked examples — so placeholder lessons cannot pass.

**Question engine** — 44 skill generators × 4 difficulty levels (Asas / Sederhana /
Mencabar / KBAT). Verified: every generated question has a non-empty answer, an
explanation, unique multiple-choice distractors, and the correct answer always
appears among the options. **336 answers were independently recomputed from the
question text and matched exactly, with zero mismatches.**

**Simulations** — 30 interactive tools, all mounting cleanly:

| Module | Simulations |
|---|---|
| 1 | place value machine, number line, rounding, animated long ops |
| 2 | fraction pizza, fraction bar, percentage grid, converter |
| 3 | grocery shop, cashier, savings goal |
| 4 | analogue clock, digital clock, duration |
| 5 | ruler, weighing scale, measuring cylinder, unit converter |
| 6 | geometry canvas, protractor, area grid, cube stacking |
| 7 | coordinate grid, ratio mixer, recipe scaler |
| 8 | chart builder, data table |
| 9 | dice, coin, spinner |

**Learning modes** — Belajar, Latihan (adaptive), Arena Matematik (timed + untimed),
Makmal Matematik, Ulang Kaji, Ujian Kendiri, Mod Ibu Bapa.

**Adaptive engine** — deterministic, no AI API. Per-skill accuracy drives the next
difficulty; unseen skills start at Asas. Weak skills (<60% accuracy) are surfaced
to the student and to parent mode. Verified deterministic.

**Gamification** — XP, levels, **14 achievement badges**, 0–3 mastery stars per
module, daily mixed practice, streak counter (never punished for missing a day),
optional WebAudio sound effects, confetti, and the original **TIGER BIJAK** mascot
(inline SVG) giving hints, explaining mistakes and celebrating. No leaderboards,
no public profiles, no loot boxes, no loss mechanics.

**Progress** — localStorage (`bijak_v1`), JSON export/import, verified persistence.

**Accessibility** — reduced-motion preference + in-app setting, visible
`:focus-visible` outlines, ARIA radio-group semantics on quiz options, `aria-live`
feedback regions, `role="progressbar"`, mobile-first responsive layout.

**Privacy** — verified by test: zero external requests, no trackers, no analytics,
no API keys, no personal-data fields (no phone/email/password inputs), local-only
storage, nickname only (defaults to "Bijak").

**PWA** — valid manifest, service worker with install/activate/fetch handlers,
cache-first assets and offline navigation fallback, registered only over http(s).

### ⚠️ Partially implemented

- **Partial credit / multi-blank questions**: the engine has a `match` question type
  in its schema, but the quiz UI renders only multiple-choice and short-text input.
  Matching and drag-and-drop question *rendering* is not wired up — the drag-and-drop
  interactions live inside simulations, not inside the quiz runner.
- **3D shapes (Module 6)**: `cube` and `cylinder` sims are SVG-based and rotate/stack
  correctly, but there is no true WebGL/Three.js viewer.
- **Charts (Module 8)**: SVG bar charts are interactive and read correct values;
  Recharts-style tooltips/zoom are not present.
- **KBAT difficulty**: generators accept `kbat` and produce multi-step word problems,
  but the KBAT pool is thinner than Asas/Sederhana (some skills fall back to `hard`
  content rather than a distinct KBAT tier).
- **Diagnostic assessment**: runs and produces a result screen with topic
  recommendations, but its 8 items are sampled uniformly rather than being a
  calibrated staircase.

### ❌ Not implemented (pending)

- **TypeScript types / compiled build** — deliberate; see §2.
- **Playwright end-to-end tests** — see §6 *Verification limits*. The test stack is
  jsdom-based because the sandbox cannot run a real Chromium.
- **Offline test in real browser** — the service worker is statically verified and
  served with correct MIME types, but automated offline-navigation testing has not
  been run against a real browser cache.
- **Cloud sync / multi-device accounts** — intentionally excluded (no accounts;
  export/import JSON is the supported transfer path).
- **Lesson audio narration / read-aloud** — not present.

---

## 4. Truthfulness notes (read before presenting to parents)

- Internal mastery stars and accuracy percentages are **learning indicators only**.
  They are **not** official school assessment results, and the app says so in parent mode.
- The app collects **no** name, address, phone number or photograph. The "nickname"
  is a display string stored only in the browser; it is not transmitted anywhere.
- All names, prices and scenarios in lessons are fictional and Malaysia-flavoured
  (RM currency, pasar malam, kantin sekolah, kedai alat tulis).

---

## 5. Architecture

```
index.html
├── <style>            design system: colours, cards, responsive, reduced-motion
├── <body>             #app, #toast, #confetti
└── <script>
    ├── utils          esc, gcd, lcm, fmt, seeded RNG (mulberry32), toasts, beeps
    ├── exact maths    frac/fadd/fsub/fmul/fdiv/feq/fval/fstr, cents/rmstr
    ├── i18n           BM + EN dictionary, L(bm,en) helper, t(key)
    ├── state          localStorage `bijak_v1`, XP/level/stars/history/badges
    ├── mascot         TIGER BIJAK inline SVG + speech bubble
    ├── MODULES        9 modules × 19 lessons — pure data, no UI
    ├── genQuestion    44 skill generators × 4 difficulties, seeded
    ├── adapt          nextDifficulty, weakSkills, allSkills
    ├── solveSteps     step-by-step long multiplication / division
    ├── SIMS           30 simulation factories (registry keyed by sim id)
    └── views+router   hash router → 11 views, quiz runner, export/import
```

**Extending it**: add a lesson by pushing an object into `MODULES` (the tests will
immediately verify it has all required sections). Add a simulation by assigning
`SIMS.myKey = (el) => {...}` and referencing `sim:"myKey"` from a lesson.

---

## 6. Testing

```bash
npm test
```

```
PASS  tests/math.mjs       30 passed, 0 failed    ← mathematics accuracy audit
PASS  tests/smoke.mjs     122 passed, 0 failed    ← runtime, routes, lessons, sims, quiz, i18n
PASS  tests/pwa.mjs        40 passed, 0 failed    ← offline, manifest, privacy, a11y
TOTAL: 192 passed, 0 failed
```

### Verification limits — stated plainly

- Tests execute the **real** `index.html` in **jsdom**, which runs the actual
  JavaScript, DOM and event handlers. This is genuine behavioural testing, not a
  static grep.
- A **real browser was not available** in this environment: Chromium is present but
  missing system libraries (`libnss3`, `libatk`, …) and the sandbox has no root to
  install them. Therefore **visual rendering, CSS layout, and real service-worker
  caching were not exercised by an automated browser.** They are verified
  structurally (correct markup, valid manifest, correct MIME types, SW logic) and
  by manual code review only.
- **Mobile responsiveness** is verified by responsive CSS (viewport meta, fluid grid,
  mobile-first breakpoints) and not by screenshot diffing.
- Treat "renders correctly on a real phone" as *needs a manual check on your device*
  before you present this as finished to a school.

### Bugs found and fixed during verification

1. **Infinite loop in `mcqOpts`** — the distractor builder looped `while(size<4)`
   picking from a pool that could contain fewer than 3 distinct values (e.g. when
   `b = 10`, both distractors became `ans ± 10`). This **froze the browser** on
   those questions. Fixed with a guaranteed-terminating top-up that generates
   format-preserving variants (numbers, fractions, `RM` amounts).
2. **Duplicate MCQ options** in `fractioncompare` — it bypassed the safe builder, so
   equal fractions produced repeated options. Routed through `mcqOpts`.
3. **Unlabelled error explanation** — wrong answers appended the explanation with no
   heading. Now prefixed with "Penjelasan / Explanation".
4. **`solveSteps` stray brace** — a syntax error that broke the whole script.
5. **Missing service worker** — the app claimed offline support with only a manifest.
   A real `sw.js` was written and registered.

---

## 7. Deployment

See **DEPLOYMENT.md**. Short version: it's static — deploy the folder to Vercel,
Netlify, GitHub Pages, or any web server. No environment variables, no backend.

---

## 8. Licence & credits

Original content and code written for this project. No copyrighted characters,
brands, illustrations or question banks were copied from Khan Academy, Duolingo,
Math Playground or any other platform. TIGER BIJAK is an original mascot drawn as
inline SVG.
