# TEST REPORT — BIJAK MATEMATIK

**Date:** 2026-11-24
**Command:** `npm test`
**Result:** **192 passed, 0 failed** across 3 suites.
**Node:** v20.20.2 · **Environment:** jsdom 25 (real DOM + real JS execution)

```
PASS  tests/math.mjs       30 passed, 0 failed
PASS  tests/smoke.mjs     122 passed, 0 failed
PASS  tests/pwa.mjs        40 passed, 0 failed

TOTAL: 192 passed, 0 failed across 3 suites
```

---

## 1. Suite: `tests/math.mjs` — mathematics accuracy audit (30 checks)

Loads the real `index.html`, injects `tests/expose.js` to reach the internal engines,
then attacks the mathematics.

| # | Test | Result |
|---|---|---|
| 1 | 9 modules present | PASS |
| 2 | All 19 lessons present | PASS |
| 3 | Every lesson has objectives + terms + explanation + mistakes + application + summary + skills + ref, in **both** BM and EN | PASS (19/19) |
| 4 | Every lesson has ≥3 worked examples, each with BM+EN steps | PASS |
| 5 | No duplicate worked-example questions within a lesson (catches copy-paste filler) | PASS |
| 6 | Volume: >2,000 questions generated across all skills × difficulties (44 × 4 × 12 = 2,112) | PASS |
| 7 | Every question has a non-empty answer | PASS |
| 8 | Every question has an explanation | PASS |
| 9 | MCQ distractors are unique | PASS |
| 10 | Correct answer always present among the options | PASS |
| 11 | Same seed reproduces the same question (6 skills spot-checked) | PASS |
| 12 | Questions vary across seeds (>20 unique in 60 draws) | PASS |
| 13 | `solveSteps` multiplication matches real arithmetic across 121 cases | PASS |
| 14 | `solveSteps` division matches real arithmetic across 121 cases | PASS (242 total, 0 bad) |
| 15 | **336 answers independently recomputed from question text — 0 mismatches** | PASS |
| 16 | Exact fraction: `frac(6,8)` reduces to `3/4` | PASS |
| 17 | Exact fraction: `1/3` stays `1/3` (no float drift) | PASS |
| 18 | `nextDifficulty` on unseen skill returns `easy` | PASS |
| 19 | `nextDifficulty` always returns a valid level for all 44 skills | PASS |
| 20 | `weakSkills` returns an array | PASS |
| 21–29 | 9 per-skill usable-question spot checks | PASS |

**Independent recomputation method:** for skills where the answer is derivable from
the question text (addition, multiplication, division, rounding, area, perimeter,
percentage, decimals, order of operations, patterns, money change, word problems,
expected frequency), the test re-derives the expected value from scratch and compares
against the generator's stated answer. This is what catches a generator that *looks*
fine but computes wrong.

**Coverage limitation, stated honestly:** 336 of ~2,112 generated questions (16%) were
recomputed, because the remaining skills (e.g. `likelihood`, `shapes2d`, `tables`)
answer categorical or table-lookup questions that cannot be re-derived by regex parsing
of the prompt. Those were verified structurally (answer present, options unique,
explanation present) and by manual review of samples — not by independent recomputation.

---

## 2. Suite: `tests/smoke.mjs` — runtime behaviour (122 checks)

Drives the real app: clicks buttons, fills inputs, toggles language, answers quizzes.

| Group | What was verified | Checks |
|---|---|---|
| Boot & welcome | Hero renders, welcome form completes | 2 |
| Routes | All 11 routes render non-trivial DOM (home, map, practice, arena, lab, review, ach, progress, parent, settings, quiz) | 10 |
| Modules | All 9 module pages render | 9 |
| Lessons | All 19 lessons render; each has all 6 required sections; each has ≥3 worked examples; **each mounts its simulation** | 57 |
| Simulations | All 30 simulations mount without throwing | 31 |
| Quiz flow | Practice → module button → question renders → answer affordance exists → answer → feedback appears → explanation included → next/finish button present | 6 |
| i18n | Language button present, text actually changes, English strings appear, toggles back | 4 |
| Persistence | `bijak_v1` written to localStorage, `xp` is numeric | 2 |
| Runtime errors | No uncaught exceptions across the entire session (sorted by route, lesson and sim) | 1 |

The 57 lesson checks mean **a placeholder lesson cannot pass**: missing objectives,
missing simulation, or fewer than three worked examples each fail the run.

---

## 3. Suite: `tests/pwa.mjs` — offline, privacy, accessibility (40 checks)

