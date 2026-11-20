# Tavishi & Utkarsh — Wedding Invitation

A mobile-first, single-page digital wedding invitation built with **Vite + vanilla HTML/CSS/JS**.
The page is rendered at build time from one content file, so it ships as plain static HTML (fast on low-end phones, works without JavaScript).

The décor is shown only as **original SVG illustrations** inspired by its themes (gold birdcage dome, bougainvillea, emerald lattice, fairy lights, a Rajasthani palace skyline). No venue photos are used or deployed, so the real setting stays a surprise. Each event card's illustration is picked with `art: 'dome' | 'mandap' | 'lanterns'` in `src/content.js`.

## Edit the content

Everything (names, dates, timings, venues, map links, hashtag, RSVP contacts, family lists, countdown date) lives in **`src/content.js`**. Edit it and save. The dev server reloads automatically.

- Map links set to `MAP_LINK_PLACEHOLDER` hide their **View Location** button.
- A WhatsApp number that still contains `XXXX` hides the **RSVP on WhatsApp** button.
- **Music:** drop an MP3 at `public/audio/music.mp3`. The floating music button only appears when that file exists. It never autoplays.

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

### Regenerating images

The social preview (`public/og-image.jpg`), favicon and responsive couple-photo variants (`*-480/800.webp`) are generated with `sharp` and committed. Re-run this after changing the couple's names or replacing photos in `public/images/couple/`:

```bash
npm run generate:assets
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Vercel detects the settings automatically (zero config):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (default)
4. Click **Deploy**.

`vercel.json` only adds cache headers (hashed JS/CSS cached forever, images for a day).

### Link previews (WhatsApp, etc.)

The `og:image` tag must be an absolute URL. At build time it is taken from Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`) automatically. If you add a custom domain and the preview does not show, set `meta.siteUrl` in `src/content.js` (e.g. `https://tavishiwedsutkarsh.com`) and redeploy. WhatsApp caches previews, so test with a fresh link (e.g. add `?v=2`).

## Project structure

```
index.html              shell; content is injected at build time
vite.config.js          plugin that renders src/content.js into index.html
src/content.js          ← all text and details
src/render.js           markup templates (pure functions)
src/lib/arch.js         scalloped jharokha arch generator (SVG paths)
src/lib/ornaments.js    hand-drawn SVG ornaments (bougainvillea, lotus, icons)
src/lib/scenes.js       illustrated scenes (hero night garden, event vignettes, pergola, gazebo)
src/style.css           styles and animations
src/main.js             reveal-on-scroll, petals, music, lightbox, countdown
scripts/generate-assets.mjs   OG image, favicon and image variants (sharp)
public/                 static files (couple photos, og-image.jpg, favicon)
```
