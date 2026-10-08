import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

const SITE = 'https://isaidev.site';

export default defineConfig({
  site: SITE,
  // Servidor Node propio (Docker). Todo es estático salvo la acción del formulario de contacto.
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  // Detrás de nginx la petición llega por http: se declara el dominio público para que la
  // verificación de origen del formulario (Astro Actions) acepte https://isaidev.site.
  security: {
    allowedDomains: [
      { hostname: 'isaidev.site', protocol: 'https' },
      { hostname: 'www.isaidev.site', protocol: 'https' },
      { hostname: 'localhost' },
    ],
  },
  // Variables que se leen en tiempo de ejecución (no se hornean en el build)
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM: envField.string({ context: 'server', access: 'secret', optional: true, default: 'Portafolio <onboarding@resend.dev>' }),
    },
  },
});
