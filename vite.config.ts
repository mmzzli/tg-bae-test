import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import mkcert from 'vite-plugin-mkcert'
import { createFilter } from '@rollup/pluginutils'
import fs from 'fs'
const htmlPlugin = (mode: string) => {
  return {
    name: 'html-transform',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/') {
          req.url = `/${mode === 'production' ? 'index.prod.html' : 'index.dev.html'}`
        }
        next()
      })
    },
  }
}

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
  const htmlEntrypoint = mode === 'production' ? 'index.prod.html' : 'index.dev.html'

  return {
    plugins: [
      react(),
      {
        name: 'rename-output-html',
        closeBundle() {
          const distDir = path.resolve(__dirname, 'dist')
          if (fs.existsSync(path.join(distDir, htmlEntrypoint))) {
            fs.renameSync(path.join(distDir, htmlEntrypoint), path.join(distDir, 'index.html'))
          }
        },
      },
      htmlPlugin(mode),
      nodePolyfills(),
      mkcert(),
      cacheBusterPlugin(),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, htmlEntrypoint),
        },
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            telegram: ['@tma.js/sdk'],
          },
          app: 'index.html',
        },
      },
    },
    server: {
      port: 3000,
      host: '127.0.0.1',
      https: false,
      open: '/',
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
