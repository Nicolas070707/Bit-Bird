import { defineConfig } from 'vite'
import envCompatible from 'vite-plugin-env-compatible'

// Vite-Konfiguration mit dem Plugin
export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.js',
      name: 'Counter',
      fileName: 'counter',
    }
  },
  plugins: [envCompatible()],
})
