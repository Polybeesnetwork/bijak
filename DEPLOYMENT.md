# DEPLOYMENT — BIJAK MATEMATIK

The app is **static**. There is no backend, no database, no environment variable, no
API key, no build step and no paid service. Deploying means copying four files to a
web server.

```
index.html
sw.js
manifest.webmanifest
icon.svg
```

---

## 1. Local run

```bash
npm install     # jsdom, test-only dev dependency
npm start       # http://localhost:4173
npm test        # 192 automated checks
```

`serve.mjs` is a dependency-free static server that:
- serves `index.html` for any unknown path (SPA fallback for `#/` routes),
- sets correct MIME types (`.webmanifest` → `application/manifest+json`),
- blocks path traversal outside the project root,
- binds `0.0.0.0` so it works in containers and previews.

You can also open `index.html` directly from disk — the app runs, but **offline
installation requires http(s)**, because service workers are not available on `file://`.

---

## 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```
Or connect the repo in the Vercel dashboard. Settings:
- **Framework preset:** Other
- **Build command:** *(none)*
- **Output directory:** `.` (project root)

No rewrites are strictly needed because routing is hash-based (`#/lesson/m1l1`), but a
catch-all to `index.html` is harmless:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

`vercel.json` is optional; the defaults above work.

---

## 3. Deploy to Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=.
```
Or drag the folder onto the Netlify dashboard.

Optional `_headers` file to guarantee correct service-worker MIME type and caching:

```
/sw.js
  Content-Type: text/javascript; charset=utf-8
  Cache-Control: no-cache

/index.html
  Cache-Control: no-cache
```

---

## 4. Deploy to GitHub Pages

1. Push the four files to a repository.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Because assets are referenced **relatively** (`./index.html`, `sw.js`,
   `manifest.webmanifest`, `icon.svg`), the app works from a subpath such as
   `https://user.github.io/bijak-matematik/` without changes.
4. Serve over HTTPS (Pages does this by default) so the service worker can register.

---

## 5. Any other web server

```nginx
server {
  listen 80;
  root /var/www/bijak-matematik;
  index index.html;

  location /sw.js {
    add_header Cache-Control "no-cache";
    types { } default_type text/javascript;
  }

  location / {
    try_files $uri $uri/ /index.html;   # SPA fallback
  }
}
```

Apache equivalent: put the files in the document root and add
`FallbackResource /index.html` to `.htaccess`.

---

## 6. Offline behaviour — how it actually works

`sw.js` implements:

- **install** — precaches `./`, `./index.html`, `./manifest.webmanifest`, `./icon.svg`,
  then calls `skipWaiting()`.
- **activate** — deletes old cache versions (`bijak-matematik-v1`), then `clients.claim()`.
- **fetch**
  - Navigations → **network first**, cache the response, fall back to the cached
    `index.html` when offline.
  - Other GETs → **cache first**, then network, caching same-origin 200 responses.

Registration is guarded:

```js
if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
  navigator.serviceWorker.register("sw.js").catch(() => {});
```

So `file://` and restricted previews degrade gracefully instead of erroring.

**When you change the app, bump the cache name** (`bijak-matematik-v1` → `v2`) so
returning users receive the new version on next load. This is the one manual step in
the whole deploy process.

### Verify offline yourself (2 minutes)

1. `npm start`, open `http://localhost:4173`, let it load fully.
2. DevTools → Application → Service Workers → confirm `sw.js` is **activated**.
3. Application → Cache Storage → confirm `bijak-matematik-v1` holds the four files.
4. Tick **Offline** in DevTools (or enable airplane mode), hard-reload.
5. The app should load and remain fully usable — lessons, simulations, quizzes.

> This manual check has **not** been performed automatically. The service worker is
> verified structurally by `tests/pwa.mjs`, but no automated browser test asserts a real
> offline reload (the sandbox cannot run Chromium). Run this check before you tell a
> school it works offline.

---

## 7. Data, privacy and persistence

- **Storage:** `localStorage["bijak_v1"]` only. No cookies, no IndexedDB, no server.
- **Export/import:** Settings → Export produces `bijak-matematik-progress.json`;
  Import restores it. This is the supported way to move progress between devices or
  to reset a shared tablet between students.
- **No accounts, no cloud sync.** Clearing browser data erases progress — export first.
- **No third-party requests at runtime.** Verified by test: zero `http(s)` external
  references, no analytics, no fonts, no CDNs.
- **Nothing personal is collected.** Nickname only (defaults to "Bijak"), stored
  locally, never transmitted.

### Shared-device tip for classrooms
Export a student's progress at the end of a session, then Reset before the next student.
Or run the app from a per-student browser profile.

---

## 8. Performance notes

- One HTML document, ~176 KB uncompressed, no external requests → effectively instant
  on 3G, fully offline after first load.
- No build, no bundle splitting, no hydration. Time-to-interactive is essentially
  parse time.
- Animations use CSS transforms/opacity and are disabled under
  `prefers-reduced-motion` and the in-app "Kurangkan Animasi" setting.

---

## 9. Pre-flight checklist before showing it to students

- [ ] `npm test` → 192 passed, 0 failed
- [ ] Served over HTTPS (needed for the service worker)
- [ ] DevTools → Application → Service Worker shows *activated*
- [ ] Offline reload tested manually (§6)
- [ ] Opened on one real phone; layout and tap targets checked
- [ ] BM/EN toggle checked in both directions
- [ ] One lesson completed end-to-end, including its simulation
- [ ] One quiz completed; wrong answer shows an explanation, not just a red cross
- [ ] Progress exported and re-imported successfully
- [ ] Screen-reader smoke test if the deployment is for an inclusive classroom
- [ ] Cache name bumped if this is an update over a previous deployment

---

## 10. Rollback

Static hosting → redeploy the previous `index.html` (and bump the cache name). There is
no database and no migration, so rollback is a file copy. Student progress in
`localStorage` survives, because the storage schema is versioned by key (`bijak_v1`)
rather than by build.
