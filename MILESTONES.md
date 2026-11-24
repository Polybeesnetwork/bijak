# MILESTONES — BIJAK MATEMATIK

Status of each delivery phase. Verified against `npm test` (192 checks, 0 failures) on
2026-11-24. Nothing is marked ✅ unless an automated test covers it or it was manually
verified.

---

## PHASE 1 — Foundation ✅ COMPLETE

| Item | Status | Evidence |
|---|---|---|
| Application architecture | ✅ | Single-file static PWA; `index.html` + `sw.js` + manifest + icon; hash router with 11 views |
| Design system | ✅ | CSS custom properties, rounded cards, blue/purple/emerald/orange/yellow palette, mobile-first, reduced-motion |
| Student dashboard | ✅ | Home view: welcome, module progress, XP/level, daily practice, progress bar |
| Curriculum map | ✅ | Adventure map with 9 nodes, per-module stars, lesson lists |
| Question generation engine | ✅ | 44 skills × 4 difficulties; seeded; 2,112 questions generated in audit |
| Learning progress system | ✅ | `localStorage["bijak_v1"]`, XP, levels, stars, per-skill accuracy, history, badges, JSON export/import |
| Automated test harness | ✅ | 3 suites, 192 checks, `npm test` |

**Exit criteria met:** app boots, routes work, state persists, questions generate.

---

## PHASE 2 — First working learning module ✅ COMPLETE

Module 1 (Nombor Bulat dan Operasi Asas) is fully playable.

| Item | Status | Evidence |
|---|---|---|
| 3 complete lessons (m1l1–m1l3) | ✅ | Each has objectives, terms, explanation, 3 worked examples with steps, mistakes, application, summary |
| Place value simulator | ✅ | `SIMS.placevalue` — per-digit place-value breakdown, up to 1,000,000 |
| Number line explorer | ✅ | `SIMS.numberline` |
| Rounding simulator | ✅ | `SIMS.rounding` |
| Animated long multiplication/division | ✅ | `SIMS.longops` + `solveSteps()` (242 arithmetic cases verified) |
| Practice + mastery assessment | ✅ | Guided (easy) and independent (adaptive) practice; module quiz awards 0–3 stars |
| Automated tests | ✅ | math audit + smoke suite cover Module 1 skills |

**Exit criteria met:** a child can learn Module 1 end-to-end and earn stars.

---

## PHASE 3 — Curriculum expansion ✅ COMPLETE

| Item | Status | Evidence |
|---|---|---|
| Modules 2–9 content | ✅ | 16 further lessons; **19 lessons total**, all structurally verified |
| Interactive simulations | ✅ | **30 simulations**, all mount without error (verified) |
| Original lesson content | ✅ | Written for this project; no copied question banks; Malaysian contexts |
| Adaptive learning integration | ✅ | `nextDifficulty` (deterministic, per-skill accuracy), `weakSkills`, review mode, diagnostic assessment |
| Exact arithmetic | ✅ | Fractions as numerator/denominator; money as integer cents (verified) |

**Exit criteria met:** all nine DSKP modules are playable, each lesson has its own simulation.

---

## PHASE 4 — Gamification and accessibility ✅ COMPLETE

