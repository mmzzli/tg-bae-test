import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import mkcert from 'vite-plugin-mkcert'
import { createFilter } from '@rollup/pluginutils'
import fs from "node:fs";
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
    define: {
      'process.env.BUILD_TIME': JSON.stringify(new Date().toLocaleString()), // 设置打包时间
    },
    css: {
      postcss: './postcss.config.js', // 引入 PostCSS 配置文件
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            telegram: ['@tma.js/sdk'],
            'react-query': ['@tanstack/react-query'],
            'react-virtual': ['@tanstack/react-virtual'],
            'framer-motion': ['framer-motion'],
            'lottie-react': ['lottie-react'],
            'lottie-web': ['lottie-web'],
            viem: ['viem'],
            antd: ['antd-mobile'],
            ton: ['ton', 'ton-core', 'ton-crypto', 'tonweb'],
            swiper: ['swiper'],
            axios: ['axios'],
            wukongimjssdk: ['wukongimjssdk'],
          },
        },
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
      cache: true,
      cssCodeSplit: true,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // https: false,
      https: mode === 'development' ? false : (()=>{
        return {
          cert: fs.readFileSync(path.join(__dirname,'./keys/mmzzli.site_bundle.crt')),
          key: fs.readFileSync(path.join(__dirname,'./keys/mmzzli.site.key'))
        }
      })(),
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
