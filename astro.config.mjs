import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://raulmonroy.dev', // TODO: dominio real
  adapter: vercel(),
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
