// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), keystatic()],
  adapter: vercel(),
  routes: [
    { pattern: '/keystatic/[...params]', prerender: false },
    { pattern: '/api/keystatic/[...params]', prerender: false },
  ],
  rewrites: [
    { source: '/admin/:path*', destination: '/keystatic/:path*' }
  ]
});