import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { userScriptPlugin } from './vite-plugin-userscript'
import { injectMetadata } from './vite-plugin-inject-metadata'

export default defineConfig({
  plugins: [
    vue(),
    userScriptPlugin({
      meta: {
        name: 'Bilibili Evolved',
        description: '强大的哔哩哔哩增强脚本',
        version: '[gitHash]',
        author: 'Grant Howard, Coulomb-G',
        license: 'MIT',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'fuse.js$': 'fuse.js/dist/fuse.basic.esm.min.js',
    },
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(__dirname, 'src/ui')],
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/client/bilibili-evolved.ts'),
      name: 'BilibiliEvolved',
      fileName: () => 'bilibili-evolved.user.js',
      formats: ['iife'],
    },
    rolldownOptions: {
      plugins: [injectMetadata()],
    },
  },
})
