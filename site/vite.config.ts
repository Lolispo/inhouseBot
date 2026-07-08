import { defineConfig } from 'vite';

// Deployed to inhousebot.petterbuilds.com (served at the subdomain root).
export default defineConfig({
  base: '/',
  build: { target: 'es2020', outDir: 'dist' },
});
