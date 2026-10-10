import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function demoBase(): string {
  if (process.env.IS_PREVIEW === 'true' && process.env.PR_NUMBER) {
    return `/dev/markdoc-react/preview-${process.env.PR_NUMBER}/`
  }
  return '/'
}

export default defineConfig({
  base: demoBase(),
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, fs: { allow: ['..'] } },
  optimizeDeps: {
    exclude: ['@hskksk/markdoc-react'],
  },
})
