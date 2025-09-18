import { resolve } from 'node:path';
import { defineConfig, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

function _resolve(dir: string) {
  return resolve(__dirname, dir);
}

export const makeConfig = ({ mode }: UserConfig) => {
  const isDev = mode === 'development';
  // const isProd = mode === 'production'

  const server = {
    port: '3030',
    cors: { origin: '*' },
  };
  const define = { 'process.env': {} };

  const plugins = [vue(), vueDevTools()];

  let optimizeDeps = {};
  if (isDev) {
    optimizeDeps = {
      include: ['vue', 'vue-router', 'pinia', 'lodash'],
    };
  }

  const build = {
    // reference: https://rollupjs.org/configuration-options/
    rollupOptions: {
      input: {
        main: _resolve('./index.html'),
        'main-mobile': _resolve('./index-mobile.html'),
        'system-map': _resolve('./system-map.html'),
      },
      output: [
        {
          name: 'main',
          dir: 'app',
        },
        {
          name: 'main-mobile',
          dir: 'app',
        },
        {
          name: 'system-map',
          dir: 'app',
        },
      ],
    },
  };

  return {
    server,
    build,
    define,
    plugins,
    optimizeDeps,
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        '@': _resolve('./src'),
        '@sys-map': _resolve('./src-system-map'),
      },
    },
  };
}

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(makeConfig);
