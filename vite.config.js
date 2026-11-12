import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) {
            return 'react-vendor';
          }
          if (id.includes('/node_modules/@supabase/')) return 'supabase-vendor';
        }
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'images/animal-placeholder.svg'],
      manifest: {
        name: 'iEra — Jejak yang hilang',
        short_name: 'iEra',
        description: 'Kenali kisah spesies yang tercatat punah pada tahun kelahiranmu.',
        theme_color: '#f7f8f2',
        background_color: '#f7f8f2',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/iera-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/rest/v1/animals'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'iera-animal-catalog',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ]
});
