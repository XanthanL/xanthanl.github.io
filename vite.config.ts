import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        // 拆分大依赖：three 核心 / R3F 生态 / 其余第三方，利用并行下载与长效缓存
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('node_modules/three/')) return 'three'
          if (
            id.includes('@react-three') ||
            id.includes('postprocessing') ||
            id.includes('three-stdlib') ||
            id.includes('n8ao') ||
            id.includes('maath') ||
            id.includes('gainmap')
          ) {
            return 'r3f'
          }
          if (id.includes('framer-motion')) return 'motion'
          return 'vendor'
        }
      }
    }
  }
})
