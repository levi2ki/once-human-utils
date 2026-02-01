import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBasePath = env.VITE_BASE_PATH || '/'
  const trimmedBase = rawBasePath.replace(/^\/+/, '').replace(/\/+$/, '')
  const basePath = trimmedBase ? `/${trimmedBase}/` : '/'
  const iconPath = (name: string) => `${basePath}${name}`

  return {
    base: basePath,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        includeAssets: ['pwa-icon.svg', 'maskable-icon.svg'],
        manifest: {
          name: 'Once Human Utils',
          short_name: 'OH Utils',
          description:
            'Offline-first helper for Once Human memetics and twink tech management.',
          theme_color: '#1677ff',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: basePath,
          scope: basePath,
          categories: ['utilities', 'games', 'productivity'],
          icons: [
            {
              src: iconPath('pwa-icon.svg'),
              sizes: 'any',
              type: 'image/svg+xml',
            },
            {
              src: iconPath('maskable-icon.svg'),
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: `${basePath}index.html`,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'media-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      }),
    ],
  }
})
