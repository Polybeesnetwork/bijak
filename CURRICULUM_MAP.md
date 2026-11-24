# CURRICULUM MAP — BIJAK MATEMATIK

Alignment to **KSSR Semakan 2017 Matematik Tahun 5** (DSKP).
Each lesson below lists its DSKP-standard anchor as stored in the `ref` field of the
curriculum data, and the skill IDs used by the procedural question engine.

> Standard references are the DSKP content-standard numbering used in the app. Where a
> sub-standard is not compulsory in the Year 5 DSKP, it is explicitly marked
> *(extension)* and is never required to progress.

Legend for question skills: each lesson's `skills` array feeds the practice and
mastery-quiz generators. All 44 skills have a verified generator.

---

## MODULE 1 — Nombor Bulat dan Operasi Asas

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m1l1 | Nombor hingga 1 000 000 dan Nilai Tempat | 4.1.1, 4.1.2 | `placevalue`, `compare`, `round` | `placevalue`, `numberline` |
| m1l2 | Operasi Asas dan Operasi Bergabung | 4.2.1–4.2.6 | `addsub`, `mult`, `divide`, `combined`, `wordproblem` | `longops`, `rounding` |
| m1l3 | Corak Nombor dan Penyelesaian Masalah | 4.3.1, 4.4.1 | `patterns`, `wordproblem`, `combined` | `numberline` |

**Coverage:** numbers to 1,000,000; place value and digit value; compare and order;
rounding and estimation; the four operations; combined operations with order of
operations; number patterns; problem-solving.
**Not compulsory at Year 5:** negative numbers, indices, number bases — excluded.

---

## MODULE 2 — Pecahan, Perpuluhan dan Peratus

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m2l1 | Pecahan Setara dan Pendaraban Pecahan | 5.1.1–5.2.2 | `fractions`, `fractioncompare` | `fraction`, `fractionbar` |
| m2l2 | Perpuluhan, Peratus dan Hubungannya | 5.3.1–5.5.2 | `decimals`, `percent`, `convert` | `percent`, `converter` |

**Coverage:** equivalent fractions; multiplication of fractions; decimal operations;
the fraction ↔ decimal ↔ percentage relationship; real-world problems.
**Arithmetic guarantee:** fractions use exact numerator/denominator pairs
(`frac`, `fadd`, `fsub`, `fmul`, `fdiv`, `fstr`) — never floating point — so 1/3 stays
1/3 and comparisons are exact. Verified by the test suite.
**Extension, marked as such:** compound interest is *not* Year 5 compulsory; the money
module covers simple interest only, and any compound-interest mention is labelled an
extension rather than required content.

---

## MODULE 3 — Wang

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m3l1 | Mata Wang Malaysia dan Operasi Wang | 6.1.1–6.2.3 | `money`, `change`, `budget` | `shop`, `cashier` |
| m3l2 | Simpanan, Perbelanjaan dan Literasi Kewangan | 6.3.1–6.4.2 | `savings`, `interest`, `budget` | `savings` |

**Coverage:** Malaysian currency (RM, sen); operations involving money; savings and
spending; simple financial literacy; budgeting; problem-solving.
**Arithmetic guarantee:** all money is handled as **integer cents** (`cents`, `rmstr`)
to eliminate floating-point rounding errors. Verified.
**Simple interest** (faedah mudah) is included as supported by DSKP; **compound
interest** is presented only as an awareness/extension note, never as a required skill.

---

## MODULE 4 — Masa dan Waktu

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m4l1 | Unit Masa dan Penukaran | 7.1.1–7.2.2 | `timeunits`, `timeconvert` | `clock`, `digital` |
| m4l2 | Tempoh, Jadual dan Operasi Masa | 7.3.1–7.4.2 | `duration`, `timetable`, `timeconvert` | `duration` |

**Coverage:** units of time; conversions (decade/century, days/hours/minutes/seconds);
duration; operations involving time; fractions and decimals of time; everyday schedules
(school timetable, travel).
**Applied contexts:** waktu persekolahan, jadual bas, perjalanan ke rumah nenek.

---

