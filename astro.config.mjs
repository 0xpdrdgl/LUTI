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
});