import { defineConfig } from 'vite';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Renders the invitation from src/content.js straight into index.html,
 * so the deployed page is plain static HTML (fast first paint, works
 * without JS). In dev, editing content.js / render.js / lib/* triggers a
 * full reload with freshly rendered markup.
 */
function invitationHtml() {
  const srcDir = path.resolve(__dirname, 'src');
  const load = async (file) =>
    import(`${pathToFileURL(path.join(srcDir, file)).href}?t=${Date.now()}`);

  // Absolute site URL for social previews. Vercel exposes the production
  // domain at build time; content.meta.siteUrl overrides it.
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  return {
    name: 'invitation-html',
    async transformIndexHtml(html, ctx) {
      // Cache-bust so dev picks up edits (ESM imports are cached by URL).
      const bust = !!ctx.server;
      const { content } = bust ? await load('content.js') : await import('./src/content.js');
      const { renderHead, renderBody } = bust ? await load('render.js') : await import('./src/render.js');
      const siteUrl = content.meta.siteUrl || (vercelUrl ? `https://${vercelUrl}` : '');
      return html
        .replace('<!--app-head-->', renderHead(content, { siteUrl }))
        .replace('<!--app-body-->', renderBody(content));
    },
    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (file.startsWith(srcDir) && file.endsWith('.js')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [invitationHtml()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
