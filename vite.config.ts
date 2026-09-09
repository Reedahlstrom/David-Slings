import { sites } from '@openai/sites-vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss(), sites()],
  build: { outDir: "dist/client" },
  server: { host: "127.0.0.1", proxy: { "/api": { target: "http://127.0.0.1:8787", headers: { "Origin": "http://127.0.0.1:8787", "oai-authenticated-user-id": "local-editor", "oai-authenticated-user-email": "editor@example.test" }, changeOrigin: true }, "/media": "http://127.0.0.1:8787" } },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
})
