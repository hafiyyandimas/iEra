import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  envPrefix: ['VITE_API_'],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) {
            return 'react-vendor';
          }
        }
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'images/animal-placeholder.svg', 'offline.html'],
      manifest: {
        name: 'iEra — Extinct Species Explorer',
        short_name: 'iEra',
        description: 'Jelajahi spesies punah dan catatan kepunahannya.',
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
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/api/animals' || /^\/api\/animals\/year\/\d+$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'iera-public-animal-catalog',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [200] }
            }
          }
        ]
      }
    })
  ]
});
