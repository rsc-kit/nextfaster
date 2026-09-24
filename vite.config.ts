import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { rscKit } from '@rsc-kit/core/vite'
import { nitro } from 'nitro/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ command }) => ({
  plugins: [
    // Cloudflare for the build only. Given the preset in dev too, Nitro
    // emulates Workers there - workerd with an empty local D1 - and the app
    // is written to run dev under Bun, on data/nextfaster.sqlite.
    nitro(command === 'build' ? { preset: 'cloudflare_module', serveStatic: 'inline' } : {}),
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
}))
