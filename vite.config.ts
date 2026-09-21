import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { rscKit } from '@rsc-kit/core/vite'
import { nitro } from 'nitro/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    nitro({ preset: "cloudflare_module", serveStatic: 'inline' }),
    rscKit({
      sourceDir: 'src',
      outDir: 'build',
    }),
    react({ compiler: true }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
