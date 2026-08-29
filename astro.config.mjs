// @ts-check
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// includeFiles only copies literal files (a directory entry just creates an
// empty folder), so the /editar admin pages (which read content at request
// time, not build time) need every content yaml file listed explicitly to
// be available at runtime on Vercel.
const projetosDir = fileURLToPath(new URL('content/projetos', import.meta.url));
const projetoFiles = readdirSync(projetosDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(`${projetosDir}/${entry.name}/index.yaml`))
  .map((entry) => `content/projetos/${entry.name}/index.yaml`);

// https://astro.build/config
export default defineConfig({
  integrations: [react(), keystatic()],
  adapter: vercel({
    includeFiles: [
      ...projetoFiles,
      'content/site/index.yaml',
      'content/home/index.yaml',
      'content/pagina-projetos/index.yaml',
      'content/pagina-contato/index.yaml',
      'content/pagina-sobre/index.yaml',
    ],
  }),
  redirects: {
    '/admin': '/keystatic',
    '/admin/:path*': '/keystatic/:path*',
  },
  vite: {
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: {
          chrome: (95 << 16) | (0 << 8),
          edge: (95 << 16) | (0 << 8),
          firefox: (90 << 16) | (0 << 8),
          safari: (15 << 16) | (4 << 8),
        },
      },
    },
  },
});