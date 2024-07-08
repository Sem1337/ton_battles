import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    https: {
      key: '../certs/localhost+2-key.pem',
      cert: '../certs/localhost+2.pem',
    },
  },
  build: {
    outDir: './dist_frontend'
  },
  base: './'
})
