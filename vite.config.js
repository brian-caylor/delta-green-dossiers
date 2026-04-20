import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.svg', 'apple-touch-icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Delta Green — Agent Dossiers',
        short_name: 'Delta Green',
        description: 'Create, save, and manage Delta Green RPG agents. Works offline.',
        // Manila dossier palette. theme_color sets the OS chrome colour
        // (title bar on Android, status bar on iOS standalone, etc.) and
        // background_color is the splash colour while the PWA boots.
        theme_color: '#1a1712',
        background_color: '#e8e0cf',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // Exclude Firebase auth + proxy paths from the SPA navigation
        // fallback — Workbox must not serve index.html when Firebase's auth
        // handler, init.json, or the Google Fonts stylesheet is requested.
        navigateFallbackDenylist: [/^\/__\//],
        runtimeCaching: [
          {
            // Firebase Auth token endpoints — must always hit the network.
            urlPattern: /^https:\/\/(identitytoolkit|securetoken)\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Firestore reads/writes — must always hit the network.
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Firebase Auth handler pages (direct origin + our Netlify proxy).
            urlPattern: /\/__\/(auth|firebase)\//i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/[a-z0-9-]+\.firebaseapp\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Google Fonts stylesheets.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Google Fonts webfont files.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
