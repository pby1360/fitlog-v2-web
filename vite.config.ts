import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.BASE_PATH || '/'
// https://vite.dev/config/
export default defineConfig({
  define: {
   __BASE_PATH__: JSON.stringify(base),
  },
  plugins: [react(),
    // PWA (서비스 워커·매니페스트)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'fitlog_logo_192.png', 'fitlog_logo_512.png'], // public 폴더에 있는 정적 파일들
      manifest: {
        name: 'fitlog', // 실제 앱 이름으로 변경
        short_name: 'fitlog',
        description: 'fitness log app',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/fitlog_logo_192.png', // public 폴더에 이 이미지들이 꼭 있어야 합니다!
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/fitlog_logo_512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base,
  build: {
    sourcemap: true,
    outDir: 'out',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    // 기본은 로컬에서만 접근 가능. LAN 기기로 테스트할 때만 `npm run dev -- --host` 로 일시적으로 연다
    host: 'localhost',
  }
})
