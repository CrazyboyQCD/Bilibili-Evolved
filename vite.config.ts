import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { userScriptPlugin } from './vite-plugin-userscript'

export default defineConfig({
  plugins: [
    vue(),
    userScriptPlugin({
      meta: {
        name: 'Bilibili Evolved',
        description: '强大的哔哩哔哩增强脚本',
        version: '[gitHash]',
        author: 'Grant Howard, Coulomb-G',
        license: 'MIT'
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'fuse.js$': 'fuse.js/dist/fuse.basic.esm.min.js'
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(__dirname, 'src/ui')],
      }
    },
  },
  build: {
    rolldownOptions: {
      input: resolve(__dirname, 'src/client/bilibili-evolved.ts'),
      plugins: [],
      output: {
        format: 'iife',
        name: 'BilibiliEvolved',
        globals: {
          lodash: '_',
          vue: 'Vue'
        }
      }
    },
  },
})