| Group | Checks |
|---|---|
| Required PWA files exist (index, sw, manifest, icon) | 4 |
| Manifest validity: parses as JSON, has name/short_name/start_url/display, `standalone`, declared icons exist on disk | 6 |
| Offline: SW has install/activate/fetch handlers, uses Cache API, handles navigations, precaches `./` and `./index.html`, is registered by the app, registration guarded against `file://`, manifest linked | 10 |
| Self-contained & privacy: **0 external URLs**, no external `<script src>`, no remote asset URLs, no embedded API keys, no trackers (analytics/pixels/hotjar/mixpanel), no outbound `fetch`, localStorage used, no XHR | 12 |
| Accessibility: `lang` declared, `prefers-reduced-motion`, `:focus-visible`, `aria-live`, `role="progressbar"`, viewport meta, theme-color, no personal-data inputs, privacy messaging present | 9 |
| Exact-arithmetic helpers: `frac`, `cents`/`rmstr`, `mulberry32` seeded PRNG | 3 |

---

## 4. Defects found and fixed during this verification cycle

These were all **real** defects that would have shipped broken. They were found *by
testing*, which is why the suite exists.

| # | Defect | Severity | Cause | Fix |
|---|---|---|---|---|
| 1 | **Browser freeze (infinite loop)** | Critical | `mcqOpts` looped `while(size<4)` sampling a distractor pool that could contain <3 distinct values (e.g. `b=10` gives `ans±10` twice), so the loop never terminated | Rewrote with a guaranteed-terminating top-up that synthesises format-preserving variants (numbers, fractions, `RM`) |
| 2 | Duplicate MCQ options in `fractioncompare` | High | Skill bypassed `mcqOpts` and built options by hand; equal fractions produced repeats | Routed through `mcqOpts` |
| 3 | Wrong answers showed an unlabelled explanation | Medium | Feedback template omitted the heading | Prefixed with "Penjelasan / Explanation" |
| 4 | Whole script failed to parse | Critical | Stray `}` after `solveSteps` (`node --check` caught it) | Removed |
| 5 | No service worker despite offline claims | High | Only a manifest existed | Wrote and registered a real `sw.js` |

Defect #1 is worth emphasising: it was **invisible to static inspection** and only
appeared after generating questions repeatedly with a live RNG. Without the runtime
suite the app would have hung mid-quiz for real students.

---

## 5. Verification limits — what was NOT tested

Stated plainly so nobody over-claims on this project's behalf.

1. **No real-browser test.** A headless Chromium binary exists in this sandbox but
   cannot launch — it is missing system libraries (`libnss3`, `libatk`, `libgbm`, …)
   and there is no root access to install them (`apt` is permission-denied). All
   behavioural testing therefore ran in **jsdom**, which executes the real JavaScript
   and DOM but does **not** do layout, painting, or CSS cascade/computed styles.
2. **Visual layout is unverified by automation.** Responsive/mobile appearance, colour
   contrast ratios, font fallback, and SVG geometry positions were checked by code
   review and structural assertions only. **Please open the app on a real phone before
   demoing it.**
3. **Canvas-based simulation internals are unverified.** jsdom returns `null` from
   `getContext("2d")`, so simulations that draw on canvas were verified only to the
   extent that they *mount without throwing*. Their drawn output is not asserted.
4. **Service-worker caching was not exercised in a real browser cache.** The SW is
   verified structurally (handlers present, precache list correct, valid JS, correct
   MIME type when served), and the server returns `text/javascript` for `sw.js` — but an
   actual "turn off the network and reload" test has not been run automatically.
5. **CSS media-query behaviour** (`prefers-reduced-motion`, breakpoints) is verified by
   presence in source, not by computed-style assertions.
6. **Accessibility was not tested with a real screen reader.** ARIA semantics, focus
   outlines and live regions are present and correct by inspection, but no NVDA/VoiceOver
   session was run.

**Recommendation:** before presenting this to a school or parents, do a 15-minute manual
pass on one Android phone: open the app, complete a lesson, answer a quiz, toggle BM/EN,
and reload with airplane mode on to confirm the offline cache.

---

## 6. How to reproduce

```bash
cd bijak-matematik
npm install
npm test            # all three suites
npm run test:math   # single suite
npm run test:smoke
npm run test:pwa
```

Exit code is non-zero if any check fails, so it drops straight into CI.

---

## 7. Summary

| Metric | Value |
|---|---|
| Automated checks | 192 |
| Passed | 192 (100%) |
| Failed | 0 |
| Real defects found and fixed | 5 (1 critical freeze, 1 critical syntax, 1 high, 2 medium) |
| Answers independently recomputed | 336 (0 mismatches) |
| Questions generated during audit | 2,112 |
| Lessons verified for full structure | 19/19 |
| Simulations verified to mount | 30/30 |
| External network dependencies | 0 |

**Honest bottom line:** the logic, mathematics, curriculum structure, question
generation, adaptive behaviour, persistence, i18n, privacy and offline wiring are
verified by automated tests. The *visual* result on a real device is verified only by
inspection and needs one manual check.
