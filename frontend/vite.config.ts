import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import type { Plugin } from 'vite';

/** Twitter/X require absolute og:image URLs. Set VITE_SITE_URL in production. */
function siteOriginPlugin(): Plugin {
  return {
    name: 'site-origin',
    transformIndexHtml(html) {
      const origin = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
      return html.replaceAll('__SITE_ORIGIN__', origin)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteOriginPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});

