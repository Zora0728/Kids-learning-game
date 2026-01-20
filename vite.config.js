import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: './', // Critical for Android/Relative paths
  plugins: [
    legacy({
      targets: ['defaults', 'android >= 7', 'chrome >= 52'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    react(),
    VitePWA({
      selfDestroying: true, // FORCE UNREGISTER SERVICE WORKER
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Leveling Game for Kids',
        short_name: 'LevelUp',
        description: 'A fun game to learn levels!',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
