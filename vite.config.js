import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function _resolve(dir) {
  return path.resolve(__dirname, dir)
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isProd = mode === 'production'

  const server = {
    port: '3030',
    cors: {
      origin: '*',
    },
  }
  const define = {
    'process.env': {},
  }

  const plugins = [
    vue()
  ]

  let optimizeDeps = {}
  if (isDev) {
    optimizeDeps = {
      include: [
        'vue',
        'vue-router',
        '@iconify/vue',
      ]
    }
  }

  const build = {
    outDir: 'app',
  }

  return {
    server,
    build,
    define,
    plugins,
    optimizeDeps,
    resolve: {
      alias: {
        'vue': 'vue/dist/vue.esm-bundler.js',
        '@': _resolve('./src'),
        '~@': _resolve('./src'),
      }
    }
  }
})
