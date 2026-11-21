# Tavishi & Utkarsh — Wedding Invitation

A mobile-first, single-page digital wedding invitation built with **Vite + vanilla HTML/CSS/JS**.
The page is rendered at build time from one content file, so it ships as plain static HTML (fast on low-end phones, works without JavaScript).

On first visit, guests see a felt-green gatefold sealed with a diamond lace "T U" monogram. Tapping it swings both panels open toward the guest (the seal rides away on the left panel), starts the music and reveals the invite (a **Skip** button opens it instantly). A reload in the same tab skips the opening.

## Edit the content

Everything (names, dates, timings, venues, map links, hashtag, RSVP contacts, family lists, countdown date, photo choices) lives in **`src/content.js`**. Edit it and save. The dev server reloads automatically.

- **`SHOW_VENUE_RENDERS`** (top of the file): `true` shows the real venue renders (cover photo, event-card windows, "The Setting" gallery, closing photo, desktop backdrop). Set it to `false` to keep the décor a surprise. The Setting section is then hidden, and emerald and gold panels replace the photos.
- Map links set to `MAP_LINK_PLACEHOLDER` hide their **View Location** button.
- While the WhatsApp number is a placeholder, the **RSVP on WhatsApp** button is shown disabled, and the browser console warns about any placeholder RSVP details.
- **Music:** drop an MP3 at `public/audio/music.mp3`. It starts when the doors are tapped (the tap is the gesture browsers require). If the file is missing, the audio is skipped silently and the music button stays hidden.

## Local development

Requires Node 18+.

```bash
npm install
```

```bash
npm run dev
```

Open the printed URL (usually http://localhost:5173). To test the production build:

```bash
npm run build
```

```bash
npm run preview
```

### Images

Full-resolution originals live in **`assets/images/`** (`couple/`, `venue/`). They are *not* deployed. `npm run generate:assets` builds everything the site serves:

- responsive WebP sizes in `public/images/` (couple 640/1080/1600w, venue 640/1080w, never upscaled)
- a portrait hero crop of the floral dome and the pre-blurred desktop `backdrop.webp`
- `src/generated/images.js`, the manifest `render.js` uses for `srcset`/`sizes` and intrinsic width/height
- the 1200×630 `og-image.jpg` share preview and the favicon

To add or replace a photo, put the original in `assets/images/…`, reference it in `content.js` by key (e.g. `'couple/couple-portrait'`), and run:

```bash
npm run generate:assets
```

### The family's artwork

Your own artwork lives in **`assets/art/`** and is used as-is: the debossed lotus on the opening gate, the Mughal arch with the peacock (the invitation, 9-sliced so the pillars stretch to fit the text), the paper garden (family section, cut into the paper, banana flower and garden strip), the lantern arch (countdown) and the lotus vine on velvet (closing). `npm run generate:assets` copies them into `public/images/art/`, re-encoding only files over 300 KB.

### Visual QA screenshots

With `npm run preview` running in another terminal, this screenshots every section (and the door intro) at 390×844 and 1440×900 into `screenshots/`:

```bash
npm run screenshots
```

Playwright is a dev dependency. If its browser isn't installed, point it at an existing Chromium with `CHROME_PATH=/path/to/chrome`.

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Vercel detects the settings automatically (zero config):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (default)
4. Click **Deploy**.

`vercel.json` only adds cache headers (hashed JS/CSS forever, fonts for 30 days, images for a day).

### Link previews (WhatsApp, etc.)

The `og:image` tag must be an absolute URL. At build time it is taken from Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`) automatically. If you add a custom domain and the preview does not show, set `meta.siteUrl` in `src/content.js` and redeploy. WhatsApp caches previews, so test with a fresh link (e.g. add `?v=2`).

## Project structure

```
index.html                 shell; content is injected at build time
vite.config.js             plugin that renders src/content.js into index.html
src/content.js             ← all text, details and photo choices
src/render.js              markup templates (pure functions)
src/generated/images.js    image manifest (generated)
src/lib/arch.js            scalloped jharokha arch generator (SVG paths)
src/lib/doors.js           velvet gatefold panels and monogram seal for the opening (SVG)
src/lib/ornaments.js       lotus, filigree, finial and icons (SVG sprite)
src/style.css              design system, sections and motion
src/main.js                doors, reveals, parallax, timeline, carousel, countdown, music, Lenis
assets/images/             full-resolution originals (not deployed)
public/                    served files: optimised images, self-hosted fonts, og-image, favicon
scripts/generate-assets.mjs   image pipeline (sharp)
scripts/screenshots.mjs       Playwright visual QA
```
