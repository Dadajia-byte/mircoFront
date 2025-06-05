import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 配置 Vue compiler 识别自定义元素
          isCustomElement: (tag) => tag.startsWith('micro-app')
        }
      }
    })
  ],
  resolve: {
    alias: {
      'micro-app': path.resolve(__dirname, '../micro-app/src/index.ts')
    }
  }
})
