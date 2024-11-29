import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import mkcert from 'vite-plugin-mkcert'
import { createFilter } from '@rollup/pluginutils'
import * as fs from 'node:fs'

const cacheBusterPlugin = () => {
  const filter = createFilter(['**/*.tsx', '**/*.ts', '**/*.js', '**/*.jsx'])

  return {
    name: 'cache-buster-plugin',
    transform(code: string, id: string) {
      if (!filter(id)) return

      // Replace resource URLs with cache-busted URLs
      const result = code.replace(/(src|href)="(https:\/\/[^"]+)"/g, (match, p1, p2) => {
        const cacheBustedUrl = `${p2}?v=${Date.now()}`
        return `${p1}="${cacheBustedUrl}"`
      })

      return {
        code: result,
        map: null, // If you have source maps, add them here
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), nodePolyfills(), mkcert(), cacheBusterPlugin()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            telegram: ['@tma.js/sdk'],
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '127.0.0.1',
      https: false,
      // https: (() => {
      //   if (process.env.HTTPS_CERT_PEM && process.env.HTTPS_CERT_KEY) {
      //     return {
      //       cert: fs.readFileSync(process.env.HTTPS_CERT_PEM),
      //       key: fs.readFileSync(process.env.HTTPS_CERT_KEY),
      //     }
      //   }
      //   return true
      // })(),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    base: '/',
  }
})