| Item | Status | Evidence |
|---|---|---|
| TIGER BIJAK mascot | ✅ | Original inline SVG cub; gives hints, explains mistakes, celebrates, encourages |
| XP, levels, achievement badges | ✅ | **14 badges** with real unlock rules; XP economy; level curve |
| Topic mastery stars | ✅ | 0–3 stars per module from quiz percentage |
| Daily practice challenge | ✅ | 5 mixed questions, bonus XP; **no punishment for missing a day** |
| Personal achievement records | ✅ | Achievement gallery + progress report |
| Learning adventure map | ✅ | Map view with per-module stars |
| Optional sound effects | ✅ | WebAudio bleeps, toggle in settings, no external audio files |
| Celebratory animations | ✅ | Confetti + mascot reactions, suppressed under reduced-motion |
| Cosmetic rewards | ⚠️ **PARTIAL** | Badges act as cosmetic rewards; no separate unlockable avatars/themes |
| Unlockable cosmetic rewards (avatars/themes) | ❌ PENDING | Not implemented |
| Reduced-motion support | ✅ | `prefers-reduced-motion` + in-app setting (verified present) |
| Keyboard navigation | ✅ | Native buttons/links, `:focus-visible` outlines, Enter-to-submit, autofocus advance button |
| Screen-reader semantics | ⚠️ **PARTIAL** | ARIA radio groups, `aria-live` feedback, `role="progressbar"` present; **no real screen-reader session run** |
| Responsive mobile-first design | ⚠️ **PARTIAL** | Fluid grid + viewport meta + breakpoints verified in source; **no device/screenshot testing** |
| Anti-addictive safeguards | ✅ | No leaderboards, no loot boxes, no loss streaks, no daily punishment |

**Exit criteria met** for gamification. Accessibility is implemented and structurally
verified, but not tested with assistive technology or on a physical device.

---

## PHASE 5 — Verification and deployment ✅ COMPLETE (with stated limits)

| Item | Status | Evidence |
|---|---|---|
| Mathematical accuracy audit | ✅ | 336 answers independently recomputed, 0 mismatches; 2,112 questions validated |
| Automated testing | ✅ | 192 checks, 0 failures |
| Defect remediation | ✅ | 5 real defects found and fixed, including a **critical browser freeze** |
| Performance | ✅ | Single 176 KB document, no network requests, no build step |
| PWA manifest | ✅ | Valid JSON, standalone, icons exist (verified) |
| Service worker / offline | ⚠️ **PARTIAL** | Real `sw.js` written, registered, structurally verified, served with correct MIME type — **not tested by toggling the network in a real browser** |
| Mobile testing | ❌ PENDING | No physical device available in this environment |
| Deployment preparation | ✅ | `DEPLOYMENT.md`, dependency-free `serve.mjs`, static hosting ready |
| Documentation set | ✅ | README, AGENTS, CURRICULUM_MAP, MILESTONES, TEST_REPORT, DEPLOYMENT |

---

## Summary table

| Phase | Status |
|---|---|
| 1 Foundation | ✅ Complete |
| 2 First learning module | ✅ Complete |
| 3 Curriculum expansion | ✅ Complete |
| 4 Gamification & accessibility | ✅ Complete (avatars/themes pending; a11y untested on device) |
| 5 Verification & deployment | ✅ Complete (offline browser test + mobile device test pending) |

**Deliverable status: a working product**, not a prototype. All nine modules are
teachable and all 19 lessons contain real content with simulations, practice and
quizzes.

---

## Known gaps, ranked by value

| # | Gap | Why it matters | Effort |
|---|---|---|---|
| 1 | Matching / drag-and-drop **question types** not rendered in the quiz runner | The engine schema supports them; the brief explicitly asks for them | Medium |
| 2 | Real-browser E2E (Playwright) missing | Cannot prove visual rendering or offline reload automatically | Medium |
| 3 | Physical mobile device check | Responsive claims rest on source inspection only | Low (15 min) |
| 4 | KBAT question pool is thin for some skills | Higher-order thinking tier is not distinct enough everywhere | Medium |
| 5 | Diagnostic assessment is uniform, not a calibrated staircase | Initial learner profile is less precise | Medium |
| 6 | Unlockable cosmetic rewards (avatars/themes) | Brief lists them; badges partially cover the intent | Medium |
| 7 | 3D shapes are SVG projections, not WebGL | Module 6 "rotatable 3D" is a 2.5D rotation | High |
| 8 | No audio narration | Would help weaker readers | Medium |

See `AGENTS.md` §8 for how to approach these.
