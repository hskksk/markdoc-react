import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function demoBase(): string {
  const repo = process.env.GITHUB_PAGES_REPOSITORY
  if (!repo) return '/'

  const root = `/${repo}`
  if (process.env.IS_PREVIEW === 'true' && process.env.PR_NUMBER) {
    return `${root}/pr-preview-${process.env.PR_NUMBER}/`
  }
  return `${root}/`
}

export default defineConfig({
  base: demoBase(),
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, fs: { allow: ['..'] } },
  optimizeDeps: {
    exclude: ['@hskksk/markdoc-react'],
  },
})
