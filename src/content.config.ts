import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),                    // título largo (desktop)
      name: z.string().optional(),          // título corto (mobile)
      tagline: z.string().optional(),       // una línea bajo el título corto
      cover: image(),                       // póster / fallback
      embed: z.boolean().default(false),    // true = muestra el sitio en vivo dentro de un iframe
      viewport: z.number().default(1280),   // ancho virtual del iframe en escritorio
      url: z.string().url(),
      repo: z.string().url().optional(),
      problem: z.string(),
      stack: z.array(z.string()),
      capabilities: z.array(z.string()).max(4),
      openSource: z.boolean().default(false),
      license: z.string().optional(),
      status: z.enum(['activo', 'terminado', 'en desarrollo']).default('terminado'),
      year: z.number().optional(),
      order: z.number().default(0),
    }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: ({ image }) =>
    z.object({
      company: z.string(),
      role: z.string(),
      start: z.string(),
      end: z.string().optional(),           // vacío = actualidad
      summary: z.string().max(140),
      headline: z.tuple([z.string(), z.string(), z.string()]), // título dinámico de la izquierda (el del medio va resaltado)
      challenge: z.string(),                // problema que enfrenté
      learned: z.array(z.string()).max(4),  // tecnologías y aprendizajes
      tech: z.array(z.string()).default([]), // desfilan por el fondo mientras el trabajo está en foco
      stack: z.array(z.string()).max(5).default([]),
      logo: image().optional(),             // si no hay logo se muestra la inicial
      order: z.number().default(0),
    }),
});

export const collections = { projects, experience };
