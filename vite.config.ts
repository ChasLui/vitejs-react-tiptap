import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 设置 GitHub Pages 的 base 路径
  base: process.env.NODE_ENV === 'production' ? '/vitejs-react-tiptap/' : '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  }
})
