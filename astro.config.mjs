// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), keystatic()],
  adapter: vercel(),
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