## MODULE 5 — Ukuran dan Sukatan

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m5l1 | Panjang dan Jisim | 8.1.1–8.3.2 | `length`, `mass`, `measureops` | `ruler`, `scale` |
| m5l2 | Isi Padu Cecair dan Penukaran Unit | 8.4.1–8.5.2 | `volume`, `measureword`, `units` | `cylinder`, `units` |

**Coverage:** length; mass; volume of liquid; unit conversions (mm↔cm↔m↔km,
g↔kg, ml↔l); operations involving measurements; real-world problems.
**Applied contexts:** membeli ikan di pasar, mengisi air dalam botol, menimbang beras.

---

## MODULE 6 — Ruang

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m6l1 | Bentuk Dua dan Tiga Dimensi serta Sudut | 9.1.1–9.3.2 | `shapes2d`, `shapes3d` | `geometry`, `protractor` |
| m6l2 | Perimeter, Luas dan Isi Padu | 9.4.1–9.5.2 | `perimeter`, `area`, `volume` | `area`, `cube` |

**Coverage:** 2D and 3D shapes; angles; perimeter; area; volume; properties of
geometric shapes.
**Note:** transformasi (translasi, pantulan, putaran) is handled by coordinate movement
in Module 7, matching the DSKP grouping, rather than in Module 6.

---

## MODULE 7 — Koordinat, Nisbah dan Kadaran

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m7l1 | Koordinat Cartes dan Kedudukan | 10.1.1–10.2.2 | `coordinates` | `coord` |
| m7l2 | Nisbah dan Kadaran | 11.1.1–11.2.2 | `ratio`, `proportion` | `ratio`, `recipe` |

**Coverage:** Cartesian coordinates (first quadrant); position and movement;
ratios; proportional relationships; real-world applications (recipes, map routes).

---

## MODULE 8 — Pengurusan Data

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m8l1 | Mengumpul dan Menyusun Data | 13.1.1–13.2.2 | `data`, `tables` | `table`, `chart` |
| m8l2 | Mentafsir Carta dan Menyelesaikan Masalah | 13.3.1–13.4.2 | `interpret`, `data`, `statistics` | `chart` |

**Coverage:** collecting and organising data; reading and interpreting charts
(bar chart, pictograph, tally); statistical concepts specified by DSKP — **mod, median,
min, maks, julat** (mode, median, min, max, range); solving problems using data.
**Not compulsory at Year 5:** mean/average as a formal statistic is introduced only as
an extension note; standard deviation and inferential statistics are excluded.

---

## MODULE 9 — Kebolehjadian

| Lesson | Title | DSKP ref | Skills | Simulation |
|---|---|---|---|---|
| m9l1 | Kebolehjadian: Pasti, Mungkin, Mustahil | 14.1.1–14.2.2 | `likelihood`, `probability` | `dice`, `coin` |
| m9l2 | Kebolehjadian Berangka dan Eksperimen | 14.3.1–14.4.2 | `experiment`, `spinner`, `probability` | `spinner` |

**Coverage:** understanding likelihood; possible and impossible events; comparing
likelihoods; simple probability experiments appropriate to Year 5.
**Scope discipline:** probability is expressed as simple fractions of equally likely
outcomes (e.g. 1/6, 2/4) — exactly as the DSKP frames it. Formal combinatorics,
conditional probability and probability trees are excluded.

---

## Cross-cutting design rules

1. **BM first, EN second.** Every piece of curriculum content is stored as
   `{bm, en}` and rendered through `L(bm, en)`. The toggle is not a translation layer
   bolted on afterwards — both languages are first-class data.
2. **Malaysian contexts only.** RM currency, kantin sekolah, pasar malam, kedai alat
   tulis, bas sekolah, makanan tempatan, ukuran harian.
3. **No advanced topics as compulsory content.** Extensions are labelled as extensions
   and never gate progress.
4. **No assumed prior knowledge.** Each lesson opens from first principles in short
   paragraphs, not walls of text.

---

## Topic → simulation → skill traceability

Every one of the 19 lessons declares:
- `sim` — the interactive simulation rendered inside the lesson reader;
- `skills` — the generators used for guided practice, independent practice and the
  mastery quiz;
- `ref` — the DSKP anchor.

The test suite asserts all three fields are present and non-empty for every lesson, so
a lesson cannot ship without a simulation or a question pool.
